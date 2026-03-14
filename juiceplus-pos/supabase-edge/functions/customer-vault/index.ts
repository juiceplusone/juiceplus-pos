/**
 * JuicePlus — customer-vault Edge Function
 * AES-256-GCM field-level encryption for customer PII
 *
 * Actions:
 *   upsert  — create or update a customer (encrypts PII fields)
 *   lookup  — find by phone hash, returns decrypted data
 *   list    — return all customers decrypted
 *   delete  — delete a customer by id
 *
 * Env vars required (set in Supabase dashboard → Edge Functions → Secrets):
 *   ENCRYPTION_KEY   — 64-char hex string (256-bit key)
 *   SUPABASE_URL     — auto-provided by Supabase
 *   SUPABASE_SERVICE_ROLE_KEY — auto-provided by Supabase
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Crypto helpers ──────────────────────────────────────────

const hexToBytes = (hex: string): Uint8Array =>
  new Uint8Array(hex.match(/.{1,2}/g)!.map(b => parseInt(b, 16)));

const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");

const getKey = async (): Promise<CryptoKey> => {
  const keyHex = Deno.env.get("ENCRYPTION_KEY");
  if (!keyHex || keyHex.length !== 64) {
    throw new Error("ENCRYPTION_KEY must be a 64-char hex string (256-bit)");
  }
  return await crypto.subtle.importKey(
    "raw", hexToBytes(keyHex), { name: "AES-GCM" }, false, ["encrypt", "decrypt"]
  );
};

/** AES-256-GCM encrypt — returns "iv:ciphertext" hex string */
const encrypt = async (key: CryptoKey, plaintext: string): Promise<string> => {
  if (!plaintext) return "";
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
  const enc = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv }, key, enc.encode(plaintext)
  );
  return `${bytesToHex(iv)}:${bytesToHex(new Uint8Array(ciphertext))}`;
};

/** AES-256-GCM decrypt — expects "iv:ciphertext" hex string */
const decrypt = async (key: CryptoKey, encoded: string): Promise<string> => {
  if (!encoded) return "";
  const [ivHex, ctHex] = encoded.split(":");
  if (!ivHex || !ctHex) return "";
  try {
    const dec = new TextDecoder();
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: hexToBytes(ivHex) }, key, hexToBytes(ctHex)
    );
    return dec.decode(plaintext);
  } catch {
    return "[decryption error]";
  }
};

/** SHA-256 hash of phone digits — used as lookup index */
const hashPhone = async (phone: string): Promise<string> => {
  const digits = phone.replace(/\D/g, "");
  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-256", enc.encode(digits));
  return bytesToHex(new Uint8Array(hash));
};

// ── Main handler ────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const key = await getKey();
    const body = await req.json();
    const { action } = body;

    // ── UPSERT (create or update) ──
    if (action === "upsert") {
      const { id, phone, name, email, allergies, favorites } = body;

      const phoneHash = await hashPhone(phone || "");
      const encPhone    = await encrypt(key, (phone || "").replace(/\D/g, ""));
      const encName     = await encrypt(key, name     || "");
      const encEmail    = await encrypt(key, email    || "");
      const encAllergy  = await encrypt(key, allergies|| "");

      let result;
      if (id) {
        // Update existing
        const { data, error } = await supabase
          .from("customers")
          .update({
            phone_enc:    encPhone,
            name_enc:     encName,
            email_enc:    encEmail,
            allergies_enc:encAllergy,
            favorites,
            updated_at:   new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        result = data;
      } else {
        // Create new
        const { data, error } = await supabase
          .from("customers")
          .insert([{
            phone_hash:   phoneHash,
            phone_enc:    encPhone,
            name_enc:     encName,
            email_enc:    encEmail,
            allergies_enc:encAllergy,
            favorites:    favorites || [],
            visit_count:  0,
            total_spend:  0,
          }])
          .select()
          .single();
        if (error) throw error;
        result = data;
      }

      // Return decrypted record to app
      const out = await decryptRow(key, result);
      return new Response(JSON.stringify({ customer: out }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // ── LOOKUP by phone ──
    if (action === "lookup") {
      const { phone } = body;
      const phoneHash = await hashPhone(phone || "");

      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("phone_hash", phoneHash)
        .single();

      if (error || !data) {
        return new Response(JSON.stringify({ customer: null }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const out = await decryptRow(key, data);
      return new Response(JSON.stringify({ customer: out }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // ── LIST all customers ──
    if (action === "list") {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("visit_count", { ascending: false });

      if (error) throw error;

      const decrypted = await Promise.all((data || []).map(row => decryptRow(key, row)));
      return new Response(JSON.stringify({ customers: decrypted }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // ── UPDATE STATS (visit count + spend + favorites) ──
    if (action === "updateStats") {
      const { id, orderTotal, orderItems } = body;

      const { data: cur } = await supabase
        .from("customers")
        .select("visit_count, total_spend, favorites")
        .eq("id", id)
        .single();

      if (!cur) throw new Error("Customer not found");

      // Recalculate favorites
      const favMap: Record<string, number> = {};
      (cur.favorites || []).forEach((f: any) => favMap[f.name] = (favMap[f.name] || 0) + f.count);
      (orderItems || []).forEach((i: any) => {
        const n = i.item?.name || "Unknown";
        favMap[n] = (favMap[n] || 0) + (i.qty || 1);
      });
      const newFavs = Object.entries(favMap)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      await supabase.from("customers").update({
        visit_count: (cur.visit_count || 0) + 1,
        total_spend: Number(((cur.total_spend || 0) + orderTotal).toFixed(2)),
        favorites:   newFavs,
        last_visit:  new Date().toISOString(),
      }).eq("id", id);

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // ── DELETE ──
    if (action === "delete") {
      const { id } = body;
      await supabase.from("customers").delete().eq("id", id);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});

// ── Decrypt a raw DB row into app-friendly object ──────────
async function decryptRow(key: CryptoKey, row: any) {
  return {
    id:          row.id,
    phone:       await decrypt(key, row.phone_enc   || ""),
    name:        await decrypt(key, row.name_enc    || ""),
    email:       await decrypt(key, row.email_enc   || ""),
    allergies:   await decrypt(key, row.allergies_enc || ""),
    favorites:   row.favorites   || [],
    visit_count: row.visit_count || 0,
    total_spend: row.total_spend || 0,
    last_visit:  row.last_visit  || null,
    created_at:  row.created_at  || null,
  };
}
