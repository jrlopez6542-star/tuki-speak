// src/state.js - Fase 3, modulo 2: estado y repeticion espaciada (SM-2).
// S vive aqui como live binding: main.js lo importa y ve cada reasignacion
// hecha por load() o por setState(). save/freshState/updateMascot NO se
// mueven: main.js los reasigna con wrappers (insignias, nube, v2.4-v2.8),
// asi que state.js los importa desde './main.js' (import circular; solo se
// usan dentro de funciones, nunca en top-level, y son function declarations
// con hoisting). Las funciones movidas llaman al save() ya envuelto.
// KEY, DEFAULT_SETTINGS, DAY, HEART_MS, MAX_HEARTS y BAD_KEYS no se
// reasignan en ningun sitio, asi que viven aqui y main.js los importa.
import { avg, dayKey, normText } from './utils.js';
import { save, freshState, updateMascot } from './main.js';

export const DAY = 864e5, HEART_MS = 30 * 60e3, MAX_HEARTS = 5;
export const BAD_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
export const KEY = 'tukiSpeak.v1';
export const DEFAULT_SETTINGS = { rate: 0.9, goal: 20, sound: true, autoplay: true, threshold: 75, recordVoice: !/Android/i.test(navigator.userAgent), voice: '', freeMode: false, learnerLevel: 'novice', geminiKey: '', model: 'gemini-2.5-flash',
  accent: 'en-US', ttsEngine: 'auto', azureKey: '', azureRegion: '', azureVoice: 'en-US-JennyNeural', openaiKey: '', openaiModel: 'gpt-4o-mini', openaiVoice: 'marin', openaiTtsModel: 'gpt-4o-mini-tts', realtimeModel: 'gpt-realtime', chatProvider: 'gemini', liveModel: 'gemini-3.1-flash-live-preview', liveVoice: 'Kore',
  tukiVoiceEs: '', tukiVoiceEn: '', theme: 'auto', fontScale: 1, contrast: false, reduceMotion: false, haptics: true, remindOn: false, remindTime: '19:00' };

export let S;

export function setState(d) { S = d; }
export function load() {
  let raw = null;
  try { raw = localStorage.getItem(KEY); S = JSON.parse(raw) || freshState(); } catch (e) { S = freshState(); }
  if (!S || typeof S !== 'object') S = freshState();
  const f = freshState(), oldV = S.v || 1;
  // Migración sin pérdida de datos: guarda copia de seguridad del esquema anterior
  if (raw && oldV < 2) { try { localStorage.setItem(KEY + '.backup-v1', raw); } catch (e) {} }
  for (const k in f) if (S[k] === undefined || S[k] === null && k !== 'placement' && k !== 'lastDay') S[k] = f[k];
  if (S.coins === undefined) S.coins = 50;
  if (!S.tukiSkin) S.tukiSkin = { hat: 'none', outfit: 'none', hand: 'none', plumage: 'classic', owned: ['hat:none', 'outfit:none', 'hand:none', 'plumage:classic'] };
  if (!S.tukiSkin.hand) S.tukiSkin.hand = 'none';
  if (!S.tukiSkin.plumage) S.tukiSkin.plumage = 'classic';
  if (!Array.isArray(S.tukiSkin.owned)) S.tukiSkin.owned = ['hat:none', 'outfit:none', 'hand:none', 'plumage:classic'];
  if (!S.tukiSkin.owned.includes('hand:none')) S.tukiSkin.owned.push('hand:none');
  if (!S.tukiSkin.owned.includes('plumage:classic')) S.tukiSkin.owned.push('plumage:classic');
  if (!S.chests) S.chests = { dailyClaimed: null };
  if (!S.quests) S.quests = {};
  if (!S.unitsDone) S.unitsDone = {};
  S.settings = { ...DEFAULT_SETTINGS, ...S.settings };
  if (S.settings.ttsEngine === 'device' && !S.settings.__ttsDeviceExplicit) S.settings.ttsEngine = 'auto';
  if (oldV < 2) { S.v = 2; if (raw && (Object.keys(S.done || {}).length || S.xp)) S.placement = S.placement || 'legacy'; }
  updateMascot();
}

/* ---- indice de lecciones (solo lectura de estado) ---- */
export const isDone = id => !!S.done[id];

/* ---- hearts / streak / xp ---- */
export function refreshHearts() {
  if (S.hearts >= MAX_HEARTS) { S.hearts = MAX_HEARTS; S.heartTs = Date.now(); return; }
  const n = Math.floor((Date.now() - S.heartTs) / HEART_MS);
  if (n > 0) { S.hearts = Math.min(MAX_HEARTS, S.hearts + n); S.heartTs += n * HEART_MS; if (S.hearts >= MAX_HEARTS) S.heartTs = Date.now(); save(); }
}
export function loseHeart() { if (S.hearts >= MAX_HEARTS) S.heartTs = Date.now(); S.hearts = Math.max(0, S.hearts - 1); save(); }
export function nextHeartIn() { const ms = HEART_MS - (Date.now() - S.heartTs); const m = Math.max(0, Math.ceil(ms / 60e3)); return m; }
export function todayRec() { const k = dayKey(); return S.days[k] || (S.days[k] = { xp: 0, n: 0, sum: 0 }); }

/* ---- registro de estadisticas de voz ---- */
export function recordSpeech(soundId, result) {
  const arr = S.snd[soundId] || (S.snd[soundId] = []);
  arr.push({ t: Date.now(), s: result.pct }); if (arr.length > 40) arr.splice(0, arr.length - 40);
  (result.words || []).forEach(w => { const key = normText(w.tok).join(' '); if (!key || key.length < 2) return; const r = S.wd[key] || (S.wd[key] = { n: 0, sum: 0, last: 0, t: 0, disp: w.tok.replace(/[.,!?;:"]/g, '') }); r.n++; r.sum += w.s * 100; r.last = Math.round(w.s * 100); r.t = Date.now(); });
  const d = todayRec(); d.n++; d.sum += result.pct; S.spoken++; save();
}
export function recordEar(soundId, ok) { const r = S.ear[soundId] || (S.ear[soundId] = { r: 0, w: 0 }); ok ? r.r++ : r.w++; save(); }
export function soundAvg(id, n = 10) { const a = (S.snd[id] || []).slice(-n).map(x => x.s); return a.length ? Math.round(avg(a)) : null; }

/* ---- repetición espaciada (SM-2) ---- */
export function addToDeck(items) { items.forEach(it => { if (!it || !it.key || BAD_KEYS.has(it.key)) return; if (!S.deck[it.key]) S.deck[it.key] = { en: String(it.en || '').slice(0, 400), es: String(it.es || '').slice(0, 400), kind: it.kind, lesson: it.lesson, ef: 2.5, int: 0, reps: 0, due: Date.now(), lapses: 0, added: Date.now() }; }); save(); }
export function sm2(card, q) {
  if (q < 3) { card.reps = 0; card.int = 0; card.lapses++; card.due = Date.now() + 60e3; }
  else { card.int = card.reps === 0 ? (q === 3 ? 1 : q === 5 ? 3 : 1) : card.reps === 1 ? (q === 3 ? 3 : 6) : Math.round(card.int * card.ef * (q === 3 ? 0.8 : q === 5 ? 1.3 : 1)); card.reps++; card.due = Date.now() + card.int * DAY; }
  card.ef = Math.max(1.3, card.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  save();
}
export const dueCards = () => Object.entries(S.deck).filter(([k, c]) => c.due <= Date.now()).map(([k, c]) => ({ key: k, ...c }));


/* Wrapper de Azure para recordSpeech (estaba en main.js, linea ~2970):
   acumula fonemas en S.ph y luego llama a la base. Aqui dentro del
   mismo modulo la reasignacion es legal; en main.js como import no lo seria. */
const _recordSpeech = recordSpeech;
recordSpeech = function (soundId, result) { if (result && result.engine === 'azure') { S.ph = S.ph || {}; (result.words || []).forEach(w => (w.ph || []).forEach(p => { const r = S.ph[p.p] || (S.ph[p.p] = { n: 0, sum: 0 }); r.n++; r.sum += p.s; })); } _recordSpeech(soundId, result); };

/* ---- repaso: etiquetas de intervalo (SM-2) ---- */
export function intervalLabel(c, q) { const t = { ...c }; const saveFn = save; sm2Preview(t, q); return t.int ? (t.int === 1 ? '1 día' : t.int + ' días') : '1 min'; }
export function sm2Preview(card, q) { if (q < 3) { card.int = 0; return; } card.int = card.reps === 0 ? (q === 3 ? 1 : q === 5 ? 3 : 1) : card.reps === 1 ? (q === 3 ? 3 : 6) : Math.round(card.int * card.ef * (q === 3 ? 0.8 : q === 5 ? 1.3 : 1)); }
