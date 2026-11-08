// cleebration Markenspiel (kofferwort) – eine Datei, keine Abhängigkeiten. Claude, Chat MyProj Eggstra, 08.11.2026.
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
// Mixikon – Kofferwort-Raten. Wortpaare: Lexikon-Klassiker, Auflösung = übliches Kofferwort.
const KOFFER = [
  ['Breakfast', 'Lunch', 'Brunch', ['Breanch', 'Lunfast']],
  ['Smoke', 'Fog', 'Smog', ['Foke', 'Smofog']],
  ['Motor', 'Hotel', 'Motel', ['Hotor', 'Motetel']],
  ['Deutsch', 'Englisch', 'Denglisch', ['Englutsch', 'Deusch']],
  ['teuer', 'Euro', 'Teuro', ['Eurer', 'Teuo']],
  ['ja', 'nein', 'jein', ['nja', 'neja']],
  ['Bombay', 'Hollywood', 'Bollywood', ['Holbay', 'Bombwood']],
  ['Grusel', 'Musical', 'Grusical', ['Musel', 'Grusikal']],
  ['Spoon', 'Fork', 'Spork', ['Foon', 'Sporkon']],
  ['Kur', 'Urlaub', 'Kurlaub', ['Urkur', 'Kurlaurb']],
  ['Labrador', 'Poodle', 'Labradoodle', ['Poodrador', 'Labrapoodle']],
  ['Information', 'Entertainment', 'Infotainment', ['Entermation', 'Informent']],
];
export function mount(root) {
  stil(`.mx-opts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;width:100%;max-width:520px}
@media(max-width:480px){.mx-opts{grid-template-columns:1fr}}
.mx-opts button{font:700 1.05rem var(--sp-font-body,system-ui);padding:14px 8px;border-radius:12px;border:1.5px solid rgba(255,255,255,.25);background:rgba(255,255,255,.06);color:inherit;cursor:pointer}
.mx-opts button.richtig{background:var(--sp-ok,#2E9E5B);border-color:var(--sp-ok,#2E9E5B)}
.mx-opts button.falsch{background:var(--sp-akzent,#E8443A);border-color:var(--sp-akzent,#E8443A)}
.mx-teile{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;align-items:center}.mx-teile b{color:var(--sp-akzent2,#F2A30E);font-weight:400}`);
  root.classList.add('sp');
  const RUNDE = 8;
  let runde, i, punkte, serie, rek = lies('mixikon-spiel-rekord', 0), gesperrt, timer;
  const neu = () => { runde = mischen(KOFFER).slice(0, RUNDE); i = 0; punkte = 0; serie = 0; zeichne() };
  function zeichne() {
    if (i >= runde.length) {
      if (punkte > rek) { rek = punkte; schreib('mixikon-spiel-rekord', rek) }
      root.innerHTML = `<div class="sp-mitte"><div class="sp-gross">${punkte} von ${runde.length} richtig</div><p class="sp-hinweis">Rekord: ${rek}</p><button class="sp-btn" data-neu>Neue Runde</button></div>`;
      $('[data-neu]', root).onclick = neu; return;
    }
    const [a, b, ok, falsch] = runde[i];
    root.innerHTML = `<div class="sp-hud"><span>Wort ${i + 1}/${runde.length}</span><span>Punkte ${punkte}</span><span>Serie ${serie}</span><span>Rekord ${rek}</span></div>
      <div class="sp-mitte"><div class="sp-gross mx-teile"><span>${a}</span><b>+</b><span>${b}</span><b>=</b><span>?</span></div>
      <div class="mx-opts">${mischen([ok, ...falsch]).map(o => `<button type="button" data-w="${o}">${o}</button>`).join('')}</div>
      <p class="sp-hinweis">Welches Kofferwort steckt in den beiden Wörtern?</p></div>`;
    gesperrt = false;
    root.querySelectorAll('.mx-opts button').forEach(btn => btn.onclick = () => {
      if (gesperrt) return; gesperrt = true;
      const t = btn.dataset.w === ok;
      btn.classList.add(t ? 'richtig' : 'falsch');
      if (!t) root.querySelector(`[data-w="${ok}"]`).classList.add('richtig');
      if (t) { punkte++; serie++; ton(880); ton(1320, .2, 'triangle', .15, .08) } else { serie = 0; ton(180, .25, 'square', .08) }
      timer = setTimeout(() => { i++; zeichne() }, 900);
    });
  }
  neu();
  return () => clearTimeout(timer);
}
