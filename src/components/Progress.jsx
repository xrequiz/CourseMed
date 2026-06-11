import React, { useState, useEffect } from "react";
import { TrendingUp, ChevronDown, Trash2 } from "lucide-react";
import { INK, SCRUB, SCRUB_SOFT } from "../theme.js";
import { loadHistory, clearHistory, HISTORY_KINDS } from "../lib/store.js";
import { SectionTitle } from "./common.jsx";

export default function Progress() {
  const [history, setHistory] = useState([]);
  const [open, setOpen] = useState(-1);
  const [filter, setFilter] = useState("all");
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => { setHistory(loadHistory()); }, []);

  const counts = {};
  for (const h of history) counts[h.kind] = (counts[h.kind] || 0) + 1;
  const shown = filter === "all" ? history : history.filter((h) => h.kind === filter);

  const doClear = () => {
    if (!confirmClear) { setConfirmClear(true); return; }
    clearHistory(); setHistory([]); setConfirmClear(false);
  };

  return (
    <div className="fade-in">
      <SectionTitle icon={TrendingUp} title="ההתקדמות שלי" sub="כל משוב ותחקיר שקיבלתם נשמר כאן (בדפדפן שלכם בלבד) — כדי שתוכלו לזהות דפוסים חוזרים ולראות את ההתקדמות." />

      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-5">
        {Object.entries(HISTORY_KINDS).map(([k, label]) => (
          <button key={k} onClick={() => setFilter(filter === k ? "all" : k)}
            className="rounded-xl p-3 text-center border"
            style={filter === k ? { background: SCRUB, borderColor: SCRUB } : { background: "white", borderColor: "#E2EBE9" }}>
            <div className="font-display text-2xl font-black" style={{ color: filter === k ? "white" : SCRUB }}>{counts[k] || 0}</div>
            <div className="text-xs" style={{ color: filter === k ? "#CDEBE5" : "#5C7A7D" }}>{label}</div>
          </button>
        ))}
      </div>

      {history.length === 0 && (
        <div className="bg-white rounded-2xl border p-6 text-center text-sm" style={{ borderColor: "#E2EBE9", color: "#5C7A7D" }}>
          עוד אין כאן כלום. כל משוב מעריך ותחקיר שתקבלו — בביוגרפי, בסימולציות, בראיונות וביום המבחן — יישמר כאן אוטומטית.
        </div>
      )}

      <div className="space-y-2">
        {shown.map((h, i) => (
          <div key={`${h.date}-${i}`} className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#E2EBE9" }}>
            <button onClick={() => setOpen(open === i ? -1 : i)} className="w-full flex items-center justify-between gap-2 p-3 text-right">
              <span className="flex items-center gap-2 min-w-0">
                <span className="flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: SCRUB_SOFT, color: SCRUB }}>{HISTORY_KINDS[h.kind] || h.kind}</span>
                <span className="text-sm font-medium truncate" style={{ color: INK }}>{h.title}</span>
              </span>
              <span className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs" style={{ color: "#5C7A7D" }}>{new Date(h.date).toLocaleDateString("he-IL")}</span>
                <ChevronDown size={16} style={{ color: SCRUB, transform: open === i ? "rotate(180deg)" : "none", transition: "transform .25s" }} />
              </span>
            </button>
            {open === i && (
              <div className="px-4 pb-4 text-sm leading-relaxed whitespace-pre-wrap fade-in" style={{ color: "#2E4A4E" }}>{h.text}</div>
            )}
          </div>
        ))}
      </div>

      {history.length > 0 && (
        <button onClick={doClear}
          className="mt-5 flex items-center gap-1.5 text-sm px-4 py-2 rounded-full border"
          style={{ borderColor: "#B3261E", color: "#B3261E" }}>
          <Trash2 size={15} /> {confirmClear ? "בטוחים? לחיצה נוספת תמחק הכול" : "מחיקת כל ההיסטוריה"}
        </button>
      )}
    </div>
  );
}
