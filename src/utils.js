// src/utils.js - Fase 3, modulo 1: utilidades puras extraidas de src/main.js.
// Sin estado S, sin localStorage, sin Firebase, sin speechSynthesis.
// $ y $$ usan `document` solo como valor por defecto del parametro r.
// ENT_NAMED, CONTR, ONES, TENS y ORD son internas: solo las usan las funciones de este archivo.
// DAY, HEART_MS y MAX_HEARTS NO se movieron: se usan en todo main.js (corazones, SRS, progreso).

/* =================== UTILIDADES =================== */
export const $ = (s, r=document) => r.querySelector(s);
export const $$ = (s, r=document) => [...r.querySelectorAll(s)];
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/* v2.5.1: el texto de la IA puede traer entidades HTML (&quot; &amp; &#39;…). Se decodifica UNA vez al entrar y se escapa UNA vez al pintar. */
const ENT_NAMED = { quot: '"', amp: '&', apos: "'", lt: '<', gt: '>', nbsp: ' ', ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’', hellip: '…', mdash: '—', ndash: '–', iexcl: '¡', iquest: '¿' };
export function decodeEnt(s) {
  s = String(s ?? ''); if (s.indexOf('&') < 0) return s;
  for (let k = 0; k < 3; k++) {
    const t = s.replace(/&(?:#x([0-9a-f]{1,6})|#(\d{1,7})|(quot|amp|apos|nbsp)(?![a-z0-9])|(lt|gt|ldquo|rdquo|lsquo|rsquo|hellip|mdash|ndash|iexcl|iquest));?/gi, (m, hx, dc, n1, n2) => {
      if (hx || dc) { const cp = parseInt(hx || dc, hx ? 16 : 10); return cp > 0 && cp <= 0x10ffff && !(cp >= 0xd800 && cp <= 0xdfff) ? String.fromCodePoint(cp) : m; }
      if (!m.endsWith(';') && n2) return m;
      return ENT_NAMED[(n1 || n2).toLowerCase()] ?? m;
    });
    if (t === s) break; s = t;
  }
  return s;
}
export function decodeDeep(o) { if (typeof o === 'string') return decodeEnt(o); if (Array.isArray(o)) return o.map(decodeDeep); if (o && typeof o === 'object') { const r = {}; for (const k in o) r[k] = decodeDeep(o[k]); return r; } return o; }
export const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const pick = a => a[Math.floor(Math.random() * a.length)];
export const sample = (a, n) => shuffle(a).slice(0, n);
export const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
export const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
export const dayKey = (d = new Date()) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
export const dayDiff = (a, b) => Math.round((new Date(b + 'T12:00') - new Date(a + 'T12:00')) / 864e5);

/* =================== NORMALIZACION Y PUNTAJE =================== */
const CONTR = { "i'm": 'i am', "you're": 'you are', "we're": 'we are', "they're": 'they are', "he's": 'he is', "she's": 'she is', "it's": 'it is', "that's": 'that is', "what's": 'what is', "where's": 'where is', "there's": 'there is', "here's": 'here is', "how's": 'how is', "let's": 'let us', "i'll": 'i will', "you'll": 'you will', "we'll": 'we will', "they'll": 'they will', "i'd": 'i would', "you'd": 'you would', "we'd": 'we would', "i've": 'i have', "you've": 'you have', "we've": 'we have', "don't": 'do not', "doesn't": 'does not', "didn't": 'did not', "can't": 'can not', "cannot": 'can not', "won't": 'will not', "isn't": 'is not', "aren't": 'are not', "wasn't": 'was not', "weren't": 'were not', "haven't": 'have not', "hasn't": 'has not', "couldn't": 'could not', "wouldn't": 'would not', "shouldn't": 'should not' };
const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const ORD = [, 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth', 'twentieth', 'twenty first', 'twenty second', 'twenty third', 'twenty fourth', 'twenty fifth', 'twenty sixth', 'twenty seventh', 'twenty eighth', 'twenty ninth', 'thirtieth', 'thirty first'];
export function numWords(n) { n = +n; if (n < 20) return ONES[n]; if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : ''); if (n < 1000) return ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + numWords(n % 100) : ''); return String(n); }
export function normText(s) {
  s = String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’‘`´]/g, "'");
  s = s.replace(/\$(\d+)\.(\d\d)\b/g, (m, d, c) => numWords(d) + ' ' + numWords(+c));
  s = s.replace(/\$(\d+)/g, '$1 dollars');
  s = s.replace(/\b(\d{1,2})(st|nd|rd|th)\b/g, (m, n) => ORD[+n] || m);
  s = s.replace(/\b(19|20)(\d\d)\b/g, (m, a, b) => a === '20' && +b < 10 ? 'two thousand' + (+b ? ' ' + ONES[+b] : '') : numWords(+a) + ' ' + (+b < 10 ? (+b ? 'oh ' + ONES[+b] : 'hundred') : numWords(+b)));
  s = s.replace(/\b(\d{1,2}):(\d{2})\b/g, (m, h, mm) => numWords(h) + (mm === '00' ? '' : ' ' + numWords(mm)));
  s = s.replace(/\b\d{1,3}\b/g, m => numWords(m));
  s = s.replace(/[-–—/]/g, ' ').replace(/[^a-z0-9' ]/g, ' ');
  return s.split(/\s+/).filter(Boolean).flatMap(w => { w = w.replace(/^'+|'+$/g, ''); return (CONTR[w] || w).split(' '); }).filter(Boolean)
    .map(w => ({ ok: 'okay', mr: 'mister', ms: 'miss' }[w] || w));
}
export function lev(a, b) {
  const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) { const cur = [i]; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; }
  return prev[n];
}
export const charSim = (a, b) => 1 - lev(a, b) / Math.max(a.length, b.length, 1);
export function align(T, H) {
  const n = T.length, m = H.length, D = [], B = [];
  for (let i = 0; i <= n; i++) { D[i] = []; B[i] = []; for (let j = 0; j <= m; j++) {
    if (!i) { D[i][j] = j; B[i][j] = 'I'; continue; } if (!j) { D[i][j] = i; B[i][j] = 'D'; continue; }
    const sc = T[i - 1] === H[j - 1] ? 0 : 1 - charSim(T[i - 1], H[j - 1]) * 0.6;
    const opts = [[D[i - 1][j - 1] + sc, 'S'], [D[i - 1][j] + 1, 'D'], [D[i][j - 1] + 1, 'I']];
    opts.sort((x, y) => x[0] - y[0]); D[i][j] = opts[0][0]; B[i][j] = opts[0][1];
  } }
  const res = new Array(n).fill(null); let i = n, j = m;
  while (i > 0 || j > 0) { const b = B[i][j]; if (b === 'S') { res[i - 1] = { h: H[j - 1], sim: T[i - 1] === H[j - 1] ? 1 : charSim(T[i - 1], H[j - 1]) }; i--; j--; } else if (b === 'D') { res[i - 1] = { h: null, sim: 0 }; i--; } else j--; }
  const extra = Math.max(0, m - n);
  return { res, extra };
}
export const simScore = s => s >= 1 ? 1 : s >= 0.8 ? 0.6 : s > 0 ? 0.2 : 0;
export const colorOf = s => s >= 0.85 ? 'g' : s >= 0.4 ? 'y' : 'r';
/** Evalúa un intento. alts = [{t, c}] del reconocedor. Devuelve puntaje por palabra y total. */
export function scoreSpeech(target, alts) {
  const disp = target.split(/\s+/).filter(Boolean).map(tok => ({ tok, parts: normText(tok) }));
  const T = disp.flatMap(d => d.parts);
  const perAlt = alts.map(a => { const H = normText(a.t); const al = align(T, H); return { al, scores: al.res.map(r => r ? simScore(r.sim) : 0), extra: al.extra }; });
  const top = perAlt[0];
  const scores = T.map((w, k) => { let s = top.scores[k]; if (s < 1 && perAlt.slice(1).some(p => p.scores[k] === 1)) s = Math.max(s, 0.75); return s; });
  let k = 0;
  const words = disp.map(d => { const sub = scores.slice(k, k + d.parts.length); const heard = top.al.res.slice(k, k + d.parts.length).map(r => r && r.h).filter(Boolean).join(' '); k += d.parts.length; const s = d.parts.length ? Math.min(...sub) : 1; return { tok: d.tok, s, c: colorOf(s), heard }; });
  let total = avg(scores) - Math.min(0.15, top.extra * 0.05);
  const conf = alts[0].c;
  if (conf > 0) total *= 0.75 + 0.25 * Math.min(1, conf / 0.9);
  return { pct: Math.round(clamp(total, 0, 1) * 100), words, heard: alts[0].t, conf, alts };
}
/** Par mínimo: ¿el reconocedor escuchó la palabra objetivo o su pareja? */
export function scorePair(target, partner, alts) {
  const T = normText(target).join(' '), P = normText(partner).join(' ');
  const has = (a, w) => (' ' + normText(a.t).join(' ') + ' ').includes(' ' + w + ' ');
  const topT = has(alts[0], T), topP = has(alts[0], P), anyT = alts.findIndex(a => has(a, T));
  if (topT) return { pct: Math.round(100 * (alts[0].c ? 0.8 + 0.2 * Math.min(1, alts[0].c / 0.9) : 1)), ok: true, heard: alts[0].t, msg: '¡El reconocedor escuchó «' + target + '»!' };
  if (topP) return { pct: 15, ok: false, heard: alts[0].t, msg: 'El reconocedor escuchó «' + partner + '» en vez de «' + target + '».' };
  if (anyT > 0) return { pct: 65, ok: false, heard: alts[0].t, msg: 'Casi: «' + target + '» apareció como opción secundaria. Exagera más el sonido.' };
  const best = Math.max(...alts.map(a => charSim(normText(a.t).join(' '), T)));
  return { pct: Math.round(best * 50), ok: false, heard: alts[0].t, msg: 'Escuché «' + alts[0].t + '». Intenta de nuevo.' };
}
/** Tolerancia para escribir: mayúsculas, puntuación, contracciones y errores pequeños. */
export function typedMatch(input, answers) {
  const a = normText(input).join(' ');
  let best = { ok: false, typo: false };
  for (const ans of answers) {
    const b = normText(ans).join(' ');
    if (a === b) return { ok: true, typo: false };
    const d = lev(a, b), tol = b.length <= 4 ? 0 : b.length <= 12 ? 1 : Math.min(3, Math.floor(b.length / 10) + 1);
    if (d <= tol) best = { ok: true, typo: true };
  }
  return best;
}

/* =================== AYUDAS GENERALES (puras) =================== */
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export function b64FromBytes(bytes) { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s); }
export function f32ToB64(f32) { const i16 = new Int16Array(f32.length); for (let i = 0; i < f32.length; i++) { const s = Math.max(-1, Math.min(1, f32[i])); i16[i] = s < 0 ? s * 0x8000 : s * 0x7fff; } return b64FromBytes(new Uint8Array(i16.buffer)); }
export function hashStr(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return h.toString(16) + '_' + s.length; }
