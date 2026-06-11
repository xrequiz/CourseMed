import React, { useState, useRef } from "react";
import { INK, SCRUB, SCRUB_SOFT, AMBER } from "../theme.js";
import { SIM_SCENARIOS, DILEMMAS, INTERVIEW_QS } from "../data.js";
import { callClaude } from "../lib/api.js";
import { addHistory } from "../lib/store.js";
import { RingTimer, FeedbackBox, ChatThread, MicButton } from "./common.jsx";

const STATION_LABEL = { sim: "סימולציה", interview: "ראיון", dilemma: "דילמה" };

export default function ExamDay() {
  const [plan, setPlan] = useState(null);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("start"); // start | brief | live | summary
  const [records, setRecords] = useState([]);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState("");
  const [summary, setSummary] = useState("");
  const [sumLoading, setSumLoading] = useState(false);
  const [error, setError] = useState(false);
  const finishingRef = useRef(false);

  const buildPlan = () => {
    const pick = (arr, n) => [...arr].sort(() => Math.random() - 0.5).slice(0, n);
    const sims = pick(SIM_SCENARIOS, 3).map((s) => ({ type: "sim", data: s }));
    const ints = pick(INTERVIEW_QS, 2).map((q) => ({ type: "interview", data: { title: "ראיון אישי", text: q } }));
    const dil = pick(DILEMMAS, 1).map((d) => ({ type: "dilemma", data: d }));
    setPlan([sims[0], ints[0], sims[1], dil[0], ints[1], sims[2]]);
    setIdx(0); setRecords([]); setSummary(""); setError(false); setPhase("brief");
  };

  const enterStation = () => {
    const st = plan[idx];
    if (st.type === "sim") setMsgs([{ role: "assistant", content: st.data.opening }]);
    else setAnswer("");
    finishingRef.current = false;
    setPhase("live");
  };

  const send = async () => {
    if (!input.trim() || busy) return;
    const st = plan[idx];
    const next = [...msgs, { role: "user", content: input.trim() }];
    setMsgs(next); setInput(""); setBusy(true); setError(false);
    try {
      const reply = await callClaude(`sim-actor:${st.data.id}`, next, {
        maxTokens: 400,
        onText: (t) => setMsgs([...next, { role: "assistant", content: t }]),
      });
      setMsgs([...next, { role: "assistant", content: reply }]);
    } catch (e) { setError(e && e.message ? String(e.message) : true); }
    setBusy(false);
  };

  const finishStation = async () => {
    if (finishingRef.current) return;
    finishingRef.current = true;

    const st = plan[idx];
    const content = st.type === "sim"
      ? msgs.map((m) => `${m.role === "user" ? "המועמד/ת" : "השחקן"}: ${m.content}`).join("\n")
      : answer.trim() || "(לא נכתבה תשובה)";
    const rec = { type: st.type, title: st.type === "sim" ? st.data.title : st.data.text, content };
    const allRecords = [...records, rec];
    setRecords(allRecords);
    setMsgs([]); setAnswer(""); setInput("");

    if (idx < plan.length - 1) { setIdx(idx + 1); setPhase("brief"); return; }

    setPhase("summary"); setSumLoading(true);
    try {
      const body = allRecords.map((r, i) =>
        `--- תחנה ${i + 1} (${STATION_LABEL[r.type]}): ${r.title} ---\n${r.content}`).join("\n\n");
      const text = await callClaude("examday-summary", [{ role: "user", content: body }],
        { maxTokens: 1500, onText: setSummary });
      setSummary(text);
      addHistory("examday", "יום מבחן מלא — תחקיר מסכם", text);
    } catch (e) { setError(e && e.message ? String(e.message) : true); }
    setSumLoading(false);
  };

  if (phase === "start") return (
    <div className="bg-white rounded-2xl border p-5 fade-in text-center" style={{ borderColor: "#E2EBE9" }}>
      <div className="font-display text-2xl font-black mb-2" style={{ color: INK }}>יום מבחן מלא</div>
      <p className="text-sm leading-7 max-w-lg mx-auto mb-4" style={{ color: "#2E4A4E" }}>
        6 תחנות ברצף, בדיוק כמו ביום האמיתי: 3 סימולציות מול שחקן AI, 2 ראיונות ותחנת דילמה — בסדר מעורבב ועם תרחישים אקראיים. הטיימרים רצים אוטומטית: 2 דקות התארגנות, 10 דקות לתחנה — וכשנגמר הזמן עוברים הלאה, כמו במבחן. בסוף: תחקיר מסכם של המעריך הראשי על כל היום. הקדישו לזה כשעה רצופה, בלי הפרעות.
      </p>
      <button onClick={buildPlan} className="px-6 py-2.5 rounded-full text-white font-medium" style={{ background: SCRUB }}>
        להתחיל את יום המבחן ←
      </button>
    </div>
  );

  const st = plan[idx];
  const waiting = busy && msgs.length > 0 && msgs[msgs.length - 1].role === "user";

  return (
    <div className="fade-in">
      {/* פס התקדמות */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-4">
        {plan.map((p, i) => (
          <React.Fragment key={i}>
            <div className="flex-shrink-0 rounded-xl px-3 py-1.5 text-center text-xs"
              style={{
                background: i < idx || phase === "summary" ? SCRUB : i === idx ? INK : SCRUB_SOFT,
                color: i <= idx || phase === "summary" ? "white" : "#5C7A7D",
              }}>
              {i + 1} · {STATION_LABEL[p.type]}
            </div>
            {i < plan.length - 1 && <div className="flex-shrink-0 w-2 h-px" style={{ background: SCRUB }} />}
          </React.Fragment>
        ))}
      </div>

      {phase === "brief" && (
        <div className="bg-white rounded-2xl border p-5" style={{ borderColor: "#E2EBE9" }}>
          <div className="text-xs font-medium mb-2" style={{ color: AMBER }}>תחנה {idx + 1} מתוך 6 · דף הנחיות — 2 דקות התארגנות, הטיימר כבר רץ</div>
          <h3 className="font-display text-xl font-bold mb-2" style={{ color: INK }}>
            {st.type === "sim" ? st.data.title : STATION_LABEL[st.type]}
          </h3>
          <p className="text-sm leading-7 mb-4" style={{ color: "#2E4A4E" }}>
            {st.type === "sim" ? st.data.task : st.data.text}
          </p>
          <div className="flex flex-col items-center gap-4">
            <RingTimer totalSeconds={120} label="התארגנות" autoKey={`ed-brief-${idx}`} autoStart onExpire={enterStation} />
            <button onClick={enterStation} className="px-6 py-2.5 rounded-full text-white font-medium" style={{ background: SCRUB }}>
              להיכנס לתחנה ←
            </button>
          </div>
        </div>
      )}

      {phase === "live" && (
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#E2EBE9" }}>
          <div className="flex items-center justify-between p-3 border-b flex-wrap gap-2" style={{ background: SCRUB_SOFT, borderColor: "#CFE0DD" }}>
            <span className="text-sm font-medium" style={{ color: INK }}>
              תחנה {idx + 1}/6 · {st.type === "sim" ? `🎭 ${st.data.title}` : STATION_LABEL[st.type]}
            </span>
            <button onClick={finishStation} className="text-xs px-3 py-1.5 rounded-full text-white" style={{ background: AMBER }}>
              {idx < plan.length - 1 ? "סיום התחנה — לתחנה הבאה" : "סיום היום — לתחקיר המסכם"}
            </button>
          </div>
          <div className="p-4">
            <div className="flex justify-center mb-3">
              <RingTimer totalSeconds={600} label="זמן התחנה" autoKey={`ed-live-${idx}`} autoStart onExpire={finishStation} />
            </div>
            {st.type === "sim" ? (
              <div className="-m-4 mt-0">
                <ChatThread msgs={msgs} busy={waiting} error={error}
                  input={input} setInput={setInput} onSend={send}
                  placeholder="מה תגידו?" maxHeight={260} />
              </div>
            ) : (
              <>
                <p className="font-display font-bold mb-2 leading-relaxed" style={{ color: INK }}>{st.data.text}</p>
                <textarea value={answer} onChange={(e) => setAnswer(e.target.value)}
                  placeholder="ענו בקול רם, וסכמו כאן את עיקרי הדברים..."
                  className="w-full h-36 rounded-2xl border p-4 text-sm leading-relaxed outline-none bg-white"
                  style={{ borderColor: "#E2EBE9", color: INK }} />
                <div className="mt-2">
                  <MicButton onText={(t) => setAnswer((v) => (v ? v.trimEnd() + " " : "") + t)} />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {phase === "summary" && (
        <div className="bg-white rounded-2xl border p-5" style={{ borderColor: "#E2EBE9" }}>
          <h3 className="font-display text-xl font-bold mb-2" style={{ color: INK }}>🏁 סוף יום המבחן — התחקיר המסכם</h3>
          <FeedbackBox loading={sumLoading} text={summary} error={error && !sumLoading} />
          <button onClick={() => { setPhase("start"); setPlan(null); }} className="mt-4 text-sm px-4 py-2 rounded-full border" style={{ borderColor: SCRUB, color: SCRUB }}>
            יום מבחן חדש (תרחישים אקראיים)
          </button>
        </div>
      )}
    </div>
  );
}
