import React, { useState } from "react";
import { BookOpen, ChevronDown } from "lucide-react";
import { INK, SCRUB } from "../theme.js";
import { INFO_SECTIONS } from "../data.js";
import { SectionTitle } from "./common.jsx";

export default function InfoGuide() {
  const [open, setOpen] = useState(0);
  return (
    <div className="fade-in">
      <SectionTitle icon={BookOpen} title="המדריך המלא" sub="כל מה שצריך להבין על מבני המבחנים, השקלול ומה באמת נמדד — לפני שמתחילים לתרגל." />
      <div className="space-y-3">
        {INFO_SECTIONS.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#E2EBE9" }}>
            <button onClick={() => setOpen(open === i ? -1 : i)} className="w-full flex items-center justify-between p-4 text-right">
              <span className="font-medium" style={{ color: INK }}>{s.title}</span>
              <ChevronDown size={18} style={{ color: SCRUB, transform: open === i ? "rotate(180deg)" : "none", transition: "transform .25s" }} />
            </button>
            {open === i && <div className="px-4 pb-4 text-sm leading-7 fade-in" style={{ color: "#2E4A4E" }}>{s.body}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
