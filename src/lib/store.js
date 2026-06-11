// אחסון אישי — localStorage בדפדפן בלבד, שום מידע לא נשמר בשרת.
// כל הנתונים נשמרים בנפרד לכל פרופיל (שם שמוזן במסך הכניסה).

const ROOT = "tachana7";

function rawLoad(key, fallback) {
  try {
    const r = localStorage.getItem(`${ROOT}:${key}`);
    return r ? JSON.parse(r) : fallback;
  } catch (e) {
    return fallback;
  }
}

function rawSave(key, value) {
  try {
    localStorage.setItem(`${ROOT}:${key}`, JSON.stringify(value));
  } catch (e) {
    /* אחסון מלא/חסום — נמשיך עם state בלבד */
  }
}

/* ---------- פרופילים ---------- */

export function listProfiles() {
  return rawLoad("profiles", []);
}

export function getActiveProfile() {
  return rawLoad("active-profile", null);
}

export function setActiveProfile(name) {
  if (name === null) {
    try { localStorage.removeItem(`${ROOT}:active-profile`); } catch (e) { /* noop */ }
  } else {
    rawSave("active-profile", name);
  }
}

export function createProfile(name) {
  const list = listProfiles();
  if (!list.includes(name)) {
    const isFirst = list.length === 0;
    rawSave("profiles", [...list, name]);
    if (isFirst) migrateLegacyData(name);
  }
}

export function removeProfile(name) {
  rawSave("profiles", listProfiles().filter((p) => p !== name));
  const prefix = `${ROOT}:u:${encodeURIComponent(name)}:`;
  try {
    const doomed = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) doomed.push(k);
    }
    doomed.forEach((k) => localStorage.removeItem(k));
  } catch (e) { /* noop */ }
  if (getActiveProfile() === name) setActiveProfile(null);
}

// נתונים שנשמרו לפני שהיו פרופילים — מועברים לפרופיל הראשון שנוצר
function migrateLegacyData(name) {
  for (const key of ["bio-answers", "checklist", "history"]) {
    const old = rawLoad(key, null);
    if (old !== null) {
      rawSave(`u:${encodeURIComponent(name)}:${key}`, old);
      try { localStorage.removeItem(`${ROOT}:${key}`); } catch (e) { /* noop */ }
    }
  }
}

/* ---------- אחסון לפי הפרופיל הפעיל ---------- */

function profileKey(key) {
  const p = getActiveProfile();
  return p ? `u:${encodeURIComponent(p)}:${key}` : key;
}

export function loadStore(key, fallback) {
  return rawLoad(profileKey(key), fallback);
}

export function saveStore(key, value) {
  rawSave(profileKey(key), value);
}

/* ---------- היסטוריית תרגול — כל משוב/תחקיר נשמר כדי לעקוב אחרי התקדמות ---------- */

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
