// src/account.js - Fase 3, modulo 6: cuenta y nube (validacion, frase de seguridad PBKDF2/AES-GCM, Firebase Auth + Firestore Lite, sincronizacion).
// Extraido de src/main.js. KS/FB viven aqui como live bindings: main.js los importa.
// LOCKED y _lockSig se reasignan tambien desde main.js (wrapper _save28 y arranque), asi que se exponen setLocked/getLockSig/setLockSig.
// Las funciones de main.js que se usan aqui se importan desde './main.js' (import circular;
// solo se usan dentro de funciones, nunca en top-level, igual que en state.js/audio.js/lessons.js/chat.js).
// NO se movieron: save/freshState/adoptState/mergeStates/decodeState/applyImport/importPrompt (se reasignan en main.js),
// lsGet/lsSet (usados en todo main.js), fbOnUser/fbRefreshUI (se reasignan en el panel de administrador),
// ni el panel de administrador y comentarios (UI, va con el modulo 7).
import { $, $$, esc } from './utils.js';
import { S, DEFAULT_SETTINGS, BAD_KEYS } from './state.js';
import { numHash, uid, AZT } from './chat.js';
import { save, freshState, toast, modal, confirmBox, render, TAB, fbOnUser, fbRefreshUI, decodeState, mergeStates, adoptState, exportState, checkBadges, streamBytes, SECRET_KEYS, lsGet, lsSet } from './main.js';

export const b64u = bytes => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
export const unb64u = str => { const s = atob(str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4)); const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; };
export const clampNum = x => { const n = +x; return Number.isFinite(n) ? Math.max(-1e15, Math.min(1e15, n)) : 0; };
export function deepClean(x, depth, cnt) {
  if (x === null) return null;
  const t = typeof x;
  if (t === 'string') return x.length > 4000 ? x.slice(0, 4000) : x;
  if (t === 'number') return Number.isFinite(x) ? x : 0;
  if (t === 'boolean') return x;
  if (t !== 'object' || depth > 10) return undefined;
  if (++cnt.n > 250000) throw new Error('El progreso es demasiado grande o está dañado.');
  if (Array.isArray(x)) { const out = []; for (let i = 0; i < Math.min(x.length, 3000); i++) { const v = deepClean(x[i], depth + 1, cnt); if (v !== undefined) out.push(v); } return out; }
  const o = {}; for (const k of Object.keys(x)) { if (BAD_KEYS.has(k) || k.length > 200) continue; const v = deepClean(x[k], depth + 1, cnt); if (v !== undefined) o[k] = v; }
  return o;
}
export function sanitizeSettings(s) {
  const out = {}; if (!s || typeof s !== 'object' || Array.isArray(s)) return out;
  for (const k of Object.keys(s)) {
    if (SECRET_KEYS.includes(k) || BAD_KEYS.has(k) || k.length > 60) continue;
    const v = s[k], def = DEFAULT_SETTINGS[k];
    if (def !== undefined && def !== null && typeof v !== typeof def) continue;
    if (typeof v === 'string') out[k] = v.slice(0, 300);
    else if (typeof v === 'number') out[k] = Number.isFinite(v) ? v : (def || 0);
    else if (typeof v === 'boolean') out[k] = v;
    else if (Array.isArray(v) && v.every(x => typeof x === 'string') && JSON.stringify(v).length < 2000) out[k] = v.slice(0, 5).map(x => x.slice(0, 120)); // p. ej. settings.customScenarios (P4)
    else if (v && typeof v === 'object' && !Array.isArray(v) && JSON.stringify(v).length < 2000) out[k] = deepClean(v, 0, { n: 0 });
  }
  return out;
}
export function sanitizeState(d) {
  if (!d || typeof d !== 'object' || Array.isArray(d)) throw new Error('El progreso no es válido.');
  const o = deepClean(d, 0, { n: 0 }), f = freshState();
  for (const k in f) {
    if (!(k in o)) continue; const want = f[k], v = o[k];
    if (typeof want === 'number') o[k] = clampNum(v);
    else if (Array.isArray(want)) { if (!Array.isArray(v)) o[k] = []; }
    else if (want && typeof want === 'object') { if (!v || typeof v !== 'object' || Array.isArray(v)) o[k] = {}; }
  }
  ['placement', 'lastDay'].forEach(k => { if (k in o) o[k] = typeof o[k] === 'string' ? o[k].slice(0, 40) : null; });
  if ('chatProfile' in o) o.chatProfile = typeof o.chatProfile === 'string' ? o.chatProfile.slice(0, 600) : null; // (P10: nota de perfil del chat largo)
  if ('placementFree' in o) { const pf = o.placementFree; o.placementFree = pf && typeof pf === 'object' && !Array.isArray(pf) && ['A0', 'A2', 'B1', 'B2', 'C1'].includes(pf.level) ? { date: String(pf.date || '').slice(0, 20), level: pf.level, foci: Array.isArray(pf.foci) ? pf.foci.slice(0, 3).map(f => String(f).slice(0, 200)) : [], summary_es: String(pf.summary_es || '').slice(0, 500), scores: pf.scores && typeof pf.scores === 'object' ? pf.scores : {}, azurePct: clampNum(pf.azurePct), weak: Array.isArray(pf.weak) ? pf.weak.slice(0, 3) : [] } : null; } // (P11: habla libre de la prueba de nivel)
  const objMap = (m, fn) => { for (const k of Object.keys(m || {})) { const e = m[k]; if (!e || typeof e !== 'object' || Array.isArray(e)) delete m[k]; else if (fn) fn(e, k); } };
  if (o.deck) objMap(o.deck, e => { e.en = String(e.en ?? '').slice(0, 400); e.es = String(e.es ?? '').slice(0, 400); ['ef', 'int', 'reps', 'due', 'lapses'].forEach(n => { if (n in e) e[n] = clampNum(e[n]); }); });
  if (o.hard) objMap(o.hard, e => { e.w = String(e.w ?? '').slice(0, 80); e.n = clampNum(e.n); e.t = clampNum(e.t); if (e.note != null) e.note = String(e.note).slice(0, 300); });
  ['done', 'ear', 'wd', 'ph', 'days', 'plans', 'challenges'].forEach(k => { if (o[k]) objMap(o[k]); });
  if (o.snd) for (const k of Object.keys(o.snd)) { if (!Array.isArray(o.snd[k])) delete o.snd[k]; else o.snd[k] = o.snd[k].filter(e => e && typeof e === 'object' && !Array.isArray(e)); }
  ['summaries', 'interviews', 'convoItems'].forEach(k => { if (k in o) o[k] = Array.isArray(o[k]) ? o[k].filter(e => e && typeof e === 'object' && !Array.isArray(e)).slice(0, 100) : []; });
  (o.convoItems || []).forEach(c => { c.en = String(c.en ?? '').slice(0, 400); if (c.es != null) c.es = String(c.es).slice(0, 400); c.ts = clampNum(c.ts); });
  const str = (x, n) => String(x ?? '').slice(0, n);
  if (o.summaries) o.summaries = o.summaries.map(r => { const d = r.data && typeof r.data === 'object' && !Array.isArray(r.data) ? r.data : {}; const arr = (x, f) => Array.isArray(x) ? x.filter(e => e && typeof e === 'object').slice(0, 12).map(f) : [];
    return { ...r, id: str(r.id || uid(), 40), ts: clampNum(r.ts), title: str(r.title, 120), date: str(r.date, 20), added: clampNum(r.added), data: { summary_es: str(d.summary_es, 1500), scores: d.scores && typeof d.scores === 'object' && !Array.isArray(d.scores) ? d.scores : {},
      mistakes: arr(d.mistakes, m => ({ said: str(m.said, 400), correct: str(m.correct, 400), explain_es: str(m.explain_es, 600) })).filter(m => m.correct), new_words: arr(d.new_words, w => ({ en: str(w.en, 200), es: str(w.es, 200) })).filter(w => w.en),
      mispronounced: arr(d.mispronounced, w => ({ word: str(w.word, 80), note_es: str(w.note_es, 300) })).filter(w => w.word),
      misheard: arr(d.misheard, w => ({ word: str(w.word, 80), heard_as: str(w.heard_as, 80), note_es: str(w.note_es, 300) })).filter(w => w.word), tips_es: Array.isArray(d.tips_es) ? d.tips_es.slice(0, 6).map(t => str(t, 400)) : [],
      livePron: d.livePron && typeof d.livePron === 'object' && !Array.isArray(d.livePron) ? { pct: clampNum(d.livePron.pct), turns: clampNum(d.livePron.turns), weak: arr(d.livePron.weak, w => ({ p: str(w.p, 10), s: clampNum(w.s) })).filter(w => w.p), words: arr(d.livePron.words, w => ({ word: str(w.word, 80), s: clampNum(w.s) })).filter(w => w.word) } : undefined } }; }); // (3b: pronunciación medida en vivo con Azure)
  if (o.badges) for (const k of Object.keys(o.badges)) o.badges[k] = clampNum(o.badges[k]);
  ['tc', 'pd'].forEach(k => { if (k in o && (!o[k] || typeof o[k] !== 'object' || Array.isArray(o[k]))) o[k] = {}; });
  o.settings = sanitizeSettings(o.settings);
  return o;
}
/* ---- Frase de seguridad: PBKDF2-SHA256 + AES-GCM 256 (WebCrypto) ---- */
export const KDF_ITER = 310000, KEYS_AAD = 'tuki-keys-v1', LOCK_FIELDS = ['geminiKey', 'openaiKey', 'azureKey', 'azureRegion'], KEYS_LOCAL = 'tukiSpeak.keysLocal';
export const KS = { key: null, salt: '', iter: 0 };
export let LOCKED = false;
const _te = new TextEncoder(), _td = new TextDecoder();
export async function kdf(phrase, saltBytes, iter) {
  const base = await crypto.subtle.importKey('raw', _te.encode(String(phrase).normalize('NFC')), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt: saltBytes, iterations: iter }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
export async function newKS(phrase) { const salt = crypto.getRandomValues(new Uint8Array(16)); return { key: await kdf(phrase, salt, KDF_ITER), salt: b64u(salt), iter: KDF_ITER }; }
export async function sealKeys(obj, ks) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: _te.encode(KEYS_AAD) }, ks.key, _te.encode(JSON.stringify(obj))));
  return { v: 1, alg: 'PBKDF2-SHA256/AES-GCM-256', salt: ks.salt, iv: b64u(iv), ct: b64u(ct), iter: ks.iter };
}
export function validBlob(b) { return !!b && typeof b === 'object' && b.v === 1 && typeof b.salt === 'string' && b.salt.length >= 16 && b.salt.length <= 64 && typeof b.iv === 'string' && b.iv.length >= 12 && b.iv.length <= 32 && typeof b.ct === 'string' && b.ct.length > 0 && b.ct.length <= 8192 && Number.isInteger(b.iter) && b.iter >= KDF_ITER && b.iter <= 5000000; }
export async function openKeys(blob, key) {
  if (!validBlob(blob)) { const e = new Error('Los datos cifrados no son válidos.'); e.code = 'bad-blob'; throw e; }
  let pt; try { pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64u(blob.iv), additionalData: _te.encode(KEYS_AAD) }, key, unb64u(blob.ct)); }
  catch (e) { const er = new Error('Frase incorrecta. Revisa mayúsculas, espacios y tildes.'); er.code = 'bad-phrase'; throw er; }
  const o = JSON.parse(_td.decode(pt)), out = {}; LOCK_FIELDS.forEach(k => { if (typeof o[k] === 'string') out[k] = o[k].slice(0, 400); }); return out;
}
export async function ksFromPhrase(blob, phrase) { if (!validBlob(blob)) throw Object.assign(new Error('Los datos cifrados no son válidos.'), { code: 'bad-blob' }); const key = await kdf(phrase, unb64u(blob.salt), blob.iter); const obj = await openKeys(blob, key); return { ks: { key, salt: blob.salt, iter: blob.iter }, obj }; }
export const keysObj = () => { const o = {}; LOCK_FIELDS.forEach(k => o[k] = String(S.settings[k] || '')); return o; };
export const keysSig = () => String(numHash(JSON.stringify(keysObj())));
export const hasAnyKey = () => SECRET_KEYS.some(k => !!S.settings[k]);
export function phraseStrength(p) {
  p = String(p || ''); let sc = 0; if (p.length >= 10) sc++; if (p.length >= 14) sc++; if (p.length >= 20) sc++;
  if (/[a-záéíóúñ]/.test(p) && /[A-ZÁÉÍÓÚÑ]/.test(p)) sc++; if (/\d/.test(p)) sc++; if (/[^\wáéíóúñÁÉÍÓÚÑ]/.test(p)) sc++; if (/\s/.test(p.trim()) && p.trim().split(/\s+/).length >= 3) sc++;
  if (/^(.)\1+$/.test(p) || /^(1234|abcd|qwer|password|contraseña)/i.test(p)) sc = Math.min(sc, 1);
  const lv = p.length < 10 ? 0 : sc <= 2 ? 1 : sc <= 4 ? 2 : 3;
  return { lv, label: ['Muy corta (mínimo 10)', 'Débil', 'Aceptable', 'Fuerte'][lv], tip: lv < 2 ? 'Usa una frase de 3 o 4 palabras que solo tú sepas, con algún número o signo.' : '' };
}
/* Claves bloqueadas: en localStorage solo queda la versión cifrada */
export function lockApply() { if (!LOCKED || !S || !S.settings) return; LOCK_FIELDS.forEach(k => { const d = Object.getOwnPropertyDescriptor(S.settings, k); if (d && !d.enumerable) return; const v = S.settings[k] || ''; delete S.settings[k]; Object.defineProperty(S.settings, k, { value: v, writable: true, enumerable: false, configurable: true }); }); }
export function lockRelease() { if (!S || !S.settings) return; LOCK_FIELDS.forEach(k => { const v = S.settings[k] || ''; delete S.settings[k]; S.settings[k] = v; }); }
let _lockSig = '';
export function applyKeys(obj, overwrite) { LOCK_FIELDS.forEach(k => { if (obj[k] && (overwrite || !S.settings[k])) S.settings[k] = obj[k]; }); }
export async function setLocalLock(on) {
  if (on) { if (!KS.key) throw new Error('Primero crea o escribe tu frase de seguridad.'); lsSet(KEYS_LOCAL, await sealKeys(keysObj(), KS)); LOCKED = true; _lockSig = keysSig(); lockApply(); save(); }
  else { LOCKED = false; lockRelease(); lsSet(KEYS_LOCAL, null); save(); }
}
/* ---- Firebase (plan Spark): Auth + Firestore Lite, cargados solo cuando hacen falta ---- */
export const FB_VER = '12.19.0', FB_BASE = 'https://www.gstatic.com/firebasejs/' + FB_VER + '/';
export const FB_CFG = { apiKey: 'AIzaSyBdnIF-wOZSz49VP9iEXJKCfCG_4mLyoNA', authDomain: 'tuki-speak.firebaseapp.com', projectId: 'tuki-speak', storageBucket: 'tuki-speak.firebasestorage.app', messagingSenderId: '948705004733', appId: '1:948705004733:web:94f96d5fba0d8d7b707bd4' };
export const FB_HINT = 'tukiSpeak.fbUser', FB_OWNER = 'tukiSpeak.owner', CLOUD_META = 'tukiSpeak.cloudMeta';
export const CLOUD_SCHEMA = 1, SYNC_MIN_MS = 45000, SYNC_DEBOUNCE_MS = 8000, CLOUD_MAX = 950000;
export const syncMin = () => window.__syncMinMs ?? SYNC_MIN_MS, syncDebounce = () => window.__syncDebounceMs ?? SYNC_DEBOUNCE_MS;
export const FB = { st: 'idle', user: null, ready: null, err: '', msg: '', dirty: false, timer: null, busy: false, lastSync: 0, first: false, remoteKeys: undefined, keysDirty: false };
export const AUTH_ERR = {
  'auth/invalid-email': 'El correo no es válido. Revísalo.', 'auth/missing-email': 'Escribe tu correo.', 'auth/missing-password': 'Escribe tu contraseña.',
  'auth/user-disabled': 'Esta cuenta está desactivada.', 'auth/user-not-found': 'No hay ninguna cuenta con ese correo. ¿Quieres crearla?',
  'auth/wrong-password': 'Correo o contraseña incorrectos.', 'auth/invalid-credential': 'Correo o contraseña incorrectos.', 'auth/invalid-login-credentials': 'Correo o contraseña incorrectos.',
  'auth/email-already-in-use': 'Ya existe una cuenta con ese correo. Toca «Entrar» o usa «Olvidé mi contraseña».', 'auth/weak-password': 'La contraseña es muy débil: usa al menos 6 caracteres (mejor 10 o más).',
  'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.', 'auth/network-request-failed': 'Sin conexión a internet. Revisa tu red e inténtalo otra vez.',
  'auth/popup-closed-by-user': 'Cerraste la ventana de Google antes de terminar.', 'auth/cancelled-popup-request': 'Se canceló el inicio de sesión. Inténtalo otra vez.',
  'auth/popup-blocked': 'El navegador bloqueó la ventana de Google. Te llevamos a la página de inicio de sesión…', 'auth/unauthorized-domain': 'Este sitio no está autorizado para iniciar sesión.',
  'auth/operation-not-allowed': 'Este método de inicio de sesión no está activado.', 'auth/requires-recent-login': 'Por seguridad, vuelve a iniciar sesión.',
  'auth/account-exists-with-different-credential': 'Ese correo ya está registrado con otro método. Entra con correo y contraseña.', 'auth/internal-error': 'Error interno del servicio. Inténtalo más tarde.',
  'auth/user-token-expired': 'Tu sesión venció. Vuelve a iniciar sesión.', 'auth/web-storage-unsupported': 'Tu navegador bloquea el almacenamiento necesario (¿modo privado?).',
  'permission-denied': 'La nube rechazó el acceso (reglas de seguridad).', 'unavailable': 'La nube no responde. Se intentará más tarde.', 'resource-exhausted': 'Se alcanzó el límite gratis de hoy. Se reintentará mañana.',
  'unauthenticated': 'Tu sesión venció. Vuelve a iniciar sesión.', 'deadline-exceeded': 'La nube tardó demasiado. Se intentará más tarde.'
};
export const authErr = e => AUTH_ERR[e && e.code] || AUTH_ERR[String(e && e.code || '').replace(/^firestore\//, '')] || (e && e.message && !/firebase/i.test(e.message) ? e.message : 'No se pudo completar. Inténtalo otra vez.');
export const devName = () => { const ua = navigator.userAgent; return ((/Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Windows/.test(ua) ? 'Windows' : /Mac/.test(ua) ? 'Mac' : 'Linux') + ' · ' + (/Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Navegador')).slice(0, 60); };
export function fbLoad() {
  if (FB.ready) return FB.ready;
  FB.st = 'loading'; FB.err = ''; fbRefreshUI();
  FB.ready = (async () => {
    const imp = window.__fbImport || (n => import(FB_BASE + 'firebase-' + n + '.js'));
    const [A, U, F] = await Promise.all([imp('app'), imp('auth'), imp('firestore-lite')]);
    FB.U = U; FB.F = F;
    FB.app = A.getApps && A.getApps().length ? A.getApps()[0] : A.initializeApp(FB_CFG);
    FB.auth = U.getAuth(FB.app); FB.db = F.getFirestore(FB.app);
    try { U.useDeviceLanguage && U.useDeviceLanguage(FB.auth); } catch (e) {}
    try { await U.getRedirectResult(FB.auth); } catch (e) { FB.err = authErr(e); }
    await new Promise(res => { let first = true; U.onAuthStateChanged(FB.auth, u => { fbOnUser(u); if (first) { first = false; res(); } }); });
    FB.st = 'ready'; fbRefreshUI();
  })();
  FB.ready.catch(e => { FB.ready = null; FB.st = 'error'; FB.err = navigator.onLine ? 'No se pudo cargar el inicio de sesión. Revisa tu conexión o si un bloqueador lo impide.' : 'Sin conexión: la cuenta se conectará cuando vuelvas a tener internet. La app sigue funcionando.'; fbRefreshUI(); });
  return FB.ready;
}
export function fbFail(e) { FB.busy = false; FB.err = authErr(e); fbRefreshUI(); }
export const localHasData = () => !!(S.xp || Object.keys(S.done || {}).length || Object.keys(S.deck || {}).length || (S.sessions || 0) > 0);
export const cloudMeta = () => (lsGet(CLOUD_META, {})[FB.user && FB.user.uid] || {});
export const setCloudMeta = o => { const m = lsGet(CLOUD_META, {}); m[FB.user.uid] = { ...(m[FB.user.uid] || {}), ...o }; lsSet(CLOUD_META, m); };
export const uref = (...p) => FB.F.doc(FB.db, 'users', FB.user.uid, ...p);
export async function readMeta() { const m = await FB.F.getDoc(uref()); const d = m.exists() ? m.data() : null; FB.remoteKeys = d && validBlob(d.keysEnc) ? d.keysEnc : null; return d; }
export async function readData() {
  const [p, s] = await Promise.all([FB.F.getDoc(uref('data', 'progress')), FB.F.getDoc(uref('data', 'settings'))]);
  if (!p.exists()) return null;
  const pd = p.data(); if (!pd || typeof pd.z !== 'string' || !/^TK[01]$/.test(pd.enc)) throw new Error('Los datos de la nube no son válidos.');
  const st = await decodeState(pd.enc + pd.z);
  st.settings = sanitizeSettings(s.exists() ? (s.data() || {}).s : {});
  return st;
}
export function cloudSettings() { const o = sanitizeSettings(JSON.parse(JSON.stringify(S.settings))); LOCK_FIELDS.forEach(k => delete o[k]); return o; }
export async function packProgress() {
  const o = exportState(); o.settings = {}; LOCK_FIELDS.forEach(k => delete o.settings[k]);
  const raw = new TextEncoder().encode(JSON.stringify(o));
  if (window.CompressionStream) { try { return { z: b64u(await streamBytes(raw, new CompressionStream('deflate-raw'))), enc: 'TK1', n: raw.length }; } catch (e) {} }
  return { z: b64u(raw), enc: 'TK0', n: raw.length };
}
export async function keysForCloud(force) {
  if (!KS.key) return undefined;
  const sg = keysSig(); if (!force && !FB.keysDirty && sg === cloudMeta().k && FB.remoteKeys) return undefined;
  const blob = await sealKeys(keysObj(), KS); FB.pendingKeySig = sg; return blob;
}
export async function cloudPush(opts = {}) {
  const now = Date.now(), rev = FB.rev || 0, prog = await packProgress();
  if (prog.z.length > CLOUD_MAX) throw new Error('Tu progreso es demasiado grande para la nube (' + Math.round(prog.z.length / 1024) + ' KB).');
  const sets = cloudSettings(), sig = { p: String(numHash(prog.z)), s: String(numHash(JSON.stringify(sets))) }, last = cloudMeta();
  const b = FB.F.writeBatch(FB.db); let n = 0;
  if (opts.force || sig.p !== last.p) { b.set(uref('data', 'progress'), { z: prog.z, enc: prog.enc, n: prog.n, updatedAt: now }); n++; }
  if (opts.force || sig.s !== last.s) { b.set(uref('data', 'settings'), { s: sets, updatedAt: now }); n++; }
  const ke = await keysForCloud(opts.forceKeys);
  if (!n && ke === undefined) { FB.dirty = (FB.rev || 0) !== rev; return 0; }
  const meta = { schemaVersion: CLOUD_SCHEMA, updatedAt: now, device: devName(), progressSize: prog.n, app: 'tuki-speak' };
  if (ke !== undefined) meta.keysEnc = ke;
  b.set(uref(), meta, { merge: true }); n++;
  await b.commit();
  const upd = { p: sig.p, s: sig.s, seen: now, last: now }; if (ke !== undefined) { upd.k = FB.pendingKeySig; FB.remoteKeys = ke; FB.keysDirty = false; }
  setCloudMeta(upd); FB.dirty = (FB.rev || 0) !== rev; FB.lastSync = now; FB.writes = (FB.writes || 0) + n;
  return n;
}
export function adoptMerged(remote) {
  const merged = mergeStates(S, remote);
  LOCK_FIELDS.forEach(k => merged.settings[k] = S.settings[k] || '');
  adoptState(merged); checkBadges();
}
export async function cloudFirstSync() {
  if (FB.first || !FB.user) return; FB.first = true; FB.busy = true; FB.err = ''; fbRefreshUI();
  try {
    const uid = FB.user.uid, owner = lsGet(FB_OWNER, null);
    const meta = await readMeta(), remote = meta ? await readData() : null;
    let mode = remote ? 'merge' : 'upload';
    if (owner && owner.uid && owner.uid !== uid && localHasData()) {
      mode = await askOtherOwner(owner, !!remote);
      if (mode === 'cancel') { FB.busy = false; await fbSignOut(false, true); toast('Sesión cerrada. Tus datos locales no se tocaron.'); return; }
    }
    if (mode === 'cloud') { const f = remote || freshState(); LOCK_FIELDS.forEach(k => { if (f.settings) f.settings[k] = ''; }); KS.key = null; if (LOCKED) { LOCKED = false; lsSet(KEYS_LOCAL, null); } _adopt28FromCloud(f); }
    else if (remote) adoptMerged(remote);
    lsSet(FB_OWNER, { uid, email: FB.user.email });
    if (remote) setCloudMeta({ seen: meta.updatedAt });
    FB.busy = false; await cloudPush({ force: !remote });
    FB.msg = remote ? (mode === 'cloud' ? '☁️ Usando el progreso de esta cuenta.' : '☁️ Progreso de la nube combinado con este dispositivo.') : '☁️ Tu progreso se subió a la nube.';
    toast(FB.msg);
    if (FB.remoteKeys && !KS.key && !hasAnyKey()) setTimeout(() => unlockPrompt('cloud'), 400);
  } catch (e) { fbFail(e); } finally { FB.busy = false; fbRefreshUI(); }
}
export function _adopt28FromCloud(f) { const fr = freshState(); const d = { ...fr, ...f, settings: { ...DEFAULT_SETTINGS, ...(f.settings || {}) } }; LOCK_FIELDS.forEach(k => d.settings[k] = ''); adoptState(d); }
export function askOtherOwner(owner, hasRemote) {
  return new Promise(res => {
    let done = false; const fin = (v, close) => { if (done) return; done = true; close && close(); res(v); };
    modal(`<h2>👥 Otra cuenta en este dispositivo</h2><p class="small">Este dispositivo tiene progreso de <b>${esc(owner.email || 'otra cuenta')}</b>. Estás entrando como <b>${esc(FB.user.email || 'otra cuenta')}</b>.</p>
      <div class="tipbox small"><b>Combinar</b> junta ese progreso con el de tu cuenta. <b>Usar solo mi cuenta</b> reemplaza lo de este dispositivo por ${hasRemote ? 'lo que tienes en la nube' : 'un progreso nuevo'} (también quita las claves de API guardadas aquí).</div>
      <div class="col" style="gap:8px;display:flex;flex-direction:column"><button class="btn primary block" id="ooMerge">Combinar con mi cuenta</button><button class="btn ghost block" id="ooCloud">Usar solo mi cuenta</button><button class="btn ghost block" id="ooCancel">Cancelar y cerrar sesión</button></div>`, (el, close) => {
      $('#ooMerge', el).onclick = () => fin('merge', close); $('#ooCloud', el).onclick = () => fin('cloud', close); $('#ooCancel', el).onclick = () => fin('cancel', close);
      el.closest('.overlay').addEventListener('click', e => { if (e.target === e.currentTarget) fin('cancel'); });
    });
  });
}
export async function cloudSync(reason) {
  if (!FB.user || FB.busy || !FB.F) return;
  if (!navigator.onLine) { FB.err = 'Sin conexión: se sincronizará al volver internet.'; fbRefreshUI(); return; }
  FB.busy = true; clearTimeout(FB.timer); FB.timer = null; FB.err = ''; fbRefreshUI();
  try {
    const meta = await readMeta(), cm = cloudMeta();
    if (meta && meta.updatedAt && meta.updatedAt !== cm.seen) { const remote = await readData(); if (remote) adoptMerged(remote); setCloudMeta({ seen: meta.updatedAt }); }
    const n = await cloudPush({ forceKeys: reason === 'keys' });
    if (reason === 'manual') toast(n ? '☁️ Sincronizado' : '☁️ Todo al día');
  } catch (e) { fbFail(e); if (reason === 'manual') toast('⚠️ ' + authErr(e), 4500); }
  finally { FB.busy = false; fbRefreshUI(); if (FB.dirty) fbSchedule(); }
}
export function fbSchedule() {
  if (!FB.user || FB.timer) return;
  const wait = Math.max(syncDebounce(), FB.lastSync + syncMin() - Date.now());
  FB.timer = setTimeout(() => { FB.timer = null; cloudSync('auto'); }, wait);
}
export function fbMarkDirty() { FB.rev = (FB.rev || 0) + 1; if (!FB.user) return; FB.dirty = true; if (!FB.busy) fbSchedule(); }
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && FB.user && FB.dirty && Date.now() - FB.lastSync > 10000) cloudSync('hidden'); });
/* ---- acciones de cuenta ---- */
export async function fbGoogle() {
  await fbLoad(); const U = FB.U, prov = new U.GoogleAuthProvider(); try { prov.setCustomParameters({ prompt: 'select_account' }); } catch (e) {}
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (standalone && /Android|iPhone|iPad/.test(navigator.userAgent)) return U.signInWithRedirect(FB.auth, prov);
  try { await U.signInWithPopup(FB.auth, prov); }
  catch (e) { if (['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment'].includes(e.code)) { acMsg(authErr(e)); return U.signInWithRedirect(FB.auth, prov); } throw e; }
}
export async function fbEmail(mode, email, pass) {
  email = String(email || '').trim(); if (!email) throw { code: 'auth/missing-email' }; if (!pass) throw { code: 'auth/missing-password' };
  await fbLoad(); const U = FB.U;
  if (mode === 'up') { if (String(pass).length < 6) throw { code: 'auth/weak-password' }; await U.createUserWithEmailAndPassword(FB.auth, email, pass); }
  else await U.signInWithEmailAndPassword(FB.auth, email, pass);
}
export async function fbReset(email) { email = String(email || '').trim(); if (!email) throw { code: 'auth/missing-email' }; await fbLoad(); await FB.U.sendPasswordResetEmail(FB.auth, email); }
export async function fbVerify() { await FB.U.sendEmailVerification(FB.raw); }
export async function fbReload() { if (FB.U.reload) await FB.U.reload(FB.raw); else if (FB.raw.reload) await FB.raw.reload(); fbOnUser(FB.auth.currentUser || FB.raw); }
export async function fbSignOut(wipe, quiet) {
  if (FB.user && FB.dirty && !wipe && !quiet) { try { await Promise.race([cloudSync('signout'), new Promise(r => setTimeout(r, 5000))]); } catch (e) {} }
  clearTimeout(FB.timer); FB.timer = null;
  if (FB.U) await FB.U.signOut(FB.auth);
  KS.key = null; FB.dirty = false; FB.first = false;
  AZT.tok = ''; AZT.region = ''; AZT.exp = 0; AZT.p = null;
  if (wipe) {
    [FB_OWNER, KEYS_LOCAL, CLOUD_META, 'tukiSpeak.gist'].forEach(k => localStorage.removeItem(k)); LOCKED = false;
    const f = freshState(); f.settings = { ...DEFAULT_SETTINGS, theme: S.settings.theme }; adoptState(f); toast('🧹 Datos de este dispositivo borrados.');
  } else if (!quiet) toast('👋 Sesión cerrada. Tu progreso sigue en este dispositivo.');
  fbRefreshUI();
}
export function unlockPrompt(src) {
  if (document.querySelector('#ulPhrase')) return;
  modal(`<h2>🔐 Desbloquear tus claves</h2><p class="small">${src === 'cloud' ? 'Tienes claves de API guardadas <b>cifradas</b> en tu cuenta.' : 'Tus claves de API están <b>bloqueadas</b> en este dispositivo.'} Escribe tu frase de seguridad para usarlas.</p>
    <input class="field" id="ulPhrase" type="password" autocomplete="off" placeholder="Frase de seguridad"><div class="ac-msg small" id="ulMsg" role="status"></div>
    <div class="row"><button class="btn ghost block" data-x>Ahora no</button><button class="btn primary block" id="ulGo">🔓 Desbloquear</button></div>`, (el, close) => {
    $('[data-x]', el).onclick = () => { sessionStorage.setItem('tukiUnlockLater', '1'); close(); };
    const go = async () => { const b = $('#ulGo', el); b.disabled = true; $('#ulMsg', el).textContent = '⏳ Comprobando…'; try { await unlockKeys($('#ulPhrase', el).value); close(); toast('🔓 Claves desbloqueadas'); } catch (e) { $('#ulMsg', el).textContent = '❌ ' + (e.message || e); $('#ulMsg', el).className = 'ac-msg err small'; b.disabled = false; } };
    $('#ulGo', el).onclick = go; $('#ulPhrase', el).onkeydown = e => { if (e.key === 'Enter') go(); };
  });
}
export async function unlockKeys(phrase) {
  const cands = [FB.remoteKeys, lsGet(KEYS_LOCAL, null)].filter(validBlob); if (!cands.length) throw new Error('No hay claves cifradas para desbloquear.');
  let last; for (const b of cands) { try { const { ks, obj } = await ksFromPhrase(b, phrase); Object.assign(KS, ks); applyKeys(obj, false); if (b === FB.remoteKeys && FB.user) setCloudMeta({ k: keysSig() }); if (LOCKED) { lsSet(KEYS_LOCAL, await sealKeys(keysObj(), KS)); _lockSig = keysSig(); lockApply(); } save(); fbRefreshUI(); if (TAB === 'settings') render(); return true; } catch (e) { last = e; } }
  throw last;
}
export async function createPhrase(p1, p2) {
  if (String(p1).length < 10) throw new Error('La frase debe tener al menos 10 caracteres.'); if (p1 !== p2) throw new Error('Las dos frases no coinciden.');
  if (FB.remoteKeys) throw new Error('Ya tienes una frase en la nube: desbloquéala o usa «Olvidé mi frase».');
  Object.assign(KS, await newKS(p1)); FB.keysDirty = true;
  if (LOCKED) lsSet(KEYS_LOCAL, await sealKeys(keysObj(), KS));
  if (FB.user) await cloudSync('keys');
}
export async function changePhrase(oldP, p1, p2) {
  if (String(p1).length < 10) throw new Error('La nueva frase debe tener al menos 10 caracteres.'); if (p1 !== p2) throw new Error('Las dos frases nuevas no coinciden.');
  const cur = FB.remoteKeys || lsGet(KEYS_LOCAL, null);
  if (validBlob(cur)) await ksFromPhrase(cur, oldP); else if (!KS.key) throw new Error('No hay frase activa.');
  Object.assign(KS, await newKS(p1)); FB.keysDirty = true;
  if (LOCKED) { lsSet(KEYS_LOCAL, await sealKeys(keysObj(), KS)); _lockSig = keysSig(); }
  if (FB.user) await cloudSync('keys');
}
export async function forgetPhrase() {
  KS.key = null; KS.salt = ''; if (LOCKED) { LOCKED = false; lockRelease(); } lsSet(KEYS_LOCAL, null); save();
  if (FB.user && FB.F) { await FB.F.setDoc(uref(), { keysEnc: null, updatedAt: Date.now(), schemaVersion: CLOUD_SCHEMA }, { merge: true }); FB.remoteKeys = null; setCloudMeta({ k: '' }); }
}
/* ---- interfaz: Cuenta y Frase de seguridad ---- */
export function acMsg(t, err) { const m = $('#acMsg'); if (m) { m.textContent = t; m.className = 'ac-msg small ' + (err ? 'err' : 'ok'); } }
export function acctHTML() {
  const u = FB.user, hint = lsGet(FB_HINT, null), c = cloudMeta();
  if (!u && hint && (FB.st === 'loading' || (FB.st === 'idle' && navigator.onLine))) return `<div class="card" id="acctCard"><h3>👤 Cuenta</h3><p class="small muted">⏳ Conectando con tu cuenta (${esc(hint.email || '')})…</p></div>`;
  if (!u) return `<div class="card" id="acctCard"><h3>👤 Cuenta <span class="pill">Gratis · opcional</span></h3>
    <p class="small muted">Inicia sesión para guardar tu progreso en la nube y seguir en cualquier dispositivo. Tus claves de API nunca se suben sin cifrar.</p>
    <button class="btn gbtn block" id="acGoogle"><span class="g">G</span> Continuar con Google</button>
    <div class="ac-or"><span>o con tu correo</span></div>
    <div class="seg" id="acMode"><button data-am="in" class="active">Entrar</button><button data-am="up">Crear cuenta</button></div>
    <input class="field" id="acEmail" type="email" autocomplete="email" inputmode="email" placeholder="tu@correo.com" aria-label="Correo">
    <input class="field" id="acPass" type="password" autocomplete="current-password" placeholder="Contraseña" aria-label="Contraseña">
    <button class="btn primary block" id="acGo">Entrar</button>
    <button class="linkbtn" id="acForgot">Olvidé mi contraseña</button>
    <div class="ac-msg small ${FB.err ? 'err' : ''}" id="acMsg" role="status">${esc(FB.err || (FB.st === 'loading' ? '⏳ Cargando…' : ''))}</div><p class="small muted" id="acPriv">Al iniciar sesión, tu nombre, correo y uso se guardan para mejorar la app.</p></div>`;
  const prov = u.provider === 'google.com' ? 'Google' : 'Correo y contraseña';
  return `<div class="card" id="acctCard"><h3>👤 Cuenta</h3>
    <div class="ac-user"><div class="ac-av" aria-hidden="true">${esc((u.name || u.email || '?').trim().charAt(0).toUpperCase())}</div><div style="min-width:0"><b class="ac-mail">${esc(u.email || u.name || 'Cuenta')}</b><div class="small muted">${prov} · ${u.verified ? '✅ correo verificado' : '⚠️ correo sin verificar'}</div></div></div>
    ${!u.verified && u.provider === 'password' ? '<div class="row wrap"><button class="btn ghost sm" id="acVerify">📧 Verificar correo</button><button class="btn ghost sm" id="acReload">↻ Ya lo verifiqué</button></div>' : ''}
    <div class="small ac-sync" id="acSync">${FB.busy ? '⏳ Sincronizando…' : c.last ? '☁️ Última sincronización: ' + esc(new Date(c.last).toLocaleString('es-CO')) : '☁️ Aún sin sincronizar'}${FB.dirty && !FB.busy ? ' · cambios pendientes' : ''}</div>
    <div class="ac-msg small ${FB.err ? 'err' : ''}" id="acMsg" role="status">${esc(FB.err)}</div>
    <div class="row wrap"><button class="btn primary" id="acSyncNow" ${FB.busy ? 'disabled' : ''}>🔄 Sincronizar ahora</button><button class="btn ghost" id="acOut">Cerrar sesión</button></div><p class="small muted" id="acPriv">Al iniciar sesión, tu nombre, correo y uso se guardan para mejorar la app.</p></div>`;
}
export function keysHTML() {
  const local = validBlob(lsGet(KEYS_LOCAL, null)), cloud = !!FB.remoteKeys, active = !!KS.key;
  let body;
  if (!active && (local || cloud)) body = `<p class="small">${cloud ? '☁️ Tienes claves cifradas en tu cuenta.' : ''} ${local ? '🔒 Tus claves están bloqueadas en este dispositivo.' : ''} Escribe tu frase para usarlas.</p>
    <input class="field" id="kpUnlock" type="password" autocomplete="off" placeholder="Frase de seguridad"><div class="row wrap"><button class="btn primary" id="kpUnlockGo">🔓 Desbloquear</button><button class="linkbtn" id="kpForgot">Olvidé mi frase</button></div>`;
  else if (!active) body = `<p class="small muted">Crea una frase de seguridad (mínimo 10 caracteres) para ${FB.user ? 'guardar tus claves <b>cifradas</b> en tu cuenta y ' : ''}poder bloquearlas en este dispositivo. La frase nunca se guarda ni se envía: si la olvidas, tendrás que volver a pegar tus claves.</p>
    <input class="field" id="kpNew1" type="password" autocomplete="new-password" placeholder="Frase de seguridad"><div class="kp-meter" id="kpMeter"><i></i><span></span></div>
    <input class="field" id="kpNew2" type="password" autocomplete="new-password" placeholder="Repite la frase"><button class="btn primary block" id="kpCreate">🔐 Crear frase${FB.user ? ' y guardar claves cifradas' : ''}</button>`;
  else body = `<p class="small">✅ Frase activa en esta sesión.${FB.user ? (cloud ? ' ☁️ Tus claves están guardadas cifradas en tu cuenta.' : ' ⏳ Las claves se subirán cifradas en la próxima sincronización.') : ''}</p>
    <div class="set-row"><div><label for="kpLock">Bloquear claves con la frase en este dispositivo</label><div class="desc">Solo se guarda la versión cifrada; te pediremos la frase una vez cada vez que abras la app.</div></div><label class="switch"><input type="checkbox" id="kpLock" ${LOCKED ? 'checked' : ''}><span></span></label></div>
    <div class="row wrap"><button class="btn ghost sm" id="kpChange">🔁 Cambiar frase</button><button class="btn ghost sm" id="kpForgot">Olvidé mi frase</button></div>`;
  return `<div class="card" id="keysCard"><h3>🔐 Frase de seguridad para tus claves</h3>
    <p class="small muted">Protege tus claves de Gemini, OpenAI y Azure con cifrado AES-256.</p>
    <details class="small muted" style="margin:-4px 0 8px"><summary>¿Por qué?</summary>Cifrado AES-256 (PBKDF2, ${KDF_ITER.toLocaleString('es-CO')} iteraciones). Nunca van en la exportación ni en los registros.</details>${body}<div class="ac-msg small" id="kpMsg" role="status"></div></div>`;
}
export function bindAcct(root) {
  const card = $('#acctCard', root) || $('#acctCard'); if (!card) return;
  const busy = async (btn, fn) => { if (btn) btn.disabled = true; try { await fn(); } catch (e) { acMsg(authErr(e), true); } finally { if (btn && document.body.contains(btn)) btn.disabled = false; } };
  let mode = 'in';
  $$('[data-am]', card).forEach(b => b.onclick = () => { mode = b.dataset.am; $$('[data-am]', card).forEach(x => x.classList.toggle('active', x === b)); $('#acGo', card).textContent = mode === 'up' ? 'Crear cuenta' : 'Entrar'; $('#acPass', card).autocomplete = mode === 'up' ? 'new-password' : 'current-password'; $('#acPass', card).placeholder = mode === 'up' ? 'Contraseña (mínimo 6, mejor 10+)' : 'Contraseña'; });
  const g = $('#acGoogle', card); if (g) g.onclick = () => busy(g, async () => { acMsg('⏳ Abriendo Google…'); await fbGoogle(); });
  const go = $('#acGo', card); if (go) go.onclick = () => busy(go, async () => { acMsg('⏳ ' + (mode === 'up' ? 'Creando tu cuenta…' : 'Entrando…')); await fbEmail(mode, $('#acEmail', card).value, $('#acPass', card).value); });
  const pw = $('#acPass', card); if (pw) pw.onkeydown = e => { if (e.key === 'Enter') go.click(); };
  const fg = $('#acForgot', card); if (fg) fg.onclick = () => busy(fg, async () => { await fbReset($('#acEmail', card).value); acMsg('📧 Si existe una cuenta con ese correo, te enviamos un enlace para cambiar la contraseña. Revisa también «Spam».'); });
  const vf = $('#acVerify', card); if (vf) vf.onclick = () => busy(vf, async () => { await fbVerify(); acMsg('📧 Te enviamos un correo de verificación a ' + FB.user.email + '. Abre el enlace y toca «Ya lo verifiqué».'); });
  const rl = $('#acReload', card); if (rl) rl.onclick = () => busy(rl, async () => { await fbReload(); acMsg(FB.user && FB.user.verified ? '✅ ¡Correo verificado!' : 'Todavía aparece sin verificar. Abre el enlace del correo e inténtalo de nuevo.', !(FB.user && FB.user.verified)); });
  const sn = $('#acSyncNow', card); if (sn) sn.onclick = () => cloudSync('manual');
  const out = $('#acOut', card); if (out) out.onclick = () => modal(`<h2>Cerrar sesión</h2><p class="small">Tu progreso queda guardado en tu cuenta. Por defecto también se queda en este dispositivo.</p>
      <label class="set-row" style="cursor:pointer"><div><b>Borrar datos de este dispositivo</b><div class="desc">Progreso, ajustes, claves de API y token de GitHub de este dispositivo. Tu cuenta en la nube no se toca.</div></div><input type="checkbox" id="soWipe"></label>
      <div class="row"><button class="btn ghost block" data-x>Cancelar</button><button class="btn primary block" id="soGo">Cerrar sesión</button></div>`, (el, close) => {
    $('[data-x]', el).onclick = close; $('#soGo', el).onclick = async () => { const w = $('#soWipe', el).checked; close(); try { await fbSignOut(w); } catch (e) { toast('⚠️ ' + authErr(e)); } if (TAB === 'settings') render(); };
  });
}
export function bindKeys(root) {
  const card = $('#keysCard', root) || $('#keysCard'); if (!card) return;
  const msg = (t, err) => { const m = $('#kpMsg', card); m.textContent = t; m.className = 'ac-msg small ' + (err ? 'err' : 'ok'); };
  const busy = async (btn, fn) => { btn.disabled = true; try { await fn(); } catch (e) { msg('❌ ' + (e.message || authErr(e)), true); } finally { if (document.body.contains(btn)) btn.disabled = false; } };
  const n1 = $('#kpNew1', card); if (n1) n1.oninput = () => { const s = phraseStrength(n1.value), m = $('#kpMeter', card); m.dataset.lv = s.lv; $('span', m).textContent = n1.value ? s.label + (s.tip ? ' · ' + s.tip : '') : ''; };
  const cr = $('#kpCreate', card); if (cr) cr.onclick = () => busy(cr, async () => { msg('⏳ Cifrando…'); await createPhrase($('#kpNew1', card).value, $('#kpNew2', card).value); toast('🔐 Frase creada' + (FB.user ? ' y claves guardadas cifradas' : '')); render(); });
  const ul = $('#kpUnlockGo', card); if (ul) ul.onclick = () => busy(ul, async () => { msg('⏳ Comprobando…'); await unlockKeys($('#kpUnlock', card).value); toast('🔓 Claves desbloqueadas'); });
  const lk = $('#kpLock', card); if (lk) lk.onchange = async () => { try { await setLocalLock(lk.checked); msg(lk.checked ? '🔒 Claves bloqueadas: en este dispositivo solo queda la versión cifrada.' : '🔓 Bloqueo desactivado: las claves se guardan como antes en este dispositivo.'); } catch (e) { lk.checked = !lk.checked; msg('❌ ' + e.message, true); } };
  const ch = $('#kpChange', card); if (ch) ch.onclick = () => modal(`<h2>🔁 Cambiar frase</h2><p class="small muted">Tus claves se volverán a cifrar con la nueva frase. En tus otros dispositivos tendrás que escribir la nueva.</p>
      <input class="field" id="cpOld" type="password" autocomplete="off" placeholder="Frase actual"><input class="field" id="cpN1" type="password" autocomplete="new-password" placeholder="Nueva frase (mínimo 10)"><input class="field" id="cpN2" type="password" autocomplete="new-password" placeholder="Repite la nueva frase">
      <div class="ac-msg small" id="cpMsg"></div><div class="row"><button class="btn ghost block" data-x>Cancelar</button><button class="btn primary block" id="cpGo">Cambiar</button></div>`, (el, close) => {
    $('[data-x]', el).onclick = close;
    $('#cpGo', el).onclick = async () => { const b = $('#cpGo', el); b.disabled = true; $('#cpMsg', el).textContent = '⏳ Cifrando…'; try { await changePhrase($('#cpOld', el).value, $('#cpN1', el).value, $('#cpN2', el).value); close(); toast('🔐 Frase cambiada'); render(); } catch (e) { $('#cpMsg', el).textContent = '❌ ' + (e.message || e); $('#cpMsg', el).className = 'ac-msg err small'; b.disabled = false; } };
  });
  const fg = $('#kpForgot', card); if (fg) fg.onclick = () => confirmBox('¿Olvidaste tu frase?', 'No hay forma de recuperarla: nadie más la conoce. Se borrarán tus claves cifradas' + (FB.user ? ' de la nube y' : '') + ' de este dispositivo. Después tendrás que volver a pegar tus claves de Gemini, OpenAI y Azure y crear una frase nueva.', 'Borrar claves cifradas', async () => { try { await forgetPhrase(); toast('Claves cifradas borradas. Vuelve a pegar tus claves.'); } catch (e) { toast('⚠️ ' + authErr(e)); } render(); }, true);
}
export function getLockSig() { return _lockSig; }
export function setLockSig(v) { _lockSig = v; }
export function setLocked(v) { LOCKED = !!v; }
