import React, { useState } from "react";
import { Timer, Users, Mic, Scale, ClipboardList } from "lucide-react";
import { INK } from "../theme.js";
import { SectionTitle } from "./common.jsx";
import Simulation from "./Simulation.jsx";
import WrittenStation from "./WrittenStation.jsx";
import ExamDay from "./ExamDay.jsx";

export default function Stations() {
  const [sub, setSub] = useState("sim");
  const tabs = [
    { id: "sim", t: "סימולציה מול שחקן", icon: Users },
    { id: "interview", t: "ראיון אישי", icon: Mic },
    { id: "dilemma", t: "תחנת דילמה", icon: Scale },
    { id: "examday", t: "יום מבחן מלא", icon: ClipboardList },
  ];
  return (
    <div className="fade-in">
      <SectionTitle icon={Timer} title="סימולטור יום התחנות" sub="55% מהציון. שלושה סוגי תחנות — סימולציה חיה מול שחקן AI שמגיב אליכם בזמן אמת, ראיון ודילמה — כולן עם טיימר ותחקיר מעריך." />
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setSub(t.id)}
            className="flex items-center gap-1.5 flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border"
            style={sub === t.id ? { background: INK, color: "white", borderColor: INK } : { background: "white", color: "#2E4A4E", borderColor: "#CFE0DD" }}>
            <t.icon size={15} /> {t.t}
          </button>
        ))}
      </div>
      {sub === "sim" && <Simulation />}
      {sub === "interview" && <WrittenStation kind="interview" />}
      {sub === "dilemma" && <WrittenStation kind="dilemma" />}
      {sub === "examday" && <ExamDay />}
    </div>
  );
}
