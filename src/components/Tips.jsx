import React, { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { INK, SCRUB, SCRUB_SOFT } from "../theme.js";
import { TIPS, CHECKLIST } from "../data.js";
import { loadStore, saveStore } from "../lib/store.js";
import { SectionTitle } from "./common.jsx";

export default function Tips() {
  const [checked, setChecked] = useState({});
  useEffect(() => { setChecked(loadStore("checklist", {})); }, []);
  const toggle = (i) => {
    const next = { ...checked, [i]: !checked[i] };
    setChecked(next); saveStore("checklist", next);
  };
  const doneCount = CHECKLIST.filter((_, i) => checked[i]).length;

  return (
    <div className="fade-in">
      <SectionTitle icon={CheckCircle2} title="טיפים וצ'קליסט מוכנות" sub="העקרונות שחוזרים שוב ושוב אצל מי שמצליחים — ורשימת המשימות שלכם עד יום המבחן (נשמרת אוטומטית)." />

      <div className="grid md:grid-cols-2 gap-3 mb-7">
        {TIPS.map((t, i) => (
          <div key={i} className="bg-white rounded-2xl border p-4" style={{ borderColor: "#E2EBE9" }}>
            <div className="font-medium text-sm mb-1" style={{ color: SCRUB }}>{t.h}</div>
            <p className="text-sm leading-relaxed" style={{ color: "#2E4A4E" }}>{t.p}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border p-4" style={{ borderColor: "#E2EBE9" }}>
        <div className="flex items-center justify-between mb-3">
          <span className="font-display font-bold" style={{ color: INK }}>צ'קליסט המוכנות שלי</span>
          <span className="text-sm font-medium" style={{ color: doneCount === CHECKLIST.length ? SCRUB : "#5C7A7D" }}>{doneCount}/{CHECKLIST.length}</span>
        </div>
        <div className="h-2 rounded-full mb-4" style={{ background: SCRUB_SOFT }}>
          <div className="h-2 rounded-full" style={{ background: SCRUB, width: `${(doneCount / CHECKLIST.length) * 100}%`, transition: "width .4s" }} />
        </div>
        <div className="space-y-2">
          {CHECKLIST.map((c, i) => (
            <button key={i} onClick={() => toggle(i)} className="w-full flex items-start gap-3 text-right p-2 rounded-xl"
              style={{ background: checked[i] ? "#F1F8F6" : "transparent" }}>
              <span className="flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center mt-0.5"
                style={{ borderColor: SCRUB, background: checked[i] ? SCRUB : "white" }}>
                {checked[i] && <CheckCircle2 size={14} color="white" />}
              </span>
              <span className="text-sm leading-relaxed" style={{ color: checked[i] ? "#5C7A7D" : INK, textDecoration: checked[i] ? "line-through" : "none" }}>{c}</span>
            </button>
          ))}
        </div>
        {doneCount === CHECKLIST.length && (
          <div className="mt-4 rounded-xl p-3 text-sm font-medium text-center fade-in" style={{ background: SCRUB_SOFT, color: SCRUB }}>
            🩺 כל הכבוד — נראה שאתם מוכנים. נשימה עמוקה, ושיהיה בהצלחה!
          </div>
        )}
      </div>
    </div>
  );
}
