import React, { useState, useEffect } from "react";
import { FileText, Sparkles, Save, ClipboardList, ChevronDown } from "lucide-react";
import { INK, SCRUB, SCRUB_SOFT } from "../theme.js";
import { BIO_QUESTIONS } from "../data.js";
import { callClaude } from "../lib/api.js";
import { loadStore, saveStore, addHistory } from "../lib/store.js";
import { RingTimer, FeedbackBox, SectionTitle, MicButton } from "./common.jsx";

export default function Bio() {
  const [qi, setQi] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [saved, setSaved] = useState([]);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => { setSaved(loadStore("bio-answers", [])); }, []);

  const q = BIO_QUESTIONS[qi];

  const getFeedback = async () => {
    if (answer.trim().length < 40) { setFeedback("כתבו תשובה מלאה יותר (לפחות כמה משפטים) כדי לקבל משוב משמעותי."); return; }
    setLoading(true); setError(false); setFeedback("");
    try {
      const text = await callClaude(
        "bio-feedback",
        [{ role: "user", content: `השאלה: ${q.q}\n\nהתשובה שלי:\n${answer}` }],
        { onText: setFeedback }
      );
      setFeedback(text);
      addHistory("bio", q.q, text);
    } catch (e) { setError(e && e.message ? String(e.message) : true); }
    setLoading(false);
  };

  const save = () => {
    const item = { q: q.q, a: answer, date: new Date().toLocaleDateString("he-IL") };
    const next = [item, ...saved].slice(0, 30);
    setSaved(next); saveStore("bio-answers", next);
  };

  return (
    <div className="fade-in">
      <SectionTitle icon={FileText} title="תרגול השאלון הביוגרפי" sub="30% מהציון. במבחן האמיתי: כשעתיים וחצי של כתיבה. כאן: שאלה אחת, טיימר של 15 דקות, ומשוב מעריך." />

      <div className="bg-white rounded-2xl border p-4 mb-4" style={{ borderColor: "#E2EBE9" }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: SCRUB_SOFT, color: SCRUB }}>שאלה {qi + 1} מתוך {BIO_QUESTIONS.length}</span>
          <div className="flex gap-2">
            <button onClick={() => { setQi((qi - 1 + BIO_QUESTIONS.length) % BIO_QUESTIONS.length); setAnswer(""); setFeedback(""); setError(false); }} className="text-sm px-3 py-1 rounded-full border" style={{ borderColor: SCRUB, color: SCRUB }}>הקודמת</button>
            <button onClick={() => { setQi((qi + 1) % BIO_QUESTIONS.length); setAnswer(""); setFeedback(""); setError(false); }} className="text-sm px-3 py-1 rounded-full text-white" style={{ background: SCRUB }}>הבאה</button>
          </div>
        </div>
        <p className="font-display text-lg font-bold leading-relaxed" style={{ color: INK }}>{q.q}</p>
        <p className="text-xs mt-2" style={{ color: "#5C7A7D" }}>מה נמדד כאן: {q.focus}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="bg-white rounded-2xl border p-4 flex-shrink-0 mx-auto md:mx-0" style={{ borderColor: "#E2EBE9" }}>
          <RingTimer totalSeconds={15 * 60} label="זמן כתיבה" autoKey={qi} />
        </div>
        <div className="flex-1 w-full">
          <textarea value={answer} onChange={(e) => setAnswer(e.target.value)}
            placeholder="רקע קצר ← האירוע ← מה עשיתם בפועל ← התוצאה ← מה למדתם..."
            className="w-full h-56 rounded-2xl border p-4 text-sm leading-relaxed outline-none"
            style={{ borderColor: "#E2EBE9", color: INK, background: "white" }} />
          <div className="text-xs mt-1" style={{ color: "#5C7A7D" }}>
            {answer.trim() ? answer.trim().split(/\s+/).length : 0} מילים · תשובה ביוגרפית טובה היא לרוב 150–300 מילים
          </div>
          <div className="flex flex-wrap gap-2 mt-2 items-center">
            <button onClick={getFeedback} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium"
              style={{ background: SCRUB, opacity: loading ? 0.6 : 1 }}>
              <Sparkles size={16} /> קבלת משוב מעריך
            </button>
            <button onClick={save} disabled={!answer.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm border"
              style={{ borderColor: SCRUB, color: SCRUB, opacity: answer.trim() ? 1 : 0.5 }}>
              <Save size={16} /> שמירה לבנק האירועים
            </button>
            <MicButton onText={(t) => setAnswer((v) => (v ? v.trimEnd() + " " : "") + t)} disabled={loading} />
          </div>
          <FeedbackBox loading={loading} text={feedback} error={error} />
        </div>
      </div>

      <div className="mt-6">
        <button onClick={() => setShowSaved(!showSaved)} className="text-sm font-medium flex items-center gap-1" style={{ color: SCRUB }}>
          <ClipboardList size={16} /> בנק האירועים שלי ({saved.length}) <ChevronDown size={15} style={{ transform: showSaved ? "rotate(180deg)" : "none" }} />
        </button>
        {showSaved && (
          <div className="space-y-2 mt-3">
            {saved.length === 0 && <p className="text-sm" style={{ color: "#5C7A7D" }}>עוד אין תשובות שמורות. כתבו תשובה ולחצו ״שמירה״ — כך תבנו בנק אירועים אישי לקראת המבחן.</p>}
            {saved.map((s, i) => (
              <div key={i} className="bg-white rounded-xl border p-3 text-sm" style={{ borderColor: "#E2EBE9" }}>
                <div className="font-medium mb-1" style={{ color: SCRUB }}>{s.date} · {s.q}</div>
                <div className="whitespace-pre-wrap leading-relaxed" style={{ color: "#2E4A4E" }}>{s.a}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
