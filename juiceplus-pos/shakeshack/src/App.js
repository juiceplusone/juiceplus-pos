import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://qykjkxqbwievidodsnmz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5a2preHFid2lldmlkb2Rzbm16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMjkyNTgsImV4cCI6MjA4ODkwNTI1OH0.ubB5FxnJbiXBcIFnlhoKRntvHvjuF-cKnRpumjYN8k8"
);

/* ─── THEME ─────────────────────────────────────────────── */
const C = {
  bg:"#0A0F1E", surface:"#111827", card:"#1A2235", border:"#1E2D45",
  text:"#F1F5F9", muted:"#64748B", dim:"#334155",
  accent:"#FF6B35", green:"#22C55E", yellow:"#E8A020",
};
const CAT_COLORS = {
  smoothies:"#FF6B35", protein:"#E8A020", leanmass:"#EF4444",
  power:"#8B5CF6", acai:"#10B981", pitaya:"#EC4899",
};

/* ─── PRINTER CONFIG (edit IP after setup) ──────────────── */
const PRINTER_CONFIG = {
  ip:   "192.168.1.100",   // ← Change this to your printer's IP address
  port: 8008,              // Epson ePOS default port
  paperWidth: 58,          // mm
  devId: "local_printer",
};

/* ─── MENU DATA ─────────────────────────────────────────── */
const MENU = {
  smoothies:{label:"Smoothies",emoji:"🥤",size:"24 oz",basePrice:5.99,items:[
    {id:"s1",name:"Energizer",       ing:"Mango, Banana, Strawberry, Guava Juice"},
    {id:"s2",name:"Citrus Boost",    ing:"Blueberry, Mango, Peach, Orange Juice"},
    {id:"s3",name:"Second Wind",     ing:"Strawberry, Banana, Raspberry, SB Juice"},
    {id:"s4",name:"For Him",         ing:"Cranberry, Mango, Banana, Mango Juice"},
    {id:"s5",name:"For Her",         ing:"Strawberry, Peach, Banana, Peach Juice"},
    {id:"s6",name:"Pineapple Blast", ing:"Pineapple, Cranberry, Banana, Pineapple Juice"},
    {id:"s7",name:"Cherry Blossom",  ing:"Strawberry, Mango, Banana, Cherry Juice"},
  ]},
  protein:{label:"Protein Shakes",emoji:"💪",size:"32 oz",basePrice:6.99,items:[
    {id:"p8", name:"Original",        ing:"Cranberry, Banana, Strawberry Banana Juice"},
    {id:"p9", name:"Skim Milk",        ing:"Strawberry, Banana, SB Juice, Skim Milk"},
    {id:"p10",name:"PB Blast",         ing:"Peanut Butter, Banana"},
    {id:"p11",name:"Green Tea",        ing:"Organic Green Tea, Banana, Almonds, Skim Milk"},
    {id:"p12",name:"Red Velvet",       ing:"Raspberry, Strawberry, Cranberry, Banana"},
    {id:"p14",name:"Pina Colada",      ing:"Pineapple, Coconut, Banana, Coconut Juice"},
    {id:"p15",name:"Ice Frappe Dream", ing:"Banana, Skim Milk, Mocha/Caramel/Vanilla"},
    {id:"p16",name:"Oreo Cookie",      ing:"Oreo Cookies, Banana, Skim Milk"},
  ]},
  leanmass:{label:"Lean Mass",emoji:"🏋️",size:"32 oz",basePrice:6.99,items:[
    {id:"l17",name:"Tropical Gorilla",ing:"Strawberry, Banana, SB Juice, Lean Mass"},
    {id:"l18",name:"Peanut Butter",   ing:"Peanut Butter, Banana, Skim Milk, Lean Mass"},
    {id:"l19",name:"Honey Almond",    ing:"Honey, Almonds, Banana, Skim Milk, Lean Mass"},
  ]},
  power:{label:"Power Shakes",emoji:"⚡",size:"24 oz",basePrice:8.49,items:[
    {id:"pw20",name:"Pre-Workout",    ing:"Strawberry, Blueberry, Banana, Energy Booster"},
    {id:"pw21",name:"Weight Control", ing:"Blackberry, Mango, Banana, Lecithin"},
    {id:"pw22",name:"Ginseng",        ing:"Strawberry, Pineapple, Banana, Ginseng"},
  ]},
  acai:{label:"Açaí",emoji:"🫐",size:"varies",basePrice:8.49,items:[
    {id:"a1",name:"Açaí Protein",   ing:"Sambazon Açaí, Banana, 30g protein",           price:8.49},
    {id:"a2",name:"Energy Pre-W",   ing:"Sambazon Açaí, Banana, Lecithin",              price:8.49},
    {id:"a3",name:"Vitamin C",      ing:"Sambazon Açaí, Banana, Vitamin C 1000mg",      price:8.49},
    {id:"a4",name:"Lo-Carb Met-Rx", ing:"Sambazon Açaí, Banana, 46g low carb protein", price:8.99},
    {id:"a5",name:"Lean Mass",      ing:"Sambazon Açaí, Banana, 52g mass gainer",      price:8.99},
    {id:"a6",name:"Fiber Rich",     ing:"Sambazon Açaí, Banana, Papaya, Blackberry",   price:8.99},
    {id:"a7",name:"Açaí Bowl 🥣",  ing:"Thick blend, granola, banana, coconut, PB",   price:11.99},
  ]},
  pitaya:{label:"Pitaya",emoji:"🐉",size:"varies",basePrice:8.99,items:[
    {id:"pit1",name:"Pitaya Shake",ing:"Dragon Fruit · Fiber · Magnesium · B12 · Vit C",price:8.99},
  ]},
};

const BOOSTERS = [
  {id:"b1",name:"Protein",icon:"🥚"},{id:"b2",name:"Lecithin",icon:"🧠"},
  {id:"b3",name:"Creatine",icon:"⚡"},{id:"b4",name:"Glutamine",icon:"🔬"},
  {id:"b5",name:"Ginseng",icon:"🌿"},
];

/* ─── HELPERS ───────────────────────────────────────────── */
const fmt      = n  => `$${Number(n).toFixed(2)}`;
const timeStr  = d  => new Date(d).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"});
const dateStr  = d  => new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
const todayStr = () => new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
const pad      = (s,n,r=false) => r ? String(s).padStart(n) : String(s).padEnd(n);

/* ─── EPSON ePOS PRINT ENGINE ───────────────────────────── */
/*
  Prints TWO tickets on every order:
    1. Customer Receipt  — prices, tax, total, cash drawer pulse
    2. Kitchen Ticket    — large text, items + boosters + notes, NO prices
  Both fire on a single printer connection back-to-back.
*/

const buildCustomerReceipt = (printer, order) => {
  // ── Header ──
  printer.addTextAlign(printer.ALIGN_CENTER);
  printer.addTextSize(2, 2);
  printer.addTextStyle(false, false, true, printer.COLOR_1);
  printer.addText("JUICEPLUS\n");
  printer.addTextSize(1, 1);
  printer.addTextStyle(false, false, false, printer.COLOR_1);
  printer.addText("Authentic · Organic · Acai\n");
  printer.addText("--------------------------------\n");

  // ── Order info ──
  printer.addTextAlign(printer.ALIGN_LEFT);
  printer.addText(`Order : ${order.id}\n`);
  printer.addText(`Date  : ${order.dateLabel}\n`);
  printer.addText(`Time  : ${timeStr(order.time)}\n`);
  printer.addText("--------------------------------\n");

  // ── Items ──
  printer.addTextStyle(false, false, true, printer.COLOR_1);
  printer.addText("ITEMS\n");
  printer.addTextStyle(false, false, false, printer.COLOR_1);

  order.items.forEach(c => {
    const itemName  = `${c.qty}x ${c.item.name}`;
    const itemPrice = fmt(c.price * c.qty);
    const spaces    = Math.max(1, 32 - itemName.length - itemPrice.length);
    printer.addText(itemName + " ".repeat(spaces) + itemPrice + "\n");
    if (c.boosters?.length > 0)
      printer.addText(`  + ${c.boosters.map(b => b.name).join(", ")}\n`);
    if (c.note)
      printer.addText(`  * ${c.note}\n`);
  });

  printer.addText("--------------------------------\n");

  // ── Totals ──
  const stLine = `Subtotal${" ".repeat(Math.max(1,32-8-fmt(order.subtotal).length))}${fmt(order.subtotal)}`;
  const txLine = `Tax (8.75%)${" ".repeat(Math.max(1,32-10-fmt(order.tax).length))}${fmt(order.tax)}`;
  printer.addText(stLine + "\n");
  printer.addText(txLine + "\n");

  // Surcharge line — only for card payments
  if (order.paymentMethod === "card" && order.surcharge > 0) {
    const scLine = `Card fee (3%)${" ".repeat(Math.max(1,32-12-fmt(order.surcharge).length))}${fmt(order.surcharge)}`;
    printer.addText(scLine + "\n");
  }

  printer.addText("================================\n");

  printer.addTextSize(1, 2);
  printer.addTextStyle(false, false, true, printer.COLOR_1);
  const totalSpaces = Math.max(1, 32 - 5 - fmt(order.total).length);
  printer.addText("TOTAL" + " ".repeat(totalSpaces) + fmt(order.total) + "\n");
  printer.addTextSize(1, 1);
  printer.addTextStyle(false, false, false, printer.COLOR_1);
  printer.addText("================================\n");

  // ── Footer ──
  printer.addTextAlign(printer.ALIGN_CENTER);
  printer.addText("\nThank you!\n");
  printer.addText("Enjoy your juice :)\n");
  printer.addText("\n\n");

  // Cut + open cash drawer
  printer.addCut(printer.CUT_FEED);
  printer.addPulse(printer.DRAWER_1, printer.PULSE_100);
};

const buildKitchenTicket = (printer, order) => {
  /*
    CUP LABEL MODE — prints one compact label per cup (per qty)
    Optimized for 58mm × 40mm waterproof thermal labels on round cold drink cups.
    Each label: order # + time + item name + INGREDIENTS + boosters + special note.
  */

  const cups = [];
  order.items.forEach(c => {
    for (let i = 0; i < c.qty; i++) {
      cups.push({ ...c, cupNum: i + 1, totalCups: c.qty });
    }
  });

  const totalCupsInOrder = cups.length;

  cups.forEach((c, idx) => {
    printer.addTextLang("en");
    printer.addTextSmooth(true);

    // ── TOP: Order # and time ──
    printer.addTextAlign(printer.ALIGN_CENTER);
    printer.addTextSize(1, 1);
    printer.addTextStyle(false, false, true, printer.COLOR_1);
    const cupTag = totalCupsInOrder > 1 ? `  (${idx + 1}/${totalCupsInOrder})` : "";
    printer.addText(`${order.id}${cupTag}\n`);
    printer.addTextStyle(false, false, false, printer.COLOR_1);
    printer.addText(`${timeStr(order.time)}  ${order.dateLabel}\n`);
    printer.addText("--------------------------------\n");

    // ── ITEM NAME — large and bold ──
    printer.addTextAlign(printer.ALIGN_CENTER);
    printer.addTextSize(2, 2);
    printer.addTextStyle(false, false, true, printer.COLOR_1);
    const name = c.item.name.length > 12 ? c.item.name.substring(0, 11) + "…" : c.item.name;
    printer.addText(`${name}\n`);
    printer.addTextSize(1, 1);
    printer.addTextStyle(false, false, false, printer.COLOR_1);

    // ── INGREDIENTS — each on its own line ──
    if (c.item.ing) {
      printer.addText("--------------------------------\n");
      printer.addTextAlign(printer.ALIGN_LEFT);
      printer.addTextStyle(false, false, true, printer.COLOR_1);
      printer.addText("INGREDIENTS:\n");
      printer.addTextStyle(false, false, false, printer.COLOR_1);
      // Split by comma and print each ingredient on its own line
      const ings = c.item.ing.split(",").map(s => s.trim()).filter(Boolean);
      ings.forEach(ing => {
        printer.addText(`  • ${ing}\n`);
      });
    }

    // ── BOOSTERS — bold ──
    if (c.boosters?.length > 0) {
      printer.addText("--------------------------------\n");
      printer.addTextAlign(printer.ALIGN_CENTER);
      printer.addTextStyle(false, false, true, printer.COLOR_1);
      printer.addText(`+ ${c.boosters.map(b => b.name).join("  +  ")}\n`);
      printer.addTextStyle(false, false, false, printer.COLOR_1);
    }

    // ── SPECIAL NOTE — big and bold ──
    if (c.note) {
      printer.addTextAlign(printer.ALIGN_CENTER);
      printer.addTextSize(1, 2);
      printer.addTextStyle(false, false, true, printer.COLOR_1);
      printer.addText(`!  ${c.note}  !\n`);
      printer.addTextSize(1, 1);
      printer.addTextStyle(false, false, false, printer.COLOR_1);
    }

    printer.addText("\n");
    printer.addCut(printer.CUT_FEED);
  });

  // ── SEPARATOR STRIP ──
  printer.addTextLang("en");
  printer.addTextAlign(printer.ALIGN_CENTER);
  printer.addTextSize(1, 1);
  printer.addTextStyle(false, false, false, printer.COLOR_1);
  printer.addText("--------------------------------\n");
  printer.addTextStyle(false, false, true, printer.COLOR_1);
  printer.addText(`ORDER COMPLETE\n`);
  printer.addTextStyle(false, false, false, printer.COLOR_1);
  printer.addText(`${order.id}  ·  ${totalCupsInOrder} cup${totalCupsInOrder !== 1 ? "s" : ""}\n`);
  printer.addText("--------------------------------\n");
  printer.addText("\n");
  printer.addCut(printer.CUT_FEED);
};

const printReceipt = (order, printerIp = PRINTER_CONFIG.ip) => {
  return new Promise((resolve, reject) => {
    try {
      if (typeof window.epson === "undefined") {
        console.warn("Epson SDK not found, falling back to browser print");
        browserPrint(order);
        resolve("browser");
        return;
      }

      const epos = new window.epson.ePOSDevice();
      const port = PRINTER_CONFIG.port;

      epos.connect(printerIp, port, (resultConnect) => {
        if (resultConnect !== "OK" && resultConnect !== "SSL_CONNECT_OK") {
          reject(`Printer connection failed: ${resultConnect}`);
          return;
        }

        epos.createDevice(
          PRINTER_CONFIG.devId,
          epos.DEVICE_TYPE_PRINTER,
          { crypto: false, buffer: false },
          (device, errorCode) => {
            if (!device) { reject(`Device error: ${errorCode}`); return; }

            const printer = device;
            printer.addTextLang("en");
            printer.addTextSmooth(true);

            // ── Print customer receipt first ──
            buildCustomerReceipt(printer, order);

            // ── Then kitchen ticket immediately after ──
            buildKitchenTicket(printer, order);

            // Send both to printer in one shot
            printer.send();

            printer.onreceive = (res) => {
              if (res.success) {
                resolve("printed");
              } else {
                reject(`Print failed: ${res.code}`);
              }
              epos.deleteDevice(device, () => {});
              epos.disconnect();
            };

            printer.onerror = (err) => {
              reject(`Printer error: ${err.status}`);
              epos.deleteDevice(device, () => {});
              epos.disconnect();
            };
          }
        );
      });
    } catch(e) {
      console.error("Print error:", e);
      browserPrint(order);
      resolve("browser");
    }
  });
};

/* ─── BROWSER PRINT FALLBACK ────────────────────────────── */
const browserPrint = (order) => {
  const win = window.open("", "_blank", "width=400,height=600");
  win.document.write(`
    <html><head><title>Receipt</title>
    <style>
      body { font-family: monospace; font-size: 12px; width: 220px; margin: 0 auto; padding: 10px; }
      .center { text-align: center; }
      .bold { font-weight: bold; }
      .big { font-size: 18px; font-weight: bold; }
      .line { border-top: 1px dashed #000; margin: 6px 0; }
      .row { display: flex; justify-content: space-between; }
      .total { font-size: 16px; font-weight: bold; }
    </style>
    </head><body onload="window.print();window.close();">
      <div class="center big">JUICEPLUS</div>
      <div class="center">Authentic · Organic · Acai</div>
      <div class="line"></div>
      <div>Order: ${order.id}</div>
      <div>Date : ${order.dateLabel}</div>
      <div>Time : ${timeStr(order.time)}</div>
      <div class="line"></div>
      <div class="bold">ITEMS</div>
      ${order.items.map(c => `
        <div class="row"><span>${c.qty}x ${c.item.name}</span><span>${fmt(c.price*c.qty)}</span></div>
        ${c.boosters?.length ? `<div style="padding-left:10px;color:#555">+ ${c.boosters.map(b=>b.name).join(", ")}</div>` : ""}
        ${c.note ? `<div style="padding-left:10px;color:#c00">* ${c.note}</div>` : ""}
      `).join("")}
      <div class="line"></div>
      <div class="row"><span>Subtotal</span><span>${fmt(order.subtotal)}</span></div>
      <div class="row"><span>Tax (8.75%)</span><span>${fmt(order.tax)}</span></div>
      ${order.surcharge>0?`<div class="row"><span>Card fee 3%</span><span>${fmt(order.surcharge)}</span></div>`:""}
      <div class="line"></div>
      <div class="row total"><span>TOTAL</span><span>${fmt(order.total)}</span></div>
      <div class="line"></div>
      <div class="center" style="margin-top:10px">Thank you!</div>
      <div class="center">Enjoy your juice :)</div>
    </body></html>
  `);
  win.document.close();
};

/* ─── BROWSER KITCHEN TICKET PREVIEW ───────────────────── */
const browserPrintKitchen = (order) => {
  // Expand items by qty — one label block per physical cup
  const cups = [];
  order.items.forEach(c => {
    for (let i = 0; i < c.qty; i++) {
      cups.push({ ...c, cupNum: i + 1, totalCups: c.qty });
    }
  });
  const totalCups = cups.length;

  const cupBlocks = cups.map((c, idx) => {
    const cupTag = totalCups > 1 ? ` (${idx+1}/${totalCups})` : "";
    const ings = (c.item.ing || "").split(",").map(s => s.trim()).filter(Boolean);
    return `
      <div class="label">
        <div class="label-header">
          <span class="order-id">${order.id}${cupTag}</span>
          <span class="time">${timeStr(order.time)}</span>
        </div>
        <div class="divider"></div>
        <div class="item-name">${c.item.name}</div>
        ${ings.length ? `
          <div class="divider"></div>
          <div class="ing-title">INGREDIENTS</div>
          <div class="ing-list">
            ${ings.map(i => `<div class="ing-row">• ${i}</div>`).join("")}
          </div>
        ` : ""}
        ${c.boosters?.length
          ? `<div class="divider"></div><div class="boosters">+ ${c.boosters.map(b=>b.name).join(" · ")}</div>`
          : ""}
        ${c.note
          ? `<div class="note">!! ${c.note} !!</div>`
          : ""}
        <div class="spacer"></div>
      </div>
    `;
  }).join(`<div class="cut">✂ ─────────────────────── ✂</div>`);

  const separator = `
    <div class="cut">✂ ─────────────────────── ✂</div>
    <div class="separator">
      <div class="sep-title">ORDER COMPLETE</div>
      <div class="sep-sub">${order.id} · ${totalCups} cup${totalCups!==1?"s":""}</div>
    </div>
    <div class="cut">✂ ─────────────────────── ✂</div>
  `;

  const win = window.open("", "_blank", "width=320,height=700");
  win.document.write(`
    <html><head><title>Kitchen Ticket — ${order.id}</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: monospace;
        background: #f5f5f5;
        padding: 16px;
      }
      h2 {
        font-size: 13px;
        color: #666;
        margin-bottom: 12px;
        text-align: center;
        letter-spacing: 1px;
      }
      .label {
        background: white;
        border: 2px solid #000;
        border-radius: 4px;
        padding: 10px 12px;
        width: 220px;
        margin: 0 auto;
      }
      .label-header {
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        font-weight: bold;
        margin-bottom: 6px;
      }
      .order-id { color: #000; }
      .time     { color: #555; }
      .divider  { border-top: 1px solid #000; margin: 6px 0; }
      .item-name {
        font-size: 22px;
        font-weight: 900;
        text-align: center;
        margin: 8px 0;
        line-height: 1.1;
      }
      .boosters {
        font-size: 12px;
        font-weight: bold;
        text-align: center;
        margin-bottom: 4px;
      }
      .ing-title {
        font-size: 10px;
        font-weight: bold;
        letter-spacing: 1px;
        color: #555;
        margin-bottom: 3px;
      }
      .ing-list {
        font-size: 11px;
        line-height: 1.6;
      }
      .ing-row {
        padding-left: 4px;
      }
      .note {
        font-size: 14px;
        font-weight: 900;
        text-align: center;
        border: 2px solid #000;
        padding: 4px;
        margin-top: 6px;
        background: #000;
        color: #fff;
      }
      .spacer { height: 8px; }
      .cut {
        text-align: center;
        font-size: 11px;
        color: #999;
        margin: 6px 0;
        letter-spacing: 1px;
      }
      .separator {
        width: 220px;
        margin: 0 auto;
        border: 1px dashed #000;
        padding: 8px;
        text-align: center;
      }
      .sep-title {
        font-size: 13px;
        font-weight: 900;
        letter-spacing: 2px;
      }
      .sep-sub {
        font-size: 11px;
        color: #555;
        margin-top: 3px;
      }
      @media print {
        body { background: white; padding: 0; }
        h2 { display: none; }
      }
    </style>
    </head>
    <body>
      <h2>🍽 KITCHEN TICKET PREVIEW — ${order.id}</h2>
      ${cupBlocks}
      ${separator}
      <div style="text-align:center;margin-top:16px">
        <button onclick="window.print()" style="padding:8px 20px;font-size:13px;cursor:pointer">🖨️ Print</button>
        <button onclick="window.close()" style="padding:8px 20px;font-size:13px;cursor:pointer;margin-left:8px">Close</button>
      </div>
    </body></html>
  `);
  win.document.close();
};

/* ─── MAIN APP ──────────────────────────────────────────── */
let offlineQueue = [];

export default function App() {
  const [screen,       setScreen]       = useState("pos");
  const [activeCat,    setActiveCat]    = useState("smoothies");
  const [cart,         setCart]         = useState([]);
  const [modal,        setModal]        = useState(null);
  const [selBoosters,  setSelBoosters]  = useState([]);
  const [selNote,      setSelNote]      = useState("");
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
  const [printStatus,  setPrintStatus]  = useState(null); // null | "printing" | "ok" | "error"
  const [printerIp,    setPrinterIp]    = useState(PRINTER_CONFIG.ip);
  const [showSettings,   setShowSettings]   = useState(false);
  const [paymentMethod,  setPaymentMethod]  = useState("cash"); // "cash" | "card"
  const [vp,             setVp]             = useState({w:window.innerWidth,h:window.innerHeight});

  // ── Customer state ──
  const [showCustModal,  setShowCustModal]  = useState(false);
  const [custPhone,      setCustPhone]      = useState("");
  const [custFound,      setCustFound]      = useState(null);
  const [custSearching,  setCustSearching]  = useState(false);
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [customers,      setCustomers]      = useState([]);
  const [custSearch,     setCustSearch]     = useState("");
  const [editCust,       setEditCust]       = useState(null);
  const [custLoading,    setCustLoading]    = useState(false);

  const SURCHARGE_RATE = 0.03; // 3% card surcharge

  useEffect(()=>{const fn=()=>setVp({w:window.innerWidth,h:window.innerHeight});window.addEventListener("resize",fn);return()=>window.removeEventListener("resize",fn);},[]);
  useEffect(()=>{const t=setInterval(()=>setClock(new Date()),1000);return()=>clearInterval(t);},[]);
  useEffect(()=>{
    const on=()=>{setOnline(true);flushQueue();};
    const off=()=>setOnline(false);
    window.addEventListener("online",on);window.addEventListener("offline",off);
    return()=>{window.removeEventListener("online",on);window.removeEventListener("offline",off);};
  },[]);
  useEffect(()=>{loadData();loadCustomers();},[]);

  const loadData = async()=>{
    setLoading(true);
    try{
      const{data}=await supabase.from("transactions").select("*").order("created_at",{ascending:false});
      if(data?.length){setTransactions(data);setOrderNum(Math.max(...data.map(t=>t.num||1000))+1);}
    }catch(e){console.error(e);}
    setLoading(false);
  };

  const pushSupabase=async order=>{
    try{await supabase.from("transactions").insert([{id:order.id,num:order.num,items:order.items,subtotal:order.subtotal,tax:order.tax,total:order.total,time:order.time,date_label:order.dateLabel}]);}
    catch(e){console.error(e);}
  };
  const flushQueue=async()=>{while(offlineQueue.length)await pushSupabase(offlineQueue.shift());};

  /* ── Customer DB functions — via Edge Function (AES-256-GCM encrypted) ── */
  const VAULT_URL = `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/customer-vault`;
  const VAULT_HEADERS = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
  };

  const vaultCall = async (body) => {
    const res = await fetch(VAULT_URL, {
      method: "POST",
      headers: VAULT_HEADERS,
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Vault error: ${res.status}`);
    return res.json();
  };

  const loadCustomers = async () => {
    setCustLoading(true);
    try {
      const { customers: data } = await vaultCall({ action: "list" });
      if (data) setCustomers(data);
    } catch(e) { console.error(e); }
    setCustLoading(false);
  };

  const lookupByPhone = async (phone) => {
    const clean = phone.replace(/\D/g, "");
    if (clean.length < 7) return;
    setCustSearching(true);
    try {
      const { customer } = await vaultCall({ action: "lookup", phone: clean });
      setCustFound(customer || null);
    } catch(e) { setCustFound(null); }
    setCustSearching(false);
  };

  const saveCustomer = async (cust) => {
    try {
      const { customer } = await vaultCall({
        action: "upsert",
        id:        cust.id || undefined,
        phone:     cust.phone,
        name:      cust.name,
        email:     cust.email,
        allergies: cust.allergies,
        favorites: cust.favorites || [],
      });
      if (customer) {
        setCustomers(prev => cust.id
          ? prev.map(c => c.id === cust.id ? customer : c)
          : [customer, ...prev]
        );
      }
      return customer;
    } catch(e) { console.error(e); return null; }
  };

  const updateCustomerStats = async (customerId, orderTotal, orderItems) => {
    try {
      await vaultCall({ action: "updateStats", id: customerId, orderTotal, orderItems });
    } catch(e) { console.error(e); }
  };

  const attachCustomer = (cust) => {
    setActiveCustomer(cust);
    setShowCustModal(false);
    setCustPhone("");
    setCustFound(null);
    toast$(`👤 ${cust.name} attached to order`, "ok");
  };

  const detachCustomer = () => {
    setActiveCustomer(null);
    toast$("Customer removed from order", "ok");
  };

  const toast$=(msg,type="ok")=>{setToast({msg,type});setTimeout(()=>setToast(null),2500);};

  /* ── Cart ── */
  const addToCart=(item,boosters,note)=>{
    const catKey=activeCat;
    const price=(item.price??MENU[catKey].basePrice)+boosters.length;
    // note makes it a unique cart line even if same item+boosters
    const key=item.id+"|"+boosters.map(b=>b.id).join(",")+"|"+(note||"");
    setCart(prev=>{const ex=prev.find(c=>c.key===key);if(ex)return prev.map(c=>c.key===key?{...c,qty:c.qty+1}:c);return[...prev,{key,item,boosters,note:note||"",price,qty:1,catKey}];});
    setModal(null);setSelBoosters([]);setSelNote("");
    toast$(`✓ ${item.name} added`);
  };
  const updateQty=(key,d)=>setCart(prev=>prev.map(c=>c.key===key?{...c,qty:Math.max(0,c.qty+d)}:c).filter(c=>c.qty>0));

  const subtotal   = cart.reduce((s,c)=>s+c.price*c.qty, 0);
  const tax        = subtotal * 0.0875;
  const preTax     = subtotal + tax;
  const surcharge  = paymentMethod === "card" ? preTax * SURCHARGE_RATE : 0;
  const total      = preTax + surcharge;
  const cartCount  = cart.reduce((s,c)=>s+c.qty, 0);

  /* ── Place order + auto print ── */
  const placeOrder=async()=>{
    if(!cart.length)return;
    setSaving(true);
    const order={
      id:`ORD-${orderNum}`,num:orderNum,items:[...cart],
      subtotal,tax,surcharge,total,
      paymentMethod,
      time:new Date().toISOString(),dateLabel:todayStr(),
    };
    // Save to Supabase
    if(online)await pushSupabase(order);
    else offlineQueue.push(order);
    setTransactions(prev=>[{...order,date_label:order.dateLabel},...prev]);
    setOrderNum(n=>n+1);
    setLastOrder(order);
    setCart([]);
    setPaymentMethod("cash"); // reset to cash for next order
    // Update customer stats if one is attached
    if (activeCustomer) {
      await updateCustomerStats(activeCustomer.id, total, cart);
      setActiveCustomer(null);
    }
    setSaving(false);
    setScreen("receipt");
    // Auto print
    setPrintStatus("printing");
    toast$("🖨️ Printing receipt...", "print");
    try{
      const result=await printReceipt(order,printerIp);
      setPrintStatus("ok");
      toast$(result==="browser"?"🖨️ Browser print opened":"✅ Receipt printed!","ok");
    }catch(err){
      setPrintStatus("error");
      toast$(`⚠️ Print failed — tap reprint`,"warn");
      console.error(err);
    }
  };

  const reprintOrder=async(order)=>{
    setPrintStatus("printing");
    toast$("🖨️ Reprinting...","print");
    try{
      await printReceipt(order,printerIp);
      setPrintStatus("ok");
      toast$("✅ Reprinted!","ok");
    }catch(err){
      setPrintStatus("error");
      toast$(`⚠️ Print failed: ${err}`,"warn");
    }
  };

  /* ── Derived ── */
  const today=todayStr();
  const todayTxns=transactions.filter(t=>(t.date_label||t.dateLabel)===today);
  const daily={
    count:todayTxns.length,
    total:todayTxns.reduce((s,t)=>s+Number(t.total),0),
    tax:todayTxns.reduce((s,t)=>s+Number(t.tax),0),
  };
  const filteredTxns=transactions.filter(t=>{
    if(!searchQ)return true;
    const q=searchQ.toLowerCase();
    return(t.id||"").toLowerCase().includes(q)||(t.date_label||t.dateLabel||"").toLowerCase().includes(q)||(t.items||[]).some(i=>i.item?.name?.toLowerCase().includes(q));
  });
  const grouped=filteredTxns.reduce((acc,t)=>{const d=t.date_label||t.dateLabel||"Unknown";(acc[d]=acc[d]||[]).push(t);return acc;},{});
  const itemCounts={};
  transactions.forEach(t=>(t.items||[]).forEach(i=>{const n=i.item?.name||"?";if(!itemCounts[n])itemCounts[n]={name:n,count:0,revenue:0};itemCounts[n].count+=i.qty||1;itemCounts[n].revenue+=(i.price||0)*(i.qty||1);}));
  const topItems=Object.values(itemCounts).sort((a,b)=>b.count-a.count).slice(0,6);

  const isTablet=vp.w>=768;
  const isDesktop=vp.w>=1100;
  const orderPanelW=isDesktop?340:isTablet?300:270;
  const cat=MENU[activeCat];
  const col=CAT_COLORS[activeCat];

  if(loading)return(
    <div style={{width:"100vw",height:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
      <div style={{fontSize:72}}>🥤</div>
      <div style={{color:C.text,fontSize:24,fontWeight:900}}>JuicePlus POS</div>
      <div style={{color:C.muted,fontSize:14}}>Connecting…</div>
    </div>
  );

  return(
    <div style={{width:"100vw",height:"100vh",background:C.bg,display:"flex",flexDirection:"column",overflow:"hidden",userSelect:"none"}}>

      {/* ══ TOP BAR ══ */}
      <div style={{height:54,background:C.surface,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 16px",flexShrink:0,borderBottom:`1px solid ${C.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <span style={{fontSize:18,fontWeight:900,color:C.accent,whiteSpace:"nowrap"}}>🥤 JuicePlus POS</span>
          {isTablet&&<>
            <div style={{width:1,height:22,background:C.border}}/>
            <span style={{fontSize:12,color:C.muted,fontVariantNumeric:"tabular-nums"}}>
              {clock.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}
              {" · "}<b style={{color:"#94A3B8"}}>{clock.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</b>
            </span>
            <StatusPill online={online}/>
            <PrintPill status={printStatus}/>
          </>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {isTablet&&(
            <div style={{background:C.bg,borderRadius:10,padding:"4px 14px",display:"flex",gap:14}}>
              <Stat label="ORDERS" value={daily.count}       color={C.yellow}/>
              <div style={{width:1,background:C.border}}/>
              <Stat label="SALES"  value={fmt(daily.total)}  color={C.green}/>
            </div>
          )}
          {/* Settings button */}
          <button onClick={()=>setShowSettings(true)}
            style={{background:C.card,border:"none",borderRadius:9,padding:"6px 12px",color:C.muted,fontWeight:700,fontSize:12,cursor:"pointer"}}>
            ⚙️ Printer
          </button>
          {["pos","history","reports","customers"].map(s=>(
            <NavBtn key={s} id={s} active={screen===s} onClick={()=>setScreen(s)}
              label={s==="pos"?"🧾 POS":s==="history"?"📜 History":s==="reports"?"📊 Reports":"👥 Customers"}/>
          ))}
        </div>
      </div>

      {/* ══ BODY ══ */}
      <div style={{flex:1,overflow:"hidden",display:"flex"}}>

        {/* ── POS ── */}
        {screen==="pos"&&(
          <>
            {/* Menu panel */}
            <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",borderRight:`1px solid ${C.border}`}}>
              {/* Category tabs */}
              <div style={{display:"flex",background:C.surface,flexShrink:0,overflowX:"auto",scrollbarWidth:"none"}}>
                {Object.entries(MENU).map(([key,c])=>{
                  const active=key===activeCat;const cc=CAT_COLORS[key];
                  return(
                    <button key={key} onClick={()=>setActiveCat(key)}
                      style={{flexShrink:0,padding:`12px ${isDesktop?"22px":"14px"}`,border:"none",borderBottom:active?`3px solid ${cc}`:"3px solid transparent",background:active?cc+"18":"transparent",color:active?cc:C.muted,fontWeight:700,fontSize:13,cursor:"pointer",whiteSpace:"nowrap"}}>
                      {c.emoji}{isTablet?` ${c.label}`:""}
                    </button>
                  );
                })}
              </div>
              {/* Header */}
              <div style={{padding:"8px 14px 4px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
                <span style={{fontSize:15,fontWeight:900,color:C.text}}>{cat.emoji} {cat.label}</span>
                <span style={{fontSize:10,color:C.muted}}>{cat.size} · from {fmt(cat.basePrice)}</span>
              </div>
              {/* Grid */}
              <div style={{flex:1,overflowY:"auto",padding:"4px 10px 10px",display:"grid",gridTemplateColumns:isDesktop?"repeat(auto-fill,minmax(200px,1fr))":isTablet?"repeat(auto-fill,minmax(170px,1fr))":"repeat(auto-fill,minmax(140px,1fr))",gap:8,alignContent:"start"}}>
                {cat.items.map(item=>(
                  <ItemCard key={item.id} item={item} cat={cat} col={col}
                    onTap={()=>{setModal({item,catKey:activeCat});setSelBoosters([]);}}/>
                ))}
              </div>
            </div>

            {/* Order panel */}
            <div style={{width:orderPanelW,display:"flex",flexDirection:"column",background:C.surface,flexShrink:0}}>
              <div style={{padding:"10px 12px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
                <span style={{fontSize:15,fontWeight:900,color:C.text}}>Order</span>
                <div style={{display:"flex",gap:6}}>
                  {cartCount>0&&<Badge val={cartCount} color={C.accent}/>}
                  {cart.length>0&&<button onClick={()=>setCart([])} style={{background:"#450A0A",border:"none",borderRadius:7,padding:"3px 8px",color:"#EF4444",fontWeight:700,fontSize:10,cursor:"pointer"}}>Clear</button>}
                </div>
              </div>
              <div style={{flex:1,overflowY:"auto",padding:"6px 8px",display:"flex",flexDirection:"column",gap:5}}>
                {cart.length===0?(
                  <div style={{textAlign:"center",paddingTop:"30%",color:C.dim}}>
                    <div style={{fontSize:36}}>🧾</div>
                    <div style={{fontSize:12,marginTop:8,fontWeight:600}}>No items yet</div>
                    <div style={{fontSize:10,marginTop:4}}>Tap menu items to add</div>
                  </div>
                ):cart.map(c=>{
                  const cc=CAT_COLORS[c.catKey];
                  return(
                    <div key={c.key} style={{background:C.bg,borderRadius:10,padding:"8px 10px",borderLeft:`3px solid ${cc}`}}>
                      <div style={{display:"flex",justifyContent:"space-between"}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:800,fontSize:12,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.item.name}</div>
                          {c.boosters.length>0&&<div style={{fontSize:10,color:cc,marginTop:1}}>+{c.boosters.map(b=>b.name).join(", ")}</div>}
                          {c.note&&<div style={{fontSize:10,color:C.yellow,marginTop:1}}>📝 {c.note}</div>}
                        </div>
                        <div style={{fontWeight:900,fontSize:12,color:cc,marginLeft:6,flexShrink:0}}>{fmt(c.price*c.qty)}</div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:6}}>
                        <QtyCtrl val={c.qty} onMinus={()=>updateQty(c.key,-1)} onPlus={()=>updateQty(c.key,+1)}/>
                        <span style={{fontSize:10,color:C.muted}}>{fmt(c.price)} ea</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{padding:"10px 12px 14px",borderTop:`1px solid ${C.border}`,background:C.bg,flexShrink:0}}>

                {/* ── Customer strip ── */}
                {activeCustomer ? (
                  <div style={{background:"#0F2A1A",border:`1px solid #22C55E44`,borderRadius:10,padding:"8px 10px",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div>
                      <div style={{fontSize:12,fontWeight:800,color:C.green}}>👤 {activeCustomer.name}</div>
                      <div style={{fontSize:10,color:C.muted,marginTop:1}}>{activeCustomer.phone} · {activeCustomer.visit_count||0} visits · {fmt(activeCustomer.total_spend||0)} spent</div>
                      {activeCustomer.allergies&&<div style={{fontSize:10,color:C.yellow,marginTop:1}}>⚠️ {activeCustomer.allergies}</div>}
                    </div>
                    <button onClick={detachCustomer} style={{background:"none",border:"none",color:C.muted,fontSize:16,cursor:"pointer"}}>✕</button>
                  </div>
                ) : (
                  <button onClick={()=>setShowCustModal(true)}
                    style={{width:"100%",background:C.surface,border:`1px dashed ${C.border}`,borderRadius:10,padding:"7px",color:C.muted,fontWeight:600,fontSize:12,cursor:"pointer",marginBottom:10}}>
                    👤 Attach Customer (optional)
                  </button>
                )}

                {/* ── Cash / Card toggle ── */}
                <div style={{display:"flex",gap:6,marginBottom:10}}>
                  {["cash","card"].map(m=>{
                    const active=paymentMethod===m;
                    const col=m==="cash"?C.green:"#60A5FA";
                    return(
                      <button key={m} onClick={()=>setPaymentMethod(m)}
                        style={{flex:1,background:active?col+"22":C.surface,border:`2px solid ${active?col:C.border}`,borderRadius:10,padding:"8px",color:active?col:C.muted,fontWeight:800,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                        {m==="cash"?"💵 Cash":"💳 Card"}
                      </button>
                    );
                  })}
                </div>

                <Row label="Subtotal"   val={fmt(subtotal)}/>
                <Row label="Tax 8.75%"  val={fmt(tax)} mt={4}/>
                {paymentMethod==="card"&&(
                  <Row label="Card fee 3%" val={fmt(surcharge)} mt={4}/>
                )}
                <div style={{display:"flex",justifyContent:"space-between",fontSize:20,fontWeight:900,margin:"10px 0 12px",paddingTop:8,borderTop:`1px solid ${C.border}`}}>
                  <span style={{color:C.text}}>TOTAL</span>
                  <span style={{color:C.accent,fontVariantNumeric:"tabular-nums"}}>{fmt(total)}</span>
                </div>
                <button onClick={placeOrder} disabled={!cart.length||saving}
                  style={{width:"100%",background:!cart.length?C.surface:saving?C.dim:paymentMethod==="card"?`linear-gradient(135deg,#3B82F6,#6366F1)`:`linear-gradient(135deg,${C.accent},${C.yellow})`,border:"none",borderRadius:12,padding:"14px",color:!cart.length?C.dim:C.text,fontWeight:900,fontSize:18,cursor:!cart.length?"not-allowed":"pointer",boxShadow:cart.length?`0 4px 20px ${paymentMethod==="card"?"#3B82F644":C.accent+"44"}`:"none"}}>
                  {saving?"💾 Saving…":!cart.length?"Add Items →":paymentMethod==="card"?`💳 CHARGE ${fmt(total)}`:`💵 CASH ${fmt(total)}`}
                </button>
                {!online&&cart.length>0&&<div style={{textAlign:"center",marginTop:6,fontSize:10,color:C.yellow}}>⚠️ Offline mode</div>}
              </div>
            </div>
          </>
        )}

        {/* ── RECEIPT ── */}
        {screen==="receipt"&&lastOrder&&(
          <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:20,overflowY:"auto"}}>
            <div style={{background:C.card,borderRadius:20,padding:28,maxWidth:480,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}>
              <div style={{textAlign:"center",marginBottom:20}}>
                <div style={{width:68,height:68,borderRadius:"50%",background:"linear-gradient(135deg,#22C55E,#16A34A)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,margin:"0 auto 10px",boxShadow:"0 0 28px rgba(34,197,94,0.4)"}}>✓</div>
                <div style={{fontSize:22,fontWeight:900,color:C.text}}>Order Complete!</div>
                <div style={{fontSize:12,color:C.muted,marginTop:4,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                  <span>{lastOrder.id} · {online?"Saved ☁️":"Queued for sync"}</span>
                  <span style={{background:lastOrder.paymentMethod==="card"?"#1E3A5F":"#064E3B",color:lastOrder.paymentMethod==="card"?"#60A5FA":C.green,borderRadius:6,padding:"2px 8px",fontWeight:700,fontSize:11}}>
                    {lastOrder.paymentMethod==="card"?"💳 Card":"💵 Cash"}
                  </span>
                </div>
              </div>

              {/* Print status */}
              <div style={{background:C.bg,borderRadius:12,padding:"10px 14px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:20}}>🖨️</span>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:C.text}}>
                      {printStatus==="printing"?"Printing receipt…":printStatus==="ok"?"Receipt printed!":printStatus==="error"?"Print failed":"Sending to printer…"}
                    </div>
                    <div style={{fontSize:10,color:C.muted,marginTop:1}}>Epson TM-T20III · {printerIp}</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:6}}>
                  {printStatus==="error"&&(
                    <button onClick={()=>reprintOrder(lastOrder)}
                      style={{background:"#78350F",border:"none",borderRadius:8,padding:"5px 10px",color:C.yellow,fontWeight:700,fontSize:11,cursor:"pointer"}}>Retry</button>
                  )}
                  <button onClick={()=>reprintOrder(lastOrder)}
                    style={{background:C.card,border:"none",borderRadius:8,padding:"5px 10px",color:C.muted,fontWeight:700,fontSize:11,cursor:"pointer"}}>🖨️ Reprint</button>
                </div>
              </div>

              <div style={{background:C.bg,borderRadius:14,padding:18,marginBottom:18}}>
                <div style={{textAlign:"center",borderBottom:`1px dashed ${C.border}`,paddingBottom:12,marginBottom:12}}>
                  <div style={{fontSize:15,fontWeight:900,color:C.text}}>🥤 JuicePlus</div>
                  <div style={{fontSize:10,color:C.muted,marginTop:2}}>{timeStr(lastOrder.time)} · {lastOrder.dateLabel}</div>
                </div>
                {lastOrder.items.map((c,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:7}}>
                    <div>
                      <div style={{fontWeight:700,color:C.text}}>{c.qty}× {c.item?.name}</div>
                      {(c.boosters||[]).length>0&&<div style={{fontSize:10,color:C.muted}}>+{c.boosters.map(b=>b.name).join(", ")}</div>}
                      {c.note&&<div style={{fontSize:10,color:C.yellow}}>📝 {c.note}</div>}
                    </div>
                    <div style={{fontWeight:800,color:C.text}}>{fmt(c.price*c.qty)}</div>
                  </div>
                ))}
                <div style={{borderTop:`1px dashed ${C.border}`,paddingTop:10,marginTop:6}}>
                  <Row label="Subtotal"  val={fmt(lastOrder.subtotal)}/>
                  <Row label="Tax"       val={fmt(lastOrder.tax)} mt={4}/>
                  {lastOrder.paymentMethod==="card"&&lastOrder.surcharge>0&&(
                    <Row label="Card fee 3%" val={fmt(lastOrder.surcharge)} mt={4}/>
                  )}
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:20,fontWeight:900,color:C.accent,marginTop:10}}><span>TOTAL</span><span>{fmt(lastOrder.total)}</span></div>
                </div>
              </div>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>browserPrint(lastOrder)}
                  style={{flex:1,background:C.card,border:"none",borderRadius:12,padding:"12px",color:C.muted,fontWeight:700,fontSize:12,cursor:"pointer"}}>
                  🧾 Receipt Preview
                </button>
                <button onClick={()=>browserPrintKitchen(lastOrder)}
                  style={{flex:1,background:C.card,border:"none",borderRadius:12,padding:"12px",color:C.muted,fontWeight:700,fontSize:12,cursor:"pointer"}}>
                  🍽️ Kitchen Preview
                </button>
                <button onClick={()=>setScreen("pos")}
                  style={{flex:2,background:`linear-gradient(135deg,${C.accent},${C.yellow})`,border:"none",borderRadius:12,padding:"12px",color:C.text,fontWeight:900,fontSize:16,cursor:"pointer",boxShadow:`0 4px 20px ${C.accent}44`}}>
                  + New Order
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── HISTORY ── */}
        {screen==="history"&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{padding:"10px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10,flexShrink:0,flexWrap:"wrap"}}>
              <SearchBox value={searchQ} onChange={setSearchQ}/>
              <button onClick={loadData} style={{background:C.card,border:"none",borderRadius:9,padding:"7px 12px",color:C.muted,fontSize:13,cursor:"pointer",fontWeight:600}}>↻</button>
              <div style={{display:"flex",gap:18,marginLeft:"auto"}}>
                <Stat label="TODAY"    value={daily.count}      color={C.yellow}/>
                <Stat label="SALES"    value={fmt(daily.total)} color={C.green}/>
                <Stat label="TAX"      value={fmt(daily.tax)}   color={C.muted}/>
                <Stat label="ALL TIME" value={transactions.length} color={C.accent}/>
              </div>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"14px 16px"}}>
              {Object.keys(grouped).length===0?<Empty icon="📭" msg="No orders found"/>
              :Object.keys(grouped).map(date=>(
                <div key={date} style={{marginBottom:22}}>
                  <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:2,marginBottom:8,display:"flex",alignItems:"center",gap:8}}>
                    {date}
                    <span style={{background:C.card,borderRadius:6,padding:"2px 8px",fontSize:10,color:C.dim,fontWeight:600}}>
                      {grouped[date].length} orders · {fmt(grouped[date].reduce((s,t)=>s+Number(t.total),0))}
                    </span>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:7}}>
                    {grouped[date].map(t=>(
                      <div key={t.id}
                        style={{background:C.card,borderRadius:11,padding:"11px 13px",cursor:"pointer",borderLeft:`3px solid ${C.accent}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}
                        onMouseEnter={e=>e.currentTarget.style.background="#1E3050"}
                        onMouseLeave={e=>e.currentTarget.style.background=C.card}>
                        <div onClick={()=>{setDetailOrder(t);setScreen("detail");}}>
                          <div style={{fontWeight:800,fontSize:13,color:C.text}}>{t.id}</div>
                          <div style={{fontSize:10,color:C.muted,marginTop:2}}>{timeStr(t.time)} · {(t.items||[]).length} items</div>
                          <div style={{fontSize:10,color:C.dim,marginTop:1}}>{(t.items||[]).slice(0,2).map(i=>i.item?.name).filter(Boolean).join(", ")}{(t.items||[]).length>2?"…":""}</div>
                        </div>
                        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                          <div style={{fontSize:15,fontWeight:900,color:C.accent,fontVariantNumeric:"tabular-nums"}}>{fmt(t.total)}</div>
                          <button onClick={()=>reprintOrder(t)}
                            style={{background:C.surface,border:"none",borderRadius:7,padding:"3px 8px",color:C.muted,fontSize:10,fontWeight:600,cursor:"pointer"}}>
                            🖨️ Reprint
                          </button>
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
        {screen==="detail"&&detailOrder&&(
          <div style={{flex:1,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:24,overflowY:"auto"}}>
            <div style={{background:C.card,borderRadius:20,padding:26,maxWidth:540,width:"100%"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
                <div style={{fontSize:20,fontWeight:900,color:C.text}}>{detailOrder.id}</div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>reprintOrder(detailOrder)}
                    style={{background:`linear-gradient(135deg,${C.accent},${C.yellow})`,border:"none",borderRadius:9,padding:"7px 14px",color:C.text,fontWeight:700,cursor:"pointer",fontSize:13}}>
                    🖨️ Print Receipt
                  </button>
                  <button onClick={()=>browserPrintKitchen(detailOrder)}
                    style={{background:C.card,border:"none",borderRadius:9,padding:"7px 14px",color:C.muted,fontWeight:700,cursor:"pointer",fontSize:13}}>
                    🍽️ Kitchen
                  </button>
                  <button onClick={()=>setScreen("history")}
                    style={{background:C.bg,border:"none",borderRadius:8,padding:"7px 14px",color:C.muted,fontWeight:700,cursor:"pointer",fontSize:13}}>← Back</button>
                </div>
              </div>
              <div style={{display:"flex",gap:10,marginBottom:18}}>
                {[{l:"Date",v:dateStr(detailOrder.time)},{l:"Time",v:timeStr(detailOrder.time)},{l:"Items",v:(detailOrder.items||[]).length}].map(x=>(
                  <div key={x.l} style={{background:C.bg,borderRadius:10,padding:"9px 14px",flex:1}}>
                    <div style={{fontSize:10,color:C.muted}}>{x.l}</div>
                    <div style={{fontSize:13,fontWeight:700,color:C.text,marginTop:2}}>{x.v}</div>
                  </div>
                ))}
              </div>
              <div style={{background:C.bg,borderRadius:12,padding:14,marginBottom:12}}>
                <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1,marginBottom:10}}>ORDER ITEMS</div>
                {(detailOrder.items||[]).map((c,i,arr)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",paddingBottom:9,marginBottom:9,borderBottom:i<arr.length-1?`1px solid ${C.border}`:"none"}}>
                    <div>
                      <div style={{fontWeight:700,fontSize:13,color:C.text}}>{c.qty}× {c.item?.name}</div>
                      {(c.boosters||[]).length>0&&<div style={{fontSize:10,color:C.accent,marginTop:1}}>+{c.boosters.map(b=>b.name).join(", ")}</div>}
                      {c.note&&<div style={{fontSize:10,color:C.yellow,marginTop:1}}>📝 {c.note}</div>}
                    </div>
                    <div style={{fontWeight:800,fontSize:13,color:C.text}}>{fmt(c.price*c.qty)}</div>
                  </div>
                ))}
              </div>
              <div style={{background:C.bg,borderRadius:12,padding:14}}>
                <Row label="Subtotal"  val={fmt(detailOrder.subtotal)}/>
                <Row label="Tax 8.75%" val={fmt(detailOrder.tax)} mt={5}/>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:20,fontWeight:900,color:C.accent,paddingTop:10,marginTop:8,borderTop:`1px solid ${C.border}`}}><span>TOTAL</span><span>{fmt(detailOrder.total)}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* ── REPORTS ── */}
        {screen==="reports"&&(
          <div style={{flex:1,overflowY:"auto",padding:18}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12,marginBottom:18}}>
              {[
                {label:"Total Revenue", value:fmt(transactions.reduce((s,t)=>s+Number(t.total),0)),color:C.accent},
                {label:"Total Orders",  value:transactions.length,color:C.yellow},
                {label:"Avg Order",     value:fmt(transactions.length?transactions.reduce((s,t)=>s+Number(t.total),0)/transactions.length:0),color:C.green},
                {label:"Today Orders",  value:daily.count,color:"#8B5CF6"},
                {label:"Today Revenue", value:fmt(daily.total),color:"#EC4899"},
                {label:"Today Tax",     value:fmt(daily.tax),color:"#10B981"},
              ].map(s=>(
                <div key={s.label} style={{background:C.card,borderRadius:14,padding:"15px 16px",borderTop:`3px solid ${s.color}`}}>
                  <div style={{fontSize:22,fontWeight:900,color:s.color,fontVariantNumeric:"tabular-nums"}}>{s.value}</div>
                  <div style={{fontSize:10,color:C.muted,marginTop:4}}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:isTablet?"1fr 1fr":"1fr",gap:14}}>
              <div style={{background:C.card,borderRadius:16,padding:18}}>
                <div style={{fontSize:13,fontWeight:800,color:C.text,marginBottom:14}}>🏆 Top Selling Items</div>
                {topItems.length===0?<div style={{color:C.dim,fontSize:12}}>No data yet</div>
                :topItems.map((item,i)=>(
                  <div key={item.name} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                    <div style={{width:24,height:24,borderRadius:6,background:[C.accent,C.yellow,"#EF4444","#8B5CF6","#10B981","#EC4899"][i],display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:10,flexShrink:0}}>#{i+1}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:700,color:C.text}}>{item.name}</div>
                      <div style={{fontSize:10,color:C.muted}}>{item.count} sold · {fmt(item.revenue)}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{background:C.card,borderRadius:16,padding:18,maxHeight:360,overflowY:"auto"}}>
                <div style={{fontSize:13,fontWeight:800,color:C.text,marginBottom:14}}>📅 Daily Breakdown</div>
                {Object.keys(grouped).length===0?<div style={{color:C.dim,fontSize:12}}>No data yet</div>
                :Object.keys(grouped).slice(0,30).map(date=>{
                  const dt=grouped[date]||[];
                  return(
                    <div key={date} style={{borderBottom:`1px solid ${C.bg}`,paddingBottom:8,marginBottom:8}}>
                      <div style={{display:"flex",justifyContent:"space-between"}}>
                        <div style={{fontSize:12,fontWeight:700,color:C.text}}>{date}</div>
                        <div style={{fontSize:13,fontWeight:900,color:C.accent,fontVariantNumeric:"tabular-nums"}}>{fmt(dt.reduce((s,t)=>s+Number(t.total),0))}</div>
                      </div>
                      <div style={{display:"flex",gap:12,marginTop:2}}>
                        <span style={{fontSize:10,color:C.muted}}>{dt.length} orders</span>
                        <span style={{fontSize:10,color:C.muted}}>Tax: {fmt(dt.reduce((s,t)=>s+Number(t.tax),0))}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {/* ── CUSTOMERS SCREEN ── */}
        {screen==="customers"&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{padding:"10px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10,flexShrink:0,flexWrap:"wrap"}}>
              <SearchBox value={custSearch} onChange={setCustSearch}/>
              <button onClick={()=>setEditCust({phone:"",name:"",email:"",allergies:"",favorites:[]})}
                style={{background:C.accent,border:"none",borderRadius:9,padding:"7px 14px",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer"}}>
                + New Customer
              </button>
              <button onClick={loadCustomers} style={{background:C.card,border:"none",borderRadius:9,padding:"7px 12px",color:C.muted,fontSize:13,cursor:"pointer",fontWeight:600}}>↻</button>
              <div style={{marginLeft:"auto",fontSize:12,color:C.muted}}>{customers.length} customers</div>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:16}}>
              {custLoading?<div style={{textAlign:"center",paddingTop:60,color:C.muted}}>Loading…</div>
              :customers.filter(c=>!custSearch||(c.name||"").toLowerCase().includes(custSearch.toLowerCase())||(c.phone||"").includes(custSearch)||(c.email||"").toLowerCase().includes(custSearch.toLowerCase())).length===0
                ?<Empty icon="👥" msg="No customers yet"/>
                :customers.filter(c=>!custSearch||(c.name||"").toLowerCase().includes(custSearch.toLowerCase())||(c.phone||"").includes(custSearch)||(c.email||"").toLowerCase().includes(custSearch.toLowerCase())).map(c=>(
                <div key={c.id} style={{background:C.card,borderRadius:14,padding:"14px 16px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"flex-start",borderLeft:`3px solid ${C.green}`}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                      <div style={{fontSize:15,fontWeight:900,color:C.text}}>{c.name||"Unknown"}</div>
                      <div style={{background:"#064E3B",borderRadius:6,padding:"2px 8px",fontSize:10,color:C.green,fontWeight:700}}>{c.visit_count||0} visits</div>
                      <div style={{background:"#1A2235",borderRadius:6,padding:"2px 8px",fontSize:10,color:C.yellow,fontWeight:700}}>{fmt(c.total_spend||0)}</div>
                    </div>
                    <div style={{fontSize:11,color:C.muted}}>{c.phone}{c.email?` · ${c.email}`:""}</div>
                    {c.allergies&&<div style={{fontSize:11,color:C.yellow,marginTop:4}}>⚠️ {c.allergies}</div>}
                    {c.favorites?.length>0&&<div style={{fontSize:10,color:C.muted,marginTop:4}}>❤️ {c.favorites.slice(0,3).map(f=>f.name).join(", ")}</div>}
                    {c.last_visit&&<div style={{fontSize:10,color:C.dim,marginTop:3}}>Last visit: {dateStr(c.last_visit)}</div>}
                  </div>
                  <button onClick={()=>setEditCust(c)}
                    style={{background:C.surface,border:"none",borderRadius:8,padding:"5px 10px",color:C.muted,fontSize:11,fontWeight:600,cursor:"pointer",flexShrink:0}}>
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ══ CUSTOMER LOOKUP MODAL (at checkout) ══ */}
      {showCustModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:150,backdropFilter:"blur(5px)"}}
          onClick={()=>{setShowCustModal(false);setCustPhone("");setCustFound(null);}}>
          <div style={{background:C.card,borderRadius:20,padding:24,width:"94%",maxWidth:420,border:`1px solid ${C.border}`}}
            onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:16,fontWeight:900,color:C.text,marginBottom:4}}>👤 Customer Lookup</div>
            <div style={{fontSize:11,color:C.muted,marginBottom:16}}>Enter phone number to find or create customer</div>

            {/* Phone input */}
            <div style={{display:"flex",gap:8,marginBottom:14}}>
              <input value={custPhone} onChange={e=>{setCustPhone(e.target.value);setCustFound(null);}}
                onKeyDown={e=>e.key==="Enter"&&lookupByPhone(custPhone)}
                placeholder="Phone number…" maxLength={15}
                style={{flex:1,background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 14px",color:C.text,fontSize:15,outline:"none"}}/>
              <button onClick={()=>lookupByPhone(custPhone)} disabled={custSearching||custPhone.replace(/\D/g,"").length<7}
                style={{background:C.accent,border:"none",borderRadius:10,padding:"10px 16px",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                {custSearching?"…":"Search"}
              </button>
            </div>

            {/* Found customer */}
            {custFound&&(
              <div style={{background:"#0F2A1A",borderRadius:12,padding:"12px 14px",marginBottom:14,border:`1px solid ${C.green}44`}}>
                <div style={{fontSize:14,fontWeight:800,color:C.green,marginBottom:4}}>✓ Customer Found</div>
                <div style={{fontSize:14,fontWeight:700,color:C.text}}>{custFound.name}</div>
                <div style={{fontSize:11,color:C.muted,marginTop:2}}>{custFound.phone}{custFound.email?` · ${custFound.email}`:""}</div>
                <div style={{fontSize:11,color:C.muted,marginTop:2}}>{custFound.visit_count||0} visits · {fmt(custFound.total_spend||0)} spent</div>
                {custFound.allergies&&<div style={{fontSize:11,color:C.yellow,marginTop:6,fontWeight:700}}>⚠️ ALLERGY: {custFound.allergies}</div>}
                {custFound.favorites?.length>0&&<div style={{fontSize:10,color:C.muted,marginTop:4}}>❤️ Favorites: {custFound.favorites.slice(0,3).map(f=>f.name).join(", ")}</div>}
                <button onClick={()=>attachCustomer(custFound)}
                  style={{width:"100%",marginTop:12,background:C.green,border:"none",borderRadius:10,padding:"10px",color:"#fff",fontWeight:900,fontSize:14,cursor:"pointer"}}>
                  ✓ Attach to Order
                </button>
              </div>
            )}

            {/* Not found — offer to create */}
            {custPhone.replace(/\D/g,"").length>=7&&custFound===null&&!custSearching&&(
              <div style={{background:C.bg,borderRadius:12,padding:"12px 14px",marginBottom:14,border:`1px dashed ${C.border}`}}>
                <div style={{fontSize:12,color:C.muted,marginBottom:8}}>No customer found for this number.</div>
                <button onClick={()=>{setShowCustModal(false);setEditCust({phone:custPhone,name:"",email:"",allergies:"",favorites:[]});}}
                  style={{width:"100%",background:C.accent,border:"none",borderRadius:10,padding:"10px",color:"#fff",fontWeight:800,fontSize:13,cursor:"pointer"}}>
                  + Create New Customer
                </button>
              </div>
            )}

            <button onClick={()=>{setShowCustModal(false);setCustPhone("");setCustFound(null);}}
              style={{width:"100%",background:C.surface,border:"none",borderRadius:10,padding:"10px",color:C.muted,fontWeight:700,fontSize:13,cursor:"pointer"}}>
              Skip
            </button>
          </div>
        </div>
      )}

      {/* ══ CUSTOMER EDIT / CREATE MODAL ══ */}
      {editCust&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:150,backdropFilter:"blur(5px)"}}
          onClick={()=>setEditCust(null)}>
          <div style={{background:C.card,borderRadius:20,padding:24,width:"94%",maxWidth:440,border:`1px solid ${C.border}`,maxHeight:"90vh",overflowY:"auto"}}
            onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:16,fontWeight:900,color:C.text,marginBottom:16}}>{editCust.id?"✏️ Edit Customer":"➕ New Customer"}</div>
            {[
              {label:"Phone *",    key:"phone",    placeholder:"e.g. 6105551234",   type:"tel"},
              {label:"Name",       key:"name",     placeholder:"Customer name",      type:"text"},
              {label:"Email",      key:"email",    placeholder:"email@example.com",  type:"email"},
              {label:"Allergies / Dietary Notes", key:"allergies", placeholder:"e.g. Dairy free, nut allergy", type:"text"},
            ].map(f=>(
              <div key={f.key} style={{marginBottom:12}}>
                <div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:5}}>{f.label}</div>
                <input value={editCust[f.key]||""} onChange={e=>setEditCust(prev=>({...prev,[f.key]:e.target.value}))}
                  placeholder={f.placeholder} type={f.type}
                  style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 14px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>
            ))}
            <div style={{display:"flex",gap:8,marginTop:8}}>
              <button onClick={()=>setEditCust(null)}
                style={{flex:1,background:C.bg,border:"none",borderRadius:11,padding:"12px",color:C.muted,fontWeight:700,fontSize:13,cursor:"pointer"}}>Cancel</button>
              <button onClick={async()=>{
                  const saved=await saveCustomer(editCust);
                  if(saved){
                    toast$(`✅ ${saved.name||"Customer"} saved`);
                    // If we came from checkout lookup, attach immediately
                    if(showCustModal||!screen==="customers") attachCustomer(saved);
                    setEditCust(null);
                  }
                }}
                disabled={!editCust.phone}
                style={{flex:2,background:C.accent,border:"none",borderRadius:11,padding:"12px",color:"#fff",fontWeight:900,fontSize:14,cursor:"pointer"}}>
                {editCust.id?"Save Changes":"Create Customer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ BOOSTER MODAL ══ */}
      {modal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.78)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,backdropFilter:"blur(5px)"}}
          onClick={()=>{setModal(null);setSelBoosters([]);setSelNote("");}}>
          <div style={{background:C.card,borderRadius:20,padding:24,width:"94%",maxWidth:440,border:`2px solid ${CAT_COLORS[modal.catKey]}`,boxShadow:"0 20px 60px rgba(0,0,0,0.5)",maxHeight:"90vh",overflowY:"auto"}}
            onClick={e=>e.stopPropagation()}>

            {/* Item header */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
              <div>
                <div style={{fontSize:18,fontWeight:900,color:C.text}}>{modal.item.name}</div>
                <div style={{fontSize:11,color:C.muted,marginTop:3,maxWidth:300}}>{modal.item.ing}</div>
                <div style={{display:"flex",gap:7,marginTop:8}}>
                  <PricePill val={MENU[modal.catKey].size}                             color={CAT_COLORS[modal.catKey]}/>
                  <PricePill val={fmt(modal.item.price??MENU[modal.catKey].basePrice)} color={CAT_COLORS[modal.catKey]}/>
                </div>
              </div>
              <button onClick={()=>{setModal(null);setSelBoosters([]);setSelNote("");}}
                style={{background:C.bg,border:"none",borderRadius:8,width:30,height:30,color:C.muted,cursor:"pointer",fontSize:16,flexShrink:0}}>✕</button>
            </div>

            {/* Boosters */}
            <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1,marginBottom:8}}>ADD BOOSTERS (+$1.00 EACH)</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:16}}>
              {BOOSTERS.map(b=>{
                const on=!!selBoosters.find(x=>x.id===b.id);
                const cc=CAT_COLORS[modal.catKey];
                return(
                  <div key={b.id} onClick={()=>setSelBoosters(prev=>on?prev.filter(x=>x.id!==b.id):[...prev,b])}
                    style={{background:on?cc+"20":C.bg,border:`2px solid ${on?cc:C.border}`,borderRadius:11,padding:"10px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:9}}>
                    <span style={{fontSize:20}}>{b.icon}</span>
                    <div style={{flex:1,fontWeight:700,fontSize:13,color:C.text}}>{b.name}</div>
                    <div style={{width:21,height:21,borderRadius:6,background:on?cc:C.surface,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:12}}>{on?"✓":"+"}</div>
                  </div>
                );
              })}
            </div>

            {/* Special instructions */}
            <div style={{marginBottom:16}}>
              <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1,marginBottom:7,display:"flex",alignItems:"center",gap:6}}>
                <span>📝</span> SPECIAL INSTRUCTIONS <span style={{color:C.dim,fontWeight:400,textTransform:"none",letterSpacing:0}}>(prints on kitchen ticket)</span>
              </div>
              <input
                value={selNote}
                onChange={e=>setSelNote(e.target.value)}
                placeholder="e.g. No ice, extra thick, allergy note…"
                maxLength={60}
                style={{width:"100%",background:C.bg,border:`1px solid ${selNote?CAT_COLORS[modal.catKey]:C.border}`,borderRadius:10,padding:"10px 14px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"}}
              />
              {selNote&&<div style={{fontSize:10,color:CAT_COLORS[modal.catKey],marginTop:4}}>⚠️ Will print large on kitchen ticket</div>}
            </div>

            {/* Action buttons */}
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{setModal(null);setSelBoosters([]);setSelNote("");}}
                style={{flex:1,background:C.bg,border:"none",borderRadius:11,padding:"12px",color:C.muted,fontWeight:700,fontSize:13,cursor:"pointer"}}>Cancel</button>
              <button onClick={()=>addToCart(modal.item,selBoosters,selNote)}
                style={{flex:2,background:CAT_COLORS[modal.catKey],border:"none",borderRadius:11,padding:"12px",color:"#fff",fontWeight:900,fontSize:15,cursor:"pointer",boxShadow:`0 4px 16px ${CAT_COLORS[modal.catKey]}44`}}>
                Add — {fmt((modal.item.price??MENU[modal.catKey].basePrice)+selBoosters.length)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ PRINTER SETTINGS MODAL ══ */}
      {showSettings&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,backdropFilter:"blur(5px)"}}
          onClick={()=>setShowSettings(false)}>
          <div style={{background:C.card,borderRadius:20,padding:26,width:"94%",maxWidth:420,border:`1px solid ${C.border}`}}
            onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:18,fontWeight:900,color:C.text,marginBottom:4}}>⚙️ Printer Settings</div>
            <div style={{fontSize:12,color:C.muted,marginBottom:18}}>Epson TM-T20III · 58mm · ePOS SDK</div>

            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:700,color:C.muted,marginBottom:6}}>PRINTER IP ADDRESS</div>
              <input value={printerIp} onChange={e=>setPrinterIp(e.target.value)}
                placeholder="192.168.1.100"
                style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 14px",color:C.text,fontSize:14,outline:"none",boxSizing:"border-box"}}/>
              <div style={{fontSize:10,color:C.muted,marginTop:6}}>
                💡 Find IP: Hold FEED button while powering on printer. IP prints on receipt.
              </div>
            </div>

            <div style={{background:C.bg,borderRadius:12,padding:14,marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:700,color:C.muted,marginBottom:8}}>SETUP CHECKLIST</div>
              {[
                "Ethernet cable from printer to router",
                "Printer powered on and online",
                "Android tablet on same WiFi network",
                "Epson ePOS SDK loaded (auto)",
                "Cash drawer connected to printer",
              ].map((step,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <div style={{width:18,height:18,borderRadius:"50%",background:C.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:C.muted,flexShrink:0}}>{i+1}</div>
                  <div style={{fontSize:11,color:C.muted}}>{step}</div>
                </div>
              ))}
            </div>

            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setShowSettings(false)}
                style={{flex:1,background:C.bg,border:"none",borderRadius:11,padding:"12px",color:C.muted,fontWeight:700,fontSize:13,cursor:"pointer"}}>Cancel</button>
              <button onClick={()=>{setShowSettings(false);toast$(`✅ Printer IP saved: ${printerIp}`);}}
                style={{flex:2,background:C.accent,border:"none",borderRadius:11,padding:"12px",color:"#fff",fontWeight:900,fontSize:14,cursor:"pointer"}}>
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ TOAST ══ */}
      {toast&&(
        <div style={{position:"fixed",bottom:18,left:"50%",transform:"translateX(-50%)",
          background:toast.type==="warn"?"#78350F":toast.type==="print"?"#1E3A5F":"#064E3B",
          color:"#fff",padding:"11px 22px",borderRadius:12,fontSize:13,fontWeight:700,
          boxShadow:"0 4px 24px rgba(0,0,0,0.4)",zIndex:300,whiteSpace:"nowrap"}}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ─── SMALL COMPONENTS ──────────────────────────────────── */
function ItemCard({item,cat,col,onTap}){
  const[hov,setHov]=useState(false);
  return(
    <div onClick={onTap} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:hov?"#1E3050":C.card,borderRadius:13,padding:"12px",cursor:"pointer",border:`1px solid ${hov?col:C.border}`,display:"flex",flexDirection:"column",gap:5,transition:"all 0.12s"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:20}}>{cat.emoji}</span>
        <span style={{fontWeight:900,fontSize:14,color:col}}>{fmt(item.price??cat.basePrice)}</span>
      </div>
      <div style={{fontWeight:800,fontSize:12,color:C.text,lineHeight:1.2}}>{item.name}</div>
      <div style={{fontSize:10,color:C.muted,lineHeight:1.4,flex:1}}>{item.ing}</div>
      <div style={{background:hov?col:col+"88",borderRadius:7,padding:"5px",textAlign:"center",color:"#fff",fontWeight:800,fontSize:10,marginTop:2,transition:"background 0.12s"}}>TAP TO ADD</div>
    </div>
  );
}
function QtyCtrl({val,onMinus,onPlus}){
  return(
    <div style={{display:"flex",alignItems:"center",background:C.surface,borderRadius:8,overflow:"hidden"}}>
      <button onClick={onMinus} style={{background:"none",border:"none",padding:"3px 10px",fontSize:14,cursor:"pointer",color:"#94A3B8",fontWeight:700}}>−</button>
      <span style={{fontSize:12,fontWeight:800,color:C.text,minWidth:18,textAlign:"center"}}>{val}</span>
      <button onClick={onPlus}  style={{background:"none",border:"none",padding:"3px 10px",fontSize:14,cursor:"pointer",color:"#94A3B8",fontWeight:700}}>+</button>
    </div>
  );
}
function Row({label,val,mt=3}){return(<div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.muted,marginTop:mt}}><span>{label}</span><span>{val}</span></div>);}
function Stat({label,value,color}){return(<div style={{textAlign:"center"}}><div style={{fontSize:14,fontWeight:900,color,fontVariantNumeric:"tabular-nums"}}>{value}</div><div style={{fontSize:9,color:C.muted}}>{label}</div></div>);}
function NavBtn({label,active,onClick}){return(<button onClick={onClick} style={{background:active?"#FF6B35":C.surface,border:"none",borderRadius:9,padding:"6px 14px",color:active?"#fff":C.muted,fontWeight:700,fontSize:12,cursor:"pointer",whiteSpace:"nowrap"}}>{label}</button>);}
function StatusPill({online}){return(<div style={{display:"flex",alignItems:"center",gap:5,background:online?"#064E3B":"#450A0A",borderRadius:8,padding:"3px 9px"}}><div style={{width:6,height:6,borderRadius:"50%",background:online?"#22C55E":"#EF4444"}}/><span style={{fontSize:10,fontWeight:700,color:online?"#22C55E":"#EF4444"}}>{online?"ONLINE":"OFFLINE"}</span></div>);}
function PrintPill({status}){
  const cfg={printing:{bg:"#1E3A5F",color:"#60A5FA",label:"🖨️ Printing…"},ok:{bg:"#064E3B",color:"#22C55E",label:"✅ Printed"},error:{bg:"#450A0A",color:"#EF4444",label:"⚠️ Print Error"}};
  if(!status||!cfg[status])return null;
  const s=cfg[status];
  return(<div style={{background:s.bg,borderRadius:8,padding:"3px 9px"}}><span style={{fontSize:10,fontWeight:700,color:s.color}}>{s.label}</span></div>);
}
function Badge({val,color}){return(<div style={{background:color,borderRadius:8,padding:"2px 7px",fontSize:10,fontWeight:800,color:"#fff"}}>{val}</div>);}
function PricePill({val,color}){return(<span style={{background:color+"22",borderRadius:7,padding:"3px 10px",fontSize:11,color,fontWeight:700}}>{val}</span>);}
function SearchBox({value,onChange}){return(<div style={{background:C.card,borderRadius:10,padding:"7px 13px",display:"flex",alignItems:"center",gap:8,flex:"1 1 200px",maxWidth:380}}><span>🔍</span><input value={value} onChange={e=>onChange(e.target.value)} placeholder="Search by item, date, order ID..." style={{background:"none",border:"none",outline:"none",color:C.text,fontSize:12,flex:1,minWidth:0}}/>{value&&<span onClick={()=>onChange("")} style={{color:C.muted,cursor:"pointer"}}>✕</span>}</div>);}
function Empty({icon,msg}){return(<div style={{textAlign:"center",paddingTop:80}}><div style={{fontSize:52}}>{icon}</div><div style={{fontSize:15,color:C.dim,fontWeight:700,marginTop:12}}>{msg}</div></div>);}
