import React, { useState } from "react";
import { Stethoscope, UserRound, Plus, X, ArrowLeft } from "lucide-react";
import { INK, SCRUB, SCRUB_SOFT } from "../theme.js";
import { listProfiles, createProfile, setActiveProfile, removeProfile } from "../lib/store.js";

export default function Welcome({ onEnter }) {
  const [profiles, setProfiles] = useState(listProfiles());
  const [name, setName] = useState("");
  const [confirmDel, setConfirmDel] = useState(null);

  const enter = (n) => {
    setActiveProfile(n);
    onEnter(n);
  };

  const create = () => {
    const n = name.trim().slice(0, 30);
    if (!n) return;
    createProfile(n);
    enter(n);
  };

  const del = (n) => {
    if (confirmDel !== n) { setConfirmDel(n); return; }
    removeProfile(n);
    setProfiles(listProfiles());
    setConfirmDel(null);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10 fade-in">
      <div className="text-center mb-8">
        <span className="inline-block p-4 rounded-3xl mb-4" style={{ background: INK }}>
          <Stethoscope size={36} color="#7FC8BE" />
        </span>
        <h1 className="font-display text-3xl font-black" style={{ color: INK }}>התחנה השביעית</h1>
        <p className="text-sm mt-2 leading-relaxed" style={{ color: "#3E5A5E" }}>
          מי מתרגל היום? ההתקדמות — בנק האירועים, הצ'קליסט וההיסטוריה — נשמרת בנפרד לכל שם, בדפדפן הזה בלבד.
        </p>
      </div>

      {profiles.length > 0 && (
        <div className="space-y-2 mb-6">
          {profiles.map((p) => (
            <div key={p} className="flex items-center gap-2">
              <button onClick={() => enter(p)}
                className="flex-1 flex items-center justify-between bg-white rounded-2xl border p-4 text-right transition-transform active:scale-95"
                style={{ borderColor: "#E2EBE9" }}>
                <span className="flex items-center gap-3">
                  <span className="p-2 rounded-full" style={{ background: SCRUB_SOFT, color: SCRUB }}><UserRound size={18} /></span>
                  <span className="font-medium" style={{ color: INK }}>{p}</span>
                </span>
                <ArrowLeft size={17} style={{ color: SCRUB }} />
              </button>
              <button onClick={() => del(p)} title={confirmDel === p ? "לחיצה נוספת תמחק לצמיתות" : "מחיקת הפרופיל וכל הנתונים שלו"}
                className="p-2.5 rounded-full border flex-shrink-0 text-xs"
                style={confirmDel === p ? { background: "#B3261E", color: "white", borderColor: "#B3261E" } : { borderColor: "#E2EBE9", color: "#7A9296" }}>
                <X size={15} />
              </button>
            </div>
          ))}
          {confirmDel && <p className="text-xs" style={{ color: "#B3261E" }}>מחיקת פרופיל מוחקת גם את כל ההתקדמות שלו. לחיצה נוספת על ✕ תאשר.</p>}
        </div>
      )}

      <div className="bg-white rounded-2xl border p-4" style={{ borderColor: "#E2EBE9" }}>
        <p className="text-sm font-medium mb-2" style={{ color: INK }}>{profiles.length > 0 ? "או הוספת מתרגל/ת חדש/ה:" : "איך קוראים לך?"}</p>
        <div className="flex gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && create()}
            placeholder="השם שלי..." autoFocus={profiles.length === 0} maxLength={30}
            className="flex-1 rounded-full border px-4 py-2 text-sm outline-none"
            style={{ borderColor: "#CFE0DD", color: INK }} />
          <button onClick={create} disabled={!name.trim()}
            className="flex items-center gap-1 px-4 py-2 rounded-full text-white text-sm font-medium"
            style={{ background: SCRUB, opacity: name.trim() ? 1 : 0.5 }}>
            <Plus size={16} /> כניסה
          </button>
        </div>
      </div>
    </div>
  );
}
