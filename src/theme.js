export const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@500;700;900&family=Heebo:wght@300;400;500;700&display=swap');
.font-display { font-family: 'Frank Ruhl Libre', 'Heebo', serif; }
.font-body { font-family: 'Heebo', sans-serif; }
.fade-in { animation: fadeIn .4s ease both; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(6px);} to { opacity:1; transform:none;} }
@keyframes micPulse { 0%,100% { box-shadow: 0 0 0 0 #B3261E55; } 50% { box-shadow: 0 0 0 8px #B3261E00; } }
.mic-live { animation: micPulse 1.4s ease infinite; }
@media (prefers-reduced-motion: reduce) { .fade-in, .mic-live { animation: none; } }
input:focus-visible, textarea:focus-visible, button:focus-visible { outline: 2px solid #0E6E66AA; outline-offset: 2px; }
`;

/* צבעים (Tailwind core בלבד + inline) */
export const INK = "#10282C";       // פטרול כהה
export const SCRUB = "#0E6E66";     // טורקיז "חלוק ניתוח"
export const SCRUB_SOFT = "#DDEEEA";
export const AMBER = "#C97F1F";     // טיימר/אזהרה
export const PAPER = "#FBFCFB";
