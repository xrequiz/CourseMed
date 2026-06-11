import React, { useState, useEffect, useRef } from "react";
import {
  Stethoscope, Timer, FileText, Brain, CheckCircle2,
  ChevronDown, Play, Pause, RotateCcw, Sparkles, Send, BookOpen,
  ClipboardList, Users, Scale, Mic, ArrowLeft, Save, Loader2, Info
} from "lucide-react";

/* ============================================================
   התחנה השביעית — הכנה למבחני האישיות לרפואה (מו"ר / מרק"ם / מר"ב)
   ============================================================ */

const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@500;700;900&family=Heebo:wght@300;400;500;700&display=swap');
.font-display { font-family: 'Frank Ruhl Libre', 'Heebo', serif; }
.font-body { font-family: 'Heebo', sans-serif; }
.fade-in { animation: fadeIn .4s ease both; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(6px);} to { opacity:1; transform:none;} }
@media (prefers-reduced-motion: reduce) { .fade-in { animation: none; } }
input:focus-visible, textarea:focus-visible, button:focus-visible { outline: 2px solid #0E6E66AA; outline-offset: 2px; }
`;

/* ---------------- צבעים (Tailwind core בלבד + inline) ---------------- */
const INK = "#10282C";       // פטרול כהה
const SCRUB = "#0E6E66";     // טורקיז "חלוק ניתוח"
const SCRUB_SOFT = "#DDEEEA";
const AMBER = "#C97F1F";     // טיימר/אזהרה
const PAPER = "#FBFCFB";

/* ============================ נתונים ============================ */

const BIO_QUESTIONS = [
  { id: 1, q: "תארו אירוע שבו נכשלתם במשימה שהייתה חשובה לכם. מה קרה, כיצד פעלתם ומה למדתם?", focus: "התמודדות עם כישלון, לקיחת אחריות, למידה" },
  { id: 2, q: "ספרו על קונפליקט משמעותי שהיה לכם עם דמות סמכות (מפקד, מורה, מנהל). כיצד התנהל ומה הייתה התוצאה?", focus: "תקשורת מול סמכות, אסרטיביות מכבדת" },
  { id: 3, q: "תארו מקרה שבו עזרתם לאדם שנמצא במצוקה משמעותית. מה עשיתם בפועל?", focus: "אמפתיה, יוזמה, גבולות עזרה" },
  { id: 4, q: "תארו סיטואציה שבה נדרשתם לקבל החלטה אתית קשה, שבה כל בחירה הייתה כרוכה במחיר.", focus: "שיקול דעת ערכי, יושרה" },
  { id: 5, q: "ספרו על תקופה של עומס ולחץ חריגים בחייכם. כיצד התמודדתם ומה היה המחיר?", focus: "חוסן, ניהול עצמי, מודעות" },
  { id: 6, q: "תארו אירוע שבו הובלתם קבוצה למשימה משותפת. אילו קשיים עלו וכיצד פתרתם אותם?", focus: "מנהיגות, עבודת צוות" },
  { id: 7, q: "ספרו על מקרה שבו קיבלתם ביקורת קשה ומוצדקת. כיצד הגבתם ומה השתנה בעקבותיה?", focus: "פתיחות למשוב, צמיחה" },
  { id: 8, q: "תארו עבודה ממושכת עם אדם שהיה לכם קשה מאוד לעבוד איתו. כיצד התמודדתם?", focus: "גמישות בינאישית, ויסות רגשי" },
  { id: 9, q: "ספרו על ויתור אישי משמעותי שעשיתם למען אדם אחר או למען מטרה. האם הייתם חוזרים על כך?", focus: "ערכים, נתינה, כנות" },
  { id: 10, q: "תארו אירוע שבו טעיתם בשיקול דעת ומישהו נפגע מכך. כיצד תיקנתם?", focus: "אחריות, תיקון, ענווה" },
  { id: 11, q: "ספרו על מקרה שבו עמדתם על דעתכם מול קבוצה שחשבה אחרת. מה היה המחיר ומה התוצאה?", focus: "עצמאות מחשבתית, אומץ" },
  { id: 12, q: "תארו חוויה אישית משמעותית שעיצבה את הרצון שלכם לעסוק ברפואה.", focus: "מוטיבציה אותנטית, רפלקציה" },
];

const DILEMMAS = [
  { id: 1, title: "החבר שהעתיק", text: "חבר קרוב מספר לכם בסוד שהעתיק במבחן מסכם חשוב, שעליו הוא עומד לקבל הצטיינות ומלגה. הוא מבקש שלא תספרו לאיש. מה תעשו, ואילו שיקולים מנחים אתכם?" },
  { id: 2, title: "עמית עייף במשמרת", text: "אתם עובדים במשמרת לילה ומבחינים שעמית שלכם, האחראי על משימה רגישה, מגיע מותש לחלוטין אחרי יומיים ללא שינה ועושה טעויות. הוא מבקש שלא תערבו את האחראי. כיצד תפעלו?" },
  { id: 3, title: "מיטה אחת, שני חולים", text: "ביחידה לטיפול נמרץ נותרה מיטה אחת פנויה. מגיעים בו-זמנית שני חולים במצב קשה: צעיר שנפגע בתאונה באשמתו לאחר נהיגה בשכרות, וקשישה עם מחלה כרונית. אילו שיקולים לגיטימיים ואילו לא?" },
  { id: 4, title: "סוד מהמשפחה", text: "מטופל מבוגר מבקש מהצוות הרפואי שלא לספר לילדיו על מחלתו הסופנית, בעוד הילדים שואלים שוב ושוב מה מצבו. כיצד יש לאזן בין אוטונומיה של המטופל לבין כנות מול המשפחה?" },
  { id: 5, title: "הורה שמסרב לחסן", text: "הורה מודאג מסרב לחסן את ילדו בעקבות מידע שקרא ברשת. כיצד נכון לנהל את השיחה איתו? מה הגבול בין שכנוע לכפייה?" },
  { id: 6, title: "סבא על ההגה", text: "אתם מבחינים שסבכם, שמתעקש להמשיך לנהוג, מתבלבל בדרכים ותגובותיו איטיות. הוא רואה בנהיגה את עצמאותו האחרונה. מה תעשו?" },
  { id: 7, title: "סוד מסוכן", text: "חבר משתף אתכם במצוקה נפשית עמוקה ורומז על מחשבות מדאיגות, אך משביע אתכם לשמור על סודיות מוחלטת. כיצד תאזנו בין נאמנות לבין דאגה לשלומו?" },
  { id: 8, title: "בכיר שמשפיל", text: "במהלך התנדבות בבית חולים אתם עדים לרופא בכיר שמזלזל ומשפיל אחות מול מטופלים. אתם הזוטרים ביותר בחדר. האם ומה תעשו?" },
];

const SIM_SCENARIOS = [
  {
    id: 1, title: "השותף שלא משלם", task: "אתם חולקים דירה עם שותף שכבר חודשיים לא משלם את חלקו בשכר הדירה ובחשבונות. עליכם לפתוח איתו את הנושא ולהגיע להסדר, מבלי להרוס את היחסים.",
    actorBrief: "אתה דניאל, שותף לדירה בן 26. אתה במצוקה כלכלית אמיתית אחרי שפוטרת, אבל מתבייש ולכן מתחמק ומגיב בהתגוננות ואף בהאשמות-נגד ('אתה סופר לי כל שקל?'). אם המועמד מפגין הקשבה אמיתית ומציע פתרון מכבד — התרכך בהדרגה ושתף במצבך. אם הוא תוקפני — הסלם.",
    opening: "אה... רצית לדבר איתי על משהו? יש לי קצת לחץ עכשיו, אז בקצרה."
  },
  {
    id: 2, title: "חברה אחרי כישלון", task: "חברה קרובה נכשלה זו הפעם השנייה במבחן קריטי ללימודיה והיא שוקלת לעזוב הכול. שבו איתה, תמכו בה ועזרו לה לחשוב בבהירות — בלי להחליט במקומה.",
    actorBrief: "את נועה, בת 24, נכשלת שוב במבחן מכריע. את מיואשת, בוכה לסירוגין, אומרת משפטים כמו 'אני פשוט לא בנויה לזה'. עצות מהירות או קלישאות ('יהיה בסדר') מרגיזות אותך. הקשבה, שיקוף רגשות ושאלות פתוחות גורמים לך להיפתח ולחשוב יחד.",
    opening: "קיבלתי את הציון הבוקר... שוב נכשלתי. אני לא יודעת בשביל מה אני בכלל ממשיכה."
  },
  {
    id: 3, title: "לקוח זועם", task: "אתם אחראי משמרת בבית קפה. לקוח קיבל הזמנה שגויה בפעם השנייה, איחר בגללה לפגישה חשובה, וכעת הוא צועק על מלצרית צעירה. גשו לטפל באירוע.",
    actorBrief: "אתה אורי, בן 45, לקוח זועם באמת ובצדק חלקי. אתה מרים קול, דורש פיצוי ומאיים בביקורת ברשת. התנצלות אמיתית, הכרה בעוול וקבלת אחריות מרגיעות אותך בהדרגה. התנצלות רובוטית או האשמת המלצרית מסלימות אותך.",
    opening: "זאת פעם שנייה! פעם שנייה שאתם מפשלים לי את ההזמנה! מי אחראי פה?!"
  },
  {
    id: 4, title: "חבר צוות שלא תורם", task: "אתם עובדים על פרויקט קבוצתי מסכם. אחד החברים לא הגיש את חלקו פעמיים והקבוצה ביקשה מכם לדבר איתו. ההגשה בעוד שבוע.",
    actorBrief: "אתה יואב, בן 23. לא סיפרת לאף אחד שאבא שלך אושפז ואתה מטפל בו. אתה מגיב בהתחלה בביטול ('אספיק, רגוע') ובעלבון ('שלחו אותך לעשות לי שיחת חינוך?'). רק גילוי עניין כן בשלומך יגרום לך לשתף.",
    opening: "נו, מה קורה? תגיד, באת לדבר איתי על הפרויקט? כי אני באמצע משהו."
  },
  {
    id: 5, title: "בשורה קשה לעובד", task: "אתם מנהלים צוות קטן. בעקבות קיצוצים עליכם להודיע לעובדת מסורה ואהובה שתפקידה מצטמצם לחצי משרה. עליכם למסור את הבשורה בכבוד וברגישות.",
    actorBrief: "את מיכל, בת 38, אם יחידנית לשני ילדים, עובדת מסורה. את המומה מהבשורה, עוברת בין הלם, פגיעה ('ככה מתגמלים אותי?') ודאגה קיומית. כנות, אמפתיה ונכונות לעזור בפועל (מכתב המלצה, חיפוש פתרונות) חשובות לך.",
    opening: "קראת לי? הכול בסדר? אתה נראה רציני."
  },
  {
    id: 6, title: "שכנה בודדה", task: "שכנה מבוגרת ובודדה דופקת בדלתכם כמעט כל ערב בתואנות שונות, לעיתים בשעות לא סבירות, ואתם בעיצומה של תקופת מבחנים. הציבו גבול — בלי לפגוע בה.",
    actorBrief: "את שרה, בת 78, אלמנה בודדה. את מגיעה 'רק לשאול משהו קטן' ונשארת. רמז לדחייה מעליב אותך ואת נסגרת. גבול שמוצב בחום, יחד עם הצעה לחלופה (זמן קבוע, חיבור לקהילה), מתקבל בהבנה ואף בהקלה.",
    opening: "שלום מתוק, סליחה שאני שוב מפריעה... רק רציתי לשאול אם אתה יודע למה אין חשמל במסדרון."
  },
];

const INTERVIEW_QS = [
  "ספרו לי על עצמכם בכמה דקות.",
  "מדוע דווקא רפואה? ומדוע עכשיו?",
  "מהי חולשה אמיתית שלכם, וכיצד אתם מתמודדים איתה?",
  "תארו החלטה קשה שקיבלתם בשנים האחרונות.",
  "כיצד אתם מתמודדים עם לחץ ועומס? תנו דוגמה.",
  "מה תעשו אם לא תתקבלו השנה ללימודי רפואה?",
  "ספרו על מקרה שבו עבדתם בצוות שלא תפקד. מה היה תפקידכם?",
  "אילו תכונות הופכות רופא לרופא טוב? איפה אתם ביחס אליהן?",
  "ספרו על אדם שהשפיע עליכם עמוקות.",
  "על מה אתם הכי מתחרטים? מה הייתם עושים אחרת?",
];

const SHAUL_ITEMS = [
  { t: "אני נהנה/ית להכיר אנשים חדשים גם במצבים לא מוכרים.", trait: "מוחצנות" },
  { t: "אני מסיים/ת משימות בזמן גם כשאיש אינו בודק אותי.", trait: "מצפוניות" },
  { t: "גם תחת לחץ רב אני שומר/ת על קור רוח.", trait: "יציבות רגשית" },
  { t: "חשוב לי להבין את נקודת המבט של מי שחולק עליי.", trait: "נועם הליכות" },
  { t: "אני מחפש/ת רעיונות ודרכי חשיבה חדשות באופן פעיל.", trait: "פתיחות" },
  { t: "אני נוטה לקחת על עצמי תפקיד מוביל בקבוצה.", trait: "מוחצנות" },
  { t: "אני שם/ה לב לפרטים קטנים שאחרים מפספסים.", trait: "מצפוניות" },
  { t: "כשמשהו משתבש, אני מתאושש/ת מהר וממשיכ/ה הלאה.", trait: "יציבות רגשית" },
  { t: "אנשים פונים אליי כשהם זקוקים לאוזן קשבת.", trait: "נועם הליכות" },
  { t: "מעולם לא אמרתי דבר שאינו אמת, אפילו לא פעם אחת.", trait: "⚠ פריט תקפות", validity: true },
];

const FORCED_PAIRS = [
  { a: "אני מעדיף/ה להעמיק לבד בבעיה מורכבת עד שאפצח אותה", b: "אני מעדיף/ה לפצח בעיה מורכבת בחשיבה משותפת עם אחרים", ta: "עצמאות ועומק", tb: "שיתופיות ומוחצנות" },
  { a: "חשוב לי לסיים משימה בשלמות גם אם זה לוקח יותר זמן", b: "חשוב לי לעמוד בלוח הזמנים גם אם נדרשות פשרות", ta: "דקדקנות", tb: "תכליתיות" },
  { a: "במצב חירום אני קודם כול פועל/ת ואז מעבד/ת רגשית", b: "במצב חירום אני עוצר/ת לרגע לחשוב לפני שאני פועל/ת", ta: "תגובתיות וביצוע", tb: "שיקול דעת" },
  { a: "אני נוטה לקבל החלטות על בסיס נתונים ועובדות", b: "אני נוטה לשקלל גם אינטואיציה ותחושת בטן", ta: "חשיבה אנליטית", tb: "פתיחות ואינטואיציה" },
  { a: "כשחבר בצוות מתקשה, אקח על עצמי חלק מהעומס שלו", b: "כשחבר בצוות מתקשה, אעזור לו ללמוד להתמודד בעצמו", ta: "נתינה מיידית", tb: "העצמה לטווח ארוך" },
  { a: "אני מרגיש/ה בנוח להוביל ולקבל החלטות עבור קבוצה", b: "אני מרגיש/ה בנוח לתמוך ולחזק את מי שמוביל", ta: "מנהיגות", tb: "עבודת צוות" },
];

const SAFED_INTERVIEWS = [
  {
    id: "safed-bio", title: "ריאיון ביוגרפי (סגנון צפת)", minutes: 20,
    note: "במציאות: כ-40 דקות מול רופא/ה ופסיכולוג/ית. כאן: גרסה מרוכזת של 20 דקות.",
    system: "אתם צוות מראיינים בריאיון הביוגרפי בפקולטה לרפואה ע\"ש עזריאלי בצפת (אוניברסיטת בר-אילן): רופא/ה בכיר/ה ופסיכולוג/ית. ראיינו את המועמד בעברית, בנימוס וברצינות. התמקדו ב: אירועים משמעותיים מחייו, מוטיבציה לרפואה, למה דווקא צפת והפריפריה, התמודדות עם קושי, ערכים. שאלו שאלה אחת בכל פעם. הקפידו על שאלות המשך מעמיקות על מה שהמועמד אמר ('ספר לי יותר על...', 'מה הרגשת באותו רגע?', 'מה היית עושה אחרת?'). אם תשובה כללית או מתחמקת — בקשו דוגמה קונקרטית. אל תתנו משוב במהלך הריאיון.",
    opening: "שלום, ברוכים הבאים. אני ד\"ר לוי ואיתי כאן עמיתתי הפסיכולוגית. נעים מאוד. בוא/י נתחיל — ספר/י לנו קצת על עצמך ועל הדרך שהובילה אותך עד לכאן.",
    feedback: "אתה מעריך בריאיון הביוגרפי בצפת. נתח את התמליל: עומק ואותנטיות התשובות, דוגמאות קונקרטיות, מודעות עצמית, בהירות המוטיבציה לרפואה ולפריפריה, והתמודדות עם שאלות המשך. תן משוב בעברית: חוזקות, שיפורים קונקרטיים עם הצעות ניסוח, ושאלה אחת שכדאי להתכונן אליה טוב יותר. עד 250 מילים, ללא כותרות Markdown."
  },
  {
    id: "safed-sit", title: "ריאיון מצבים (דילמות)", minutes: 15,
    note: "מציגים לכם סיטואציות ודילמות ובוחנים את שיקול הדעת — כולל שאלות מאתגרות על התשובה שלכם.",
    system: "אתם צוות של 2-3 מראיינים בריאיון המצבים בפקולטה לרפואה בצפת. הציגו למועמד דילמות וסיטואציות (בינאישיות ואתיות, חלקן מעולם הרפואה) ובחנו את שיקול דעתו. אחרי כל תשובה — אתגרו אותה: שנו פרט בתרחיש ('ומה אם...'), הציגו את הצד השני, או שאלו על המחיר של הבחירה. דילמה אחת בכל פעם, 2-3 שאלות העמקה על כל אחת, ואז עברו לדילמה חדשה. בעברית, ענייניים ומכבדים. ללא משוב במהלך הריאיון.",
    opening: "שלום, בתחנה הזאת נציג בפניך כמה סיטואציות ונשמע איך היית פועל/ת. נתחיל: את/ה סטודנט/ית לרפואה, וחבר קרוב מהמחזור מבקש ממך לחתום עבורו נוכחות בהרצאת חובה שהוא מתכוון להבריז ממנה, כי 'כולם עושים את זה'. מה תעשה/י?",
    feedback: "אתה מעריך בריאיון המצבים בצפת. נתח את התמליל: זיהוי הערכים המתנגשים, עקביות מול שאלות מאתגרות, יכולת להחזיק מורכבות בלי להתקפל מיד וגם בלי קשיחות, ויישומיות. תן משוב בעברית: חוזקות, שיפורים קונקרטיים, ודפוס אחד שכדאי לשים אליו לב. עד 250 מילים, ללא כותרות Markdown."
  },
];

const HAIFA_INTERVIEW = {
  id: "haifa-committee", title: "ועדת קבלה (סגנון חיפה)", minutes: 20,
  note: "בחיפה: שני ראיונות מול ועדות קבלה — רופא/ה וחוקר/ת, בליווי פסיכולוג/ית. דגש על אנושיות ומחויבות לרפואה בצפון.",
  system: "אתם ועדת קבלה בבית הספר לרפואה ע\"ש עמיר באוניברסיטת חיפה: רופא/ה בכיר/ה, חוקר/ת ופסיכולוג/ית. ראיינו את המועמד בעברית. בית הספר מדגיש 'אנושיות' כתכונה ראשונה במעלה, ומחפש מועמדים שרואים עצמם תורמים לרפואה בצפון הארץ. בחנו: אנושיות ואמפתיה (בקשו דוגמאות מהחיים), מוטיבציה לרפואה, חיבור לצפון ולקהילה, סקרנות מדעית, והתמודדות עם כישלון. שאלה אחת בכל פעם, עם שאלות המשך מעמיקות. מדי פעם שאלו שאלה מפתיעה או אישית יותר. ללא משוב במהלך הריאיון.",
  opening: "שלום וברוכים הבאים לוועדת הקבלה. אני פרופ' כהן מהמחלקה הפנימית, ואיתי כאן עמיתיי. נשמח להכיר אותך. ספר/י לנו — מה בעיניך הופך רופא ל'בן אדם', ואיפה את/ה פוגש/ת את זה בעצמך?",
  feedback: "אתה חבר ועדת קבלה ברפואה באוניברסיטת חיפה. נתח את התמליל: ביטוי אנושיות ואמפתיה דרך דוגמאות אמיתיות, כנות מוטיבציה, חיבור לצפון/קהילה אם עלה, בגרות והתמודדות עם שאלות מאתגרות. תן משוב בעברית: חוזקות, שיפורים קונקרטיים, ושאלה אחת שכדאי לחדד אליה תשובה. עד 250 מילים, ללא כותרות Markdown."
};

const CHECKLIST = [
  "קראתי את המידע הרשמי והעדכני באתר מאל\"ו (המרכז הארצי לבחינות ולהערכה)",
  "כתבתי 'בנק אירועים' — 8–10 סיפורים אישיים אמיתיים מחיי",
  "תרגלתי כתיבת תשובה ביוגרפית מלאה בזמן מוגבל לפחות 5 פעמים",
  "תרגלתי לפחות 3 סימולציות מול 'שחקן' וקיבלתי משוב",
  "תרגלתי דיון בדילמה בקול רם עם טיימר",
  "הכנתי תשובות גמישות (לא משוננות!) לשאלות ראיון נפוצות",
  "הבנתי איך עובד שאלון של\"ו ומה הם סולמות תקפות",
  "תרגלתי מעבר מהיר בין תחנות — 2 דקות התארגנות",
  "ביקשתי מאדם קרוב משוב כן על איך אני נתפס/ת בשיחה",
  "תכננתי את יום המבחן: הגעה, שינה, אוכל, ביגוד נוח ומכובד",
];

const INFO_SECTIONS = [
  {
    title: "מה הם בכלל מבחני מו\"ר, מרק\"ם ומר\"ב?",
    body: "אלו מערכות מיון אישיותיות שמפעיל המרכז הארצי לבחינות ולהערכה (מאל\"ו) עבור בתי הספר לרפואה. מו\"ר (מערכת מיון ללימודי רפואה) משמשת את אוניברסיטת תל אביב והטכניון; מרק\"ם (מערכת ראיונות קצרים מובנים) את האוניברסיטה העברית; מר\"ב משמשת למסלולים הארבע-שנתיים. המטרה: למדוד תכונות שלא נמדדות בפסיכומטרי ובבגרות — תקשורת בינאישית, אמפתיה, שיקול דעת אתי, חוסן ובגרות אישית. חשוב: הפרטים משתנים משנה לשנה — תמיד אמתו מול הפרסום הרשמי של מאל\"ו לשנתכם."
  },
  {
    title: "מבנה התהליך ושקלול הציון",
    body: "התהליך כולל שלושה רכיבים עיקריים: (1) מרכז הערכה — ״יום התחנות״: כ-6 תחנות של כ-10 דקות כל אחת, עם כ-2 דקות התארגנות ביניהן. בדרך כלל 3 תחנות סימולציה מול שחקן, 2 תחנות ראיון ותחנת דילמה — משקל של כ-55% מהציון. (2) שאלון אישי-ביוגרפי — מבחן כתיבה של כשעתיים וחצי ובו שאלות על אירועים אמיתיים מחייכם — כ-30%. (3) שאלון אישיות ממוחשב (שאו\"ל/של\"ו) — שאלון דיווח עצמי במודל חמש התכונות הגדולות — כ-15%. הציון הסופי יחסי לשאר הנבחנים ונע בטווח של כ-150–250."
  },
  {
    title: "יום התחנות — איך זה מרגיש בפועל",
    body: "מגיעים למתחם, מקבלים תדריך, ואז נכנסים לסבב מהיר: בכל תחנה ממתין מעריך, שחקן או שניהם. בתחנות הסימולציה תקבלו דף הנחיות קצר (מי אתם, מה הסיטואציה), כ-2 דקות לקרוא ולהתארגן, ואז תיכנסו לאינטראקציה חיה. בחלק מהתחנות ייערך גם תחקיר קצר אחרי הסימולציה — ישאלו אתכם מה ניסיתם לעשות ולמה. הקצב מהיר ומתיש בכוונה: בודקים גם איך אתם מתפקדים לאורך זמן תחת עומס. טיפ מרכזי: כל תחנה היא דף חלק. תחנה שהלכה פחות טוב — משאירים מאחור."
  },
  {
    title: "השאלון הביוגרפי — מה מחפשים",
    body: "השאלות דורשות אירועים ספציפיים ואמיתיים: ״תארו מקרה שבו...״. המעריכים מחפשים: סיפור קונקרטי (לא הצהרות כלליות), תיאור של מה שאתם עשיתם בפועל, מודעות עצמית (גם לחלקים פחות מחמיאים), ותובנה אמיתית. מבנה עבודה מומלץ: רקע קצר ← האירוע והאתגר ← הפעולות שלכם ← התוצאה ← מה למדתם. הימנעו מסיפורים ״מושלמים״ — תשובה שבה אין שום קושי או טעות נתפסת כלא אמינה. הכינו מראש בנק של 8–10 אירועים מגוונים (כישלון, קונפליקט, עזרה, מנהיגות, לחץ, ויתור) שתוכלו להתאים לשאלות שונות."
  },
  {
    title: "שאלון של\"ו (שאו\"ל) — איך ניגשים",
    body: "שאלון ממוחשב במודל Big Five: מוחצנות, מצפוניות, יציבות רגשית, נועם הליכות ופתיחות מחשבתית. הכלל החשוב ביותר: לענות בכנות ובעקביות. שאלונים כאלה כוללים סולמות תקפות — פריטים שנועדו לזהות ניסיון ״לצייר תמונה מושלמת״ (למשל: ״מעולם לא שיקרתי״) ופריטים חוזרים בניסוחים שונים שבודקים עקביות. ניסיון להציג דמות אידיאלית עלול לפגוע יותר מתשובה כנה ומאוזנת. כן מומלץ: לענות מתוך ההקשר המקצועי-בוגר שלכם (איך אתם בלימודים/עבודה), לא מתוך הרגע הכי עייף בחיים."
  },
  {
    title: "מה עם בר-אילן, בן-גוריון ושאר המסלולים?",
    body: "לא כל בתי הספר משתמשים באותה מערכת: בר-אילן ובן-גוריון מקיימים תהליכי מיון משלהם הכוללים ראיונות אישיים ארוכים יותר ושאלונים, ומכונים חיצוניים שונים מעורבים בהם, והפרטים התעדכנו בשנים האחרונות. גם רייכמן וויצמן הפעילו תהליכים משלהם. העקרונות שתתרגלו כאן (סיפור אישי, אמפתיה, דילמות, ראיון) רלוונטיים לכולם — אבל את הפורמט המדויק, המועדים ותנאי הסף חובה לבדוק באתר הרשמי של כל מוסד ושל מאל\"ו לשנת המיון שלכם."
  },
];

const TIPS = [
  { h: "אותנטיות מנצחת שינון", p: "מעריכים מזהים תסריטים משוננים מקילומטר. בנו עקרונות וסיפורים אמיתיים — לא נאומים." },
  { h: "הקשיבו לפני שאתם פותרים", p: "בסימולציות, הטעות הנפוצה היא לקפוץ לפתרון. קודם שקפו רגש (״אני שומע כמה זה מתסכל״), שאלו, ורק אז הציעו." },
  { h: "אסרטיביות ≠ תוקפנות", p: "בודקים אם אתם יודעים להציב גבול ולעמוד על עמדה — בנעימות ובכבוד. כניעה מוחלטת וגם עימות חזיתי נחשבים חולשה." },
  { h: "בדילמות — תהליך, לא תשובה", p: "אין תשובה ״נכונה״. הציגו את שני הצדדים, מנו את הערכים המתנגשים, קבלו הכרעה מנומקת והכירו במחירה." },
  { h: "כל תחנה מתחילה מאפס", p: "המעריכים בכל תחנה לא יודעים מה קרה בקודמת. פישלתם? נשמו, אפסו, והתחילו נקי." },
  { h: "אל תפחדו מחולשות", p: "בביוגרפי ובראיון — חולשה אמיתית + מה עשיתם איתה שווה הרבה יותר מ״אני פרפקציוניסט״." },
  { h: "תרגלו בקול רם ובזמן אמת", p: "לחשוב על תשובה זה לא כמו להגיד אותה ב-10 דקות לחוצות. הטיימר כאן הוא חבר." },
  { h: "דאגו לעצמכם ביום המבחן", p: "שינה, אוכל, הגעה מוקדמת, בגדים נוחים ומכובדים. עייפות שוחקת בדיוק את היכולות שנמדדות." },
];

/* ============================ עזרי AI ============================ */

// קריאה לשרת — המפתח של Anthropic נשמר בצד השרת בלבד (api/chat.js)
async function callClaude(systemPrompt, messages, maxTokens = 1000) {
  let lastErr;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: systemPrompt,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          maxTokens,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data && data.error ? data.error : `HTTP ${response.status}`);
      }
      if (data && typeof data.text === "string" && data.text) return data.text;
      throw new Error("empty response");
    } catch (e) {
      lastErr = e;
      if (attempt === 0) await new Promise((r) => setTimeout(r, 900)); // ניסיון חוזר אוטומטי
    }
  }
  throw lastErr;
}

function actorSystemFor(sc) {
  return `אתה שחקן מקצועי בתחנת סימולציה במבחני מו"ר/מרק"ם לקבלה לרפואה בישראל. גלם את הדמות הבאה באופן ריאליסטי ועקבי, בעברית מדוברת וטבעית, בתגובות קצרות (1-3 משפטים) כמו בשיחה אמיתית. אל תצא מהדמות, אל תיתן משוב, ואל תקל על המועמד יותר מדי — הגב לפי איכות ההתנהלות שלו בהתאם להנחיות הדמות.\n\nתדריך הדמות: ${sc.actorBrief}`;
}

/* ============================ אחסון ============================ */

async function loadStore(key, fallback) {
  try {
    const r = localStorage.getItem(`tachana7:${key}`);
    return r ? JSON.parse(r) : fallback;
  } catch (e) { return fallback; }
}
async function saveStore(key, value) {
  try { localStorage.setItem(`tachana7:${key}`, JSON.stringify(value)); } catch (e) { /* אחסון מלא/חסום — נמשיך עם state בלבד */ }
}

/* ============================ רכיבים כלליים ============================ */

function RingTimer({ totalSeconds, label, autoKey }) {
  const [left, setLeft] = useState(totalSeconds);
  const [running, setRunning] = useState(false);
  const ref = useRef(null);

  useEffect(() => { setLeft(totalSeconds); setRunning(false); }, [totalSeconds, autoKey]);

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
        <button onClick={() => { setLeft(totalSeconds); setRunning(false); }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border"
          style={{ borderColor: SCRUB, color: SCRUB }}>
          <RotateCcw size={15} /> איפוס
        </button>
      </div>
      {done && <div className="text-sm font-medium" style={{ color: "#B3261E" }}>הזמן נגמר — בדיוק כמו במבחן 🙂</div>}
    </div>
  );
}

function FeedbackBox({ loading, text, error }) {
  if (!loading && !text && !error) return null;
  return (
    <div className="rounded-2xl p-4 mt-4 fade-in" style={{ background: SCRUB_SOFT, border: `1px solid ${SCRUB}33` }}>
      <div className="flex items-center gap-2 mb-2 font-medium" style={{ color: SCRUB }}>
        <Sparkles size={17} /> משוב מעריך (AI)
      </div>
      {loading && <div className="flex items-center gap-2 text-sm" style={{ color: INK }}><Loader2 className="animate-spin" size={16} /> מנתח את התשובה שלך...</div>}
      {error && <div className="text-sm text-red-700">המשוב לא נטען.{typeof error === "string" && <span className="block mt-1 text-xs" dir="ltr" style={{ color: "#8a3b36" }}>{error}</span>}</div>}
      {text && <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: INK }}>{text}</div>}
    </div>
  );
}

function SectionTitle({ icon: Icon, title, sub }) {
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

/* ============================ דף הבית ============================ */

function Home({ go }) {
  const stations = ["סימולציה", "סימולציה", "ראיון", "דילמה", "ראיון", "סימולציה"];
  return (
    <div className="fade-in">
      <div className="rounded-3xl p-6 md:p-10 mb-6 relative overflow-hidden" style={{ background: INK }}>
        <div className="absolute -left-10 -top-10 w-48 h-48 rounded-full opacity-20" style={{ background: SCRUB }} />
        <p className="text-sm tracking-widest mb-2" style={{ color: "#7FC8BE" }}>מו"ר · מרק"ם · מר"ב</p>
        <h1 className="font-display text-3xl md:text-5xl font-black text-white leading-tight">
          ביום המבחן יש שש תחנות.<br />
          <span style={{ color: "#7FC8BE" }}>זאת התחנה השביעית.</span>
        </h1>
        <p className="text-white text-opacity-80 mt-4 max-w-xl leading-relaxed">
          המקום לתרגל בו את כל מה שמבחני האישיות לרפואה בודקים — ביוגרפי בזמן אמת, סימולציות מול שחקן AI, דילמות, ראיונות ושאלון של"ו — עם משוב מיידי.
        </p>
        <button onClick={() => go("stations")}
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-medium"
          style={{ background: "#7FC8BE", color: INK }}>
          להתחיל לתרגל <ArrowLeft size={17} />
        </button>
      </div>

      {/* רצועת התחנות */}
      <div className="rounded-2xl p-4 mb-6 bg-white border" style={{ borderColor: "#E2EBE9" }}>
        <p className="text-xs mb-3 font-medium" style={{ color: SCRUB }}>כך נראה יום התחנות — כ-10 דקות לתחנה, כ-2 דקות מעבר</p>
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {stations.map((s, i) => (
            <React.Fragment key={i}>
              <div className="flex-shrink-0 rounded-xl px-3 py-2 text-center" style={{ background: SCRUB_SOFT }}>
                <div className="text-xs" style={{ color: SCRUB }}>תחנה {i + 1}</div>
                <div className="text-sm font-medium" style={{ color: INK }}>{s}</div>
              </div>
              {i < 5 && <div className="flex-shrink-0 w-3 h-px" style={{ background: SCRUB }} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* שקלול */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { pct: "55%", t: "מרכז ההערכה", d: "שש תחנות", tab: "stations" },
          { pct: "30%", t: "שאלון ביוגרפי", d: "כתיבה אישית", tab: "bio" },
          { pct: "15%", t: "שאלון של\"ו", d: "אישיות ממוחשב", tab: "shaul" },
        ].map((c) => (
          <button key={c.t} onClick={() => go(c.tab)} className="rounded-2xl p-4 text-right bg-white border transition-transform active:scale-95"
            style={{ borderColor: "#E2EBE9" }}>
            <div className="font-display text-3xl font-black" style={{ color: SCRUB }}>{c.pct}</div>
            <div className="font-medium text-sm mt-1" style={{ color: INK }}>{c.t}</div>
            <div className="text-xs" style={{ color: "#5C7A7D" }}>{c.d}</div>
          </button>
        ))}
      </div>

      <div className="rounded-2xl p-4 flex gap-3 items-start" style={{ background: "#FFF6E8", border: "1px solid #F0DDBE" }}>
        <Info size={20} style={{ color: AMBER }} className="flex-shrink-0 mt-0.5" />
        <p className="text-sm leading-relaxed" style={{ color: "#6B4E16" }}>
          האפליקציה מבוססת על מבנה המבחנים כפי שפורסם בשנים האחרונות. פרטים (מספר תחנות, משקלים, מועדים) משתנים מדי שנה — אמתו תמיד מול הפרסום הרשמי של מאל"ו ושל המוסדות.
        </p>
      </div>
    </div>
  );
}

/* ============================ מדריך מידע ============================ */

function InfoGuide() {
  const [open, setOpen] = useState(0);
  return (
    <div className="fade-in">
      <SectionTitle icon={BookOpen} title="המדריך המלא" sub="כל מה שצריך להבין על מבני המבחנים, השקלול ומה באמת נמדד — לפני שמתחילים לתרגל." />
      <div className="space-y-3">
        {INFO_SECTIONS.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#E2EBE9" }}>
            <button onClick={() => setOpen(open === i ? -1 : i)} className="w-full flex items-center justify-between p-4 text-right">
              <span className="font-medium" style={{ color: INK }}>{s.title}</span>
              <ChevronDown size={18} style={{ color: SCRUB, transform: open === i ? "rotate(180deg)" : "none", transition: "transform .25s" }} />
            </button>
            {open === i && <div className="px-4 pb-4 text-sm leading-7 fade-in" style={{ color: "#2E4A4E" }}>{s.body}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================ ביוגרפי ============================ */

function Bio() {
  const [qi, setQi] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [saved, setSaved] = useState([]);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => { loadStore("bio-answers", []).then(setSaved); }, []);

  const q = BIO_QUESTIONS[qi];

  const getFeedback = async () => {
    if (answer.trim().length < 40) { setFeedback("כתבו תשובה מלאה יותר (לפחות כמה משפטים) כדי לקבל משוב משמעותי."); return; }
    setLoading(true); setError(false); setFeedback("");
    try {
      const text = await callClaude(
        "אתה מעריך מנוסה בשאלון האישי-ביוגרפי של מבחני מו\"ר/מרק\"ם לקבלה לרפואה בישראל. הערך תשובות לפי: ספציפיות האירוע, תיאור פעולות בפועל, מודעות עצמית וכנות (כולל חלקים לא מחמיאים), תובנה ולמידה, ומבנה (רקע→אירוע→פעולות→תוצאה→תובנה). תן משוב בעברית, חם אך ישיר: 2-3 נקודות חוזק, 2-3 נקודות לשיפור עם הצעות קונקרטיות, והערכת רושם כללי. אל תמציא פרטים על הנבחן. עד 250 מילים, ללא כותרות Markdown.",
        [{ role: "user", content: `השאלה: ${q.q}\n\nהתשובה שלי:\n${answer}` }]
      );
      setFeedback(text);
    } catch (e) { setError(e && e.message ? String(e.message) : true); }
    setLoading(false);
  };

  const save = async () => {
    const item = { q: q.q, a: answer, date: new Date().toLocaleDateString("he-IL") };
    const next = [item, ...saved].slice(0, 30);
    setSaved(next); await saveStore("bio-answers", next);
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
          <div className="flex flex-wrap gap-2 mt-2">
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

/* ============================ סימולציה מול שחקן AI ============================ */

function Simulation() {
  const [si, setSi] = useState(0);
  const [phase, setPhase] = useState("brief"); // brief | live | debrief
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [debrief, setDebrief] = useState("");
  const [debriefLoading, setDebriefLoading] = useState(false);
  const [error, setError] = useState(false);
  const bottomRef = useRef(null);

  const sc = SIM_SCENARIOS[si];

  useEffect(() => { bottomRef.current && bottomRef.current.scrollIntoView({ behavior: "smooth" }); }, [msgs, debrief]);

  const start = () => { setMsgs([{ role: "assistant", content: sc.opening }]); setPhase("live"); setDebrief(""); };

  const actorSystem = actorSystemFor(sc);

  const send = async () => {
    if (!input.trim() || busy) return;
    const userMsg = { role: "user", content: input.trim() };
    const next = [...msgs, userMsg];
    setMsgs(next); setInput(""); setBusy(true); setError(false);
    try {
      const reply = await callClaude(actorSystem, next, 400);
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
        "אתה מעריך בכיר בתחנות הסימולציה של מבחני מו\"ר/מרק\"ם. נתח את התמליל והערך את המועמד לפי: אמפתיה והקשבה פעילה, שיקוף רגשות לפני פתרונות, אסרטיביות מכבדת, התקדמות לקראת פתרון מעשי, ושמירה על קור רוח. תן משוב בעברית: מה עבד טוב (עם ציטוטים קצרים מהתמליל), מה לשפר עם הצעה קונקרטית לניסוח חלופי, וטיפ אחד מרכזי להמשך. עד 250 מילים, ללא כותרות Markdown.",
        [{ role: "user", content: `המשימה שניתנה למועמד: ${sc.task}\n\nתדריך השחקן (סמוי מהמועמד): ${sc.actorBrief}\n\nהתמליל:\n${transcript}` }]
      );
      setDebrief(text);
    } catch (e) { setError(e && e.message ? String(e.message) : true); }
    setDebriefLoading(false);
  };

  const reset = (newIdx) => {
    if (typeof newIdx === "number") setSi(newIdx);
    setPhase("brief"); setMsgs([]); setDebrief(""); setInput(""); setError(false);
  };

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
          <div className="p-4 space-y-3 overflow-y-auto" style={{ maxHeight: 320 }}>
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
          {phase === "live" && (
            <div className="flex gap-2 p-3 border-t" style={{ borderColor: "#E2EBE9" }}>
              <input value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="מה תגידו? דברו טבעי, כמו בשיחה אמיתית..."
                className="flex-1 rounded-full border px-4 py-2 text-sm outline-none"
                style={{ borderColor: "#CFE0DD", color: INK }} />
              <button onClick={send} disabled={busy} className="p-2.5 rounded-full text-white" style={{ background: SCRUB, opacity: busy ? 0.5 : 1 }}>
                <Send size={16} style={{ transform: "rotate(180deg)" }} />
              </button>
            </div>
          )}
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

/* ============================ דילמה / ראיון ============================ */

function WrittenStation({ kind }) {
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
    const sys = kind === "dilemma"
      ? "אתה מעריך בתחנת הדילמות במבחני מו\"ר/מרק\"ם. הערך לפי: זיהוי הערכים המתנגשים, הצגת שני הצדדים בהוגנות, הכרעה מנומקת תוך הכרה במחירה, יישום מעשי ורגישות אנושית. תן משוב בעברית: חוזקות, שיפורים קונקרטיים, ושיקול אחד חשוב שהמועמד פספס אם יש כזה. עד 220 מילים, ללא כותרות Markdown."
      : "אתה מראיין בתחנות הראיון של מבחני מו\"ר/מרק\"ם. הערך לפי: אותנטיות (לא תשובה משוננת), דוגמאות קונקרטיות, מודעות עצמית כולל חולשות, ובהירות. תן משוב בעברית: חוזקות, שיפורים קונקרטיים, ושאלת המשך אחת שמראיין היה שואל. עד 220 מילים, ללא כותרות Markdown.";
    try {
      const text = await callClaude(sys, [{ role: "user", content: `${kind === "dilemma" ? "הדילמה" : "שאלת הראיון"}: ${item.text}\n\nהתשובה שלי (עיקרי הדברים שאומר בקול):\n${answer}` }]);
      setFeedback(text);
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
          <button onClick={getFeedback} disabled={loading}
            className="mt-2 flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium"
            style={{ background: SCRUB, opacity: loading ? 0.6 : 1 }}>
            <Sparkles size={16} /> קבלת משוב מעריך
          </button>
          <FeedbackBox loading={loading} text={feedback} error={error} />
        </div>
      </div>
    </div>
  );
}

/* ============================ ראיון ארוך מול מראיין AI ============================ */

function InterviewerChat({ cfg }) {
  const [phase, setPhase] = useState("intro"); // intro | live | debrief
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [debrief, setDebrief] = useState("");
  const [debriefLoading, setDebriefLoading] = useState(false);
  const [error, setError] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current && bottomRef.current.scrollIntoView({ behavior: "smooth" }); }, [msgs, debrief]);

  const send = async () => {
    if (!input.trim() || busy) return;
    const next = [...msgs, { role: "user", content: input.trim() }];
    setMsgs(next); setInput(""); setBusy(true); setError(false);
    try {
      const reply = await callClaude(cfg.system, next, 450);
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
      const text = await callClaude(cfg.feedback, [{ role: "user", content: `התמליל:\n${transcript}` }]);
      setDebrief(text);
    } catch (e) { setError(e && e.message ? String(e.message) : true); }
    setDebriefLoading(false);
  };

  if (phase === "intro") return (
    <div className="bg-white rounded-2xl border p-5 fade-in" style={{ borderColor: "#E2EBE9" }}>
      <h3 className="font-display text-xl font-bold mb-2" style={{ color: INK }}>{cfg.title}</h3>
      <p className="text-sm leading-7 mb-4" style={{ color: "#2E4A4E" }}>{cfg.note} הקלידו את תשובותיכם בשיחה — המראיינים ישאלו שאלות המשך על מה שתכתבו, בדיוק כמו בריאיון אמיתי. מומלץ לומר כל תשובה גם בקול רם לפני שמקלידים.</p>
      <div className="flex flex-col items-center gap-4">
        <RingTimer totalSeconds={cfg.minutes * 60} label="משך הריאיון" autoKey={cfg.id} />
        <button onClick={() => { setMsgs([{ role: "assistant", content: cfg.opening }]); setPhase("live"); }}
          className="px-6 py-2.5 rounded-full text-white font-medium" style={{ background: SCRUB }}>
          להיכנס לריאיון ←
        </button>
      </div>
    </div>
  );

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
      <div className="p-4 space-y-3 overflow-y-auto" style={{ maxHeight: 340 }}>
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
      {phase === "live" && (
        <div className="flex gap-2 p-3 border-t" style={{ borderColor: "#E2EBE9" }}>
          <input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="התשובה שלי..."
            className="flex-1 rounded-full border px-4 py-2 text-sm outline-none"
            style={{ borderColor: "#CFE0DD", color: INK }} />
          <button onClick={send} disabled={busy} className="p-2.5 rounded-full text-white" style={{ background: SCRUB, opacity: busy ? 0.5 : 1 }}>
            <Send size={16} style={{ transform: "rotate(180deg)" }} />
          </button>
        </div>
      )}
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

/* ============================ יום מבחן מלא ============================ */

const STATION_LABEL = { sim: "סימולציה", interview: "ראיון", dilemma: "דילמה" };

function ExamDay() {
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
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current && bottomRef.current.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

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
    setPhase("live");
  };

  const send = async () => {
    if (!input.trim() || busy) return;
    const st = plan[idx];
    const next = [...msgs, { role: "user", content: input.trim() }];
    setMsgs(next); setInput(""); setBusy(true); setError(false);
    try {
      const reply = await callClaude(actorSystemFor(st.data), next, 400);
      setMsgs([...next, { role: "assistant", content: reply }]);
    } catch (e) { setError(e && e.message ? String(e.message) : true); }
    setBusy(false);
  };

  const finishStation = async () => {
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
      const text = await callClaude(
        "אתה המעריך הראשי ביום תחנות של מבחני מו\"ר/מרק\"ם. קיבלת תיעוד של 6 תחנות שעבר מועמד אחד: תמלילי סימולציות מול שחקן, ותקצירי תשובות בכתב לתחנות ראיון ודילמה. כתוב תחקיר מסכם בעברית: שורה-שתיים על כל תחנה (חוזק או נקודה לשיפור), ואז תמונה כוללת — 3 חוזקות רוחביות, 3 דברים לשיפור עם הצעות קונקרטיות, האם ניכרת עקביות או ירידה לאורך היום, והמלצה אחת מרכזית להמשך התרגול. היה כן, חם וישיר. עד 400 מילים, ללא כותרות Markdown — אפשר להשתמש במספור פשוט.",
        [{ role: "user", content: body }], 1500
      );
      setSummary(text);
    } catch (e) { setError(e && e.message ? String(e.message) : true); }
    setSumLoading(false);
  };

  if (phase === "start") return (
    <div className="bg-white rounded-2xl border p-5 fade-in text-center" style={{ borderColor: "#E2EBE9" }}>
      <div className="font-display text-2xl font-black mb-2" style={{ color: INK }}>יום מבחן מלא</div>
      <p className="text-sm leading-7 max-w-lg mx-auto mb-4" style={{ color: "#2E4A4E" }}>
        6 תחנות ברצף, בדיוק כמו ביום האמיתי: 3 סימולציות מול שחקן AI, 2 ראיונות ותחנת דילמה — בסדר מעורבב ועם תרחישים אקראיים. בין תחנות: 2 דקות התארגנות. בסוף: תחקיר מסכם של המעריך הראשי על כל היום. הקדישו לזה כשעה רצופה, בלי הפרעות.
      </p>
      <button onClick={buildPlan} className="px-6 py-2.5 rounded-full text-white font-medium" style={{ background: SCRUB }}>
        להתחיל את יום המבחן ←
      </button>
    </div>
  );

  const st = plan[idx];

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
          <div className="text-xs font-medium mb-2" style={{ color: AMBER }}>תחנה {idx + 1} מתוך 6 · דף הנחיות — 2 דקות התארגנות</div>
          <h3 className="font-display text-xl font-bold mb-2" style={{ color: INK }}>
            {st.type === "sim" ? st.data.title : STATION_LABEL[st.type]}
          </h3>
          <p className="text-sm leading-7 mb-4" style={{ color: "#2E4A4E" }}>
            {st.type === "sim" ? st.data.task : st.data.text}
          </p>
          <div className="flex flex-col items-center gap-4">
            <RingTimer totalSeconds={120} label="התארגנות" autoKey={`ed-brief-${idx}`} />
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
              <RingTimer totalSeconds={600} label="זמן התחנה" autoKey={`ed-live-${idx}`} />
            </div>
            {st.type === "sim" ? (
              <>
                <div className="space-y-3 overflow-y-auto mb-3" style={{ maxHeight: 260 }}>
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
                <div className="flex gap-2">
                  <input value={input} onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="מה תגידו?"
                    className="flex-1 rounded-full border px-4 py-2 text-sm outline-none"
                    style={{ borderColor: "#CFE0DD", color: INK }} />
                  <button onClick={send} disabled={busy} className="p-2.5 rounded-full text-white" style={{ background: SCRUB, opacity: busy ? 0.5 : 1 }}>
                    <Send size={16} style={{ transform: "rotate(180deg)" }} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="font-display font-bold mb-2 leading-relaxed" style={{ color: INK }}>{st.data.text}</p>
                <textarea value={answer} onChange={(e) => setAnswer(e.target.value)}
                  placeholder="ענו בקול רם, וסכמו כאן את עיקרי הדברים..."
                  className="w-full h-36 rounded-2xl border p-4 text-sm leading-relaxed outline-none bg-white"
                  style={{ borderColor: "#E2EBE9", color: INK }} />
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

/* ============================ מסך התחנות ============================ */

function Stations() {
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

/* ============================ של"ו ============================ */

function Shaul() {
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

/* ============================ מסלולים: צפת וחיפה ============================ */

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

function Tracks() {
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

/* ============================ טיפים וצ'קליסט ============================ */

function Tips() {
  const [checked, setChecked] = useState({});
  useEffect(() => { loadStore("checklist", {}).then(setChecked); }, []);
  const toggle = async (i) => {
    const next = { ...checked, [i]: !checked[i] };
    setChecked(next); await saveStore("checklist", next);
  };
  const doneCount = CHECKLIST.filter((_, i) => checked[i]).length;

  return (
    <div className="fade-in">
      <SectionTitle icon={CheckCircle2} title="טיפים וצ'קליסט מוכנות" sub="העקרונות שחוזרים שוב ושוב אצל מי שמצליחים — ורשימת המשימות שלכם עד יום המבחן (נשמרת אוטומטית)." />

      <div className="grid md:grid-cols-2 gap-3 mb-7">
        {TIPS.map((t, i) => (
          <div key={i} className="bg-white rounded-2xl border p-4" style={{ borderColor: "#E2EBE9" }}>
            <div className="font-medium text-sm mb-1" style={{ color: SCRUB }}>{t.h}</div>
            <p className="text-sm leading-relaxed" style={{ color: "#2E4A4E" }}>{t.p}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border p-4" style={{ borderColor: "#E2EBE9" }}>
        <div className="flex items-center justify-between mb-3">
          <span className="font-display font-bold" style={{ color: INK }}>צ'קליסט המוכנות שלי</span>
          <span className="text-sm font-medium" style={{ color: doneCount === CHECKLIST.length ? SCRUB : "#5C7A7D" }}>{doneCount}/{CHECKLIST.length}</span>
        </div>
        <div className="h-2 rounded-full mb-4" style={{ background: SCRUB_SOFT }}>
          <div className="h-2 rounded-full" style={{ background: SCRUB, width: `${(doneCount / CHECKLIST.length) * 100}%`, transition: "width .4s" }} />
        </div>
        <div className="space-y-2">
          {CHECKLIST.map((c, i) => (
            <button key={i} onClick={() => toggle(i)} className="w-full flex items-start gap-3 text-right p-2 rounded-xl"
              style={{ background: checked[i] ? "#F1F8F6" : "transparent" }}>
              <span className="flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center mt-0.5"
                style={{ borderColor: SCRUB, background: checked[i] ? SCRUB : "white" }}>
                {checked[i] && <CheckCircle2 size={14} color="white" />}
              </span>
              <span className="text-sm leading-relaxed" style={{ color: checked[i] ? "#5C7A7D" : INK, textDecoration: checked[i] ? "line-through" : "none" }}>{c}</span>
            </button>
          ))}
        </div>
        {doneCount === CHECKLIST.length && (
          <div className="mt-4 rounded-xl p-3 text-sm font-medium text-center fade-in" style={{ background: SCRUB_SOFT, color: SCRUB }}>
            🩺 כל הכבוד — נראה שאתם מוכנים. נשימה עמוקה, ושיהיה בהצלחה!
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================ אפליקציה ============================ */

export default function App() {
  const [tab, setTab] = useState("home");
  const NAV = [
    { id: "home", t: "בית", icon: Stethoscope },
    { id: "info", t: "מדריך", icon: BookOpen },
    { id: "bio", t: "ביוגרפי", icon: FileText },
    { id: "stations", t: "תחנות", icon: Timer },
    { id: "tracks", t: "צפת/חיפה", icon: Users },
    { id: "shaul", t: 'של"ו', icon: Brain },
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
