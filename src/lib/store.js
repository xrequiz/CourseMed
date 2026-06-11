// אחסון אישי — localStorage בדפדפן בלבד, שום מידע לא נשמר בשרת

export function loadStore(key, fallback) {
  try {
    const r = localStorage.getItem(`tachana7:${key}`);
    return r ? JSON.parse(r) : fallback;
  } catch (e) {
    return fallback;
  }
}

export function saveStore(key, value) {
  try {
    localStorage.setItem(`tachana7:${key}`, JSON.stringify(value));
  } catch (e) {
    /* אחסון מלא/חסום — נמשיך עם state בלבד */
  }
}

/* היסטוריית תרגול — כל משוב/תחקיר נשמר כדי לעקוב אחרי התקדמות */

const HISTORY_KEY = "history";
const HISTORY_MAX = 100;

export const HISTORY_KINDS = {
  bio: "ביוגרפי",
  sim: "סימולציה",
  dilemma: "דילמה",
  interview: "ראיון",
  track: "צפת/חיפה",
  examday: "יום מבחן",
};

export function loadHistory() {
  return loadStore(HISTORY_KEY, []);
}

export function addHistory(kind, title, text) {
  const entry = { kind, title, text, date: new Date().toISOString() };
  const next = [entry, ...loadHistory()].slice(0, HISTORY_MAX);
  saveStore(HISTORY_KEY, next);
  return next;
}

export function clearHistory() {
  saveStore(HISTORY_KEY, []);
}
