import React, { useState } from "react";
import { INK, SCRUB, SCRUB_SOFT, AMBER } from "../theme.js";
import { SIM_SCENARIOS } from "../data.js";
import { callClaude } from "../lib/api.js";
import { addHistory } from "../lib/store.js";
import { RingTimer, FeedbackBox, ChatThread } from "./common.jsx";

export default function Simulation() {
  const [si, setSi] = useState(0);
  const [phase, setPhase] = useState("brief"); // brief | live | debrief
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [debrief, setDebrief] = useState("");
  const [debriefLoading, setDebriefLoading] = useState(false);
  const [error, setError] = useState(false);

  const sc = SIM_SCENARIOS[si];

  const start = () => { setMsgs([{ role: "assistant", content: sc.opening }]); setPhase("live"); setDebrief(""); };

  const send = async () => {
    if (!input.trim() || busy) return;
    const userMsg = { role: "user", content: input.trim() };
    const next = [...msgs, userMsg];
    setMsgs(next); setInput(""); setBusy(true); setError(false);
    try {
      const reply = await callClaude(`sim-actor:${sc.id}`, next, {
        maxTokens: 400,
        onText: (t) => setMsgs([...next, { role: "assistant", content: t }]),
      });
      setMsgs([...next, { role: "assistant", content: reply }]);
    } catch (e) { setError(e && e.message ? String(e.message) : true); }
    setBusy(false);
  };

  const endStation = async () => {
    const userTurns = msgs.filter((m) => m.role === "user").length;
    setPhase("debrief");
    if (userTurns < 2) {
      setDebrief("השיחה הייתה קצרה מדי בשביל משוב משמעותי. בתחנה אמיתית יש לכם 10 דקות — נסו לנהל לפחות 4-5 חילופי דברים: פתיחה, הקשבה ושיקוף, בירור, והצעת כיוון. לחצו 'תרגול חוזר' ונסו שוב.");
      return;
    }
    setDebriefLoading(true); setDebrief("");
    try {
      const transcript = msgs.map((m) => `${m.role === "user" ? "המועמד/ת" : "השחקן"}: ${m.content}`).join("\n");
      const text = await callClaude(
        `sim-debrief:${sc.id}`,
        [{ role: "user", content: `התמליל:\n${transcript}` }],
        { onText: setDebrief }
      );
      setDebrief(text);
      addHistory("sim", sc.title, text);
    } catch (e) { setError(e && e.message ? String(e.message) : true); }
    setDebriefLoading(false);
  };

  const reset = (newIdx) => {
    if (typeof newIdx === "number") setSi(newIdx);
    setPhase("brief"); setMsgs([]); setDebrief(""); setInput(""); setError(false);
  };

  const waiting = busy && msgs.length > 0 && msgs[msgs.length - 1].role === "user";

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {SIM_SCENARIOS.map((s, i) => (
          <button key={s.id} onClick={() => reset(i)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-sm border"
            style={si === i ? { background: SCRUB, color: "white", borderColor: SCRUB } : { borderColor: "#CFE0DD", color: "#2E4A4E", background: "white" }}>
            {s.title}
          </button>
        ))}
      </div>

      {phase === "brief" && (
        <div className="bg-white rounded-2xl border p-5 fade-in" style={{ borderColor: "#E2EBE9" }}>
          <div className="text-xs font-medium mb-2" style={{ color: AMBER }}>דף הנחיות — כמו במבחן, יש לכם כ-2 דקות לקרוא ולהתארגן</div>
          <h3 className="font-display text-xl font-bold mb-2" style={{ color: INK }}>{sc.title}</h3>
          <p className="text-sm leading-7 mb-4" style={{ color: "#2E4A4E" }}>{sc.task}</p>
          <div className="flex flex-col items-center gap-4">
            <RingTimer totalSeconds={120} label="התארגנות" autoKey={si} />
            <button onClick={start} className="px-6 py-2.5 rounded-full text-white font-medium" style={{ background: SCRUB }}>
              להיכנס לתחנה ←
            </button>
          </div>
        </div>
      )}

      {phase !== "brief" && (
        <div className="bg-white rounded-2xl border overflow-hidden fade-in" style={{ borderColor: "#E2EBE9" }}>
          <div className="flex items-center justify-between p-3 border-b" style={{ background: SCRUB_SOFT, borderColor: "#CFE0DD" }}>
            <span className="text-sm font-medium" style={{ color: INK }}>🎭 {sc.title} — סימולציה חיה</span>
            {phase === "live" && (
              <button onClick={endStation} className="text-xs px-3 py-1.5 rounded-full text-white" style={{ background: AMBER }}>
                סיום התחנה ותחקיר
              </button>
            )}
          </div>
          <ChatThread msgs={msgs} busy={waiting} error={phase === "live" ? error : false}
            input={input} setInput={setInput} onSend={send}
            placeholder="מה תגידו? דברו טבעי, כמו בשיחה אמיתית..."
            showInput={phase === "live"} />
          {phase === "debrief" && (
            <div className="p-4 border-t" style={{ borderColor: "#E2EBE9" }}>
              <FeedbackBox loading={debriefLoading} text={debrief} error={error && !debriefLoading} />
              <button onClick={() => reset()} className="mt-3 text-sm px-4 py-2 rounded-full border" style={{ borderColor: SCRUB, color: SCRUB }}>
                תרגול חוזר
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
