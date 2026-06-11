import React from "react";
import { ArrowLeft, Info } from "lucide-react";
import { INK, SCRUB, SCRUB_SOFT, AMBER } from "../theme.js";

export default function Home({ go }) {
  const stations = ["סימולציה", "סימולציה", "ראיון", "דילמה", "ראיון", "סימולציה"];
  return (
    <div className="fade-in">
      <div className="rounded-3xl p-6 md:p-10 mb-6 relative overflow-hidden" style={{ background: INK }}>
        <div className="absolute -left-10 -top-10 w-48 h-48 rounded-full opacity-20" style={{ background: SCRUB }} />
        <p className="text-sm tracking-widest mb-2" style={{ color: "#7FC8BE" }}>מו"ר · מרק"ם · מר"ב</p>
        <h1 className="font-display text-3xl md:text-5xl font-black text-white leading-tight">
          ביום המבחן יש שש תחנות.<br />
          <span style={{ color: "#7FC8BE" }}>זאת התחנה השביעית.</span>
        </h1>
        <p className="text-white text-opacity-80 mt-4 max-w-xl leading-relaxed">
          המקום לתרגל בו את כל מה שמבחני האישיות לרפואה בודקים — ביוגרפי בזמן אמת, סימולציות מול שחקן AI, דילמות, ראיונות ושאלון של"ו — עם משוב מיידי.
        </p>
        <button onClick={() => go("stations")}
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-medium"
          style={{ background: "#7FC8BE", color: INK }}>
          להתחיל לתרגל <ArrowLeft size={17} />
        </button>
      </div>

      {/* רצועת התחנות */}
      <div className="rounded-2xl p-4 mb-6 bg-white border" style={{ borderColor: "#E2EBE9" }}>
        <p className="text-xs mb-3 font-medium" style={{ color: SCRUB }}>כך נראה יום התחנות — כ-10 דקות לתחנה, כ-2 דקות מעבר</p>
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {stations.map((s, i) => (
            <React.Fragment key={i}>
              <div className="flex-shrink-0 rounded-xl px-3 py-2 text-center" style={{ background: SCRUB_SOFT }}>
                <div className="text-xs" style={{ color: SCRUB }}>תחנה {i + 1}</div>
                <div className="text-sm font-medium" style={{ color: INK }}>{s}</div>
              </div>
              {i < 5 && <div className="flex-shrink-0 w-3 h-px" style={{ background: SCRUB }} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* שקלול */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { pct: "55%", t: "מרכז ההערכה", d: "שש תחנות", tab: "stations" },
          { pct: "30%", t: "שאלון ביוגרפי", d: "כתיבה אישית", tab: "bio" },
          { pct: "15%", t: "שאלון של\"ו", d: "אישיות ממוחשב", tab: "shaul" },
        ].map((c) => (
          <button key={c.t} onClick={() => go(c.tab)} className="rounded-2xl p-4 text-right bg-white border transition-transform active:scale-95"
            style={{ borderColor: "#E2EBE9" }}>
            <div className="font-display text-3xl font-black" style={{ color: SCRUB }}>{c.pct}</div>
            <div className="font-medium text-sm mt-1" style={{ color: INK }}>{c.t}</div>
            <div className="text-xs" style={{ color: "#5C7A7D" }}>{c.d}</div>
          </button>
        ))}
      </div>

      <div className="rounded-2xl p-4 flex gap-3 items-start" style={{ background: "#FFF6E8", border: "1px solid #F0DDBE" }}>
        <Info size={20} style={{ color: AMBER }} className="flex-shrink-0 mt-0.5" />
        <p className="text-sm leading-relaxed" style={{ color: "#6B4E16" }}>
          האפליקציה מבוססת על מבנה המבחנים כפי שפורסם בשנים האחרונות. פרטים (מספר תחנות, משקלים, מועדים) משתנים מדי שנה — אמתו תמיד מול הפרסום הרשמי של מאל"ו ושל המוסדות.
        </p>
      </div>
    </div>
  );
}
