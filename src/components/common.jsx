import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Sparkles, Loader2, Send, Mic, Square } from "lucide-react";
import { INK, SCRUB, SCRUB_SOFT, AMBER } from "../theme.js";

export function RingTimer({ totalSeconds, label, autoKey, autoStart = false, onExpire }) {
  const [left, setLeft] = useState(totalSeconds);
  const [running, setRunning] = useState(false);
  const ref = useRef(null);
  const onExpireRef = useRef(onExpire);
  const firedRef = useRef(false);

  useEffect(() => { onExpireRef.current = onExpire; });

  useEffect(() => {
    setLeft(totalSeconds);
    setRunning(Boolean(autoStart));
    firedRef.current = false;
  }, [totalSeconds, autoKey, autoStart]);

  useEffect(() => {
    if (!running) return;
    ref.current = setInterval(() => {
      setLeft((p) => {
        if (p <= 1) { clearInterval(ref.current); setRunning(false); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [running]);

  useEffect(() => {
    if (left === 0 && !firedRef.current) {
      firedRef.current = true;
      if (onExpireRef.current) onExpireRef.current();
    }
  }, [left]);

  const r = 52, c = 2 * Math.PI * r;
  const frac = totalSeconds > 0 ? left / totalSeconds : 0;
  const warn = left <= 60 && left > 0;
  const done = left === 0;
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: 132, height: 132 }}>
        <svg width="132" height="132" className="-rotate-90">
          <circle cx="66" cy="66" r={r} fill="none" stroke={SCRUB_SOFT} strokeWidth="9" />
          <circle cx="66" cy="66" r={r} fill="none"
            stroke={done ? "#B3261E" : warn ? AMBER : SCRUB}
            strokeWidth="9" strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={c * (1 - frac)}
            style={{ transition: "stroke-dashoffset 1s linear, stroke .4s" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-bold tabular-nums" style={{ color: done ? "#B3261E" : INK }}>{mm}:{ss}</span>
          <span className="text-xs" style={{ color: SCRUB }}>{label}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => { if (left === 0) return; setRunning((v) => !v); }}
          className="flex items-center gap-1 px-4 py-1.5 rounded-full text-white text-sm font-medium"
          style={{ background: SCRUB }}>
          {running ? <Pause size={15} /> : <Play size={15} />} {running ? "השהיה" : "הפעלה"}
        </button>
        <button onClick={() => { setLeft(totalSeconds); setRunning(false); firedRef.current = false; }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border"
          style={{ borderColor: SCRUB, color: SCRUB }}>
          <RotateCcw size={15} /> איפוס
        </button>
      </div>
      {done && <div className="text-sm font-medium" style={{ color: "#B3261E" }}>הזמן נגמר — בדיוק כמו במבחן 🙂</div>}
    </div>
  );
}

export function FeedbackBox({ loading, text, error }) {
  if (!loading && !text && !error) return null;
  return (
    <div className="rounded-2xl p-4 mt-4 fade-in" style={{ background: SCRUB_SOFT, border: `1px solid ${SCRUB}33` }}>
      <div className="flex items-center gap-2 mb-2 font-medium" style={{ color: SCRUB }}>
        <Sparkles size={17} /> משוב מעריך (AI)
      </div>
      {loading && !text && <div className="flex items-center gap-2 text-sm" style={{ color: INK }}><Loader2 className="animate-spin" size={16} /> מנתח את התשובה שלך...</div>}
      {error && <div className="text-sm text-red-700">המשוב לא נטען.{typeof error === "string" && <span className="block mt-1 text-xs" dir="ltr" style={{ color: "#8a3b36" }}>{error}</span>}</div>}
      {text && <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: INK }}>{text}</div>}
    </div>
  );
}

export function SectionTitle({ icon: Icon, title, sub }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2">
        <span className="p-2 rounded-xl" style={{ background: SCRUB_SOFT, color: SCRUB }}><Icon size={20} /></span>
        <h2 className="font-display text-2xl font-bold" style={{ color: INK }}>{title}</h2>
      </div>
      {sub && <p className="text-sm mt-2 leading-relaxed" style={{ color: "#3E5A5E" }}>{sub}</p>}
    </div>
  );
}

/* קלט קולי — Web Speech API (עברית). לא מוצג בדפדפנים שלא תומכים. */
const SpeechRec = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

export function MicButton({ onText, disabled }) {
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);

  useEffect(() => () => { recRef.current && recRef.current.abort(); }, []);

  if (!SpeechRec) return null;

  const toggle = () => {
    if (listening) { recRef.current && recRef.current.stop(); return; }
    const rec = new SpeechRec();
    rec.lang = "he-IL";
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          const t = e.results[i][0].transcript.trim();
          if (t) onText(t);
        }
      }
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  };

  return (
    <button onClick={toggle} disabled={disabled} type="button"
      title={listening ? "עצירת הקלטה" : "דיבור במקום הקלדה"}
      className={`p-2.5 rounded-full flex-shrink-0 ${listening ? "mic-live" : ""}`}
      style={listening ? { background: "#B3261E", color: "white" } : { background: SCRUB_SOFT, color: SCRUB, opacity: disabled ? 0.5 : 1 }}>
      {listening ? <Square size={16} /> : <Mic size={16} />}
    </button>
  );
}

/* שרשור צ'אט אחיד — משמש את הסימולציות, הראיונות ויום המבחן */
export function ChatThread({ msgs, busy, error, input, setInput, onSend, placeholder, maxHeight = 320, showInput = true }) {
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current && bottomRef.current.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const appendSpeech = (t) => setInput((v) => (v ? v.trimEnd() + " " : "") + t);

  return (
    <>
      <div className="p-4 space-y-3 overflow-y-auto" style={{ maxHeight }}>
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-start" : "justify-end"}`}>
            <div className="max-w-xs md:max-w-md rounded-2xl px-4 py-2 text-sm leading-relaxed"
              style={m.role === "user" ? { background: SCRUB, color: "white" } : { background: "#EFF4F3", color: INK }}>
              {m.content}
            </div>
          </div>
        ))}
        {busy && <div className="flex justify-end"><div className="rounded-2xl px-4 py-2 text-sm" style={{ background: "#EFF4F3", color: "#5C7A7D" }}>...</div></div>}
        {error && <div className="text-xs text-red-700">החיבור נכשל.{typeof error === "string" && <span className="block" dir="ltr" style={{ color: "#8a3b36" }}>{error}</span>}</div>}
        <div ref={bottomRef} />
      </div>
      {showInput && (
        <div className="flex gap-2 p-3 border-t" style={{ borderColor: "#E2EBE9" }}>
          <MicButton onText={appendSpeech} disabled={busy} />
          <input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSend()}
            placeholder={placeholder}
            className="flex-1 rounded-full border px-4 py-2 text-sm outline-none"
            style={{ borderColor: "#CFE0DD", color: INK }} />
          <button onClick={onSend} disabled={busy} className="p-2.5 rounded-full text-white" style={{ background: SCRUB, opacity: busy ? 0.5 : 1 }}>
            <Send size={16} style={{ transform: "rotate(180deg)" }} />
          </button>
        </div>
      )}
    </>
  );
}
