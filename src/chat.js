// src/chat.js - Fase 3, modulo 5: conversacion con IA (Gemini texto + voz en vivo), resúmenes, palabras difíciles, entrevista y reto diario.
// Extraído de src/main.js. CHAT y LIVE viven aquí como live bindings: main.js los importa.
// chatSystem/parseTutor/chatDraw/resetChat/stopLive/liveSystem se reasignan dentro de este módulo
// (versiones v2 y wrappers v2.4), igual que speak en audio.js, así la reasignación es legal aquí.
// NO se movieron: errES/httpErr/azFetch/azureReady (los importa audio.js desde main.js),
// VIEWS.chat, dictLookup/openWordPop (usan DICT, que se reasigna en main.js), el bloque TC completo
// (Traduce y Completa, ~600 líneas, va aparte), ni los wrappers de go/render/VIEWS en main.js.
// Las funciones de main.js que se usan aquí se importan desde './main.js' (import circular;
// solo se usan dentro de funciones, nunca en top-level, igual que en state.js/audio.js/lessons.js).
import { $, $$, esc, decodeEnt, decodeDeep, shuffle, pick, sample, clamp, avg, dayKey, dayDiff, normText, lev, charSim, align, simScore, colorOf, typedMatch, scoreSpeech, scorePair, sleep, hashStr, b64FromBytes, f32ToB64 } from './utils.js';
import { S, DAY, addToDeck } from './state.js';
import { speak, speakSeq, recognize, stopRecognize, SR, HAS_SR, curRec, SR_ERR, Rec, MicCap, canSpeak, stopAudio, azureSTT, openaiSTT, StreamResampler } from './audio.js';
import { startLesson } from './lessons.js';
import { TukiDB } from './tuki-db.js';
import { save, toast, modal, go, render, addXP, checkBadges, errES, httpErr, FB, KS, LOCKED, TAB, LESSON, LESSONS, openWordPop, closeWordPop, buildTopErrorsPractice } from './main.js';

export const SCENARIOS = { free: 'a friendly casual chat about the learner\'s day, hobbies and plans', restaurant: 'a waiter at a restaurant in New York; the learner is the customer', airport: 'an airline check-in agent at the airport; the learner is a passenger' };
export const SCEN_ES = { free: 'Charla libre', restaurant: 'Restaurante', airport: 'Aeropuerto' };
export let CHAT = { scen: 'free', hist: [], busy: false };
export function chatSystem() {
  return `You are "Tuki", a patient, friendly English pronunciation and conversation tutor for a Spanish-speaking learner from Colombia (beginner/intermediate level). Roleplay: you are ${SCENARIOS[CHAT.scen]}.
The learner's messages usually come from browser speech-to-text, so odd words may be mis-recognized pronunciation (e.g. "sheep" for "ship", "tree" for "three", "berry" for "very").
Reply ONLY in this exact format with these three labeled lines:
CORRECCION: <in Spanish, 1-2 short sentences: fix grammar/vocabulary mistakes in the learner's last message and give the corrected English sentence; if it looks like a speech-recognition/pronunciation confusion, say so. Write "¡Perfecto!" if there are no mistakes. For your very first message write "—".>
PRONUNCIACION: <in Spanish: 1-2 words from your reply or the learner's message that Spanish speakers often mispronounce, each with a very short tip, e.g. "think /θ/: saca la lengua entre los dientes". Keep it short.>
REPLY: <your answer in simple, natural English, max 2-3 short sentences, staying in the roleplay and ending with a question to keep the conversation going.>`;
}
export async function geminiCall(key, model, contents) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: chatSystem() }] }, contents, generationConfig: { temperature: 0.7, maxOutputTokens: 800 } })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { const m = (data.error && data.error.message) || res.statusText || 'error'; const e = new Error(res.status + ': ' + m); e.status = res.status; throw e; }
  const text = (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts || []).map(p => p.text || '').join('').trim();
  if (!text) { const e = new Error('Respuesta vacía del modelo.'); e.status = 0; throw e; }
  return text;
}
export async function gemini(userText) {
  const pref = (S.settings.model || 'gemini-2.5-flash').trim();
  const contents = CHAT.hist.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
  if (gemShared()) return (await tukiApi('gemini', { model: sharedModel(pref), request: { systemInstruction: { parts: [{ text: chatSystem() }] }, contents: contents.slice(-100), generationConfig: { temperature: 0.7, maxOutputTokens: 800 } } })).text;
  const key = S.settings.geminiKey.trim();
  const models = [pref, 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-flash-latest', 'gemini-flash-lite-latest'].filter((m, i, a) => m && a.indexOf(m) === i);
  let lastErr;
  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const out = await geminiCall(key, model, contents);
        if (model !== pref) { S.settings.model = model; save(); }
        return out;
      } catch (e) {
        lastErr = e;
        if (e.status === 400 || e.status === 401 || e.status === 403) throw e; // clave inválida: no sirve reintentar
        if (e.status === 429 || e.status >= 500) await new Promise(r => setTimeout(r, 1200));
        if (!(e.status >= 500) || attempt === 1) break; // 404/429/vacío: pasar al siguiente modelo
      }
    }
  }
  throw lastErr;
}
export function parseTutor(t) {
  const get = lab => { const m = t.match(new RegExp(lab + '\\s*:\\s*([\\s\\S]*?)(?=\\n\\s*(CORRECCI[OÓ]N|PRONUNCIACI[OÓ]N|REPLY)\\s*:|$)', 'i')); return m ? m[1].trim() : ''; };
  const reply = get('REPLY');
  return { fix: get('CORRECCI[OÓ]N'), pron: get('PRONUNCIACI[OÓ]N'), reply: reply || t };
}



export const TUKI_API = 'https://tuki-speak.vercel.app/api/';
export const SHARED_TEXT_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-2.0-flash-lite'];
export const keysLocked = () => typeof LOCKED !== 'undefined' && LOCKED && !(typeof KS !== 'undefined' && KS.key);
export const fbSignedIn = () => typeof FB !== 'undefined' && !!FB.user;
export const fbCanShare = () => fbSignedIn() && (FB.user.provider === 'google.com' || FB.user.verified);
export const gemShared = () => !S.settings.geminiKey && !keysLocked() && fbCanShare();
export const azOwn = () => !!(S.settings.azureKey && S.settings.azureRegion);
export const azShared = () => !azOwn() && !keysLocked() && fbCanShare();
export const noAIMsg = () => fbSignedIn() ? 'Verifica tu correo para usar la IA de Tuki.' : 'Inicia sesión para usar la IA de Tuki.';
export const sharedModel = m => SHARED_TEXT_MODELS.includes(m) ? m : SHARED_TEXT_MODELS[0];
export async function tukiApi(path, body) {
  if (!fbSignedIn() || !FB.raw) { const e = new Error(noAIMsg()); e.friendly = e.message; e.status = 401; e.shared = true; throw e; }
  const post = async force => fetch(TUKI_API + path, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + await FB.raw.getIdToken(force) }, body: JSON.stringify(body || {}) });
  let r = await post(false);
  if (r.status === 401 || r.status === 403) r = await post(true); // token vencido o correo recién verificado
  const d = await r.json().catch(() => ({}));
  if (!r.ok) { const m = (d.error && d.error.message) || ''; const e = new Error(r.status + (m ? ': ' + m : '')); e.status = r.status; e.code = d.error && d.error.code; if (m) e.friendly = m; e.shared = true; e.fatal = [401, 403, 429, 503].includes(r.status); throw e; }
  if (path === 'gemini' && d && Number.isFinite(d.used) && Number.isFinite(d.limit)) recordAiQuota(d.used, d.limit);
  return d;
}
// Cuota diaria compartida (P8): /api/gemini devuelve { text, model, used, limit }.
// Se guarda en S.aiQuota (precedente: S.liveModels) con el día, para no mostrar
// un conteo de ayer. Solo la ruta 'gemini' (60/día): los tokens Live/Azure
// tienen otros límites y no se mezclan aquí.
export function recordAiQuota(used, limit) {
  if (!Number.isFinite(used) || !Number.isFinite(limit) || limit <= 0) return;
  S.aiQuota = { used: Math.max(0, Math.floor(used)), limit: Math.floor(limit), day: dayKey() };
  try { save(); } catch (e) {}
}
export function aiQuotaToday() {
  const q = S.aiQuota;
  if (!q || q.day !== dayKey() || !Number.isFinite(q.used) || !Number.isFinite(q.limit) || q.limit <= 0) return null;
  return q;
}
export function aiQuotaText() { // línea en Ajustes (solo con claves compartidas)
  if (!gemShared()) return '';
  const q = aiQuotaToday();
  if (!q) return '';
  return `IA de Tuki: ${q.used}/${q.limit} llamadas hoy · te quedan ${Math.max(0, q.limit - q.used)} en este dispositivo`;
}
export function aiQuotaLow() {
  const q = aiQuotaToday();
  return gemShared() && !!q && (q.limit - q.used) <= 5;
}
export const AZT = { tok: '', region: '', exp: 0, p: null };
export async function azAuth() {
  const s = S.settings;
  if (azOwn()) return { region: s.azureRegion.trim().toLowerCase(), headers: { 'Ocp-Apim-Subscription-Key': s.azureKey.trim() } };
  if (!(AZT.tok && Date.now() < AZT.exp)) {
    AZT.p = AZT.p || tukiApi('azure-token').then(d => { AZT.tok = d.token; AZT.region = d.region; AZT.exp = Date.now() + Math.max(60, (d.expiresIn || 600) - 60) * 1000; }).finally(() => { AZT.p = null; });
    await AZT.p;
  }
  return { region: AZT.region, headers: { Authorization: 'Bearer ' + AZT.tok }, shared: true };
}
export async function azFetch(host, path, opts = {}) {
  for (let i = 0; ; i++) {
    const a = await azAuth();
    const res = await fetch(`https://${encodeURIComponent(a.region)}.${host}${path}`, { ...opts, headers: { ...a.headers, ...(opts.headers || {}) } });
    if (res.status === 401 && a.shared && !i) { AZT.exp = 0; continue; }
    return res;
  }
}
export const azureReady = () => !window.__azOff && (azOwn() || azShared());
export function aiModeText() { // una línea en Ajustes: qué claves se están usando
  const s = S.settings, ownAI = !!(s.geminiKey || s.openaiKey), ownAz = azOwn();
  if ((ownAI && ownAz) || keysLocked()) return 'Usando tus claves';
  if (!fbCanShare()) return ownAI || ownAz ? 'Usando tus claves' : noAIMsg().replace(/\.$/, '');
  if (!ownAI && !ownAz) return 'Usando las claves de Tuki · límite diario';
  return ownAI ? 'Usando tus claves · Azure: claves de Tuki (límite diario)' : 'Usando tus claves de Azure · IA: claves de Tuki (límite diario)';
}

/* =================== CONVERSACIÓN CON IA: texto + VOZ EN VIVO =================== */
export const LIVE = { on: false, state: 'idle', level: 0, provider: null, ws: null, pc: null, mic: null, cur: {}, t0: 0, userTurns: 0, sendText: null };
export const LIVE_LABEL = { idle: 'Listo para hablar', connecting: 'Conectando…', listening: 'Te escucho… habla cuando quieras', speaking: 'Tuki está hablando (puedes interrumpir)', error: 'No se pudo conectar' };
export const GEMINI_LIVE_MODELS = ['gemini-3.1-flash-live-preview', 'gemini-2.5-flash-native-audio-preview-12-2025', 'gemini-2.5-flash-native-audio-preview-09-2025', 'gemini-live-2.5-flash-preview'];
export function currentProvider() { const s = S.settings; if (s.chatProvider === 'openai' && s.openaiKey) return 'openai'; if (s.geminiKey) return 'gemini'; if (s.openaiKey) return 'openai'; return gemShared() ? 'gemini' : null; }
/* ---- Nivel de inglés para la conversación ---- */
export const LEVELS = {
  A0: { label: 'Novato (Desde cero absoluto)', short: 'Novato',
    vocab: 'Use ONLY the most fundamental words (greetings, numbers, yes/no, please, thank you). Always accompany words with Spanish translation when introducing new phrases.',
    length: 'Extremely short: 1 short phrase or question (maximum 6 words).',
    speed: 'Speak VERY SLOWLY, clearly articulating each syllable, with comfortable pauses.',
    spanish: 'Speak predominantly in encouraging Latin American Spanish to guide the learner, teaching 1-2 words in English per turn.',
    correct: 'Praise every effort enthusiastically. Correct gently with immediate Spanish pronunciation hints.' },
  A2: { label: 'Básico (A1-A2)', short: 'Básico',
    vocab: 'Use only very common, basic words (top 1000) and simple grammar: present simple, present continuous, simple past, "can", "going to". No idioms, no phrasal verbs except the most common ones.',
    length: 'Very short: 1-2 short sentences (max about 12 words each) per turn, then ONE simple question.',
    speed: 'Speak SLOWLY and very clearly, with small pauses between phrases, and articulate every word. If the learner does not understand, repeat more slowly with simpler words.',
    spanish: 'If the learner is stuck, silent, or speaks Spanish, give ONE very short hint in Spanish (a few words, e.g. the English word they need), then continue in English.',
    correct: 'Correct only the ONE most important mistake per turn, very simply and kindly (e.g. "We say: I went."). Ignore small errors.' },
  B1: { label: 'Intermedio (B1)', short: 'Intermedio',
    vocab: 'Use everyday vocabulary and common grammar (past, present perfect, future, comparatives, common phrasal verbs). Avoid rare words and complex idioms.',
    length: 'Short: 2-3 sentences per turn, then a question.',
    speed: 'Speak at a moderate, slightly slower than native pace, clearly.',
    spanish: 'Stay in English. If the learner is stuck or speaks Spanish, rephrase more simply in English or give an example answer; use Spanish only as a last resort (a single word).',
    correct: 'Briefly correct the main grammar or vocabulary mistake of the turn with the correct sentence; mention pronunciation only if it hurts understanding.' },
  B2: { label: 'Intermedio alto (B2)', short: 'Interm. alto',
    vocab: 'Use natural, varied vocabulary including common idioms, phrasal verbs and connectors; a range of tenses, conditionals and passive.',
    length: '2-4 sentences per turn; ask open questions that invite longer answers and opinions.',
    speed: 'Speak at a natural, normal pace.',
    spanish: 'Speak only English. If the learner uses Spanish, encourage them to say it in English and help with paraphrasing in English.',
    correct: 'Correct grammar and vocabulary mistakes and suggest more natural phrasing or collocations; point out pronunciation or word-stress issues briefly.' },
  C1: { label: 'Avanzado (C1)', short: 'Avanzado',
    vocab: 'Use rich, precise and idiomatic English, nuanced vocabulary, complex structures, as with a fluent speaker.',
    length: 'Natural conversational length (2-5 sentences); challenge the learner with follow-up questions, hypotheticals and opinions.',
    speed: 'Speak at a natural native pace with normal connected speech.',
    spanish: 'Speak only English, never Spanish.',
    correct: 'Correct even subtle mistakes (articles, prepositions, register, word choice) and offer more idiomatic or sophisticated alternatives; comment on intonation, stress or connected speech when relevant.' }
};
export const LEVEL_KEYS = Object.keys(LEVELS);
export function defaultLevel() {
  if (S.settings && S.settings.learnerLevel === 'novice') return 'A0';
  if (S.settings && S.settings.learnerLevel === 'advanced') return 'C1';
  const p = S.placement; if (p && typeof p === 'object' && p.start != null) return p.start <= 1 ? 'A2' : p.start <= 4 ? 'B1' : 'B2';
  return 'A2';
}
export const chatLevel = () => LEVELS[S.settings.chatLevel] ? S.settings.chatLevel : defaultLevel();
export function levelRules(voice) {
  const k = chatLevel(), L0 = LEVELS[k];
  return `LEARNER LEVEL: CEFR ${k === 'A2' ? 'A1-A2' : k} (${L0.label}). Adapt everything to this level:
- Vocabulary and grammar: ${L0.vocab}
- Length: ${L0.length}
${voice ? '- Speaking speed: ' + L0.speed + '\n' : ''}${tutorLang() === 'en' ? '- Spanish: ' + L0.spanish + '\n' : ''}- Corrections: ${L0.correct}`;
}
/* ---- Idioma del tutor ---- */
export const TUTOR_LANGS = { en: { label: '🇺🇸 Solo inglés', name: 'Solo inglés' }, bi: { label: '🌎 Bilingüe', name: 'Bilingüe' }, es: { label: '🇨🇴 Más español', name: 'Más español' } };
export const tutorLang = () => TUTOR_LANGS[S.settings.tutorLang] ? S.settings.tutorLang : 'bi';
export function langRules(voice) {
  const m = tutorLang(), lv = chatLevel();
  if (lv === 'A0') return `LANGUAGE MODE: ABSOLUTE BEGINNER (Novato desde cero). Explain in friendly Spanish (Latin American, use "tú") and teach 1 simple English phrase at a time. Provide phonetic approximation in Spanish (e.g. "se pronuncia /jelóu/"). Praise every effort!`;
  if (m === 'en') return `LANGUAGE MODE: ENGLISH ONLY. Speak and explain in English${lv === 'A2' ? ' (except the short Spanish hint allowed by the level rules)' : ''}. Explain corrections in simple English.`;
  if (m === 'bi') return `LANGUAGE MODE: BILINGUAL (English conversation + Spanish explanations). The conversation and roleplay stay in English. After EACH learner turn that has a mistake, give the correction as the corrected English sentence, then a short explanation IN SPANISH (1-2 sentences, Latin American Spanish, use "tú") of why it is wrong${voice ? ' — say this explanation out loud in Spanish, then switch back to English' : ''}. If the learner asks something in Spanish, asks what a word or phrase means, or seems lost, answer briefly in Spanish. Then ALWAYS continue the conversation in English and end with a question in English. Keep the Spanish parts short; English must remain the main language.${lv === 'A2' ? ' The learner is a beginner: Spanish explanations are especially welcome, but keep the English very simple.' : lv === 'C1' ? ' The learner is advanced: keep Spanish to the minimum needed for the explanation.' : ''}`;
  return `LANGUAGE MODE: MORE SPANISH (Spanish-led lesson). Explain and chat mainly in Spanish (Latin American Spanish, use "tú"), like a friendly teacher, while doing the roleplay. In each turn introduce one or two short English phrases related to the situation (adapted to the learner's level) and ask the learner to repeat them or to answer in English. When the learner makes a mistake in English, give the correct English form and explain why in Spanish. Praise every attempt.${voice ? ' Speak the Spanish parts in natural Spanish and say the English phrases with clear, slightly slower English pronunciation, pausing before and after them.' : ''}${lv === 'C1' || lv === 'B2' ? ' Since the learner is at a higher level, use longer and more natural English phrases and encourage full English answers.' : ''}`;
}
/* ---- Velocidad de Tuki ---- */
export const TUTOR_SPEEDS = { vslow: { label: '🐢🐢 Muy lenta', name: 'Muy lenta', mul: 0.7, rt: 0.7, words: 8 }, slow: { label: '🐢 Lenta', name: 'Lenta', mul: 0.85, rt: 0.85, words: 12 }, normal: { label: '▶️ Normal', name: 'Normal', mul: 1, rt: 1, words: 0 } };
export const tutorSpeed = () => TUTOR_SPEEDS[S.settings.tutorSpeed] ? S.settings.tutorSpeed : 'slow';
export const chatMul = () => TUTOR_SPEEDS[tutorSpeed()].mul;
export function speedRules(voice) {
  const k = tutorSpeed(), w = TUTOR_SPEEDS[k].words;
  if (k === 'normal') return `PACE: NORMAL. ${voice ? 'Speak at a natural pace, clearly.' : 'Write naturally.'} Still prefer clear sentences and explain any idiom or slang you use.`;
  return `PACE: ${k === 'vslow' ? 'VERY SLOW' : 'SLOW'} (the learner said you were too fast and used words they did not know). This overrides any longer length from the level rules:
${voice ? `- Speak ${k === 'vslow' ? 'VERY slowly' : 'slowly'} and clearly, articulating every word, with a clear pause after each sentence${k === 'vslow' ? ' and short pauses between phrases' : ''}. Never rush. No reduced forms like "gonna", "wanna", "kinda".\n` : ''}- Use short sentences: maximum about ${w} words per sentence${k === 'vslow' ? ', and at most 2 sentences per turn' : ', and at most 3 sentences per turn'}.
- Only ONE idea or question per turn.
- Use common, simple words. Avoid idioms, slang and phrasal verbs unless you are explaining them; if you use a less common word, explain it briefly${tutorLang() === 'en' ? ' in simple English' : ' in Spanish'}.`;
}
export const HELP_COMMANDS = `LEARNER HELP COMMANDS: If the learner says "slower please", "more slowly", "más despacio", "más lento", "repeat", "again", "repite", "otra vez" or "no entiendo", repeat your last message more slowly, with simpler words and shorter sentences, then wait. If the learner asks "what does X mean?", "what is X?" or "¿qué significa X?", explain X briefly in Spanish with one very simple English example, then continue the conversation.`;
chatSystem = function () {
  const k = chatLevel(), L0 = LEVELS[k], m = tutorLang(), ex = m === 'en' ? 'IN SIMPLE ENGLISH' : 'IN SPANISH';
  return `You are "Tuki", a patient, friendly English pronunciation and conversation tutor for a Spanish-speaking learner from Colombia (CEFR level ${k === 'A2' ? 'A1-A2' : k}). Roleplay: you are ${SCENARIOS[CHAT.scen]}.
The learner's messages usually come from browser speech-to-text, so odd words may be mis-recognized pronunciation (e.g. "sheep" for "ship", "tree" for "three", "berry" for "very").
Reply ONLY in this exact format with these six labeled lines (write "—" for any line that does not apply):
CORRECCION: <ONLY the learner's last message rewritten as correct, natural English. Write "¡Perfecto!" if it had no mistakes. For your very first message write "—".>
EXPLICACION: <${ex}, 1-2 short sentences: why the original was wrong (grammar/vocabulary rule), or say it looks like a pronunciation/speech-recognition confusion. "—" if there was nothing to correct.>
AYUDA: <${m === 'en' ? (k === 'A2' ? 'only if the learner is stuck or wrote in Spanish: one very short hint in Spanish; otherwise "—"' : '"—"') : m === 'bi' ? 'IN SPANISH, only if the learner asked something in Spanish, asked what something means, or seems lost: a brief answer in Spanish (1-2 sentences). Otherwise "—"' : '"—" (put Spanish explanations in REPLY)'}>
PRONUNCIACION: <${m === 'en' ? 'in simple English' : 'in Spanish'}: 1-2 words from your reply or the learner's message that Spanish speakers often mispronounce, each with a very short tip, e.g. ${m === 'en' ? '"think /θ/: put your tongue between your teeth"' : '"think /θ/: saca la lengua entre los dientes"'}. Keep it short.>
REPLY: <${m === 'es' ? 'mainly IN SPANISH: continue the roleplay as a friendly teacher, introduce the English phrase(s) to practice in "double quotes", and ask the learner to repeat it or answer in English. Max 3 short sentences.' : `your answer IN ENGLISH adapted to the learner's level (${L0.length}), staying in the roleplay and ending with a question in English.`}>
PRACTICA: <${m === 'es' ? 'ONE short English phrase (only English) for the learner to repeat or use in the answer.' : '"—"'}>
${levelRules(false)}
${langRules(false)}
${speedRules(false)}
${HELP_COMMANDS}`;
};
parseTutor = function (t) {
  t = decodeEnt(t);
  const LAB = 'CORRECCI[OÓ]N|EXPLICACI[OÓ]N|AYUDA|PRONUNCIACI[OÓ]N|REPLY|PR[AÁ]CTICA';
  const get = lab => { const m = t.match(new RegExp('(?:^|\\n)\\s*\\**(?:' + lab + ')\\**\\s*:\\s*([\\s\\S]*?)(?=\\n\\s*\\**(?:' + LAB + ')\\**\\s*:|$)', 'i')); const v = m ? m[1].trim() : ''; return /^[-—–]?$/.test(v) ? '' : v; };
  const reply = get('REPLY');
  return { fix: get('CORRECCI[OÓ]N'), expl: get('EXPLICACI[OÓ]N'), help: get('AYUDA'), pron: get('PRONUNCIACI[OÓ]N'), practice: get('PR[AÁ]CTICA').replace(/^["“]|["”]$/g, ''), reply: reply || t };
};
export const isPerfect = f => /^¡?perfect[oa]?!?$/i.test((f || '').trim());
export function tutorSpeechParts(p) {
  const m = tutorLang(), es = m === 'en' ? 'en' : 'es', parts = [];
  if (m !== 'en') { if (p.fix && !isPerfect(p.fix)) parts.push({ t: p.fix, lang: 'en' }); if (p.expl) parts.push({ t: p.expl, lang: es }); }
  if (p.help) parts.push({ t: p.help, lang: 'es' });
  parts.push({ t: p.reply, lang: m === 'es' ? 'es' : 'en' });
  if (p.practice) parts.push({ t: p.practice, lang: 'en' });
  return parts;
}
export function liveSystem() {
  const m = tutorLang();
  const core = m === 'en' ? `Rules: Speak ONLY in English (except what the level rules allow). Usually end your turn with a question. If the learner makes a grammar, vocabulary or pronunciation mistake, first give a brief spoken correction (for example: "Quick tip: we say 'I went', not 'I goed'." or "Try 'three' with your tongue between your teeth: three."), then continue the roleplay. Be warm and encouraging.`
    : m === 'bi' ? `Rules: Keep the roleplay in English and usually end your turn with a question in English. When the learner makes a mistake, first say the corrected English sentence, then explain why in Spanish in one short sentence, then continue in English. Example: "We say: I went to the park. En español: 'go' es irregular, en pasado se dice 'went'. So, what did you do at the park?" If the learner speaks Spanish, asks a question in Spanish or seems lost, answer briefly in Spanish and go back to English. Be warm and encouraging.`
    : `Rules: Lead the lesson mainly in Spanish, as a friendly teacher doing the roleplay. In each turn teach one or two short English phrases for the situation and ask the learner to repeat them or answer in English. Example: "Muy bien. Para pedir la cuenta dices: 'Can I have the check, please?' Repítelo tú." When the learner says something in English with a mistake, say the correct English form and explain why in Spanish. Celebrate every attempt.`;
  return `You are "Tuki", a friendly, patient English conversation tutor for a Spanish-speaking learner from Colombia. This is a live VOICE conversation. Roleplay: you are ${SCENARIOS[CHAT.scen]}.
${core}
${levelRules(true)}
${langRules(true)}
${speedRules(true)}
${HELP_COMMANDS}`;
}
export function liveSet(st) { LIVE.state = st; const d = $('#ldot'), l = $('#lstate'); if (d) d.className = 'live-dot ' + st; if (l) l.textContent = LIVE_LABEL[st] || st; }
export function liveUI() { liveSet(LIVE.state); const b = $('#liveBtn'); if (b) { b.classList.toggle('on', LIVE.on); b.innerHTML = LIVE.on ? '⏹ Terminar conversación' : '🎙️ Hablar en vivo'; } }
(function meterLoop() { const m = $('#lmeter'); if (m) m.style.width = (LIVE.on ? Math.min(100, LIVE.level * 400) : 0) + '%'; requestAnimationFrame(meterLoop); })();
export function liveAppend(role, text) {
  if (!text) return; const idx = LIVE.cur[role];
  if (idx != null && CHAT.hist[idx]) CHAT.hist[idx].text += text; else { CHAT.hist.push({ role, text, live: true }); LIVE.cur[role] = CHAT.hist.length - 1; if (role === 'user') LIVE.userTurns++; }
  chatDraw();
}
export function liveTurnDone() { LIVE.cur = {}; }
export const Player = {
  ctx: null, t: 0, srcs: new Set(),
  ensure() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); if (this.ctx.state === 'suspended') this.ctx.resume(); },
  play(b64, rate = 24000) {
    this.ensure(); const bin = atob(b64), n = bin.length >> 1; if (!n) return;
    const buf = this.ctx.createBuffer(1, n, rate), ch = buf.getChannelData(0);
    for (let i = 0; i < n; i++) { let v = bin.charCodeAt(2 * i) | (bin.charCodeAt(2 * i + 1) << 8); if (v >= 32768) v -= 65536; ch[i] = v / 32768; }
    const s = this.ctx.createBufferSource(); s.buffer = buf; s.connect(this.ctx.destination);
    this.t = Math.max(this.t, this.ctx.currentTime + 0.04); s.start(this.t); this.t += buf.duration; this.srcs.add(s);
    s.onended = () => { this.srcs.delete(s); if (!this.srcs.size && LIVE.on) liveSet('listening'); };
    liveSet('speaking');
  },
  stop() { this.srcs.forEach(s => { try { s.stop(); } catch (e) {} }); this.srcs.clear(); this.t = 0; },
  close() { this.stop(); if (this.ctx) { this.ctx.close().catch(() => {}); this.ctx = null; } }
};
export const WORKLET_SRC = `class P extends AudioWorkletProcessor{constructor(){super();this.b=new Float32Array(2048);this.n=0;}process(inp){const c=inp[0]&&inp[0][0];if(c){for(let i=0;i<c.length;i++){this.b[this.n++]=c[i];if(this.n===2048){this.port.postMessage(this.b.slice(0));this.n=0;}}}return true;}}registerProcessor('tuki-pcm',P);`;
export async function startMicStream(onChunk) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 } });
  const ctx = new (window.AudioContext || window.webkitAudioContext)(), src = ctx.createMediaStreamSource(stream), rs = new StreamResampler(ctx.sampleRate, 16000);
  let pending = new Float32Array(0), node = null;
  const handle = f32 => { let e = 0; for (let i = 0; i < f32.length; i++) e += f32[i] * f32[i]; LIVE.level = Math.sqrt(e / f32.length); const o = rs.push(f32); const all = new Float32Array(pending.length + o.length); all.set(pending); all.set(o, pending.length); pending = all; if (pending.length >= 1600) { onChunk(pending); pending = new Float32Array(0); } };
  if (ctx.audioWorklet && window.AudioWorkletNode) { try { await ctx.audioWorklet.addModule(URL.createObjectURL(new Blob([WORKLET_SRC], { type: 'application/javascript' }))); node = new AudioWorkletNode(ctx, 'tuki-pcm'); node.port.onmessage = e => handle(e.data); } catch (e) { node = null; } }
  if (!node) { node = ctx.createScriptProcessor(2048, 1, 1); node.onaudioprocess = e => handle(new Float32Array(e.inputBuffer.getChannelData(0))); }
  const mute = ctx.createGain(); mute.gain.value = 0; src.connect(node); node.connect(mute); mute.connect(ctx.destination);
  return { stream, stop() { try { src.disconnect(); node.disconnect(); } catch (e) {} stream.getTracks().forEach(t => t.stop()); ctx.close().catch(() => {}); } };
}
export function liveErrES(e) {
  if (e && e.shared && e.friendly) return e.friendly;
  const r = (e && (e.reason || e.message)) || '';
  if (/api key|API_KEY|permission|unauthori|PERMISSION_DENIED/i.test(r)) return 'La clave de Gemini no es válida o no tiene acceso a Live.';
  if (/quota|exceed|RESOURCE_EXHAUSTED|rate/i.test(r)) return 'Se alcanzó el límite gratuito de Gemini Live. Espera un rato o usa el chat de texto.';
  if (/not found|not supported|unsupported|model/i.test(r)) return 'El modelo de voz en vivo no está disponible para tu clave.';
  if (e && e.code === 1006) return 'No se pudo abrir la conexión (sin internet, red/antivirus que bloquea WebSockets, o clave inválida).';
  return errES(e);
}
export async function connectGemini(model) {
  // Claves de Tuki: token efímero oficial de Gemini Live (1 uso) pedido a la API; con clave propia, como antes.
  const url = gemShared() ? 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained?access_token=' + encodeURIComponent((await tukiApi('live-token', { model })).token)
    : 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=' + encodeURIComponent(S.settings.geminiKey.trim());
  return new Promise((resolve, reject) => {
    let ok = false; const ws = new WebSocket(url);
    const to = setTimeout(() => { if (!ok) { try { ws.close(); } catch (e) {} const e = new Error('Tiempo de espera agotado al conectar con Gemini Live.'); e.friendly = e.message; reject(e); } }, 12000);
    ws.onopen = () => ws.send(JSON.stringify({ setup: { model: 'models/' + model, generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: S.settings.liveVoice || 'Kore' } } } }, systemInstruction: { parts: [{ text: liveSystem() }] }, inputAudioTranscription: {}, outputAudioTranscription: {} } }));
    ws.onmessage = async ev => {
      let txt = ev.data; if (typeof txt !== 'string') txt = txt instanceof Blob ? await txt.text() : new TextDecoder().decode(txt);
      let m; try { m = JSON.parse(txt); } catch (e) { return; }
      if (m.setupComplete && !ok) { ok = true; clearTimeout(to); resolve(ws); return; }
      if (ok) onGeminiMsg(m);
    };
    ws.onclose = ev => { clearTimeout(to); if (!ok) { const e = new Error(`Conexión cerrada (${ev.code}) ${ev.reason || ''}`); e.code = ev.code; e.reason = ev.reason || ''; e.fatal = /api key|permission|unauthori|quota|exceed/i.test(e.reason); reject(e); } else if (LIVE.ws === ws && LIVE.on) { CHAT.err = 'La sesión en vivo terminó' + (ev.reason ? ': ' + ev.reason : '') + '.'; stopLive(); } };
  });
}
export function onGeminiMsg(m) {
  const sc = m.serverContent;
  if (sc) {
    if (sc.interrupted) { Player.stop(); liveSet('listening'); const i = LIVE.cur.model; if (i != null && CHAT.hist[i]) CHAT.hist[i].text += ' …'; }
    ((sc.modelTurn && sc.modelTurn.parts) || []).forEach(p => { if (p.inlineData && /audio/.test(p.inlineData.mimeType || 'audio')) { const r = /rate=(\d+)/.exec(p.inlineData.mimeType || ''); Player.play(p.inlineData.data, r ? +r[1] : 24000); } });
    if (sc.inputTranscription && sc.inputTranscription.text) liveAppend('user', sc.inputTranscription.text);
    if (sc.outputTranscription && sc.outputTranscription.text) { if (LIVE.cur.user != null) LIVE.cur.user = null; liveAppend('model', sc.outputTranscription.text); }
    if (sc.turnComplete) liveTurnDone();
  }
  if (m.goAway) toast('La sesión en vivo terminará pronto (límite de tiempo).', 3500);
}
export async function startGeminiLive() {
  const shared = gemShared(), tried = [], cands = (shared ? [S.settings.liveModel, ...GEMINI_LIVE_MODELS].filter(m => GEMINI_LIVE_MODELS.includes(m)) : [S.settings.liveModel, ...GEMINI_LIVE_MODELS, ...(S.liveModels || [])]).filter((x, i, a) => x && a.indexOf(x) === i);
  let lastErr = null;
  for (let pass = 0; pass < 2; pass++) {
    for (const model of cands) {
      if (tried.includes(model)) continue; tried.push(model);
      try { const ws = await connectGemini(model); LIVE.ws = ws; LIVE.model = model; if (model !== S.settings.liveModel) { S.settings.liveModel = model; save(); } return; }
      catch (e) { lastErr = e; if (e.fatal) throw e; }
    }
    if (shared) break;
    if (pass === 0) { try { const found = await listLiveModels(); found.forEach(f => { if (!cands.includes(f)) cands.push(f); }); } catch (e) { break; } }
  }
  throw lastErr || new Error('Sin modelos Live disponibles');
}
export async function listLiveModels() {
  const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200', { headers: { 'x-goog-api-key': S.settings.geminiKey.trim() } });
  if (!r.ok) throw await httpErr(r);
  const d = await r.json(); const ms = (d.models || []).filter(m => (m.supportedGenerationMethods || []).includes('bidiGenerateContent')).map(m => m.name.replace('models/', ''));
  const pref = ms.filter(n => /live|native-audio/.test(n)); S.liveModels = pref.length ? pref : ms; save(); return S.liveModels;
}
export async function startOpenAIRealtime() {
  const s = S.settings, key = s.openaiKey.trim();
  const r = await fetch('https://api.openai.com/v1/realtime/client_secrets', { method: 'POST', headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ session: { type: 'realtime', model: s.realtimeModel || 'gpt-realtime', instructions: liveSystem(), audio: { input: { transcription: tutorLang() === 'en' ? { model: 'gpt-4o-mini-transcribe', language: 'en' } : { model: 'gpt-4o-mini-transcribe' }, turn_detection: { type: 'server_vad' } }, output: { voice: s.openaiVoice || 'marin', speed: TUTOR_SPEEDS[tutorSpeed()].rt } } } }) });
  if (!r.ok) throw await httpErr(r);
  const d = await r.json(), ek = d.value || (d.client_secret && d.client_secret.value); if (!ek) throw new Error('OpenAI no devolvió una clave temporal.');
  const pc = new RTCPeerConnection(); LIVE.pc = pc;
  const audioEl = new Audio(); audioEl.autoplay = true; LIVE.audioEl = audioEl; pc.ontrack = e => { audioEl.srcObject = e.streams[0]; };
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }); LIVE.stream = stream;
  pc.addTrack(stream.getTracks()[0], stream);
  try { const ctx = new (window.AudioContext || window.webkitAudioContext)(), an = ctx.createAnalyser(); ctx.createMediaStreamSource(stream).connect(an); const buf = new Float32Array(an.fftSize); LIVE.anCtx = ctx; (function lv() { if (!LIVE.on || LIVE.anCtx !== ctx) return; an.getFloatTimeDomainData(buf); let e = 0; for (const x of buf) e += x * x; LIVE.level = Math.sqrt(e / buf.length); requestAnimationFrame(lv); })(); } catch (e) {}
  const dc = pc.createDataChannel('oai-events'); LIVE.dc = dc;
  dc.onmessage = e => { let ev; try { ev = JSON.parse(e.data); } catch (x) { return; } onOAIEvent(ev); };
  dc.onopen = () => { dc.send(JSON.stringify({ type: 'conversation.item.create', item: { type: 'message', role: 'user', content: [{ type: 'input_text', text: '(Start the roleplay now with a short friendly greeting and a first question.)' }] } })); dc.send(JSON.stringify({ type: 'response.create' })); };
  const offer = await pc.createOffer(); await pc.setLocalDescription(offer);
  const sdp = await fetch('https://api.openai.com/v1/realtime/calls', { method: 'POST', body: offer.sdp, headers: { Authorization: 'Bearer ' + ek, 'Content-Type': 'application/sdp' } });
  if (!sdp.ok) throw await httpErr(sdp);
  await pc.setRemoteDescription({ type: 'answer', sdp: await sdp.text() });
  pc.onconnectionstatechange = () => { if (['failed', 'disconnected', 'closed'].includes(pc.connectionState) && LIVE.on) { CHAT.err = 'Se perdió la conexión con OpenAI Realtime.'; stopLive(); } };
  LIVE.sendText = t => { CHAT.hist.push({ role: 'user', text: t, live: true }); chatDraw(); dc.send(JSON.stringify({ type: 'conversation.item.create', item: { type: 'message', role: 'user', content: [{ type: 'input_text', text: t }] } })); dc.send(JSON.stringify({ type: 'response.create' })); };
}
export function onOAIEvent(ev) {
  switch (ev.type) {
    case 'input_audio_buffer.speech_started': liveSet('listening'); break;
    case 'conversation.item.input_audio_transcription.completed': liveTurnDone(); liveAppend('user', ev.transcript || ''); liveTurnDone(); break;
    case 'response.output_audio_transcript.delta': case 'response.audio_transcript.delta': liveAppend('model', ev.delta || ''); break;
    case 'response.output_audio_transcript.done': case 'response.audio_transcript.done': liveTurnDone(); break;
    case 'output_audio_buffer.started': case 'response.created': liveSet('speaking'); break;
    case 'output_audio_buffer.stopped': case 'response.done': liveSet('listening'); break;
    case 'error': CHAT.err = 'OpenAI Realtime: ' + ((ev.error && ev.error.message) || 'error'); chatDraw(); break;
  }
}
export async function startLive() {
  const prov = currentProvider(); if (!prov) return toast(noAIMsg() + ' O pon tu propia clave en Ajustes.', 3500);
  if (!navigator.onLine) return toast('Estás sin conexión: la voz en vivo necesita internet.');
  if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) return toast('Tu navegador no permite usar el micrófono aquí (se requiere https).');
  stopAudio(); if ('speechSynthesis' in window) speechSynthesis.cancel();
  LIVE.on = true; LIVE.provider = prov; LIVE.cur = {}; LIVE.userTurns = 0; LIVE.t0 = Date.now(); CHAT.err = null; liveSet('connecting'); liveUI(); chatDraw();
  try {
    if (prov === 'gemini') {
      Player.ensure();
      await startGeminiLive();
      LIVE.mic = await startMicStream(f32 => { if (LIVE.ws && LIVE.ws.readyState === 1) LIVE.ws.send(JSON.stringify({ realtimeInput: { audio: { data: f32ToB64(f32), mimeType: 'audio/pcm;rate=16000' } } })); });
      LIVE.sendText = t => { CHAT.hist.push({ role: 'user', text: t, live: true }); chatDraw(); LIVE.ws.send(JSON.stringify({ realtimeInput: { text: t } })); };
      LIVE.ws.send(JSON.stringify({ realtimeInput: { text: '(Start the roleplay now: greet me briefly and ask the first question.)' } }));
    } else await startOpenAIRealtime();
    if (LIVE.on) liveSet('listening');
  } catch (e) {
    const msg = prov === 'gemini' ? liveErrES(e) : errES(e, 'OpenAI Realtime');
    stopLive(true); liveSet('error');
    CHAT.err = `No se pudo iniciar la voz en vivo: ${msg} Puedes seguir con el modo alternativo: escribe o dicta con 🎤 en el chat de texto.`; chatDraw();
  }
}
export function stopLive(silent) {
  const had = LIVE.on && LIVE.userTurns > 0 && Date.now() - LIVE.t0 > 15000;
  LIVE.on = false; LIVE.sendText = null;
  try { LIVE.ws && LIVE.ws.close(); } catch (e) {} LIVE.ws = null;
  try { LIVE.mic && LIVE.mic.stop(); } catch (e) {} LIVE.mic = null;
  try { LIVE.dc && LIVE.dc.close(); LIVE.pc && LIVE.pc.close(); } catch (e) {} LIVE.pc = LIVE.dc = null;
  try { LIVE.stream && LIVE.stream.getTracks().forEach(t => t.stop()); } catch (e) {} LIVE.stream = null;
  try { LIVE.anCtx && LIVE.anCtx.close(); } catch (e) {} LIVE.anCtx = null;
  if (LIVE.audioEl) { LIVE.audioEl.srcObject = null; LIVE.audioEl = null; }
  Player.close(); LIVE.level = 0; LIVE.cur = {};
  if (had) { S.lives = (S.lives || 0) + 1; S.chats = (S.chats || 0) + 1; addXP(5); }
  if (!silent) liveSet('idle'); liveUI(); chatDraw();
}

export async function openaiChat() {
  const s = S.settings, model = s.openaiModel || 'gpt-4o-mini';
  const body = { model, messages: [{ role: 'system', content: chatSystem() }, ...CHAT.hist.map(m => ({ role: m.role === 'model' ? 'assistant' : 'user', content: m.text }))], max_completion_tokens: 600 };
  if (!/^(o\d|gpt-5)/.test(model)) body.temperature = 0.7;
  const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { Authorization: 'Bearer ' + s.openaiKey.trim(), 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) throw await httpErr(res);
  const d = await res.json(); const t = (d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content || '').trim();
  if (!t) throw new Error('Respuesta vacía de OpenAI.'); return t;
}
export function resetChat() { CHAT.gen = (CHAT.gen || 0) + 1; CHAT.busy = false; CHAT.hist = []; CHAT.err = null; }
/* Palabras tocables (ayuda de vocabulario) */
export function tapWords(text) {
  const s = decodeEnt(text), re = /[A-Za-z][A-Za-z'’]*(?:-[A-Za-z]+)*/g; let out = '', last = 0, m;
  while ((m = re.exec(s))) { const w = esc(m[0]); out += esc(s.slice(last, m.index)) + `<span class="tw" data-tw="${w}">${w}</span>`; last = re.lastIndex; }
  return out + esc(s.slice(last));
}
/* Modo español: solo las frases entre comillas son tocables */
export function quoteTap(text) { const s = decodeEnt(text), re = /(["“])([^"”]+)(["”])/g; let out = '', last = 0, m; while ((m = re.exec(s))) { out += esc(s.slice(last, m.index)) + esc(m[1]) + tapWords(m[2]) + esc(m[3]); last = re.lastIndex; } return out + esc(s.slice(last)); }
export function msgActs(i, text, lang) {
  text = decodeEnt(text);
  return `<div class="msgacts"><button class="mini" data-say-n="${esc(text)}" data-lang="${lang}" title="Escuchar">🔊</button><button class="mini" data-slow-i="${i}" title="Repetir lento">🔁 Lento</button>${lang === 'es' ? '' : `<button class="mini" data-tr-i="${i}" title="Traducir al español">🇪🇸 Traducir</button>`}</div>`;
}
export const trHTML = m => m.trOpen ? `<div class="trbox">${m.trText ? '🇪🇸 ' + esc(m.trText) : m.trErr ? '⚠️ ' + esc(m.trErr) : '🇪🇸 Traduciendo…'}</div>` : '';
export function msgText(m) { return m.live ? decodeEnt(m.text) : parseTutor(m.text).reply; }
export function chatDraw(keepScroll) {
  const log = $('#log'); if (!log) return;
  const st = log.scrollTop;
  const q = aiQuotaToday(); // cuota de hoy para el aviso suave (≤5 restantes)
  log.innerHTML = CHAT.hist.map((m, i) => {
    if (m.role === 'user') return m.hidden ? '' : `<div class="msg me">${m.live ? '🎙️ ' : ''}${esc(decodeEnt(m.text))}${m.conf ? `<div class="small" style="opacity:.8">🎤 confianza ${Math.round(m.conf * 100)}%</div>` : ''}</div>`;
    if (m.live) return `<div class="msg bot"><div class="mtext">${tapWords(m.text)}</div>${trHTML(m)}${msgActs(i, m.text, 'en')}</div>`;
    const p = parseTutor(m.text), esMode = tutorLang() === 'es', exLang = tutorLang() === 'en' ? 'en' : 'es';
    const fixHTML = p.fix ? (isPerfect(p.fix) ? `<div class="msg fix ok">✅ ¡Perfecto! Tu frase fue correcta.</div>` : `<div class="msg fix"><div class="fx-lab">✏️ Corrección (EN)</div><div class="fx-en">${tapWords(p.fix)} <button class="mini" data-say-n="${esc(p.fix)}" data-lang="en" title="Escuchar la frase correcta">🔊</button></div>${p.expl ? `<div class="fx-lab" style="margin-top:6px">💡 ${exLang === 'es' ? 'Explicación (ES)' : 'Why (EN)'}</div><div class="fx-es">${exLang === 'es' ? esc(p.expl) : tapWords(p.expl)}</div>` : ''}</div>`) : (p.expl ? `<div class="msg fix"><div class="fx-lab">💡 ${exLang === 'es' ? 'Explicación (ES)' : 'Why (EN)'}</div><div class="fx-es">${esc(p.expl)}</div></div>` : '');
    return `${fixHTML}${p.help ? `<div class="msg help">🇨🇴 ${esc(p.help)} <button class="mini" data-say-n="${esc(p.help)}" data-lang="es">🔊</button></div>` : ''}${p.pron ? `<div class="msg fix pron">🗣️ ${esc(p.pron)}</div>` : ''}<div class="msg bot"><div class="mtext">${esMode ? quoteTap(p.reply) : tapWords(p.reply)}</div>${trHTML(m)}${msgActs(i, p.reply, esMode ? 'es' : 'en')}</div>${p.practice ? `<div class="msg practice"><div class="fx-lab">🎯 Practica en inglés</div><div class="fx-en">${tapWords(p.practice)}</div><div class="row" style="gap:6px;margin-top:6px"><button class="mini" data-say-n="${esc(p.practice)}" data-lang="en">🔊</button><button class="mini" data-say-slow="${esc(p.practice)}">🐢</button></div></div>` : ''}`;
  }).join('') + (!CHAT.hist.length && !CHAT.busy && !CHAT.err ? `<div class="empty small">${LIVE.on ? 'Habla cuando quieras: aquí verás lo que tú y Tuki dicen. Di «más despacio» o «¿qué significa…?» si lo necesitas.' : 'Toca <b>«Hablar en vivo»</b> (abajo) para conversar con tu voz, o escribe. Toca <b>Nueva</b> para que Tuki empiece.<br>Toca cualquier palabra en inglés para ver su significado.<br><span class="muted">Nivel: ' + LEVELS[chatLevel()].label + ' · Tutor: ' + TUTOR_LANGS[tutorLang()].name + ' · Velocidad: ' + TUTOR_SPEEDS[tutorSpeed()].name + '. La IA puede equivocarse; tu voz y mensajes se envían a ' + (currentProvider() === 'openai' ? 'OpenAI' : 'Google') + (prov => prov === 'gemini' && gemShared() ? ' con las claves de Tuki' : ' con tu clave')(currentProvider()) + '. Usa audífonos para evitar eco.</span>'}</div>` : '') + (CHAT.busy ? '<div class="msg bot">…</div>' : '') + (CHAT.err ? `<div class="msg err">⚠️ ${esc(CHAT.err)}</div>` : '') + (q && gemShared() && (q.limit - q.used) <= 5 ? `<div class="msg warn small">⚠️ Te quedan ${Math.max(0, q.limit - q.used)} llamadas de IA hoy en este dispositivo.</div>` : '');
  $$('[data-say-n]', log).forEach(b => b.onclick = () => speak(b.dataset.sayN, false, null, b.dataset.lang === 'es' ? 'es' : undefined, chatMul()));
  $$('[data-say-slow]', log).forEach(b => b.onclick = () => speak(b.dataset.saySlow, true, null, undefined, chatMul()));
  $$('[data-slow-i]', log).forEach(b => b.onclick = () => { const m = CHAT.hist[+b.dataset.slowI]; if (!m) return; const lang = !m.live && tutorLang() === 'es' ? 'es' : undefined; speak(msgText(m), true, null, lang, chatMul()); });
  $$('[data-tr-i]', log).forEach(b => b.onclick = () => toggleTranslate(+b.dataset.trI));
  $$('.tw', log).forEach(w => w.onclick = e => { e.stopPropagation(); const ctxEl = w.closest('.msg'); openWordPop(w.dataset.tw, ctxEl ? (ctxEl.querySelector('.mtext,.fx-en') || ctxEl).innerText : '', w); });
  if (keepScroll) log.scrollTop = st; else log.scrollTop = log.scrollHeight;
}
/* IA rápida (traducciones) con caché local */
/* IA rápida (traducciones) con caché local y respaldo persistente en TukiDB */
export const CACHE_KEYS = { w: 'tukiSpeak.wcache', t: 'tukiSpeak.tcache', e: 'tukiSpeak.ecache' };
export const MEM_WCACHE = new Map();
export const MEM_TCACHE = new Map();
export const MEM_ECACHE = new Map();
export function cacheGet(k, id) {
  if (k === 'w' && MEM_WCACHE.has(id)) return MEM_WCACHE.get(id);
  if (k === 't' && MEM_TCACHE.has(id)) return MEM_TCACHE.get(id);
  if (k === 'e' && MEM_ECACHE.has(id)) return MEM_ECACHE.get(id);
  try {
    const v = (JSON.parse(localStorage.getItem(CACHE_KEYS[k]) || '{}'))[id];
    if (v) {
      if (k === 'w') MEM_WCACHE.set(id, v);
      if (k === 't') MEM_TCACHE.set(id, v);
      if (k === 'e') MEM_ECACHE.set(id, v);
    }
    return v;
  } catch (e) { return undefined; }
}
export function cacheSet(k, id, v) {
  if (k === 'w') { MEM_WCACHE.set(id, v); TukiDB.set('words', id, v).catch(() => {}); }
  if (k === 't') { MEM_TCACHE.set(id, v); TukiDB.set('kv', 'tr:' + id, v).catch(() => {}); }
  if (k === 'e') { MEM_ECACHE.set(id, v); TukiDB.set('kv', 'err:' + id, v).catch(() => {}); }
  try {
    const o = JSON.parse(localStorage.getItem(CACHE_KEYS[k]) || '{}');
    o[id] = v;
    const ks = Object.keys(o);
    if (ks.length > 400) ks.slice(0, ks.length - 400).forEach(x => delete o[x]);
    localStorage.setItem(CACHE_KEYS[k], JSON.stringify(o));
  } catch (e) {}
}
/* v2.5.1: llamadas únicas a la IA resistentes a saturación (503/429/500/UNAVAILABLE/high demand) */
export const AIQ = { budget: 25000, base: 700, good: null };
export const GEM_QUICK_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-2.0-flash-lite'];
export function aiTransient(e) { if (!e) return false; const m = String(e.detail || e.message || ''); return [408, 429, 500, 502, 503, 504].includes(e.status) || /UNAVAILABLE|high demand|overloaded|RESOURCE_EXHAUSTED|try again later|temporarily/i.test(m); }
export function aiStatus(msg) { try { document.dispatchEvent(new CustomEvent('tuki-ai-status', { detail: msg || '' })); } catch (e) {} }
export function aiBusyErr(last, prov) { const e = new Error((last && last.message) || 'busy'); e.status = last && last.status; e.detail = (last && (last.detail || last.message)) || ''; e.busy = true; e.friendly = (prov || 'Gemini') + ' está muy ocupado en este momento (mucha demanda). Espera un minuto e intenta de nuevo.'; return e; }
export async function gemQuickCall(model, system, prompt, max, json, timeout) {
  const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), timeout);
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, { method: 'POST', signal: ctl.signal, headers: { 'Content-Type': 'application/json', 'x-goog-api-key': S.settings.geminiKey.trim() }, body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: Object.assign({ temperature: 0.2, maxOutputTokens: max }, json ? { responseMimeType: 'application/json' } : {}) }) });
    if (!r.ok) throw await httpErr(r);
    const d = await r.json();
    return ((d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts) || []).map(x => x.text || '').join('').trim();
  } catch (e) { if (e.name === 'AbortError') { const x = new Error('Tiempo de espera agotado.'); x.status = 408; throw x; } throw e; }
  finally { clearTimeout(tm); }
}
export async function aiQuick(system, prompt, opts = {}) {
  const max = opts.max || 300, out = t => opts.json ? t : decodeEnt(t);
  const prov = currentProvider(); if (!prov) { const e = new Error(noAIMsg() + ' O pon tu propia clave en Ajustes.'); e.friendly = e.message; throw e; }
  if (prov === 'gemini' && gemShared()) {
    try { const d = await tukiApi('gemini', { model: sharedModel(AIQ.good || S.settings.model), request: { systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: Object.assign({ temperature: 0.2, maxOutputTokens: max }, opts.json ? { responseMimeType: 'application/json' } : {}) } }); AIQ.good = d.model; return out(d.text); }
    catch (e) { if (e.code === 'BUSY') throw aiBusyErr(e, 'Gemini'); throw e; }
  }
  const t0 = Date.now(), left = () => AIQ.budget - (Date.now() - t0);
  if (prov === 'openai') {
    let last;
    for (let k = 0; k < 3; k++) {
      if (k) { if (left() <= 0) break; aiStatus(`OpenAI está ocupado, reintentando… (${k + 1}/3)`); await sleep(Math.min(AIQ.base * 2 * k, Math.max(0, left()))); }
      try {
        const model = S.settings.openaiModel || 'gpt-4o-mini', body = { model, messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }], max_completion_tokens: max }; if (opts.json) body.response_format = { type: 'json_object' };
        const r = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { Authorization: 'Bearer ' + S.settings.openaiKey.trim(), 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!r.ok) throw await httpErr(r); const d = await r.json(); aiStatus(''); return out(((d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) || '').trim());
      } catch (e) { last = e; if (!aiTransient(e)) { aiStatus(''); throw e; } }
    }
    aiStatus(''); throw aiBusyErr(last, 'OpenAI');
  }
  const models = [AIQ.good, S.settings.model || 'gemini-2.5-flash', ...GEM_QUICK_MODELS].filter((m, i, a) => m && a.indexOf(m) === i), N = models.length;
  let last = null;
  for (let pass = 0; pass < 4; pass++) {
    let transient = false;
    for (let i = 0; i < N; i++) {
      if (last) { if (left() <= 0) break; aiStatus(pass ? `Gemini sigue ocupado, reintentando… (${i + 1}/${N})` : `Gemini está ocupado, probando otro modelo… (${i + 1}/${N})`); }
      try {
        const t = await gemQuickCall(models[i], system, prompt, max, opts.json, Math.max(15000, left() + 5000));
        if (t) { AIQ.good = models[i]; aiStatus(''); return out(t); }
        last = new Error('Respuesta vacía del modelo.'); last.status = 0;
      } catch (e) {
        last = e;
        if (e instanceof TypeError && !e.status) { aiStatus(''); throw e; }
        if (e.status === 404) continue;
        if (aiTransient(e)) { transient = true; if (left() > 0) await sleep(Math.min(AIQ.base, Math.max(0, left()))); continue; }
        aiStatus(''); throw e;
      }
    }
    if (!transient || left() <= 0) break;
    aiStatus('Gemini sigue ocupado, esperando un momento para reintentar…'); await sleep(Math.min(AIQ.base * 2 * (pass + 1), Math.max(0, left())));
  }
  aiStatus('');
  if (aiTransient(last)) throw aiBusyErr(last, 'Gemini');
  throw last || new Error('Sin respuesta');
}
export async function toggleTranslate(i) {
  const m = CHAT.hist[i]; if (!m) return;
  if (m.trOpen && (m.trText || m.trErr)) { m.trOpen = false; return chatDraw(true); }
  m.trOpen = true; m.trErr = null; const text = msgText(m), id = hashStr(text);
  const c = cacheGet('t', id); if (c) { m.trText = c; return chatDraw(true); }
  chatDraw(true);
  try {
    const t = await aiQuick('You are a precise English-to-Spanish translator for a learner from Colombia. Translate the user text into natural Latin American Spanish. Output ONLY the translation, nothing else.', text);
    m.trText = t.replace(/^["“]|["”]$/g, ''); cacheSet('t', id, m.trText);
  } catch (e) { m.trErr = errES(e); }
  chatDraw(true);
}

/* ---- Tutor con IA en el momento del error (Top 1) ----
   Botón "💡 ¿Por qué me equivoqué?" en el pie de feedback de un ejercicio
   fallido (oído o voz). 1 llamada aiQuick por toque, solo bajo demanda;
   el resultado se cachea por hash (objetivo + lo escuchado + puntaje)
   como las traducciones (clave 'e'). El botón NO aparece sin proveedor
   o con la cuota compartida agotada; el feedback actual sigue igual y
   "Continuar" nunca queda bloqueado por la IA. La explicación se basa
   solo en el resultado medido (palabras, puntajes, fonema confundido):
   el prompt prohíbe inventar errores fuera de esos datos. */
export const ERR_TUTOR_SYS = `You are "Tuki", a patient English pronunciation tutor for a Spanish-speaking learner from Colombia. The learner just made a mistake in an exercise. You are given MEASURED data about that mistake (what was expected, what the learner said or chose, scores per word, and any phoneme tip measured by an automatic evaluator).
Explain in Latin American Spanish (use "tú"), in 1-2 short sentences: what was heard vs. what it should have been, which phoneme or word failed, and the corrected sentence to repeat.
Rules: only use the data given. Never invent mistakes that are not in the data. If the data does not show a clear error, say so in one sentence. Do not add greetings, markdown or extra sections. Output only the explanation.`;
export function errorTutorAvailable() {
  if (!currentProvider()) return false;
  if (gemShared()) { const q = aiQuotaToday(); if (q && (q.limit - q.used) <= 0) return false; }
  return true;
}
export function errorTutorKey(c) {
  return hashStr(JSON.stringify([c.kind, c.type || '', c.target || '', c.heard || '', c.pct == null ? '' : Math.round(c.pct), (c.weak || []).map(w => w.t + ':' + Math.round(w.s * 100)).join(',')]));
}
export function errorTutorPrompt(c) {
  const lines = [
    `Ejercicio: ${c.kind === 'voice' ? 'voz' : 'oído'} · ${c.typeLabel || c.type || ''}`,
    `Lo esperado: "${c.target || ''}"`,
    `${c.kind === 'voice' ? 'Lo que el usuario dijo' : 'Lo que el usuario eligió'}: "${c.heard || ''}"`,
  ];
  if (c.pct != null) lines.push(`Puntaje: ${Math.round(c.pct)}%`);
  if (c.weak && c.weak.length) lines.push(`Palabras con puntaje bajo (medido): ${c.weak.map(w => `${w.t} ${Math.round(w.s * 100)}%`).join(', ')}`);
  if (c.tips && c.tips.length) lines.push(`Pista fonémica medida: ${c.tips[0]}`);
  if (c.sound) lines.push(`Sonido de la lección: /${c.sound}/`);
  return lines.join('\n');
}
export async function explainError(c) {
  const id = errorTutorKey(c);
  const cached = cacheGet('e', id);
  if (cached) return cached;
  const text = String(await aiQuick(ERR_TUTOR_SYS, errorTutorPrompt(c), { max: 300 }) || '').trim();
  if (!text) throw new Error('La IA no devolvió una explicación.');
  cacheSet('e', id, text);
  return text;
}
export function errorTutorHTML(c) {
  if (!c || !errorTutorAvailable()) return '';
  return `<div class="err-tutor"><button class="btn ghost block err-tutor-btn" data-err-tutor type="button">💡 ¿Por qué me equivoqué?</button><div class="err-tutor-box" data-err-tutor-box hidden></div></div>`;
}
export function bindErrorTutor(root, c) {
  const btn = root && root.querySelector ? root.querySelector('[data-err-tutor]') : null;
  if (!btn || !c) return;
  btn.onclick = async () => {
    const box = root.querySelector('[data-err-tutor-box]');
    if (!box) return;
    if (box.dataset.done) { box.hidden = !box.hidden; btn.textContent = box.hidden ? '💡 ¿Por qué me equivoqué?' : '💡 Ocultar explicación'; return; }
    if (btn.disabled) return;
    btn.disabled = true; btn.textContent = '⏳ Tuki está pensando…';
    box.hidden = false;
    box.innerHTML = '<div class="spinner sm"></div><div class="small muted" style="text-align:center">Tuki está analizando tu error…</div>';
    try {
      const text = await explainError(c);
      box.dataset.done = '1';
      box.innerHTML = `<div class="err-tutor-text">${esc(text)}</div><div class="row" style="margin-top:8px"><button class="mini" data-err-say type="button">🔊 Escuchar la frase correcta</button></div><div class="small muted" style="margin-top:6px">La IA puede equivocarse.</div>`;
      const say = box.querySelector('[data-err-say]');
      if (say) say.onclick = () => speak(c.target);
      btn.disabled = false; btn.textContent = '💡 Ocultar explicación';
    } catch (e) {
      box.innerHTML = `<div class="small">⚠️ ${esc(errES(e))}</div>`;
      btn.disabled = false; btn.textContent = '💡 ¿Por qué me equivoqué?';
    }
  };
}

export async function chatSend(text, hidden = false, conf = 0) {
  text = String(text || '').trim();
  if (!text) return;
  if (text.length > 2000) return toast('El mensaje es demasiado largo (máximo 2000 caracteres).');
  if (LIVE.on && LIVE.sendText) return LIVE.sendText(text);
  if (CHAT.busy) return toast('Espera la respuesta de Tuki…');
  const prov = currentProvider(), gen = CHAT.gen = CHAT.gen || 0; CHAT.err = null; CHAT.busy = true;
  CHAT.hist.push({ role: 'user', text, hidden, conf }); chatDraw();
  try {
    const out = prov === 'openai' ? await openaiChat() : await gemini(text);
    if (gen !== CHAT.gen) return;
    CHAT.hist.push({ role: 'model', text: out }); CHAT.busy = false; S.chats = (S.chats || 0) + 1; addXP(1); chatDraw();
    if (S.settings.autoplay) speakSeq(tutorSpeechParts(parseTutor(out)), 0, chatMul());
  } catch (e) {
    if (gen !== CHAT.gen) return;
    CHAT.hist.pop(); CHAT.busy = false;
    CHAT.err = (prov === 'openai' ? 'OpenAI' : 'Gemini') + ': ' + errES(e) + (prov === 'gemini' && e.status >= 500 ? ' Espera un minuto y vuelve a intentar, o prueba otro modelo en Ajustes.' : ''); chatDraw();
  }
}
export async function chatMic(btn) {
  if (HAS_SR) { if (curRec) return stopRecognize(); btn.classList.add('rec'); try { const a = await recognize(); chatSend(a[0].t, false, a[0].c); } catch (err) { toast(SR_ERR[err] || err); } finally { btn.classList.remove('rec'); } return; }
  if (!(azureReady() || S.settings.openaiKey)) return toast('Tu navegador no reconoce voz. Escribe, usa Chrome, o configura Azure/OpenAI.');
  if (MicCap.active) return MicCap.stop();
  btn.classList.add('rec');
  try { const r = await MicCap.start({ maxMs: 15000 }); btn.classList.remove('rec'); const t = azureReady() ? await azureSTT(r.wav) : await openaiSTT(r.wav); chatSend(t); }
  catch (e) { toast(errES(e), 4000); } finally { btn.classList.remove('rec'); }
}

export function fitChat() {
  const cs = $('#chatscreen'); if (!cs) return;
  const vh = window.visualViewport ? visualViewport.height : window.innerHeight, zoom = parseFloat(document.body.style.zoom) || 1;
  const top = cs.getBoundingClientRect().top, nav = $('#tabbar').getBoundingClientRect().height;
  cs.style.height = Math.max(300, (vh - nav) / zoom - top - 8) + 'px';
}
window.addEventListener('resize', fitChat); if (window.visualViewport) visualViewport.addEventListener('resize', fitChat);

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
export const clamp100 = x => Math.max(0, Math.min(100, Math.round(+x || 0)));
export function parseJSONLoose(t) { const s = String(t || '').replace(/^```(?:json)?\s*|\s*```$/g, ''); try { return JSON.parse(s); } catch (e) { const m = s.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]); throw new Error('La IA no devolvió un resultado válido. Intenta de nuevo.'); } }
export async function aiJSON(system, prompt, max = 1800) { return decodeDeep(parseJSONLoose(await aiQuick(system, prompt, { max, json: true }))); }
export function sayBtns(t) { return `<button class="mini" data-say-n="${esc(t)}" title="Escuchar">🔊</button><button class="mini" data-say-slow="${esc(t)}" title="Lento">🐢</button>`; }
export function bindSayTap(root) {
  $$('[data-say-n]', root).forEach(b => b.onclick = e => { e.stopPropagation(); speak(b.dataset.sayN, false, null, b.dataset.lang === 'es' ? 'es' : undefined, chatMul()); });
  $$('[data-say-slow]', root).forEach(b => b.onclick = e => { e.stopPropagation(); speak(b.dataset.saySlow, true); });
  $$('.tw', root).forEach(w => w.onclick = e => { e.stopPropagation(); const c = w.closest('[data-ctx]'); openWordPop(w.dataset.tw, c ? c.dataset.ctx : w.parentElement.innerText, w); });
}
export function scoreBarH(label, v) { v = clamp100(v); const c = v >= 80 ? 'var(--g)' : v >= 60 ? 'var(--o)' : 'var(--r)'; return `<div class="az-bar">${label} · ${v}<div class="tr"><i style="width:${v}%;background:${c}"></i></div></div>`; }

export function convoTranscript(msgs) {
  return msgs.filter(m => !m.hidden).map(m => m.role === 'user' ? 'Learner: ' + m.text : 'Tuki: ' + (m.live ? m.text : (() => { const p = parseTutor(m.text); return (p.fix && !isPerfect(p.fix) ? '[correction: ' + p.fix + '] ' : '') + p.reply; })())).join('\n').slice(-7000);
}
export function addLearnItems(items, src) {
  let added = 0; const now = Date.now();
  items.forEach(it => {
    if (!it.en) return; const en = String(it.en).trim(), key = (it.kind === 'frase' ? 's:' : 'w:') + en.toLowerCase();
    if (!S.deck[key] && !S.deck[(it.kind === 'frase' ? 's:' : 'w:') + en]) { addToDeck([{ key, en, es: it.es || '', kind: it.kind, lesson: null }]); added++; }
    if (!S.convoItems.some(c => c.en.toLowerCase() === en.toLowerCase())) S.convoItems.unshift({ en, es: it.es || '', kind: it.kind, ts: now, src });
  });
  S.convoItems = S.convoItems.slice(0, 60); save(); return added;
}
export function flagHard(words, src) { const now = Date.now(); (words || []).forEach(x => { const w = String(x.word || x || '').toLowerCase().replace(/[^a-z' -]/g, '').trim(); if (!w || w.length < 2) return; const h = S.hard[w] || (S.hard[w] = { w, n: 0, t: 0, src, note: '' }); h.n++; h.t = now; if (x.note_es) h.note = x.note_es; }); save(); }
export const SUM_SYS = () => `You are an expert English teacher analyzing a conversation between a Spanish-speaking learner from Colombia (CEFR ${chatLevel() === 'A2' ? 'A1-A2' : chatLevel()}) and a tutor called Tuki. The learner's lines usually come from speech-to-text, so odd words may be pronunciation problems. Pay special attention to words the learner repeats, corrects mid-sentence, or that the recognizer transcribed oddly (a strange word where the sentence clearly meant another one): those are pronunciation clues, not grammar mistakes.
Return ONLY JSON with this exact shape (Spanish for all *_es fields, Latin American Spanish, use "tú"):
{"summary_es":"1-2 sentences about how the conversation went","mistakes":[{"said":"what the learner said (quote)","correct":"correct natural English sentence","explain_es":"short explanation"}],"new_words":[{"en":"useful English word or short phrase from the conversation","es":"Spanish meaning"}],"mispronounced":[{"word":"English word the learner probably mispronounced or the speech recognizer misheard","note_es":"short tip"}],"misheard":[{"word":"English word the learner meant to say but the speech recognizer misunderstood, or that the learner repeated with hesitation","heard_as":"what the recognizer wrote instead, or the hesitant repetition (short)","note_es":"short phonemic tip in Spanish: which sound to practice and how"}],"scores":{"fluency":0-100,"grammar":0-100,"vocabulary":0-100},"tips_es":["tip 1","tip 2"]}
Rules: max 6 mistakes (most important first), max 8 new_words, max 5 mispronounced, max 5 misheard, 1-2 tips. Only include real mistakes made by the learner. Only include in misheard words that actually appear as misunderstood or repeated with hesitation in the learner's lines; if there are none, use an empty array []. Be encouraging and fair with scores for the learner's level.`;
/* v2.5.1: la transcripción se guarda como «Resumen pendiente» antes de llamar a la IA; si falla, se puede reintentar luego */
export function ensureSP() { if (!Array.isArray(S.sumPending)) S.sumPending = []; }
export function sumPendingAdd(tr, meta) { ensureSP(); const p = { id: uid(), ts: Date.now(), date: dayKey(), title: meta.title || 'Conversación', mode: meta.mode || 'chat', live: !!meta.live, tr }; S.sumPending.unshift(p); S.sumPending = S.sumPending.slice(0, 10); save(); return p; }
export async function summarizeConvo(msgs, meta) { const p = sumPendingAdd(convoTranscript(msgs), meta); return runPendingSummary(p.id); }
export async function runPendingSummary(id) {
  ensureSP(); const p = S.sumPending.find(x => x.id === id);
  if (!p) { const e = new Error('Este resumen ya no está pendiente.'); e.friendly = e.message; throw e; }
  let data;
  try { data = await aiJSON(SUM_SYS(), `Conversation (${p.title}):\n${p.tr}`, 4000); }
  catch (e) { p.err = String(e.detail || e.message || e).slice(0, 400); p.tries = (p.tries || 0) + 1; p.last = Date.now(); save(); e.pendId = id; throw e; }
  const d = { summary_es: String(data.summary_es || ''), mistakes: (data.mistakes || []).filter(m => m && m.correct).slice(0, 6), new_words: (data.new_words || []).filter(w => w && w.en).slice(0, 8), mispronounced: (data.mispronounced || []).filter(w => w && w.word).slice(0, 5), misheard: (data.misheard || []).filter(w => w && w.word).map(w => ({ word: String(w.word), heard_as: w.heard_as ? String(w.heard_as) : '', note_es: w.note_es ? String(w.note_es) : '' })).slice(0, 5), scores: { fluency: clamp100((data.scores || {}).fluency), grammar: clamp100((data.scores || {}).grammar), vocabulary: clamp100((data.scores || {}).vocabulary) }, tips_es: (data.tips_es || data.tips || []).slice(0, 2).map(String) };
  const added = addLearnItems([...d.mistakes.map(m => ({ en: m.correct, es: m.explain_es, kind: 'frase' })), ...d.new_words.map(w => ({ en: w.en, es: w.es, kind: /\s/.test(w.en.trim()) ? 'frase' : 'palabra' }))], 'convo');
  // (Top 3a: las palabras mal entendidas por el reconocedor entran en
  // flagHard() como las mal pronunciadas, para que alimenten "Practica mis
  // errores" (Top 2) y el Plan de hoy; sin duplicar una palabra que ya
  // venga en mispronounced. 0 llamadas extra: sale del resumen que ya
  // existe; si el resumen no trae palabras, no se marca nada.)
  const seenHard = new Set(d.mispronounced.map(w => String(w.word || '').toLowerCase()));
  flagHard([...d.mispronounced, ...d.misheard.filter(w => { const k = String(w.word || '').toLowerCase(); if (seenHard.has(k)) return false; seenHard.add(k); return true; })], 'convo');
  const rec = { id: uid(), ts: Date.now(), date: p.date || dayKey(), kind: 'summary', title: p.title, mode: p.mode, live: p.live, added, data: d };
  S.sumPending = S.sumPending.filter(x => x.id !== id);
  S.summaries.unshift(rec); S.summaries = S.summaries.slice(0, 60); addXP(5); save(); checkBadges();
  return rec;
}
export function summaryHTML(rec) {
  const d = rec.data, sc = d.scores, avgS = Math.round((sc.fluency + sc.grammar + sc.vocabulary) / 3);
  return `<div class="sumcard"><div class="row between"><h2 style="margin:0">📝 Resumen</h2><div class="sumscore">${avgS}</div></div>
    <div class="small muted">${esc(rec.title)} · ${esc(rec.date)}${rec.live ? ' · 🎙️ voz en vivo' : ' · ⌨️ texto'}</div>
    ${d.summary_es ? `<p>${esc(d.summary_es)}</p>` : ''}
    <div class="sumbars">${scoreBarH('Fluidez', sc.fluency)}${scoreBarH('Gramática', sc.grammar)}${scoreBarH('Vocabulario', sc.vocabulary)}</div>
    <h3>✏️ Errores (${d.mistakes.length})</h3>${d.mistakes.length ? d.mistakes.map(m => `<div class="mist" data-ctx="${esc(m.correct)}"><div class="said">✗ ${esc(m.said || '')}</div><div class="good">✓ ${tapWords(m.correct)} ${sayBtns(m.correct)}</div><div class="small">💡 ${esc(m.explain_es || '')}</div></div>`).join('') : '<p class="small muted">¡No se detectaron errores importantes! 🎉</p>'}
    ${d.new_words.length ? `<h3>🆕 Palabras y frases nuevas</h3><div class="nw">${d.new_words.map(w => `<div class="nwi" data-ctx="${esc(w.en)}"><b>${tapWords(w.en)}</b> <span class="muted small">— ${esc(w.es || '')}</span> ${sayBtns(w.en)}</div>`).join('')}</div>` : ''}
    ${d.mispronounced.length ? `<h3>🗣️ Para pronunciar mejor</h3>${d.mispronounced.map(w => `<div class="nwi"><b>${esc(w.word)}</b> ${sayBtns(w.word)} <div class="small muted">${esc(w.note_es || '')}</div></div>`).join('')}` : ''}
    ${(d.misheard || []).length ? `<h3>🎧 Pronunciación en vivo (${d.misheard.length} ${d.misheard.length === 1 ? 'palabra' : 'palabras'})</h3><p class="small muted">Estas palabras el reconocedor las entendió mal o las repetiste con duda, según la transcripción de esta sesión. Es una pista de pronunciación, no una nota: no es una evaluación fonémica con audio como la de las lecciones con Azure, ni una calificación absoluta.</p>${d.misheard.map(w => `<div class="nwi"><b>${esc(w.word)}</b> ${sayBtns(w.word)}${w.heard_as ? ` <span class="small muted">— se entendió como «${esc(w.heard_as)}»</span>` : ''} <div class="small muted">${esc(w.note_es || '')}</div></div>`).join('')}` : ''}
    ${d.tips_es.length ? `<h3>🎯 Consejos</h3><ul class="small">${d.tips_es.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
    ${rec.added ? `<div class="tipbox small">🃏 Se agregaron <b>${rec.added}</b> tarjetas a tu mazo y al <b>Plan de hoy</b>.</div>` : ''}</div>`;
}
export function aiFriendly(e, what) {
  if (e && e.friendly) return e.friendly;
  if (!navigator.onLine) return 'Estás sin conexión a internet. Tu conversación quedó guardada; intenta de nuevo cuando tengas red.';
  if (e && [400, 401, 403, 404].includes(e.status)) return errES(Object.assign(new Error(''), { status: e.status }));
  return 'No se pudo generar ' + (what || 'el resumen') + ' en este momento.';
}
export function openSummarySheet(promiseOrRec, title) {
  modal(`<div id="sumBody"></div><div class="row" style="margin-top:10px"><button class="btn ghost block" data-x>Cerrar</button><button class="btn primary block hidden" id="sumPractice" disabled>🎤 Practicar ahora</button><button class="btn ghost block hidden" id="sumPracticeErrors">🎯 Practica mis errores</button></div>`, (el, close) => {
    $('[data-x]', el).onclick = close; el.closest('.overlay').classList.add('sumsheet');
    const pb = $('#sumPractice', el);
    const peBtn = $('#sumPracticeErrors', el);
    // (Top 2: al final del resumen, practicar los errores con IA cuando hay
    // datos medidos suficientes; sin IA o sin datos el botón no aparece y el
    // flujo del resumen no cambia)
    if (peBtn && practiceErrorsHasData()) { peBtn.classList.remove('hidden'); peBtn.onclick = () => { close(); startPracticeErrors(); }; }
    const onStatus = ev => { if (!document.body.contains(el)) return document.removeEventListener('tuki-ai-status', onStatus); const st = $('#sumStatus', el); if (st && ev.detail) st.textContent = ev.detail; };
    document.addEventListener('tuki-ai-status', onStatus);
    const loading = () => { pb.classList.add('hidden'); pb.disabled = true; $('#sumBody', el).innerHTML = `<div class="sumcard"><h2>📝 Resumen</h2><p class="muted">${esc(title || '')}</p><div class="spinner"></div><p class="small muted" style="text-align:center" id="sumStatus" aria-live="polite">Tuki está analizando tu conversación…</p></div>`; };
    const show = rec => {
      $('#sumBody', el).innerHTML = summaryHTML(rec); bindSayTap(el);
      const items = [...rec.data.mistakes.map(m => m.correct), ...rec.data.new_words.map(w => w.en)];
      pb.disabled = !items.length; pb.classList.toggle('hidden', !items.length);
      pb.onclick = () => { close(); startLesson(null, 'practice', items.slice(0, 8).map(t => ({ kind: 'speak', variant: /\s/.test(t) ? 'sentence' : 'word', l: LESSONS[0], text: t, es: '' })), 'Práctica de tu conversación'); };
    };
    const fail = e => {
      if (!document.body.contains(el)) return;
      pb.classList.add('hidden'); pb.disabled = true;
      const raw = String((e && (e.detail || e.message)) || e || ''), pid = e && e.pendId;
      $('#sumBody', el).innerHTML = `<div class="sumcard sumfail"><h2>📝 Resumen</h2><div class="msg err">😕 ${esc(aiFriendly(e))}</div>
        ${pid ? '<p class="small muted">Tu conversación quedó guardada. Puedes reintentar ahora o más tarde desde <b>Progreso → Historial</b> («Resumen pendiente»).</p><button class="btn primary block" id="sumRetry">🔄 Reintentar</button>' : ''}
        ${raw ? `<details class="small muted" style="margin-top:10px"><summary>Detalles</summary><div class="rawerr">${esc(raw)}</div></details>` : ''}</div>`;
      const rb = $('#sumRetry', el); if (rb) rb.onclick = () => run(runPendingSummary(pid));
    };
    const run = pr => { loading(); pr.then(r => { if (document.body.contains(el)) show(r); }).catch(fail); };
    if (promiseOrRec && promiseOrRec.then) run(promiseOrRec); else show(promiseOrRec);
  });
}
/* Fin de conversación: Terminar / Nueva / salir de la pestaña */
export function endConversation(reason) {
  const from = CHAT.sumFrom || 0, msgs = CHAT.hist.slice(from); CHAT.sumFrom = CHAT.hist.length;
  const userTurns = msgs.filter(m => m.role === 'user' && !m.hidden).length, wasLive = msgs.some(m => m.live);
  if (CHAT.scen === '__iv') return finishInterview(msgs, userTurns);
  if (CHAT.scen === '__ch') return finishChallenge(msgs, userTurns, wasLive);
  if (userTurns >= 2 && S.settings.autoSummary !== false && currentProvider()) openSummarySheet(summarizeConvo(msgs, { title: SCEN_ES[CHAT.scen] || 'Conversación', mode: 'chat', live: wasLive }), SCEN_ES[CHAT.scen]);
}
const _resetChat24 = resetChat; resetChat = function () { _resetChat24(); CHAT.sumFrom = 0; };
const _stopLive24 = stopLive; stopLive = function (silent) { const was = LIVE.on; _stopLive24(silent); if (was && !silent) endConversation('live'); };

/* Plan de hoy y Práctica con lo aprendido en conversaciones y palabras difíciles */
export function convoPracticeItems(n) { return S.convoItems.filter(c => Date.now() - c.ts < 14 * DAY).slice(0, n).map(c => ({ kind: 'speak', variant: c.kind === 'frase' ? 'sentence' : 'word', l: LESSONS[0], text: c.en, es: c.es, cardKey: S.deck[(c.kind === 'frase' ? 's:' : 'w:') + c.en.toLowerCase()] ? (c.kind === 'frase' ? 's:' : 'w:') + c.en.toLowerCase() : undefined })); }

export function hardWords() {
  const out = new Map();
  Object.entries(S.wd || {}).forEach(([k, r]) => { if (!k || k.includes(' ') || k.length < 2 || /^\d+$/.test(k)) return; const a = r.sum / r.n; if (r.last >= 85) return; if (r.last < 70 || (r.n >= 2 && a < 65)) out.set(k, { w: r.disp || k, key: k, last: r.last, avg: Math.round(a), n: r.n, src: 'lesson', sid: r.sid }); });
  Object.values(S.hard || {}).forEach(h => { const k = normText(h.w).join(' '), r = (S.wd || {})[k]; if (r && r.t > h.t && r.last >= 75) return; if (!out.has(k)) out.set(k, { w: h.w, key: k, last: r && r.t > h.t ? r.last : null, avg: null, n: h.n, src: h.src || 'convo', note: h.note }); else out.get(k).src = 'both'; });
  return [...out.values()].sort((a, b) => (a.last == null ? -1 : a.last) - (b.last == null ? -1 : b.last));
}
export function hardDrillItems(n) { return hardWords().slice(0, n).map(h => ({ kind: 'speak', variant: 'word', l: LESSON[h.sid] || LESSONS[0], text: h.w, es: h.note || 'Palabra difícil para ti' })); }
export function startHardDrill() { const q = hardDrillItems(8); if (!q.length) return toast('Aún no hay palabras difíciles. ¡Sigue practicando!'); startLesson(null, 'practice', q, 'Mis palabras difíciles'); }

/* ---- "🎯 Practica mis errores" (Top 2) ----
   Genera 6-8 ejercicios NUEVOS a partir de los errores MEDIDOS del usuario:
   2 fonemas más débiles (S.ph), 3 palabras con peor puntaje (S.wd/S.hard)
   y 1-2 errores de su último resumen o entrevista. La cola se ejecuta con
   el motor existente (startLesson, sin cambios) y solo con tipos de
   ejercicio que el motor ya ejecuta (speak, pick, quiz, order, ltype,
   saypair). Máx. 1 llamada Gemini al día por usuario: caché {day, hash,
   items} en 'tukiSpeak.pcache' (+ respaldo en memoria). Si ya se generó
   una vez hoy, se reutiliza la cola de hoy aunque el hash haya cambiado.
   Sin proveedor o con cuota agotada, y si la validación falla, la práctica
   sigue existiendo como hoy (buildTopErrorsPractice), sin mostrar error.
   Generación solo bajo demanda al abrir la práctica, nunca en segundo
   plano. Nunca se inventan errores: cada ejercicio debe usar ("uses") una
   palabra, un fonema o una palabra de la frase corregida que esté en los
   datos medidos; si no, se descarta. */
export const PRACTICE_ERRORS_CACHE_KEY = 'tukiSpeak.pcache';
export let MEM_PCACHE = null;
export function practiceErrorsData() {
  const phonemes = Object.entries(S.ph || {}).map(([ipa, r]) => ({ ipa, avg: Math.round(r.sum / r.n), n: r.n }))
    .filter(p => p.n >= 1 && Number.isFinite(p.avg) && p.avg < 80).sort((a, b) => a.avg - b.avg).slice(0, 2);
  const words = hardWords().filter(h => h.w && !/\s/.test(String(h.w).trim())).slice(0, 3)
    .map(h => ({ w: String(h.w).trim(), score: h.last == null ? (h.avg == null ? 60 : h.avg) : h.last, note: h.note || '' }));
  let errors = [];
  const lastSum = (S.summaries || [])[0];
  if (lastSum && lastSum.data && Array.isArray(lastSum.data.mistakes)) errors = lastSum.data.mistakes.slice(0, 2).map(m => ({ said: String(m.said || ''), correct: String(m.correct || ''), explain_es: String(m.explain_es || '') })).filter(m => m.correct);
  if (!errors.length) {
    const lastIv = (S.interviews || [])[0];
    if (lastIv && lastIv.data && Array.isArray(lastIv.data.common_mistakes)) errors = lastIv.data.common_mistakes.slice(0, 2).map(m => ({ said: String(m.said || ''), correct: String(m.correct || ''), explain_es: String(m.explain_es || '') })).filter(m => m.correct);
  }
  return { phonemes, words, errors, total: phonemes.length + words.length + errors.length };
}
export function practiceErrorsHasData(d) {
  const data = d || practiceErrorsData();
  return data.total >= 3 && (data.words.length + data.errors.length) >= 1;
}
export function practiceErrorsAIAvailable() {
  if (!currentProvider()) return false;
  if (gemShared()) { const q = aiQuotaToday(); if (q && (q.limit - q.used) <= 0) return false; }
  return true;
}
export function practiceErrorsHash(data) { return hashStr(JSON.stringify([data.phonemes, data.words, data.errors])); }
export function practiceErrorsCacheGet() {
  if (MEM_PCACHE) return MEM_PCACHE;
  try { const v = JSON.parse(localStorage.getItem(PRACTICE_ERRORS_CACHE_KEY) || 'null'); if (v && typeof v === 'object') { MEM_PCACHE = v; return v; } } catch (e) {}
  return null;
}
export function practiceErrorsCacheSet(v) {
  MEM_PCACHE = v;
  try { localStorage.setItem(PRACTICE_ERRORS_CACHE_KEY, JSON.stringify(v)); } catch (e) {}
}
export const PRACTICE_ERRORS_SYS = `You are "Tuki", a patient English pronunciation tutor for a Spanish-speaking learner from Colombia. You are given MEASURED data about this learner's real mistakes: their weakest phonemes (with average scores), their worst-scored words, and 1-2 errors from their latest conversation summary or interview (what they said vs. the correct sentence).
Create 6-8 NEW practice exercises using ONLY those measured words, phonemes and errors. Never invent mistakes the learner did not make and never use words outside the given data as the practiced target (other words may appear only as ordinary context around the target).
Return ONLY JSON with this exact shape:
{"items":[{"kind":"speak"|"saypair"|"pick"|"quiz"|"order"|"ltype","uses":"<the measured word, phoneme IPA, or a word from the corrected sentence that this exercise practices>","text":"<English sentence or word to say, hear or order>","es":"<short Spanish meaning or hint, no answer>","pair":["word1","word2"],"q":"<quiz question in English>","opts":["option 1","option 2","option 3"],"a":0}]}
Rules per kind (use each field only for its kind):
- "speak": "text" is a NEW sentence (8-15 words) using a measured word in a different context than the original, or a short dialogue line (1 sentence) using it; "es" is its Spanish meaning. For a single measured word use "text" = the word alone.
- "saypair"/"pick": "pair" is a NEW minimal pair contrasting the weakest phoneme (two real English words that differ in that sound only, e.g. ship/sheep for "ɪ" vs "iː"); "uses" is the phoneme IPA exactly as listed (e.g. "ɪ"); "text" is empty.
- "quiz": "q" asks which option is correct (listening/meaning), "opts" has 3 options, "a" is the index of the correct one; the correct option must contain the "uses" word; "es" is a short Spanish hint without the answer.
- "order": "text" is a NEW sentence (6-10 words) using a measured word, to be rebuilt from shuffled tiles; "es" is its Spanish meaning.
- "ltype": "text" is a sentence (6-10 words) using a measured word, for dictation; "es" is its Spanish meaning.
Include: at least 2 "speak" items, 1 minimal pair ("saypair" or "pick") for the weakest phoneme when one is given, and 1 item built from each summary/interview error when given. Vary the kinds. Everyday situations, no offensive content, no TV shows, movies, books, songs or real people.`;
export function practiceErrorsPrompt(data) {
  const lines = ['Measured data (use ONLY this):'];
  if (data.phonemes.length) lines.push(`Weakest phonemes: ${data.phonemes.map(p => `${p.ipa} (avg ${p.avg}%, ${p.n} samples)`).join(', ')}`);
  if (data.words.length) lines.push(`Worst words: ${data.words.map(w => `"${w.w}" (score ${w.score}${w.note ? `, note: ${w.note}` : ''})`).join(', ')}`);
  if (data.errors.length) lines.push(`Latest errors: ${data.errors.map(e => `said "${e.said}" -> correct "${e.correct}"${e.explain_es ? ` (${e.explain_es})` : ''}`).join(' | ')}`);
  lines.push('Create 6-8 exercises.');
  return lines.join('\n');
}
function practiceErrorsLesson(uses, isPhoneme) {
  if (isPhoneme) { const l = LESSONS.find(x => x.sound && ('/' + x.sound + '/') === uses) || LESSONS.find(x => x.sound && uses.includes(x.sound)); if (l) return l; }
  else {
    const w = String(uses || '').toLowerCase();
    const l = LESSONS.find(x => (x.ex || []).some(e => String(e[0]).toLowerCase() === w)) || LESSONS.find(x => (x.sents || []).some(s => String(s[0]).toLowerCase().includes(w)));
    if (l) return l;
  }
  return LESSONS[0];
}
const _peClean = s => String(s || '').trim().replace(/\s+/g, ' ');
const _peHasToken = (text, tok) => new RegExp('(^|[^a-z])' + String(tok).toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^a-z]|$)').test(String(text || '').toLowerCase());
/* Valida el JSON como tcValidate(): estructura, longitud, sin contenido
   ofensivo; cada ejercicio debe tener tipo válido, objetivo medido ("uses")
   y datos completos. Descarta ítems inválidos; si quedan menos de 3, o si
   cubren menos de 2 objetivos distintos, degrada entero (devuelve null).
   Devuelve ítems PLANOS (solo strings y arrays): la cola del motor se
   construye aparte en practiceErrorsToQueue(), porque los objetos de
   lección son circulares y no se pueden guardar en localStorage, y porque
   startLesson muta la cola con shift() (no debe tocar el caché). */
export function validatePracticeErrors(d, data) {
  if (!d || typeof d !== 'object' || !Array.isArray(d.items)) return null;
  const allowedTokens = new Set(data.words.map(w => w.w.toLowerCase()));
  (data.errors || []).forEach(e => String(e.correct || '').toLowerCase().replace(/[^a-z' ]/g, ' ').split(/\s+/).filter(t => t.length >= 3).forEach(t => allowedTokens.add(t)));
  const allowedPhonemes = new Set(data.phonemes.map(p => p.ipa));
  const BAD = /fuck|shit|bitch|damn|porn|sex|kill|hate you|stupid/i;
  const seen = new Set(), out = [], usesSet = new Set();
  for (const raw of d.items.slice(0, 8)) {
    if (!raw || typeof raw !== 'object') continue;
    const kind = raw.kind, uses = _peClean(raw.uses), es = _peClean(raw.es).slice(0, 160);
    if (!['speak', 'saypair', 'pick', 'quiz', 'order', 'ltype'].includes(kind) || !uses || BAD.test(uses + ' ' + (raw.text || '') + ' ' + (raw.q || ''))) continue;
    const key = kind + '|' + _peClean(raw.text || raw.q || (raw.pair || []).join('/')).toLowerCase();
    if (seen.has(key)) continue;
    if (kind === 'saypair' || kind === 'pick') {
      const pair = Array.isArray(raw.pair) ? raw.pair.map(x => _peClean(x)) : [];
      if (pair.length !== 2 || pair[0].toLowerCase() === pair[1].toLowerCase()) continue;
      if (!pair.every(w => /^[a-z][a-z'-]{1,19}$/.test(w))) continue;
      const usesPh = uses.replace(/\//g, ''); // S.ph guarda la IPA sin barras; la IA puede ponerlas
      if (!allowedPhonemes.has(usesPh)) continue;
      const lv = lev(pair[0].toLowerCase(), pair[1].toLowerCase());
      if (lv < 1 || lv > 4) continue; // par mínimo creíble: difiere en 1-4 letras
      seen.add(key); usesSet.add(usesPh);
      out.push({ kind, uses: usesPh, pair: [pair[0], pair[1]] });
      continue;
    }
    if (!allowedTokens.has(uses.toLowerCase())) continue;
    if (kind === 'quiz') {
      const q = _peClean(raw.q).slice(0, 160);
      const opts = Array.isArray(raw.opts) ? raw.opts.map(x => _peClean(x)).filter(x => x && x.length <= 60) : [];
      const a = Number.isInteger(raw.a) ? raw.a : -1;
      if (!q || opts.length < 2 || opts.length > 4 || a < 0 || a >= opts.length) continue;
      if (new Set(opts.map(o => o.toLowerCase())).size !== opts.length) continue;
      if (!_peHasToken(opts[a], uses)) continue;
      seen.add(key); usesSet.add(uses.toLowerCase());
      out.push({ kind: 'quiz', uses: uses.toLowerCase(), q, opts: [...opts], a, es });
      continue;
    }
    const text = _peClean(raw.text).slice(0, 140);
    if (!text || BAD.test(text)) continue;
    if (kind === 'speak') {
      const single = !/\s/.test(text);
      if (single && text.length > 30) continue;
      if (!single && (text.split(/\s+/).length < 3 || text.split(/\s+/).length > 18)) continue;
      if (!_peHasToken(text, uses)) continue;
      seen.add(key); usesSet.add(uses.toLowerCase());
      out.push({ kind: 'speak', uses: uses.toLowerCase(), text, es, single });
    } else if (kind === 'order' || kind === 'ltype') {
      const n = text.split(/\s+/).length;
      if (n < 4 || n > 12) continue;
      if (!_peHasToken(text, uses)) continue;
      seen.add(key); usesSet.add(uses.toLowerCase());
      out.push({ kind, uses: uses.toLowerCase(), text, es });
    }
  }
  if (out.length < 3 || usesSet.size < 2) return null;
  return out.slice(0, 8);
}
/* Ítems planos validados -> cola del motor (tipos que startLesson ya
   ejecuta; la lección se busca por fonema o por palabra, con LESSONS[0]
   como respaldo). Crea objetos nuevos cada vez: startLesson muta la cola
   y nunca debe tocar los ítems cacheados. */
export function practiceErrorsToQueue(items) {
  const pool = (items || []).filter(x => x.text).map(x => x.text);
  return (items || []).map(it => {
    if (it.kind === 'saypair' || it.kind === 'pick') return { kind: it.kind, l: practiceErrorsLesson('/' + it.uses + '/', true), pair: [...it.pair], side: Math.random() < .5 ? 0 : 1 };
    if (it.kind === 'quiz') return { kind: 'quiz', l: practiceErrorsLesson(it.uses, false), q: { q: it.q, opts: [...it.opts], a: it.a, say: it.opts[it.a], expl: it.es || undefined } };
    if (it.kind === 'order') return { kind: 'order', l: practiceErrorsLesson(it.uses, false), text: it.text, es: it.es, pool: pool.length > 1 ? [...pool] : [it.text] };
    if (it.kind === 'ltype') return { kind: 'ltype', l: practiceErrorsLesson(it.uses, false), text: it.text, es: it.es };
    return { kind: 'speak', variant: it.single ? 'word' : 'sentence', l: practiceErrorsLesson(it.uses, false), text: it.text, es: it.es };
  });
}
export async function generatePracticeErrors(data) {
  const day = dayKey(), hash = practiceErrorsHash(data);
  const cached = practiceErrorsCacheGet();
  if (cached && cached.day === day) {
    if (Array.isArray(cached.items) && cached.items.length >= 3) return { queue: practiceErrorsToQueue(cached.items), fromCache: true };
    return { queue: null, attempted: true }; // ya se intentó hoy: tope duro de 1/día
  }
  let items = null;
  try {
    const d = await aiJSON(PRACTICE_ERRORS_SYS, practiceErrorsPrompt(data), 4000);
    items = validatePracticeErrors(d, data);
  } catch (e) { items = null; }
  // (el intento cuenta como la llamada del día aunque falle o el JSON no
  // valide: el servidor reembolsa los fallos aguas arriba, pero el cliente
  // no reintenta hoy para respetar el tope de 1/día)
  practiceErrorsCacheSet({ day, hash, items });
  return { queue: items ? practiceErrorsToQueue(items) : null, fromCache: false };
}
export async function startPracticeErrors() {
  const data = practiceErrorsData();
  const fallback = () => { const q = buildTopErrorsPractice(); if (q.length) startLesson(null, 'practice', q, '🎯 Refuerzo: Top 5 Errores'); else toast('No hay errores críticos registrados.'); };
  if (!practiceErrorsHasData(data) || !practiceErrorsAIAvailable()) return fallback();
  let closeLoading = null;
  modal(`<div style="text-align:center"><div class="spinner"></div><h2 style="margin:6px 0">🎯 Practica mis errores</h2><p class="small muted">Tuki está creando ejercicios nuevos con tus errores…</p></div>`, (el, close) => { closeLoading = close; });
  const res = await generatePracticeErrors(data);
  if (closeLoading) closeLoading();
  if (res.queue && res.queue.length >= 3) {
    startLesson(null, 'practice', res.queue, '🎯 Practica mis errores');
    if (!res.fromCache) toast('✨ ' + res.queue.length + ' ejercicios nuevos con tus errores', 2500);
  } else fallback();
}

export const numHash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h; };
export const SENIORITY = { intern: ['Practicante / pasantía', 'internship'], junior: ['Junior', 'junior'], mid: ['Semi-senior', 'mid-level'], senior: ['Senior', 'senior'], lead: ['Líder / gerente', 'lead / manager'] };
export const IV_END = /end of the interview/i;
Object.defineProperty(SCENARIOS, '__iv', { enumerable: true, get: () => { const iv = CHAT.iv || {}; return `a professional recruiter conducting a job interview in English for a ${(SENIORITY[iv.sen] || SENIORITY.junior)[1]} ${iv.role || 'office job'} position` } });
Object.defineProperty(SCENARIOS, '__ch', { enumerable: true, get: () => `a friendly conversation partner for today's 5-minute speaking challenge about: ${todayTopic().en}` });
SCEN_ES.__iv = '🧑‍💼 Simulador de entrevista'; SCEN_ES.__ch = '⏱️ Reto diario de 5 min';
export function modeRules() {
  if (CHAT.scen === '__iv' && CHAT.iv) { const n = CHAT.iv.n; return `\nJOB INTERVIEW SIMULATOR (most important rules): You are the recruiter. The job: ${(SENIORITY[CHAT.iv.sen] || SENIORITY.junior)[1]} ${CHAT.iv.role}. Ask EXACTLY ${n} interview questions in total, ONE question per turn. Start with a very short greeting and question 1 ("Tell me about yourself" style). Then mix experience, behavioral (STAR), role-specific, motivation and a final closing question. Do not answer for the candidate. Keep any correction to one short line so the interview flows. After the candidate answers question ${n}, thank them in one sentence and then say exactly: "That's the end of the interview. Thank you!" Never ask more than ${n} questions.`; }
  if (CHAT.scen === '__ch') return `\nDAILY 5-MINUTE SPEAKING CHALLENGE: Today's topic is "${todayTopic().en}". Keep the learner talking about this topic: ask one open, interesting follow-up question per turn, react briefly to what they say and keep your own turns short (the learner should speak most of the time).`;
  return '';
}
const _chatSystem24 = chatSystem; chatSystem = function () { return _chatSystem24() + modeRules(); };
const _liveSystem24 = liveSystem; liveSystem = function () { return _liveSystem24() + modeRules(); };

export const TOPICS = {
  A2: ['Your favorite food and how to cook it|Tu comida favorita y cómo prepararla', 'Your family and your home|Tu familia y tu casa', 'A normal day in your life|Un día normal en tu vida', 'Your best friend|Tu mejor amigo o amiga', 'Your favorite place in your city|Tu lugar favorito en tu ciudad', 'What you did last weekend|Qué hiciste el fin de semana pasado', 'Your pets or an animal you like|Tus mascotas o un animal que te guste', 'Your favorite music and singers|Tu música y cantantes favoritos', 'The weather today and your favorite season|El clima de hoy y tu estación favorita', 'Shopping for clothes|Comprar ropa', 'Your plans for next weekend|Tus planes para el próximo fin de semana', 'Your favorite movie or series|Tu película o serie favorita', 'Sports you like to watch or play|Deportes que te gusta ver o practicar', 'Your breakfast and your eating habits|Tu desayuno y tus hábitos de comida', 'Your job or your studies|Tu trabajo o tus estudios', 'A birthday party you remember|Una fiesta de cumpleaños que recuerdes', 'How you go to work or school|Cómo vas al trabajo o a estudiar', 'Your dream vacation|Tus vacaciones soñadas', 'Colombian food for a tourist|Comida colombiana para un turista', 'Your hobbies and free time|Tus pasatiempos y tiempo libre', 'Your phone and your favorite apps|Tu celular y tus apps favoritas', 'A restaurant you like|Un restaurante que te guste', 'Your childhood|Tu infancia', 'Your neighborhood|Tu barrio'],
  B1: ['A trip that changed you|Un viaje que te cambió', 'The best advice you ever received|El mejor consejo que has recibido', 'Working from home vs. working in an office|Trabajar desde casa vs. en una oficina', 'How to stay healthy|Cómo mantenerte saludable', 'A skill you want to learn this year|Una habilidad que quieres aprender este año', 'Your city: problems and solutions|Tu ciudad: problemas y soluciones', 'Social media: good or bad?|Redes sociales: ¿buenas o malas?', 'A difficult moment and how you solved it|Un momento difícil y cómo lo resolviste', 'Traditions and festivals in Colombia|Tradiciones y festivales en Colombia', 'Your ideal job|Tu trabajo ideal', 'Why you are learning English|Por qué estás aprendiendo inglés', 'A book, podcast or video you recommend|Un libro, pódcast o video que recomiendas', 'Saving money: tips and habits|Ahorrar dinero: consejos y hábitos', 'Public transport in your city|El transporte público en tu ciudad', 'A person you admire|Una persona que admiras', 'Cooking at home vs. eating out|Cocinar en casa vs. comer afuera', 'Your goals for the next five years|Tus metas para los próximos cinco años', 'The perfect weekend|El fin de semana perfecto', 'Learning from mistakes|Aprender de los errores', 'Technology in your daily life|La tecnología en tu vida diaria', 'Living in a big city or a small town|Vivir en una ciudad grande o en un pueblo', 'Music that reminds you of something|Música que te recuerda algo', 'Your first job or first day at school|Tu primer trabajo o primer día de clases', 'Coffee culture|La cultura del café'],
  B2: ['Should university be free for everyone?|¿La universidad debería ser gratis para todos?', 'The impact of artificial intelligence on jobs|El impacto de la inteligencia artificial en el empleo', 'Remote work and work-life balance|Trabajo remoto y equilibrio vida-trabajo', 'Tourism: benefits and problems|Turismo: beneficios y problemas', 'Climate change in your country|El cambio climático en tu país', 'Is it better to rent or to buy a home?|¿Es mejor arrendar o comprar vivienda?', 'How social media affects mental health|Cómo las redes sociales afectan la salud mental', 'The role of sports in society|El papel del deporte en la sociedad', 'Fast fashion and consumerism|La moda rápida y el consumismo', 'What makes a good leader|Qué hace a un buen líder', 'Learning languages as an adult|Aprender idiomas de adulto', 'The future of cities and transport|El futuro de las ciudades y el transporte', 'Entrepreneurship: risks and rewards|Emprender: riesgos y recompensas', 'Privacy in the digital age|La privacidad en la era digital', 'Street food and food culture|La comida callejera y la cultura gastronómica', 'Should kids have smartphones?|¿Los niños deberían tener celular?', 'Volunteering and helping your community|El voluntariado y ayudar a tu comunidad', 'The four-day work week|La semana laboral de cuatro días', 'Streaming vs. going to the cinema|Streaming vs. ir al cine', 'Moving abroad for work|Irse a otro país a trabajar', 'Healthy habits that are hard to keep|Hábitos saludables difíciles de mantener', 'The value of failure|El valor del fracaso', 'Music festivals and live events|Festivales de música y eventos en vivo', 'Online learning vs. classroom learning|Aprender en línea vs. en el aula'],
  C1: ['Universal basic income: utopia or necessity?|Ingreso básico universal: ¿utopía o necesidad?', 'Ethics of artificial intelligence|La ética de la inteligencia artificial', 'Globalization and local cultures|La globalización y las culturas locales', 'Should voting be mandatory?|¿El voto debería ser obligatorio?', 'The attention economy|La economía de la atención', 'Meritocracy: myth or reality?|La meritocracia: ¿mito o realidad?', 'Space exploration: worth the cost?|La exploración espacial: ¿vale la pena el costo?', 'Cancel culture and free speech|La cultura de la cancelación y la libertad de expresión', 'Balancing economic growth and the environment|Equilibrar crecimiento económico y medio ambiente', 'The future of work after automation|El futuro del trabajo tras la automatización', 'Urbanization and inequality in Latin America|Urbanización y desigualdad en América Latina', 'How history is taught in schools|Cómo se enseña la historia en los colegios', 'Personal data as a currency|Los datos personales como moneda', 'The role of art in society|El papel del arte en la sociedad', 'Genetic engineering and designer babies|Ingeniería genética y bebés de diseño', 'Is happiness a choice?|¿La felicidad es una elección?', 'Brain drain: talent leaving the country|Fuga de cerebros: el talento que se va del país', 'Misinformation and how to fight it|La desinformación y cómo combatirla', 'The ethics of eating meat|La ética de comer carne', 'Cryptocurrencies and the future of money|Las criptomonedas y el futuro del dinero', 'Leadership lessons from failure|Lecciones de liderazgo a partir del fracaso', 'Tradition vs. progress|Tradición vs. progreso', 'Should museums return artifacts?|¿Los museos deberían devolver objetos históricos?', 'Living a minimalist life|Vivir una vida minimalista']
};
export function todayTopic(day) { const lv = chatLevel(), pool = TOPICS[lv] || TOPICS.B1, k = day || dayKey(), i = numHash('tuki-ch-' + k + '-' + lv) % pool.length; const [en, es] = pool[i].split('|'); return { en, es, lv }; }
export const chSecs = () => window.__challengeSecs || 300;

export function enterMode(scen, voice) {
  if (LIVE.on) stopLive(true);
  if (TAB === 'chat' && CHAT.scen !== '__iv' && CHAT.scen !== '__ch') endConversation('switch');
  CHAT.scen = scen; resetChat(); closeWordPop();
  if (TAB !== 'chat') go('chat'); else render();
  if (!currentProvider()) return;
  if (voice) startLive(); else { chatDraw(); chatSend('(Start the roleplay now with a short friendly greeting and a first question.)', true); }
}
export function leaveMode() { clearInterval(CHAT.timer); CHAT.timer = null; CHAT.scen = 'free'; CHAT.iv = null; CHAT.ch = null; resetChat(); if (TAB === 'chat') render(); }
export function interviewSetup() {
  if (!currentProvider()) { toast('El simulador necesita una clave de Gemini (gratis) u OpenAI en Ajustes.', 3500); return go('settings'); }
  const last = S.settings.ivLast || {}, lv = chatLevel();
  modal(`<h2>🧑‍💼 Simulador de entrevista</h2><p class="small muted">Tuki hará de reclutador y al final recibirás un informe en español con puntaje y mejores respuestas.</p>
    <label class="small"><b>Cargo o industria</b></label><input class="field" id="ivRole" maxlength="80" placeholder="Ej.: desarrollador frontend, enfermera, ventas…" value="${esc(last.role || '')}">
    <div class="ivgrid"><div><label class="small"><b>Nivel del cargo</b></label><select class="field" id="ivSen">${Object.entries(SENIORITY).map(([k, v]) => `<option value="${k}" ${k === (last.sen || 'junior') ? 'selected' : ''}>${v[0]}</option>`).join('')}</select></div>
    <div><label class="small"><b>Tu inglés</b></label><select class="field" id="ivLv">${LEVEL_KEYS.map(k => `<option value="${k}" ${k === lv ? 'selected' : ''}>${LEVELS[k].label}</option>`).join('')}</select></div></div>
    <label class="small"><b>Número de preguntas</b></label><div class="chips" id="ivN">${[5, 8, 12].map(n => `<button class="chip ${n === (last.n || 5) ? 'active' : ''}" data-n="${n}">${n} preguntas</button>`).join('')}</div>
    <label class="small"><b>Modo</b></label><div class="chips" id="ivMode"><button class="chip ${last.voice !== false ? 'active' : ''}" data-v="1">🎙️ Voz en vivo</button><button class="chip ${last.voice === false ? 'active' : ''}" data-v="0">⌨️ Texto</button></div>
    <div class="row" style="margin-top:14px"><button class="btn ghost block" data-x>Cancelar</button><button class="btn primary block" id="ivGo">Empezar entrevista</button></div>`, (el, close) => {
    $('[data-x]', el).onclick = () => { close(); if (TAB === 'chat') render(); };
    $$('#ivN .chip, #ivMode .chip', el).forEach(c => c.onclick = () => { $$('.chip', c.parentElement).forEach(x => x.classList.remove('active')); c.classList.add('active'); });
    $('#ivGo', el).onclick = () => {
      const role = $('#ivRole', el).value.trim(); if (!role) { $('#ivRole', el).focus(); return toast('Escribe el cargo o la industria.'); }
      const iv = { role, sen: $('#ivSen', el).value, n: +$('#ivN .active', el).dataset.n, voice: $('#ivMode .active', el).dataset.v === '1', level: $('#ivLv', el).value, t0: Date.now() };
      S.settings.ivLast = { role: iv.role, sen: iv.sen, n: iv.n, voice: iv.voice }; S.settings.chatLevel = iv.level; save(); close();
      CHAT.iv = iv; CHAT.ivEnding = false; enterMode('__iv', iv.voice);
    };
  });
}
export function ivQuestion() { if (!CHAT.iv) return 0; const q = CHAT.hist.filter(m => m.role === 'model' && !m.hidden && m.text.trim()).length; return Math.max(1, Math.min(CHAT.iv.n, q)); }
export async function reportInterview(iv, msgs) {
  const sys = `You are an expert career coach and English teacher. Evaluate a job interview practice in English by a Spanish-speaking learner from Colombia (English level ${iv.level}) for a ${(SENIORITY[iv.sen] || SENIORITY.junior)[1]} ${iv.role} position. The candidate's lines come from speech-to-text.
Return ONLY JSON: {"overall":0-100,"summary_es":"2-3 sentences in Spanish","questions":[{"q":"the recruiter's question (English)","answer_summary":"short summary of what the candidate said (English)","score":0-100,"feedback_es":"specific feedback in Spanish: content + English","better":"a stronger sample answer in natural English, 2-4 sentences, adapted to level ${iv.level}"}],"common_mistakes":[{"said":"candidate quote","correct":"correct English","explain_es":"short explanation in Spanish"}],"tips_es":["tip","tip"]}
Include one item per recruiter question that the candidate answered (max ${iv.n}). Max 6 common_mistakes, 2-3 tips. Use "tú" in Spanish.`;
  const data = await aiJSON(sys, 'Interview transcript:\n' + convoTranscript(msgs), 6000);
  const d = { overall: clamp100(data.overall), summary_es: String(data.summary_es || ''), questions: (data.questions || []).filter(q => q && q.q).slice(0, iv.n).map(q => ({ q: String(q.q), answer_summary: String(q.answer_summary || ''), score: clamp100(q.score), feedback_es: String(q.feedback_es || ''), better: String(q.better || '') })), common_mistakes: (data.common_mistakes || []).filter(m => m && m.correct).slice(0, 6), tips_es: (data.tips_es || []).slice(0, 3).map(String) };
  const added = addLearnItems(d.common_mistakes.map(m => ({ en: m.correct, es: m.explain_es, kind: 'frase' })), 'interview');
  const rec = { id: uid(), ts: Date.now(), date: dayKey(), role: iv.role, sen: iv.sen, n: iv.n, level: iv.level, voice: iv.voice, added, data: d };
  S.interviews.unshift(rec); S.interviews = S.interviews.slice(0, 30); addXP(10); save(); checkBadges(); return rec;
}
export function interviewHTML(rec) {
  const d = rec.data;
  return `<div class="sumcard"><div class="row between"><h2 style="margin:0">🧑‍💼 Informe de entrevista</h2><div class="sumscore">${d.overall}</div></div>
    <div class="small muted">${esc(rec.role)} · ${esc((SENIORITY[rec.sen] || SENIORITY.junior)[0])} · ${rec.n} preguntas · ${esc(rec.date)}</div>
    ${d.summary_es ? `<p>${esc(d.summary_es)}</p>` : ''}
    ${d.questions.map((q, i) => `<div class="ivq"><div class="row between"><b>Pregunta ${i + 1}</b><span class="pill ${q.score >= 80 ? 'ok' : q.score >= 60 ? 'mid' : 'low'}">${q.score}</span></div>
      <div class="small" data-ctx="${esc(q.q)}">❓ ${tapWords(q.q)} ${sayBtns(q.q)}</div>${q.answer_summary ? `<div class="small muted">🗣️ ${esc(q.answer_summary)}</div>` : ''}
      <div class="small">💡 ${esc(q.feedback_es)}</div>${q.better ? `<div class="better" data-ctx="${esc(q.better)}"><div class="small"><b>Respuesta más fuerte:</b></div>${tapWords(q.better)} ${sayBtns(q.better)}</div>` : ''}</div>`).join('')}
    ${d.common_mistakes.length ? `<h3>✏️ Errores comunes</h3>${d.common_mistakes.map(m => `<div class="mist" data-ctx="${esc(m.correct)}"><div class="said">✗ ${esc(m.said || '')}</div><div class="good">✓ ${tapWords(m.correct)} ${sayBtns(m.correct)}</div><div class="small">💡 ${esc(m.explain_es || '')}</div></div>`).join('')}` : ''}
    ${d.tips_es.length ? `<h3>🎯 Consejos</h3><ul class="small">${d.tips_es.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
    ${rec.added ? `<div class="tipbox small">🃏 Se agregaron <b>${rec.added}</b> frases corregidas a tus tarjetas.</div>` : ''}</div>`;
}
export function openInterviewSheet(p) {
  modal(`<div id="ivBody"><div class="sumcard"><h2>🧑‍💼 Informe de entrevista</h2><div class="spinner"></div><p class="small muted" style="text-align:center">Evaluando tus respuestas…</p></div></div><div class="row" style="margin-top:10px"><button class="btn ghost block" data-x>Cerrar</button><button class="btn primary block" id="ivAgain">🔁 Otra entrevista</button></div>`, (el, close) => {
    el.closest('.overlay').classList.add('sumsheet'); $('[data-x]', el).onclick = close; $('#ivAgain', el).onclick = () => { close(); interviewSetup(); };
    const show = rec => { $('#ivBody', el).innerHTML = interviewHTML(rec); bindSayTap(el); };
    if (p && p.then) p.then(show).catch(e => { $('#ivBody', el).innerHTML = `<div class="sumcard"><h2>🧑‍💼 Informe</h2><div class="msg err">⚠️ No se pudo generar el informe: ${esc(errES(e))}</div></div>`; }); else show(p);
  });
}
export function finishInterview(msgs, userTurns) {
  const iv = CHAT.iv; clearTimeout(CHAT.ivT); leaveMode();
  if (!iv || userTurns < 1) return toast('Entrevista cancelada.');
  openInterviewSheet(reportInterview(iv, msgs));
}
export function challengeSetup() {
  if (!currentProvider()) { toast('El reto usa la conversación con IA: agrega una clave gratuita de Gemini en Ajustes.', 3500); return go('settings'); }
  const t = todayTopic(), done = S.challenges[dayKey()];
  modal(`<h2>⏱️ Reto diario de 5 minutos</h2><p class="small muted">${done ? '✅ Ya completaste el reto de hoy. ¡Puedes repetirlo!' : 'Habla 5 minutos sobre el tema del día. Al final recibes un resumen y +20 XP.'}</p>
    <div class="topic"><div class="small muted">Tema de hoy · ${LEVELS[t.lv].label}</div><div style="font-size:20px;font-weight:800" data-ctx="${esc(t.en)}">${tapWords(t.en)} ${sayBtns(t.en)}</div><div class="small">${esc(t.es)}</div></div>
    <div class="row" style="margin-top:14px"><button class="btn ghost block" id="chText">⌨️ Texto</button><button class="btn primary block" id="chVoice">🎙️ Voz en vivo</button></div><button class="btn ghost block" data-x style="margin-top:8px">Cancelar</button>`, (el, close) => {
    bindSayTap(el); $('[data-x]', el).onclick = close;
    const go2 = voice => { close(); CHAT.ch = { t0: Date.now(), secs: chSecs(), day: dayKey(), topic: t, voice, finished: false }; enterMode('__ch', voice); startChTimer(); };
    $('#chText', el).onclick = () => go2(false); $('#chVoice', el).onclick = () => go2(true);
  });
}
export function chLeft() { const c = CHAT.ch; return c ? Math.max(0, c.secs - Math.floor((Date.now() - c.t0) / 1000)) : 0; }
export function startChTimer() {
  clearInterval(CHAT.timer);
  CHAT.timer = setInterval(() => {
    if (!CHAT.ch) return clearInterval(CHAT.timer);
    const left = chLeft(), el = $('#chClock'); if (el) el.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
    if (left <= 0 && !CHAT.ch.finished) { CHAT.ch.finished = true; clearInterval(CHAT.timer); toast('⏱️ ¡Tiempo! Reto completado 🎉', 3000); if (LIVE.on) stopLive(); else endConversation('timer'); }
  }, 250);
}
export function finishChallenge(msgs, userTurns, wasLive) {
  const ch = CHAT.ch; if (!ch) return leaveMode();
  const complete = (ch.finished || Date.now() - ch.t0 >= ch.secs * 1000) && userTurns >= 1; leaveMode();
  if (!complete) return toast(userTurns ? '⏹ Reto sin terminar: complétalo los 5 minutos para ganar el bonus.' : 'Reto cancelado.', 3500);
  const first = !S.challenges[ch.day];
  S.challenges[ch.day] = { topic: ch.topic.en, ts: Date.now(), turns: userTurns, live: wasLive, secs: ch.secs };
  if (first) addXP(20); save(); checkBadges();
  toast(first ? '🏆 ¡Reto diario completado! +20 XP' : '🏆 ¡Reto completado otra vez!', 3000);
  if (currentProvider()) openSummarySheet(summarizeConvo(msgs, { title: 'Reto: ' + ch.topic.en, mode: 'challenge', live: wasLive }), 'Reto diario');
}
export function chStreak() { let n = 0; const d = new Date(); for (;;) { const k = dayKey(d); if (!S.challenges[k]) { if (n === 0 && k === dayKey()) { d.setDate(d.getDate() - 1); continue; } break; } n++; d.setDate(d.getDate() - 1); } return n; }

/* Chat: barra del modo, Nueva, escenario especial, detección del fin de la entrevista */
const _chatDraw24 = chatDraw;
chatDraw = function (keepScroll) {
  _chatDraw24(keepScroll);
  if (CHAT.scen === '__iv' && CHAT.iv) {
    const k = $('#ivK'); if (k) k.textContent = `Pregunta ${ivQuestion()}/${CHAT.iv.n}`;
    const lastM = [...CHAT.hist].reverse().find(m => m.role === 'model');
    if (lastM && IV_END.test(lastM.text) && !CHAT.ivEnding) { CHAT.ivEnding = true; toast('✅ Entrevista terminada: preparando tu informe…', 2500); CHAT.ivT = setTimeout(() => { if (CHAT.scen !== '__iv') return; if (LIVE.on) stopLive(); else endConversation('ivend'); }, window.__ivEndDelay != null ? window.__ivEndDelay : 3500); }
  }
};
