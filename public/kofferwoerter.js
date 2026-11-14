// Mixikon – Kofferwörter fürs Spiel (Raten + Tagesrätsel). Geprüft 2026-11-14 (Claude, Projekt Game Spiele).
// [Wort1, Wort2, Kofferwort, Quelle, Alternativen je Teilwort (optional, fürs Tagesrätsel)]
// Quellen: R = Reischer, „Kreuzungen“, Uni Regensburg 2010 (epub.uni-regensburg.de/12910) · Q = quillbot.com/de/blog/stilmittel/kofferwort
// S = Schwäbische Zeitung, „Auf ein Kofferwort“ · T = blogs.transparent.com/german/german-kofferworter-portmanteau-words
// W = Wiktionary/Wikipedia-Artikel zum Wort · O = owad.de/word/portmanteau · A = alleantworten.de (Markennamen) · B = Mixikon-Bestand (Spiel vom 08.11.2026)
export const KOFFERWOERTER = [
  ["Breakfast", "Lunch", "Brunch", "W O", [["Frühstück"], ["Mittagessen"]]],
  ["Smoke", "Fog", "Smog", "W O", [["Rauch"], ["Nebel"]]],
  ["Motor", "Hotel", "Motel", "O S"],
  ["Deutsch", "Englisch", "Denglisch", "Q T R"],
  ["teuer", "Euro", "Teuro", "T R"],
  ["ja", "nein", "jein", "R"],
  ["Bombay", "Hollywood", "Bollywood", "R"],
  ["Kur", "Urlaub", "Kurlaub", "S R"],
  ["Main", "Manhattan", "Mainhattan", "T S R"],
  ["Polizei", "Hostesse", "Politesse", "S R"],
  ["Besserwisser", "Wessi", "Besserwessi", "S R"],
  ["Ost", "Nostalgie", "Ostalgie", "W R", [["Osten"], []]],
  ["Schach", "Sachverstand", "Schachverstand", "S"],
  ["Britain", "Exit", "Brexit", "T S", [["British", "Britannien", "Großbritannien"], []]],
  ["nichtsdestoweniger", "trotzdem", "nichtsdestotrotz", "T"],
  ["Daten", "Kartei", "Datei", "Q"],
  ["Mechanik", "Elektronik", "Mechatronik", "Q R"],
  ["Web", "Log", "Blog", "Q", [[], ["Logbuch"]]],
  ["digital", "Camera", "Digicam", "Q", [[], ["Kamera"]]],
  ["iPod", "Broadcast", "Podcast", "Q"],
  ["stay", "vacation", "Staycation", "Q"],
  ["Web", "Seminar", "Webinar", "Q"],
  ["Wiki", "Encyclopedia", "Wikipedia", "W A", [[], ["Enzyklopädie"]]],
  ["Osmium", "Wolfram", "Osram", "A"],
  ["Nestlé", "Café", "Nescafé", "A R", [["Nestle"], ["Kaffee"]]],
  ["Tanganjika", "Sansibar", "Tansania", "W", [["Tanganyika"], ["Zanzibar"]]],
  ["Lion", "Tiger", "Liger", "R", [["Löwe"], []]],
  ["Camera", "Recorder", "Camcorder", "R", [["Kamera"], []]],
  ["Net", "Etiquette", "Netiquette", "R", [["Netz"], ["Etikette"]]],
  ["schleppen", "Laptop", "Schlepptop", "R"],
  ["Mainz", "Heinzelmännchen", "Mainzelmännchen", "R"],
  ["Biologie", "Technik", "Bionik", "R"],
  ["Telekommunikation", "Informatik", "Telematik", "R"],
  ["Schaf", "Ziege", "Schiege", "R"],
  ["Information", "Entertainment", "Infotainment", "R B", [[], ["Unterhaltung"]]],
  ["Education", "Entertainment", "Edutainment", "R", [["Bildung"], ["Unterhaltung"]]],
  ["Emotion", "Icon", "Emoticon", "R"],
  ["Spanish", "English", "Spanglish", "R", [["Spanisch"], ["Englisch"]]],
  ["Oxford", "Cambridge", "Oxbridge", "R"],
  ["Europa", "Asien", "Eurasien", "R", [["Europe"], ["Asia"]]],
  ["Grusel", "Musical", "Grusical", "B"],
  ["Spoon", "Fork", "Spork", "B", [["Löffel"], ["Gabel"]]],
  ["Labrador", "Poodle", "Labradoodle", "B", [[], ["Pudel"]]],
];

const n = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ß/g, "ss").replace(/[^a-z0-9]/g, "");
export const gleich = (a, b) => n(a) === n(b);

// Zwei falsche Mischungen (für das Ratespiel): vertauschte Reihenfolge und falsche Fuge
export function falsche([a, b, ok]) {
  const cap = (s) => (s = s.toLowerCase(), ok[0] === ok[0].toUpperCase() ? s.charAt(0).toUpperCase() + s.slice(1) : s);
  const h = (s, vorn) => (vorn ? s.slice(0, Math.max(2, Math.ceil(s.length / 2))) : s.slice(Math.floor(s.length / 2)));
  const kandidaten = [
    cap(h(b, true) + h(a, false)),
    cap(a.slice(0, Math.max(2, a.length - 2)) + b.slice(Math.min(b.length - 2, 2))),
    cap(h(a, true) + b),
    cap(a + h(b, false)),
  ];
  const out = [];
  for (const k of kandidaten) if (!gleich(k, ok) && !out.some((o) => gleich(o, k)) && k.length > 2) out.push(k);
  return out.slice(0, 2);
}

// Tagesrätsel: gleiches Wort für alle an einem Tag (Wiener Zeit), feste Mischung
export function tagesNummer(d = new Date()) {
  const t = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Vienna" }).format(d); // JJJJ-MM-TT
  return Math.round((Date.parse(t + "T00:00:00Z") - Date.parse("2026-11-14T00:00:00Z")) / 86400000) + 1;
}
export function tagesWort(nr) {
  const reihe = KOFFERWOERTER.map((_, i) => i);
  let s = 20261114;
  const r = () => ((s = (s * 1103515245 + 12345) >>> 0) / 4294967296);
  for (let i = reihe.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [reihe[i], reihe[j]] = [reihe[j], reihe[i]]; }
  const k = ((nr - 1) % reihe.length + reihe.length) % reihe.length;
  return KOFFERWOERTER[reihe[k]];
}
// Passt eine Eingabe auf Teilwort i (0/1)? Reihenfolge der beiden Teile ist egal (prüft der Aufrufer).
export function passt(eintrag, i, text) {
  const alt = (eintrag[4] && eintrag[4][i]) || [];
  return [eintrag[i], ...alt].some((w) => gleich(w, text));
}
