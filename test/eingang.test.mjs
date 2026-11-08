// node --test test/  – Meldung offener Vorschläge an die Redaktion (Auftrag 88)
import test from "node:test";
import assert from "node:assert/strict";
import { meldeOffene } from "../src/index.js";

const db = (n) => ({ prepare: (sql) => ({ first: async () => { assert.match(sql, /status = 'eingereicht'/); return { n }; } }) });

test("meldet Anzahl per Service Binding", async () => {
  let gesendet;
  const env = { DB: db(3), REDAKTION: { fetch: async (req) => { gesendet = { url: req.url, body: await req.json() }; return new Response("{}", { status: 200 }); } } };
  const r = await meldeOffene(env);
  assert.deepEqual(r, { ok: true, n: 3, status: 200 });
  assert.equal(gesendet.url, "https://redaktion/api/eingang");
  assert.deepEqual(gesendet.body, { site: "mixikon", art: "vorschlag", anzahl: 3, link: "https://mixikon.com/admin", titel: "3 Wortvorschläge warten auf Freigabe" });
});

test("ohne Binding: kein Absturz", async () => {
  assert.equal((await meldeOffene({ DB: db(1) })).ok, false);
});
