import React, { useState } from "react";
import {
  Stethoscope, Timer, FileText, Brain, CheckCircle2, BookOpen, Users, TrendingUp,
} from "lucide-react";
import { FONT_CSS, INK, SCRUB, SCRUB_SOFT, PAPER } from "./theme.js";
import Home from "./components/Home.jsx";
import InfoGuide from "./components/InfoGuide.jsx";
import Bio from "./components/Bio.jsx";
import Stations from "./components/Stations.jsx";
import Tracks from "./components/Tracks.jsx";
import Shaul from "./components/Shaul.jsx";
import Tips from "./components/Tips.jsx";
import Progress from "./components/Progress.jsx";

/* ============================================================
   התחנה השביעית — הכנה למבחני האישיות לרפואה (מו"ר / מרק"ם / מר"ב)
   ============================================================ */

export default function App() {
  const [tab, setTab] = useState("home");
  const NAV = [
    { id: "home", t: "בית", icon: Stethoscope },
    { id: "info", t: "מדריך", icon: BookOpen },
    { id: "bio", t: "ביוגרפי", icon: FileText },
    { id: "stations", t: "תחנות", icon: Timer },
    { id: "tracks", t: "צפת/חיפה", icon: Users },
    { id: "shaul", t: 'של"ו', icon: Brain },
    { id: "progress", t: "התקדמות", icon: TrendingUp },
    { id: "tips", t: "טיפים", icon: CheckCircle2 },
  ];

  return (
    <div dir="rtl" className="font-body min-h-screen" style={{ background: PAPER }}>
      <style>{FONT_CSS}</style>

      <header className="sticky top-0 z-20 border-b" style={{ background: "rgba(251,252,251,.92)", backdropFilter: "blur(8px)", borderColor: "#E2EBE9" }}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => setTab("home")} className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg" style={{ background: INK }}><Stethoscope size={18} color="#7FC8BE" /></span>
            <span className="font-display font-black text-lg" style={{ color: INK }}>התחנה השביעית</span>
          </button>
          <nav className="hidden md:flex gap-1">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => setTab(n.id)}
                className="px-3 py-1.5 rounded-full text-sm font-medium"
                style={tab === n.id ? { background: SCRUB_SOFT, color: SCRUB } : { color: "#3E5A5E" }}>
                {n.t}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-10">
        {tab === "home" && <Home go={setTab} />}
        {tab === "info" && <InfoGuide />}
        {tab === "bio" && <Bio />}
        {tab === "stations" && <Stations />}
        {tab === "tracks" && <Tracks />}
        {tab === "shaul" && <Shaul />}
        {tab === "progress" && <Progress />}
        {tab === "tips" && <Tips />}
      </main>

      {/* ניווט תחתון לנייד */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 border-t flex justify-around py-1.5 overflow-x-auto"
        style={{ background: "white", borderColor: "#E2EBE9" }}>
        {NAV.map((n) => (
          <button key={n.id} onClick={() => setTab(n.id)} className="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-xl flex-shrink-0"
            style={{ color: tab === n.id ? SCRUB : "#7A9296" }}>
            <n.icon size={19} />
            <span style={{ fontSize: 10 }}>{n.t}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
