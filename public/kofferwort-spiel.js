// cleebration Markenspiel (kofferwort) – keine Abhängigkeiten. Claude, Chat MyProj Eggstra, 08.11.2026.
// 2026-11-14 (Projekt Game Spiele): 43 geprüfte Kofferwörter (kofferwoerter.js) + Tagesrätsel mit Hinweisen, Serie und Teilen.
import { KOFFERWOERTER, falsche, tagesNummer, tagesWort, passt } from "./kofferwoerter.js";
const lies = (k, f) => { try { const v = localStorage.getItem(k); return v == null ? f : JSON.parse(v) } catch { return f } };
const schreib = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} };
const mischen = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a };
let actx = null;
function audio() { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); } catch { actx = null } return actx }
function ton(f, dauer = .15, typ = 'triangle', laut = .2, wann = 0) {
  const a = audio(); if (!a) return;
  const t = a.currentTime + wann, o = a.createOscillator(), g = a.createGain();
  o.type = typ; o.frequency.value = f; g.gain.setValueAtTime(laut, t); g.gain.exponentialRampToValueAtTime(.0001, t + dauer);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + dauer + .02);
}
const $ = (s, el = document) => el.querySelector(s);
const CSS = `
.sp{background:var(--sp-bg,#16131F);color:var(--sp-ink,#F5F2FF);border-radius:18px;padding:18px;display:flex;flex-direction:column;gap:12px;font-family:var(--sp-font-body,system-ui,sans-serif);max-width:760px;margin:0 auto;min-height:380px}
.sp-hud{display:flex;flex-wrap:wrap;gap:8px;font-size:.88rem}
.sp-hud span{background:rgba(255,255,255,.1);padding:4px 10px;border-radius:8px;font-variant-numeric:tabular-nums}
.sp-mitte{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center}
.sp-hinweis{font-size:.88rem;opacity:.75;margin:0}
.sp-btn{font:700 1rem var(--sp-font-body,system-ui,sans-serif);border:0;border-radius:12px;padding:11px 20px;cursor:pointer;background:var(--sp-akzent,#E8443A);color:var(--sp-akzent-ink,#fff)}
.sp-btn:focus-visible,.sp button:focus-visible{outline:3px solid var(--sp-akzent2,#F2A30E);outline-offset:2px}
.sp canvas{display:block;width:100%;height:auto;border-radius:12px;touch-action:manipulation;user-select:none;-webkit-user-select:none;max-width:100%}
.sp-gross{font-family:var(--sp-font-display,inherit);font-size:clamp(1.3rem,5vw,2rem);line-height:1.15}
@media(prefers-reduced-motion:reduce){.sp *{transition:none!important;animation:none!important}}
`;
function stil(extra = '') {
  if (!document.getElementById('sp-stil')) { const s = document.createElement('style'); s.id = 'sp-stil'; s.textContent = CSS; document.head.appendChild(s) }
  if (extra) { const s = document.createElement('style'); s.textContent = extra; document.head.appendChild(s) }
}
function leinwand(cv, w, h) { const c = cv.getContext('2d'); if (!c) return null; const d = Math.min(devicePixelRatio || 1, 2); cv.width = w * d; cv.height = h * d; c.scale(d, d); if (!c.roundRect) c.roundRect = function (x, y, ww, hh) { this.rect(x, y, ww, hh) }; return c }

const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const KOFFER = KOFFERWOERTER.map((e) => [e[0], e[1], e[2], falsche(e)]);

export function mount(root) {
  stil(`.mx-opts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;width:100%;max-width:520px}
@media(max-width:480px){.mx-opts{grid-template-columns:1fr}}
.mx-opts button{font:700 1.05rem var(--sp-font-body,system-ui);padding:14px 8px;border-radius:12px;border:1.5px solid rgba(255,255,255,.25);background:rgba(255,255,255,.06);color:inherit;cursor:pointer}
.mx-opts button.richtig{background:var(--sp-ok,#2E9E5B);border-color:var(--sp-ok,#2E9E5B)}
.mx-opts button.falsch{background:var(--sp-akzent,#E8443A);border-color:var(--sp-akzent,#E8443A)}
.mx-teile{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;align-items:center}.mx-teile b{color:var(--sp-akzent2,#F2A30E);font-weight:400}
.mx-tabs{display:flex;gap:6px;justify-content:center}.mx-tabs button{font:700 .95rem var(--sp-font-body,system-ui);padding:8px 16px;border-radius:999px;border:1.5px solid rgba(255,255,255,.25);background:transparent;color:inherit;cursor:pointer}
.mx-tabs button[aria-selected="true"]{background:var(--sp-akzent2,#7D9BFF);border-color:var(--sp-akzent2,#7D9BFF);color:#11131F}
.mx-wort{font-family:var(--sp-font-display,inherit);font-size:clamp(1.8rem,8vw,3.2rem);letter-spacing:.04em;color:var(--sp-akzent2,#7D9BFF);word-break:break-word}
.mx-felder{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;align-items:center;width:100%}
.mx-felder input{font:600 1.1rem var(--sp-font-body,system-ui);padding:12px 14px;border-radius:12px;border:1.5px solid rgba(255,255,255,.3);background:rgba(255,255,255,.07);color:inherit;width:min(14em,100%)}
.mx-felder input.ok{border-color:var(--sp-ok,#2E9E5B);background:rgba(46,158,91,.25)}
.mx-felder input.nein{border-color:var(--sp-akzent,#E8443A);animation:mxwackel .3s}
@keyframes mxwackel{25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
.mx-knoepfe{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
.mx-zweit{background:transparent!important;border:1.5px solid rgba(255,255,255,.35)!important;color:inherit!important}
.mx-hinweise{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:4px;font-size:.95rem;opacity:.9}`);
  root.classList.add("sp");
  root.innerHTML = `<div class="mx-tabs" role="tablist"><button role="tab" data-tab="raten">Raten</button><button role="tab" data-tab="tag">Tagesrätsel</button></div><div class="mx-platz" style="display:flex;flex-direction:column;gap:12px;flex:1"></div>`;
  const platz = $(".mx-platz", root);
  let stopp = () => {};
  function zeige(tab) {
    stopp();
    root.querySelectorAll(".mx-tabs button").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === tab)));
    stopp = tab === "tag" ? tagesraetsel(platz) : raten(platz);
    if (history.replaceState) history.replaceState(null, "", tab === "tag" ? "#tag" : location.pathname + location.search);
  }
  root.querySelectorAll(".mx-tabs button").forEach((b) => (b.onclick = () => zeige(b.dataset.tab)));
  zeige(location.hash === "#tag" ? "tag" : "raten");
  return () => stopp();
}

function raten(root) {
  const RUNDE = 8;
  let runde, i, punkte, serie, rek = lies("mixikon-spiel-rekord", 0), gesperrt, timer;
  const neu = () => { runde = mischen(KOFFER).slice(0, RUNDE); i = 0; punkte = 0; serie = 0; zeichne(); };
  function zeichne() {
    if (i >= runde.length) {
      if (punkte > rek) { rek = punkte; schreib("mixikon-spiel-rekord", rek); }
      root.innerHTML = `<div class="sp-mitte"><div class="sp-gross">${punkte} von ${runde.length} richtig</div><p class="sp-hinweis">Rekord: ${rek}</p><button class="sp-btn" data-neu>Neue Runde</button></div>`;
      $("[data-neu]", root).onclick = neu; return;
    }
    const [a, b, ok, falsch] = runde[i];
    root.innerHTML = `<div class="sp-hud"><span>Wort ${i + 1}/${runde.length}</span><span>Punkte ${punkte}</span><span>Serie ${serie}</span><span>Rekord ${rek}</span></div>
      <div class="sp-mitte"><div class="sp-gross mx-teile"><span>${esc(a)}</span><b>+</b><span>${esc(b)}</span><b>=</b><span>?</span></div>
      <div class="mx-opts">${mischen([ok, ...falsch]).map((o) => `<button type="button" data-w="${esc(o)}">${esc(o)}</button>`).join("")}</div>
      <p class="sp-hinweis">Welches Kofferwort steckt in den beiden Wörtern?</p></div>`;
    gesperrt = false;
    root.querySelectorAll(".mx-opts button").forEach((btn) => (btn.onclick = () => {
      if (gesperrt) return; gesperrt = true;
      const t = btn.dataset.w === ok;
      btn.classList.add(t ? "richtig" : "falsch");
      if (!t) root.querySelectorAll(".mx-opts button").forEach((x) => { if (x.dataset.w === ok) x.classList.add("richtig"); });
      if (t) { punkte++; serie++; ton(880); ton(1320, 0.2, "triangle", 0.15, 0.08); } else { serie = 0; ton(180, 0.25, "square", 0.08); }
      timer = setTimeout(() => { i++; zeichne(); }, 900);
    }));
  }
  neu();
  return () => clearTimeout(timer);
}

// Tagesrätsel: ein Kofferwort am Tag, beide Teilwörter finden. Bis zu 3 Hinweise, dann Auflösung.
function tagesraetsel(root) {
  const nr = tagesNummer(), e = tagesWort(nr), schluessel = "mixikon-tag";
  const alle = lies(schluessel, {});
  const st = alle[nr] || { gefunden: [false, false], hinweise: 0, fertig: false, aufgegeben: false };
  const sichern = () => { alle[nr] = st; for (const k of Object.keys(alle)) if (+k < nr - 60) delete alle[k]; schreib(schluessel, alle); };
  const serie = () => { let n = 0; for (let t = nr; alle[t] && alle[t].fertig && !alle[t].aufgegeben; t--) n++; return n; };
  const HINWEIS = [
    () => `Anfangsbuchstaben: <b>${esc(e[0][0].toUpperCase())}…</b> und <b>${esc(e[1][0].toUpperCase())}…</b>`,
    () => `Länge: ${e[0].length} und ${e[1].length} Buchstaben – <b>${esc(e[0].slice(0, 3))}…</b> und <b>${esc(e[1].slice(0, 3))}…</b>`,
    () => `Fast geschenkt: <b>${esc(e[0].slice(0, -1))}_</b> und <b>${esc(e[1].slice(0, -1))}_</b>`,
  ];
  function teilen() {
    const txt = `Mixikon Tagesrätsel Nr. ${nr} 🧳 ${st.aufgegeben ? "aufgelöst" : st.hinweise ? `gelöst mit ${st.hinweise} ${st.hinweise === 1 ? "Hinweis" : "Hinweisen"} 💡` : "ohne Hinweis gelöst ⭐"} – mixikon.com/spiel#tag`;
    if (navigator.share) navigator.share({ text: txt }).catch(() => {});
    else if (navigator.clipboard) navigator.clipboard.writeText(txt).then(() => { const k = $("[data-teilen]", root); if (k) k.textContent = "Kopiert!"; }, () => {});
  }
  function zeichne() {
    const fertig = st.fertig;
    root.innerHTML = `<div class="sp-hud"><span>Tagesrätsel Nr. ${nr}</span><span>Hinweise ${st.hinweise}/3</span><span>Serie ${serie()}</span></div>
      <div class="sp-mitte"><p class="sp-hinweis">Aus welchen zwei Wörtern ist dieses Kofferwort gemischt?</p>
      <div class="mx-wort">${esc(e[2])}</div>
      <form class="mx-felder" data-form autocomplete="off">
        ${[0, 1].map((i) => `<input name="w${i}" aria-label="Wort ${i + 1}" placeholder="Wort ${i + 1}" ${st.gefunden[i] || fertig ? `value="${esc(e[i])}" readonly class="ok"` : ""} autocapitalize="off" spellcheck="false">`).join("")}
        ${fertig ? "" : `<button class="sp-btn" type="submit">Prüfen</button>`}
      </form>
      <ul class="mx-hinweise">${HINWEIS.slice(0, fertig ? 0 : st.hinweise).map((h) => `<li>💡 ${h()}</li>`).join("")}</ul>
      ${fertig ? `<div class="sp-gross">${st.aufgegeben ? "Aufgelöst." : "Gelöst! 🎉"}</div>
        <p class="sp-hinweis">${esc(e[0])} + ${esc(e[1])} = ${esc(e[2])}. Morgen gibt es ein neues Wort.</p>
        <div class="mx-knoepfe"><button class="sp-btn" type="button" data-teilen>Ergebnis teilen</button><button class="sp-btn mx-zweit" type="button" data-raten>Weiterraten</button></div>`
        : `<div class="mx-knoepfe">${st.hinweise < 3 ? `<button class="sp-btn mx-zweit" type="button" data-hinweis>Hinweis</button>` : ""}<button class="sp-btn mx-zweit" type="button" data-auf>Auflösen</button></div>`}
      </div>`;
    const f = $("[data-form]", root);
    if (!fertig) {
      f.onsubmit = (ev) => {
        ev.preventDefault();
        let neu = false;
        for (const inp of f.querySelectorAll("input:not([readonly])")) {
          const v = inp.value.trim(); if (!v) continue;
          const treffer = [0, 1].find((i) => !st.gefunden[i] && passt(e, i, v));
          if (treffer != null) { st.gefunden[treffer] = true; neu = true; }
          else { inp.classList.remove("nein"); void inp.offsetWidth; inp.classList.add("nein"); }
        }
        if (neu) { ton(880); if (st.gefunden[0] && st.gefunden[1]) { st.fertig = true; ton(1320, 0.25, "triangle", 0.15, 0.1); } sichern(); zeichne(); }
        else ton(180, 0.2, "square", 0.06);
      };
      const h = $("[data-hinweis]", root); if (h) h.onclick = () => { st.hinweise = Math.min(3, st.hinweise + 1); sichern(); zeichne(); };
      $("[data-auf]", root).onclick = () => { st.fertig = true; st.aufgegeben = true; sichern(); zeichne(); };
      const leer = f.querySelector("input:not([readonly])"); if (leer) leer.focus({ preventScroll: true });
    } else {
      $("[data-teilen]", root).onclick = teilen;
      $("[data-raten]", root).onclick = () => { const t = document.querySelector('.mx-tabs [data-tab="raten"]'); if (t) t.click(); };
    }
  }
  zeichne();
  return () => {};
}
