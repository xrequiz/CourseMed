import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { INK, SCRUB, SCRUB_SOFT } from "../theme.js";
import { DILEMMAS, INTERVIEW_QS } from "../data.js";
import { callClaude } from "../lib/api.js";
import { addHistory } from "../lib/store.js";
import { RingTimer, FeedbackBox, MicButton } from "./common.jsx";

export default function WrittenStation({ kind }) {
  const items = kind === "dilemma" ? DILEMMAS : INTERVIEW_QS.map((q, i) => ({ id: i, title: `שאלה ${i + 1}`, text: q }));
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const item = items[idx];

  const getFeedback = async () => {
    if (answer.trim().length < 30) { setFeedback("כתבו את עיקרי הדברים שהייתם אומרים בקול — לפחות כמה משפטים."); return; }
    setLoading(true); setError(false); setFeedback("");
    try {
      const text = await callClaude(
        kind === "dilemma" ? "dilemma-feedback" : "interview-q-feedback",
        [{ role: "user", content: `${kind === "dilemma" ? "הדילמה" : "שאלת הראיון"}: ${item.text}\n\nהתשובה שלי (עיקרי הדברים שאומר בקול):\n${answer}` }],
        { onText: setFeedback }
      );
      setFeedback(text);
      addHistory(kind === "dilemma" ? "dilemma" : "interview", kind === "dilemma" ? item.title : item.text, text);
    } catch (e) { setError(e && e.message ? String(e.message) : true); }
    setLoading(false);
  };

  return (
    <div>
      <div className="bg-white rounded-2xl border p-4 mb-4" style={{ borderColor: "#E2EBE9" }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: SCRUB_SOFT, color: SCRUB }}>
            {idx + 1} / {items.length}{kind === "dilemma" ? ` · ${item.title}` : ""}
          </span>
          <div className="flex gap-2">
            <button onClick={() => { setIdx((idx - 1 + items.length) % items.length); setAnswer(""); setFeedback(""); setError(false); }} className="text-sm px-3 py-1 rounded-full border" style={{ borderColor: SCRUB, color: SCRUB }}>הקודמת</button>
            <button onClick={() => { setIdx((idx + 1) % items.length); setAnswer(""); setFeedback(""); setError(false); }} className="text-sm px-3 py-1 rounded-full text-white" style={{ background: SCRUB }}>הבאה</button>
          </div>
        </div>
        <p className="font-display text-lg font-bold leading-relaxed" style={{ color: INK }}>{item.text}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="bg-white rounded-2xl border p-4 flex-shrink-0 mx-auto md:mx-0" style={{ borderColor: "#E2EBE9" }}>
          <RingTimer totalSeconds={kind === "dilemma" ? 8 * 60 : 5 * 60} label={kind === "dilemma" ? "דיון בדילמה" : "זמן תשובה"} autoKey={`${kind}-${idx}`} />
          <p className="text-xs mt-3 max-w-[140px] text-center mx-auto" style={{ color: "#5C7A7D" }}>מומלץ לענות קודם בקול רם, ואז לסכם כאן את עיקרי הדברים למשוב.</p>
        </div>
        <div className="flex-1 w-full">
          <textarea value={answer} onChange={(e) => setAnswer(e.target.value)}
            placeholder={kind === "dilemma" ? "אילו ערכים מתנגשים? מה הצדדים? מה הכרעתי ולמה? מה המחיר?" : "עיקרי התשובה שלי..."}
            className="w-full h-48 rounded-2xl border p-4 text-sm leading-relaxed outline-none bg-white"
            style={{ borderColor: "#E2EBE9", color: INK }} />
          <div className="flex items-center gap-2 mt-2">
            <button onClick={getFeedback} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium"
              style={{ background: SCRUB, opacity: loading ? 0.6 : 1 }}>
              <Sparkles size={16} /> קבלת משוב מעריך
            </button>
            <MicButton onText={(t) => setAnswer((v) => (v ? v.trimEnd() + " " : "") + t)} disabled={loading} />
          </div>
          <FeedbackBox loading={loading} text={feedback} error={error} />
        </div>
      </div>
    </div>
  );
}
