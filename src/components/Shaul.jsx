import React, { useState } from "react";
import { Brain } from "lucide-react";
import { INK, SCRUB, SCRUB_SOFT, AMBER } from "../theme.js";
import { SHAUL_ITEMS } from "../data.js";
import { SectionTitle } from "./common.jsx";

export default function Shaul() {
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  const opts = ["כלל לא", "במידה מועטה", "במידה בינונית", "במידה רבה", "במידה רבה מאוד"];

  return (
    <div className="fade-in">
      <SectionTitle icon={Brain} title='שאלון של"ו — להבין ולתרגל' sub='15% מהציון. שאלון אישיות ממוחשב במודל חמש התכונות הגדולות: מוחצנות, מצפוניות, יציבות רגשית, נועם הליכות ופתיחות. כאן תתנסו בפורמט ותלמדו לזהות "מלכודות".' />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-5">
        {["מוחצנות", "מצפוניות", "יציבות רגשית", "נועם הליכות", "פתיחות"].map((t) => (
          <div key={t} className="rounded-xl p-3 text-center text-sm font-medium" style={{ background: SCRUB_SOFT, color: INK }}>{t}</div>
        ))}
      </div>

      <div className="space-y-3 mb-5">
        {SHAUL_ITEMS.map((it, i) => (
          <div key={i} className="bg-white rounded-2xl border p-4" style={{ borderColor: it.validity && done ? AMBER : "#E2EBE9" }}>
            <p className="text-sm font-medium mb-3" style={{ color: INK }}>{i + 1}. {it.t}</p>
            <div className="flex flex-wrap gap-1.5">
              {opts.map((o, oi) => (
                <button key={oi} onClick={() => setAnswers({ ...answers, [i]: oi })}
                  className="px-2.5 py-1 rounded-full text-xs border"
                  style={answers[i] === oi ? { background: SCRUB, color: "white", borderColor: SCRUB } : { borderColor: "#CFE0DD", color: "#2E4A4E" }}>
                  {o}
                </button>
              ))}
            </div>
            {done && (
              <p className="text-xs mt-2" style={{ color: it.validity ? "#8A5A0E" : SCRUB }}>
                {it.validity
                  ? "⚠ זהו פריט תקפות! אף אחד 'מעולם לא שיקר'. סימון 'במידה רבה מאוד' כאן מאותת על ניסיון להציג תמונה לא מציאותית — וזה בדיוק מה שהשאלון בודק."
                  : `התכונה הנמדדת: ${it.trait}`}
              </p>
            )}
          </div>
        ))}
      </div>

      <button onClick={() => setDone(true)} disabled={Object.keys(answers).length < SHAUL_ITEMS.length}
        className="px-5 py-2.5 rounded-full text-white font-medium"
        style={{ background: SCRUB, opacity: Object.keys(answers).length < SHAUL_ITEMS.length ? 0.5 : 1 }}>
        חשיפת התכונות הנמדדות
      </button>
      {Object.keys(answers).length < SHAUL_ITEMS.length && <p className="text-xs mt-2" style={{ color: "#5C7A7D" }}>ענו על כל הפריטים כדי לראות מה כל אחד מהם מדד.</p>}

      {done && (
        <div className="rounded-2xl p-4 mt-5 fade-in" style={{ background: SCRUB_SOFT }}>
          <p className="text-sm leading-7" style={{ color: INK }}>
            <b>שלושת הכללים לשאלון האמיתי:</b> 1) ענו בכנות — סולמות התקפות מזהים ייפוי. 2) היו עקביים — פריטים חוזרים בניסוחים שונים. 3) ענו מתוך ההקשר הבוגר-מקצועי שלכם (איך אתם בלימודים ובעבודה), לא מתוך הרגע הקשה בחיים. תשובה מאוזנת וכנה חזקה יותר מ"דמות מושלמת".
          </p>
        </div>
      )}
    </div>
  );
}
