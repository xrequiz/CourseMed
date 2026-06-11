import React, { useState } from "react";
import { INK, SCRUB, SCRUB_SOFT, AMBER } from "../theme.js";
import { callClaude } from "../lib/api.js";
import { addHistory } from "../lib/store.js";
import { RingTimer, FeedbackBox, ChatThread } from "./common.jsx";

export default function InterviewerChat({ cfg }) {
  const [phase, setPhase] = useState("intro"); // intro | live | debrief
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [debrief, setDebrief] = useState("");
  const [debriefLoading, setDebriefLoading] = useState(false);
  const [error, setError] = useState(false);

  const send = async () => {
    if (!input.trim() || busy) return;
    const next = [...msgs, { role: "user", content: input.trim() }];
    setMsgs(next); setInput(""); setBusy(true); setError(false);
    try {
      const reply = await callClaude(`interview:${cfg.id}`, next, {
        maxTokens: 450,
        onText: (t) => setMsgs([...next, { role: "assistant", content: t }]),
      });
      setMsgs([...next, { role: "assistant", content: reply }]);
    } catch (e) { setError(e && e.message ? String(e.message) : true); }
    setBusy(false);
  };

  const endInterview = async () => {
    const userTurns = msgs.filter((m) => m.role === "user").length;
    setPhase("debrief");
    if (userTurns < 2) {
      setDebrief("הריאיון היה קצר מדי בשביל משוב משמעותי. ענו לפחות על 2-3 שאלות (כולל שאלות ההמשך) ונסו שוב.");
      return;
    }
    setDebriefLoading(true); setDebrief("");
    try {
      const transcript = msgs.map((m) => `${m.role === "user" ? "המועמד/ת" : "המראיינים"}: ${m.content}`).join("\n");
      const text = await callClaude(
        `interview-feedback:${cfg.id}`,
        [{ role: "user", content: `התמליל:\n${transcript}` }],
        { onText: setDebrief }
      );
      setDebrief(text);
      addHistory("track", cfg.title, text);
    } catch (e) { setError(e && e.message ? String(e.message) : true); }
    setDebriefLoading(false);
  };

  if (phase === "intro") return (
    <div className="bg-white rounded-2xl border p-5 fade-in" style={{ borderColor: "#E2EBE9" }}>
      <h3 className="font-display text-xl font-bold mb-2" style={{ color: INK }}>{cfg.title}</h3>
      <p className="text-sm leading-7 mb-4" style={{ color: "#2E4A4E" }}>{cfg.note} הקלידו את תשובותיכם בשיחה (או דברו דרך כפתור המיקרופון) — המראיינים ישאלו שאלות המשך על מה שתענו, בדיוק כמו בריאיון אמיתי.</p>
      <div className="flex flex-col items-center gap-4">
        <RingTimer totalSeconds={cfg.minutes * 60} label="משך הריאיון" autoKey={cfg.id} />
        <button onClick={() => { setMsgs([{ role: "assistant", content: cfg.opening }]); setPhase("live"); }}
          className="px-6 py-2.5 rounded-full text-white font-medium" style={{ background: SCRUB }}>
          להיכנס לריאיון ←
        </button>
      </div>
    </div>
  );

  const waiting = busy && msgs.length > 0 && msgs[msgs.length - 1].role === "user";

  return (
    <div className="bg-white rounded-2xl border overflow-hidden fade-in" style={{ borderColor: "#E2EBE9" }}>
      <div className="flex items-center justify-between p-3 border-b" style={{ background: SCRUB_SOFT, borderColor: "#CFE0DD" }}>
        <span className="text-sm font-medium" style={{ color: INK }}>🪑 {cfg.title}</span>
        {phase === "live" && (
          <button onClick={endInterview} className="text-xs px-3 py-1.5 rounded-full text-white" style={{ background: AMBER }}>
            סיום הריאיון ומשוב
          </button>
        )}
      </div>
      <ChatThread msgs={msgs} busy={waiting} error={phase === "live" ? error : false}
        input={input} setInput={setInput} onSend={send}
        placeholder="התשובה שלי..." maxHeight={340}
        showInput={phase === "live"} />
      {phase === "debrief" && (
        <div className="p-4 border-t" style={{ borderColor: "#E2EBE9" }}>
          <FeedbackBox loading={debriefLoading} text={debrief} error={error && !debriefLoading} />
          <button onClick={() => { setPhase("intro"); setMsgs([]); setDebrief(""); setError(false); }}
            className="mt-3 text-sm px-4 py-2 rounded-full border" style={{ borderColor: SCRUB, color: SCRUB }}>
            ריאיון חדש
          </button>
        </div>
      )}
    </div>
  );
}
