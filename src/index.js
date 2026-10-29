// Mixikon – Worker für mixikon.com
// Statische Seiten kommen aus ./public (Website + /admin). Dieser Code beantwortet nur /api/*.
// Vorschläge von Besuchern landen mit Status "eingereicht" in D1 und erscheinen erst nach Freigabe im Lexikon.

const WORD_RE = /^[A-Za-zÄÖÜäöüßÀ-ÿ][A-Za-zÄÖÜäöüßÀ-ÿ'\-]{1,29}$/;
const MAX_PRO_TAG = 20; // Vorschläge je Besucher und 24 h

const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra },
  });

const norm = (s) => s.normalize("NFC").trim().toLowerCase();
const clean = (s, max) => String(s ?? "").normalize("NFC").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, max);

async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function isAdmin(request, env) {
  const auth = request.headers.get("authorization") || "";
  const key = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!env.ADMIN_KEY || key.length !== env.ADMIN_KEY.length) return false;
  let diff = 0;
  for (let i = 0; i < key.length; i++) diff |= key.charCodeAt(i) ^ env.ADMIN_KEY.charCodeAt(i);
  return diff === 0;
}

async function vorschlagen(request, env) {
  let body;
  try { body = await request.json(); } catch { return json({ ok: false, fehler: "Ungültige Anfrage." }, 400); }
  if (body.website) return json({ ok: true, status: "neu" }); // Honeypot: Bots bekommen ein stilles OK

  const wort = clean(body.wort, 30), wort1 = clean(body.wort1, 30), wort2 = clean(body.wort2, 30);
  const bedeutung = clean(body.bedeutung, 140);
  const sprache = body.sprache === "en" ? "en" : "de";
  if (![wort, wort1, wort2].every((w) => WORD_RE.test(w)))
    return json({ ok: false, fehler: "Bitte nur Wörter mit 2 bis 30 Buchstaben." }, 400);
  if (norm(wort) === norm(wort1) || norm(wort) === norm(wort2))
    return json({ ok: false, fehler: "Das ist kein neues Wort." }, 400);

  const ip = request.headers.get("cf-connecting-ip") || "unbekannt";
  const tag = new Date().toISOString().slice(0, 10);
  const ipHash = (await sha256(`${ip}|${tag}|${env.SALT || "mixikon"}`)).slice(0, 32);
  const { anzahl } = await env.DB.prepare(
    "SELECT COUNT(*) AS anzahl FROM vorschlag WHERE ip_hash = ? AND erstellt > strftime('%Y-%m-%dT%H:%M:%SZ','now','-1 day')"
  ).bind(ipHash).first();
  if (anzahl >= MAX_PRO_TAG) return json({ ok: false, fehler: "Für heute sind genug Vorschläge da. Morgen gern wieder!" }, 429);

  const vorhanden = await env.DB.prepare("SELECT id, status FROM vorschlag WHERE wort_norm = ?").bind(norm(wort)).first();
  if (vorhanden) {
    if (vorhanden.status !== "abgelehnt")
      await env.DB.prepare("UPDATE vorschlag SET stimmen = stimmen + 1 WHERE id = ?").bind(vorhanden.id).run();
    return json({ ok: true, status: vorhanden.status === "live" ? "schon_live" : "schon_da" });
  }
  await env.DB.prepare(
    "INSERT INTO vorschlag (wort, wort_norm, wort1, wort2, bedeutung, sprache, ip_hash) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).bind(wort, norm(wort), wort1, wort2, bedeutung || null, sprache, ipHash).run();
  return json({ ok: true, status: "neu" });
}

async function lexikon(env) {
  const { results } = await env.DB.prepare(
    "SELECT wort, wort1, wort2, bedeutung, sprache, entschieden FROM vorschlag WHERE status = 'live' ORDER BY entschieden DESC LIMIT 500"
  ).all();
  return json({ woerter: results }, 200, { "cache-control": "public, max-age=60" });
}

async function adminListe(url, env) {
  const status = ["eingereicht", "live", "abgelehnt"].includes(url.searchParams.get("status")) ? url.searchParams.get("status") : "eingereicht";
  const { results } = await env.DB.prepare(
    "SELECT id, wort, wort1, wort2, bedeutung, sprache, status, merch, stimmen, erstellt, entschieden FROM vorschlag WHERE status = ? ORDER BY stimmen DESC, erstellt DESC LIMIT 300"
  ).bind(status).all();
  const zahlen = await env.DB.prepare("SELECT status, COUNT(*) AS n FROM vorschlag GROUP BY status").all();
  return json({ vorschlaege: results, zahlen: Object.fromEntries(zahlen.results.map((r) => [r.status, r.n])) });
}

async function adminEntscheiden(request, env) {
  let b;
  try { b = await request.json(); } catch { return json({ ok: false, fehler: "Ungültige Anfrage." }, 400); }
  const id = Number(b.id);
  if (!Number.isInteger(id) || !["eingereicht", "live", "abgelehnt"].includes(b.status))
    return json({ ok: false, fehler: "id oder status fehlt." }, 400);
  await env.DB.prepare(
    "UPDATE vorschlag SET status = ?, bedeutung = COALESCE(?, bedeutung), merch = ?, entschieden = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = ?"
  ).bind(b.status, b.bedeutung != null ? clean(b.bedeutung, 140) : null, b.merch ? 1 : 0, id).run();
  return json({ ok: true });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const p = url.pathname;
    try {
      if (p === "/api/vorschlag" && request.method === "POST") return await vorschlagen(request, env);
      if (p === "/api/lexikon" && request.method === "GET") return await lexikon(env);
      if (p.startsWith("/api/admin/")) {
        if (!isAdmin(request, env)) return json({ ok: false, fehler: "Schlüssel fehlt oder ist falsch." }, 401);
        if (p === "/api/admin/liste" && request.method === "GET") return await adminListe(url, env);
        if (p === "/api/admin/entscheiden" && request.method === "POST") return await adminEntscheiden(request, env);
      }
      if (p.startsWith("/api/")) return json({ ok: false, fehler: "Nicht gefunden." }, 404);
      return env.ASSETS.fetch(request);
    } catch (e) {
      return json({ ok: false, fehler: "Serverfehler. Bitte später nochmal versuchen." }, 500);
    }
  },
};
