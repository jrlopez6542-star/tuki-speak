// src/audio.js - Fase 3, modulo 3: audio y voces (TTS, reconocimiento, captura, Azure, pitch).
// speak y pickVoice tienen varias versiones en el original (dispositivo, nube,
// wrapper decodeEnt): todas viven aqui, en el mismo orden, asi la reasignacion
// es legal dentro de este modulo. beep/AC/fanfarrias NO se movieron: beep se
// reasigna dos veces en main.js (vibracion y micro-interacciones) y AC se
// comparte con esos wrappers, asi que no pueden importarse como solo lectura.
// audio.js importa de main.js (circular, como state.js) solo nombres usados
// dentro de funciones, nunca en top-level: azFetch, httpErr, errES, toast,
// azureReady (declaraciones con hoisting / consts nunca reasignadas).
import { S } from './state.js';
import { TukiDB } from './tuki-db.js';
import { charSim, colorOf, avg, clamp, decodeEnt, hashStr } from './utils.js';
import { azFetch, httpErr, errES, toast, azureReady } from './main.js';

/* =================== AUDIO: TTS + BEEPS (dispositivo) =================== */
export let VOICES = [];
export function loadVoices() { if (!('speechSynthesis' in window)) return; VOICES = speechSynthesis.getVoices().filter(v => /^en[-_]/i.test(v.lang)); }
if ('speechSynthesis' in window) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
export function pickVoice() {
  if (S.settings.voice) { const v = VOICES.find(v => v.name === S.settings.voice); if (v) return v; }
  const us = VOICES.filter(v => /en[-_]US/i.test(v.lang));
  return us.find(v => /natural|neural|online/i.test(v.name))
    || us.find(v => /Google/i.test(v.name))
    || us.find(v => /Samantha|Aria|Jenny|Natural/i.test(v.name))
    || us.find(v => !/desktop|espeak/i.test(v.name))
    || us[0] || VOICES[0] || null;
}
export function speak(text, slow = false, onend) {
  if (!('speechSynthesis' in window)) { toast('Tu navegador no tiene voz (speechSynthesis).'); return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US'; const v = pickVoice(); if (v) u.voice = v;
  u.rate = slow ? Math.max(0.4, S.settings.rate * 0.6) : S.settings.rate;
  if (onend) u.onend = onend;
  speechSynthesis.speak(u);
}

/* =================== RECONOCIMIENTO DE VOZ =================== */
/* =================== RECONOCIMIENTO DE VOZ =================== */
export const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
export const HAS_SR = !!SR;
export let curRec = null;
export function recognize(onHeard) {
  return new Promise((resolve, reject) => {
    if (!HAS_SR) return reject('unsupported');
    let r; try { r = new SR(); } catch (e) { return reject('unsupported'); }
    r.lang = 'en-US'; r.interimResults = false; r.maxAlternatives = 5; r.continuous = false;
    let got = null, err = null;
    r.onresult = e => { const res = e.results[0]; got = [...res].map(a => ({ t: (a.transcript || '').trim(), c: a.confidence || 0 })).filter(a => a.t); if (got.length && onHeard) onHeard(); };
    r.onerror = e => { err = e.error; };
    r.onend = () => { curRec = null; if (got && got.length) resolve(got); else reject(err || 'no-speech'); };
    try { r.start(); curRec = r; } catch (e) { reject('busy'); }
    setTimeout(() => { try { r.stop(); } catch (e) {} }, 12000);
  });
}
export function stopRecognize() { try { curRec && curRec.stop(); } catch (e) {} }
// main.js asigna curRec en la escucha en vivo (lineas ~4354): los imports son
// de solo lectura, asi que esa asignacion va por este setter.
export function setCurRec(r) { curRec = r; }
export const SR_ERR = { 'not-allowed': 'Permiso de micrófono denegado. Actívalo en el candado de la barra de direcciones.', 'service-not-allowed': 'El reconocimiento de voz no está permitido aquí (usa Chrome con https o localhost).', 'no-speech': 'No te escuché. Toca el micrófono y habla claro, cerca del teléfono.', 'audio-capture': 'No se encontró micrófono.', 'network': 'El reconocimiento de voz de Chrome necesita internet.', 'unsupported': 'Tu navegador no soporta reconocimiento de voz.', 'aborted': 'Grabación cancelada.', 'busy': 'El micrófono está ocupado, intenta de nuevo.' };
/* ---- M03 PR 6.2: ¿el error es un rechazo de permiso de micrófono? ----
   Cubre el código de error de Web Speech API ('not-allowed', cadena que
   rechaza recognize()) y la DOMException de getUserMedia/MicCap
   (name 'NotAllowedError'). Se usa en doMic y en azureMic para derivar
   a la misma rama degradada (D-M03-5). */
export const isMicPermErr = e => e === 'not-allowed' || !!(e && (e.name === 'NotAllowedError' || e.code === 'not-allowed'));

/* ---- grabación (MediaRecorder) para comparar ---- */
export const Rec = {
  supported: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder),
  mr: null, stream: null, chunks: [], url: null,
  async start() {
    if (!this.supported) throw new Error('unsupported');
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 } });
    this.chunks = []; this.mr = new MediaRecorder(this.stream);
    this.mr.ondataavailable = e => { if (e.data && e.data.size) this.chunks.push(e.data); };
    this.mr.start();
  },
  stop() {
    return new Promise(res => {
      if (!this.mr || this.mr.state === 'inactive') return res(this.url);
      this.mr.onstop = () => {
        const blob = new Blob(this.chunks, { type: this.mr.mimeType || 'audio/webm' });
        if (this.url) URL.revokeObjectURL(this.url);
        this.url = blob.size ? URL.createObjectURL(blob) : null;
        this.stream && this.stream.getTracks().forEach(t => t.stop());
        res(this.url);
      };
      this.mr.stop();
    });
  },
  play(url = this.url) { if (url) { speechSynthesis && speechSynthesis.cancel(); new Audio(url).play().catch(() => toast('No se pudo reproducir la grabación.')); } }
};

/* ---- vibrate / canSpeak ---- */
export const canSpeak = () => HAS_SR || (azureReady() && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia));
export function vibrate(p) { if (S.settings.haptics && navigator.vibrate) try { navigator.vibrate(p); } catch (e) {} }

/* =================== VOZ (TTS): dispositivo, Azure u OpenAI =================== */
/* =================== VOZ (TTS): dispositivo, Azure u OpenAI =================== */
export const AZ_VOICES = ['en-US-JennyNeural', 'en-US-AriaNeural', 'en-US-AvaNeural', 'en-US-EmmaNeural', 'en-US-GuyNeural', 'en-US-AndrewNeural', 'en-GB-SoniaNeural', 'en-GB-LibbyNeural', 'en-GB-RyanNeural'];
export const OA_VOICES = ['marin', 'cedar', 'alloy', 'ash', 'ballad', 'coral', 'echo', 'sage', 'shimmer', 'verse'];
export const GEM_VOICES = ['Kore', 'Puck', 'Charon', 'Aoede', 'Fenrir', 'Leda', 'Orus', 'Zephyr'];
export const TTS = { audio: null, seq: 0, cache: new Map(), warned: false };
/* v2.9 «Voz de Tuki»: voz elegida por idioma: 'az:<ShortName>' (Azure) · 'dev:<nombre>' (teléfono) · '' (automática) */
export const tvPref = tl => { const v = tl === 'es' ? S.settings.tukiVoiceEs : S.settings.tukiVoiceEn; return typeof v === 'string' ? v : ''; };
export const AZ_NAME_RE = /^[a-z]{2,3}-[A-Z]{2,3}-[A-Za-z]+Neural$/;
export function ttsEngineFor(tl) {
  const s = S.settings, p = tvPref(tl);
  if (p.startsWith('az:') && AZ_NAME_RE.test(p.slice(3))) return azureReady() ? 'azure' : 'device';
  if (p.startsWith('dev:')) return 'device';
  if (s.ttsEngine === 'openai' && s.openaiKey) return 'openai';
  if (s.ttsEngine === 'device') return 'device';
  if (s.ttsEngine === 'azure') return azureReady() ? 'azure' : 'device';
  return azureReady() ? 'azure' : 'device';
}
export function azVoiceFor(tl) {
  const s = S.settings, p = tvPref(tl);
  if (p.startsWith('az:') && AZ_NAME_RE.test(p.slice(3))) return p.slice(3);
  const d = tl === 'es' ? s.azureVoiceEs : s.azureVoice; return AZ_NAME_RE.test(d || '') ? d : (tl === 'es' ? 'es-CO-SalomeNeural' : 'en-US-JennyNeural');
}
pickVoice = function () {
  { const p = tvPref('en'); if (p.startsWith('dev:')) { const v = VOICES.find(v => v.name === p.slice(4)); if (v) return v; } }
  if (S.settings.voice) { const v = VOICES.find(v => v.name === S.settings.voice); if (v) return v; }
  const acc = (S.settings.accent || 'en-US').toLowerCase();
  const sc = v => (v.lang.replace('_', '-').toLowerCase().startsWith(acc) ? 50 : 0)
    + (/natural|neural|online|premium|enhanced/i.test(v.name) ? 35 : 0)
    + (/Google/i.test(v.name) ? 25 : 0)
    + (/Samantha|Ava|Aria|Jenny|Allison|Serena|Libby|Sonia|Daniel|Karen|Moira/i.test(v.name) ? 15 : 0)
    - (/desktop|espeak|robotic/i.test(v.name) ? 40 : 0);
  return VOICES.slice().sort((a, b) => sc(b) - sc(a))[0] || null;
};
const _deviceSpeak = speak;
export function stopAudio() { TTS.seq++; if (TTS.audio) { try { TTS.audio.pause(); } catch (e) {} TTS.audio = null; } }
export function cloudTTSReady(tl) { return ttsEngineFor(tl) !== 'device'; }
export async function azureTTS(text, rate, tl, voiceName) {
  const s = S.settings, voice = voiceName && AZ_NAME_RE.test(voiceName) ? voiceName : azVoiceFor(tl), lang = voice.split('-').slice(0, 2).join('-');
  const x = t => t.replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${lang}"><voice name="${voice}"><prosody rate="${Math.round((rate - 1) * 100)}%">${x(text)}</prosody></voice></speak>`;
  const res = await azFetch('tts.speech.microsoft.com', '/cognitiveservices/v1', { method: 'POST', headers: { 'Content-Type': 'application/ssml+xml', 'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3' }, body: ssml });
  if (!res.ok) throw await httpErr(res);
  return await res.blob();
}
export async function openaiTTS(text, rate, tl) {
  const s = S.settings, gb = (s.accent || '').startsWith('en-GB');
  const res = await fetch('https://api.openai.com/v1/audio/speech', { method: 'POST', headers: { Authorization: 'Bearer ' + s.openaiKey.trim(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: s.openaiTtsModel || 'gpt-4o-mini-tts', voice: s.openaiVoice || 'marin', input: text, speed: Math.max(0.5, Math.min(1.5, rate)), response_format: 'mp3', instructions: tl === 'es' ? 'Habla en español latinoamericano natural y claro (acento neutro, amigable para Colombia), con calma, como un profesor amable.' : `Speak clearly and naturally with a ${gb ? 'British' : 'neutral American'} accent, for an English learner.` }) });
  if (!res.ok) throw await httpErr(res);
  return await res.blob();
}
export const ttsRate = (slow, tl, mul = 1) => { const s = S.settings, base = tl === 'es' ? 1 : s.rate; return Math.max(0.5, Math.min(1.5, (slow ? Math.max(0.5, base * 0.65) : base) * mul)); };
export async function cloudTTSBlob(text, slow, tl, mul = 1) {
  const s = S.settings, rate = ttsRate(slow, tl, mul), eng = ttsEngineFor(tl);
  const k = [eng, tl === 'es' ? 'es' : '', eng === 'azure' ? azVoiceFor(tl) : s.openaiVoice + (s.accent || ''), rate.toFixed(2), text].join('|');
  if (TTS.cache.has(k)) return TTS.cache.get(k);
  let blob = null;
  try {
    const dbBlob = await TukiDB.get('audio', k);
    if (dbBlob) blob = dbBlob;
  } catch (e) {}
  if (!blob) {
    const url = location.origin + '/__tts/' + hashStr(k);
    try { const c = await caches.open('tuki-tts-v1'); const m = await c.match(url); if (m) blob = await m.blob(); } catch (e) {}
  }
  if (!blob) {
    blob = eng === 'azure' ? await azureTTS(text, rate, tl) : await openaiTTS(text, rate, tl);
    const url = location.origin + '/__tts/' + hashStr(k);
    try { const c = await caches.open('tuki-tts-v1'); await c.put(url, new Response(blob, { headers: { 'Content-Type': blob.type || 'audio/mpeg' } })); } catch (e) {}
    try { await TukiDB.set('audio', k, blob); } catch (e) {}
  } else {
    try { TukiDB.set('audio', k, blob); } catch (e) {}
  }
  TTS.cache.set(k, blob); return blob;
}
/* Voz en español del dispositivo (para explicaciones del tutor) */
export const ES_PREF = ['es-co', 'es-mx', 'es-us', 'es-419', 'es-es'];
export function pickEsVoice() {
  if (!('speechSynthesis' in window)) return null;
  const vs = speechSynthesis.getVoices().filter(v => /^es[-_]?/i.test(v.lang));
  { const p = tvPref('es'); if (p.startsWith('dev:')) { const v = vs.find(x => x.name === p.slice(4)); if (v) return v; } }
  const sc = v => {
    const l = v.lang.replace('_', '-').toLowerCase(), i = ES_PREF.indexOf(l);
    return (i < 0 ? 0 : 50 - i * 8)
      + (/natural|neural|online|premium|enhanced/i.test(v.name) ? 35 : 0)
      + (/google/i.test(v.name) ? 25 : 0)
      + (v.localService === false ? 2 : 0)
      - (/desktop|espeak|robotic/i.test(v.name) ? 40 : 0);
  };
  return vs.sort((a, b) => sc(b) - sc(a))[0] || null;
}
export function deviceSpeakEn(text, rate, onend) {
  if (!('speechSynthesis' in window)) return onend && onend();
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text), v = pickVoice(); u.lang = 'en-US'; if (v) u.voice = v; u.rate = rate;
  if (onend) { u.onend = onend; u.onerror = onend; }
  speechSynthesis.speak(u);
}
export function deviceSpeakEs(text, onend, rate = 1) {
  if (!('speechSynthesis' in window)) return onend && onend();
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text), v = pickEsVoice();
  u.lang = v ? v.lang : 'es-CO'; if (v) u.voice = v; u.rate = rate;
  if (onend) { u.onend = onend; u.onerror = onend; }
  window.__lastEsUtter = { text, lang: u.lang, voice: v && v.name };
  speechSynthesis.speak(u);
}
export function speakSeq(parts, i = 0, mul = 1) { const p = parts[i]; if (!p) return; speak(p.t, false, () => speakSeq(parts, i + 1, mul), p.lang, mul); }
speak = function (text, slow = false, onend, tl, mul = 1) {
  stopAudio();
  if (tl === 'es' || mul !== 1) {
    const dev = () => tl === 'es' ? deviceSpeakEs(text, onend, ttsRate(slow, 'es', mul)) : deviceSpeakEn(text, ttsRate(slow, undefined, mul), onend);
    if (cloudTTSReady(tl)) {
      const my = TTS.seq; if ('speechSynthesis' in window) speechSynthesis.cancel();
      cloudTTSBlob(text, slow, tl, mul).then(blob => { if (my !== TTS.seq) return; const a = new Audio(URL.createObjectURL(blob)); TTS.audio = a; a.onended = () => { onend && onend(); }; a.play().catch(dev); })
        .catch(() => { if (my === TTS.seq) dev(); });
      return;
    }
    return dev();
  }
  if (cloudTTSReady('en')) {
    const my = TTS.seq; if ('speechSynthesis' in window) speechSynthesis.cancel();
    cloudTTSBlob(text, slow).then(blob => {
      if (my !== TTS.seq) return;
      const a = new Audio(URL.createObjectURL(blob)); TTS.audio = a; a.onended = () => { onend && onend(); };
      a.play().catch(() => _deviceSpeak(text, slow, onend));
    }).catch(e => { if (navigator.onLine && !TTS.warned) { toast('Voz en la nube no disponible (' + errES(e) + '). Uso la voz del dispositivo.', 4500); TTS.warned = true; } if (my === TTS.seq) _deviceSpeak(text, slow, onend); });
    return;
  }
  _deviceSpeak(text, slow, onend);
};

/* =================== CAPTURA DE MICRÓFONO (PCM/WAV) =================== */
export function resample(f32, from, to) { if (from === to) return f32; const r = from / to, n = Math.floor(f32.length / r), out = new Float32Array(n); for (let i = 0; i < n; i++) { const a = Math.floor(i * r), b = Math.max(a + 1, Math.floor((i + 1) * r)); let s = 0; for (let j = a; j < b; j++) s += f32[j] || 0; out[i] = s / (b - a); } return out; }
export class StreamResampler { constructor(from, to) { this.r = from / to; this.buf = new Float32Array(0); } push(f32) { const all = new Float32Array(this.buf.length + f32.length); all.set(this.buf); all.set(f32, this.buf.length); const n = Math.floor(all.length / this.r), out = new Float32Array(n); for (let i = 0; i < n; i++) { const a = Math.floor(i * this.r), b = Math.max(a + 1, Math.floor((i + 1) * this.r)); let s = 0; for (let j = a; j < b; j++) s += all[j]; out[i] = s / (b - a); } this.buf = all.slice(Math.floor(n * this.r)); return out; } }
export function encodeWAV(f32, rate) {
  const buf = new ArrayBuffer(44 + f32.length * 2), v = new DataView(buf), w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  w(0, 'RIFF'); v.setUint32(4, 36 + f32.length * 2, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, f32.length * 2, true);
  for (let i = 0, o = 44; i < f32.length; i++, o += 2) { const s = Math.max(-1, Math.min(1, f32[i])); v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true); }
  return new Blob([buf], { type: 'audio/wav' });
}
export const MicCap = {
  active: null,
  async start({ maxMs = 10000, vad = true, onLevel } = {}) {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 } });
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const src = ctx.createMediaStreamSource(stream);
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 85; hp.Q.value = 0.7;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 7500; lp.Q.value = 0.7;
    const proc = ctx.createScriptProcessor(4096, 1, 1), mute = ctx.createGain(); mute.gain.value = 0;
    const chunks = []; let spoke = false, silent = 0; const t0 = performance.now();
    return new Promise(resolve => {
      const finish = () => {
        if (!this.active) return; this.active = null;
        try { proc.disconnect(); lp.disconnect(); hp.disconnect(); src.disconnect(); } catch (e) {} stream.getTracks().forEach(t => t.stop());
        const rate = ctx.sampleRate; ctx.close().catch(() => {});
        let len = 0; chunks.forEach(c => len += c.length); const all = new Float32Array(len); let o = 0; chunks.forEach(c => { all.set(c, o); o += c.length; });
        const s16 = resample(all, rate, 16000); resolve({ samples: s16, wav: encodeWAV(s16, 16000), spoke });
      };
      this.active = { stop: finish };
      proc.onaudioprocess = e => {
        const d = e.inputBuffer.getChannelData(0); chunks.push(new Float32Array(d));
        let sum = 0; for (let i = 0; i < d.length; i++) sum += d[i] * d[i]; const rms = Math.sqrt(sum / d.length); onLevel && onLevel(rms);
        const ms = d.length / ctx.sampleRate * 1000; if (rms > 0.015) { spoke = true; silent = 0; } else if (spoke) silent += ms;
        if ((vad && spoke && silent > 1300) || performance.now() - t0 > maxMs) finish();
      };
      src.connect(hp); hp.connect(lp); lp.connect(proc); proc.connect(mute); mute.connect(ctx.destination);
    });
  },
  stop() { this.active && this.active.stop(); }
};

/* =================== AZURE: EVALUACIÓN DE PRONUNCIACIÓN =================== */
export const SAPI_IPA = { aa: 'ɑ', ae: 'æ', ah: 'ʌ', ao: 'ɔ', aw: 'aʊ', ax: 'ə', ay: 'aɪ', b: 'b', ch: 'tʃ', d: 'd', dh: 'ð', eh: 'ɛ', er: 'ɝ', ey: 'eɪ', f: 'f', g: 'g', h: 'h', hh: 'h', ih: 'ɪ', iy: 'i', jh: 'dʒ', k: 'k', l: 'l', m: 'm', n: 'n', ng: 'ŋ', ow: 'oʊ', oy: 'ɔɪ', p: 'p', r: 'ɹ', s: 's', sh: 'ʃ', t: 't', th: 'θ', uh: 'ʊ', uw: 'u', v: 'v', w: 'w', y: 'j', z: 'z', zh: 'ʒ' };
export const toIPA = p => { const k = String(p || '').toLowerCase(); return SAPI_IPA[k] || String(p || ''); };
export const PH_TIPS = { 'θ': 'Saca la punta de la lengua entre los dientes y sopla (sin vibrar).', 'ð': 'Lengua entre los dientes y haz vibrar la garganta.', 'ɪ': 'Es una "i" corta y relajada, casi "e".', 'i': 'Es una "i" larga y tensa: sonríe y alárgala.', 'iː': 'Es una "i" larga y tensa: sonríe y alárgala.', 'æ': 'Abre mucho la boca: un sonido entre "a" y "e".', 'ʌ': 'Una "a" corta y relajada, como un "ah" rápido.', 'ə': 'Vocal débil y relajada, muy corta ("uh").', 'v': 'Dientes de arriba sobre el labio inferior y vibra: "vvv".', 'b': 'Junta los dos labios y suéltalos.', 'z': 'Es una "s" que vibra, como una abeja: "zzz".', 's': 'Una "s" clara, sin vibrar.', 'ʃ': 'Labios redondeados hacia adelante: "shhh".', 'tʃ': 'Como la "ch" de "chocolate".', 'dʒ': 'Como una "ll" fuerte con "d": "dj".', 'ɹ': 'La "r" inglesa: la lengua NO toca el paladar, se curva hacia atrás.', 'h': 'Solo aire suave, como un suspiro; no es la jota española.', 'ŋ': 'Nasal con la parte de atrás de la lengua; no pronuncies la "g" final.', 'j': 'Como la "y" de "yo", suave.', 'w': 'Labios redondos como para una "u".', 't': 'Punta de la lengua detrás de los dientes de arriba; no te la comas al final.', 'd': 'Como la "t" pero con vibración; pronúnciala al final de la palabra.', 'k': 'Parte de atrás de la lengua contra el paladar; suelta aire.', 'p': 'Junta los labios y suelta aire con fuerza.', 'ɝ': '"Er" con la lengua curvada hacia atrás.', 'ɚ': '"Er" débil con la lengua curvada.', 'oʊ': 'Es "ou", no una "o" pura.', 'eɪ': 'Es "ei", no una "e" pura.', 'ʊ': 'Una "u" corta y relajada.', 'u': 'Una "u" larga con labios redondos.', 'uː': 'Una "u" larga con labios redondos.', 'ɑ': 'Una "a" muy abierta, de garganta.', 'ɔ': 'Una "o" abierta.', 'ɛ': 'Una "e" abierta.', 'l': 'Al final de palabra, la "l" es más oscura: la lengua sube atrás.', 'aɪ': 'Es "ai".', 'aʊ': 'Es "au".', 'f': 'Dientes de arriba sobre el labio inferior, solo aire.', 'm': 'Labios juntos, sonido nasal.', 'n': 'Punta de la lengua detrás de los dientes, nasal.', 'g': 'Como la "g" de "gato", fuerte.', 'ʒ': 'Como una "sh" que vibra (como la "y" argentina).' };
export function azureToResult(target, data) {
  if (data.RecognitionStatus && data.RecognitionStatus !== 'Success') {
    const msg = { InitialSilenceTimeout: 'No se detectó voz. Habla más cerca del micrófono.', NoMatch: 'No reconocí palabras en inglés. Intenta de nuevo, claro y despacio.', BabbleTimeout: 'Hay mucho ruido de fondo.', Error: 'Error interno de Azure. Intenta de nuevo.' }[data.RecognitionStatus] || data.RecognitionStatus;
    const e = new Error(msg); e.friendly = msg; throw e;
  }
  const nb = (data.NBest || [])[0]; if (!nb) { const e = new Error('Azure no devolvió resultados.'); e.friendly = e.message; throw e; }
  const pa = nb.PronunciationAssessment || nb;
  const W = (nb.Words || []).map(w => { const wp = w.PronunciationAssessment || w; return { w: String(w.Word || '').toLowerCase().replace(/[^a-z0-9']/g, ''), acc: wp.AccuracyScore ?? 0, err: wp.ErrorType || 'None', ph: (w.Phonemes || []).map(p => { const pp = p.PronunciationAssessment || p; const nbp = (pp.NBestPhonemes || []).filter(x => x.Phoneme); return { p: toIPA(p.Phoneme), s: Math.round(pp.AccuracyScore ?? 0), nb: nbp.length ? toIPA(nbp[0].Phoneme) : null }; }) }; });
  const ref = W.filter(w => w.err !== 'Insertion');
  let j = 0;
  const words = target.split(/\s+/).filter(Boolean).map(tok => {
    const t = tok.toLowerCase().replace(/[^a-z0-9']/g, ''); let m = null;
    for (let k = j; k < Math.min(ref.length, j + 3); k++) if (ref[k].w === t || charSim(ref[k].w, t) >= 0.6) { m = ref[k]; j = k + 1; break; }
    const s = !m || m.err === 'Omission' ? 0 : m.err === 'Mispronunciation' ? Math.min(m.acc, 60) / 100 : m.acc / 100;
    return { tok, s, c: colorOf(s), heard: m && m.err !== 'Omission' ? m.w : '', ph: m ? m.ph : [], err: m ? m.err : 'Omission' };
  });
  const tips = [];
  words.forEach(w => (w.ph || []).forEach(p => { if (p.s < 60 && tips.length < 4) { const cw = w.tok.replace(/[.,!?;:"¿¡]/g, ''); tips.push((p.nb && p.nb !== p.p ? `En «${cw}», la /${p.p}/ sonó como /${p.nb}/.` : `En «${cw}», mejora la /${p.p}/ (${p.s}/100).`) + (PH_TIPS[p.p] ? ' ' + PH_TIPS[p.p] : '')); } }));
  words.filter(w => w.err === 'Omission').slice(0, 2).forEach(w => tips.push(`No se escuchó «${w.tok.replace(/[.,!?;:"]/g, '')}». Pronuncia todas las palabras.`));
  const scores = { acc: pa.AccuracyScore, flu: pa.FluencyScore, comp: pa.CompletenessScore, pros: pa.ProsodyScore };
  const pct = Math.round(pa.PronScore ?? avg([scores.acc, scores.flu, scores.comp].filter(x => x != null)));
  return { engine: 'azure', pct: clamp(pct || 0, 0, 100), words, heard: nb.Display || data.DisplayText || '', conf: nb.Confidence || 0, alts: (data.NBest || []).map(n => ({ t: n.Display || '', c: n.Confidence || 0 })), scores, tips, msg: '' };
}
export async function azureAssess(target, wav) {
  const s = S.settings, lang = (s.accent || 'en-US').startsWith('en-GB') ? 'en-GB' : 'en-US';
  const params = { ReferenceText: target, GradingSystem: 'HundredMark', Granularity: 'Phoneme', Dimension: 'Comprehensive', EnableMiscue: 'True', EnableProsodyAssessment: 'True', PhonemeAlphabet: 'IPA', NBestPhonemeCount: 5 };
  const hdr = btoa(unescape(encodeURIComponent(JSON.stringify(params))));
  const res = await azFetch('stt.speech.microsoft.com', `/speech/recognition/conversation/cognitiveservices/v1?language=${lang}&format=detailed`, { method: 'POST', headers: { 'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000', Accept: 'application/json', 'Pronunciation-Assessment': hdr }, body: wav });
  if (!res.ok) throw await httpErr(res);
  return azureToResult(target, await res.json());
}
export async function azureSTT(wav) {
  const s = S.settings, lang = (s.accent || 'en-US').startsWith('en-GB') ? 'en-GB' : 'en-US';
  const res = await azFetch('stt.speech.microsoft.com', `/speech/recognition/conversation/cognitiveservices/v1?language=${lang}&format=simple`, { method: 'POST', headers: { 'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000', Accept: 'application/json' }, body: wav });
  if (!res.ok) throw await httpErr(res);
  const d = await res.json(); if (d.RecognitionStatus !== 'Success') { const e = new Error('No te entendí.'); e.friendly = e.message; throw e; }
  return d.DisplayText || '';
}
export async function openaiSTT(wav) {
  const fd = new FormData(); fd.append('file', wav, 'voz.wav'); fd.append('model', 'gpt-4o-mini-transcribe'); fd.append('language', 'en');
  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', { method: 'POST', headers: { Authorization: 'Bearer ' + S.settings.openaiKey.trim() }, body: fd });
  if (!res.ok) throw await httpErr(res);
  return ((await res.json()).text || '').trim();
}

/* =================== VISUALIZACIÓN: ONDA Y TONO (pitch) =================== */
export function pitchTrack(d, rate = 16000) {
  const frame = 640, hop = 320, en = [];
  for (let i = 0; i + frame < d.length; i += hop) { let e = 0; for (let k = 0; k < frame; k++) e += d[i + k] * d[i + k]; en.push(e); }
  const maxE = Math.max(1e-9, ...en), out = [];
  en.forEach((e, fi) => {
    if (e < maxE * 0.08) return out.push(null);
    const i = fi * hop; let best = 0, bl = 0;
    for (let lag = Math.floor(rate / 400); lag <= Math.floor(rate / 75); lag++) { let s = 0; for (let k = 0; k < frame - lag; k++) s += d[i + k] * d[i + k + lag]; if (s > best) { best = s; bl = lag; } }
    out.push(bl && best / e > 0.3 ? rate / bl : null);
  });
  return out.map((v, i, a) => { if (v == null) return null; const w = [a[i - 1], v, a[i + 1]].filter(x => x != null).sort((x, y) => x - y); return w[Math.floor(w.length / 2)]; });
}
export function drawTrack(cv, d, pitch, color) {
  const dpr = window.devicePixelRatio || 1, W = cv.clientWidth || 300, H = cv.clientHeight || 90; cv.width = W * dpr; cv.height = H * dpr;
  const g = cv.getContext('2d'); g.scale(dpr, dpr); g.clearRect(0, 0, W, H);
  g.fillStyle = color + '55'; const step = d.length / W;
  for (let x = 0; x < W; x++) { let mn = 1, mx = -1; for (let i = Math.floor(x * step); i < Math.floor((x + 1) * step); i++) { const v = d[i] || 0; if (v < mn) mn = v; if (v > mx) mx = v; } g.fillRect(x, H / 2 + mn * H * 0.45, 1, Math.max(1, (mx - mn) * H * 0.45)); }
  const lo = Math.log(75), hi = Math.log(400); g.strokeStyle = color; g.lineWidth = 2.5; g.beginPath(); let pen = false;
  pitch.forEach((p, i) => { const x = i / pitch.length * W; if (p == null) { pen = false; return; } const y = H - 6 - (Math.log(p) - lo) / (hi - lo) * (H - 12); if (!pen) { g.moveTo(x, y); pen = true; } else g.lineTo(x, y); });
  g.stroke();
}
export function contourDir(pitch) { const v = pitch.filter(p => p != null); if (v.length < 6) return null; const n = v.length, mid = avg(v.slice(Math.floor(n * 0.3), Math.floor(n * 0.65))), end = avg(v.slice(Math.floor(n * 0.7))); const r = end / mid; return r > 1.08 ? 'up' : r < 0.93 ? 'down' : 'flat'; }
export const expectRise = t => /^(do|does|did|are|is|am|was|were|can|could|will|would|have|has|should|may|shall)\b/i.test(t.trim()) && /\?\s*$/.test(t);

/* ---- v2.5.1: speak decodifica entidades HTML ---- */
const _speak251 = speak; speak = function (text, ...a) { return _speak251(decodeEnt(text), ...a); };
