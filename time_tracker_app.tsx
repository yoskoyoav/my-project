import { useState, useEffect } from "react";

const CODES = [
  "יער-שוטף בוטניקה שטח",
  "יער-שוטף קדם",
  "יער-שוטף פוסט",
  "יער-פיתוח כתיבה משרד",
  'יער-שוטף ממ"ג משרד',
  "יער-שוטף ניהול משרד",
  'יער-פיתוח קוד משרד',
  'יער-פיתוח ממ"ג משרד',
  "מנהלה",
  "צוות",
  "ערכיות מחקר משרד",
];

// קיבוץ קודי הדיווח לקטגוריות + צבע לכל קטגוריה
// "יער-שוטף בוטניקה שטח" מבודל כקטגוריה נפרדת ("שטח") כי זהו יום עבודה מחוץ למשרד
const getCodeCategory = (code) => {
  if (code === "יער-שוטף בוטניקה שטח") return "שטח";
  if (code.startsWith("יער-שוטף")) return "יער-שוטף";
  if (code.startsWith("יער-פיתוח")) return "יער-פיתוח";
  return "אחר";
};
const FIXED_CATEGORY_ORDER = ["שטח", "יער-שוטף", "יער-פיתוח", "אחר"];
const CATEGORY_COLORS = {
  "שטח": "#e65100",
  "יער-שוטף": "#2e7d32",
  "יער-פיתוח": "#1565c0",
  "אחר": "#8e24aa",
  "מותאם אישית": "#616161",
};
const ALL_CATEGORY_ORDER = [...FIXED_CATEGORY_ORDER, "מותאם אישית"];

// קטגוריה עבור קוד כלשהו, כולל קודים ידניים (מותאמים אישית) שלא ברשימה הקבועה
const getEntryCategory = (code) => CODES.includes(code) ? getCodeCategory(code) : "מותאם אישית";
const getCodeColor = (code) => CATEGORY_COLORS[getEntryCategory(code)];

const GROUPED_CODES = FIXED_CATEGORY_ORDER
  .map(cat => ({ category: cat, color: CATEGORY_COLORS[cat], codes: CODES.filter(c => getCodeCategory(c) === cat) }))
  .filter(g => g.codes.length > 0);

// קודים שדורשים שם/יעד נוסף (הופכים לדינמיים: "<קוד> <שם>")
const DYNAMIC_CODES = ["יער-שוטף קדם", "יער-שוטף פוסט"];
const isDynamicCode = (code) => DYNAMIC_CODES.includes(code);
const displayCode = (e) => (isDynamicCode(e.code) && e.target) ? `${e.code} ${e.target}` : e.code;

const toMin = t => { const [h,m] = t.split(":").map(Number); return h*60+m; };
const toTime = m => `${String(Math.floor(m/60)).padStart(2,"0")}:${String(m%60).padStart(2,"0")}`;
const diffH = (s,e) => Math.max(0,(toMin(e)-toMin(s))/60);
const fmtH = h => `${Math.floor(h)}:${String(Math.round((h%1)*60)).padStart(2,"0")}`;

// --- Timezone-safe local date helpers ---
const pad2 = n => String(n).padStart(2, "0");
const localDateStr = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const todayStr = () => localDateStr(new Date());
const addDays = (dateStr, n) => {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return localDateStr(d);
};
const parseLocalDate = (dateStr) => new Date(dateStr + "T00:00:00");

function parseEntries(raw) {
  try { return JSON.parse(raw) || {}; } catch { return {}; }
}

const escCSV = v => `"${String(v).replace(/"/g,'""')}"`;
const toCSV = (rows, headers) =>
  [headers, ...rows].map(r => r.map(escCSV).join(",")).join("\n");
const toText = (rows) =>
  rows.map(r => `${r[0]}  |  ${r[1]}–${r[2]}  |  ${r[3]}  |  ${r[4]}${r[5] ? "  |  " + r[5] : ""}`).join("\n");

const downloadFile = (content, filename, mime) => {
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + content], { type: `${mime};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

export default function App() {
  const [entries, setEntries] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState("day");
  const [selDate, setSelDate] = useState(todayStr());
  const [form, setForm] = useState({ start: "09:00", end: "10:00", code: CODES[0], note: "", target: "" });
  const [editId, setEditId] = useState(null);
  const [tab, setTab] = useState("log");
  const [exportRange, setExportRange] = useState("day");
  const [exportFmt, setExportFmt] = useState("csv");
  const [copyText, setCopyText] = useState("");
  const [codeMenuOpen, setCodeMenuOpen] = useState(false);
  const [customMode, setCustomMode] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("time_entries");
        if (r) setEntries(parseEntries(r.value));
      } catch {}
      setLoaded(true);
    })();
  }, []);

  const save = async (newEntries) => {
    setEntries(newEntries);
    try { await window.storage.set("time_entries", JSON.stringify(newEntries)); } catch {}
  };

  const [endManuallyChanged, setEndManuallyChanged] = useState(false);

  const handleStartChange = (val) => {
    setForm(f => ({
      ...f,
      start: val,
      end: endManuallyChanged ? f.end : toTime(Math.min(toMin(val) + 120, 1439))
    }));
  };

  const handleEndChange = (val) => {
    setEndManuallyChanged(true);
    setForm(f => ({ ...f, end: val }));
  };

  const selectCode = (code) => {
    setForm(f => ({ ...f, code, note: "", target: "" }));
    setCodeMenuOpen(false);
  };

  const enterCustomMode = () => {
    setCustomMode(true);
    setForm(f => ({ ...f, code: "", note: "", target: "" }));
    setCodeMenuOpen(false);
  };

  const exitCustomMode = () => {
    setCustomMode(false);
    setForm(f => ({ ...f, code: CODES[0] }));
  };

  const addEntry = () => {
    if (toMin(form.end) <= toMin(form.start)) { alert("שעת סיום חייבת להיות אחרי שעת התחלה"); return; }
    if (customMode && !form.code.trim()) { alert("יש להזין קוד דיווח ידני"); return; }
    if (isDynamicCode(form.code) && !form.target.trim()) { alert("יש להזין שם מקום עבור קוד דיווח זה"); return; }
    const entryToSave = { ...form, code: form.code.trim(), target: form.target.trim() };
    const dayEntries = [...(entries[selDate] || [])];
    if (editId !== null) {
      const idx = dayEntries.findIndex(e => e.id === editId);
      if (idx !== -1) dayEntries[idx] = { ...entryToSave, id: editId };
      setEditId(null);
    } else {
      dayEntries.push({ ...entryToSave, id: Date.now() });
    }
    dayEntries.sort((a,b) => toMin(a.start)-toMin(b.start));
    save({ ...entries, [selDate]: dayEntries });
    setEndManuallyChanged(false);
    setForm(f => ({ ...f, start: form.end, end: toTime(Math.min(toMin(form.end)+120,1439)), note: "", target: "" }));
  };

  const deleteEntry = (id) => {
    const dayEntries = (entries[selDate] || []).filter(e => e.id !== id);
    save({ ...entries, [selDate]: dayEntries });
  };

  const startEdit = (e) => {
    setCustomMode(!CODES.includes(e.code));
    setForm({ start: e.start, end: e.end, code: e.code, note: e.note || "", target: e.target || "" });
    setEditId(e.id);
  };

  const cancelEdit = () => {
    setEditId(null);
    setCustomMode(false);
    setForm({ start: "09:00", end: "10:00", code: CODES[0], note: "", target: "" });
  };

  const getDatesInRange = (range) => {
    const d = parseLocalDate(selDate);
    if (range === "day") return [selDate];
    if (range === "week") {
      const sun = new Date(d); sun.setDate(d.getDate() - d.getDay());
      return Array.from({length:7}, (_,i) => { const x=new Date(sun); x.setDate(sun.getDate()+i); return localDateStr(x); });
    }
    if (range === "month") {
      const y=d.getFullYear(), m=d.getMonth(), days=new Date(y,m+1,0).getDate();
      return Array.from({length:days}, (_,i) => localDateStr(new Date(y,m,i+1)));
    }
    return Object.keys(entries).sort();
  };

  // מפצל את הקודים הדינמיים (קדם/פוסט) לשורות נפרדות לפי יעד, מקבץ שאר הקודים הקבועים,
  // ומוסיף בסוף כל קוד ידני (מותאם אישית) שדווח בפועל בטווח
  const summaryData = () => {
    const dates = getDatesInRange(view);
    const totals = {};
    const meta = {}; // key -> { label, category }
    CODES.forEach(c => { if (!isDynamicCode(c)) { totals[c] = 0; meta[c] = { label: c, category: getCodeCategory(c) }; } });
    dates.forEach(d => (entries[d]||[]).forEach(e => {
      const key = isDynamicCode(e.code) ? displayCode(e) : e.code;
      totals[key] = (totals[key] || 0) + diffH(e.start, e.end);
      if (!meta[key]) meta[key] = { label: key, category: getEntryCategory(e.code) };
    }));
    const rows = [];
    ALL_CATEGORY_ORDER.forEach(cat => {
      const keysInCat = Object.keys(meta).filter(k => meta[k].category === cat).sort((a,b)=>a.localeCompare(b,"he"));
      keysInCat.forEach(k => rows.push({ key: k, label: meta[k].label, color: CATEGORY_COLORS[cat] }));
    });
    return { totals, rows };
  };

  const buildRows = () => {
    const dates = getDatesInRange(exportRange);
    const rows = [];
    dates.forEach(date => {
      (entries[date]||[]).forEach(e => {
        rows.push([date, e.start, e.end, fmtH(diffH(e.start, e.end)), displayCode(e), e.note||""]);
      });
    });
    return rows;
  };

  const exportData = () => {
    const rows = buildRows();
    const labels = { day: selDate, week: `שבוע-${selDate}`, month: parseLocalDate(selDate).toLocaleString("he",{month:"long",year:"numeric"}), all: "כל-הנתונים" };
    if (exportFmt === "csv") {
      const csv = toCSV(rows, ["תאריך","שעת התחלה","שעת סיום","משך","קוד דיווח","הערה"]);
      downloadFile(csv, `דיווח-שעות-${labels[exportRange]}.csv`, "text/csv");
    } else {
      const header = `תאריך  |  שעות  |  משך  |  קוד דיווח  |  הערה\n${"─".repeat(60)}\n`;
      const text = header + toText(rows);
      setCopyText(text);
    }
  };

  const dayEntries = entries[selDate] || [];
  const dayTotal = dayEntries.reduce((s,e) => s + diffH(e.start,e.end), 0);

  if (!loaded) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",fontFamily:"Arial",direction:"rtl"}}>טוען...</div>;

  const { totals: summary, rows: summaryRows } = summaryData();
  const summaryTotal = Object.values(summary).reduce((a,b)=>a+b,0);
  const currentColor = customMode ? CATEGORY_COLORS["מותאם אישית"] : getCodeColor(form.code);

  return (
    <div style={{fontFamily:"Arial, sans-serif",direction:"rtl",maxWidth:700,margin:"0 auto",padding:"16px",background:"#f5f7fa",minHeight:"100vh"}}>
      {/* Header */}
      <div style={{background:"#2e7d32",color:"#fff",borderRadius:12,padding:"16px 20px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
        <h2 style={{margin:0,fontSize:20}}>🌲 לוח דיווח שעות</h2>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <button onClick={()=>setSelDate(d=>addDays(d,-1))} title="יום קודם"
            style={{border:"none",background:"rgba(255,255,255,0.2)",color:"#fff",borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>
            ‹
          </button>
          <input type="date" value={selDate} onChange={e=>setSelDate(e.target.value)}
            style={{border:"none",background:"rgba(255,255,255,0.2)",color:"#fff",borderRadius:8,padding:"6px 10px",fontSize:14,cursor:"pointer"}} />
          <button onClick={()=>setSelDate(d=>addDays(d,1))} title="יום הבא"
            style={{border:"none",background:"rgba(255,255,255,0.2)",color:"#fff",borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>
            ›
          </button>
          {selDate !== todayStr() && (
            <button onClick={()=>setSelDate(todayStr())} title="חזרה להיום"
              style={{border:"none",background:"rgba(255,255,255,0.35)",color:"#fff",borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:12,fontWeight:"bold"}}>
              היום
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        {[["log","📋 דיווח יומי"],["summary","📊 סיכום"],["export","📥 ייצוא"]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{flex:1,padding:"10px",borderRadius:8,border:"none",cursor:"pointer",fontWeight:tab===k?"bold":"normal",background:tab===k?"#2e7d32":"#fff",color:tab===k?"#fff":"#333",fontSize:14,boxShadow:"0 1px 4px rgba(0,0,0,0.1)"}}>
            {l}
          </button>
        ))}
      </div>

      {tab === "log" && (
        <>
          <div style={{background:"#fff",borderRadius:12,padding:16,marginBottom:16,boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}>
            <h3 style={{margin:"0 0 12px",fontSize:15,color:"#2e7d32"}}>{editId ? "✏️ עריכת דיווח" : "➕ הוסף דיווח"}</h3>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <div>
                <label style={{fontSize:12,color:"#666"}}>שעת התחלה</label>
                <input type="time" value={form.start} onChange={e=>handleStartChange(e.target.value)}
                  style={{display:"block",width:"100%",padding:"8px",borderRadius:8,border:"1px solid #ddd",fontSize:15,boxSizing:"border-box"}} />
              </div>
              <div>
                <label style={{fontSize:12,color:"#666"}}>שעת סיום</label>
                <input type="time" value={form.end} onChange={e=>handleEndChange(e.target.value)}
                  style={{display:"block",width:"100%",padding:"8px",borderRadius:8,border:"1px solid #ddd",fontSize:15,boxSizing:"border-box"}} />
              </div>
            </div>

            {/* בחירת קוד דיווח: תפריט צבעוני מקובץ, או שדה חופשי לקוד ידני */}
            <div style={{marginBottom:10,position:"relative"}}>
              <label style={{fontSize:12,color:"#666"}}>קוד דיווח</label>

              {!customMode ? (
                <>
                  <button type="button" onClick={()=>setCodeMenuOpen(o=>!o)}
                    style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"8px 10px",borderRadius:8,border:`1.5px solid ${currentColor}`,fontSize:14,boxSizing:"border-box",background:"#fff",cursor:"pointer",color:"#333"}}>
                    <span style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{width:10,height:10,borderRadius:"50%",background:currentColor,flexShrink:0}} />
                      {form.code}
                    </span>
                    <span style={{color:"#999",fontSize:12,transform:codeMenuOpen?"rotate(180deg)":"none",transition:"transform 0.15s"}}>▼</span>
                  </button>

                  {codeMenuOpen && (
                    <>
                      <div onClick={()=>setCodeMenuOpen(false)} style={{position:"fixed",inset:0,zIndex:10}} />
                      <div style={{position:"absolute",top:"100%",right:0,left:0,marginTop:4,background:"#fff",borderRadius:10,boxShadow:"0 6px 20px rgba(0,0,0,0.15)",border:"1px solid #eee",zIndex:20,maxHeight:340,overflowY:"auto"}}>
                        {GROUPED_CODES.map(g => (
                          <div key={g.category}>
                            <div style={{padding:"6px 12px",fontSize:11,fontWeight:"bold",color:g.color,background:`${g.color}14`,position:"sticky",top:0}}>
                              {g.category}
                            </div>
                            {g.codes.map(c => (
                              <div key={c} onClick={()=>selectCode(c)}
                                style={{display:"flex",alignItems:"center",gap:8,padding:"9px 14px",cursor:"pointer",fontSize:13.5,background:form.code===c?`${g.color}18`:"transparent",fontWeight:form.code===c?"bold":"normal"}}
                                onMouseEnter={ev=>ev.currentTarget.style.background=`${g.color}18`}
                                onMouseLeave={ev=>ev.currentTarget.style.background=form.code===c?`${g.color}18`:"transparent"}>
                                <span style={{width:8,height:8,borderRadius:"50%",background:g.color,flexShrink:0}} />
                                {c}
                              </div>
                            ))}
                          </div>
                        ))}
                        <div onClick={enterCustomMode}
                          style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",cursor:"pointer",fontSize:13.5,borderTop:"1px dashed #ddd",color:"#555"}}
                          onMouseEnter={ev=>ev.currentTarget.style.background="#f5f5f5"}
                          onMouseLeave={ev=>ev.currentTarget.style.background="transparent"}>
                          <span style={{width:8,height:8,borderRadius:"50%",background:CATEGORY_COLORS["מותאם אישית"],flexShrink:0}} />
                          ✏️ קוד דיווח ידני (מותאם אישית)...
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div style={{display:"flex",gap:6}}>
                  <input value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value}))} placeholder="הקלד קוד דיווח..." autoFocus
                    style={{flex:1,padding:"8px 10px",borderRadius:8,border:`1.5px solid ${CATEGORY_COLORS["מותאם אישית"]}`,fontSize:14,boxSizing:"border-box"}} />
                  <button type="button" onClick={exitCustomMode}
                    style={{padding:"8px 12px",borderRadius:8,border:"1px solid #ddd",background:"#f5f5f5",cursor:"pointer",fontSize:13,whiteSpace:"nowrap",color:"#555"}}>
                    מהרשימה
                  </button>
                </div>
              )}
            </div>

            {isDynamicCode(form.code) ? (
              <div style={{marginBottom:12}}>
                <label style={{fontSize:12,color:"#666"}}>
                  שם המקום ({form.code === "יער-שוטף קדם" ? "יעד קדם" : "יעד פוסט"}) <span style={{color:"#e53935"}}>*</span>
                </label>
                <input value={form.target} onChange={e=>setForm(f=>({...f,target:e.target.value}))} placeholder="לדוגמה: מנחמיה, הר-הצופים..."
                  style={{display:"block",width:"100%",padding:"8px",borderRadius:8,border:`1px solid ${form.target.trim()?"#ddd":"#e53935"}`,fontSize:14,boxSizing:"border-box"}} />
                {form.target.trim() && (
                  <div style={{fontSize:12,color:"#2e7d32",marginTop:4}}>
                    קוד סופי: <strong>{form.code} {form.target.trim()}</strong>
                  </div>
                )}
              </div>
            ) : (
              <div style={{marginBottom:12}}>
                <label style={{fontSize:12,color:"#666"}}>הערה (אופציונלי)</label>
                <input value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} placeholder="הוסף הערה..."
                  style={{display:"block",width:"100%",padding:"8px",borderRadius:8,border:"1px solid #ddd",fontSize:14,boxSizing:"border-box"}} />
              </div>
            )}
            <div style={{display:"flex",gap:8}}>
              <button onClick={addEntry} style={{flex:1,padding:"10px",background:"#2e7d32",color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontSize:14,fontWeight:"bold"}}>
                {editId ? "עדכן" : "הוסף"}
              </button>
              {editId && <button onClick={cancelEdit} style={{padding:"10px 16px",background:"#eee",border:"none",borderRadius:8,cursor:"pointer",fontSize:14}}>ביטול</button>}
            </div>
          </div>

          <div style={{background:"#fff",borderRadius:12,padding:16,boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <h3 style={{margin:0,fontSize:15,color:"#333"}}>דיווחי היום</h3>
              <span style={{background:"#e8f5e9",color:"#2e7d32",borderRadius:20,padding:"4px 12px",fontSize:13,fontWeight:"bold"}}>סה"כ: {fmtH(dayTotal)} שע'</span>
            </div>
            {dayEntries.length === 0
              ? <p style={{color:"#aaa",textAlign:"center",margin:"20px 0"}}>אין דיווחים ליום זה</p>
              : dayEntries.map(e => {
                  const color = getCodeColor(e.code);
                  return (
                    <div key={e.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:8,marginBottom:8,background:"#f9f9f9",border:`2px solid ${color}20`}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:color,flexShrink:0}} />
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:"bold",color:"#333"}}>{displayCode(e)}</div>
                        {e.note && <div style={{fontSize:12,color:"#888"}}>{e.note}</div>}
                      </div>
                      <div style={{textAlign:"left",fontSize:13,color:"#555"}}>
                        <div>{e.start}–{e.end}</div>
                        <div style={{color,fontWeight:"bold"}}>{fmtH(diffH(e.start,e.end))} שע'</div>
                      </div>
                      <div style={{display:"flex",gap:4}}>
                        <button onClick={()=>startEdit(e)} style={{background:"#e3f2fd",border:"none",borderRadius:6,padding:"4px 8px",cursor:"pointer",fontSize:13}}>✏️</button>
                        <button onClick={()=>deleteEntry(e.id)} style={{background:"#ffebee",border:"none",borderRadius:6,padding:"4px 8px",cursor:"pointer",fontSize:13}}>🗑️</button>
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </>
      )}

      {tab === "summary" && (
        <div style={{background:"#fff",borderRadius:12,padding:16,boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}>
          <div style={{display:"flex",gap:8,marginBottom:16}}>
            {[["day","יום"],["week","שבוע"],["month","חודש"]].map(([k,l])=>(
              <button key={k} onClick={()=>setView(k)} style={{flex:1,padding:"8px",borderRadius:8,border:"none",cursor:"pointer",background:view===k?"#2e7d32":"#f0f0f0",color:view===k?"#fff":"#333",fontWeight:view===k?"bold":"normal",fontSize:13}}>
                {l}
              </button>
            ))}
          </div>
          <div style={{marginBottom:12,fontSize:13,color:"#888",textAlign:"center"}}>
            {view==="day" && selDate}
            {view==="week" && `שבוע: ${getDatesInRange("week")[0]} – ${getDatesInRange("week")[6]}`}
            {view==="month" && parseLocalDate(selDate).toLocaleString("he",{month:"long",year:"numeric"})}
          </div>
          {summaryRows.map(({key,label,color}) => {
            const h = summary[key] || 0;
            const pct = summaryTotal > 0 ? (h/summaryTotal)*100 : 0;
            return (
              <div key={key} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:3}}>
                  <span style={{color:"#333"}}>{label}</span>
                  <span style={{color,fontWeight:"bold"}}>{fmtH(h)} שע'</span>
                </div>
                <div style={{height:8,borderRadius:4,background:"#f0f0f0",overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${pct}%`,background:color,borderRadius:4,transition:"width 0.3s"}} />
                </div>
              </div>
            );
          })}
          <div style={{marginTop:16,borderTop:"2px solid #e0e0e0",paddingTop:12,display:"flex",justifyContent:"space-between",fontWeight:"bold",fontSize:15}}>
            <span>סה"כ</span>
            <span style={{color:"#2e7d32"}}>{fmtH(summaryTotal)} שעות</span>
          </div>
        </div>
      )}

      {tab === "export" && (
        <div style={{background:"#fff",borderRadius:12,padding:16,boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}>
          <h3 style={{margin:"0 0 16px",fontSize:15,color:"#2e7d32"}}>📥 ייצוא נתונים</h3>

          <label style={{fontSize:13,color:"#666",display:"block",marginBottom:8}}>טווח</label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
            {[["day","📅 יום נוכחי"],["week","📆 שבוע נוכחי"],["month","🗓️ חודש נוכחי"],["all","📂 כל הנתונים"]].map(([k,l])=>(
              <button key={k} onClick={()=>{setExportRange(k);setCopyText("");}}
                style={{padding:"12px",borderRadius:10,border:`2px solid ${exportRange===k?"#2e7d32":"#ddd"}`,cursor:"pointer",background:exportRange===k?"#e8f5e9":"#fafafa",color:exportRange===k?"#2e7d32":"#555",fontWeight:exportRange===k?"bold":"normal",fontSize:14}}>
                {l}
              </button>
            ))}
          </div>

          <label style={{fontSize:13,color:"#666",display:"block",marginBottom:8}}>פורמט</label>
          <div style={{display:"flex",gap:8,marginBottom:16}}>
            {[["csv","📄 CSV (לאקסל/Sheets)"],["text","📋 טקסט להעתקה"]].map(([k,l])=>(
              <button key={k} onClick={()=>{setExportFmt(k);setCopyText("");}}
                style={{flex:1,padding:"10px",borderRadius:10,border:`2px solid ${exportFmt===k?"#2e7d32":"#ddd"}`,cursor:"pointer",background:exportFmt===k?"#e8f5e9":"#fafafa",color:exportFmt===k?"#2e7d32":"#555",fontWeight:exportFmt===k?"bold":"normal",fontSize:13}}>
                {l}
              </button>
            ))}
          </div>

          <button onClick={exportData}
            style={{width:"100%",padding:"14px",background:"#2e7d32",color:"#fff",border:"none",borderRadius:10,cursor:"pointer",fontSize:16,fontWeight:"bold",marginBottom:12}}>
            {exportFmt === "csv" ? "⬇️ הורד CSV" : "📋 צור טקסט"}
          </button>

          {copyText && (
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontSize:13,color:"#555"}}>העתק את הטקסט:</span>
                <button onClick={()=>{navigator.clipboard?.writeText(copyText);}}
                  style={{padding:"4px 12px",background:"#e8f5e9",border:"1px solid #2e7d32",color:"#2e7d32",borderRadius:6,cursor:"pointer",fontSize:12}}>
                  העתק
                </button>
              </div>
              <textarea readOnly value={copyText} style={{width:"100%",height:180,borderRadius:8,border:"1px solid #ddd",padding:10,fontSize:12,fontFamily:"monospace",direction:"ltr",boxSizing:"border-box",background:"#f9f9f9",resize:"vertical"}} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}