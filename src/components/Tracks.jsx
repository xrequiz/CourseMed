import React, { useState } from "react";
import { Users } from "lucide-react";
import { INK, SCRUB, SCRUB_SOFT } from "../theme.js";
import { FORCED_PAIRS, SAFED_INTERVIEWS, HAIFA_INTERVIEW } from "../data.js";
import { SectionTitle } from "./common.jsx";
import InterviewerChat from "./InterviewerChat.jsx";

function ForcedChoice() {
  const [picks, setPicks] = useState({});
  const [done, setDone] = useState(false);
  return (
    <div className="fade-in">
      <p className="text-sm leading-7 mb-4" style={{ color: "#2E4A4E" }}>
        בצפת שאלון של"ו מופיע בפורמט <b>צמדי היגדים</b>: בכל צמד בוחרים את ההיגד שאתם מזדהים איתו יותר. שימו לב — בדרך כלל שני ההיגדים חיוביים, והבחירה ממפה תכונות, לא "נכון/לא נכון". תרגלו:
      </p>
      <div className="space-y-3">
        {FORCED_PAIRS.map((p, i) => (
          <div key={i} className="bg-white rounded-2xl border p-4" style={{ borderColor: "#E2EBE9" }}>
            <div className="grid md:grid-cols-2 gap-2">
              {["a", "b"].map((k) => (
                <button key={k} onClick={() => setPicks({ ...picks, [i]: k })}
                  className="rounded-xl border p-3 text-sm text-right leading-relaxed"
                  style={picks[i] === k ? { background: SCRUB, color: "white", borderColor: SCRUB } : { borderColor: "#CFE0DD", color: INK, background: "white" }}>
                  {p[k]}
                  {done && <div className="text-xs mt-1" style={{ color: picks[i] === k ? "#CDEBE5" : SCRUB }}>↳ {k === "a" ? p.ta : p.tb}</div>}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => setDone(true)} disabled={Object.keys(picks).length < FORCED_PAIRS.length}
        className="mt-4 px-5 py-2.5 rounded-full text-white font-medium"
        style={{ background: SCRUB, opacity: Object.keys(picks).length < FORCED_PAIRS.length ? 0.5 : 1 }}>
        מה כל היגד מדד?
      </button>
      {done && (
        <div className="rounded-2xl p-4 mt-4 fade-in" style={{ background: SCRUB_SOFT }}>
          <p className="text-sm leading-7" style={{ color: INK }}>
            <b>איך ניגשים לפורמט הזה:</b> אין בחירה "נכונה" — יש פרופיל. ענו לפי מי שאתם באמת בהקשר מקצועי, ושמרו על עקביות: צמדים דומים יחזרו בניסוחים שונים, וחוסר עקביות בולט יותר מכל תכונה ספציפית. אל תנסו לנחש "מה רופא אמור לבחור" — שאלונים אלה בנויים בדיוק לזהות את זה.
          </p>
        </div>
      )}
    </div>
  );
}

export default function Tracks() {
  const [city, setCity] = useState("safed");
  const [mode, setMode] = useState("info");

  const safedModes = [
    { id: "info", t: "על התהליך" },
    { id: "bio", t: "ריאיון ביוגרפי" },
    { id: "sit", t: "ריאיון מצבים" },
    { id: "shaul", t: 'של"ו — צמדי היגדים' },
  ];
  const haifaModes = [
    { id: "info", t: "על התהליך" },
    { id: "committee", t: "ועדת קבלה" },
  ];
  const modes = city === "safed" ? safedModes : haifaModes;

  return (
    <div className="fade-in">
      <SectionTitle icon={Users} title="מסלולי צפת וחיפה" sub="שני מוסדות עם תהליכי מיון משלהם — בלי יום תחנות, עם ראיונות ארוכים ומעמיקים יותר. כאן תתרגלו אותם מול צוות מראיינים AI." />

      <div className="flex gap-2 mb-4">
        {[{ id: "safed", t: "🏔️ צפת (בר-אילן)" }, { id: "haifa", t: "🌊 חיפה" }].map((c) => (
          <button key={c.id} onClick={() => { setCity(c.id); setMode("info"); }}
            className="px-4 py-2 rounded-full text-sm font-medium border"
            style={city === c.id ? { background: INK, color: "white", borderColor: INK } : { background: "white", color: "#2E4A4E", borderColor: "#CFE0DD" }}>
            {c.t}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {modes.map((m) => (
          <button key={m.id} onClick={() => setMode(m.id)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-sm border"
            style={mode === m.id ? { background: SCRUB, color: "white", borderColor: SCRUB } : { background: "white", color: "#2E4A4E", borderColor: "#CFE0DD" }}>
            {m.t}
          </button>
        ))}
      </div>

      {city === "safed" && mode === "info" && (
        <div className="bg-white rounded-2xl border p-5 text-sm leading-7 fade-in" style={{ color: "#2E4A4E", borderColor: "#E2EBE9" }}>
          <p className="mb-3"><b style={{ color: INK }}>הפקולטה לרפואה ע"ש עזריאלי בצפת (בר-אילן)</b> מקיימת תהליך מיון משלה, ללא יום התחנות של מו"ר/מרק"ם. אחרי המיון הראשוני (ובמסלולים מסוימים — מבחן ידע), המועמדים המתאימים מוזמנים לשלב האישיותי, שכולל בדרך כלל:</p>
          <p className="mb-2">• <b>שאלון אישי-ביוגרפי</b> — על מצבים ואירועים מהעבר (תרגלו אותו בלשונית "ביוגרפי" — אותם עקרונות בדיוק).</p>
          <p className="mb-2">• <b>ריאיון ביוגרפי</b> — ריאיון ארוך (כ-40 דקות) מול רופא/ה ופסיכולוג/ית, על סיפור החיים שלכם, המוטיבציה לרפואה ולמה דווקא צפת. המראיינים מעמיקים בשאלות המשך על מה שתספרו — כולל על מה שמילאתם בשאלונים המקדימים.</p>
          <p className="mb-2">• <b>ריאיון מצבים</b> — מציגים לכם דילמות וסיטואציות מול 2-3 מראיינים, ובוחנים שיקול דעת ויכולת להחזיק מורכבות גם כשמאתגרים את תשובתכם.</p>
          <p className="mb-3">• <b>שאלון של"ו</b> — בפורמט צמדי היגדים (בחירה כפויה).</p>
          <p className="rounded-xl p-3" style={{ background: "#FFF6E8", color: "#6B4E16" }}>טיפ ייחודי לצפת: הכינו תשובה אמיתית ל"למה צפת ולמה הפריפריה" — זו שאלה כמעט ודאית, וזיוף בה מורגש מיד. הפרטים (מכון ממיין, מבנה, משקלים) משתנים בין מסלולים ושנים — בדקו באתר הפקולטה לשנתכם.</p>
        </div>
      )}
      {city === "safed" && mode === "bio" && <InterviewerChat key="safed-bio" cfg={SAFED_INTERVIEWS[0]} />}
      {city === "safed" && mode === "sit" && <InterviewerChat key="safed-sit" cfg={SAFED_INTERVIEWS[1]} />}
      {city === "safed" && mode === "shaul" && <ForcedChoice />}

      {city === "haifa" && mode === "info" && (
        <div className="bg-white rounded-2xl border p-5 text-sm leading-7 fade-in" style={{ color: "#2E4A4E", borderColor: "#E2EBE9" }}>
          <p className="mb-3"><b style={{ color: INK }}>בית הספר לרפואה ע"ש עמיר באוניברסיטת חיפה</b> הוא הצעיר במוסדות, עם תהליך קבלה דו-שלבי משלו:</p>
          <p className="mb-2">• <b>שלב א'</b> — עמידה בתנאי סף קוגניטיביים (פסיכומטרי, בגרות, סיווגי אנגלית ועברית) ומילוי טופס הרשמה מקוון מפורט.</p>
          <p className="mb-2">• <b>שלב ב'</b> — מבחני אישיות (באמצעות מכון ממיין חיצוני), ולמתאימים: <b>ראיונות אישיים מול ועדות קבלה</b> — שני ראיונות לכל מועמד, בהשתתפות רופא/ה, חוקר/ת ופסיכולוג/ית.</p>
          <p className="mb-3">הדגש המוצהר של בית הספר: <b>אנושיות</b> כתכונה ראשונה במעלה, לצד מחויבות לפיתוח הרפואה בצפון הארץ. צפו לשאלות על אמפתיה מהחיים האמיתיים, על חיבור לקהילה ולצפון, ועל מה רפואה בשבילכם מעבר למקצוע.</p>
          <p className="rounded-xl p-3" style={{ background: "#FFF6E8", color: "#6B4E16" }}>מאחר שמדובר בתוכנית חדשה, הפורמט המדויק מתעדכן משנה לשנה — חובה לבדוק את דף הקבלה הרשמי של אוניברסיטת חיפה לשנת המיון שלכם. תרגול מבחני האישיות הממוחשבים נמצא בלשונית של"ו, ועקרונות הביוגרפי תקפים לטופס ההרשמה המפורט.</p>
        </div>
      )}
      {city === "haifa" && mode === "committee" && <InterviewerChat key="haifa" cfg={HAIFA_INTERVIEW} />}
    </div>
  );
}
