import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://qykjkxqbwievidodsnmz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5a2preHFid2lldmlkb2Rzbm16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMjkyNTgsImV4cCI6MjA4ODkwNTI1OH0.ubB5FxnJbiXBcIFnlhoKRntvHvjuF-cKnRpumjYN8k8"
);

/* ─── THEME ─────────────────────────────────────────────── */
const C = {
  bg:       "#0A0F1E",
  surface:  "#111827",
  card:     "#1A2235",
  border:   "#1E2D45",
  text:     "#F1F5F9",
  muted:    "#64748B",
  dim:      "#334155",
  accent:   "#FF6B35",
  green:    "#22C55E",
  yellow:   "#E8A020",
};

const CAT_COLORS = {
  smoothies: "#FF6B35",
  protein:   "#E8A020",
  leanmass:  "#EF4444",
  power:     "#8B5CF6",
  acai:      "#10B981",
  pitaya:    "#EC4899",
};

/* ─── MENU DATA ─────────────────────────────────────────── */
const MENU = {
  smoothies: {
    label:"Smoothies", emoji:"🥤", size:"24 oz", basePrice:5.99,
    items:[
      {id:"s1",name:"Energizer",       ing:"Mango, Banana, Strawberry, Guava Juice"},
      {id:"s2",name:"Citrus Boost",    ing:"Blueberry, Mango, Peach, Orange Juice"},
      {id:"s3",name:"Second Wind",     ing:"Strawberry, Banana, Raspberry, SB Juice"},
      {id:"s4",name:"For Him",         ing:"Cranberry, Mango, Banana, Mango Juice"},
      {id:"s5",name:"For Her",         ing:"Strawberry, Peach, Banana, Peach Juice"},
      {id:"s6",name:"Pineapple Blast", ing:"Pineapple, Cranberry, Banana, Pineapple Juice"},
      {id:"s7",name:"Cherry Blossom",  ing:"Strawberry, Mango, Banana, Cherry Juice"},
    ]
  },
  protein: {
    label:"Protein Shakes", emoji:"💪", size:"32 oz", basePrice:6.99,
    items:[
      {id:"p8", name:"Original",        ing:"Cranberry, Banana, Strawberry Banana Juice"},
      {id:"p9", name:"Skim Milk",        ing:"Strawberry, Banana, SB Juice, Skim Milk"},
      {id:"p10",name:"PB Blast",         ing:"Peanut Butter, Banana"},
      {id:"p11",name:"Green Tea",        ing:"Organic Green Tea, Banana, Almonds, Skim Milk"},
      {id:"p12",name:"Red Velvet",       ing:"Raspberry, Strawberry, Cranberry, Banana"},
      {id:"p14",name:"Pina Colada",      ing:"Pineapple, Coconut, Banana, Coconut Juice"},
      {id:"p15",name:"Ice Frappe Dream", ing:"Banana, Skim Milk, Mocha/Caramel/Vanilla"},
      {id:"p16",name:"Oreo Cookie",      ing:"Oreo Cookies, Banana, Skim Milk"},
    ]
  },
  leanmass: {
    label:"Lean Mass", emoji:"🏋️", size:"32 oz", basePrice:6.99,
    items:[
      {id:"l17",name:"Tropical Gorilla", ing:"Strawberry, Banana, SB Juice, Lean Mass"},
      {id:"l18",name:"Peanut Butter",    ing:"Peanut Butter, Banana, Skim Milk, Lean Mass"},
      {id:"l19",name:"Honey Almond",     ing:"Honey, Almonds, Banana, Skim Milk, Lean Mass"},
    ]
  },
  power: {
    label:"Power Shakes", emoji:"⚡", size:"24 oz", basePrice:8.49,
    items:[
      {id:"pw20",name:"Pre-Workout",    ing:"Strawberry, Blueberry, Banana, Energy Booster"},
      {id:"pw21",name:"Weight Control", ing:"Blackberry, Mango, Banana, Lecithin"},
      {id:"pw22",name:"Ginseng",        ing:"Strawberry, Pineapple, Banana, Ginseng"},
    ]
  },
  acai: {
    label:"Açaí", emoji:"🫐", size:"varies", basePrice:8.49,
    items:[
      {id:"a1",name:"Açaí Protein",   ing:"Sambazon Açaí, Banana, 30g protein",             price:8.49},
      {id:"a2",name:"Energy Pre-W",   ing:"Sambazon Açaí, Banana, Lecithin",                price:8.49},
      {id:"a3",name:"Vitamin C",      ing:"Sambazon Açaí, Banana, Vitamin C 1000mg",        price:8.49},
      {id:"a4",name:"Lo-Carb Met-Rx", ing:"Sambazon Açaí, Banana, 46g low carb protein",   price:8.99},
      {id:"a5",name:"Lean Mass",      ing:"Sambazon Açaí, Banana, 52g mass gainer",        price:8.99},
      {id:"a6",name:"Fiber Rich",     ing:"Sambazon Açaí, Banana, Papaya, Blackberry",     price:8.99},
      {id:"a7",name:"Açaí Bowl 🥣",  ing:"Thick blend, granola, banana, coconut, PB",     price:11.99},
    ]
  },
  pitaya: {
    label:"Pitaya", emoji:"🐉", size:"varies", basePrice:8.99,
    items:[
      {id:"pit1",name:"Pitaya Shake", ing:"Dragon Fruit · Fiber · Magnesium · B12 · Vit C", price:8.99},
    ]
  },
};

const BOOSTERS = [
  {id:"b1",name:"Protein",   icon:"🥚"},
  {id:"b2",name:"Lecithin",  icon:"🧠"},
  {id:"b3",name:"Creatine",  icon:"⚡"},
  {id:"b4",name:"Glutamine", icon:"🔬"},
  {id:"b5",name:"Ginseng",   icon:"🌿"},
];

/* ─── HELPERS ───────────────────────────────────────────── */
const fmt      = n  => `$${Number(n).toFixed(2)}`;
const timeStr  = d  => new Date(d).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"});
const dateStr  = d  => new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
const todayStr = () => new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});

let offlineQueue = [];

/* ─── ROOT APP ──────────────────────────────────────────── */
export default function App() {
  const [screen,       setScreen]       = useState("pos");
  const [activeCat,    setActiveCat]    = useState("smoothies");
  const [cart,         setCart]         = useState([]);
  const [modal,        setModal]        = useState(null);   // item being configured
  const [selBoosters,  setSelBoosters]  = useState([]);
  const [orderNum,     setOrderNum]     = useState(1001);
  const [lastOrder,    setLastOrder]    = useState(null);
  const [toast,        setToast]        = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [searchQ,      setSearchQ]      = useState("");
  const [detailOrder,  setDetailOrder]  = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [online,       setOnline]       = useState(navigator.onLine);
  const [clock,        setClock]        = useState(new Date());
  /* viewport dims – recalculated on resize */
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight });

  /* viewport listener */
  useEffect(() => {
    const fn = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  /* clock */
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  /* online/offline */
  useEffect(() => {
    const on  = () => { setOnline(true);  flushQueue(); };
    const off = () => setOnline(false);
    window.addEventListener("online",  on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  /* load data */
  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("transactions").select("*")
        .order("created_at", { ascending: false });
      if (data?.length) {
        setTransactions(data);
        setOrderNum(Math.max(...data.map(t => t.num || 1000)) + 1);
      }
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const pushToSupabase = async order => {
    try {
      await supabase.from("transactions").insert([{
        id: order.id, num: order.num, items: order.items,
        subtotal: order.subtotal, tax: order.tax, total: order.total,
        time: order.time, date_label: order.dateLabel,
      }]);
    } catch(e) { console.error(e); }
  };

  const flushQueue = async () => {
    while (offlineQueue.length) await pushToSupabase(offlineQueue.shift());
  };

  const toast$ = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2200);
  };

  /* ── cart ops ── */
  const addToCart = (item, boosters) => {
    const catKey = activeCat;
    const price  = (item.price ?? MENU[catKey].basePrice) + boosters.length;
    const key    = item.id + "|" + boosters.map(b => b.id).join(",");
    setCart(prev => {
      const ex = prev.find(c => c.key === key);
      if (ex) return prev.map(c => c.key === key ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { key, item, boosters, price, qty: 1, catKey }];
    });
    setModal(null);
    setSelBoosters([]);
    toast$(`✓ ${item.name} added`);
  };

  const updateQty = (key, d) =>
    setCart(prev => prev.map(c => c.key===key ? { ...c, qty: Math.max(0, c.qty+d) } : c).filter(c => c.qty > 0));

  const subtotal  = cart.reduce((s,c) => s + c.price * c.qty, 0);
  const tax       = subtotal * 0.0875;
  const total     = subtotal + tax;
  const cartCount = cart.reduce((s,c) => s + c.qty, 0);

  const placeOrder = async () => {
    if (!cart.length) return;
    setSaving(true);
    const order = {
      id: `ORD-${orderNum}`, num: orderNum, items: [...cart],
      subtotal, tax, total,
      time: new Date().toISOString(), dateLabel: todayStr(),
    };
    if (online) await pushToSupabase(order);
    else { offlineQueue.push(order); toast$("💾 Saved offline – syncing when back online", "warn"); }
    setTransactions(prev => [{ ...order, date_label: order.dateLabel }, ...prev]);
    setOrderNum(n => n + 1);
    setLastOrder(order);
    setCart([]);
    setSaving(false);
    setScreen("receipt");
  };

  /* ── derived ── */
  const today     = todayStr();
  const todayTxns = transactions.filter(t => (t.date_label || t.dateLabel) === today);
  const daily     = {
    count:    todayTxns.length,
    total:    todayTxns.reduce((s,t) => s + Number(t.total), 0),
    tax:      todayTxns.reduce((s,t) => s + Number(t.tax), 0),
  };

  const filteredTxns = transactions.filter(t => {
    if (!searchQ) return true;
    const q = searchQ.toLowerCase();
    return (t.id||"").toLowerCase().includes(q)
      || (t.date_label||t.dateLabel||"").toLowerCase().includes(q)
      || (t.items||[]).some(i => i.item?.name?.toLowerCase().includes(q));
  });

  const grouped = filteredTxns.reduce((acc, t) => {
    const d = t.date_label || t.dateLabel || "Unknown";
    (acc[d] = acc[d] || []).push(t);
    return acc;
  }, {});

  const itemCounts = {};
  transactions.forEach(t => (t.items||[]).forEach(i => {
    const n = i.item?.name || "Unknown";
    if (!itemCounts[n]) itemCounts[n] = { name: n, count: 0, revenue: 0 };
    itemCounts[n].count   += i.qty || 1;
    itemCounts[n].revenue += (i.price||0) * (i.qty||1);
  }));
  const topItems = Object.values(itemCounts).sort((a,b) => b.count - a.count).slice(0, 6);

  /* ── responsive breakpoints ── */
  const isTablet  = vp.w >= 768;
  const isDesktop = vp.w >= 1100;
  /* order panel width scales with screen */
  const orderPanelW = isDesktop ? 340 : isTablet ? 300 : 280;
  /* top bar height */
  const topH = isTablet ? 54 : 48;
  /* font scales */
  const fs = { xs:10, sm:12, md:13, lg:15, xl:18, h1:22 };

  /* ─── LOADING ─── */
  if (loading) return (
    <div style={{ width:"100vw", height:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
      <div style={{ fontSize:72 }}>🥤</div>
      <div style={{ color:C.text, fontSize:24, fontWeight:900 }}>JuicePlus POS</div>
      <div style={{ color:C.muted, fontSize:14 }}>Connecting…</div>
    </div>
  );

  const cat = MENU[activeCat];
  const col = CAT_COLORS[activeCat];

  /* ═══════════════════════════════════════════════════════ */
  return (
    <div style={{ width:"100vw", height:"100vh", background:C.bg, display:"flex", flexDirection:"column", overflow:"hidden", userSelect:"none" }}>

      {/* ══ TOP BAR ══ */}
      <div style={{ height:topH, background:C.surface, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px", flexShrink:0, borderBottom:`1px solid ${C.border}` }}>

        {/* left: logo + clock */}
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <span style={{ fontSize:fs.xl, fontWeight:900, color:C.accent, letterSpacing:"-0.5px", whiteSpace:"nowrap" }}>🥤 JuicePlus POS</span>
          {isTablet && <>
            <div style={{ width:1, height:22, background:C.border }} />
            <span style={{ fontSize:fs.sm, color:C.muted, whiteSpace:"nowrap", fontVariantNumeric:"tabular-nums" }}>
              {clock.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}
              {" · "}
              <b style={{ color:"#94A3B8" }}>{clock.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</b>
            </span>
            <StatusPill online={online} />
          </>}
        </div>

        {/* right: stats + nav */}
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {isTablet && (
            <div style={{ background:C.bg, borderRadius:10, padding:"4px 14px", display:"flex", gap:14 }}>
              <Stat label="ORDERS" value={daily.count}        color={C.yellow} />
              <div style={{ width:1, background:C.border }} />
              <Stat label="SALES"  value={fmt(daily.total)}   color={C.green} />
            </div>
          )}
          {["pos","history","reports"].map(s => (
            <NavBtn key={s} id={s} active={screen===s} onClick={()=>setScreen(s)}
              label={s==="pos"?"🧾 POS":s==="history"?"📜 History":"📊 Reports"} />
          ))}
        </div>
      </div>

      {/* ══ BODY ══ */}
      <div style={{ flex:1, overflow:"hidden", display:"flex" }}>

        {/* ── POS ── */}
        {screen==="pos" && (
          <>
            {/* MENU PANEL */}
            <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", borderRight:`1px solid ${C.border}` }}>

              {/* Category tabs – scrollable */}
              <div style={{ display:"flex", background:C.surface, flexShrink:0, overflowX:"auto", scrollbarWidth:"none" }}>
                {Object.entries(MENU).map(([key, c]) => {
                  const active = key === activeCat;
                  const cc = CAT_COLORS[key];
                  return (
                    <button key={key} onClick={() => setActiveCat(key)}
                      style={{ flexShrink:0, padding:`12px ${isDesktop?"22px":"14px"}`, border:"none",
                        borderBottom: active ? `3px solid ${cc}` : "3px solid transparent",
                        background: active ? cc+"18" : "transparent",
                        color: active ? cc : C.muted,
                        fontWeight:700, fontSize:fs.md, cursor:"pointer", whiteSpace:"nowrap" }}>
                      {c.emoji} {isTablet ? c.label : c.emoji}
                    </button>
                  );
                })}
              </div>

              {/* Cat header */}
              <div style={{ padding:"8px 14px 4px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
                <span style={{ fontSize:fs.lg, fontWeight:900, color:C.text }}>{cat.emoji} {cat.label}</span>
                <span style={{ fontSize:fs.xs, color:C.muted }}>{cat.size} · from {fmt(cat.basePrice)}</span>
              </div>

              {/* Items GRID – fills remaining height */}
              <div style={{ flex:1, overflowY:"auto", padding:"6px 10px 10px",
                display:"grid",
                gridTemplateColumns: isDesktop
                  ? "repeat(auto-fill, minmax(200px, 1fr))"
                  : isTablet
                    ? "repeat(auto-fill, minmax(170px, 1fr))"
                    : "repeat(auto-fill, minmax(140px, 1fr))",
                gap:8, alignContent:"start" }}>
                {cat.items.map(item => (
                  <ItemCard key={item.id} item={item} cat={cat} col={col}
                    onTap={() => { setModal({ item, catKey: activeCat }); setSelBoosters([]); }} />
                ))}
              </div>
            </div>

            {/* ORDER PANEL */}
            <div style={{ width:orderPanelW, display:"flex", flexDirection:"column", background:C.surface, flexShrink:0 }}>
              {/* header */}
              <div style={{ padding:"10px 12px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
                <span style={{ fontSize:fs.lg, fontWeight:900, color:C.text }}>Order</span>
                <div style={{ display:"flex", gap:6 }}>
                  {cartCount > 0 && <Badge val={cartCount} color={C.accent} />}
                  {cart.length > 0 && (
                    <button onClick={() => setCart([])}
                      style={{ background:"#450A0A", border:"none", borderRadius:7, padding:"3px 8px", color:"#EF4444", fontWeight:700, fontSize:fs.xs, cursor:"pointer" }}>
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* cart items */}
              <div style={{ flex:1, overflowY:"auto", padding:"6px 8px", display:"flex", flexDirection:"column", gap:5 }}>
                {cart.length === 0 ? (
                  <div style={{ textAlign:"center", paddingTop:"30%", color:C.dim }}>
                    <div style={{ fontSize:36 }}>🧾</div>
                    <div style={{ fontSize:fs.sm, marginTop:8, fontWeight:600 }}>No items yet</div>
                    <div style={{ fontSize:fs.xs, marginTop:4 }}>Tap menu items to add</div>
                  </div>
                ) : cart.map(c => {
                  const cc = CAT_COLORS[c.catKey];
                  return (
                    <div key={c.key} style={{ background:C.bg, borderRadius:10, padding:"8px 10px", borderLeft:`3px solid ${cc}` }}>
                      <div style={{ display:"flex", justifyContent:"space-between" }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontWeight:800, fontSize:fs.md, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.item.name}</div>
                          {c.boosters.length > 0 && <div style={{ fontSize:fs.xs, color:cc, marginTop:1 }}>+{c.boosters.map(b=>b.name).join(", ")}</div>}
                        </div>
                        <div style={{ fontWeight:900, fontSize:fs.md, color:cc, marginLeft:6, flexShrink:0 }}>{fmt(c.price*c.qty)}</div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:6 }}>
                        <QtyCtrl val={c.qty} onMinus={()=>updateQty(c.key,-1)} onPlus={()=>updateQty(c.key,+1)} />
                        <span style={{ fontSize:fs.xs, color:C.muted }}>{fmt(c.price)} ea</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* totals + charge button */}
              <div style={{ padding:"10px 12px 14px", borderTop:`1px solid ${C.border}`, background:C.bg, flexShrink:0 }}>
                <Row label="Subtotal" val={fmt(subtotal)} />
                <Row label="Tax 8.75%" val={fmt(tax)} />
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:fs.xl, fontWeight:900, margin:"10px 0 12px", paddingTop:8, borderTop:`1px solid ${C.border}` }}>
                  <span style={{ color:C.text }}>TOTAL</span>
                  <span style={{ color:C.accent, fontVariantNumeric:"tabular-nums" }}>{fmt(total)}</span>
                </div>
                <button onClick={placeOrder} disabled={!cart.length || saving}
                  style={{ width:"100%", background: !cart.length ? C.surface : saving ? C.dim : `linear-gradient(135deg,${C.accent},${C.yellow})`,
                    border:"none", borderRadius:12, padding:"14px", color: !cart.length ? C.dim : C.text,
                    fontWeight:900, fontSize:fs.xl, cursor: !cart.length ? "not-allowed" : "pointer",
                    boxShadow: cart.length ? `0 4px 20px ${C.accent}44` : "none" }}>
                  {saving ? "💾 Saving…" : !cart.length ? "Add Items →" : `✓ CHARGE ${fmt(total)}`}
                </button>
                {!online && cart.length > 0 && (
                  <div style={{ textAlign:"center", marginTop:6, fontSize:fs.xs, color:C.yellow }}>⚠️ Offline – will sync when connected</div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── RECEIPT ── */}
        {screen==="receipt" && lastOrder && (
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:20, overflowY:"auto" }}>
            <div style={{ background:C.card, borderRadius:20, padding:28, maxWidth:480, width:"100%", boxShadow:`0 20px 60px rgba(0,0,0,0.5)` }}>
              <div style={{ textAlign:"center", marginBottom:20 }}>
                <div style={{ width:68, height:68, borderRadius:"50%", background:"linear-gradient(135deg,#22C55E,#16A34A)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, margin:"0 auto 10px", boxShadow:"0 0 28px rgba(34,197,94,0.4)" }}>✓</div>
                <div style={{ fontSize:fs.h1, fontWeight:900, color:C.text }}>Order Complete!</div>
                <div style={{ fontSize:fs.sm, color:C.muted, marginTop:4 }}>{lastOrder.id} · {online ? "Saved ☁️" : "Queued for sync"}</div>
              </div>
              <div style={{ background:C.bg, borderRadius:14, padding:18, marginBottom:18 }}>
                <div style={{ textAlign:"center", borderBottom:`1px dashed ${C.border}`, paddingBottom:12, marginBottom:12 }}>
                  <div style={{ fontSize:fs.lg, fontWeight:900, color:C.text }}>🥤 JuicePlus</div>
                  <div style={{ fontSize:fs.xs, color:C.muted, marginTop:2 }}>{timeStr(lastOrder.time)} · {lastOrder.dateLabel}</div>
                </div>
                {lastOrder.items.map((c,i) => (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:fs.md, marginBottom:7 }}>
                    <div>
                      <div style={{ fontWeight:700, color:C.text }}>{c.qty}× {c.item?.name}</div>
                      {(c.boosters||[]).length > 0 && <div style={{ fontSize:fs.xs, color:C.muted }}>+{c.boosters.map(b=>b.name).join(", ")}</div>}
                    </div>
                    <div style={{ fontWeight:800, color:C.text }}>{fmt(c.price*c.qty)}</div>
                  </div>
                ))}
                <div style={{ borderTop:`1px dashed ${C.border}`, paddingTop:10, marginTop:6 }}>
                  <Row label="Subtotal" val={fmt(lastOrder.subtotal)} />
                  <Row label="Tax" val={fmt(lastOrder.tax)} mt={4} />
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:fs.h1, fontWeight:900, color:C.accent, marginTop:10 }}>
                    <span>TOTAL</span><span>{fmt(lastOrder.total)}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setScreen("pos")}
                style={{ width:"100%", background:`linear-gradient(135deg,${C.accent},${C.yellow})`, border:"none", borderRadius:14, padding:"15px", color:C.text, fontWeight:900, fontSize:fs.xl, cursor:"pointer", boxShadow:`0 4px 20px ${C.accent}44` }}>
                + New Order
              </button>
            </div>
          </div>
        )}

        {/* ── HISTORY ── */}
        {screen==="history" && (
          <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
            {/* toolbar */}
            <div style={{ padding:"10px 16px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:10, flexShrink:0, flexWrap:"wrap" }}>
              <SearchBox value={searchQ} onChange={setSearchQ} />
              <button onClick={loadData} style={{ background:C.card, border:"none", borderRadius:9, padding:"7px 14px", color:C.muted, fontSize:fs.sm, cursor:"pointer", fontWeight:600 }}>↻</button>
              <div style={{ display:"flex", gap:18, marginLeft:"auto" }}>
                <Stat label="TODAY"     value={daily.count}      color={C.yellow} />
                <Stat label="SALES"     value={fmt(daily.total)} color={C.green}  />
                <Stat label="TAX"       value={fmt(daily.tax)}   color={C.muted}  />
                <Stat label="ALL TIME"  value={transactions.length} color={C.accent} />
              </div>
            </div>
            {/* list */}
            <div style={{ flex:1, overflowY:"auto", padding:"14px 16px" }}>
              {Object.keys(grouped).length === 0 ? (
                <Empty icon="📭" msg="No orders found" />
              ) : Object.keys(grouped).map(date => (
                <div key={date} style={{ marginBottom:22 }}>
                  <div style={{ fontSize:fs.xs, fontWeight:700, color:C.muted, letterSpacing:2, marginBottom:8, display:"flex", alignItems:"center", gap:8 }}>
                    {date}
                    <span style={{ background:C.card, borderRadius:6, padding:"2px 8px", fontSize:fs.xs, color:C.dim, fontWeight:600 }}>
                      {grouped[date].length} orders · {fmt(grouped[date].reduce((s,t)=>s+Number(t.total),0))}
                    </span>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:7 }}>
                    {grouped[date].map(t => (
                      <div key={t.id} onClick={() => { setDetailOrder(t); setScreen("detail"); }}
                        style={{ background:C.card, borderRadius:11, padding:"11px 13px", cursor:"pointer", borderLeft:`3px solid ${C.accent}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}
                        onMouseEnter={e => e.currentTarget.style.background="#1E3050"}
                        onMouseLeave={e => e.currentTarget.style.background=C.card}>
                        <div>
                          <div style={{ fontWeight:800, fontSize:fs.md, color:C.text }}>{t.id}</div>
                          <div style={{ fontSize:fs.xs, color:C.muted, marginTop:2 }}>{timeStr(t.time)} · {(t.items||[]).length} item{(t.items||[]).length!==1?"s":""}</div>
                          <div style={{ fontSize:fs.xs, color:C.dim, marginTop:1 }}>{(t.items||[]).slice(0,2).map(i=>i.item?.name).filter(Boolean).join(", ")}{(t.items||[]).length>2?"…":""}</div>
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontSize:fs.lg, fontWeight:900, color:C.accent, fontVariantNumeric:"tabular-nums" }}>{fmt(t.total)}</div>
                          <div style={{ fontSize:fs.xs, color:C.dim }}>view →</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── DETAIL ── */}
        {screen==="detail" && detailOrder && (
          <div style={{ flex:1, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:24, overflowY:"auto" }}>
            <div style={{ background:C.card, borderRadius:20, padding:26, maxWidth:540, width:"100%" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
                <div style={{ fontSize:fs.xl, fontWeight:900, color:C.text }}>{detailOrder.id}</div>
                <button onClick={() => setScreen("history")} style={{ background:C.bg, border:"none", borderRadius:8, padding:"7px 14px", color:C.muted, fontWeight:700, cursor:"pointer", fontSize:fs.sm }}>← Back</button>
              </div>
              <div style={{ display:"flex", gap:10, marginBottom:18 }}>
                {[{l:"Date",v:dateStr(detailOrder.time)},{l:"Time",v:timeStr(detailOrder.time)},{l:"Items",v:(detailOrder.items||[]).length}].map(x=>(
                  <div key={x.l} style={{ background:C.bg, borderRadius:10, padding:"9px 14px", flex:1 }}>
                    <div style={{ fontSize:fs.xs, color:C.muted }}>{x.l}</div>
                    <div style={{ fontSize:fs.md, fontWeight:700, color:C.text, marginTop:2 }}>{x.v}</div>
                  </div>
                ))}
              </div>
              <div style={{ background:C.bg, borderRadius:12, padding:14, marginBottom:12 }}>
                <div style={{ fontSize:fs.xs, fontWeight:700, color:C.muted, letterSpacing:1, marginBottom:10 }}>ORDER ITEMS</div>
                {(detailOrder.items||[]).map((c,i,arr) => (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", paddingBottom:9, marginBottom:9, borderBottom:i<arr.length-1?`1px solid ${C.border}`:"none" }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:fs.md, color:C.text }}>{c.qty}× {c.item?.name}</div>
                      {(c.boosters||[]).length>0&&<div style={{ fontSize:fs.xs, color:C.accent, marginTop:1 }}>+{c.boosters.map(b=>b.name).join(", ")}</div>}
                    </div>
                    <div style={{ fontWeight:800, fontSize:fs.md, color:C.text }}>{fmt(c.price*c.qty)}</div>
                  </div>
                ))}
              </div>
              <div style={{ background:C.bg, borderRadius:12, padding:14 }}>
                <Row label="Subtotal" val={fmt(detailOrder.subtotal)} />
                <Row label="Tax 8.75%" val={fmt(detailOrder.tax)} mt={5} />
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:fs.h1, fontWeight:900, color:C.accent, paddingTop:10, marginTop:8, borderTop:`1px solid ${C.border}` }}>
                  <span>TOTAL</span><span>{fmt(detailOrder.total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── REPORTS ── */}
        {screen==="reports" && (
          <div style={{ flex:1, overflowY:"auto", padding:18 }}>
            {/* KPI cards */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:12, marginBottom:18 }}>
              {[
                {label:"Total Revenue",  value:fmt(transactions.reduce((s,t)=>s+Number(t.total),0)),   color:C.accent},
                {label:"Total Orders",   value:transactions.length,                                     color:C.yellow},
                {label:"Avg Order",      value:fmt(transactions.length?transactions.reduce((s,t)=>s+Number(t.total),0)/transactions.length:0), color:C.green},
                {label:"Today Orders",   value:daily.count,                                             color:"#8B5CF6"},
                {label:"Today Revenue",  value:fmt(daily.total),                                        color:"#EC4899"},
                {label:"Today Tax Coll.",value:fmt(daily.tax),                                          color:"#10B981"},
              ].map(s => (
                <div key={s.label} style={{ background:C.card, borderRadius:14, padding:"15px 16px", borderTop:`3px solid ${s.color}` }}>
                  <div style={{ fontSize:22, fontWeight:900, color:s.color, fontVariantNumeric:"tabular-nums" }}>{s.value}</div>
                  <div style={{ fontSize:fs.xs, color:C.muted, marginTop:4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display:"grid", gridTemplateColumns: isTablet ? "1fr 1fr" : "1fr", gap:14 }}>
              {/* top items */}
              <div style={{ background:C.card, borderRadius:16, padding:18 }}>
                <div style={{ fontSize:fs.md, fontWeight:800, color:C.text, marginBottom:14 }}>🏆 Top Selling Items</div>
                {topItems.length === 0 ? <div style={{ color:C.dim, fontSize:fs.sm }}>No data yet</div>
                : topItems.map((item, i) => (
                  <div key={item.name} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                    <div style={{ width:26, height:26, borderRadius:7, background:[C.accent,C.yellow,"#EF4444","#8B5CF6","#10B981","#EC4899"][i], display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:900, fontSize:fs.xs, flexShrink:0 }}>#{i+1}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:fs.md, fontWeight:700, color:C.text }}>{item.name}</div>
                      <div style={{ fontSize:fs.xs, color:C.muted }}>{item.count} sold · {fmt(item.revenue)}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* daily breakdown */}
              <div style={{ background:C.card, borderRadius:16, padding:18, maxHeight:360, overflowY:"auto" }}>
                <div style={{ fontSize:fs.md, fontWeight:800, color:C.text, marginBottom:14 }}>📅 Daily Breakdown</div>
                {Object.keys(grouped).length === 0 ? <div style={{ color:C.dim, fontSize:fs.sm }}>No data yet</div>
                : Object.keys(grouped).slice(0,30).map(date => {
                  const dt = grouped[date] || [];
                  return (
                    <div key={date} style={{ borderBottom:`1px solid ${C.bg}`, paddingBottom:8, marginBottom:8 }}>
                      <div style={{ display:"flex", justifyContent:"space-between" }}>
                        <div style={{ fontSize:fs.md, fontWeight:700, color:C.text }}>{date}</div>
                        <div style={{ fontSize:fs.lg, fontWeight:900, color:C.accent, fontVariantNumeric:"tabular-nums" }}>{fmt(dt.reduce((s,t)=>s+Number(t.total),0))}</div>
                      </div>
                      <div style={{ display:"flex", gap:12, marginTop:2 }}>
                        <span style={{ fontSize:fs.xs, color:C.muted }}>{dt.length} orders</span>
                        <span style={{ fontSize:fs.xs, color:C.muted }}>Tax: {fmt(dt.reduce((s,t)=>s+Number(t.tax),0))}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══ BOOSTER MODAL ══ */}
      {modal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.78)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, backdropFilter:"blur(5px)" }}
          onClick={() => { setModal(null); setSelBoosters([]); }}>
          <div style={{ background:C.card, borderRadius:20, padding:24, width:"94%", maxWidth:450, border:`2px solid ${CAT_COLORS[modal.catKey]}`, boxShadow:"0 20px 60px rgba(0,0,0,0.5)" }}
            onClick={e => e.stopPropagation()}>
            {/* item info */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
              <div>
                <div style={{ fontSize:fs.xl, fontWeight:900, color:C.text }}>{modal.item.name}</div>
                <div style={{ fontSize:fs.sm, color:C.muted, marginTop:3, maxWidth:300 }}>{modal.item.ing}</div>
                <div style={{ display:"flex", gap:7, marginTop:8 }}>
                  <PricePill val={MENU[modal.catKey].size} color={CAT_COLORS[modal.catKey]} />
                  <PricePill val={fmt(modal.item.price ?? MENU[modal.catKey].basePrice)} color={CAT_COLORS[modal.catKey]} />
                </div>
              </div>
              <button onClick={() => { setModal(null); setSelBoosters([]); }}
                style={{ background:C.bg, border:"none", borderRadius:8, width:30, height:30, color:C.muted, cursor:"pointer", fontSize:16, flexShrink:0 }}>✕</button>
            </div>

            <div style={{ fontSize:fs.xs, fontWeight:700, color:C.muted, letterSpacing:1, marginBottom:8 }}>ADD BOOSTERS (+$1.00 EACH)</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, marginBottom:16 }}>
              {BOOSTERS.map(b => {
                const on = !!selBoosters.find(x => x.id === b.id);
                const cc = CAT_COLORS[modal.catKey];
                return (
                  <div key={b.id} onClick={() => setSelBoosters(prev => on ? prev.filter(x=>x.id!==b.id) : [...prev, b])}
                    style={{ background: on ? cc+"20" : C.bg, border:`2px solid ${on ? cc : C.border}`, borderRadius:11, padding:"10px 12px", cursor:"pointer", display:"flex", alignItems:"center", gap:9 }}>
                    <span style={{ fontSize:20 }}>{b.icon}</span>
                    <div style={{ flex:1, fontWeight:700, fontSize:fs.md, color:C.text }}>{b.name}</div>
                    <div style={{ width:21, height:21, borderRadius:6, background: on ? cc : C.surface, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:900, fontSize:12 }}>{on?"✓":"+"}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => { setModal(null); setSelBoosters([]); }}
                style={{ flex:1, background:C.bg, border:"none", borderRadius:11, padding:"12px", color:C.muted, fontWeight:700, fontSize:fs.md, cursor:"pointer" }}>Cancel</button>
              <button onClick={() => addToCart(modal.item, selBoosters)}
                style={{ flex:2, background:CAT_COLORS[modal.catKey], border:"none", borderRadius:11, padding:"12px", color:"#fff", fontWeight:900, fontSize:fs.lg, cursor:"pointer", boxShadow:`0 4px 16px ${CAT_COLORS[modal.catKey]}44` }}>
                Add — {fmt((modal.item.price ?? MENU[modal.catKey].basePrice) + selBoosters.length)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ TOAST ══ */}
      {toast && (
        <div style={{ position:"fixed", bottom:18, left:"50%", transform:"translateX(-50%)",
          background: toast.type==="warn" ? "#78350F" : "#064E3B",
          color:"#fff", padding:"11px 22px", borderRadius:12, fontSize:fs.md, fontWeight:700,
          boxShadow:"0 4px 24px rgba(0,0,0,0.4)", zIndex:200, whiteSpace:"nowrap" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ─── SMALL COMPONENTS ──────────────────────────────────── */

function ItemCard({ item, cat, col, onTap }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onTap}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? "#1E3050" : "#1A2235", borderRadius:13, padding:"13px", cursor:"pointer",
        border:`1px solid ${hov ? col : "#1E2D45"}`, display:"flex", flexDirection:"column", gap:6, transition:"all 0.12s" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:22 }}>{cat.emoji}</span>
        <span style={{ fontWeight:900, fontSize:15, color:col }}>{fmt(item.price ?? cat.basePrice)}</span>
      </div>
      <div style={{ fontWeight:800, fontSize:13, color:"#F1F5F9", lineHeight:1.2 }}>{item.name}</div>
      <div style={{ fontSize:10, color:"#64748B", lineHeight:1.4, flex:1 }}>{item.ing}</div>
      <div style={{ background: hov ? col : col+"88", borderRadius:7, padding:"6px", textAlign:"center", color:"#fff", fontWeight:800, fontSize:11, marginTop:2, transition:"background 0.12s" }}>
        TAP TO ADD
      </div>
    </div>
  );
}

function QtyCtrl({ val, onMinus, onPlus }) {
  return (
    <div style={{ display:"flex", alignItems:"center", background:"#1A2235", borderRadius:8, overflow:"hidden" }}>
      <button onClick={onMinus} style={{ background:"none", border:"none", padding:"3px 10px", fontSize:15, cursor:"pointer", color:"#94A3B8", fontWeight:700 }}>−</button>
      <span style={{ fontSize:13, fontWeight:800, color:"#F1F5F9", minWidth:18, textAlign:"center" }}>{val}</span>
      <button onClick={onPlus}  style={{ background:"none", border:"none", padding:"3px 10px", fontSize:15, cursor:"pointer", color:"#94A3B8", fontWeight:700 }}>+</button>
    </div>
  );
}

function Row({ label, val, mt=3 }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#64748B", marginTop:mt }}>
      <span>{label}</span><span>{val}</span>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ textAlign:"center" }}>
      <div style={{ fontSize:14, fontWeight:900, color, fontVariantNumeric:"tabular-nums" }}>{value}</div>
      <div style={{ fontSize:9, color:"#475569" }}>{label}</div>
    </div>
  );
}

function NavBtn({ id, label, active, onClick }) {
  return (
    <button onClick={onClick}
      style={{ background: active ? "#FF6B35" : "#111827", border:"none", borderRadius:9, padding:"6px 14px", color: active ? "#fff" : "#64748B", fontWeight:700, fontSize:12, cursor:"pointer", whiteSpace:"nowrap" }}>
      {label}
    </button>
  );
}

function StatusPill({ online }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:5, background: online ? "#064E3B" : "#450A0A", borderRadius:8, padding:"3px 9px" }}>
      <div style={{ width:6, height:6, borderRadius:"50%", background: online ? "#22C55E" : "#EF4444" }} />
      <span style={{ fontSize:10, fontWeight:700, color: online ? "#22C55E" : "#EF4444" }}>{online ? "ONLINE" : "OFFLINE"}</span>
    </div>
  );
}

function Badge({ val, color }) {
  return (
    <div style={{ background:color, borderRadius:8, padding:"2px 7px", fontSize:10, fontWeight:800, color:"#fff" }}>{val}</div>
  );
}

function PricePill({ val, color }) {
  return (
    <span style={{ background:color+"22", borderRadius:7, padding:"3px 10px", fontSize:11, color, fontWeight:700 }}>{val}</span>
  );
}

function SearchBox({ value, onChange }) {
  return (
    <div style={{ background:"#1A2235", borderRadius:10, padding:"7px 13px", display:"flex", alignItems:"center", gap:8, flex:"1 1 200px", maxWidth:380 }}>
      <span>🔍</span>
      <input value={value} onChange={e => onChange(e.target.value)}
        placeholder="Search by item, date, order ID..."
        style={{ background:"none", border:"none", outline:"none", color:"#F1F5F9", fontSize:12, flex:1, minWidth:0 }} />
      {value && <span onClick={() => onChange("")} style={{ color:"#475569", cursor:"pointer" }}>✕</span>}
    </div>
  );
}

function Empty({ icon, msg }) {
  return (
    <div style={{ textAlign:"center", paddingTop:80 }}>
      <div style={{ fontSize:52 }}>{icon}</div>
      <div style={{ fontSize:15, color:"#334155", fontWeight:700, marginTop:12 }}>{msg}</div>
    </div>
  );
}
