import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ── SUPABASE ─────────────────────────────────────────────
const supabase = createClient(
  "https://qykjkxqbwievidodsnmz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5a2preHFid2lldmlkb2Rzbm16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMjkyNTgsImV4cCI6MjA4ODkwNTI1OH0.ubB5FxnJbiXBcIFnlhoKRntvHvjuF-cKnRpumjYN8k8"
);

// ── COLORS ───────────────────────────────────────────────
const COLORS = {
  smoothies: { bg: "#FF6B35", dark: "#CC4400" },
  protein:   { bg: "#E8A020", dark: "#B87800" },
  leanmass:  { bg: "#E53E3E", dark: "#B52B2B" },
  power:     { bg: "#805AD5", dark: "#5A3F99" },
  acai:      { bg: "#2D9E6B", dark: "#1A7A50" },
  pitaya:    { bg: "#D63384", dark: "#A0246A" },
};

// ── MENU DATA ─────────────────────────────────────────────
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
    label:"Protein", emoji:"💪", size:"32 oz", basePrice:6.99,
    items:[
      {id:"p8", name:"Original",        ing:"Cranberry, Banana, Strawberry Banana Juice"},
      {id:"p9", name:"Skim Milk",        ing:"Strawberry, Banana, SB Juice, Skim Milk"},
      {id:"p10",name:"PB Blast",         ing:"Peanut Butter, Banana"},
      {id:"p11",name:"Green Tea",        ing:"Organic Green Tea, Banana, Roasted Almonds, Skim Milk"},
      {id:"p12",name:"Red Velvet",       ing:"Raspberry, Strawberry, Cranberry, Banana, Red Velvet Frappe"},
      {id:"p14",name:"Pina Colada",      ing:"Pineapple, Coconut, Banana, Coconut Juice"},
      {id:"p15",name:"Ice Frappe Dream", ing:"Banana, Skim Milk, Mocha/Caramel/Vanilla/Cookies-N-Cream"},
      {id:"p16",name:"Oreo Cookie",      ing:"Oreo Cookies, Banana, Skim Milk"},
    ]
  },
  leanmass: {
    label:"Lean Mass", emoji:"🏋️", size:"32 oz", basePrice:6.99,
    items:[
      {id:"l17",name:"Tropical Gorilla", ing:"Strawberry, Banana, SB Juice, Lean Mass Gainer"},
      {id:"l18",name:"Peanut Butter",    ing:"Peanut Butter, Banana, Skim Milk, Lean Mass Gainer"},
      {id:"l19",name:"Honey Almond",     ing:"Honey, Almonds, Banana, Skim Milk, Lean Mass Gainer"},
    ]
  },
  power: {
    label:"Power", emoji:"⚡", size:"24 oz", basePrice:8.49,
    items:[
      {id:"pw20",name:"Pre-Workout",    ing:"Strawberry, Blueberry, Banana, SB Juice, Energy Booster"},
      {id:"pw21",name:"Weight Control", ing:"Blackberry, Mango, Banana, Black Currant Juice, Lecithin"},
      {id:"pw22",name:"Ginseng",        ing:"Strawberry, Pineapple, Banana, Ginseng, Pineapple Juice"},
    ]
  },
  acai: {
    label:"Açaí", emoji:"🫐", size:"varies", basePrice:8.49,
    items:[
      {id:"a1",name:"Açaí Protein",   ing:"Sambazon Açaí, Banana, 30g protein, açaí juice",        price:8.49},
      {id:"a2",name:"Energy Pre-W",   ing:"Sambazon Açaí, Banana, Lecithin, açaí juice",           price:8.49},
      {id:"a3",name:"Vitamin C",      ing:"Sambazon Açaí, Banana, Vitamin C (1000mg)",             price:8.49},
      {id:"a4",name:"Lo-Carb Met-Rx", ing:"Sambazon Açaí, Banana, 46g low carb protein",          price:8.99},
      {id:"a5",name:"Lean Mass",      ing:"Sambazon Açaí, Banana, 52g mass gainer",               price:8.99},
      {id:"a6",name:"Fiber Rich",     ing:"Sambazon Açaí, Banana, Papaya, Blackberry, Raspberry", price:8.99},
      {id:"a7",name:"Açaí Bowl 🥣",  ing:"Thick blend w/ blackberries, PB, protein. Granola, banana, coconut", price:11.99},
    ]
  },
  pitaya: {
    label:"Pitaya", emoji:"🐉", size:"varies", basePrice:8.99,
    items:[
      {id:"pit1",name:"Pitaya Shake", ing:"Dragon Fruit · High fiber · Magnesium · Iron · B12 · Vit C", price:8.99},
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

const fmt      = (n) => `$${Number(n).toFixed(2)}`;
const timeStr  = (d) => new Date(d).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"});
const dateStr  = (d) => new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
const todayStr = ()  => new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});

// ── MAIN APP ─────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]             = useState("home");
  const [activeCat, setActiveCat]       = useState("smoothies");
  const [selectedItem, setSelectedItem] = useState(null);
  const [selBoosters, setSelBoosters]   = useState([]);
  const [cart, setCart]                 = useState([]);
  const [orderNum, setOrderNum]         = useState(1001);
  const [lastOrder, setLastOrder]       = useState(null);
  const [toast, setToast]               = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [searchQ, setSearchQ]           = useState("");
  const [detailOrder, setDetailOrder]   = useState(null);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);

  // ── Load transactions from Supabase ──
  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        setTransactions(data);
        if (data.length > 0) {
          const maxNum = Math.max(...data.map(t => t.num || 1000));
          setOrderNum(maxNum + 1);
        }
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const saveTransaction = async (order) => {
    setSaving(true);
    try {
      const { error } = await supabase.from("transactions").insert([{
        id:         order.id,
        num:        order.num,
        items:      order.items,
        subtotal:   order.subtotal,
        tax:        order.tax,
        total:      order.total,
        time:       order.time,
        date_label: order.dateLabel,
      }]);
      if (error) console.error("Save error:", error);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null), 1800); };

  const cat = MENU[activeCat];
  const col = COLORS[activeCat];

  const addToCart = (item, boosters) => {
    const price = (item.price ?? cat.basePrice) + boosters.length;
    const key   = item.id + "|" + boosters.map(b=>b.id).join(",");
    setCart(prev => {
      const ex = prev.find(c=>c.key===key);
      if (ex) return prev.map(c=>c.key===key?{...c,qty:c.qty+1}:c);
      return [...prev,{key,item,boosters,price,qty:1,catKey:activeCat}];
    });
    showToast(`${item.name} added! 🎉`);
    setScreen("menu");
  };

  const updateQty = (key,d) => setCart(prev=>
    prev.map(c=>c.key===key?{...c,qty:Math.max(0,c.qty+d)}:c).filter(c=>c.qty>0)
  );

  const subtotal  = cart.reduce((s,c)=>s+c.price*c.qty, 0);
  const tax       = subtotal*0.0875;
  const total     = subtotal+tax;
  const cartCount = cart.reduce((s,c)=>s+c.qty, 0);

  const placeOrder = async () => {
    const order = {
      id:`ORD-${orderNum}`, num:orderNum,
      items:[...cart], subtotal, tax, total,
      time:new Date().toISOString(),
      dateLabel:todayStr(),
    };
    await saveTransaction(order);
    setTransactions(prev=>[{...order, date_label:order.dateLabel}, ...prev]);
    setOrderNum(n=>n+1);
    setLastOrder(order);
    setCart([]);
    setScreen("receipt");
  };

  // ── Daily stats ──
  const today = todayStr();
  const todayTxns = transactions.filter(t=>(t.date_label||t.dateLabel)===today);
  const daily = {
    count:    todayTxns.length,
    total:    todayTxns.reduce((s,t)=>s+Number(t.total),0),
    subtotal: todayTxns.reduce((s,t)=>s+Number(t.subtotal),0),
    tax:      todayTxns.reduce((s,t)=>s+Number(t.tax),0),
  };

  // ── Search ──
  const filteredTxns = transactions.filter(t => {
    if (!searchQ) return true;
    const q = searchQ.toLowerCase();
    const items = t.items || [];
    return (
      (t.id||"").toLowerCase().includes(q) ||
      (t.date_label||t.dateLabel||"").toLowerCase().includes(q) ||
      items.some(i=>i.item?.name?.toLowerCase().includes(q))
    );
  });

  // ── Group by date ──
  const grouped = filteredTxns.reduce((acc,t)=>{
    const d = t.date_label || t.dateLabel || "Unknown";
    if (!acc[d]) acc[d]=[];
    acc[d].push(t);
    return acc;
  },{});

  if (loading) return (
    <div style={{...S.frame,display:"flex",alignItems:"center",justifyContent:"center",background:"#0F172A"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:56}}>🥤</div>
        <div style={{color:"#fff",marginTop:12,fontWeight:700,fontSize:16}}>Loading...</div>
        <div style={{color:"#475569",marginTop:4,fontSize:12}}>Connecting to database</div>
      </div>
    </div>
  );

  return (
    <div style={S.frame}>
      <div style={S.status}>
        <span style={{fontSize:12,fontWeight:700}}>9:41</span>
        <span style={{fontSize:11}}>{saving?"💾 Saving...":"●●● 🔋"}</span>
      </div>

      <div style={S.body}>
        {screen==="home"    && <HomeScreen    setScreen={setScreen} setActiveCat={setActiveCat} daily={daily} txnCount={transactions.length} />}
        {screen==="menu"    && <MenuScreen    cat={cat} col={col} activeCat={activeCat} setActiveCat={setActiveCat} setSelectedItem={setSelectedItem} setSelBoosters={setSelBoosters} setScreen={setScreen} cartCount={cartCount} />}
        {screen==="item"    && <ItemScreen    item={selectedItem} cat={cat} col={col} selBoosters={selBoosters} setSelBoosters={setSelBoosters} addToCart={addToCart} setScreen={setScreen} />}
        {screen==="cart"    && <CartScreen    cart={cart} subtotal={subtotal} tax={tax} total={total} updateQty={updateQty} setScreen={setScreen} placeOrder={placeOrder} saving={saving} />}
        {screen==="receipt" && <ReceiptScreen order={lastOrder} setScreen={setScreen} />}
        {screen==="history" && <HistoryScreen grouped={grouped} searchQ={searchQ} setSearchQ={setSearchQ} setDetailOrder={setDetailOrder} setScreen={setScreen} daily={daily} total={transactions.length} onRefresh={loadTransactions} />}
        {screen==="detail"  && <DetailScreen  order={detailOrder} setScreen={setScreen} />}
        {screen==="reports" && <ReportsScreen transactions={transactions} setScreen={setScreen} grouped={grouped} />}
      </div>

      {["menu","cart","history","reports"].includes(screen) && (
        <div style={S.nav}>
          <NavBtn icon="🏠" label="Home"    active={false}              onTap={()=>setScreen("home")} />
          <NavBtn icon="📋" label="Menu"    active={screen==="menu"}    onTap={()=>setScreen("menu")} />
          <NavBtn icon="🛒" label="Cart"    active={screen==="cart"}    onTap={()=>setScreen("cart")} badge={cartCount} />
          <NavBtn icon="📜" label="History" active={screen==="history"} onTap={()=>setScreen("history")} />
          <NavBtn icon="📊" label="Reports" active={screen==="reports"} onTap={()=>setScreen("reports")} />
        </div>
      )}

      {toast && <div style={S.toast}>{toast}</div>}
    </div>
  );
}

// ── HOME ─────────────────────────────────────────────────
function HomeScreen({ setScreen, setActiveCat, daily, txnCount }) {
  return (
    <div style={{...S.screen,background:"#0F172A",overflowY:"auto"}}>
      <div style={{background:"linear-gradient(135deg,#FF6B35,#E8A020)",padding:"24px 18px 20px",borderRadius:"0 0 24px 24px",marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.7)",letterSpacing:3}}>WELCOME TO</div>
        <div style={{fontSize:28,fontWeight:900,color:"#fff",lineHeight:1.1,marginTop:2}}>JuicePlus 🥤</div>
        <div style={{fontSize:12,color:"rgba(255,255,255,0.8)",marginTop:4}}>authentic · organic · açaí</div>
        <div style={{marginTop:14,background:"rgba(0,0,0,0.15)",borderRadius:14,padding:"12px 14px",display:"flex",justifyContent:"space-around"}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:22,fontWeight:900,color:"#fff"}}>{daily.count}</div>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.75)",marginTop:2}}>TODAY ORDERS</div>
          </div>
          <div style={{width:1,background:"rgba(255,255,255,0.25)"}}/>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:22,fontWeight:900,color:"#fff"}}>{fmt(daily.total)}</div>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.75)",marginTop:2}}>TODAY SALES</div>
          </div>
          <div style={{width:1,background:"rgba(255,255,255,0.25)"}}/>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:22,fontWeight:900,color:"#fff"}}>{txnCount}</div>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.75)",marginTop:2}}>ALL TIME</div>
          </div>
        </div>
        <button onClick={()=>setScreen("menu")} style={{marginTop:14,width:"100%",background:"rgba(255,255,255,0.2)",border:"2px solid rgba(255,255,255,0.4)",borderRadius:14,padding:"12px",color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer"}}>
          Start New Order →
        </button>
      </div>

      <div style={{padding:"0 14px 24px"}}>
        <div style={{fontSize:11,fontWeight:700,color:"#475569",letterSpacing:2,marginBottom:10}}>MENU CATEGORIES</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {Object.entries(MENU).map(([key,cat])=>{
            const c=COLORS[key];
            return (
              <div key={key} onClick={()=>{setActiveCat(key);setScreen("menu");}}
                style={{background:c.bg,borderRadius:16,padding:"14px 12px",cursor:"pointer",boxShadow:`0 4px 14px ${c.bg}44`,position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",right:-8,bottom:-8,fontSize:44,opacity:0.2}}>{cat.emoji}</div>
                <div style={{fontSize:26}}>{cat.emoji}</div>
                <div style={{fontSize:13,fontWeight:800,color:"#fff",marginTop:4}}>{cat.label}</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.75)",marginTop:1}}>{cat.size} · from {fmt(cat.basePrice)}</div>
              </div>
            );
          })}
        </div>
        <div style={{marginTop:12,display:"flex",gap:10}}>
          <div onClick={()=>setScreen("history")} style={{flex:1,background:"#1E293B",borderRadius:14,padding:"14px",cursor:"pointer",textAlign:"center"}}>
            <div style={{fontSize:24}}>📜</div>
            <div style={{fontSize:12,fontWeight:700,color:"#fff",marginTop:4}}>Order History</div>
            <div style={{fontSize:10,color:"#475569",marginTop:2}}>Cloud saved ☁️</div>
          </div>
          <div onClick={()=>setScreen("reports")} style={{flex:1,background:"#1E293B",borderRadius:14,padding:"14px",cursor:"pointer",textAlign:"center"}}>
            <div style={{fontSize:24}}>📊</div>
            <div style={{fontSize:12,fontWeight:700,color:"#fff",marginTop:4}}>Sales Reports</div>
            <div style={{fontSize:10,color:"#475569",marginTop:2}}>Daily totals</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MENU ─────────────────────────────────────────────────
function MenuScreen({ cat, col, activeCat, setActiveCat, setSelectedItem, setSelBoosters, setScreen, cartCount }) {
  return (
    <div style={{...S.screen,background:"#F8FAFC",display:"flex",flexDirection:"column"}}>
      <div style={{background:col.bg,padding:"12px 14px 14px",flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.7)",letterSpacing:2}}>{cat.size} · {fmt(cat.basePrice)}+</div>
            <div style={{fontSize:20,fontWeight:900,color:"#fff"}}>{cat.emoji} {cat.label}</div>
          </div>
          {cartCount>0&&(
            <div onClick={()=>setScreen("cart")} style={{background:"rgba(255,255,255,0.25)",borderRadius:12,padding:"7px 12px",cursor:"pointer"}}>
              <span style={{color:"#fff",fontWeight:800,fontSize:13}}>🛒 {cartCount}</span>
            </div>
          )}
        </div>
      </div>
      <div style={{display:"flex",overflowX:"auto",gap:6,padding:"8px 12px",background:"#fff",flexShrink:0,scrollbarWidth:"none",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
        {Object.entries(MENU).map(([key,c])=>{
          const cc=COLORS[key]; const active=key===activeCat;
          return (
            <div key={key} onClick={()=>setActiveCat(key)}
              style={{flexShrink:0,padding:"5px 12px",borderRadius:20,background:active?cc.bg:"#F1F5F9",cursor:"pointer"}}>
              <span style={{fontSize:12,fontWeight:700,color:active?"#fff":cc.bg,whiteSpace:"nowrap"}}>{c.emoji} {c.label}</span>
            </div>
          );
        })}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"10px 12px 80px",display:"flex",flexDirection:"column",gap:8}}>
        {cat.items.map(item=>(
          <div key={item.id} onClick={()=>{setSelectedItem(item);setSelBoosters([]);setScreen("item");}}
            style={{background:"#fff",borderRadius:14,padding:"12px",display:"flex",alignItems:"center",gap:10,boxShadow:"0 2px 10px rgba(0,0,0,0.07)",borderLeft:`4px solid ${col.bg}`,cursor:"pointer"}}>
            <div style={{width:40,height:40,borderRadius:10,background:col.bg+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{cat.emoji}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:800,fontSize:13,color:"#0F172A"}}>{item.name}</div>
              <div style={{fontSize:10,color:"#64748B",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.ing}</div>
            </div>
            <div style={{flexShrink:0,textAlign:"right"}}>
              <div style={{fontWeight:900,fontSize:14,color:col.bg}}>{fmt(item.price??cat.basePrice)}</div>
              <div style={{width:26,height:26,borderRadius:7,background:col.bg,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:16,marginTop:3,marginLeft:"auto"}}>+</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ITEM DETAIL ───────────────────────────────────────────
function ItemScreen({ item, cat, col, selBoosters, setSelBoosters, addToCart, setScreen }) {
  if (!item) return null;
  const base  = item.price ?? cat.basePrice;
  const extra = selBoosters.length;
  const toggle = (b) => setSelBoosters(prev=>prev.find(x=>x.id===b.id)?prev.filter(x=>x.id!==b.id):[...prev,b]);
  return (
    <div style={{...S.screen,background:"#F8FAFC",display:"flex",flexDirection:"column"}}>
      <div style={{background:`linear-gradient(160deg,${col.bg},${col.dark})`,padding:"16px 14px 22px",flexShrink:0}}>
        <button onClick={()=>setScreen("menu")} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:10,padding:"5px 10px",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",marginBottom:12}}>← Back</button>
        <div style={{fontSize:44,marginBottom:6}}>{cat.emoji}</div>
        <div style={{fontSize:20,fontWeight:900,color:"#fff"}}>{item.name}</div>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.8)",marginTop:4,lineHeight:1.4}}>{item.ing}</div>
        <div style={{marginTop:8,display:"flex",gap:6}}>
          <span style={{background:"rgba(255,255,255,0.2)",borderRadius:8,padding:"3px 10px",fontSize:11,color:"#fff",fontWeight:700}}>{cat.size}</span>
          <span style={{background:"rgba(255,255,255,0.2)",borderRadius:8,padding:"3px 10px",fontSize:11,color:"#fff",fontWeight:700}}>{fmt(base)}</span>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"14px"}}>
        <div style={{fontSize:12,fontWeight:800,color:"#0F172A",marginBottom:2}}>Add Boosters</div>
        <div style={{fontSize:10,color:"#64748B",marginBottom:10}}>+$1.00 each — tap to select</div>
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {BOOSTERS.map(b=>{
            const on=!!selBoosters.find(x=>x.id===b.id);
            return (
              <div key={b.id} onClick={()=>toggle(b)}
                style={{background:on?col.bg+"15":"#fff",border:`2px solid ${on?col.bg:"#E2E8F0"}`,borderRadius:12,padding:"10px 12px",display:"flex",alignItems:"center",gap:10,cursor:"pointer",transition:"all 0.15s"}}>
                <span style={{fontSize:20}}>{b.icon}</span>
                <div style={{flex:1,fontWeight:700,fontSize:13,color:"#0F172A"}}>{b.name}</div>
                <span style={{fontWeight:800,fontSize:12,color:col.bg}}>+$1</span>
                <div style={{width:22,height:22,borderRadius:6,background:on?col.bg:"#E2E8F0",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:13,transition:"all 0.15s"}}>{on?"✓":"+"}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{padding:"10px 14px 16px",background:"#fff",boxShadow:"0 -4px 16px rgba(0,0,0,0.07)",flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <span style={{fontSize:12,color:"#64748B"}}>{fmt(base)}{extra>0?` + ${extra} booster${extra>1?"s":""}`:""}</span>
          <span style={{fontSize:18,fontWeight:900,color:col.bg}}>{fmt(base+extra)}</span>
        </div>
        <button onClick={()=>addToCart(item,selBoosters)}
          style={{width:"100%",background:col.bg,border:"none",borderRadius:14,padding:"13px",color:"#fff",fontWeight:900,fontSize:15,cursor:"pointer",boxShadow:`0 5px 16px ${col.bg}44`}}>
          Add to Cart — {fmt(base+extra)}
        </button>
      </div>
    </div>
  );
}

// ── CART ─────────────────────────────────────────────────
function CartScreen({ cart, subtotal, tax, total, updateQty, setScreen, placeOrder, saving }) {
  return (
    <div style={{...S.screen,background:"#F8FAFC",display:"flex",flexDirection:"column"}}>
      <div style={{background:"#0F172A",padding:"12px 14px",flexShrink:0,display:"flex",alignItems:"center",gap:10}}>
        <button onClick={()=>setScreen("menu")} style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:8,padding:"5px 10px",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer"}}>←</button>
        <div style={{fontSize:16,fontWeight:900,color:"#fff"}}>🛒 Your Order</div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"10px 12px",display:"flex",flexDirection:"column",gap:8}}>
        {cart.length===0?(
          <div style={{textAlign:"center",paddingTop:60}}>
            <div style={{fontSize:52}}>🛒</div>
            <div style={{fontSize:15,fontWeight:700,color:"#334155",marginTop:12}}>Cart is empty</div>
            <button onClick={()=>setScreen("menu")} style={{marginTop:14,background:"#FF6B35",border:"none",borderRadius:12,padding:"11px 22px",color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer"}}>Browse Menu</button>
          </div>
        ):cart.map(c=>{
          const cc=COLORS[c.catKey];
          return (
            <div key={c.key} style={{background:"#fff",borderRadius:14,padding:"11px 12px",boxShadow:"0 2px 8px rgba(0,0,0,0.07)",borderLeft:`4px solid ${cc.bg}`}}>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:800,fontSize:13,color:"#0F172A"}}>{c.item.name}</div>
                  {c.boosters.length>0&&<div style={{fontSize:10,color:cc.bg,fontWeight:600,marginTop:1}}>+ {c.boosters.map(b=>b.name).join(", ")}</div>}
                  <div style={{fontSize:10,color:"#94A3B8",marginTop:1}}>{MENU[c.catKey].label} · {MENU[c.catKey].size}</div>
                </div>
                <div style={{fontWeight:900,fontSize:14,color:cc.bg,marginLeft:8}}>{fmt(c.price*c.qty)}</div>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8}}>
                <div style={{display:"flex",alignItems:"center",background:"#F1F5F9",borderRadius:10,overflow:"hidden"}}>
                  <button onClick={()=>updateQty(c.key,-1)} style={{background:"none",border:"none",padding:"5px 12px",fontSize:16,cursor:"pointer",color:"#475569",fontWeight:700}}>−</button>
                  <span style={{fontSize:13,fontWeight:800,color:"#0F172A",minWidth:18,textAlign:"center"}}>{c.qty}</span>
                  <button onClick={()=>updateQty(c.key,+1)} style={{background:"none",border:"none",padding:"5px 12px",fontSize:16,cursor:"pointer",color:"#475569",fontWeight:700}}>+</button>
                </div>
                <div style={{fontSize:11,color:"#94A3B8"}}>{fmt(c.price)} each</div>
              </div>
            </div>
          );
        })}
      </div>
      {cart.length>0&&(
        <div style={{padding:"12px 14px 16px",background:"#fff",boxShadow:"0 -4px 16px rgba(0,0,0,0.08)",flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#64748B",marginBottom:4}}><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#64748B",marginBottom:10}}><span>Tax (8.75%)</span><span>{fmt(tax)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:18,fontWeight:900,color:"#0F172A",marginBottom:12,paddingTop:8,borderTop:"1px solid #E2E8F0"}}>
            <span>Total</span><span style={{color:"#FF6B35"}}>{fmt(total)}</span>
          </div>
          <button onClick={placeOrder} disabled={saving}
            style={{width:"100%",background:saving?"#94A3B8":"linear-gradient(135deg,#FF6B35,#E8A020)",border:"none",borderRadius:14,padding:"13px",color:"#fff",fontWeight:900,fontSize:16,cursor:saving?"not-allowed":"pointer",boxShadow:saving?"none":"0 5px 18px rgba(255,107,53,0.35)"}}>
            {saving?"💾 Saving...":"✓ Place Order · "+fmt(total)}
          </button>
        </div>
      )}
    </div>
  );
}

// ── RECEIPT ───────────────────────────────────────────────
function ReceiptScreen({ order, setScreen }) {
  if (!order) return null;
  return (
    <div style={{...S.screen,background:"#0F172A",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:18}}>
      <div style={{width:"100%",maxWidth:340}}>
        <div style={{textAlign:"center",marginBottom:16}}>
          <div style={{width:64,height:64,borderRadius:"50%",background:"linear-gradient(135deg,#22C55E,#16A34A)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,margin:"0 auto 10px",boxShadow:"0 0 24px rgba(34,197,94,0.4)"}}>✓</div>
          <div style={{fontSize:20,fontWeight:900,color:"#fff"}}>Order Saved! ☁️</div>
          <div style={{fontSize:11,color:"#64748B",marginTop:2}}>{order.id} · Synced to cloud</div>
        </div>
        <div style={{background:"#fff",borderRadius:18,padding:"16px",boxShadow:"0 8px 28px rgba(0,0,0,0.3)"}}>
          <div style={{textAlign:"center",borderBottom:"1px dashed #E2E8F0",paddingBottom:12,marginBottom:12}}>
            <div style={{fontSize:16,fontWeight:900,color:"#0F172A"}}>🥤 JuicePlus</div>
            <div style={{fontSize:10,color:"#94A3B8",marginTop:2}}>{timeStr(order.time)} · {order.dateLabel}</div>
          </div>
          {order.items.map(c=>(
            <div key={c.key} style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:6}}>
              <div>
                <div style={{fontWeight:700,color:"#0F172A"}}>{c.qty}× {c.item.name}</div>
                {c.boosters.length>0&&<div style={{fontSize:10,color:"#94A3B8"}}>+ {c.boosters.map(b=>b.name).join(", ")}</div>}
              </div>
              <div style={{fontWeight:700,color:"#0F172A"}}>{fmt(c.price*c.qty)}</div>
            </div>
          ))}
          <div style={{borderTop:"1px dashed #E2E8F0",paddingTop:10,marginTop:4}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#64748B",marginBottom:3}}><span>Subtotal</span><span>{fmt(order.subtotal)}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#64748B",marginBottom:6}}><span>Tax (8.75%)</span><span>{fmt(order.tax)}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:17,fontWeight:900,color:"#FF6B35"}}><span>TOTAL</span><span>{fmt(order.total)}</span></div>
          </div>
          <div style={{textAlign:"center",marginTop:12,fontSize:11,color:"#94A3B8"}}>Thank you! Enjoy your juice 🙏</div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:14}}>
          <button onClick={()=>setScreen("history")} style={{flex:1,background:"#1E293B",border:"none",borderRadius:12,padding:"11px",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>📜 History</button>
          <button onClick={()=>setScreen("home")} style={{flex:2,background:"linear-gradient(135deg,#FF6B35,#E8A020)",border:"none",borderRadius:12,padding:"11px",color:"#fff",fontWeight:900,fontSize:14,cursor:"pointer"}}>+ New Order</button>
        </div>
      </div>
    </div>
  );
}

// ── HISTORY ───────────────────────────────────────────────
function HistoryScreen({ grouped, searchQ, setSearchQ, setDetailOrder, setScreen, daily, total, onRefresh }) {
  const dates = Object.keys(grouped);
  return (
    <div style={{...S.screen,background:"#F8FAFC",display:"flex",flexDirection:"column"}}>
      <div style={{background:"#0F172A",padding:"12px 14px 10px",flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:16,fontWeight:900,color:"#fff"}}>📜 Order History</div>
          <button onClick={onRefresh} style={{background:"#1E293B",border:"none",borderRadius:8,padding:"5px 10px",color:"#94A3B8",fontSize:12,cursor:"pointer"}}>↻ Refresh</button>
        </div>
        <div style={{background:"#1E293B",borderRadius:12,padding:"8px 12px",display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:14}}>🔍</span>
          <input value={searchQ} onChange={e=>setSearchQ(e.target.value)}
            placeholder="Search item, date, order ID..."
            style={{flex:1,background:"none",border:"none",outline:"none",color:"#fff",fontSize:12}} />
          {searchQ&&<span onClick={()=>setSearchQ("")} style={{color:"#475569",cursor:"pointer",fontSize:16}}>✕</span>}
        </div>
      </div>
      <div style={{background:"#FF6B35",padding:"8px 14px",display:"flex",justifyContent:"space-around",flexShrink:0}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:15,fontWeight:900,color:"#fff"}}>{daily.count}</div>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.8)"}}>TODAY</div>
        </div>
        <div style={{width:1,background:"rgba(255,255,255,0.3)"}}/>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:15,fontWeight:900,color:"#fff"}}>{fmt(daily.total)}</div>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.8)"}}>TODAY SALES</div>
        </div>
        <div style={{width:1,background:"rgba(255,255,255,0.3)"}}/>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:15,fontWeight:900,color:"#fff"}}>{total}</div>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.8)"}}>ALL ORDERS</div>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"10px 12px 80px"}}>
        {dates.length===0?(
          <div style={{textAlign:"center",paddingTop:50}}>
            <div style={{fontSize:44}}>📭</div>
            <div style={{fontSize:14,fontWeight:700,color:"#334155",marginTop:10}}>No orders found</div>
          </div>
        ):dates.map(date=>(
          <div key={date} style={{marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,color:"#475569",letterSpacing:1,marginBottom:8,paddingLeft:2}}>{date}</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {grouped[date].map(t=>(
                <div key={t.id} onClick={()=>{setDetailOrder(t);setScreen("detail");}}
                  style={{background:"#fff",borderRadius:12,padding:"10px 12px",boxShadow:"0 2px 8px rgba(0,0,0,0.06)",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",borderLeft:"3px solid #FF6B35"}}>
                  <div>
                    <div style={{fontWeight:800,fontSize:13,color:"#0F172A"}}>{t.id}</div>
                    <div style={{fontSize:10,color:"#64748B",marginTop:2}}>
                      {timeStr(t.time)} · {(t.items||[]).length} item{(t.items||[]).length!==1?"s":""}
                    </div>
                    <div style={{fontSize:10,color:"#94A3B8",marginTop:1}}>
                      {(t.items||[]).slice(0,2).map(i=>i.item?.name).join(", ")}{(t.items||[]).length>2?"...":""}
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontWeight:900,fontSize:15,color:"#FF6B35"}}>{fmt(t.total)}</div>
                    <div style={{fontSize:10,color:"#94A3B8",marginTop:2}}>tap to view →</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ORDER DETAIL ──────────────────────────────────────────
function DetailScreen({ order, setScreen }) {
  if (!order) return null;
  const items = order.items || [];
  return (
    <div style={{...S.screen,background:"#F8FAFC",display:"flex",flexDirection:"column"}}>
      <div style={{background:"#0F172A",padding:"12px 14px",flexShrink:0,display:"flex",alignItems:"center",gap:10}}>
        <button onClick={()=>setScreen("history")} style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:8,padding:"5px 10px",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer"}}>←</button>
        <div style={{fontSize:15,fontWeight:900,color:"#fff"}}>{order.id}</div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"14px 12px"}}>
        <div style={{background:"#fff",borderRadius:14,padding:"14px",boxShadow:"0 2px 10px rgba(0,0,0,0.07)",marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <div style={{fontSize:12,color:"#64748B"}}>Date & Time</div>
            <div style={{fontSize:12,fontWeight:700,color:"#0F172A"}}>{dateStr(order.time)} {timeStr(order.time)}</div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <div style={{fontSize:12,color:"#64748B"}}>Order ID</div>
            <div style={{fontSize:12,fontWeight:700,color:"#0F172A"}}>{order.id}</div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <div style={{fontSize:12,color:"#64748B"}}>Items</div>
            <div style={{fontSize:12,fontWeight:700,color:"#0F172A"}}>{items.length}</div>
          </div>
        </div>
        <div style={{background:"#fff",borderRadius:14,padding:"14px",boxShadow:"0 2px 10px rgba(0,0,0,0.07)",marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:800,color:"#0F172A",marginBottom:10}}>Items Ordered</div>
          {items.map((c,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",paddingBottom:8,marginBottom:8,borderBottom:i<items.length-1?"1px solid #F1F5F9":"none"}}>
              <div>
                <div style={{fontWeight:700,fontSize:13,color:"#0F172A"}}>{c.qty}× {c.item?.name}</div>
                {(c.boosters||[]).length>0&&<div style={{fontSize:10,color:"#FF6B35",marginTop:1}}>+ {c.boosters.map(b=>b.name).join(", ")}</div>}
              </div>
              <div style={{fontWeight:800,fontSize:13,color:"#0F172A"}}>{fmt(c.price*c.qty)}</div>
            </div>
          ))}
        </div>
        <div style={{background:"#fff",borderRadius:14,padding:"14px",boxShadow:"0 2px 10px rgba(0,0,0,0.07)"}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#64748B",marginBottom:6}}><span>Subtotal</span><span>{fmt(order.subtotal)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#64748B",marginBottom:10}}><span>Tax (8.75%)</span><span>{fmt(order.tax)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:18,fontWeight:900,color:"#FF6B35",paddingTop:8,borderTop:"1px solid #F1F5F9"}}><span>TOTAL</span><span>{fmt(order.total)}</span></div>
        </div>
      </div>
    </div>
  );
}

// ── REPORTS ───────────────────────────────────────────────
function ReportsScreen({ transactions, setScreen, grouped }) {
  const dates = Object.keys(grouped).slice(0,30);
  const allTotal   = transactions.reduce((s,t)=>s+Number(t.total),0);
  const allOrders  = transactions.length;
  const avgOrder   = allOrders>0 ? allTotal/allOrders : 0;

  // Top items
  const itemCounts = {};
  transactions.forEach(t=>(t.items||[]).forEach(i=>{
    const n = i.item?.name||"Unknown";
    if (!itemCounts[n]) itemCounts[n]={name:n,count:0,revenue:0};
    itemCounts[n].count  += i.qty||1;
    itemCounts[n].revenue += (i.price||0)*(i.qty||1);
  }));
  const topItems = Object.values(itemCounts).sort((a,b)=>b.count-a.count).slice(0,5);

  return (
    <div style={{...S.screen,background:"#F8FAFC",display:"flex",flexDirection:"column"}}>
      <div style={{background:"#0F172A",padding:"12px 14px",flexShrink:0}}>
        <div style={{fontSize:16,fontWeight:900,color:"#fff"}}>📊 Sales Reports</div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"12px 12px 80px",display:"flex",flexDirection:"column",gap:12}}>

        {/* All time stats */}
        <div style={{background:"linear-gradient(135deg,#FF6B35,#E8A020)",borderRadius:16,padding:"16px"}}>
          <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.75)",letterSpacing:2,marginBottom:10}}>ALL TIME</div>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:22,fontWeight:900,color:"#fff"}}>{fmt(allTotal)}</div>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.75)",marginTop:2}}>TOTAL REVENUE</div>
            </div>
            <div style={{width:1,background:"rgba(255,255,255,0.25)"}}/>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:22,fontWeight:900,color:"#fff"}}>{allOrders}</div>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.75)",marginTop:2}}>TOTAL ORDERS</div>
            </div>
            <div style={{width:1,background:"rgba(255,255,255,0.25)"}}/>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:22,fontWeight:900,color:"#fff"}}>{fmt(avgOrder)}</div>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.75)",marginTop:2}}>AVG ORDER</div>
            </div>
          </div>
        </div>

        {/* Top selling items */}
        {topItems.length>0&&(
          <div style={{background:"#fff",borderRadius:16,padding:"14px",boxShadow:"0 2px 10px rgba(0,0,0,0.07)"}}>
            <div style={{fontSize:12,fontWeight:800,color:"#0F172A",marginBottom:10}}>🏆 Top Selling Items</div>
            {topItems.map((item,i)=>(
              <div key={item.name} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <div style={{width:24,height:24,borderRadius:6,background:["#FF6B35","#E8A020","#E53E3E","#805AD5","#2D9E6B"][i],display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:11,flexShrink:0}}>#{i+1}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#0F172A"}}>{item.name}</div>
                  <div style={{fontSize:10,color:"#64748B"}}>{item.count} sold · {fmt(item.revenue)} revenue</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Daily breakdown */}
        <div style={{background:"#fff",borderRadius:16,padding:"14px",boxShadow:"0 2px 10px rgba(0,0,0,0.07)"}}>
          <div style={{fontSize:12,fontWeight:800,color:"#0F172A",marginBottom:10}}>📅 Daily Breakdown</div>
          {dates.length===0?(
            <div style={{textAlign:"center",color:"#94A3B8",fontSize:12,padding:"20px 0"}}>No data yet</div>
          ):dates.map(date=>{
            const dayTxns = grouped[date]||[];
            const dayTotal = dayTxns.reduce((s,t)=>s+Number(t.total),0);
            const daySubtotal = dayTxns.reduce((s,t)=>s+Number(t.subtotal),0);
            const dayTax = dayTxns.reduce((s,t)=>s+Number(t.tax),0);
            return (
              <div key={date} style={{borderBottom:"1px solid #F1F5F9",paddingBottom:10,marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <div style={{fontSize:12,fontWeight:800,color:"#0F172A"}}>{date}</div>
                  <div style={{fontSize:14,fontWeight:900,color:"#FF6B35"}}>{fmt(dayTotal)}</div>
                </div>
                <div style={{display:"flex",gap:12}}>
                  <div style={{fontSize:10,color:"#64748B"}}>{dayTxns.length} orders</div>
                  <div style={{fontSize:10,color:"#64748B"}}>Subtotal: {fmt(daySubtotal)}</div>
                  <div style={{fontSize:10,color:"#64748B"}}>Tax: {fmt(dayTax)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── NAV BUTTON ────────────────────────────────────────────
function NavBtn({ icon, label, active, onTap, badge }) {
  return (
    <div onClick={onTap} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,cursor:"pointer",position:"relative",padding:"6px 0"}}>
      {badge>0&&<div style={{position:"absolute",top:2,right:"calc(50% - 20px)",background:"#EF4444",borderRadius:"50%",width:16,height:16,fontSize:9,fontWeight:900,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>{badge}</div>}
      <span style={{fontSize:20}}>{icon}</span>
      <span style={{fontSize:9,fontWeight:700,color:active?"#FF6B35":"#94A3B8"}}>{label}</span>
    </div>
  );
}

// ── STYLES ────────────────────────────────────────────────
const S = {
  frame:{width:"100%",maxWidth:430,height:"100vh",margin:"0 auto",background:"#000",display:"flex",flexDirection:"column",overflow:"hidden",fontFamily:"-apple-system,'SF Pro Display','Helvetica Neue',sans-serif",position:"relative"},
  status:{background:"#000",padding:"10px 20px 6px",display:"flex",justifyContent:"space-between",color:"#fff",flexShrink:0,fontSize:13},
  body:{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"},
  screen:{flex:1,overflow:"hidden"},
  nav:{background:"#fff",display:"flex",borderTop:"1px solid #E2E8F0",paddingBottom:8,flexShrink:0},
  toast:{position:"absolute",bottom:90,left:"50%",transform:"translateX(-50%)",background:"#0F172A",color:"#fff",padding:"9px 18px",borderRadius:20,fontSize:12,fontWeight:700,whiteSpace:"nowrap",boxShadow:"0 4px 20px rgba(0,0,0,0.3)",zIndex:100},
};
