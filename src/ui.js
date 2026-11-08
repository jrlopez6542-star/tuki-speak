// src/ui.js - Fase 3, modulo 7: vistas, mascota, tienda, misiones y utilidades de UI extraidas de src/main.js.
// main.js queda como punto de entrada: COURSE, VIEWS, render/go y los wrappers v2.x que reasignan
// funciones (render, go, toast, save, beep, finishLesson...) siguen alli, porque un binding importado
// no se puede reasignar. ui.js importa esos nombres desde './main.js' y solo los usa dentro de funciones.
import { $, $$, avg, colorOf, dayKey, decodeDeep, decodeEnt, esc, hashStr, lev, normText, pick, scoreSpeech, shuffle, sleep } from './utils.js';
import { DAY, MAX_HEARTS, S, addToDeck, isDone, recordSpeech, refreshHearts, soundAvg, todayRec } from './state.js';
import { HAS_SR, MicCap, PH_TIPS, Rec, SR, SR_ERR, TTS, azureAssess, azureSTT, azureTTS, canSpeak, cloudTTSBlob, cloudTTSReady, contourDir, curRec, drawTrack, expectRise, pickEsVoice, pickVoice, pitchTrack, recognize, setCurRec, speak, stopAudio, stopRecognize, ttsRate, tvPref, vibrate } from './audio.js';
import { L, RENDER, buildPractice, createMicMeter, doMic, feedback, nextEx, sayPairEx, setFoot, startLesson } from './lessons.js';
import { AZT, CHAT, LEVELS, LEVEL_KEYS, LIVE, MEM_WCACHE, SCENARIOS, SCEN_ES, TUTOR_SPEEDS, aiJSON, aiQuick, aiQuotaToday, azFetch, azOwn, azShared, azureReady, cacheGet, cacheSet, chatLevel, chatMul, chatSend, currentProvider, ensureSP, enterMode, fbSignedIn, flagHard, gemShared, gemini, hardWords, numHash, tukiApi, tutorSpeed, uid } from './chat.js';
import { FB, authErr, fbGoogle } from './account.js';
import { TukiDB } from './tuki-db.js';
import { APP_VERSION, COURSE, LESSON, LESSONS, TAB, TC_LAST_PERSONALIZED, TUKI_OFFLINE_TC, VIEWS, addXP, beep, checkBadges, closeLesson, confetti, decodeAudio, go, isUnlocked, render, save, streakNow, tcGenerate, toast, tukiChirp, tukiFanfare } from './main.js';

export function renderTukiSVG(skin, opts = {}) {
  const sk = skin || (typeof S !== 'undefined' && S && S.tukiSkin) || { hat: 'none', outfit: 'none', hand: 'none', plumage: 'classic' };
  const h = sk.hat || 'none', o = sk.outfit || 'none', hand = sk.hand || 'none', pl = sk.plumage || 'classic';
  const size = opts.size ? `width="${opts.size}" height="${opts.size}" ` : '';

  const colors = {
    classic: {
      bodyLight: '#334155', body: '#1e293b', bodyDark: '#090d16',
      chestLight: '#ffffff', chest: '#fef3c7', chestDark: '#fed7aa',
      wingLight: '#34d399', wing: '#10b981', wingDark: '#047857',
      beakTopLight: '#fef08a', beakTop: '#f59e0b', beakTopDark: '#d97706',
      beakBotLight: '#f87171', beakBot: '#ef4444', beakBotDark: '#991b1b',
      eyePatch: '#0284c7',
      aura: ''
    },
    gold: {
      bodyLight: '#b45309', body: '#78350f', bodyDark: '#451a03',
      chestLight: '#ffffff', chest: '#fef08a', chestDark: '#fde047',
      wingLight: '#fde047', wing: '#f59e0b', wingDark: '#b45309',
      beakTopLight: '#fffbeb', beakTop: '#fbbf24', beakTopDark: '#b45309',
      beakBotLight: '#fde047', beakBot: '#d97706', beakBotDark: '#78350f',
      eyePatch: '#fbbf24',
      aura: '<circle cx="50" cy="50" r="47" fill="url(#tuki-gold-aura)"/><circle cx="50" cy="50" r="48" fill="none" stroke="#f59e0b" stroke-width="1.8" stroke-dasharray="6 4" opacity="0.75" class="tuki-aura-spin"/><circle cx="50" cy="50" r="44" fill="none" stroke="#fbbf24" stroke-width="1" stroke-dasharray="3 6" opacity="0.5"/><path d="M50 2 L50 8 M47 5 L53 5 M6 50 L12 50 M9 47 L9 53 M94 50 L88 50 M91 47 L91 53" stroke="#fbbf24" stroke-width="1.5" stroke-linecap="round" opacity="0.85"/><text x="74" y="24" font-size="8" fill="#fbbf24" opacity="0.9">✦</text><text x="16" y="28" font-size="7" fill="#fde047" opacity="0.85">✦</text>'
    },
    neon: {
      bodyLight: '#312e81', body: '#1e1b4b', bodyDark: '#090724',
      chestLight: '#e0f2fe', chest: '#38bdf8', chestDark: '#0284c7',
      wingLight: '#f472b6', wing: '#ec4899', wingDark: '#be185d',
      beakTopLight: '#e9d5ff', beakTop: '#a855f7', beakTopDark: '#7e22ce',
      beakBotLight: '#67e8f9', beakBot: '#06b6d4', beakBotDark: '#0e7490',
      eyePatch: '#ec4899',
      aura: '<circle cx="50" cy="50" r="47" fill="url(#tuki-neon-aura)"/><circle cx="50" cy="50" r="48" fill="none" stroke="#06b6d4" stroke-width="1.8" stroke-dasharray="8 4 2 4" opacity="0.8" class="tuki-aura-spin"/><circle cx="50" cy="50" r="44" fill="none" stroke="#ec4899" stroke-width="1.2" stroke-dasharray="4 8" opacity="0.6"/><path d="M10 50 L18 50 M82 50 L90 50 M50 8 L50 16" stroke="#38bdf8" stroke-width="1.5" opacity="0.8"/><text x="76" y="22" font-size="8" fill="#38bdf8" opacity="0.9">⚡</text><text x="14" y="24" font-size="7" fill="#ec4899" opacity="0.85">◆</text>'
    },
    fire: {
      bodyLight: '#991b1b', body: '#7f1d1d', bodyDark: '#450a0a',
      chestLight: '#fff7ed', chest: '#fed7aa', chestDark: '#fdba74',
      wingLight: '#fb923c', wing: '#f97316', wingDark: '#c2410c',
      beakTopLight: '#fca5a5', beakTop: '#ef4444', beakTopDark: '#991b1b',
      beakBotLight: '#ea580c', beakBot: '#c2410c', beakBotDark: '#7c2d12',
      eyePatch: '#f97316',
      aura: '<circle cx="50" cy="50" r="47" fill="url(#tuki-fire-aura)"/><circle cx="50" cy="50" r="48" fill="none" stroke="#ef4444" stroke-width="1.6" stroke-dasharray="5 3" opacity="0.65" class="tuki-aura-pulse"/><path d="M18 52 Q14 36 24 24 Q22 36 30 32 Q26 18 38 12 Q36 26 48 20 Q44 34 56 28 Q66 18 64 36 Q74 28 78 44 Q84 38 82 56" fill="none" stroke="#f97316" stroke-width="1.6" opacity="0.55"/><circle cx="20" cy="30" r="1.5" fill="#f97316" opacity="0.75"/><circle cx="78" cy="34" r="1.8" fill="#ef4444" opacity="0.75"/><text x="76" y="22" font-size="8" fill="#ef4444" opacity="0.85">🔥</text><text x="14" y="26" font-size="7" fill="#f97316" opacity="0.85">✨</text>'
    },
    ice: {
      bodyLight: '#1e293b', body: '#0f172a', bodyDark: '#020617',
      chestLight: '#ffffff', chest: '#e0f2fe', chestDark: '#bae6fd',
      wingLight: '#7dd3fc', wing: '#38bdf8', wingDark: '#0284c7',
      beakTopLight: '#bae6fd', beakTop: '#7dd3fc', beakTopDark: '#0284c7',
      beakBotLight: '#38bdf8', beakBot: '#0284c7', beakBotDark: '#0369a1',
      eyePatch: '#38bdf8',
      aura: '<circle cx="50" cy="50" r="47" fill="url(#tuki-ice-aura)"/><circle cx="50" cy="50" r="48" fill="none" stroke="#38bdf8" stroke-width="1.6" stroke-dasharray="6 6" opacity="0.75" class="tuki-aura-pulse"/><path d="M50 4 L50 14 M45 9 L55 9 M10 50 L20 50 M15 45 L15 55 M80 50 L90 50 M85 45 L85 55" stroke="#bae6fd" stroke-width="1.4" stroke-linecap="round" opacity="0.8"/><text x="76" y="22" font-size="8" fill="#7dd3fc" opacity="0.9">❄️</text><text x="14" y="26" font-size="7" fill="#e0f2fe" opacity="0.85">✧</text>'
    }
  }[pl] || {
    bodyLight: '#334155', body: '#1e293b', bodyDark: '#090d16',
    chestLight: '#ffffff', chest: '#fef3c7', chestDark: '#fed7aa',
    wingLight: '#34d399', wing: '#10b981', wingDark: '#047857',
    beakTopLight: '#fef08a', beakTop: '#f59e0b', beakTopDark: '#d97706',
    beakBotLight: '#f87171', beakBot: '#ef4444', beakBotDark: '#991b1b',
    eyePatch: '#0284c7',
    aura: ''
  };

  const defs = `<defs>
    <!-- Sombra 3D en el suelo -->
    <radialGradient id="tuki-ground-shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0f172a" stop-opacity="0.25"/>
      <stop offset="60%" stop-color="#0f172a" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0"/>
    </radialGradient>

    <!-- Torso 3D esférico -->
    <radialGradient id="tuki-body-grad-${pl}" cx="38%" cy="32%" r="65%">
      <stop offset="0%" stop-color="${colors.bodyLight}"/>
      <stop offset="60%" stop-color="${colors.body}"/>
      <stop offset="100%" stop-color="${colors.bodyDark}"/>
    </radialGradient>

    <!-- Pecho 3D con volumen convexo -->
    <radialGradient id="tuki-chest-grad-${pl}" cx="40%" cy="30%" r="68%">
      <stop offset="0%" stop-color="${colors.chestLight}"/>
      <stop offset="55%" stop-color="${colors.chest}"/>
      <stop offset="100%" stop-color="${colors.chestDark}"/>
    </radialGradient>

    <!-- Ala 3D volumétrica -->
    <linearGradient id="tuki-wing-grad-${pl}" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="${colors.wingLight}"/>
      <stop offset="50%" stop-color="${colors.wing}"/>
      <stop offset="100%" stop-color="${colors.wingDark}"/>
    </linearGradient>

    <!-- Pico superior 3D -->
    <linearGradient id="tuki-bt-${pl}" x1="30%" y1="0%" x2="40%" y2="100%">
      <stop offset="0%" stop-color="${colors.beakTopLight}"/>
      <stop offset="35%" stop-color="${colors.beakTop}"/>
      <stop offset="100%" stop-color="${colors.beakTopDark}"/>
    </linearGradient>

    <!-- Pico inferior 3D -->
    <linearGradient id="tuki-bb-${pl}" x1="30%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="${colors.beakBotLight}"/>
      <stop offset="45%" stop-color="${colors.beakBot}"/>
      <stop offset="100%" stop-color="${colors.beakBotDark}"/>
    </linearGradient>

    <!-- Ojo 3D con sombreado esférico -->
    <radialGradient id="tuki-eye-sphere" cx="42%" cy="38%" r="60%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="78%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </radialGradient>

    <!-- Iris 3D con profundidad de lente -->
    <radialGradient id="tuki-iris-grad" cx="45%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="55%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>

    <!-- Patas 3D con volumen cilíndrico -->
    <linearGradient id="tuki-foot-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="45%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>

    <!-- Atuendos y Efectos -->
    <linearGradient id="tuki-crown-gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="45%" stop-color="#f59e0b"/>
      <stop offset="85%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <linearGradient id="tuki-vr-neon" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4"/>
      <stop offset="50%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
    <radialGradient id="tuki-gold-aura" cx="50%" cy="50%" r="50%">
      <stop offset="55%" stop-color="#f59e0b" stop-opacity="0"/>
      <stop offset="85%" stop-color="#fbbf24" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.6"/>
    </radialGradient>
    <radialGradient id="tuki-fire-aura" cx="50%" cy="50%" r="50%">
      <stop offset="50%" stop-color="#ef4444" stop-opacity="0"/>
      <stop offset="80%" stop-color="#f97316" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#ef4444" stop-opacity="0.55"/>
    </radialGradient>
    <radialGradient id="tuki-neon-aura" cx="50%" cy="50%" r="50%">
      <stop offset="50%" stop-color="#06b6d4" stop-opacity="0"/>
      <stop offset="80%" stop-color="#38bdf8" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#ec4899" stop-opacity="0.5"/>
    </radialGradient>
    <radialGradient id="tuki-ice-aura" cx="50%" cy="50%" r="50%">
      <stop offset="50%" stop-color="#7dd3fc" stop-opacity="0"/>
      <stop offset="80%" stop-color="#38bdf8" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#bae6fd" stop-opacity="0.6"/>
    </radialGradient>
  </defs>`;

  const capeBehind = o === 'cape' ? '<path d="M25 54 Q8 62 3 86 Q18 83 28 72 Z" fill="#dc2626"/><path d="M24 54 Q10 65 6 86" stroke="#991b1b" stroke-width="1.5" fill="none"/>' : '';

  const outfitLayer = {
    bowtie: '<polygon points="33,56 43,60 33,64" fill="#dc2626"/><polygon points="53,56 43,60 53,64" fill="#dc2626"/><circle cx="43" cy="60" r="3" fill="#991b1b"/><ellipse cx="43" cy="59.5" rx="1.5" ry="1" fill="#f87171" opacity="0.6"/>',
    scarf: '<rect x="26" y="55" width="34" height="10" rx="4" fill="#0284c7"/><line x1="32" y1="55" x2="32" y2="65" stroke="#bae6fd" stroke-width="2"/><line x1="42" y1="55" x2="42" y2="65" stroke="#bae6fd" stroke-width="2"/><line x1="52" y1="55" x2="52" y2="65" stroke="#bae6fd" stroke-width="2"/><path d="M48 62 L48 78 L40 78 L40 62 Z" fill="#0369a1"/><line x1="40" y1="74" x2="48" y2="74" stroke="#bae6fd" stroke-width="2"/>',
    hawaiian: '<circle cx="28" cy="58" r="3.5" fill="#ec4899"/><circle cx="34" cy="62" r="3.5" fill="#f59e0b"/><circle cx="42" cy="64" r="3.5" fill="#eab308"/><circle cx="50" cy="62" r="3.5" fill="#06b6d4"/><circle cx="56" cy="58" r="3.5" fill="#a855f7"/>',
    cape: '<circle cx="28" cy="56" r="3.5" fill="#f59e0b"/>',
    medal: '<path d="M36 55 L43 68 L50 55" stroke="#dc2626" stroke-width="3" fill="none"/><circle cx="43" cy="72" r="6" fill="#f59e0b" stroke="#d97706" stroke-width="1"/><circle cx="41.5" cy="70.5" r="2" fill="#fff" opacity="0.45"/>',
    ruana: '<polygon points="20,54 62,54 66,78 44,84 16,76" fill="#78350f" stroke="#451a03" stroke-width="1.5"/><path d="M19 62 L63 62" stroke="#fef3c7" stroke-width="2.5"/><polygon points="25,62 28,59 31,62 28,65" fill="#d97706"/><polygon points="35,62 38,59 41,62 38,65" fill="#dc2626"/><polygon points="47,62 50,59 53,62 50,65" fill="#dc2626"/><polygon points="57,62 60,59 63,62 60,65" fill="#d97706"/><polyline points="18,71 22,69 26,71 30,69 34,71 38,69 42,71 46,69 50,71 54,69 58,71 62,69 65,72" fill="none" stroke="#fde68a" stroke-width="1.4"/><polygon points="39,54 44,65 49,54" fill="#fffbeb" stroke="#b45309" stroke-width="0.8"/><path d="M16 76 L19 83 M23 78 L25 84 M30 80 L32 85 M37 82 L38 87 M44 84 L44 89 M51 82 L50 87 M58 80 L56 85 M64 77 L62 83" stroke="#fef3c7" stroke-width="1.6" stroke-linecap="round"/>',
    jersey: '<path d="M26 56 Q44 54 60 56 L58 76 Q44 80 26 76 Z" fill="#facc15" stroke="#ca8a04" stroke-width="1.5"/><path d="M26 70 Q44 73 58 70 L58 73 Q44 76 26 73 Z" fill="#1d4ed8"/><path d="M26 73 Q44 76 58 73 L58 76 Q44 79 26 76 Z" fill="#dc2626"/><polygon points="41,56 44,61 47,56" fill="#1d4ed8"/>',
    astronaut: '<path d="M24 55 Q44 52 62 55 L60 80 Q44 84 24 80 Z" fill="#f1f5f9" stroke="#94a3b8" stroke-width="2"/><rect x="30" y="55" width="28" height="5" rx="2" fill="#0284c7"/><circle cx="36" cy="67" r="4" fill="#ef4444"/><circle cx="48" cy="67" r="4" fill="#3b82f6"/><line x1="28" y1="74" x2="56" y2="74" stroke="#64748b" stroke-width="2"/>',
    jacket: '<path d="M23 54 L44 58 L63 54 L60 78 L44 82 L24 78 Z" fill="#0f172a" stroke="#334155" stroke-width="2"/><polygon points="32,55 44,68 36,68" fill="#e2e8f0"/><polygon points="56,55 44,68 52,68" fill="#e2e8f0"/><line x1="44" y1="68" x2="44" y2="82" stroke="#94a3b8" stroke-width="2"/>',
    lab: '<path d="M24 54 Q44 52 62 54 L61 82 Q44 86 24 82 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/><polygon points="34,54 44,65 38,65" fill="#3b82f6"/><polygon points="54,54 44,65 50,65" fill="#3b82f6"/><circle cx="44" cy="70" r="1.5" fill="#64748b"/><circle cx="44" cy="76" r="1.5" fill="#64748b"/>',
    vest: '<path d="M24 55 Q44 53 62 55 L60 80 Q44 84 24 80 Z" fill="#65a30d" stroke="#4d7c0f" stroke-width="1.5"/><rect x="28" y="62" width="10" height="9" rx="1.5" fill="#4d7c0f"/><rect x="48" y="62" width="10" height="9" rx="1.5" fill="#4d7c0f"/>'
  }[o] || '';

  const hatLayer = {
    cap: '<path d="M22 35 C23 20 54 20 56 34 Z" fill="#2563eb"/><path d="M42 33 C56 32 68 36 70 40 C56 42 44 38 42 33 Z" fill="#1d4ed8"/><circle cx="39" cy="22" r="2.5" fill="#f59e0b"/>',
    glasses: '<path d="M26 36 Q38 31 52 36 L52 45 Q38 49 26 45 Z" fill="#0f172a" stroke="#475569" stroke-width="1.5"/><line x1="28" y1="39" x2="48" y2="43" stroke="#fff" stroke-width="1.4" opacity="0.75"/><line x1="32" y1="38" x2="44" y2="44" stroke="#67e8f9" stroke-width="0.8" opacity="0.6"/><path d="M52 38 Q58 37 62 40" stroke="#0f172a" stroke-width="2" fill="none"/>',
    grad: '<polygon points="16,24 38,15 62,24 38,32" fill="#111827" stroke="#1f2937" stroke-width="1"/><path d="M38 24 Q48 27 52 38" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" fill="none"/><circle cx="38" cy="24" r="3" fill="#f59e0b"/><circle cx="52" cy="38" r="2.5" fill="#f59e0b"/>',
    wizard: '<ellipse cx="38" cy="31" rx="22" ry="5.5" fill="#3b0764"/><path d="M23 30 Q34 6 56 10 Q45 20 53 30 Z" fill="#581c87"/><circle cx="38" cy="19" r="2.5" fill="#fbbf24"/><circle cx="46" cy="16" r="1.5" fill="#fde047"/>',
    crown: '<polygon points="22,30 19,16 29,24 39,11 49,24 59,16 56,30" fill="url(#tuki-crown-gold)" stroke="#92400e" stroke-width="1.2"/><path d="M24 30 Q39 18 54 30 Z" fill="#831843" opacity="0.85"/><rect x="22" y="28" width="34" height="4.5" rx="1.5" fill="url(#tuki-crown-gold)" stroke="#78350f" stroke-width="1"/><circle cx="26" cy="30.2" r="0.9" fill="#fff"/><circle cx="33" cy="30.2" r="0.9" fill="#fff"/><circle cx="39" cy="30.2" r="0.9" fill="#fff"/><circle cx="45" cy="30.2" r="0.9" fill="#fff"/><circle cx="52" cy="30.2" r="0.9" fill="#fff"/><polygon points="39,17 41.5,21 39,25 36.5,21" fill="#ef4444" stroke="#991b1b" stroke-width="0.5"/><polygon points="39,17 40.5,20.5 39,22 37.5,20.5" fill="#fca5a5"/><circle cx="29" cy="24" r="2.2" fill="#10b981" stroke="#065f46" stroke-width="0.6"/><circle cx="28.2" cy="23.2" r="0.7" fill="#a7f3d0"/><circle cx="49" cy="24" r="2.2" fill="#3b82f6" stroke="#1e40af" stroke-width="0.6"/><circle cx="48.2" cy="23.2" r="0.7" fill="#bfdbfe"/><circle cx="19" cy="15.5" r="1.5" fill="#fffbeb" stroke="#d97706" stroke-width="0.5"/><circle cx="59" cy="15.5" r="1.5" fill="#fffbeb" stroke="#d97706" stroke-width="0.5"/><circle cx="39" cy="9.5" r="2.2" fill="#fef08a" stroke="#b45309" stroke-width="0.8"/><line x1="39" y1="6.5" x2="39" y2="10" stroke="#fef08a" stroke-width="1.2"/><line x1="37.5" y1="8" x2="40.5" y2="8" stroke="#fef08a" stroke-width="1.2"/>',
    party: '<polygon points="26,32 40,8 54,32" fill="#ec4899"/><path d="M29 26 L51 26" stroke="#fbbf24" stroke-width="2.5"/><path d="M34 18 L46 18" stroke="#38bdf8" stroke-width="2.5"/><circle cx="40" cy="7" r="3.5" fill="#facc15"/>',
    vueltiao: '<ellipse cx="40" cy="30" rx="27" ry="7" fill="#fef3c7" stroke="#1f2937" stroke-width="2"/><path d="M16 30 Q40 28 64 30" stroke="#1f2937" stroke-width="2" fill="none"/><path d="M25 29 Q30 14 55 17 Q54 28 55 29 Z" fill="#fffbeb" stroke="#1f2937" stroke-width="1.5"/><line x1="28" y1="24" x2="52" y2="24" stroke="#1f2937" stroke-width="2"/><circle cx="40" cy="16" r="2.5" fill="#1f2937"/>',
    chef: '<rect x="25" y="27" width="30" height="6" rx="2" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/><path d="M23 27 C20 18 30 10 38 10 C46 8 56 12 56 20 C60 22 58 27 55 27 Z" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/><line x1="33" y1="27" x2="33" y2="15" stroke="#e2e8f0" stroke-width="1"/><line x1="43" y1="27" x2="43" y2="15" stroke="#e2e8f0" stroke-width="1"/>',
    headphones: '<path d="M22 40 C18 16 58 14 58 38" stroke="#3b82f6" stroke-width="4" stroke-linecap="round" fill="none"/><rect x="18" y="34" width="7" height="13" rx="3.5" fill="#1d4ed8" stroke="#93c5fd" stroke-width="1"/><rect x="54" y="33" width="7" height="13" rx="3.5" fill="#1d4ed8" stroke="#93c5fd" stroke-width="1"/><path d="M22 45 Q32 50 42 48" stroke="#3b82f6" stroke-width="2" fill="none"/><circle cx="43" cy="48" r="2" fill="#ef4444"/>',
    beret: '<ellipse cx="38" cy="25" rx="20" ry="7" fill="#dc2626" transform="rotate(-10 38 25)"/><circle cx="37" cy="18" r="2" fill="#991b1b"/>',
    flower: '<circle cx="23" cy="28" r="4" fill="#ec4899"/><circle cx="31" cy="24" r="4.5" fill="#fbbf24"/><circle cx="40" cy="22" r="4.5" fill="#38bdf8"/><circle cx="49" cy="24" r="4" fill="#a855f7"/><circle cx="56" cy="28" r="3.5" fill="#f43f5e"/><circle cx="31" cy="24" r="1.5" fill="#fff"/><circle cx="40" cy="22" r="1.5" fill="#fff"/>',
    vr: '<path d="M23 34 Q39 30 55 34 L54 47 Q39 50 24 47 Z" fill="#050811" stroke="#06b6d4" stroke-width="1.8"/><path d="M25 36 Q39 33 53 36 L52 45 Q39 48 26 45 Z" fill="url(#tuki-vr-neon)" opacity="0.88"/><path d="M27 41 L34 41 L37 38 L40 44 L43 41 L51 41" fill="none" stroke="#ffffff" stroke-width="1.4" stroke-linecap="round" opacity="0.95"/><circle cx="26" cy="38" r="1.3" fill="#22d3ee"/><circle cx="52" cy="38" r="1.3" fill="#f43f5e"/><line x1="28" y1="35" x2="50" y2="35" stroke="#67e8f9" stroke-width="0.8" opacity="0.6"/><path d="M54 38 Q59 37 63 40" stroke="#06b6d4" stroke-width="2" stroke-linecap="round" fill="none"/>',
    cowboy: '<path d="M14 32 Q26 26 40 28 Q54 26 66 32 Q54 35 40 33 Q26 35 14 32 Z" fill="#92400e" stroke="#78350f" stroke-width="1.5"/><path d="M27 28 Q32 14 41 18 Q50 14 53 28 Z" fill="#b45309" stroke="#78350f" stroke-width="1.5"/><rect x="28" y="26" width="25" height="3" fill="#78350f"/>'
  }[h] || '';

  const handLayer = {
    mic: '<path d="M12 60 L18 72" stroke="#475569" stroke-width="3" stroke-linecap="round"/><rect x="9" y="52" width="7" height="10" rx="3.5" fill="#f59e0b" stroke="#d97706" stroke-width="1"/><line x1="10" y1="56" x2="15" y2="56" stroke="#fff" stroke-width="1"/>',
    coffee: '<rect x="7" y="64" width="12" height="10" rx="2" fill="#dc2626"/><path d="M7 68 C3 68 3 72 7 72" stroke="#dc2626" stroke-width="1.5" fill="none"/><path d="M10 60 Q12 56 10 52 M14 60 Q16 56 14 52" stroke="#94a3b8" stroke-width="1.2" fill="none"/>',
    book: '<rect x="5" y="60" width="15" height="18" rx="2" fill="#1d4ed8" stroke="#1e40af" stroke-width="1"/><line x1="7" y1="60" x2="7" y2="78" stroke="#f8fafc" stroke-width="2"/><text x="9" y="72" font-size="7" font-weight="bold" fill="#fff">EN</text>',
    flag: '<line x1="7" y1="42" x2="7" y2="78" stroke="#64748b" stroke-width="2" stroke-linecap="round"/><rect x="7" y="44" width="16" height="6" fill="#facc15"/><rect x="7" y="50" width="16" height="3" fill="#1d4ed8"/><rect x="7" y="53" width="16" height="3" fill="#dc2626"/>',
    wand: '<line x1="6" y1="74" x2="15" y2="52" stroke="#4c1d95" stroke-width="2.5" stroke-linecap="round"/><polygon points="15,48 17,52 21,52 18,55 19,59 15,56 11,59 12,55 9,52 13,52" fill="#facc15"/>',
    trophy: '<path d="M5 60 Q5 72 11 72 Q17 72 17 60 Z" fill="#f59e0b" stroke="#d97706" stroke-width="1"/><path d="M3 62 C1 66 5 68 7 68 M19 62 C21 66 17 68 15 68" stroke="#d97706" stroke-width="1.2" fill="none"/><rect x="9" y="72" width="4" height="5" fill="#d97706"/><rect x="7" y="77" width="8" height="3" rx="1" fill="#78350f"/>'
  }[hand] || '';

  return `<svg ${size}viewBox="0 0 100 100" class="tuki-svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${defs}${colors.aura}<!-- Sombra de suelo --><ellipse cx="44" cy="96" rx="28" ry="4" fill="url(#tuki-ground-shadow)"/>${capeBehind}<g class="tuki-body-group"><!-- Cuerpo 3D esférico --><ellipse cx="46" cy="58" rx="30" ry="34" fill="url(#tuki-body-grad-${pl})"/><!-- Brillo de contorno superior (Rim Light) --><path d="M22 40 C28 29 48 30 64 42" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="0.18"/><!-- Sombra de oclusión en base del torso --><path d="M26 78 C34 88 56 88 66 78 C58 84 34 84 26 78 Z" fill="${colors.bodyDark}" opacity="0.45"/><!-- Pecho 3D convexo con volumen y brillo --><ellipse cx="45" cy="69" rx="17.5" ry="19" fill="${colors.bodyDark}" opacity="0.25"/><ellipse cx="44" cy="66" rx="17" ry="20" fill="url(#tuki-chest-grad-${pl})"/><ellipse cx="40" cy="58" rx="8" ry="10" fill="#ffffff" opacity="0.28"/><path d="M32 68 Q38 73 44 73 Q50 73 56 68 Q50 76 44 77 Q38 76 32 68 Z" fill="${colors.chestDark}" opacity="0.35"/><path d="M35 74 Q44 78 53 74 Q44 81 35 74 Z" fill="${colors.chestDark}" opacity="0.3"/><!-- Ala 3D con sombreado y plumas escalonadas --><path d="M19 61 C8 72 12 87 25 88" stroke="#000000" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.25"/><path class="tuki-wing" d="M20 60 C10 70 14 84 24 86 C21 79 20 73 22 66 Z" fill="url(#tuki-wing-grad-${pl})"/><path d="M21 62 C15 69 16 77 22 81" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.3"/><path class="tuki-wing-inner" d="M17 68 C13 74 15 81 21 84" stroke="${colors.wingDark}" stroke-width="1.3" fill="none" opacity="0.5"/><!-- Patas 3D con volumen cilíndrico y garras --><g class="tuki-feet"><ellipse cx="28" cy="97" rx="5" ry="1.8" fill="url(#tuki-ground-shadow)"/><ellipse cx="42" cy="98" rx="5" ry="1.8" fill="url(#tuki-ground-shadow)"/><ellipse cx="56" cy="97" rx="5" ry="1.8" fill="url(#tuki-ground-shadow)"/><path d="M30 89 L26 97 M42 91 L42 98 M54 89 L58 97" stroke="url(#tuki-foot-grad)" stroke-width="4.5" stroke-linecap="round"/><path d="M30 89 L26 97 M42 91 L42 98 M54 89 L58 97" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" opacity="0.4"/><circle cx="25.5" cy="97" r="1.4" fill="#78350f"/><circle cx="42" cy="98" r="1.4" fill="#78350f"/><circle cx="58.5" cy="97" r="1.4" fill="#78350f"/></g>${outfitLayer}${handLayer}</g><g class="tuki-head-group"><!-- Antifaz orbital toucan 3D --><ellipse cx="40" cy="40" rx="13.2" ry="12.8" fill="${colors.eyePatch}" opacity="0.22"/><ellipse cx="40" cy="40" rx="12.2" ry="11.8" fill="${colors.bodyDark}" opacity="0.35"/><!-- Ojo esférico 3D con lente gloss y reflejos múltiples --><g class="tuki-eye"><circle cx="40" cy="40" r="11" fill="url(#tuki-eye-sphere)"/><path d="M30 36 C34 32 46 32 50 36 C45 34 35 34 30 36 Z" fill="#94a3b8" opacity="0.4"/><circle cx="42" cy="40" r="5.8" fill="url(#tuki-iris-grad)"/><circle cx="42" cy="40" r="5.8" fill="none" stroke="#60a5fa" stroke-width="0.8" opacity="0.5"/><ellipse cx="44.2" cy="37.8" rx="2.2" ry="1.8" transform="rotate(-20 44.2 37.8)" fill="#ffffff"/><circle cx="40.2" cy="42.6" r="1.1" fill="#ffffff" opacity="0.9"/><circle cx="45" cy="41" r="0.6" fill="#ffffff" opacity="0.75"/></g><!-- Pico 3D esculpido con cresta de brillo y oclusión --><g class="tuki-beak"><path d="M50 33 C47 38 47 46 51 51" stroke="#0f172a" stroke-width="2.8" stroke-linecap="round" fill="none" opacity="0.6"/><path class="tuki-beak-top" d="M50 34 C70 26 94 32 97 44 C92 52 72 54 52 50 Z" fill="url(#tuki-bt-${pl})"/><path d="M54 35.5 C70 30 88 34 94 42" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="0.55"/><path d="M58 35 C72 31 84 34 90 39" stroke="#ffffff" stroke-width="1" stroke-linecap="round" fill="none" opacity="0.8"/><path class="tuki-beak-bot" d="M52 46 C70 48 88 48 97 44 C92 54 70 58 52 50 Z" fill="url(#tuki-bb-${pl})"/><path d="M56 50 C70 55 86 52 93 47" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.25"/><path d="M51 48 C70 50.5 88 49.5 96 43.5" stroke="#3b0707" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.5"/><path d="M88 39 C93 38 97 43 97 44 C94 49 90 49 88 46 Z" fill="#090d16"/><circle cx="93.5" cy="41.5" r="1.6" fill="#ffffff" opacity="0.7"/><circle cx="94" cy="43.5" r="2.8" fill="#1f2a33" opacity="0.6"/></g>${hatLayer}</g></svg>`;
}
export let MASCOT = renderTukiSVG();
export function updateMascot() {
  MASCOT = renderTukiSVG();
}

/* =================== ESTADO / PERSISTENCIA =================== */

export const currentLesson = () => LESSONS.find(l => !isDone(l.id)) || null;

/* ---- ítems para tarjetas ---- */
export function lessonItems(l) {
  const out = [];
  if (l.type === 'dialog') l.lines.filter(x => x[0] === 'B').forEach(x => out.push({ key: 's:' + x[1], en: x[1], es: x[2], kind: 'frase', lesson: l.id }));
  else {
    l.ex.forEach(x => out.push({ key: 'w:' + x[0], en: x[0], es: x[1], kind: 'palabra', lesson: l.id }));
    l.sents.forEach(x => out.push({ key: 's:' + x[0], en: x[0], es: x[1], kind: 'frase', lesson: l.id }));
  }
  return out;
}

/* ---- hearts / streak / xp ---- */

export function addCoins(n, reason = '') {
  S.coins = Math.max(0, (S.coins || 0) + n);
  save();
  const scEl = $('#stCoins');
  if (scEl) scEl.innerHTML = '🪙 ' + S.coins;
  if (reason) toast(`🪙 ${n >= 0 ? '+' : ''}${n} monedas (${reason})`, 2500);
}

/* Count-up de XP/monedas en pantallas de fin (fase premium, etapa 3):
   anima el número desde 0 hasta el total con ease-out; con movimiento
   reducido pone el total de inmediato. El valor final ya está escrito en
   el HTML, así que si el elemento se desmonta a mitad de animación el
   número mostrado sigue siendo el correcto. */
export function countUp(el, dur = 750) {
  if (!el) return;
  const to = Number(el.dataset.countup);
  if (!Number.isFinite(to)) return;
  const prefix = el.dataset.countupPrefix || '', suffix = el.dataset.countupSuffix || '';
  if (tukiMoodReduced()) { el.textContent = prefix + to + suffix; return; }
  if (el._countUpRaf) cancelAnimationFrame(el._countUpRaf);
  const t0 = performance.now();
  const tick = now => {
    const p = Math.min(1, (now - t0) / dur);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = prefix + Math.round(to * e) + suffix;
    if (p < 1) el._countUpRaf = requestAnimationFrame(tick);
    else el._countUpRaf = null;
  };
  el.textContent = prefix + '0' + suffix;
  el._countUpRaf = requestAnimationFrame(tick);
}
export function countUpAll(root) {
  if (!root) return;
  root.querySelectorAll('[data-countup]').forEach(el => countUp(el));
}

/* Pista fonémica uniforme en errores (fase premium, etapa 6): mismo
   formato en lecciones (oído y voz) y en la repetición de la práctica
   diaria: el tip fonémico de Azure del resultado de voz cuando existe,
   si no el sonido de la lección con su tip de PH_TIPS y su colocación
   de boca. No inventa datos: sin sonido ni tips, no muestra nada.
   Solo se usa en errores; nunca cambia la evaluación ni el puntaje. */
export function phonemeHintHTML(l, r) {
  const tip = (r && r.tips && r.tips[0]) || null;
  if (tip) return `<div class="ph-hint"><div class="ph-hint-title">🎯 Qué corregir</div><div>${esc(tip)}</div></div>`;
  if (!l || !l.sound) return '';
  const t = PH_TIPS[l.sound];
  return `<div class="ph-hint"><div class="ph-hint-title">🎯 Qué corregir · /${esc(l.sound)}/</div>${t ? `<div>${esc(t)}</div>` : ''}${l.mouth ? `<div class="ph-hint-mouth">👄 ${esc(l.mouth)}</div>` : ''}</div>`;
}

/* AUDIO: TTS + BEEPS -> ver src/audio.js (beep, fanfarrias y AC quedan aqui) */
/* AUDIO: TTS + BEEPS (dispositivo) -> ver src/audio.js */

/* Selector de elementos enfocables para el focus trap del modal (etapa 7):
   se calcula en vivo en cada Tab, porque el contenido del sheet puede
   cambiar después de montar (p. ej. la tienda re-renderiza sus tarjetas). */
const MODAL_FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
function modalFocusable(sheet) {
  return [...sheet.querySelectorAll(MODAL_FOCUSABLE)].filter(el => {
    if (el.type === 'hidden') return false;
    if (el.style && el.style.display === 'none') return false;
    try { const cs = getComputedStyle(el); if (cs && (cs.display === 'none' || cs.visibility === 'hidden')) return false; } catch (e) {}
    return true;
  });
}

export function modal(html, onMount) {
  const root = $('#modalRoot'); const ov = document.createElement('div'); ov.className = 'overlay';
  ov.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" tabindex="-1">${html}</div>`;
  ov.addEventListener('click', e => { if (e.target === ov) close(); });
  // (fase premium, etapa 7: modal accesible — focus trap, cierre con
  // Escape y devolución del foco al elemento que lo abrió. No cambia la
  // firma de modal() ni la animación de cierre de la etapa 3: se respeta
  // la guarda dataset.closing y el temporizador de 200 ms. El foco solo
  // se devuelve si no hay otro modal abierto, para no sacarlo del modal
  // que se abrió encadenado tras cerrar este.)
  const opener = document.activeElement;
  const sheet = ov.firstElementChild;
  function restoreFocus() {
    try {
      if (document.querySelector('.overlay')) return;
      if (opener && document.contains(opener) && typeof opener.focus === 'function') opener.focus({ preventScroll: true });
    } catch (e) {}
  }
  ov.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.stopPropagation(); close(); return; }
    if (e.key !== 'Tab') return;
    const f = modalFocusable(sheet);
    if (!f.length) { e.preventDefault(); return; }
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus({ preventScroll: true }); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus({ preventScroll: true }); }
  });
  // (fase premium, etapa 3: cierre animado; la guarda evita overlays
  // huérfanos si se cierra dos veces seguidas, y con movimiento reducido
  // se elimina de inmediato, sin esperar la animación)
  function close() {
    if (ov.dataset.closing) return;
    if (tukiMoodReduced()) { ov.remove(); restoreFocus(); return; }
    ov.dataset.closing = '1'; ov.classList.add('closing');
    setTimeout(() => { ov.remove(); restoreFocus(); }, 200);
  }
  root.appendChild(ov);
  const first = modalFocusable(sheet)[0];
  if (first) first.focus({ preventScroll: true });
  else sheet.focus({ preventScroll: true });
  onMount && onMount(ov.firstElementChild, close); return close;
}
export function confirmBox(title, text, okLabel, onOk, danger) {
  modal(`<h2>${esc(title)}</h2><p class="muted">${esc(text)}</p><div class="row" style="margin-top:16px"><button class="btn ghost block" data-x>Cancelar</button><button class="btn ${danger ? 'red' : 'primary'} block" data-ok>${esc(okLabel)}</button></div>`,
    (el, close) => { $('[data-x]', el).onclick = close; $('[data-ok]', el).onclick = () => { close(); onOk(); }; });
}
/* ---- Guía fonética figurada en español para principiantes ---- */
export const SPANISH_PHONETICS = {
  hello: 'jelóu', hi: 'jái', morning: 'mór-nin', goodbye: 'gud-bái', bye: 'bái',
  please: 'plíiz', thank: 'zænk', you: 'iú', thanks: 'zænks', welcome: 'wél-kam',
  sorry: 'sór-ri', excuse: 'ex-kiús', me: 'mí', help: 'jelp', slowly: 'slóu-li',
  understand: 'an-der-stænd', repeat: 'ri-píit', speak: 'spíik', english: 'ín-glish',
  yes: 'yés', no: 'nóu', water: 'uó-rer', coffee: 'kó-fi', tea: 'tíi',
  good: 'gud', day: 'déi', night: 'náit', today: 'tu-déi', tomorrow: 'tu-mó-rou',
  friend: 'frend', name: 'néim', love: 'lav', like: 'láik', want: 'uónt',
  need: 'níid', have: 'jæv', live: 'liv', leave: 'líiv', ship: 'ship', sheep: 'shíip',
  cat: 'kæt', cut: 'kat', best: 'best', vest: 'vest', think: 'zink', this: 'dis',
  mother: 'má-der', brother: 'brá-der', school: 'skúul', street: 'stríit', worked: 'uerkt'
};
export function getPhoneticHint(word) {
  const clean = String(word || '').toLowerCase().replace(/[^a-z']/g, '');
  return SPANISH_PHONETICS[clean] || '';
}

/** Palabras tocables: cada palabra se puede escuchar lento con guía fonética para novatos */
export function wordsHTML(text, words) {
  const toks = words ? words : text.split(/\s+/).filter(Boolean).map(tok => ({ tok }));
  const isNovice = (S && S.settings && S.settings.learnerLevel === 'novice');
  return toks.map(w => {
    const clean = w.tok.replace(/[.,!?;:"¿¡]/g, '');
    const hint = isNovice ? getPhoneticHint(clean) : '';
    return `<span class="wd-wrap" style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:bottom;margin:0 2px"><span class="wd ${w.c || ''}" data-say="${esc(clean)}" title="Toca para escuchar lento">${esc(w.tok)}</span>${hint ? `<span class="pron-hint" style="font-size:10px;color:var(--o-d);line-height:1;margin-top:2px;font-weight:700">/${esc(hint)}/</span>` : ''}</span>`;
  }).join(' ');
}

export function spawnTukiParticles(parentEl, type = 'happy') {
  if (!parentEl) return;
  const rect = parentEl.getBoundingClientRect();
  const w = rect.width || 70, h = rect.height || 70;
  const icons = type === 'coin' ? ['🪙', '✨', '🪙', '🌟'] : type === 'love' ? ['❤️', '✨', '💖', '⭐'] : type === 'sparkle' ? ['✨', '💎', '🌟', '✦', '⚡'] : ['✨', '⭐', '🎶', '🦜', '💫', '🎉'];
  for (let i = 0; i < 5; i++) {
    const p = document.createElement('span');
    p.className = 'tuki-particle';
    p.textContent = pick(icons);
    const x = (Math.random() - 0.5) * 56;
    const y = (Math.random() - 0.5) * 20;
    p.style.setProperty('--tx', `${x}px`);
    p.style.setProperty('--ty', `${-35 - Math.random() * 35}px`);
    p.style.left = `${w / 2}px`;
    p.style.top = `${h / 2}px`;
    parentEl.appendChild(p);
    setTimeout(() => p.remove(), 900);
  }
}

export function triggerTukiAnimation(el, animClass = 'tuki-wiggle', particleType = 'happy') {
  const m = el ? ($('.brand-mascot-wrap', el) || $('.mascot', el) || $('.tuki-tutor-mascot', el) || el) : null;
  if (!m) return;
  m.classList.remove('tuki-wiggle', 'tuki-celebrate', 'tuki-comfort');
  void m.offsetWidth;
  m.classList.add(animClass);
  spawnTukiParticles(m, particleType);
  setTimeout(() => m.classList.remove(animClass), 900);
}

/* ---- Coordinador de estado de Tuki (Fase premium, etapa 1) ----
   Una sola API para pedir estados de Tuki: tukiMood(estado, opts).
   El estado vive en JS + clases CSS en el wrapper de la mascota, nunca
   dentro del string SVG: MASCOT se re-renderiza al cambiar la skin y
   perdería cualquier estado guardado dentro.
   Prioridad (un estado nuevo solo interrumpe al actual si su prioridad es
   mayor o igual; 'idle' siempre limpia): speaking 90 > celebration 80 >
   excited/proud 70 > happy/confused/sad 60 > thinking/listening 50 >
   sleeping 10 > idle 0. Los estados transitorios vuelven solos a idle.
   Reutiliza triggerTukiAnimation por dentro; no lo duplica ni lo reescribe.
   Con movimiento reducido no se anima nada decorativo: el estado se registra
   igual (y las poses de estado, como los ojos cerrados de 'sleeping', se
   aplican como cambio instantáneo), pero sin partículas ni clases de salto. */
export const TUKI_MOOD_PRIORITY = { idle: 0, sleeping: 10, thinking: 50, listening: 50, happy: 60, confused: 60, sad: 60, proud: 70, excited: 70, celebration: 80, speaking: 90 };
const TUKI_MOOD_MS = { happy: 900, excited: 1000, confused: 1200, sad: 900, proud: 1200, celebration: 1200 };
const TUKI_MOOD_CLASSES = ['tuki-mood-thinking', 'tuki-mood-listening', 'tuki-mood-confused', 'tuki-mood-sleeping', 'tuki-mood-proud'];
const TUKI_MOOD_ANIM = ['tuki-wiggle', 'tuki-celebrate', 'tuki-comfort'];
let tukiMoodCurrent = 'idle';
let tukiMoodTimer = null;
let tukiMoodTargets = [];

export function tukiMoodReduced() {
  try {
    if (typeof S !== 'undefined' && S && S.settings && S.settings.reduceMotion) return true;
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
  } catch (e) {}
  return false;
}
export function getTukiMood() { return tukiMoodCurrent; }

function tukiMoodResolve(el) {
  if (el) {
    const m = (el.matches && el.matches('.brand-mascot-wrap,.mascot,.tuki-tutor-mascot,.tc-mascot')) ? el : ($('.brand-mascot-wrap', el) || $('.mascot', el) || $('.tuki-tutor-mascot', el) || $('.tc-mascot', el) || el);
    return m ? [m] : [];
  }
  return $$('.brand-mascot-wrap, .mascot, .tuki-tutor-mascot, .tc-mascot, #companionMascot');
}
function tukiMoodClearClasses(els) {
  els.forEach(m => m.classList.remove('tuki-talking', ...TUKI_MOOD_ANIM, ...TUKI_MOOD_CLASSES));
}

export function tukiMood(state, opts = {}) {
  if (!Object.prototype.hasOwnProperty.call(TUKI_MOOD_PRIORITY, state)) return tukiMoodCurrent;
  // 'speaking' sin la clase visible = el habla terminó (speakTukiEs quita
  // .tuki-talking en onDone) sin avisar al coordinador: no bloquea.
  if (tukiMoodCurrent === 'speaking' && state !== 'speaking' && !tukiMoodTargets.some(m => m.classList.contains('tuki-talking'))) tukiMoodCurrent = 'idle';
  if (state !== 'idle' && TUKI_MOOD_PRIORITY[state] < TUKI_MOOD_PRIORITY[tukiMoodCurrent]) return tukiMoodCurrent;
  if (tukiMoodTimer) { clearTimeout(tukiMoodTimer); tukiMoodTimer = null; }
  const targets = tukiMoodResolve(opts.el);
  tukiMoodClearClasses([...new Set([...tukiMoodTargets, ...targets])]);
  tukiMoodTargets = targets;
  tukiMoodCurrent = state;
  if (state === 'idle') return 'idle';
  const reduced = tukiMoodReduced();
  const chirp = opts.chirp === undefined ? ({ happy: 'chirp', excited: 'celebrate', celebration: 'celebrate', sad: 'comfort', proud: 'celebrate', confused: 'chirp' })[state] || null : opts.chirp;
  if (chirp) { try { tukiChirp(chirp); } catch (e) {} }
  const anim = (cls, particles) => {
    if (reduced) return;
    targets.forEach(m => {
      if (opts.particles === false) m.classList.add(cls);
      else triggerTukiAnimation(m, cls, particles || 'happy');
    });
  };
  const pose = cls => targets.forEach(m => m.classList.add(cls));
  if (state === 'happy') anim('tuki-wiggle', opts.particles || 'happy');
  else if (state === 'excited') anim('tuki-celebrate', opts.particles || 'sparkle');
  else if (state === 'celebration') anim('tuki-celebrate', opts.particles || 'happy');
  else if (state === 'sad') anim('tuki-comfort', opts.particles || 'happy');
  else if (state === 'proud') { pose('tuki-mood-proud'); if (!reduced && opts.particles !== false) targets.forEach(m => spawnTukiParticles(m, opts.particles || 'sparkle')); }
  else if (state === 'confused') pose('tuki-mood-confused');
  else if (state === 'thinking') pose('tuki-mood-thinking');
  else if (state === 'listening') pose('tuki-mood-listening');
  else if (state === 'sleeping') pose('tuki-mood-sleeping');
  else if (state === 'speaking') pose('tuki-talking');
  const ms = opts.duration != null ? opts.duration : (TUKI_MOOD_MS[state] || 0);
  if (ms > 0) {
    tukiMoodTimer = setTimeout(() => {
      tukiMoodTimer = null;
      if (tukiMoodCurrent === state) { tukiMoodClearClasses(tukiMoodTargets); tukiMoodCurrent = 'idle'; }
    }, ms);
  }
  return state;
}

/* ---- Tuki se duerme por inactividad (fase premium, etapa 2) ----
   Un único temporizador que se reinicia con cada interacción del usuario.
   Tras 90 s sin interacción, y solo si el estado actual es 'idle', Tuki se
   duerme; al interactuar de nuevo despierta (solo se pide 'idle' si está
   durmiendo, para no cortar una celebración en curso). No interfiere con
   lecciones, voz en vivo ni modales abiertos: en esos casos el temporizador
   se rearma y lo vuelve a intentar más tarde. Con movimiento reducido el
   cambio es instantáneo (lo garantiza tukiMood). */
export const TUKI_SLEEP_MS = 90e3;
let tukiSleepTimer = null;
let tukiSleepWatchOn = false;
export function tukiSleepBusy() {
  try {
    if (document.hidden) return true;
    if (document.querySelector('.overlay')) return true; // modal abierto
    if (typeof L !== 'undefined' && L && !$('#full').classList.contains('hidden')) return true; // lección en curso
    if (typeof LIVE !== 'undefined' && LIVE && LIVE.on) return true; // voz en vivo
  } catch (e) {}
  return false;
}
function tukiSleepArm() {
  if (tukiSleepTimer) clearTimeout(tukiSleepTimer);
  tukiSleepTimer = setTimeout(() => {
    tukiSleepTimer = null;
    if (getTukiMood() !== 'idle' || tukiSleepBusy()) { tukiSleepArm(); return; }
    tukiMood('sleeping');
  }, TUKI_SLEEP_MS);
}
function tukiSleepWake() {
  if (getTukiMood() === 'sleeping') tukiMood('idle');
  tukiSleepArm();
}
export function initTukiSleepWatch() {
  if (tukiSleepWatchOn || typeof document === 'undefined') return;
  tukiSleepWatchOn = true;
  document.addEventListener('pointerdown', tukiSleepWake, { passive: true });
  document.addEventListener('keydown', tukiSleepWake);
  document.addEventListener('visibilitychange', () => {
    // (fase premium, etapa 7: el mismo listener que duerme a Tuki también
    // pausa sus animaciones con la pestaña oculta; no se crea un segundo
    // listener de visibilitychange.)
    tukiPauseSetHidden(document.hidden);
    if (document.hidden) { if (tukiSleepTimer) { clearTimeout(tukiSleepTimer); tukiSleepTimer = null; } }
    else tukiSleepArm();
  });
  tukiPauseSetHidden(document.hidden);
  tukiSleepArm();
}

/* ---- Pausa de animaciones de Tuki fuera de pantalla / pestaña oculta
   (fase premium, etapa 7) ----
   Cada instancia de Tuki corre 3 animaciones infinitas (idle 3.4 s,
   blink 3.8 s, headBob 5.2 s) y el drop-shadow de .tuki-svg se recalcula
   en cada cuadro mientras anima. Con un IntersectionObserver se pausa
   (animation-play-state, clase .tuki-paused) lo que no se ve, y con la
   pestaña oculta se pausa todo (clase .tuki-paused-all en <html>, vía el
   visibilitychange que ya existe en initTukiSleepWatch). Al volver a
   verse, la animación sigue donde iba: no se quita ni se reinicia nada.
   Las mascotas se re-renderizan a menudo (render() reescribe el
   innerHTML), así que un MutationObserver re-observa las nuevas y deja
   de observar las que ya no están conectadas. Sin IntersectionObserver
   no se hace nada (navegador viejo: todo sigue animando como antes).
   El drop-shadow se queda en .tuki-svg: moverlo al wrapper cambiaría
   el containing block de los ::after de estado ("?" de confusión, "Z"
   de dormir) en wrappers sin position:relative (guía, compañero); con
   la pausa, el coste por cuadro desaparece fuera de pantalla, que era
   el problema real. */
const TUKI_PAUSE_SELECTOR = '.brand-mascot-wrap,.mascot,.tuki-tutor-mascot,.tc-mascot,.tuki-guide-mascot,.mascot-wrap,#companionMascot';
let tukiPauseIO = null;
let tukiPauseOn = false;
const tukiPauseSeen = new Set();
function tukiPauseSetHidden(hidden) {
  try { document.documentElement.classList.toggle('tuki-paused-all', !!hidden); } catch (e) {}
}
function tukiPauseObserve() {
  if (!tukiPauseIO) return;
  document.querySelectorAll(TUKI_PAUSE_SELECTOR).forEach(el => {
    if (tukiPauseSeen.has(el)) return;
    tukiPauseSeen.add(el);
    tukiPauseIO.observe(el);
  });
  tukiPauseSeen.forEach(el => {
    if (!el.isConnected) { try { tukiPauseIO.unobserve(el); } catch (e) {} tukiPauseSeen.delete(el); }
  });
}
export function initTukiAnimPause() {
  if (tukiPauseOn || typeof document === 'undefined') return;
  tukiPauseOn = true;
  tukiPauseSetHidden(document.hidden);
  if (typeof IntersectionObserver === 'undefined') return;
  tukiPauseIO = new IntersectionObserver(entries => {
    entries.forEach(en => en.target.classList.toggle('tuki-paused', !en.isIntersecting));
  }, { rootMargin: '40px' });
  tukiPauseObserve();
  if (typeof MutationObserver !== 'undefined' && document.body) {
    let scheduled = false;
    const schedule = typeof requestAnimationFrame === 'function'
      ? fn => requestAnimationFrame(fn)
      : fn => setTimeout(fn, 0);
    new MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      schedule(() => { scheduled = false; tukiPauseObserve(); });
    }).observe(document.body, { childList: true, subtree: true });
  }
}

export const TUKI_QUOTES_ES = [
  "¡De una! Recuerda: ¡cada minuto de práctica suma para tu fluidez!",
  "¡Estás hablando más claro cada día! ¡Sigue así!",
  "¡La práctica hace al maestro! No le tengas miedo a equivocarte.",
  "¡Me encanta mi estilo! ¡Gracias por vestirme tan bacano!",
  "¡Pronuncia con calma y ritmo! La música del inglés está en conectar las palabras.",
  "¡Tú tienes todo el potencial! ¡Vamos a romperla hoy!",
  "¡Oído atento y lengua suelta! Si imitas la entonación, sonarás mucho más natural.",
  "¡Qué berraquera! Cada lección completada te acerca más a tus metas.",
  "¡No pares ahora! Mantener la racha diaria es el secreto del éxito.",
  "¡Paso a paso, parcero! Si practicas 5 minutos hoy, tu futuro te lo agradecerá.",
  "¡Excelente vibra! Recuerda tomar agüita y vocalizar bien clarito.",
  "¡Gana monedas y pásate por mi armario a ver qué más me estrenas!"
];

export function speakTukiEs(text, targetEl) {
  if (!S.settings.sound) return;
  const m = targetEl ? ($('.brand-mascot-wrap', targetEl) || $('.mascot', targetEl) || $('.tuki-tutor-mascot', targetEl) || targetEl) : null;
  if (m) m.classList.add('tuki-talking');
  const onDone = () => { if (m) m.classList.remove('tuki-talking'); };
  try {
    speak(text, false, onDone, 'es');
  } catch (e) {
    onDone();
  }
}

export function openTukiCompanionModal(phrase) {
  const notifSupported = 'Notification' in window;
  const notifState = notifSupported ? Notification.permission : 'unsupported';
  const st = streakNow();
  const goal = S.settings.goal;
  const todayXp = todayRec().xp;

  let notifBlock = '';
  if (!notifSupported) {
    notifBlock = `<div class="notice small" style="margin:10px 0">ℹ️ Tu navegador no soporta notificaciones locales.</div>`;
  } else if (notifState === 'default') {
    notifBlock = `
      <div style="background:var(--card-hover, #f0fdf4);border:2px dashed #86efac;border-radius:16px;padding:14px;margin:12px 0;text-align:center">
        <div style="font-weight:900;font-size:14px;color:var(--g-d);margin-bottom:4px">🔔 ¿Cuidamos tu racha diaria?</div>
        <div class="small muted" style="margin-bottom:10px">Permítele a Tuki enviarte un recordatorio a las <b>${S.settings.remindTime || '19:00'}</b> para que nunca pierdas tu progreso.</div>
        <button class="btn primary sm block" id="btnCompanionNotif">🔔 Activar recordatorios de racha</button>
      </div>`;
  } else if (notifState === 'denied') {
    notifBlock = `
      <div style="background:#fef2f2;border:1.5px solid #fecaca;border-radius:14px;padding:10px 12px;margin:12px 0;font-size:12px;color:#991b1b;text-align:left">
        ⚠️ <b>Notificaciones bloqueadas:</b> Para que Tuki pueda avisarte, toca el icono del candado 🔒 en la barra superior de tu navegador y activa "Notificaciones".
      </div>`;
  } else {
    notifBlock = `
      <div style="background:var(--card-hover, #f0fdf4);border:1.5px solid #86efac;border-radius:14px;padding:10px 12px;margin:12px 0;display:flex;align-items:center;justify-content:space-between">
        <div style="text-align:left">
          <div style="font-weight:800;font-size:13px;color:var(--g-d)">✅ Recordatorios diarios activos</div>
          <div class="small muted">Te avisaré cada día a las <b>${S.settings.remindTime || '19:00'}</b></div>
        </div>
        <button class="btn ghost sm" id="btnTestCompanionNotif" style="padding:6px 10px;font-size:12px">Probar 🔔</button>
      </div>`;
  }

  const html = `
    <div style="text-align:center">
      <div style="width:115px;height:115px;margin:0 auto 10px;cursor:pointer" id="companionMascot" title="¡Toca a Tuki!">
        ${MASCOT}
      </div>
      <h2 style="margin:0 0 4px">¡Hola, soy Tuki! 🦜✨</h2>
      <div class="tuki-speech" style="margin:8px auto 14px;max-width:320px;background:var(--card);border:2px solid var(--line);border-radius:14px;padding:10px 14px;font-size:13px;font-weight:700">
        «${esc(phrase)}»
      </div>
      <div class="row" style="justify-content:center;gap:10px;margin-bottom:12px;flex-wrap:wrap">
        <span class="pill" style="font-weight:800">🔥 Racha: ${st} ${st === 1 ? 'día' : 'días'}</span>
        <span class="pill" style="font-weight:800">🎯 Hoy: ${Math.min(todayXp, goal)}/${goal} XP</span>
        <span class="pill" style="font-weight:800">🪙 ${S.coins || 0} monedas</span>
      </div>
    </div>

    ${notifBlock}

    <div class="row wrap" style="gap:8px;margin-top:14px">
      <button class="btn blue block" id="btnCompanionShop">🛍️ Vestir a Tuki (Armario)</button>
      <button class="btn ghost block" data-x>¡Entendido!</button>
    </div>
  `;

  modal(html, (el, close) => {
    $('[data-x]', el).onclick = close;

    const cm = $('#companionMascot', el);
    if (cm) {
      cm.onclick = () => {
        tukiMood('happy', { el: cm, particles: 'sparkle' });
        speakTukiEs(phrase, cm);
      };
      makeMascotClickable(cm, '¡Toca a Tuki!');
    }

    const bShop = $('#btnCompanionShop', el);
    if (bShop) bShop.onclick = () => {
      close();
      openTukiShopModal();
    };

    const bNotif = $('#btnCompanionNotif', el);
    if (bNotif) bNotif.onclick = async () => {
      if (!('Notification' in window)) return toast('Tu navegador no soporta notificaciones.');
      bNotif.disabled = true;
      bNotif.textContent = 'Solicitando permiso…';
      try {
        const p = await Notification.requestPermission();
        if (p === 'granted') {
          S.settings.remindOn = true; // (fix audit 2026-11-06: 'set' no existe en este modulo; es un const local de Ajustes en main.js)
          save();
          tukiChirp('celebrate');
          confetti();
          sendTukiNotification(
            '🦜 ¡Profe Tuki cuida tu racha!',
            `¡Listo! Así te avisará Tuki cada día para no perder tu racha de ${streakNow()} días 🔥. Toca para practicar 5 min.`,
            'tuki-welcome'
          );
          toast('🎉 ¡Notificaciones activadas! Te avisaré cada día.', 3500);
          close();
        } else if (p === 'denied') {
          toast('Permiso denegado. Puedes activarlo tocando el candado 🔒 en la barra de direcciones.', 4000);
          close();
        } else {
          close();
        }
      } catch (err) {
        toast('Error al solicitar permiso: ' + err.message);
        close();
      }
    };

    const bTest = $('#btnTestCompanionNotif', el);
    if (bTest) bTest.onclick = () => {
      sendTukiNotification(
        '🦜 ¡Profe Tuki cuida tu racha!',
        `¡Hola! Todo está listo para que no pierdas tu racha de ${streakNow()} días 🔥.`,
        'tuki-test'
      );
      toast('🔔 ¡Notificación de prueba enviada! Revisa tus notificaciones.', 3000);
    };
  });
}

export function interactWithTuki(el) {
  const m = el ? ($('.brand-mascot-wrap', el) || $('.mascot', el) || $('.tuki-tutor-mascot', el) || el) : null;
  if (m) tukiMood('excited', { el: m, chirp: 'chirp', particles: 'sparkle' });
  const phrase = pick(TUKI_QUOTES_ES);
  if (L) {
    speakTukiEs(phrase, m);
    toast(`🦜 Tuki: "${phrase}"`, 3500);
    return;
  }
  speakTukiEs(phrase, m);
  openTukiCompanionModal(phrase);
}

/* ---- Mascotas clicables por teclado (fase premium, etapa 7) ----
   Las mascotas son <div> con onclick: sin esto no se podían activar con
   teclado. makeMascotClickable les da tabindex/role/aria-label y hace que
   Enter/Espacio disparen el mismo clic (el onclick que ya tienen), sin
   cambiar lo que hacen al tocarlas. La guarda _mascotKeyBound evita
   duplicar el listener en elementos que sobreviven a re-renders, como
   la marca superior (#brand). La mascota de TC (.tc-mascot) no se toca:
   tiene pointer-events:none y aria-hidden, no es clicable. */
export function makeMascotClickable(el, label) {
  if (!el) return el;
  el.setAttribute('tabindex', '0');
  el.setAttribute('role', 'button');
  el.setAttribute('aria-label', label || el.getAttribute('title') || 'Toca a Tuki');
  if (!el._mascotKeyBound) {
    el._mascotKeyBound = true;
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
    });
  }
  return el;
}

export function tukiTutorBannerHTML(opts = {}) {
  const title = opts.title || 'Profe Tuki 🦜';
  const msg = opts.msg || '';
  const sub = opts.sub || '';
  const speakText = opts.speakText || msg;
  return `<div class="tuki-tutor-banner">
    <div class="tuki-tutor-mascot" title="¡Toca al Profe Tuki para escuchar un tip o saludo!">${MASCOT}</div>
    <div class="tuki-tutor-bubble">
      <div class="tuki-tutor-badge">${title}</div>
      <div class="tuki-tutor-msg">${esc(msg)}</div>
      ${sub ? `<div class="tuki-tutor-tip">${esc(sub)}</div>` : ''}
    </div>
    <button class="tuki-tutor-listen-btn" title="Escuchar al Profe Tuki" data-tuki-tutor-say="${esc(speakText)}">🔊</button>
  </div>`;
}

export function bindTukiTutorBanner(body) {
  if (!body) return;
  const m = $('.tuki-tutor-mascot', body);
  if (m) { m.onclick = () => interactWithTuki(m); makeMascotClickable(m, '¡Toca al Profe Tuki para escuchar un tip o saludo!'); }
  const b = $('[data-tuki-tutor-say]', body);
  if (b) b.onclick = () => {
    const txt = b.dataset.tukiTutorSay;
    if (txt) {
      if (m) tukiMood('happy', { el: m, particles: 'happy' });
      speakTukiEs(txt, m);
    }
  };
}

// (Fase 3, modulo 4: movido a src/lessons.js, lineas 1173-1558)

export function lessonSheet(l) {
  const unl = isUnlocked(l), d = S.done[l.id], cur = currentLesson();
  if (!unl) {
    modal(`<div style="text-align:center"><div style="font-size:54px">🔒</div>
      <h2>Lección bloqueada</h2>
      <p class="muted">Sigue el orden de la ruta (estilo Duolingo) para avanzar paso a paso y dominar tu pronunciación.</p>
      ${cur ? `<div class="tipbox" style="margin:12px 0;text-align:left"><b>Lección actual:</b> ${cur.icon} ${esc(cur.title)} <span class="small muted">(${esc(cur.unit.title)})</span></div>` : ''}
      <div class="row" style="margin-top:16px">
        <button class="btn ghost block" data-x>Cerrar</button>
        ${cur ? `<button class="btn primary block" data-cur>Ir a la lección actual 🚀</button>` : ''}
      </div></div>`,
      (el, close) => {
        $('[data-x]', el).onclick = close;
        const bc = $('[data-cur]', el);
        if (bc) bc.onclick = () => { close(); if (cur) lessonSheet(cur); };
      });
    return;
  }
  modal(`<div class="row"><div style="font-size:40px">${l.icon}</div><div><div class="muted small">${esc(l.unit.title)} · Lección ${l.li + 1}</div><h2 style="margin:0">${esc(l.title)}</h2>${!l.type ? `<div class="ipa">/${esc(l.sound)}/</div>` : ''}</div></div>
    <div class="tipbox small">${esc(l.type === 'dialog' ? l.scene : l.expl)}</div>${mouthPanelHTML(l.id, true)}
    ${d && d.placed && !d.times ? '<p class="small muted">✅ Aprobada en la prueba de nivel</p>' : d ? `<p class="small muted">Completada ${d.times} ${d.times === 1 ? 'vez' : 'veces'} · mejor pronunciación ${d.best || '—'}%</p>` : ''}
    <button class="btn primary block" data-go>${d ? 'Repetir lección' : 'Empezar lección'} (+10 XP)</button>${d ? '<button class="btn ghost block" style="margin-top:10px" data-drill>🎯 Práctica de este sonido</button>' : ''}`,
    (el, close) => { const g = $('[data-go]', el); if (g) g.onclick = () => { close(); startLesson(l); }; const dr = $('[data-drill]', el); if (dr) dr.onclick = () => { close(); startLesson(l, 'practice', buildPractice('sound', l.id), 'Práctica: ' + l.title); }; });
}
export function guideSheet(u) {
  modal(`<h2>📘 ${esc(u.title)}</h2>${u.lessons.map(l => `<div class="tipbox"><b>${l.icon} ${esc(l.title)}</b> ${!l.type ? `<span class="ipa">/${esc(l.sound)}/</span>` : ''}<p class="small">${esc(l.type === 'dialog' ? l.scene : l.expl)}</p>${l.mouth ? `<p class="small"><b>👄</b> ${esc(l.mouth)}</p>` : ''}</div>`).join('')}<button class="btn primary block" data-x>Cerrar</button>`, (el, c) => $('[data-x]', el).onclick = c);
}

/* ---- Reglas de desbloqueo progresivo de práctica (estilo Duolingo) ---- */
export const UNLOCK_RULES = {
  // Prácticas básicas
  pairs: { reqLessons: 0, title: 'Pares mínimos rápidos', unit: 'Básico' },
  weak: { reqLessons: 0, title: 'Repaso de sonidos débiles', unit: 'Básico' },
  studio: { reqLessons: 0, title: 'Estudio: grabar y comparar', unit: 'Básico' },
  travel: { reqLessons: 0, title: 'Guía de Viaje y Emergencia', unit: 'Básico' },
  shop: { reqLessons: 0, title: 'Tienda y Armario de Tuki', unit: 'Básico' },
  words: { reqLessons: 1, title: 'Palabras para repetir', unit: 'Unidad 1' },
  // Desbloqueos por unidad
  tc: { reqLessons: 3, title: 'Traduce y completa', unit: 'Unidad 1' },
  srs: { reqLessons: 3, title: 'Repaso Inteligente (SRS)', unit: 'Unidad 1' },
  interview: { reqLessons: 4, title: 'Simulador de Entrevista Laboral (1-10)', unit: 'Unidad 2' },
  mouth: { reqLessons: 6, title: 'Guía Fonética y Bocas', unit: 'Unidad 2' },
  shadow: { reqLessons: 6, title: 'Modo Shadowing', unit: 'Unidad 2' },
  missions: { reqLessons: 9, title: 'Misiones de Conversación Real', unit: 'Unidad 3' },
  handsfree: { reqLessons: 9, title: 'Modo Manos Libres', unit: 'Unidad 3' },
  photo: { reqLessons: 13, title: 'Describe la Foto / Objeto', unit: 'Unidad 4' },
  chat: { reqLessons: 13, title: 'Conversación con IA', unit: 'Unidad 4' }
};

export function isFeatureUnlocked(id) {
  if (S.settings.freeMode) return true;
  const rule = UNLOCK_RULES[id];
  if (!rule) return true;
  const doneCount = Object.keys(S.done).filter(k => isDone(k)).length;
  return doneCount >= rule.reqLessons;
}

export function showLockedFeatureModal(id) {
  const rule = UNLOCK_RULES[id] || { reqLessons: 3, title: 'Esta práctica', unit: 'Modo Aprender' };
  const doneCount = Object.keys(S.done).filter(k => isDone(k)).length;
  const needed = Math.max(0, rule.reqLessons - doneCount);
  const cur = currentLesson();
  modal(`<div style="text-align:center"><div style="font-size:54px">🔒</div>
    <h2>Práctica bloqueada</h2>
    <p class="muted">Para desbloquear <b>${esc(rule.title)}</b>, avanza en el <b>Modo Aprender</b> como en Duolingo.</p>
    <div class="tipbox" style="margin:12px 0;text-align:left">
      <div><b>Requisito:</b> Completar ${rule.reqLessons} lecciones (te faltan <b>${needed}</b>).</div>
      <div class="small muted" style="margin-top:4px">Se desbloquea al avanzar por la <b>${rule.unit}</b>.</div>
    </div>
    <div class="row" style="margin-top:16px">
      <button class="btn ghost block" data-x>Entendido</button>
      <button class="btn primary block" data-go-learn>Ir a Aprender 🚀</button>
    </div></div>`,
    (el, close) => {
      $('[data-x]', el).onclick = close;
      $('[data-go-learn]', el).onclick = () => {
        close();
        go('learn');
        if (cur) setTimeout(() => lessonSheet(cur), 200);
      };
    });
}

export function getTop5Errors() {
  const items = [];
  const seen = new Set();
  Object.entries(S.wd || {}).forEach(([k, r]) => {
    if (!k || k.includes(' ') || k.length < 2 || !r.n) return;
    const avgScore = Math.round(r.sum / r.n);
    if (avgScore < 75 || r.last < 70) {
      const l = LESSON[r.sid] || LESSONS.find(x => (x.ex || []).some(w => w[0].toLowerCase() === k)) || LESSONS[0];
      const ph = l && l.sound ? `/${l.sound}/` : '';
      const tip = (l && l.sound && PH_TIPS[l.sound]) || `Practica pronunciar claro «${r.disp || k}» cuidando las consonantes.`;
      items.push({ id: 'w:' + k, word: r.disp || k, sound: ph, score: Math.min(avgScore, r.last || avgScore), n: r.n, tip, kind: 'word', lesson: l });
      seen.add(k.toLowerCase());
    }
  });
  Object.values(S.hard || {}).forEach(h => {
    const k = normText(h.w).join(' ');
    if (seen.has(k)) return;
    items.push({ id: 'h:' + k, word: h.w, sound: '', score: h.last || 60, n: h.n || 1, tip: h.note || 'Palabra señalada como punto a reforzar en tus prácticas.', kind: 'word', lesson: LESSONS[0] });
    seen.add(k);
  });
  Object.values(S.deck || {}).forEach(c => {
    const k = (c.en || '').trim().toLowerCase();
    if (!k || seen.has(k) || c.kind !== 'palabra') return;
    if (c.reps <= 1 || (c.ease && c.ease < 2.1)) {
      items.push({ id: 'c:' + k, word: c.en, sound: '', score: 65, n: c.reps || 1, tip: c.es ? `Significa «${c.es}». Repasa su significado y pronunciación.` : 'Tarjeta que requiere más repetición en tu mazo.', kind: 'card', lesson: LESSON[c.lesson] || LESSONS[0] });
      seen.add(k);
    }
  });
  LESSONS.forEach(l => {
    if (l.type === 'dialog' || !l.sound) return;
    const a = soundAvg(l.id);
    if (a !== null && a < 78) {
      const tip = PH_TIPS[l.sound] || l.mouth || `Enfócate en la posición de boca para /${l.sound}/.`;
      items.push({ id: 's:' + l.id, word: l.title, sound: `/${l.sound}/`, score: a, n: (S.snd[l.id] || []).length, tip, kind: 'sound', lesson: l });
    }
  });
  items.sort((a, b) => a.score - b.score);
  const DEFAULTS = [
    { word: 'Spain (sin "E")', sound: '/s+cons/', score: 70, tip: 'No digas "E-spain", empieza directamente con el siseo: "ssss-pain".', lesson: LESSON['s-cluster'] || LESSONS[0] },
    { word: 'Worked / Played', sound: '/-ed/', score: 72, tip: 'La -ed en "worked" suena como /t/ (una sola sílaba: "workt").', lesson: LESSON['ed-endings'] || LESSONS[0] },
    { word: 'This / They', sound: '/ð/', score: 72, tip: 'Punta de la lengua entre los dientes y vibra; no es una "d" fuerte.', lesson: LESSON['th-voiced'] || LESSONS[0] },
    { word: 'Sheet vs Shit', sound: '/iː/ vs /ɪ/', score: 74, tip: 'La /iː/ de sheet es larga y sonriente; la /ɪ/ de shit es corta y relajada.', lesson: LESSON['i-sounds'] || LESSONS[0] },
    { word: 'Consonantes finales (Night, Milk)', sound: '/finales/', score: 75, tip: 'Pronuncia la consonante final nítida sin agregar una "e" al final.', lesson: LESSON['final-cons'] || LESSONS[0] }
  ];
  for (const d of DEFAULTS) {
    if (items.length >= 5) break;
    if (!items.some(x => x.word === d.word)) items.push({ id: 'def:' + d.word, ...d, n: 0, isSuggested: true });
  }
  return items.slice(0, 5);
}

export function buildTopErrorsPractice() {
  const top5 = getTop5Errors();
  const q = [];
  top5.forEach(err => {
    const l = err.lesson || LESSONS[0];
    if (err.kind === 'word') {
      q.push({ kind: 'speak', variant: 'word', l, text: err.word, es: err.tip });
      if (l.pairs && l.pairs.length) q.push(sayPairEx(l, pick(l.pairs)));
    } else if (l.pairs && l.pairs.length) {
      q.push(sayPairEx(l, pick(l.pairs)));
      if (l.sents && l.sents.length) { const s = pick(l.sents); q.push({ kind: 'speak', variant: 'sent', l, text: s[0], es: s[1] }); }
    } else if (l.ex && l.ex.length) {
      const w = pick(l.ex);
      q.push({ kind: 'speak', variant: 'word', l, text: w[0], es: w[1] });
    }
  });
  return q.slice(0, 8);
}

export function errES(e, provider) {
  const pre = provider ? provider + ': ' : '';
  if (e && e.friendly) return pre + e.friendly;
  if (!navigator.onLine) return pre + 'Estás sin conexión a internet. Revisa tu red e intenta de nuevo.';
  const st = e && e.status, m = (e && e.message) || String(e || 'error');
  if (e instanceof TypeError || /Failed to fetch|NetworkError|Load failed|network/i.test(m)) return pre + 'No se pudo conectar con el servicio (sin internet, bloqueado por el navegador/antivirus, o región/URL incorrecta).';
  const map = { 400: 'Solicitud inválida (revisa región, modelo o formato).', 401: 'Clave inválida o no autorizada. Revísala en Ajustes.', 403: 'Acceso denegado: la clave no tiene permiso para este servicio, modelo o región.', 404: 'No encontrado: revisa el nombre del modelo o la región.', 408: 'Tiempo de espera agotado. Intenta de nuevo.', 413: 'El audio es demasiado largo.', 415: 'Formato de audio no soportado.', 429: 'Límite de uso alcanzado (cuota agotada o demasiadas solicitudes). Espera un momento o revisa tu plan.', 500: 'Error interno del servicio. Intenta de nuevo.', 501: 'El servicio no soporta esta operación con ese modelo. Prueba otro modelo.', 502: 'El servicio respondió con error (502). Intenta de nuevo.', 503: 'Servicio saturado o no disponible. Intenta en un minuto.', 504: 'El servicio tardó demasiado en responder.' };
  return pre + (map[st] || m) + (map[st] && e.detail ? ` (${String(e.detail).slice(0, 140)})` : '');
}
export async function httpErr(res) { let d = {}; try { d = await res.clone().json(); } catch (x) { try { d = { message: await res.text() }; } catch (y) {} } const msg = (d.error && (d.error.message || d.error.code || (typeof d.error === 'string' ? d.error : ''))) || d.message || res.statusText || ''; const e = new Error(res.status + (msg ? ': ' + msg : '')); e.status = res.status; e.detail = msg; return e; }
/* v2.10 «claves compartidas»: sin clave propia y con sesión iniciada (Google o correo verificado), la IA usa las claves de Tuki
   a través de la API de Vercel. Las claves nunca llegan al navegador: Gemini va por el proxy, Azure con un token de 10 min y
   Gemini Live con un token efímero de un solo uso. Límite diario por persona en el servidor. */
export let STUDIO_TEXT = null; export const STUDIO_PRESET = () => { const t = STUDIO_TEXT; STUDIO_TEXT = null; return t; };

export let LAST_REC = null;
export async function azureMic(btn, onResult, target) {
  btn.classList.add('rec'); btn.innerHTML = '🔴 Escuchando (Azure)… toca para terminar';
  const micMeter = createMicMeter(btn);
  try {
    const n = target.split(/\s+/).length;
    const rec = await MicCap.start({
      maxMs: Math.min(15000, 3500 + n * 700),
      onLevel: rms => micMeter.update(rms)
    });
    micMeter.destroy();
    btn.classList.remove('rec'); btn.innerHTML = '⏳ Analizando pronunciación…';
    const url = URL.createObjectURL(rec.wav); Rec.url = url; LAST_REC = { url, blob: rec.wav, samples: rec.samples };
    const az = await azureAssess(target, rec.wav);
    onResult(az.alts, url, az);
  } catch (e) {
    micMeter.destroy();
    const isLimit = e.status === 429 || (e.detail && /limit|cuota/i.test(e.detail)) || (e.message && /429/i.test(e.message));
    const auth = e.status === 401 || e.status === 403 || isLimit || e instanceof TypeError || !!(e.shared && e.fatal);
    if (auth && HAS_SR) window.__azOff = true;
    if (isLimit) {
      toast('🎙️ Límite diario de Azure alcanzado. Cambiando automáticamente al micrófono del navegador para que sigas aprendiendo.', 4000);
    } else {
      toast('Azure: ' + errES(e) + (auth && HAS_SR ? ' Usaré el reconocimiento del navegador por ahora.' : ''), 4000);
    }
    if (auth && HAS_SR) {
      btn.classList.remove('rec');
      return doMic(btn, onResult, target);
    }
  } finally {
    micMeter.destroy();
    btn.classList.remove('rec');
    btn.innerHTML = '🎤 Toca para hablar de nuevo';
  }
}
export function scoreBar(label, v) { if (v == null) return ''; const c = v >= 80 ? 'var(--g)' : v >= 60 ? 'var(--o)' : 'var(--r)'; return `<div class="az-bar">${label} · ${Math.round(v)}<div class="tr"><i style="width:${v}%;background:${c}"></i></div></div>`; }
export function azurePanelHTML(r) {
  const sc = r.scores || {};
  return `<div class="az"><div class="small muted">🔬 Evaluación Azure (fonema por fonema)</div>
    <div class="az-bars">${scoreBar('Precisión', sc.acc)}${scoreBar('Fluidez', sc.flu)}${scoreBar('Integridad', sc.comp)}${scoreBar('Prosodia', sc.pros)}</div>
    <div>${r.words.map(w => `<span class="phw"><span class="w wd ${w.c}" data-say="${esc(w.tok.replace(/[.,!?;:"¿¡]/g, ''))}">${esc(w.tok)}</span><span>${(w.ph || []).map(p => `<span class="ph ${colorOf(p.s / 100)}" title="${p.s}/100${p.nb && p.nb !== p.p ? ' · sonó como /' + esc(p.nb) + '/' : ''}">${esc(p.p)}</span>`).join('')}</span></span>`).join('')}</div>
    ${r.tips && r.tips.length ? `<ul class="tips small">${r.tips.map(t => `<li>🗣️ ${esc(t)}</li>`).join('')}</ul>` : '<div class="small" style="margin-top:6px">✅ ¡Todos los sonidos se escucharon bien!</div>'}</div>`;
}
export function extraResultHTML(r, target, url, ex) { return `${r && r.engine === 'azure' ? azurePanelHTML(r) : ''}<div style="margin-top:10px"><button class="btn ghost sm" data-viz>📊 Onda y entonación</button></div><div class="viz"></div>`; }
export function bindExtra(root, r, target, url, ex) {
  const b = $('[data-viz]', root), box = $('.viz', root); if (!b) return;
  b.onclick = () => { b.remove(); drawViz(box, target, url); };
  if (ex && ex.l && ex.l.id === 'intonation' && url) b.click();
}

/* VISUALIZACIÓN: ONDA Y TONO -> ver src/audio.js (decodeAudio/drawViz quedan aqui) */

export async function drawViz(box, target, url) {
  box.innerHTML = `<div class="small muted" style="margin-top:8px">🔵 Modelo nativo</div><canvas id="cvM"></canvas><div class="small muted" style="margin-top:6px">🟠 Tu voz</div><canvas id="cvU"></canvas><div class="small" id="intoMsg" style="margin-top:6px"></div>`;
  const msg = []; let dirU = null;
  try {
    if (cloudTTSReady()) { const d = await decodeAudio(await cloudTTSBlob(target, false)); drawTrack($('#cvM', box), d, pitchTrack(d), '#1591cc'); }
    else { $('#cvM', box).replaceWith(Object.assign(document.createElement('div'), { className: 'notice small', textContent: 'Para ver la curva del modelo activa una voz en la nube (Azure u OpenAI) en Ajustes: la voz del dispositivo no permite capturar su audio.' })); }
  } catch (e) { msg.push('No se pudo analizar el modelo: ' + errES(e)); }
  try {
    const src = (LAST_REC && (LAST_REC.samples || LAST_REC.blob)) || url || (LAST_REC && LAST_REC.url);
    if (!src) throw Object.assign(new Error('sin grabación'), { friendly: 'Activa "Grabar mi voz" en Ajustes (o usa Azure) para ver tu curva.' });
    const d = await decodeAudio(src); const p = pitchTrack(d); drawTrack($('#cvU', box), d, p, '#d9800a'); dirU = contourDir(p);
  } catch (e) { const c = $('#cvU', box); if (c) c.replaceWith(Object.assign(document.createElement('div'), { className: 'notice small', textContent: e.friendly || ('No se pudo analizar tu grabación: ' + errES(e)) })); }
  if (dirU) { const want = expectRise(target) ? 'up' : 'down'; const lab = { up: 'subió ↗', down: 'bajó ↘', flat: 'quedó plana →' }; msg.push(`Tu entonación ${lab[dirU]} al final. ${want === dirU ? '✅ ¡Correcto para esta frase!' : `Para esta frase lo natural es que ${want === 'up' ? 'SUBA ↗ (pregunta de sí/no)' : 'BAJE ↘'}.`}`); }
  $('#intoMsg', box).textContent = msg.join(' ');
}

/* =================== DIAGRAMAS DE BOCA (SVG) =================== */
export const TONGUE = { 'high-front': [38, 66, 64, 46], 'mid-front': [38, 68, 68, 53], 'low-front': [38, 76, 70, 70], 'mid-central': [40, 72, 82, 62], dental: [25, 60, 70, 62], alveolar: [41, 51, 72, 58], postalveolar: [45, 54, 74, 51], rest: [39, 71, 76, 64], back: [40, 73, 104, 47] };
export function mouthSVG(c) {
  const o = c.o || 0.2, jaw = o * 12, [tx, ty0, dx, dy0] = TONGUE[c.t] || TONGUE.rest, fixedTip = ['dental', 'alveolar', 'postalveolar'].includes(c.t);
  const ty = fixedTip ? ty0 : ty0 + jaw * 0.6, dy = dy0 + jaw * 0.5;
  let ul = { cx: 22, cy: 55, rx: 7, ry: 5 }, ll = { cx: 22, cy: 70 + jaw, rx: 7, ry: 5 };
  if (c.lips === 'closed') { ul.cy = 57; ll.cy = 64; } if (c.lips === 'round') { ul = { cx: 16, cy: 56, rx: 6, ry: 6 }; ll = { cx: 16, cy: 68 + jaw, rx: 6, ry: 6 }; } if (c.lips === 'spread') { ul.ry = 4; ll.ry = 4; ul.rx = 8; ll.rx = 8; } if (c.lips === 'lipteeth') { ll = { cx: 29, cy: 63, rx: 6, ry: 5 }; }
  // (fix qa-text-data: el svg sin ancho explícito se desbordaba en la guía
  // de boca del modal, donde no aplica la regla .mouth svg; con width 100%
  // queda contenido en su caja en ambos usos.)
  return `<svg viewBox="0 0 150 132" style="width:100%;height:auto;display:block" role="img" aria-label="${esc(c.cap || '')}">
  <path d="M40 4 Q18 8 14 26 L4 40 L14 44" fill="none" stroke="#9aa6b0" stroke-width="2"/><path d="M18 86 Q20 108 44 116 Q80 124 100 110" fill="none" stroke="#9aa6b0" stroke-width="2"/>
  <path d="M36 50 Q45 42 60 38 Q90 32 112 44 Q120 50 124 58 L128 124" fill="none" stroke="#7a8793" stroke-width="3" stroke-linecap="round"/>
  <path d="M122 124 C 126 92, ${dx + 28} ${dy - 2}, ${dx} ${dy} S ${tx + 10} ${ty - 3}, ${tx} ${ty} C ${tx - 2} ${ty + 6}, ${tx + 6} ${ty + 10}, ${tx + 14} ${ty + 10} C 70 ${ty + 26}, 100 112, 110 126 Z" fill="#f28b9b" stroke="#d45d72" stroke-width="1.5"/>
  <rect x="30" y="49" width="7" height="11" rx="2" fill="#fff" stroke="#9aa6b0"/><rect x="30" y="${63 + jaw}" width="7" height="10" rx="2" fill="#fff" stroke="#9aa6b0"/>
  <ellipse cx="${ul.cx}" cy="${ul.cy}" rx="${ul.rx}" ry="${ul.ry}" fill="#e57373"/><ellipse cx="${ll.cx}" cy="${ll.cy}" rx="${ll.rx}" ry="${ll.ry}" fill="#e57373"/>
  ${c.air ? `<path d="M118 76 Q70 ${c.t === 'dental' ? 62 : 70} 6 ${c.t === 'dental' ? 60 : 62}" fill="none" stroke="#1cb0f6" stroke-width="2" stroke-dasharray="4 3" marker-end="url(#ah)"/><defs><marker id="ah" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 Z" fill="#1cb0f6"/></marker></defs>` : ''}
  // (fix qa-text-data: "sin vibrar" empezaba en x=112 y con font-size 9 se
  // salía del viewBox de 150 y se recortaba a "sin vibra". Ambas etiquetas
  // ahora terminan en x=148 con text-anchor="end", dentro del viewBox.)
  ${c.v ? `<path d="M132 98 l7 3 l-7 3 l7 3 l-7 3 l7 3" fill="none" stroke="#ff9f1c" stroke-width="2.5"/><text x="148" y="128" font-size="9" fill="#d9800a" font-weight="700" text-anchor="end">vibra</text>` : `<text x="148" y="128" font-size="9" fill="#9aa6b0" font-weight="700" text-anchor="end">sin vibrar</text>`}
  </svg><div>${esc(c.cap || '')}</div>`;
}
export const MOUTHS = {
  'ih-ee': [{ t: 'mid-front', lips: 'neutral', o: .3, v: 1, cap: '/ɪ/ corta: relajada' }, { t: 'high-front', lips: 'spread', o: .1, v: 1, cap: '/iː/ larga: sonrisa, lengua alta' }],
  'ae-uh': [{ t: 'low-front', lips: 'spread', o: .9, v: 1, cap: '/æ/: boca muy abierta' }, { t: 'mid-central', lips: 'neutral', o: .45, v: 1, cap: '/ʌ/: relajada, media' }],
  schwa: [{ t: 'mid-central', lips: 'neutral', o: .3, v: 1, cap: '/ə/: todo relajado' }],
  'b-v': [{ t: 'rest', lips: 'closed', o: 0, v: 1, cap: '/b/: labios juntos' }, { t: 'rest', lips: 'lipteeth', o: .1, v: 1, air: 1, cap: '/v/: dientes sobre el labio' }],
  's-z': [{ t: 'alveolar', lips: 'spread', o: .1, v: 1, air: 1, cap: '/z/: como /s/ pero vibra' }, { t: 'alveolar', lips: 'spread', o: .1, v: 0, air: 1, cap: '/s/: sin vibrar' }],
  'sh-ch': [{ t: 'postalveolar', lips: 'round', o: .15, v: 0, air: 1, cap: '/ʃ/: labios redondos, aire continuo' }, { t: 'alveolar', lips: 'round', o: .1, v: 0, cap: '/tʃ/: empieza como "t"' }],
  'th-voiceless': [{ t: 'dental', lips: 'neutral', o: .2, v: 0, air: 1, cap: '/θ/: lengua entre los dientes' }, { t: 'alveolar', lips: 'spread', o: .1, v: 0, air: 1, cap: '❌ /s/: lengua detrás de los dientes' }],
  'th-voiced': [{ t: 'dental', lips: 'neutral', o: .2, v: 1, air: 1, cap: '/ð/: lengua entre dientes + vibra' }, { t: 'alveolar', lips: 'neutral', o: .1, v: 1, cap: '❌ /d/ fuerte' }],
  'final-cons': [{ t: 'alveolar', lips: 'neutral', o: .1, v: 0, cap: '/t/ final: la lengua sube' }, { t: 'rest', lips: 'closed', o: 0, v: 0, cap: '/p/ final: labios se cierran' }],
  's-cluster': [{ t: 'alveolar', lips: 'spread', o: .05, v: 0, air: 1, cap: 'Empieza con "sss", sin "e"' }],
  'ed-endings': [{ t: 'alveolar', lips: 'neutral', o: .1, v: 0, cap: '/t/ y /d/: lengua detrás de los dientes' }],
  's-endings': [{ t: 'alveolar', lips: 'spread', o: .1, v: 1, air: 1, cap: '/z/ final: vibra' }],
  'flap-t': [{ t: 'alveolar', lips: 'neutral', o: .3, v: 1, cap: 'Toque rápido de lengua (como "r" de "pero")' }],
  'teen-ty': [{ t: 'high-front', lips: 'spread', o: .1, v: 1, cap: '-teen: "iii" larga y fuerte' }, { t: 'alveolar', lips: 'neutral', o: .2, v: 1, cap: '-ty: final corto y suave' }],
  dates: [{ t: 'dental', lips: 'neutral', o: .2, v: 0, air: 1, cap: 'fifth, twelfth: termina en /θ/' }],
  'novice-greetings': [{ t: 'mid-central', lips: 'neutral', o: .4, v: 0, air: 1, cap: 'H suave: aire cálido por garganta' }, { t: 'high-front', lips: 'spread', o: .1, v: 1, cap: 'Hi: di "jái" sonriendo' }],
  'novice-courtesy': [{ t: 'dental', lips: 'neutral', o: .2, v: 0, air: 1, cap: 'Thank: lengua entre los dientes' }, { t: 'high-front', lips: 'spread', o: .1, v: 1, cap: 'Please: alarga "plíiiz"' }],
  'novice-survival': [{ t: 'mid-central', lips: 'neutral', o: .3, v: 1, cap: 'Habla despacio con calma y ritmo relajado' }]
};
export function mouthPanelHTML(id, compact) { const m = MOUTHS[id]; if (!m) return ''; return `<div class="mouths" ${compact ? 'style="margin-top:4px"' : ''}>${m.map(c => `<div class="mouth">${mouthSVG(c)}</div>`).join('')}</div>`; }

/* =================== LECCIONES DE VOCABULARIO =================== */
export function buildVocabLesson(l, mode = 'lesson') {
  const I = shuffle(l.items), all = l.items;
  const meaningQ = it => { const others = shuffle(all.filter(x => x !== it).map(x => x[1])); const opts = [it[1], ...(it[4] ? [it[4]] : []), ...others].filter((o, i, a) => a.indexOf(o) === i).slice(0, 3); return { kind: 'quiz', l, q: { q: `¿Qué significa «${it[0]}»?`, say: it[0], opts, a: 0, expl: `«${it[0]}» = ${it[1]}.` + (it[4] ? ` Ojo: NO significa «${it[4]}».` : '') + ` Ej.: ${it[2]}` } }; };
  const enQ = it => ({ kind: 'quiz', l, q: { q: `¿Cómo se dice «${it[1]}» en inglés?`, say: it[0], hide: true, opts: [it[0], ...shuffle(all.filter(x => x !== it).map(x => x[0])).slice(0, 2)], a: 0, expl: `${it[0]} — ${it[2]}` } });
  const ex = [];
  if (mode === 'lesson') ex.push({ kind: 'learn', l });
  ex.push(meaningQ(I[0]), meaningQ(I[1]));
  ex.push({ kind: 'speak', variant: 'word', l, text: I[0][0], es: I[0][1] });
  ex.push(enQ(I[2]));
  ex.push({ kind: 'speak', variant: 'sentence', l, text: I[1][2], es: I[1][3] });
  ex.push({ kind: 'order', l, text: I[3][2], es: I[3][3], pool: all.map(x => x[2]) });
  ex.push({ kind: 'shadow', l, text: I[4][2], es: I[4][3] });
  ex.push(meaningQ(I[5]));
  if (mode !== 'lesson') ex.push({ kind: 'speak', variant: 'word', l, text: I[5][0], es: I[5][1] });
  return ex;
}
export function renderVocabLearn(ex, body) {
  const l = ex.l;
  body.innerHTML = `<div class="badge-new">VOCABULARIO NUEVO</div><div class="ex-title">${l.icon} ${esc(l.title)}</div>
    ${tukiTutorBannerHTML({
      title: 'Profe Tuki · Vocabulario 📖',
      msg: l.expl || 'Aprende y escucha este vocabulario clave para tu lección.',
      speakText: l.expl || 'Aprende y escucha este vocabulario clave para tu lección.'
    })}
    <div class="wlist">${l.items.map(it => `<div class="witem" style="align-items:flex-start"><button class="spk" data-say-n="${esc(it[0])}">🔊</button><div style="min-width:0"><div class="en">${esc(it[0])} <span class="es">— ${esc(it[1])}</span></div><div class="small">${wordsHTML(it[2])}</div><div class="es small">${esc(it[3])}</div>${it[4] ? `<div class="small" style="color:var(--r)">⚠️ No significa «${esc(it[4])}»</div>` : ''}</div><button class="spk slow" data-say-n="${esc(it[2])}" style="margin-left:auto" title="Escuchar ejemplo">💬</button></div>`).join('')}</div>`;
  $$('[data-say-n]', body).forEach(b => b.onclick = () => speak(b.dataset.sayN));
  setFoot(`<span class="muted small">${L.mode === 'lesson' ? 'Lección ' + (l.li + 1) + ' · ' + esc(l.unit.title) : ''}</span><button class="btn primary" id="primaryBtn">¡Entendido!</button>`);
  $('#primaryBtn').onclick = () => { L.done++; nextEx(); };
}

/* ---- P11 (v2.27.0): prueba de nivel con habla libre (opcional, 1 minuto) ----
   Al final de la prueba fija, solo si hay proveedor de IA, Azure y
   micrófono, y solo una vez por usuario (S.placementFree), se ofrece un
   paso opcional de habla libre con tema guiado. La prueba sigue siendo
   opcional y saltable: el bloque vive DENTRO de la pantalla de resultado
   de placementFinish(), bajo el botón «¡Vamos!», que nunca queda
   bloqueado por la IA; quien no quiera, pulsa «¡Vamos!» o «No, gracias»
   y la prueba termina exactamente como hoy. Costo: 1 token Azure (el
   vigente, cacheado en AZT: STT + evaluación dentro de los mismos
   10 min) + 1 llamada Gemini, una sola vez por usuario. El audio es
   local y nunca se guarda: solo se envía a Azure (transcripción y
   evaluación fonémica, como en las lecciones) y la transcripción a
   Gemini para el resumen. Consentimiento explícito con casilla antes
   de grabar. Los fonemas débiles medidos alimentan S.ph (vía
   recordSpeech, igual que las lecciones) y las palabras, S.wd, así el
   Top 2 ya puede practicarlas. El nivel sugerido NUNCA se aplica solo:
   se ofrece con botones Aceptar/Mantener, como P5. Sin proveedor, sin
   Azure, sin micrófono o con la cuota compartida agotada, el bloque
   no aparece (revelado progresivo, R9). */
export const PLACEMENT_FREE_TOPIC = 'Háblame de ti durante un minuto: quién eres, qué te gusta hacer y por qué quieres aprender inglés.';
export const PLACEMENT_FREE_SYS = `You are "Tuki", an expert English teacher assessing a Spanish-speaking learner from Colombia. The learner just finished a fixed placement test and then spoke freely for up to 1 minute about themselves. You receive the TRANSCRIPTION of that free speech (from speech recognition, so odd words may be pronunciation problems) plus MEASURED pronunciation data from Azure (overall score and weak phonemes).
Return ONLY JSON with this exact shape (Spanish for all *_es fields, Latin American Spanish, use "tú"):
{"level":"A0|A2|B1|B2|C1","summary_es":"1-2 sentences about how the free speech went","foci":["first concrete thing to practice","second","third"],"scores":{"fluency":0-100,"pronunciation":0-100,"vocabulary":0-100}}
Rules: choose the CEFR level that best fits the transcript AND the Azure score (a fluent transcript with a low Azure score stays at the lower level; do not inflate). Exactly 3 foci, each one short concrete action (max 12 words). Base everything ONLY on the transcript and the measured data given. Never invent words, mistakes or topics that are not in the transcript. If the transcript is too short or unclear to judge, pick the level closest to the fixed test suggestion and say so in summary_es. No markdown, no extra fields.`;
export function placementFreeAvailable() {
  if (S.placementFree) return false;
  if (!currentProvider() || !azureReady() || !canSpeak()) return false;
  if (gemShared()) { const q = aiQuotaToday(); if (q && (q.limit - q.used) <= 0) return false; }
  return true;
}
export function placementFreeWeak(az) {
  const agg = {};
  (az && az.words || []).forEach(w => (w.ph || []).forEach(p => { if (p.s < 70) { const a = agg[p.p] || (agg[p.p] = { n: 0, sum: 0 }); a.n++; a.sum += p.s; } }));
  return Object.entries(agg).map(([p, a]) => ({ p, s: Math.round(a.sum / a.n) })).sort((a, b) => a.s - b.s).slice(0, 3);
}
export function placementFreeValidate(d) {
  if (!d || typeof d !== 'object' || Array.isArray(d)) throw new Error('La IA no devolvió un resultado válido.');
  if (!LEVEL_KEYS.includes(d.level)) throw new Error('La IA no devolvió un nivel válido.');
  const foci = (Array.isArray(d.foci) ? d.foci : []).map(f => String(f || '').trim()).filter(Boolean).slice(0, 3);
  if (!foci.length) throw new Error('La IA no devolvió focos de práctica.');
  const sc = d.scores || {}, clamp = v => Math.max(0, Math.min(100, Math.round(+v || 0)));
  return { level: d.level, summary_es: String(d.summary_es || '').slice(0, 500), foci, scores: { fluency: clamp(sc.fluency), pronunciation: clamp(sc.pronunciation), vocabulary: clamp(sc.vocabulary) } };
}
export async function placementFreeAnalyze(transcript, az) {
  const weak = placementFreeWeak(az);
  const lines = [
    `Tema guiado: "${PLACEMENT_FREE_TOPIC}"`,
    `Transcripción de la habla libre:\n${String(transcript || '').slice(0, 2000)}`,
    `Puntaje de pronunciación medido por Azure: ${az && az.pct != null ? az.pct + '/100' : 'sin datos'}.`,
  ];
  if (weak.length) lines.push(`Fonemas más débiles medidos: ${weak.map(w => `/${w.p} / ${w.s}/100`).join(', ')}.`);
  if (az && az.tips && az.tips.length) lines.push(`Pistas fonémicas medidas: ${az.tips.slice(0, 2).join(' ')}`);
  lines.push(`La prueba fija de oído y voz sugirió el nivel ${chatLevel()}.`);
  return placementFreeValidate(await aiJSON(PLACEMENT_FREE_SYS, lines.join('\n'), 1200));
}
export function placementFreeSave(res) {
  if (!res || !res.ai) return null;
  S.placementFree = { date: dayKey(), level: res.ai.level, foci: res.ai.foci, summary_es: res.ai.summary_es, scores: res.ai.scores, azurePct: res.az ? res.az.pct : null, weak: placementFreeWeak(res.az) };
  save(); return S.placementFree;
}
/* Orquesta la captura ya grabada: transcribe con Azure, evalúa los
   fonemas contra la propia transcripción y pide el resumen a Gemini.
   Si Gemini falla, devuelve ai:null con el error: la UI muestra el
   resultado de Azure y ofrece reintentar solo el resumen. */
export async function placementFreeFinish(cap) {
  if (!cap || !cap.spoke || !cap.wav) { const e = new Error('No se detectó voz. Habla más cerca del micrófono e inténtalo de nuevo.'); e.friendly = e.message; throw e; }
  const transcript = String(await azureSTT(cap.wav) || '').trim();
  if (transcript.split(/\s+/).filter(Boolean).length < 3) { const e = new Error('No se entendió suficiente: di al menos unas frases completas e inténtalo de nuevo.'); e.friendly = e.message; throw e; }
  const az = await azureAssess(transcript, cap.wav);
  recordSpeech('placement-free', az);
  let ai = null, aiErr = null;
  try { ai = await placementFreeAnalyze(transcript, az); } catch (e) { aiErr = errES(e); }
  return { transcript, az, ai, aiErr };
}
export function placementFreeHTML() {
  return `<div class="card" style="max-width:420px;width:100%;text-align:left;margin-top:12px"><h3 style="margin:0 0 4px">🎙️ Habla libre (opcional, 1 minuto)</h3>
    <p class="small" style="margin:0 0 6px">¿Quieres afinar tu nivel? Habla 1 minuto sobre ti y Tuki te dirá tu nivel con más detalle y tus 3 primeros focos.</p>
    <p class="small muted" style="margin:0 0 6px"><b>Tema:</b> ${esc(PLACEMENT_FREE_TOPIC)}</p>
    <label class="small" style="display:flex;gap:6px;align-items:flex-start;margin:6px 0"><input type="checkbox" id="plFreeConsent" style="margin-top:2px"><span>Acepto que mi voz se envíe a Azure para evaluar mi pronunciación y a Gemini para el resumen. El audio no se guarda.</span></label>
    <div class="row" style="margin-top:8px"><button class="btn primary sm" id="plFreeRec" type="button">🎙️ Grabar 1 minuto</button><button class="btn ghost sm" id="plFreeSkip" type="button">No, gracias</button></div>
    <div class="small" id="plFreeStatus" style="margin-top:8px" aria-live="polite"></div></div>`;
}
export function placementFreeResultHTML(res) {
  const ai = res.ai, weak = placementFreeWeak(res.az);
  const lvl = ai ? `<p style="margin:0 0 6px"><b>Nivel sugerido: ${esc(LEVELS[ai.level] ? LEVELS[ai.level].label : ai.level)}</b>${ai.level !== chatLevel() ? ` (la prueba fija decía ${esc(chatLevel())})` : ''}.</p>${ai.summary_es ? `<p class="small" style="margin:0 0 6px">${esc(ai.summary_es)}</p>` : ''}
    <p class="small" style="margin:0 0 4px"><b>Tus 3 primeros focos:</b></p><ol class="small" style="margin:0 0 6px;padding-left:18px">${ai.foci.map(f => `<li>${esc(f)}</li>`).join('')}</ol>` : '';
  const az = res.az ? `<p class="small" style="margin:0 0 4px"><b>Pronunciación (Azure): ${res.az.pct}/100</b>${weak.length ? ` · fonemas a practicar: ${weak.map(w => `/${esc(w.p)}/ ${w.s}`).join(', ')}` : ''}.</p>` : '';
  const note = `<p class="small muted" style="margin:0">La pronunciación se midió contra tu propia transcripción: detecta fonemas débiles, no es una nota absoluta.</p>`;
  const aiNote = ai ? `<p class="small muted" style="margin:4px 0 0">La IA puede equivocarse.</p>` : `<p class="small" style="margin:4px 0 0">⚠️ ${esc(res.aiErr || 'No se pudo hacer el resumen con IA.')}</p><button class="btn ghost sm" id="plFreeRetry" type="button" style="margin-top:6px">🔄 Reintentar el resumen con IA</button>`;
  const apply = ai && ai.level !== chatLevel() ? `<div class="row" style="margin-top:8px"><button class="btn primary sm" id="plFreeApply" type="button">✅ Usar este nivel en el chat</button><button class="btn ghost sm" id="plFreeKeep" type="button">Mantener mi nivel</button></div>` : '';
  return `<h3 style="margin:0 0 6px">🎙️ Tu habla libre</h3>${lvl}${az}${note}${aiNote}${apply}`;
}
export function bindPlacementFreeResult(root, res) {
  if (!root || !res) return;
  const apply = $('#plFreeApply', root), keep = $('#plFreeKeep', root), retry = $('#plFreeRetry', root);
  if (apply) apply.onclick = () => { S.settings.chatLevel = res.ai.level; save(); root.innerHTML = placementFreeResultHTML(res) + `<p class="small" style="margin-top:8px"><b>✅ Nivel del chat: ${esc(LEVELS[res.ai.level].label)}.</b></p>`; bindPlacementFreeResult(root, res); toast(`🎚️ Nivel del chat: ${LEVELS[res.ai.level].label}`); };
  if (keep) keep.onclick = () => { const box = root.querySelector('#plFreeApply'); if (box) box.parentElement.remove(); toast('De acuerdo, sigues en tu nivel actual.'); };
  if (retry) retry.onclick = async () => {
    retry.disabled = true; retry.textContent = '⏳ Tuki está pensando…';
    try { res.ai = await placementFreeAnalyze(res.transcript, res.az); res.aiErr = null; placementFreeSave(res); root.innerHTML = placementFreeResultHTML(res); bindPlacementFreeResult(root, res); }
    catch (e) { retry.disabled = false; retry.textContent = '🔄 Reintentar el resumen con IA'; toast(errES(e), 4000); }
  };
}
export function bindPlacementFree(root) {
  if (!root) return;
  const rec = $('#plFreeRec', root), skip = $('#plFreeSkip', root), consent = $('#plFreeConsent', root), status = $('#plFreeStatus', root);
  if (skip) skip.onclick = () => { root.remove(); };
  if (!rec) return;
  rec.onclick = async () => {
    if (!consent || !consent.checked) { if (status) status.innerHTML = '⚠️ Marca la casilla de consentimiento para grabar.'; return; }
    if (rec.disabled) return;
    rec.disabled = true; if (skip) skip.disabled = true;
    const t0 = Date.now();
    if (status) status.innerHTML = `<div class="row between"><span>🎙️ Grabando… <b id="plFreeTimer">0:00</b> (máx. 1:00) · habla ahora</span><button class="btn ghost sm" id="plFreeStop" type="button">⏹️ Terminar</button></div>`;
    const timer = setInterval(() => { const el = $('#plFreeTimer', root); if (!el) return clearInterval(timer); const s = Math.floor((Date.now() - t0) / 1000); el.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }, 500);
    const stopBtn = $('#plFreeStop', root);
    if (stopBtn) stopBtn.onclick = () => MicCap.stop();
    try {
      const cap = await MicCap.start({ maxMs: 60000, vad: true });
      clearInterval(timer);
      if (status) status.innerHTML = '<div class="spinner sm"></div><div class="small muted" style="text-align:center">Tuki está analizando tu voz…</div>';
      const res = await placementFreeFinish(cap);
      if (res.ai) placementFreeSave(res);
      root.innerHTML = placementFreeResultHTML(res);
      bindPlacementFreeResult(root, res);
    } catch (e) {
      clearInterval(timer);
      rec.disabled = false; if (skip) skip.disabled = false;
      if (status) status.innerHTML = `⚠️ ${esc(errES(e))} <button class="btn ghost sm" id="plFreeAgain" type="button">Reintentar</button>`;
      const again = $('#plFreeAgain', root); if (again) again.onclick = () => { root.innerHTML = placementFreeHTML(); bindPlacementFree(root); };
    }
  };
}

/* =================== PRUEBA DE NIVEL =================== */

export function buildPlacement() {
  const P = id => LESSON[id];
  const pk = (id, pu) => ({ kind: 'pick', l: P(id), pair: pick(P(id).pairs), side: Math.random() < .5 ? 0 : 1, pu });
  const qz = (id, pu) => ({ kind: 'quiz', l: P(id), q: pick(P(id).quiz), pu });
  const q = [pk('ih-ee', 0), pk('ae-uh', 0), pk('b-v', 1), pk('sh-ch', 1), pk('th-voiceless', 2), qz('ed-endings', 3), qz('intonation', 4)];
  if (canSpeak()) q.push({ kind: 'speak', variant: 'sentence', l: P('ih-ee'), text: 'Please sit in this seat.', es: 'Por favor siéntate en este asiento.', pu: 0 }, { kind: 'speak', variant: 'sentence', l: P('th-voiceless'), text: 'I think my birthday is this month.', es: 'Creo que mi cumpleaños es este mes.', pu: 2 }, { kind: 'speak', variant: 'sentence', l: P('c-interview'), text: "I'm organized, and I work well in a team.", es: 'Soy organizado y trabajo bien en equipo.', pu: 5 });
  else q.push(pk('s-z', 1), qz('s-endings', 3), qz('word-stress', 4));
  return q;
}
export function placementIntro() {
  $('#full').classList.remove('hidden'); document.body.style.overflow = 'hidden';
  $('#fullInner').innerHTML = `<div class="complete"><div class="mascot" style="width:120px;height:120px">${MASCOT}</div><h1 style="color:var(--g-d)">¡Hola! Soy Tuki 🦜</h1>
    <p style="max-width:420px">Haz una <b>prueba de nivel corta</b> (10 preguntas, unos 3 minutos) con ejercicios de oído${canSpeak() ? ' y de pronunciación' : ''}. Así empiezas en la unidad adecuada.</p>
    <button class="btn primary" id="plGo" style="min-width:240px">Empezar prueba</button><button class="btn ghost" id="plSkip" style="min-width:240px;margin-top:6px">Saltar, empiezo desde cero</button></div>`;
  $('#plGo').onclick = () => startLesson(null, 'placement', buildPlacement(), 'Prueba de nivel');
  $('#plSkip').onclick = () => { S.placement = 'skipped'; save(); $('#full').classList.add('hidden'); document.body.style.overflow = ''; render(); };
}
export function placementFinish() {
  const res = L.place || [], byU = {}; res.forEach(x => { (byU[x.u] = byU[x.u] || []).push(x.ok); });
  const fails = Object.keys(byU).map(Number).filter(u => byU[u].some(ok => !ok)).sort((a, b) => a - b);
  const start = Math.min(fails.length ? fails[0] : 5, 5);
  LESSONS.forEach(l => { if (l.ui < start && !S.done[l.id]) S.done[l.id] = { times: 0, best: 0, placed: true }; });
  const okN = res.filter(x => x.ok).length;
  S.placement = { date: dayKey(), start, score: okN + '/' + res.length }; addXP(10); save();
  const AREAS = ['Vocales', 'Consonantes', 'TH y finales', 'Terminaciones', 'Entonación', 'Conversación'];
  $('#fullInner').innerHTML = `<div class="complete"><div class="mascot" style="width:110px;height:110px">${MASCOT}</div><h1>¡Prueba terminada!</h1>
    <p>Acertaste <b>${okN} de ${res.length}</b>.</p><div class="card" style="max-width:420px;width:100%;text-align:left">${Object.keys(byU).map(u => `<div class="row between"><span>${AREAS[u]}</span><b>${byU[u].every(Boolean) ? '✅' : '🔁 practicar'}</b></div>`).join('')}</div>
    <p>Empezarás en la <b>Unidad ${start + 1}: ${esc(COURSE[start].title)}</b>.${start ? ' Las unidades anteriores quedan desbloqueadas por si quieres repasarlas.' : ''}</p>
    ${placementFreeAvailable() ? `<div id="plFree">${placementFreeHTML()}</div>` : ''}
    <button class="btn primary" id="primaryBtn" style="min-width:220px">¡Vamos!</button></div>`;
  $('#primaryBtn').onclick = closeLesson; if ($('#plFree')) bindPlacementFree($('#plFree')); confetti();
}

/* =================== PLAN DE HOY =================== */

export let DICT = null, WORDS_MODE = 'deck', dictQ = '';
export function buildDict() {
  const m = new Map(), add = (en, es, kind, l) => { const k = en.toLowerCase(); if (!m.has(k)) m.set(k, { key: (kind === 'palabra' ? 'w:' : 's:') + en, en, es, kind, lesson: l.id, src: l.title }); };
  LESSONS.forEach(l => { if (l.type === 'dialog') l.lines.forEach(x => add(x[1], x[2], 'frase', l)); else { (l.ex || []).forEach(x => add(x[0], x[1], 'palabra', l)); (l.sents || []).forEach(x => add(x[0], x[1], 'frase', l)); } });
  return [...m.values()];
}
export function renderDict(v) {
  DICT = DICT || buildDict();
  const q = dictQ.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const res = DICT.filter(d => !q || (d.en + ' ' + d.es + ' ' + d.src).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q));
  v.innerHTML = `${wordsToggleHTML()}<h2>Diccionario y frases 📖</h2><p class="muted small">${DICT.length} palabras y frases del curso con audio. Busca en inglés o en español.</p>
    <input class="search" id="dq" placeholder="Buscar (ej. «think», «cuenta», «meeting»)…" value="${esc(dictQ)}">
    <div class="small muted" style="margin:8px 0">${res.length} resultado${res.length === 1 ? '' : 's'}${res.length > 80 ? ' (mostrando 80)' : ''}</div>
    <div class="wlist">${res.slice(0, 80).map((d, i) => `<div class="witem dict-item"><button class="spk" data-say-n="${esc(d.en)}">🔊</button><div style="min-width:0"><div class="en">${esc(d.en)}</div><div class="es">${esc(d.es)} · <span class="small">${esc(d.src)}</span></div></div><div class="acts"><button class="spk slow" data-say="${esc(d.en)}" title="Lento">🐢</button><button class="spk snail" data-snail="${esc(d.en)}" title="Modo Caracol (Sílaba por sílaba)">🐌</button><button class="spk slow" data-add="${i}" title="Agregar a tarjetas">${S.deck[d.key] ? '✓' : '➕'}</button><button class="spk slow" data-studio="${esc(d.en)}" title="Practicar pronunciación">🎙️</button></div></div>`).join('') || '<div class="empty">Sin resultados.</div>'}</div>`;
  bindWordsToggle(v);
  const dq = $('#dq'); dq.oninput = e => { dictQ = e.target.value; const p = e.target.selectionStart; renderDict(v); const n = $('#dq'); n.focus(); n.setSelectionRange(p, p); };
  $$('[data-say-n]', v).forEach(b => b.onclick = () => speak(b.dataset.sayN));
  $$('[data-say]', v).forEach(b => b.onclick = () => speak(b.dataset.say, true));
  $$('[data-snail]', v).forEach(b => b.onclick = () => speakSnail(b.dataset.snail));
  $$('[data-add]', v).forEach(b => b.onclick = () => { const d = res[+b.dataset.add]; addToDeck([d]); b.textContent = '✓'; toast('Agregada a tus tarjetas 🃏'); });
  $$('[data-studio]', v).forEach(b => b.onclick = () => { STUDIO_TEXT = b.dataset.studio; go('studio'); });
}
export const wordsToggleHTML = () => `<div class="provider"><button class="chip ${WORDS_MODE === 'deck' ? 'active' : ''}" data-wm="deck">🃏 Mis tarjetas</button><button class="chip ${WORDS_MODE === 'dict' ? 'active' : ''}" data-wm="dict">📖 Diccionario</button></div>`;
export function bindWordsToggle(v) { $$('[data-wm]', v).forEach(b => b.onclick = () => { WORDS_MODE = b.dataset.wm; VIEWS.words(v); }); }

export let DICT_WORDS = null;
export function dictLookup(w) {
  DICT = DICT || buildDict();
  if (!DICT_WORDS) { DICT_WORDS = new Map(); DICT.forEach(d => { const k = d.en.toLowerCase().replace(/[.,!?¿¡]/g, '').trim(); if (!DICT_WORDS.has(k)) DICT_WORDS.set(k, d); }); }
  const lw = w.toLowerCase().replace(/’/g, "'"), cands = [lw, lw.replace(/'s$/, ''), lw.replace(/s$/, ''), lw.replace(/es$/, ''), lw.replace(/ed$/, ''), lw.replace(/ed$/, 'e'), lw.replace(/ing$/, ''), lw.replace(/ing$/, 'e'), lw.replace(/ies$/, 'y')];
  for (const c of cands) { const d = DICT_WORDS.get(c); if (d) return d; }
  return null;
}
export function ipaLookup(w) { const lw = w.toLowerCase(); for (const l of LESSONS) { for (const x of (l.ex || [])) if (String(x[0]).toLowerCase() === lw && x[2] && /^\/.*\/$/.test(String(x[2]).trim())) return String(x[2]).trim(); } return ''; }
export function closeWordPop() { const p = $('#wordPop'); if (p) p.remove(); }
export async function openWordPop(word, context, anchor) {
  closeWordPop();
  const pop = document.createElement('div'); pop.id = 'wordPop'; pop.className = 'wordpop'; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', 'Significado de ' + word);
  document.body.appendChild(pop);
  const key = 'w:' + word.toLowerCase(), d = dictLookup(word), cid = word.toLowerCase() + '|' + hashStr(context || '');
  let cached = cacheGet('w', cid);
  if (!cached) {
    try {
      const dbCached = await TukiDB.get('words', cid);
      if (dbCached) {
        cached = dbCached;
        MEM_WCACHE.set(cid, dbCached);
      }
    } catch (e) {}
  }
  let info = d ? { es: d.es, ipa: ipaLookup(word) || (cached && cached.ipa) || '', src: 'dict' } : (cached || null);
  const draw = () => {
    const inDeck = !!S.deck[key];
    pop.innerHTML = `<div class="row between"><b class="wp-w">${esc(word)}</b><button class="mini" data-x aria-label="Cerrar">✕</button></div>
      ${info && info.ipa ? `<div class="wp-ipa">${esc(info.ipa)}</div>` : ''}
      <div class="wp-es">${info ? (info.err ? '⚠️ ' + esc(info.err) : '🇪🇸 ' + esc(info.es)) : '🇪🇸 Buscando significado…'}</div>
      ${info && info.src === 'dict' ? '<div class="small muted">Del diccionario del curso</div>' : info && !info.err ? '<div class="small muted">Traducción de la IA (en contexto)</div>' : ''}
      <div class="row" style="gap:6px;margin-top:8px;flex-wrap:wrap"><button class="mini" data-p="n">🔊</button><button class="mini" data-p="s">🐢</button><button class="mini" data-p="snail" title="Modo Caracol (Sílaba por sílaba)">🐌</button><button class="btn primary sm" data-add ${!info || info.err || inDeck ? 'disabled' : ''}>${inDeck ? '✓ En tus tarjetas' : '➕ Agregar a mis tarjetas'}</button></div>`;
    $('[data-x]', pop).onclick = closeWordPop;
    $('[data-p="n"]', pop).onclick = () => speak(word, false, null, undefined, chatMul());
    $('[data-p="s"]', pop).onclick = () => speak(word, true);
    $('[data-p="snail"]', pop).onclick = () => speakSnail(word);
    $('[data-add]', pop).onclick = () => { if (!info || info.err) return; addToDeck([{ key, en: word.toLowerCase(), es: info.es, kind: 'palabra', lesson: d ? d.lesson : null }]); toast('🃏 «' + word + '» agregada a tus tarjetas'); draw(); };
    place();
  };
  const place = () => {
    const r = anchor.getBoundingClientRect(), pw = Math.min(300, innerWidth - 20), ph = pop.offsetHeight || 150;
    let left = Math.max(10, Math.min(innerWidth - pw - 10, r.left + r.width / 2 - pw / 2)), top = r.top - ph - 8;
    if (top < 60) top = r.bottom + 8;
    pop.style.width = pw + 'px'; pop.style.left = left + 'px'; pop.style.top = top + 'px';
  };
  draw();
  if (info && info.src === 'dict' && !info.ipa && currentProvider()) {
    try { const t = await aiQuick('You give the US IPA pronunciation of English words. Answer ONLY with compact JSON: {"ipa":"/.../"}', `Word: "${word}"`); const m = t.match(/\{[\s\S]*\}/); const j = JSON.parse(m ? m[0] : t); if (j.ipa) { info.ipa = String(j.ipa).trim(); cacheSet('w', cid, { ...info }); if ($('#wordPop') === pop) draw(); } } catch (e) {}
    return;
  }
  if (!info) {
    try {
      const t = await aiQuick('You are an English-Spanish dictionary for a learner from Colombia. Answer ONLY with compact JSON: {"es":"<short Spanish meaning of the word as used in the sentence, 1-5 words>","ipa":"<US IPA between slashes>"}', `Word: "${word}"\nSentence: "${context || word}"`);
      const m = t.match(/\{[\s\S]*\}/); const j = JSON.parse(m ? m[0] : t);
      info = { es: String(j.es || '').trim() || '—', ipa: String(j.ipa || '').trim(), src: 'ai' }; cacheSet('w', cid, info);
    } catch (e) { info = { err: errES(e) }; }
    if ($('#wordPop') === pop) draw();
  }
}

export function downloadICS() {
  const [h, m] = (S.settings.remindTime || '19:00').split(':'), d = new Date(), p = n => String(n).padStart(2, '0');
  const start = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(h)}${p(m)}00`, now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const url = location.href.split('#')[0];
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Tuki Speak//ES', 'BEGIN:VEVENT', 'UID:tuki-speak-diario@' + location.host, 'DTSTAMP:' + now, 'DTSTART:' + start, 'DURATION:PT10M', 'RRULE:FREQ=DAILY', 'SUMMARY:Practicar inglés con Tuki Speak', 'DESCRIPTION:10 minutos de pronunciación: ' + url, 'URL:' + url, 'BEGIN:VALARM', 'TRIGGER:PT0M', 'ACTION:DISPLAY', 'DESCRIPTION:Hora de practicar inglés 🦜', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = 'tuki-speak-recordatorio.ics'; a.click();
}
export function sendTukiNotification(title, body, tag = 'tuki-remind', actions = true) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return Promise.resolve(null);
  const options = {
    body,
    icon: './icon-192.png',
    badge: './icon-192.png',
    tag,
    renotify: true,
    vibrate: [200, 100, 200],
    data: { action: 'practice', url: './#practice' }
  };
  if (actions) {
    options.actions = [
      { action: 'practice', title: '🚀 Practicar 5 min' },
      { action: 'close', title: '✕ Cerrar' }
    ];
  }
  return (navigator.serviceWorker && navigator.serviceWorker.getRegistration ? navigator.serviceWorker.getRegistration() : Promise.resolve(null))
    .then(reg => {
      if (reg && reg.showNotification) return reg.showNotification(title, options);
      return new Notification(title, options);
    }).catch(e => console.warn('notify err', e));
}
export function checkReminder() {
  const s = S.settings; if (!s.remindOn || !('Notification' in window) || Notification.permission !== 'granted') return;
  const now = new Date(), [h, m] = (s.remindTime || '19:00').split(':').map(Number), k = dayKey();
  if (S.lastRemind === k || now.getHours() * 60 + now.getMinutes() < h * 60 + m || todayRec().xp >= s.goal) return;
  S.lastRemind = k; save();
  const leftXp = Math.max(1, s.goal - todayRec().xp);
  const st = streakNow();
  const title = `🦜 ¡No pierdas tu racha de ${st} ${st === 1 ? 'día' : 'días'}!`;
  const body = `Te faltan ${leftXp} XP hoy para tu meta diaria. 5 minutos bastan para mantener tu racha viva 🔥`;
  sendTukiNotification(title, body, 'tuki-remind', true);
}

/* =================== CONEXIÓN Y ACTUALIZACIONES =================== */
export function netBanner() {
  let b = $('#netBanner');
  if (navigator.onLine) { if (b) b.remove(); return; }
  if (!b) { b = document.createElement('div'); b.id = 'netBanner'; b.className = 'banner net'; b.setAttribute('role', 'status'); document.body.appendChild(b); }
  b.innerHTML = '📴 Sin conexión: lecciones, tarjetas y voz del dispositivo funcionan. El reconocimiento de Chrome, Azure y la IA necesitan internet.';
}

export let UPDATE_REQ = false;
export function showUpdateBanner(worker) {
  if ($('#updBanner')) return;
  const b = document.createElement('div'); b.id = 'updBanner'; b.className = 'banner upd'; b.setAttribute('role', 'status');
  b.innerHTML = '<span>✨ Hay una nueva versión de Tuki Speak.</span><button class="btn primary" id="updBtn">Actualizar</button>';
  document.body.appendChild(b);
  $('#updBtn').onclick = () => {
    UPDATE_REQ = true;
    b.querySelector('span').textContent = 'Actualizando…';
    if (worker) worker.postMessage('skipWaiting');
    setTimeout(() => location.reload(), 800);
  };
}

export async function initServiceWorker() {
  if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    window.__swReg = reg;

    // Comprobar actualización al iniciar
    reg.update().catch(() => {});

    if (reg.waiting && navigator.serviceWorker.controller) {
      showUpdateBanner(reg.waiting);
    }

    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      if (w) {
        w.addEventListener('statechange', () => {
          if (w.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateBanner(w);
          }
        });
      }
    });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      if (UPDATE_REQ) {
        refreshing = true;
        location.reload();
      }
    });

    // Verificación proactiva periódica y al volver a la pestaña
    setInterval(() => reg.update().catch(() => {}), 10 * 60e3);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') reg.update().catch(() => {});
    });
  } catch (e) {
    console.warn('SW registration:', e);
  }
}

export const TC_BANK = [{"lv":"A2","ctx":"amigos","cat":"error","es":"Yo [tengo] 20 años.","en":"I {} 20 years old.","b":[{"a":["am"],"n":{"have":"En inglés la edad va con \"be\", no con \"have\". \"I have 20 years\" es un error típico de hispanohablantes.","has":"Con \"I\" no se usa \"has\", y además la edad va con \"be\": I am 20.","m":"¡Casi! Escribe la palabra completa."}}],"h":"La edad en inglés se dice con el verbo \"ser/estar\".","x":"Para la edad se usa \"be\": I am 20 (years old). Nunca \"I have 20 years\".","id":"a2_i_years_old"},{"lv":"A2","ctx":"casa","cat":"error","es":"Ella [tiene] hambre.","en":"She {} hungry.","b":[{"a":["is"],"n":{"has":"Con hambre, sed, frío o calor se usa \"be\": she is hungry.","have":"Con hambre se usa \"be\", no \"have\". Y con \"she\" sería otra forma.","are":"Con \"she\" se usa otra forma del verbo \"be\"."}}],"h":"Igual que con la edad: se usa el verbo \"ser/estar\".","x":"\"Tener hambre\" = be hungry. En inglés tú \"eres/estás\" hambriento: She is hungry.","id":"a2_she_hungry"},{"lv":"A2","ctx":"casa","cat":"daily","es":"Tengo [frío].","en":"I am {}.","b":[{"a":["cold"],"n":{"cool":"\"Cool\" es fresco (o \"chévere\"). Para \"tengo frío\" se usa otra palabra.","frio":"Esa es la palabra en español. ¿Cómo se dice en inglés?","colder":"No necesitas comparar. Usa la forma simple."}}],"h":"Es lo contrario de \"hot\". Empieza por \"c\".","x":"\"I am cold\" = tengo frío. Otra vez, se usa \"be\" y no \"have\".","id":"a2_i_am"},{"lv":"A2","ctx":"estudio","cat":"error","es":"¿Puedes [hacer] tu tarea ahora?","en":"Can you {} your homework now?","b":[{"a":["do"],"n":{"make":"Con \"homework\" se usa \"do\", no \"make\". Regla fácil: \"do\" para tareas y trabajos.","doing":"Después de \"can you\" va el verbo sin -ing."}}],"h":"Es el verbo de las tareas y los trabajos, de 2 letras.","x":"\"Do\" se usa con tareas y actividades: do homework, do the dishes. \"Make\" es para crear o fabricar algo.","id":"a2_can_you_your_homewor"},{"lv":"A2","ctx":"amigos","cat":"error","es":"¿Me puedes [hacer] un favor?","en":"Can you {} me a favor?","b":[{"a":["do"],"n":{"make":"Se dice \"do someone a favor\", no \"make\".","give":"\"Give\" es dar. Con \"favor\" se usa otro verbo muy corto."}}],"h":"El mismo verbo que usas con \"homework\".","x":"Expresión fija: do someone a favor = hacerle un favor a alguien.","id":"a2_can_you_me_a_favor"},{"lv":"A2","ctx":"casa","cat":"error","es":"Voy a [hacer] el desayuno.","en":"I'm going to {} breakfast.","b":[{"a":["make"],"n":{"do":"Para preparar comida se usa \"make\": make breakfast, make dinner.","cook":"\"Cook breakfast\" también es válido, pero lo más común es otra palabra de 4 letras.","prepare":"\"Prepare\" es válido pero suena formal. En casa se dice otra palabra más corta."}}],"h":"Es el verbo para crear o preparar algo. Empieza por \"m\".","x":"\"Make\" es para preparar o crear: make breakfast, make a cake, make coffee.","id":"a2_i_m_going_to_breakfa"},{"lv":"A2","ctx":"amigos","cat":"error","es":"Ella me [dijo] la verdad.","en":"She {} me the truth.","b":[{"a":["told"],"n":{"said":"\"Say\" no lleva a la persona directamente. Con \"me\" y \"the truth\" se usa \"tell\" (pasado: told).","tell":"¡Casi! Es en pasado.","says":"Es en pasado, y con \"me\" se usa otro verbo.","telled":"\"Tell\" es irregular. Su pasado no termina en -ed."}}],"h":"Pasado de \"tell\". Es irregular.","x":"\"Tell\" lleva a la persona: tell me, tell her. Por eso: She told me the truth.","id":"a2_she_me_the_truth"},{"lv":"A2","ctx":"trabajo","cat":"error","es":"Él [dijo] que estaba cansado.","en":"He {} that he was tired.","b":[{"a":["said"],"n":{"told":"\"Told\" necesita a quién: \"he told me that...\". Sin persona se usa \"say\".","say":"Es en pasado.","sayed":"\"Say\" es irregular: el pasado no es \"sayed\".","tell":"Sin persona se usa \"say\", y en pasado."}}],"h":"Pasado irregular de \"say\".","x":"Sin decir a quién, se usa \"say\": He said (that) he was tired. Con persona: He told me...","id":"a2_he_that_he_was_tired"},{"lv":"A2","ctx":"tienda","cat":"false","es":"Compré este libro en la [librería].","en":"I bought this book at the {}.","b":[{"a":["bookstore","bookshop","book store"],"n":{"library":"¡Falso amigo! \"Library\" es biblioteca (donde prestas libros). Donde compras libros es otra palabra.","libreria":"Esa es la palabra en español. Piensa en \"tienda de libros\"."}}],"h":"Literalmente: \"tienda de libros\".","x":"\"Library\" = biblioteca. \"Bookstore\" (EE. UU.) o \"bookshop\" (Reino Unido) = librería.","id":"a2_i_bought_this_book_a"},{"lv":"A2","ctx":"estudio","cat":"false","es":"Estudio en la [biblioteca] los sábados.","en":"I study at the {} on Saturdays.","b":[{"a":["library"],"n":{"bookstore":"\"Bookstore\" es librería (donde compras libros). Biblioteca es otra palabra.","bookshop":"\"Bookshop\" es librería. Biblioteca es otra palabra.","biblioteca":"Esa es la palabra en español."}}],"h":"Parece \"librería\", pero es el lugar donde prestas libros.","x":"\"Library\" parece \"librería\", pero significa biblioteca. Es uno de los falsos amigos más comunes.","id":"a2_i_study_at_the_on_sa"},{"lv":"A2","ctx":"amigos","cat":"daily","es":"Me [gusta] el café.","en":"I {} coffee.","b":[{"a":["like"],"n":{"likes":"Con \"I\" el verbo no lleva -s: I like.","love":"\"Love\" es \"me encanta\". Para \"me gusta\" usa otra palabra.","enjoy":"\"Enjoy\" es disfrutar. Es válido, pero para \"me gusta\" lo natural es otra palabra."}}],"h":"Palabra de 4 letras, empieza por \"l\".","x":"\"Me gusta\" = I like. Ojo: en inglés el sujeto es \"I\": \"I like coffee\".","id":"a2_i_coffee"},{"lv":"A2","ctx":"calle","cat":"daily","es":"Hace mucho [calor] hoy.","en":"It's very {} today.","b":[{"a":["hot","warm"],"n":{"heat":"\"Heat\" es el sustantivo (el calor). Aquí necesitas un adjetivo.","calor":"Esa es la palabra en español.","hotter":"No estás comparando: usa la forma simple."}}],"h":"Lo contrario de \"cold\".","x":"\"It's hot\" = hace calor. Para el clima se usa \"it is\", no \"it makes\".","id":"a2_it_s_very_today"},{"lv":"A2","ctx":"amigos","cat":"error","es":"¿[Cuántos años] tienes?","en":"{} are you?","b":[{"a":["how old"],"n":{"how many years":"Error típico: en inglés no se cuentan los años. Se pregunta con \"How old...?\"","how many years old":"En inglés no se cuentan los años. Se pregunta con \"How old...?\"","what age":"\"What age\" se entiende, pero lo natural es otra pregunta con \"how\".","how":"¡Casi! Falta una palabra: \"How ___\"."}}],"h":"Literalmente: \"¿Qué tan viejo…?\"","x":"\"How old are you?\" = ¿Cuántos años tienes? Y se responde: \"I am 20\".","id":"a2_are_you"},{"lv":"A2","ctx":"estudio","cat":"error","es":"Estoy [aburrido].","en":"I'm {}.","b":[{"a":["bored"],"n":{"boring":"\"Boring\" es aburrido como característica (algo que aburre). Cuando tú sientes aburrimiento es \"bored\".","bore":"Aquí necesitas el adjetivo que termina en -ed."}}],"h":"Termina en -ed, porque es cómo te sientes.","x":"Regla -ed/-ing: -ed es cómo te sientes (bored), -ing es lo que causa el sentimiento (boring).","id":"a2_i_m"},{"lv":"A2","ctx":"amigos","cat":"error","es":"La película es muy [aburrida].","en":"The movie is very {}.","b":[{"a":["boring"],"n":{"bored":"\"Bored\" es cómo te sientes tú. La película causa aburrimiento: es otra forma.","bore":"Aquí necesitas el adjetivo que termina en -ing."}}],"h":"Termina en -ing, porque la película causa el aburrimiento.","x":"Algo que aburre es \"boring\". Tú te sientes \"bored\". The movie is boring, so I am bored.","id":"a2_the_movie_is_very"},{"lv":"A2","ctx":"cita","cat":"prep","es":"Nos vemos [el] lunes.","en":"See you {} Monday.","b":[{"a":["on"],"n":{"in":"Con días de la semana se usa \"on\": on Monday.","at":"\"At\" es para horas. Para días usa otra preposición.","the":"En inglés no se dice \"the Monday\" aquí. Necesitas una preposición.","el":"En inglés aquí va una preposición, no un artículo."}}],"h":"Preposición de 2 letras para días.","x":"Días de la semana van con \"on\": on Monday, on Friday night.","id":"a2_see_you_monday"},{"lv":"A2","ctx":"estudio","cat":"prep","es":"La clase es [a las] 8.","en":"The class is {} 8.","b":[{"a":["at"],"n":{"in":"Para horas exactas se usa \"at\": at 8.","on":"\"On\" es para días. Para horas exactas usa otra.","to":"Para horas se usa \"at\", no \"to\"."}}],"h":"Preposición de 2 letras para horas exactas.","x":"Horas exactas van con \"at\": at 8, at noon, at midnight.","id":"a2_the_class_is"},{"lv":"A2","ctx":"amigos","cat":"prep","es":"Nací [en] 1995.","en":"I was born {} 1995.","b":[{"a":["in"],"n":{"on":"Para años y meses se usa \"in\". \"On\" es para días y fechas.","at":"\"At\" es para horas. Para años usa \"in\".","the":"Delante de un año no va \"the\". Necesitas una preposición."}}],"h":"La misma preposición que usas con meses.","x":"Años y meses van con \"in\": in 1995, in May. Fechas completas con \"on\": on May 5th.","id":"a2_i_was_born"},{"lv":"A2","ctx":"casa","cat":"prep","es":"Estoy [en] casa.","en":"I'm {} home.","b":[{"a":["at"],"n":{"in":"Se dice \"at home\", sin \"the\" y con \"at\".","on":"Se dice \"at home\".","in the":"Se dice \"at home\", sin \"the\"."}}],"h":"Preposición de 2 letras. ¡Sin \"the\"!","x":"Expresión fija: at home. También: at work, at school.","id":"a2_i_m_home"},{"lv":"A2","ctx":"casa","cat":"prep","es":"[Llegué a] casa tarde.","en":"I {} home late.","b":[{"a":["got","came","arrived","went"],"n":{"arrived to":"No se dice \"arrive to\". Con \"home\" no va preposición: I arrived home.","got to":"Con \"home\" no va \"to\": I got home.","came to":"Con \"home\" no va \"to\": I came home.","arrived at":"Con \"home\" no va preposición: I arrived home.","arrive":"Es en pasado.","get":"Es en pasado: got."}}],"h":"Pasado de \"get\" (muy común en conversación).","x":"\"Home\" no lleva preposición después de verbos de movimiento: go home, get home, come home.","id":"a2_i_home_late"},{"lv":"A2","ctx":"casa","cat":"false","es":"Mi hermana está [embarazada].","en":"My sister is {}.","b":[{"a":["pregnant"],"n":{"embarrassed":"¡Falso amigo! \"Embarrassed\" significa avergonzado. Embarazada es \"pregnant\".","embarazed":"¡Cuidado! Eso suena a \"embarrassed\" (avergonzado). Embarazada es otra palabra."}}],"h":"Empieza por \"p\" y no se parece al español.","x":"\"Embarrassed\" = avergonzado. \"Pregnant\" = embarazada. ¡Un error muy chistoso si los confundes!","id":"a2_my_sister_is"},{"lv":"A2","ctx":"casa","cat":"phrasal","es":"Por favor [apaga] la luz.","en":"Please {} the light.","b":[{"a":["turn off","switch off","shut off"],"n":{"turn on":"\"Turn on\" es encender. Quieres lo contrario.","close":"En inglés la luz no se \"cierra\". Se usa un phrasal verb con \"turn\".","off":"¡Casi! Falta el verbo: \"turn ___\".","turn of":"Casi: es \"off\" con dos f.","shut":"Falta una palabra: \"shut ___\" o mejor \"turn ___\"."}}],"h":"Un phrasal verb con \"turn\". Lo contrario de \"turn on\".","x":"\"Turn off\" = apagar. \"Turn on\" = encender. Sirve para luces, TV, celular…","id":"a2_please_the_light"},{"lv":"A2","ctx":"casa","cat":"phrasal","es":"[Levántate], ya es tarde.","en":"{}, it's late.","b":[{"a":["get up"],"n":{"wake up":"\"Wake up\" es despertarse. Levantarse de la cama es otro phrasal verb.","stand up":"\"Stand up\" es ponerse de pie (por ejemplo, de una silla). Para salir de la cama es otro.","get":"¡Casi! Falta una palabra: \"get ___\".","raise":"\"Raise\" es levantar algo (raise your hand). Levantarse de la cama es otro verbo."}}],"h":"Phrasal verb con \"get\".","x":"\"Wake up\" = despertarse (abrir los ojos). \"Get up\" = levantarse de la cama.","id":"a2_it_s_late"},{"lv":"A2","ctx":"casa","cat":"phrasal","es":"Estoy [buscando] mis llaves.","en":"I'm {} my keys.","b":[{"a":["looking for"],"n":{"looking":"¡Casi! \"Look\" necesita una preposición para significar buscar.","searching":"\"Searching for\" es válido pero más formal. Lo más natural es otro phrasal verb.","searching for":"Es válido, pero más formal. En casa se dice otro phrasal verb con \"look\".","looking at":"\"Look at\" es mirar. Buscar es con otra preposición.","finding":"\"Find\" es encontrar (el resultado). Buscar es el proceso."}}],"h":"\"Look\" + una preposición de 3 letras.","x":"\"Look for\" = buscar. \"Look at\" = mirar. \"Find\" = encontrar.","id":"a2_i_m_my_keys"},{"lv":"A2","ctx":"estudio","cat":"error","es":"¿Puedo [pedirte prestado] tu lápiz?","en":"Can I {} your pencil?","b":[{"a":["borrow"],"n":{"lend":"\"Lend\" es prestar tú a otro. Cuando tú recibes algo prestado es \"borrow\".","borrow me":"Aquí no va \"me\": Can I borrow your pencil?","ask":"\"Ask\" es pedir, pero para pedir prestado hay un verbo especial."}}],"h":"Verbo para recibir algo prestado. Empieza por \"b\".","x":"\"Borrow\" = pedir prestado (tú recibes). \"Lend\" = prestar (tú das).","id":"a2_can_i_your_pencil"},{"lv":"A2","ctx":"amigos","cat":"error","es":"¿Me [prestas] tu cargador?","en":"Can you {} me your charger?","b":[{"a":["lend","loan"],"n":{"borrow":"\"Borrow\" es pedir prestado (tú recibes). Aquí la otra persona te da: \"lend\".","give":"\"Give\" es regalar o dar. Para prestar hay un verbo especial.","borrow me":"\"Borrow\" es para quien recibe. Aquí es \"lend me\"."}}],"h":"Verbo para dar algo prestado. Empieza por \"l\".","x":"\"Lend me your charger\" = préstame tu cargador. La otra persona \"lends\", tú \"borrow\".","id":"a2_can_you_me_your_char"},{"lv":"A2","ctx":"casa","cat":"error","es":"Mi papá [trabaja] en un banco.","en":"My dad {} at a bank.","b":[{"a":["works"],"n":{"work":"Con he, she o \"my dad\" el verbo lleva -s en presente.","working":"Para una rutina se usa el presente simple, con -s.","is work":"No necesitas \"is\": my dad works."}}],"h":"El verbo \"work\" con \"he\".","x":"En presente simple, con he/she/it el verbo lleva -s: he works, she lives, it rains.","id":"a2_my_dad_at_a_bank"},{"lv":"A2","ctx":"calle","cat":"error","es":"[Hay] muchas personas aquí.","en":"{} a lot of people here.","b":[{"a":["there are"],"n":{"there is":"Con plural (\"people\") se usa \"there are\".","have":"Error típico: \"hay\" no es \"have\". Se dice \"there are\".","has":"\"Hay\" no es \"has\". Se dice \"there are\".","there":"¡Casi! Falta el verbo: \"there ___\".","there have":"\"Hay\" se dice \"there is/there are\", sin \"have\"."}}],"h":"Dos palabras: \"there\" + el verbo \"be\" en plural.","x":"\"Hay\" = there is (singular) / there are (plural). \"People\" es plural.","id":"a2_a_lot_of_people_here"},{"lv":"A2","ctx":"rest","cat":"daily","es":"¿Dónde está el [baño]?","en":"Where is the {}?","b":[{"a":["bathroom","restroom","washroom","ladies room","mens room"],"n":{"bath":"\"Bath\" es la tina o bañarse. El lugar es otra palabra.","toilet":"\"Toilet\" se usa en Reino Unido; en EE. UU. suena directo (es el inodoro). Prueba \"bathroom\" o \"restroom\".","wc":"\"WC\" casi no se usa al hablar. Prueba \"bathroom\" o \"restroom\".","bano":"Esa es la palabra en español."}}],"h":"En un restaurante de EE. UU. se dice \"restroom\" o…","x":"En EE. UU. se dice \"bathroom\" o \"restroom\" (en lugares públicos). \"Toilet\" suena muy directo allá.","id":"a2_where_is_the"},{"lv":"A2","ctx":"viaje","cat":"daily","es":"Tengo que [tomar] el bus.","en":"I have to {} the bus.","b":[{"a":["take","catch","get"],"n":{"drink":"\"Drink\" es tomar líquidos. Para transporte se usa otra palabra.","grab":"\"Grab\" es informal y se usa con comida o taxis. Para el bus prueba \"take\" o \"catch\".","ride":"\"Ride the bus\" es válido (ir en el bus). Para \"tomar\" el bus se usa \"take\"."}}],"h":"Verbo de 4 letras, el mismo que usas con fotos.","x":"\"Take the bus\" o \"catch the bus\" = tomar el bus. \"Drink\" es solo para bebidas.","id":"a2_i_have_to_the_bus"},{"lv":"A2","ctx":"viaje","cat":"error","es":"Voy a [tomar] una foto.","en":"I'm going to {} a photo.","b":[{"a":["take"],"n":{"make":"Error típico: en inglés las fotos se \"take\", no se \"make\".","do":"Con fotos no se usa \"do\". Se dice \"take a photo\".","shoot":"\"Shoot\" se usa entre fotógrafos. Lo normal es \"take a photo\"."}}],"h":"El mismo verbo que usas con el bus.","x":"Take a photo, take a picture. Nunca \"make a photo\".","id":"a2_i_m_going_to_a_photo"},{"lv":"A2","ctx":"amigos","cat":"daily","es":"Tengo mucha [sed].","en":"I'm very {}.","b":[{"a":["thirsty"],"n":{"thirst":"\"Thirst\" es el sustantivo (la sed). Aquí necesitas el adjetivo.","hungry":"\"Hungry\" es hambre. Sed es otra palabra.","thirsthy":"Casi. Revisa las letras del final: termina en -sty."}}],"h":"Adjetivo que termina en -y. Empieza por \"th\".","x":"\"I'm thirsty\" = tengo sed. Igual que \"hungry\": se usa \"be\", no \"have\".","id":"a2_i_m_very"},{"lv":"A2","ctx":"trabajo","cat":"false","es":"Pon los papeles en la [carpeta].","en":"Put the papers in the {}.","b":[{"a":["folder","file"],"n":{"carpet":"¡Falso amigo! \"Carpet\" es alfombra. Carpeta es \"folder\".","carpeta":"Esa es la palabra en español."}}],"h":"Empieza por \"f\".","x":"\"Carpet\" = alfombra. \"Folder\" = carpeta (de papel o en el computador).","id":"a2_put_the_papers_in_th"},{"lv":"A2","ctx":"casa","cat":"daily","es":"Tengo [miedo] de los perros.","en":"I'm {} of dogs.","b":[{"a":["scared","afraid","frightened"],"n":{"fear":"\"Fear\" es el sustantivo. Con \"I am\" se usa un adjetivo.","scary":"\"Scary\" es algo que da miedo (los perros son scary). Tú sientes otra forma.","afraid for":"Con \"of dogs\" solo necesitas el adjetivo."}}],"h":"Adjetivo que termina en -ed, o \"afraid\".","x":"\"I'm scared of dogs\" = les tengo miedo. \"Scary\" es lo que da miedo.","id":"a2_i_m_of_dogs"},{"lv":"A2","ctx":"viaje","cat":"prep","es":"Ella está [en] el bus.","en":"She is {} the bus.","b":[{"a":["on"],"n":{"in":"Con bus, tren y avión se usa \"on\". Con carro o taxi, \"in\".","at":"\"At the bus\" sería junto al bus. Adentro se dice \"on the bus\".","inside":"\"Inside\" se entiende, pero lo natural es una preposición corta."}}],"h":"Preposición de 2 letras, la misma de \"on Monday\".","x":"Transporte grande (bus, train, plane): on. Transporte pequeño (car, taxi): in.","id":"a2_she_is_the_bus"},{"lv":"B1","ctx":"amigos","cat":"idiom","es":"¿Qué, estás [loco]?","en":"What, are you {}?","b":[{"a":["nuts"],"n":{"crazy":"\"Crazy\" es válido, pero piensa en algo más informal.","insane":"\"Insane\" también es válido, pero suena más fuerte. Piensa en algo más informal y corto.","mad":"\"Mad\" puede ser \"loco\" en inglés británico, pero casi siempre significa \"enojado\". Piensa en algo más informal.","loco":"\"Loco\" se entiende, pero es español. ¿Cómo se dice en inglés informal?","nut":"¡Casi! En esta expresión la palabra va en plural."}}],"h":"Palabra informal de 4 letras; literalmente también significa \"nueces\".","x":"\"Nuts\" es una forma informal y amistosa de decir \"loco\". \"Crazy\" también sirve, pero \"nuts\" suena más relajado entre amigos.","id":"loco"},{"lv":"B1","ctx":"casa","cat":"phrasal","es":"Quizás deberías [cambiar] esas sillas [por] otras nuevas.","en":"Maybe you should {} those chairs {} new ones.","b":[{"a":["replace"],"n":{"change":"\"Change... with\" significa intercambiar lugares. ¿Cuál sería la palabra para \"cambiar por\" algo nuevo?","exchange":"\"Exchange\" es intercambiar (por ejemplo, en una tienda). Para poner algo nuevo en lugar de lo viejo hay otra palabra.","swap":"\"Swap\" es intercambiar. Piensa en una palabra que signifique \"reemplazar\".","substitute":"\"Substitute\" es válido pero formal y va con \"for\". Piensa en \"reemplazar\"."}},{"a":["with"],"n":{"for":"Con \"replace\" se usa \"with\": replace X with Y. \"For\" es un error típico por el \"por\" del español.","by":"\"Replace by\" se ve a veces, pero lo natural es \"replace X with Y\".","per":"\"Per\" es \"por cada\". Con \"replace\" se usa \"with\"."}}],"h":"Piensa en \"reemplazar\". La segunda palabra es la que acompaña a ese verbo.","x":"\"Replace X with Y\" = cambiar X por Y (poner algo nuevo en su lugar). \"Change\" solo es cambiar, y \"for\" es el error típico por el \"por\".","id":"sillas"},{"lv":"B1","ctx":"amigos","cat":"false","es":"Pensé que era fácil, pero [en realidad] es difícil.","en":"I thought it was easy, but {} it's hard.","b":[{"a":["actually","in fact"],"n":{"currently":"\"Currently\" es \"actualmente\" (ahora). \"En realidad\" es otra palabra que parece falso amigo.","in reality":"\"In reality\" es válido pero formal. La palabra más común en conversación es otra.","really":"\"Really\" es \"de verdad/muy\". Para contradecir lo que pensabas se usa otra palabra.","actualy":"Casi: lleva doble \"l\"."}}],"h":"Parece \"actualmente\", pero no lo es. Empieza por \"a\".","x":"\"Actually\" = en realidad. \"Currently\" = actualmente. ¡Falso amigo clásico!","id":"b1_i_thought_it_was_eas"},{"lv":"B1","ctx":"amigos","cat":"false","es":"[Actualmente] vivo en Medellín.","en":"{} I live in Medellín.","b":[{"a":["currently","right now","these days","now","nowadays","at the moment"],"n":{"actually":"¡Falso amigo! \"Actually\" significa \"en realidad\". \"Actualmente\" es \"currently\".","actual":"\"Actual\" significa real o verdadero. \"Actualmente\" es \"currently\"."}}],"h":"Empieza por \"c\" y significa \"en este momento de mi vida\".","x":"\"Currently\" = actualmente. \"Actually\" = en realidad.","id":"b1_i_live_in_medell_n"},{"lv":"B1","ctx":"trabajo","cat":"false","es":"No me [di cuenta] de que era tarde.","en":"I didn't {} it was late.","b":[{"a":["realize","realise"],"n":{"notice":"\"Notice\" es válido si lo viste u oíste, pero para \"darse cuenta\" de una idea se usa otra palabra.","realized":"Después de \"didn't\" el verbo va en forma base, sin -ed.","understand":"\"Understand\" es entender. \"Darse cuenta\" es otro verbo que parece \"realizar\".","realice":"Casi: en inglés se escribe con \"z\" o \"s\": realize.","make":"\"Make\" no funciona aquí. Piensa en el falso amigo de \"realizar\"."}}],"h":"Parece \"realizar\", pero significa \"darse cuenta\".","x":"\"Realize\" = darse cuenta. Para \"realizar\" (hacer) se usa \"carry out\" o \"do\".","id":"b1_i_didn_t_it_was_late"},{"lv":"B1","ctx":"trabajo","cat":"false","es":"No pude [asistir a] la reunión.","en":"I couldn't {} the meeting.","b":[{"a":["attend","go to","make it to","make"],"n":{"assist":"¡Falso amigo! \"Assist\" es ayudar. \"Asistir a\" una reunión es \"attend\".","assist to":"¡Falso amigo! \"Assist\" es ayudar. \"Asistir a\" una reunión es \"attend\".","attend to":"\"Attend to\" significa atender o encargarse de algo. Para ir a una reunión es sin \"to\".","assist at":"\"Assist\" es ayudar. Para ir a una reunión se usa \"attend\"."}}],"h":"Empieza por \"a\" pero no es \"assist\".","x":"\"Attend a meeting\" = asistir a una reunión (¡sin \"to\"!). \"Assist\" = ayudar.","id":"b1_i_couldn_t_the_meeti"},{"lv":"B1","ctx":"casa","cat":"error","es":"Vivo aquí [desde hace] cinco años.","en":"I've lived here {} five years.","b":[{"a":["for"],"n":{"since":"\"Since\" va con un punto en el tiempo (since 2020). Con una duración (five years) se usa \"for\".","during":"\"During\" es \"durante\" algo (during the meeting). Para duración hasta hoy se usa \"for\".","from":"\"From\" necesita un final. Para una duración hasta hoy se usa \"for\".","ago":"\"Ago\" es \"hace\" en pasado (five years ago), y va después."}}],"h":"Preposición de 3 letras para duraciones.","x":"\"For\" + duración (for five years). \"Since\" + punto de inicio (since 2019).","id":"b1_i_ve_lived_here_five"},{"lv":"B1","ctx":"trabajo","cat":"error","es":"Trabajo aquí [desde] 2019.","en":"I've worked here {} 2019.","b":[{"a":["since"],"n":{"for":"\"For\" va con duraciones (for five years). Con un año o fecha de inicio se usa \"since\".","from":"\"From\" necesita un final (from 2019 to 2021). Hasta hoy se usa \"since\".","in":"\"In 2019\" sería solo ese año. Para \"desde 2019 hasta hoy\" se usa \"since\"."}}],"h":"Preposición para el punto de inicio. Empieza por \"s\".","x":"\"Since\" + momento de inicio: since 2019, since Monday, since I was a kid.","id":"b1_i_ve_worked_here"},{"lv":"B1","ctx":"cita","cat":"false","es":"Llevo una hora [esperando].","en":"I've been {} for an hour.","b":[{"a":["waiting"],"n":{"hoping":"\"Hope\" es esperar en el sentido de desear. Esperar a alguien es \"wait\".","expecting":"\"Expect\" es esperar que algo pase (creer). Esperar tiempo es \"wait\".","waiting for":"Aquí no necesitas \"for\" dos veces: ya está en la frase.","wait":"Después de \"I've been\" va con -ing."}}],"h":"\"Esperar\" tiene tres traducciones. Esta es la de esperar tiempo.","x":"Esperar tiempo = wait. Esperar (desear) = hope. Esperar (creer que pasará) = expect.","id":"b1_i_ve_been_for_an_hou"},{"lv":"B1","ctx":"casa","cat":"phrasal","es":"Ella [cuida a] su abuela.","en":"She {} her grandmother.","b":[{"a":["takes care of","looks after","cares for"],"n":{"cares":"\"Care\" solo es preocuparse o importar. Para cuidar a alguien: \"take care of\" o \"look after\".","takes care":"¡Casi! Falta la preposición: \"takes care ___\".","care of":"Falta el verbo y la -s: \"takes care of\".","take care of":"Con \"she\" el verbo lleva -s: takes.","looks for":"\"Look for\" es buscar. Cuidar es \"look after\"."}}],"h":"Tres palabras: \"takes care ___\", o \"looks ___\".","x":"\"Take care of\" o \"look after\" = cuidar a alguien.","id":"b1_she_her_grandmother"},{"lv":"B1","ctx":"reunion","cat":"phrasal","es":"Tenemos que [posponer] la reunión.","en":"We have to {} the meeting.","b":[{"a":["put off","postpone","push back","delay","reschedule"],"n":{"cancel":"\"Cancel\" es cancelar (no se hará). Posponer es moverla a después.","put of":"Casi: es \"off\" con dos f.","put":"Falta una palabra: \"put ___\"."}}],"h":"Phrasal verb con \"put\", o la palabra formal \"postpone\".","x":"\"Put off\" (informal) o \"postpone\" (formal) = posponer.","id":"b1_we_have_to_the_meeti"},{"lv":"B1","ctx":"casa","cat":"phrasal","es":"Te [pareces] mucho a tu hermana.","en":"You {} your sister a lot.","b":[{"a":["look like","take after","resemble"],"n":{"seem":"\"Seem\" es parecer (una impresión). Para parecido físico: \"look like\".","like":"Falta el verbo: \"___ like\".","look":"¡Casi! Falta una palabra: \"look ___\".","seem like":"\"Seem like\" es dar la impresión. Para el parecido físico: \"look like\".","appear":"\"Appear\" es aparecer o parecer (impresión). Parecido físico: \"look like\"."}}],"h":"\"Look\" + una palabra de 4 letras.","x":"\"Look like\" = parecerse físicamente. \"Take after\" = parecerse a un familiar.","id":"b1_you_your_sister_a_lo"},{"lv":"B1","ctx":"amigos","cat":"false","es":"No [me importa].","en":"I don't {}.","b":[{"a":["mind","care"],"n":{"matter":"\"Matter\" es importar como \"ser importante\" (\"it doesn't matter\"). Con \"I don't\" se usa otra palabra.","import":"¡Falso amigo! \"Import\" es importar productos de otro país.","importa":"Esa es la palabra en español."}}],"h":"Palabra de 4 letras: \"m…\" o \"c…\".","x":"\"I don't mind\" = no me molesta. \"I don't care\" = no me importa (más fuerte). \"Import\" es comercio.","id":"b1_i_don_t"},{"lv":"B1","ctx":"viaje","cat":"error","es":"Estoy muy [emocionado] por el viaje.","en":"I'm so {} about the trip.","b":[{"a":["excited"],"n":{"exciting":"\"Exciting\" es algo que emociona (el viaje es exciting). Tú te sientes otra forma.","emotional":"\"Emotional\" es sensible o conmovido, a punto de llorar. Para ilusión se usa otra.","emocionated":"Esa palabra no existe en inglés. Prueba con \"excite\" + -ed.","moved":"\"Moved\" es conmovido. Para la ilusión de un viaje se usa otra."}}],"h":"Termina en -ed, porque es cómo te sientes.","x":"\"Excited\" = emocionado (con ilusión). \"Exciting\" = emocionante. \"Emotional\" = sentimental.","id":"b1_i_m_so_about_the_tri"},{"lv":"B1","ctx":"trabajo","cat":"false","es":"Él [renunció a] su trabajo.","en":"He {} his job.","b":[{"a":["quit","left"],"n":{"renounced":"\"Renounce\" es renunciar a un derecho o creencia, muy formal. Para un trabajo se usa \"quit\".","resigned":"\"Resign\" es válido pero formal y necesita \"from\". Lo más común es \"quit\".","resigned from":"Es válido, pero formal. En conversación se dice otra palabra corta.","quitted":"El pasado de \"quit\" es igual: quit.","renounce":"Es en pasado, y para trabajos se usa otra palabra."}}],"h":"Palabra de 4 letras. Su pasado es igual al presente.","x":"\"Quit (a job)\" = renunciar. \"Resign\" es más formal. \"Renounce\" es para derechos o creencias.","id":"b1_he_his_job"},{"lv":"B1","ctx":"tramite","cat":"phrasal","es":"Tienes que [llenar] este formulario.","en":"You have to {} this form.","b":[{"a":["fill out","fill in","complete"],"n":{"fill":"¡Casi! Falta una palabra: \"fill ___\".","refill":"\"Refill\" es volver a llenar (un vaso). Un formulario se \"fill out\".","full":"\"Full\" es lleno (adjetivo). Aquí necesitas el verbo \"fill\" + otra palabra."}}],"h":"\"Fill\" + \"out\" o \"in\".","x":"\"Fill out\" (EE. UU.) o \"fill in\" (Reino Unido) = llenar un formulario.","id":"b1_you_have_to_this_for"},{"lv":"B1","ctx":"calle","cat":"phrasal","es":"Me [encontré con] Ana en el centro comercial.","en":"I {} Ana at the mall.","b":[{"a":["ran into","bumped into","met","saw"],"n":{"found":"\"Found\" es encontrar algo perdido o buscado. Encontrarse con alguien por casualidad es \"ran into\".","met with":"\"Met with\" es reunirse (planeado). Por casualidad se usa \"ran into\".","run into":"Es en pasado: ran into.","encountered":"\"Encounter\" es formal. En conversación se dice \"ran into\"."}}],"h":"Phrasal verb con \"run\" en pasado.","x":"\"Run into someone\" = encontrarse a alguien por casualidad. \"Find\" es para cosas que buscas.","id":"b1_i_ana_at_the_mall"},{"lv":"B1","ctx":"amigos","cat":"phrasal","es":"Nos [llevamos] muy bien.","en":"We {} really well.","b":[{"a":["get along","get on"],"n":{"carry":"\"Carry\" es cargar. Llevarse bien es un phrasal verb con \"get\".","take":"\"Take\" no funciona aquí. Llevarse bien es un phrasal verb con \"get\".","get":"¡Casi! Falta una palabra: \"get ___\".","go":"\"Go\" no funciona aquí. Es un phrasal verb con \"get\"."}}],"h":"Phrasal verb con \"get\".","x":"\"Get along (with someone)\" = llevarse bien. En Reino Unido también \"get on\".","id":"b1_we_really_well"},{"lv":"B1","ctx":"salud","cat":"phrasal","es":"Voy a [dejar] de fumar.","en":"I'm going to {} smoking.","b":[{"a":["quit","stop","give up"],"n":{"leave":"\"Leave\" es irse o dejar un lugar u objeto. Dejar un hábito es \"quit\" o \"stop\".","let":"\"Let\" es dejar = permitir. Dejar un hábito es otra palabra.","drop":"\"Drop\" es soltar. Para hábitos: \"quit\", \"stop\" o \"give up\"."}}],"h":"La misma palabra de \"renunciar a un trabajo\".","x":"\"Quit/stop/give up smoking\" = dejar de fumar. \"Leave\" es dejar un lugar.","id":"b1_i_m_going_to_smoking"},{"lv":"B1","ctx":"trabajo","cat":"error","es":"Mi jefe me [pidió] que llegara temprano.","en":"My boss {} me to come early.","b":[{"a":["asked","told"],"n":{"ordered":"\"Ordered\" es válido si fue una orden fuerte. \"Pedir\" es \"ask\".","requested":"\"Requested\" es muy formal. Lo natural es \"asked\".","asked for":"\"Ask for\" es pedir una cosa (ask for help). Pedirle a alguien que haga algo: \"ask someone to\".","ask":"Es en pasado.","petitioned":"Demasiado formal. Se dice \"asked\"."}}],"h":"Pasado de \"ask\".","x":"\"Ask someone to do something\" = pedirle a alguien que haga algo. \"Ask for\" + cosa.","id":"b1_my_boss_me_to_come_e"},{"lv":"B1","ctx":"reunion","cat":"error","es":"Estoy [de acuerdo] contigo.","en":"I {} with you.","b":[{"a":["agree"],"n":{"am agree":"Error típico: no se dice \"I am agree\". \"Agree\" ya es el verbo: I agree.","am agreed":"Error típico: se dice \"I agree\", sin \"am\".","agreed":"En presente: I agree.","m agree":"Error típico: se dice \"I agree\", sin \"am\"."}}],"h":"Un solo verbo, sin \"am\".","x":"\"I agree\" = estoy de acuerdo. Nunca \"I am agree\".","id":"b1_i_with_you"},{"lv":"B1","ctx":"amigos","cat":"prep","es":"Depende [de] ti.","en":"It depends {} you.","b":[{"a":["on"],"n":{"of":"Error típico: en inglés se dice \"depend on\", no \"depend of\".","from":"Se dice \"depend on\".","in":"Se dice \"depend on\"."}}],"h":"Preposición de 2 letras.","x":"\"Depend on\" = depender de. También \"It's up to you\" = tú decides.","id":"b1_it_depends_you"},{"lv":"B1","ctx":"casa","cat":"prep","es":"Estoy casado [con] María.","en":"I'm married {} María.","b":[{"a":["to"],"n":{"with":"Se dice \"married to\", no \"married with\".","whit":"Se dice \"married to\"."}}],"h":"Preposición de 2 letras.","x":"\"Married to someone\" = casado con alguien. \"Marry someone\" (sin preposición) = casarse con.","id":"b1_i_m_married_mar_a"},{"lv":"B1","ctx":"estudio","cat":"prep","es":"Ella es buena [para] los idiomas.","en":"She's good {} languages.","b":[{"a":["at","with"],"n":{"for":"\"Good for\" es bueno para la salud (vegetables are good for you). Para habilidades: \"good at\".","in":"Para habilidades se usa \"good at\".","on":"Para habilidades se usa \"good at\"."}}],"h":"Preposición de 2 letras para habilidades.","x":"\"Good at\" = bueno para (habilidad). \"Good for\" = bueno para (beneficio).","id":"b1_she_s_good_languages"},{"lv":"B1","ctx":"amigos","cat":"prep","es":"Estoy pensando [en] ti.","en":"I'm thinking {} you.","b":[{"a":["about","of"],"n":{"in":"Error típico: se dice \"think about\" o \"think of\", nunca \"think in\".","on":"Se dice \"think about\" o \"think of\"."}}],"h":"Preposición de 5 letras o de 2 (\"of\").","x":"\"Think about/of\" = pensar en. \"Think in\" solo se usa con idiomas: think in English.","id":"b1_i_m_thinking_you"},{"lv":"B1","ctx":"viaje","cat":"prep","es":"Llegamos [a] Bogotá a medianoche.","en":"We arrived {} Bogotá at midnight.","b":[{"a":["in"],"n":{"to":"Error típico: no se dice \"arrive to\". Con ciudades y países se usa \"arrive in\".","at":"\"Arrive at\" es para lugares pequeños (at the airport). Con ciudades: \"arrive in\".","a":"Esa es la preposición en español."}}],"h":"Con ciudades: la misma preposición que con años.","x":"\"Arrive in\" + ciudad o país. \"Arrive at\" + lugar concreto (at the airport). Nunca \"arrive to\".","id":"b1_we_arrived_bogot_at"},{"lv":"B1","ctx":"estudio","cat":"error","es":"¿Me puedes [explicar] esto?","en":"Can you {} this to me?","b":[{"a":["explain"],"n":{"explain me":"Error típico: no se dice \"explain me\". Se dice \"explain this to me\".","explane":"Casi: se escribe \"explain\".","explicate":"\"Explicate\" existe pero es muy académico. Se dice \"explain\"."}}],"h":"Se parece mucho al español.","x":"\"Explain something to someone\". Nunca \"explain me\".","id":"b1_can_you_this_to_me"},{"lv":"B1","ctx":"estudio","cat":"error","es":"Quiero [hacer] una pregunta.","en":"I want to {} a question.","b":[{"a":["ask"],"n":{"make":"Error típico: en inglés las preguntas se \"ask\", no se \"make\".","do":"Con \"question\" se usa \"ask\".","ask for":"Aquí no necesitas \"for\": ask a question."}}],"h":"Verbo de 3 letras.","x":"\"Ask a question\" = hacer una pregunta. Nunca \"make a question\".","id":"b1_i_want_to_a_question"},{"lv":"B1","ctx":"trabajo","cat":"error","es":"Tengo que [tomar] una decisión.","en":"I have to {} a decision.","b":[{"a":["make"],"n":{"take":"\"Take a decision\" se usa en Reino Unido, pero lo más común es \"make a decision\".","do":"Con \"decision\" se usa \"make\".","decide":"\"Decide\" es válido solo, pero con \"a decision\" se usa \"make\"."}}],"h":"El verbo de \"make breakfast\".","x":"\"Make a decision\" = tomar una decisión.","id":"b1_i_have_to_a_decision"},{"lv":"B1","ctx":"calle","cat":"daily","es":"[Tal vez] llueva mañana.","en":"{} it will rain tomorrow.","b":[{"a":["maybe","perhaps"],"n":{"may be":"\"May be\" (separado) es un verbo: \"it may be late\". Al inicio de la frase va junto.","probably":"\"Probably\" es probablemente (más seguro). \"Tal vez\" es otra.","possibly":"\"Possibly\" es válido, pero lo más común es \"maybe\"."}}],"h":"Una sola palabra, empieza por \"m\".","x":"\"Maybe\" (junto) = tal vez. \"May be\" (separado) = puede ser (verbo).","id":"b1_it_will_rain_tomorro"},{"lv":"B1","ctx":"amigos","cat":"false","es":"Estoy [contento] de verte.","en":"I'm {} to see you.","b":[{"a":["happy","glad","pleased"],"n":{"content":"\"Content\" existe, pero significa satisfecho y casi no se usa así. Prueba \"happy\" o \"glad\".","contented":"Casi no se usa así. Prueba \"happy\" o \"glad\".","contento":"Esa es la palabra en español."}}],"h":"\"Glad\" o…","x":"\"Glad/happy to see you\" = contento de verte. \"Content\" es satisfecho, poco común al hablar.","id":"b1_i_m_to_see_you"},{"lv":"B1","ctx":"casa","cat":"false","es":"Me [molesta] el ruido.","en":"The noise {} me.","b":[{"a":["bothers","annoys"],"n":{"molests":"¡Cuidado, falso amigo! \"Molest\" significa abusar sexualmente. Molestar es \"bother\" o \"annoy\".","bother":"Con \"the noise\" el verbo lleva -s.","annoy":"Con \"the noise\" el verbo lleva -s.","disturbs":"\"Disturbs\" es válido pero más formal. Lo natural es \"bothers\"."}}],"h":"Empieza por \"b\" o por \"a\", con -s al final.","x":"\"Bother/annoy\" = molestar. \"Molest\" es un delito grave. ¡No lo confundas!","id":"b1_the_noise_me"},{"lv":"B1","ctx":"viaje","cat":"daily","es":"Me [quedé dormido] en el bus.","en":"I {} on the bus.","b":[{"a":["fell asleep","dozed off","nodded off"],"n":{"slept":"\"Slept\" es dormí (dormir un rato). \"Quedarse dormido\" es empezar a dormir: \"fell asleep\".","stayed asleep":"Traducción literal. Se dice \"fell asleep\".","stayed sleeping":"Traducción literal. Se dice \"fell asleep\".","fall asleep":"Es en pasado: fell asleep.","felt asleep":"Casi: el pasado de \"fall\" es \"fell\" (no \"felt\", que es de \"feel\")."}}],"h":"Dos palabras: el pasado de \"fall\" + \"asleep\".","x":"\"Fall asleep\" = quedarse dormido. Ojo: \"overslept\" es quedarse dormido y llegar tarde.","id":"b1_i_on_the_bus"},{"lv":"B1","ctx":"trabajo","cat":"daily","es":"Ella está [a cargo de] el proyecto.","en":"She is {} the project.","b":[{"a":["in charge of","responsible for","leading"],"n":{"in charge":"¡Casi! Falta la preposición al final.","on charge of":"Se dice \"in charge of\".","at charge of":"Se dice \"in charge of\".","charge of":"Falta una palabra al inicio: \"___ charge of\"."}}],"h":"Tres palabras: \"in ___ of\".","x":"\"In charge of\" = a cargo de.","id":"b1_she_is_the_project"},{"lv":"B1","ctx":"trabajo","cat":"false","es":"La fiesta fue un [éxito].","en":"The party was a big {}.","b":[{"a":["success","hit"],"n":{"exit":"¡Falso amigo! \"Exit\" es salida. Éxito es \"success\".","succes":"Casi: lleva doble \"s\" al final.","sucess":"Casi: lleva doble \"c\".","exito":"Esa es la palabra en español."}}],"h":"Empieza por \"s\".","x":"\"Success\" = éxito. \"Exit\" = salida (el letrero en los edificios).","id":"b1_the_party_was_a_big"},{"lv":"B1","ctx":"amigos","cat":"false","es":"Él es muy [sensible] y llora con las películas.","en":"He is very {} and cries at movies.","b":[{"a":["sensitive"],"n":{"sensible":"¡Falso amigo! \"Sensible\" en inglés es sensato (con buen juicio). Sensible es \"sensitive\".","emotional":"\"Emotional\" es válido, pero la palabra que buscamos parece \"sensible\"."}}],"h":"Termina en -ive.","x":"\"Sensitive\" = sensible. \"Sensible\" = sensato, con sentido común.","id":"b1_he_is_very_and_cries"},{"lv":"B1","ctx":"salud","cat":"false","es":"Estoy [resfriado].","en":"I have a {}.","b":[{"a":["cold"],"n":{"constipation":"¡Falso amigo! \"Constipation\" es estreñimiento. Resfriado es \"a cold\".","constipated":"¡Falso amigo! \"Constipated\" significa estreñido. Resfriado es \"a cold\".","flu":"\"Flu\" es gripa (más fuerte, con fiebre). Un resfriado simple es otra palabra.","resfriado":"Esa es la palabra en español."}}],"h":"Es la misma palabra que \"frío\".","x":"\"I have a cold\" = estoy resfriado. \"Constipated\" = estreñido. ¡Cuidado en la farmacia!","id":"b1_i_have_a"},{"lv":"B1","ctx":"casa","cat":"phrasal","es":"Voy a [recoger] a mi hija a las 5.","en":"I'll {} my daughter at 5.","b":[{"a":["pick up","get"],"n":{"collect":"\"Collect\" es válido en Reino Unido, pero lo más común es \"pick up\".","recollect":"\"Recollect\" es recordar. Recoger a alguien es \"pick up\".","pick":"¡Casi! Falta una palabra: \"pick ___\".","take":"\"Take\" es llevar. Recoger es \"pick up\"."}}],"h":"Phrasal verb con \"pick\".","x":"\"Pick someone up\" = recoger a alguien (en carro, en el colegio…).","id":"b1_i_ll_my_daughter_at"},{"lv":"B1","ctx":"estudio","cat":"false","es":"Él [aprobó] el examen.","en":"He {} the exam.","b":[{"a":["passed"],"n":{"approved":"\"Approve\" es aprobar un plan o permiso. Aprobar un examen es \"pass\".","pass":"Es en pasado.","past":"Suena igual, pero \"past\" es pasado (sustantivo). El verbo es \"passed\".","aproved":"Además, \"approve\" es aprobar un plan. Un examen se \"pass\"."}}],"h":"Pasado de \"pass\".","x":"\"Pass an exam\" = aprobar un examen. \"Approve\" = aprobar un plan o una solicitud.","id":"b1_he_the_exam"},{"lv":"B1","ctx":"reunion","cat":"error","es":"Tu propuesta [tiene sentido].","en":"Your proposal {} sense.","b":[{"a":["makes"],"n":{"has":"Error típico: en inglés se dice \"make sense\", no \"have sense\".","make":"Con \"your proposal\" el verbo lleva -s.","have":"Se dice \"make sense\", no \"have sense\"."}}],"h":"El verbo de \"make a decision\", con -s.","x":"\"Make sense\" = tener sentido. \"It makes sense\".","id":"b1_your_proposal_sense"},{"lv":"B1","ctx":"entrevista","cat":"false","es":"Estudié una [carrera] de ingeniería.","en":"I have a {} in engineering.","b":[{"a":["degree"],"n":{"career":"¡Falso amigo! \"Career\" es la vida profesional. La carrera universitaria es \"degree\".","race":"\"Race\" es una carrera deportiva.","carrer":"Además, \"career\" es la vida profesional. El título es \"degree\"."}}],"h":"Palabra de 6 letras: el título universitario.","x":"\"Degree\" = carrera/título universitario. \"Career\" = trayectoria profesional.","id":"b1_i_have_a_in_engineer"},{"lv":"B1","ctx":"amigos","cat":"false","es":"Tu hermana es muy [simpática].","en":"Your sister is very {}.","b":[{"a":["nice","friendly","kind","sweet"],"n":{"sympathetic":"¡Falso amigo! \"Sympathetic\" es comprensivo, que siente compasión. Simpática es \"nice\" o \"friendly\".","simpatic":"Esa palabra no existe en inglés. Prueba \"nice\" o \"friendly\".","cute":"\"Cute\" es linda o tierna. Simpática (agradable) es otra."}}],"h":"Palabra corta de 4 letras, o \"friendly\".","x":"\"Nice/friendly\" = simpático. \"Sympathetic\" = comprensivo, compasivo.","id":"b1_your_sister_is_very"},{"lv":"B1","ctx":"amigos","cat":"false","es":"Te [presento] a mi hermana.","en":"Let me {} you to my sister.","b":[{"a":["introduce"],"n":{"present":"\"Present\" se usa en contextos formales (premios, presentaciones). Para personas: \"introduce\".","introduced":"Después de \"let me\" va la forma base."}}],"h":"Empieza por \"intro…\".","x":"\"Introduce someone to someone\" = presentar a alguien. \"Present\" es para premios o exposiciones.","id":"b1_let_me_you_to_my_sis"},{"lv":"B1","ctx":"amigos","cat":"prep","es":"Lo hizo [a propósito].","en":"He did it {} purpose.","b":[{"a":["on"],"n":{"by":"Error típico: se dice \"on purpose\", no \"by purpose\".","in":"Se dice \"on purpose\".","with":"Se dice \"on purpose\".","for":"Se dice \"on purpose\"."}}],"h":"Preposición de 2 letras.","x":"\"On purpose\" = a propósito. Lo contrario: \"by accident\" o \"by mistake\".","id":"b1_he_did_it_purpose"},{"lv":"B1","ctx":"estudio","cat":"idiom","es":"[No tengo ni idea].","en":"I haven't got a {}.","b":[{"a":["clue"],"n":{"idea":"\"I have no idea\" es válido, pero con \"haven't got a\" la palabra informal es \"clue\".","hint":"\"Hint\" es pista, pero la expresión usa otra palabra.","track":"La expresión usa otra palabra de 4 letras."}}],"h":"Palabra de 4 letras que significa \"pista\".","x":"\"I haven't got a clue\" o \"I have no idea\" = no tengo ni idea.","id":"b1_i_haven_t_got_a"},{"lv":"B2","ctx":"tienda","cat":"idiom","es":"Esto me [costó un ojo de la cara].","en":"This cost me {}.","b":[{"a":["an arm and a leg"],"n":{"an eye of the face":"Traducción literal: en inglés no se dice así. El inglés usa dos partes del cuerpo: un brazo y una pierna.","a lot":"\"A lot\" es válido pero no es la expresión. ¿Cuál es la frase idiomática?","a fortune":"\"A fortune\" es válido. Pero la expresión con partes del cuerpo es otra.","arm and a leg":"¡Casi! Falta el artículo al inicio: \"an…\".","an eye":"Traducción literal. En inglés son un brazo y una pierna."}}],"h":"Dos partes del cuerpo: un brazo y una pierna.","x":"\"Cost an arm and a leg\" = costar un ojo de la cara (muy caro).","id":"b2_this_cost_me"},{"lv":"B2","ctx":"amigos","cat":"idiom","es":"Voy a [consultarlo con la almohada].","en":"I'll {} on it.","b":[{"a":["sleep"],"n":{"think":"\"Think about it\" es válido, pero la expresión es \"___ on it\" (dormir sobre ello).","pillow":"La almohada no aparece en la expresión inglesa. Piensa en lo que haces por la noche.","sleep it":"Solo una palabra: \"sleep on it\"."}}],"h":"Lo que haces por la noche.","x":"\"Sleep on it\" = consultarlo con la almohada.","id":"b2_i_ll_on_it"},{"lv":"B2","ctx":"amigos","cat":"idiom","es":"Me estás [tomando el pelo].","en":"You're {} my leg.","b":[{"a":["pulling"],"n":{"taking":"Traducción literal. En inglés se \"jala\" la pierna: \"pull my leg\".","joking":"\"Joking\" es válido (\"you're joking\"), pero la expresión con \"my leg\" es otra.","pull":"Aquí va con -ing: \"You're ___ing\".","kidding":"\"You're kidding\" es válido, pero con \"my leg\" el verbo es otro."}}],"h":"En inglés te \"jalan la pierna\".","x":"\"Pull someone's leg\" = tomarle el pelo a alguien.","id":"b2_you_re_my_leg"},{"lv":"B2","ctx":"cita","cat":"phrasal","es":"Me [dejó plantado] anoche.","en":"He {} me up last night.","b":[{"a":["stood"],"n":{"left":"\"Left me\" es me dejó, pero dejar plantado es \"stand someone up\" (pasado: stood).","stand":"Es en pasado.","planted":"Traducción literal. Se dice \"stand someone up\".","stooded":"\"Stand\" es irregular: el pasado es \"stood\"."}}],"h":"Pasado irregular de \"stand\".","x":"\"Stand someone up\" = dejar plantado a alguien.","id":"b2_he_me_up_last_night"},{"lv":"B2","ctx":"estudio","cat":"idiom","es":"El examen fue [pan comido].","en":"The exam was a {}.","b":[{"a":["piece of cake","breeze","cinch","walk in the park"],"n":{"eaten bread":"Traducción literal. En inglés la comida de la expresión es un pastel.","easy":"\"Easy\" es la idea, pero después de \"a\" necesitas la expresión.","bread":"En inglés la expresión usa pastel, no pan.","cake":"¡Casi! La expresión completa es \"a ___ of cake\".","piece of bread":"Casi: en inglés es un pedazo de pastel."}}],"h":"Un pedazo de pastel.","x":"\"A piece of cake\" = pan comido (muy fácil).","id":"b2_the_exam_was_a"},{"lv":"B2","ctx":"calle","cat":"idiom","es":"Está lloviendo [a cántaros].","en":"It's raining {}.","b":[{"a":["cats and dogs","hard","heavily"],"n":{"jugs":"Traducción literal. La expresión inglesa usa dos animales.","a lot":"\"A lot\" es válido, pero hay una expresión con dos animales.","buckets":"\"It's pouring buckets\" existe, pero con \"raining\" la expresión clásica usa animales.","dogs and cats":"¡Casi! El orden es al revés."}}],"h":"Dos animales domésticos.","x":"\"Raining cats and dogs\" = llover a cántaros. También: \"pouring\".","id":"b2_it_s_raining"},{"lv":"B2","ctx":"trabajo","cat":"idiom","es":"La noticia me [tomó] por sorpresa.","en":"The news {} me by surprise.","b":[{"a":["took","caught"],"n":{"catched":"El pasado de \"catch\" es irregular: caught.","take":"Es en pasado.","taked":"\"Take\" es irregular: el pasado es \"took\".","got":"Con \"by surprise\" se usa \"took\" o \"caught\"."}}],"h":"Pasado de \"take\" o de \"catch\".","x":"\"Take/catch someone by surprise\" = tomar por sorpresa.","id":"b2_the_news_me_by_surpr"},{"lv":"B2","ctx":"reunion","cat":"idiom","es":"Vamos [al grano].","en":"Let's {} to the point.","b":[{"a":["get","cut"],"n":{"go":"\"Go to the point\" es traducción literal. Se dice \"get to the point\".","come":"Se dice \"get to the point\" o \"cut to the chase\".","arrive":"Se dice \"get to the point\"."}}],"h":"Verbo de 3 letras muy común.","x":"\"Get to the point\" o \"cut to the chase\" = ir al grano.","id":"b2_let_s_to_the_point"},{"lv":"B2","ctx":"trabajo","cat":"phrasal","es":"Tengo que [ponerme al día] con el trabajo.","en":"I need to {} on my work.","b":[{"a":["catch up"],"n":{"put up":"\"Put up\" es colgar o alojar. Ponerse al día es \"catch up\".","update":"\"Update\" es actualizar información. Ponerse al día con tareas pendientes es \"catch up\".","catch":"¡Casi! Falta una palabra: \"catch ___\".","put me up":"Traducción literal. Se dice \"catch up\"."}}],"h":"Phrasal verb con \"catch\".","x":"\"Catch up (on something)\" = ponerse al día.","id":"b2_i_need_to_on_my_work"},{"lv":"B2","ctx":"casa","cat":"phrasal","es":"Se nos [acabó] la leche.","en":"We {} of milk.","b":[{"a":["ran out","have run out","are out"],"n":{"finished":"\"Finished the milk\" es válido si alguien se la tomó toda, pero con \"of\" la expresión es \"run out of\".","ended":"\"End\" no funciona aquí. Con \"of\" la expresión es \"run out of\".","run out":"Es en pasado: \"ran out\".","ran":"¡Casi! Falta una palabra: \"ran ___ of\"."}}],"h":"Phrasal verb con \"run\", en pasado.","x":"\"Run out of something\" = quedarse sin algo.","id":"b2_we_of_milk"},{"lv":"B2","ctx":"reunion","cat":"phrasal","es":"La reunión [se canceló] a última hora.","en":"The meeting was {} at the last minute.","b":[{"a":["called off","cancelled","canceled"],"n":{"called out":"\"Call out\" es llamar la atención o gritar. Cancelar es \"call off\".","call off":"Aquí va el participio: \"called off\".","cancelled off":"Solo una: \"cancelled\" o \"called off\"."}}],"h":"Phrasal verb con \"call\", o \"cancelled\".","x":"\"Call off\" = cancelar (informal). The meeting was called off.","id":"b2_the_meeting_was_at_t"},{"lv":"B2","ctx":"tel","cat":"phrasal","es":"¿Puedes [averiguar] a qué hora abre?","en":"Can you {} what time it opens?","b":[{"a":["find out","check"],"n":{"figure out":"\"Figure out\" es entender o resolver algo pensando. Averiguar un dato es \"find out\".","investigate":"\"Investigate\" es demasiado formal aquí. Averiguar un dato es \"find out\".","find":"¡Casi! Falta una palabra: \"find ___\".","averiguate":"Esa palabra no existe en inglés."}}],"h":"Phrasal verb con \"find\".","x":"\"Find out\" = averiguar (un dato). \"Figure out\" = entender o resolver pensando.","id":"b2_can_you_what_time_it"},{"lv":"B2","ctx":"trabajo","cat":"phrasal","es":"No logro [entender] cómo funciona.","en":"I can't {} how it works.","b":[{"a":["figure out","work out","understand"],"n":{"find out":"\"Find out\" es averiguar un dato. Entender pensando es \"figure out\".","realize":"\"Realize\" es darse cuenta. Entender algo pensando es \"figure out\".","figure":"¡Casi! Falta una palabra: \"figure ___\"."}}],"h":"Phrasal verb con \"figure\".","x":"\"Figure out\" = descifrar, entender algo pensando.","id":"b2_i_can_t_how_it_works"},{"lv":"B2","ctx":"tel","cat":"false","es":"Tienes que [aguantar] un poco más.","en":"You need to {} a little longer.","b":[{"a":["hold on","hang on","hang in there"],"n":{"support":"¡Falso amigo! \"Support\" es apoyar. Aguantar es \"hold on\" o \"hang on\".","stand":"\"Stand\" es soportar algo que no te gusta (\"I can't stand it\"). Aquí es \"aguanta un momento\".","wait":"\"Wait\" es válido, pero para \"aguantar\" se usa un phrasal verb con \"hold\" o \"hang\".","hold":"¡Casi! Falta una palabra: \"hold ___\"."}}],"h":"Phrasal verb con \"hold\" o \"hang\".","x":"\"Hold on / hang on\" = aguantar, esperar un momento. \"Support\" = apoyar.","id":"b2_you_need_to_a_little"},{"lv":"B2","ctx":"viaje","cat":"false","es":"No [soporto] el tráfico.","en":"I can't {} traffic.","b":[{"a":["stand","bear"],"n":{"support":"¡Falso amigo! \"Support\" es apoyar. No soportar algo es \"can't stand\".","tolerate":"\"Tolerate\" es válido pero formal. En conversación se dice otra palabra.","suport":"Además, \"support\" es apoyar. No soportar es \"can't stand\"."}}],"h":"El verbo de \"ponerse de pie\".","x":"\"I can't stand it\" = no lo soporto. \"Support\" = apoyar.","id":"b2_i_can_t_traffic"},{"lv":"B2","ctx":"amigos","cat":"idiom","es":"[Al fin y al cabo], lo importante es estar bien.","en":"{}, what matters is being okay.","b":[{"a":["at the end of the day","after all","in the end","ultimately"],"n":{"at the end":"¡Casi! La expresión completa es \"at the end of the ___\".","finally":"\"Finally\" es \"por fin\" o \"finalmente\" en una secuencia. Aquí buscas \"al fin y al cabo\".","at last":"\"At last\" es \"por fin\". Aquí buscas \"al fin y al cabo\"."}}],"h":"\"At the end of the…\"","x":"\"At the end of the day\" o \"after all\" = al fin y al cabo.","id":"b2_what_matters_is_bein"},{"lv":"B2","ctx":"amigos","cat":"idiom","es":"No [vale la pena].","en":"It's not {} it.","b":[{"a":["worth"],"n":{"worthy":"\"Worthy\" es digno. \"Valer la pena\" es \"worth it\".","value":"\"Value\" es valor (sustantivo). Se dice \"it's not worth it\".","worth the pain":"Casi: solo necesitas \"worth\" (it's not worth it)."}}],"h":"Palabra de 5 letras que empieza por \"w\".","x":"\"It's (not) worth it\" = (no) vale la pena.","id":"b2_it_s_not_it"},{"lv":"B2","ctx":"trabajo","cat":"error","es":"Ya [estoy acostumbrado a] madrugar.","en":"I'm {} waking up early.","b":[{"a":["used to","accustomed to"],"n":{"use to":"Con \"I'm\" se usa \"used to\" (con -d).","accustomed":"Falta \"to\": accustomed to.","used":"¡Casi! Falta \"to\".","custom to":"Se dice \"used to\"."}}],"h":"Dos palabras: \"used ___\".","x":"\"Be used to + -ing\" = estar acostumbrado a. \"Used to + verbo\" = solía.","id":"b2_i_m_waking_up_early"},{"lv":"B2","ctx":"amigos","cat":"error","es":"Ojalá [tuviera] más tiempo.","en":"I wish I {} more time.","b":[{"a":["had"],"n":{"have":"Después de \"I wish\" se usa el pasado para deseos del presente: I wish I had.","would have":"Con \"wish\" para el presente se usa \"had\".","has":"Con \"I\" y después de \"wish\": had."}}],"h":"Pasado de \"have\".","x":"\"I wish + pasado\" = ojalá (presente). I wish I had more time.","id":"b2_i_wish_i_more_time"},{"lv":"B2","ctx":"amigos","cat":"error","es":"Si [hubiera sabido], habría venido.","en":"If I {} known, I would have come.","b":[{"a":["had"],"n":{"would have":"Error típico: no se usa \"would\" en la parte del \"if\". Se dice \"If I had known\".","have":"Aquí necesitas el pasado perfecto: \"had known\".","would":"No se usa \"would\" en la parte del \"if\"."}}],"h":"Pasado de \"have\".","x":"Tercer condicional: If + had + participio, would have + participio.","id":"b2_if_i_known_i_would_h"},{"lv":"B2","ctx":"amigos","cat":"error","es":"Deberías [haber] llamado.","en":"You should {} called.","b":[{"a":["have"],"n":{"of":"Error común (hasta de nativos): se escribe \"should have\", aunque suene como \"should of\".","had":"Después de \"should\" va \"have\" + participio.","has":"Después de \"should\" va \"have\", sin -s."}}],"h":"Verbo de 4 letras.","x":"\"Should have + participio\" = debería haber… (algo que no pasó).","id":"b2_you_should_called"},{"lv":"B2","ctx":"reunion","cat":"idiom","es":"Deja de [andarte por las ramas].","en":"Stop {} around the bush.","b":[{"a":["beating"],"n":{"walking":"Traducción literal. La expresión inglesa es \"beat around the bush\".","beat":"Después de \"stop\" va con -ing.","going":"La expresión es \"beat around the bush\".","hitting":"Casi: la expresión usa \"beat\"."}}],"h":"Verbo que significa \"golpear\", con -ing.","x":"\"Beat around the bush\" = andarse por las ramas.","id":"b2_stop_around_the_bush"},{"lv":"B2","ctx":"amigos","cat":"idiom","es":"Estoy [pelado] este mes.","en":"I'm {} this month.","b":[{"a":["broke"],"n":{"broken":"\"Broken\" es roto (un objeto). Sin dinero se dice \"broke\".","poor":"\"Poor\" es pobre en general. Para \"sin plata este mes\" se dice \"broke\".","peeled":"Traducción literal. Sin plata es \"broke\"."}}],"h":"Parece el pasado de \"break\".","x":"\"Broke\" = sin plata (informal). \"Broken\" = roto.","id":"b2_i_m_this_month"},{"lv":"B2","ctx":"amigos","cat":"idiom","es":"Voy a [darle una oportunidad].","en":"I'll give it a {}.","b":[{"a":["try","shot","go","chance"],"n":{"opportunity":"\"Give it an opportunity\" suena raro. Lo natural es \"give it a try\" o \"a shot\".","intent":"\"Intent\" es intención. Se dice \"give it a try\"."}}],"h":"Palabra de 3 letras: \"intento\".","x":"\"Give it a try / a shot / a go\" = intentarlo.","id":"b2_i_ll_give_it_a"},{"lv":"B2","ctx":"amigos","cat":"phrasal","es":"Puedes [contar] conmigo.","en":"You can {} on me.","b":[{"a":["count","rely","depend"],"n":{"trust":"\"Trust me\" es válido, pero con \"on me\" se usa \"count\".","tell":"\"Tell\" es decir o contar una historia. \"Contar con alguien\" es \"count on\"."}}],"h":"Parece \"contar\".","x":"\"Count on someone\" = contar con alguien.","id":"b2_you_can_on_me"},{"lv":"B2","ctx":"viaje","cat":"idiom","es":"Lleva un paraguas, [por si acaso].","en":"Take an umbrella, {}.","b":[{"a":["just in case","in case"],"n":{"by if case":"Traducción literal. Se dice \"just in case\".","if case":"Traducción literal. Se dice \"just in case\".","for if":"Traducción literal. Se dice \"just in case\".","for if case":"Traducción literal. Se dice \"just in case\"."}}],"h":"Tres palabras: \"just ___ ___\".","x":"\"Just in case\" = por si acaso.","id":"b2_take_an_umbrella"},{"lv":"B2","ctx":"tel","cat":"false","es":"Lo siento, [me equivoqué de] número.","en":"Sorry, I have the {} number.","b":[{"a":["wrong"],"n":{"incorrect":"\"Incorrect\" es válido pero suena formal. Por teléfono se dice \"wrong number\".","bad":"\"Bad number\" no se usa. Se dice \"wrong number\".","equivocated":"\"Equivocate\" significa hablar de forma ambigua a propósito. Equivocarse es \"be wrong\".","mistaken":"Se dice \"the wrong number\"."}}],"h":"Lo contrario de \"right\".","x":"\"Wrong number\" = número equivocado. \"Equivocate\" es otro significado.","id":"b2_sorry_i_have_the_num"},{"lv":"B2","ctx":"trabajo","cat":"false","es":"Hay que [cumplir] la fecha límite.","en":"We have to {} the deadline.","b":[{"a":["meet"],"n":{"accomplish":"\"Accomplish\" es lograr algo (una meta). Con \"deadline\" se usa \"meet\".","comply":"\"Comply with\" es cumplir reglas. Con fechas límite: \"meet the deadline\".","fulfill":"\"Fulfill\" es cumplir un sueño o una promesa. Con \"deadline\": \"meet\".","achieve":"Con \"deadline\" se usa \"meet\"."}}],"h":"El verbo de \"conocer a alguien\".","x":"\"Meet a deadline\" = cumplir con una fecha límite.","id":"b2_we_have_to_the_deadl"},{"lv":"B2","ctx":"trabajo","cat":"error","es":"Vamos a [echar un vistazo].","en":"Let's {} a look.","b":[{"a":["take","have"],"n":{"throw":"Traducción literal de \"echar\". Se dice \"take a look\" o \"have a look\".","give":"\"Give a look\" no es natural. Se dice \"take a look\".","do":"Se dice \"take a look\".","make":"Se dice \"take a look\"."}}],"h":"El verbo de \"take a photo\".","x":"\"Take/have a look\" = echar un vistazo.","id":"b2_let_s_a_look"},{"lv":"B2","ctx":"trabajo","cat":"idiom","es":"Estoy [harto] de esto.","en":"I'm {} of this.","b":[{"a":["fed up","sick and tired","sick","tired"],"n":{"full":"\"Full\" es lleno (de comida). Estar harto es \"fed up\".","bored":"\"Bored\" es aburrido; harto es más fuerte: \"fed up\".","feed up":"Casi: es \"fed up\"."}}],"h":"Dos palabras: \"fed ___\".","x":"\"Be fed up with/of\" = estar harto.","id":"b2_i_m_of_this"},{"lv":"B2","ctx":"tel","cat":"error","es":"Llámame cuando [llegues].","en":"Call me when you {}.","b":[{"a":["arrive","get there","get here","get home"],"n":{"will arrive":"Después de \"when\" (futuro) se usa presente: \"when you arrive\".","arrived":"Es futuro, pero después de \"when\" se usa presente.","arrive to":"No se dice \"arrive to\". Solo \"arrive\".","will get there":"Después de \"when\" (futuro) se usa presente."}}],"h":"Presente simple, aunque hables del futuro.","x":"Después de \"when\" con sentido futuro se usa presente: when you arrive.","id":"b2_call_me_when_you"},{"lv":"B2","ctx":"estudio","cat":"phrasal","es":"Me [di por vencido].","en":"I {} up.","b":[{"a":["gave"],"n":{"gived":"\"Give\" es irregular: el pasado es \"gave\".","give":"Es en pasado.","surrendered":"\"Surrender\" es rendirse (en una guerra). Con \"up\": \"gave up\"."}}],"h":"Pasado irregular de \"give\".","x":"\"Give up\" = rendirse, darse por vencido.","id":"b2_i_up"},{"lv":"B2","ctx":"trabajo","cat":"phrasal","es":"Tenemos que [reducir] gastos.","en":"We need to {} on expenses.","b":[{"a":["cut back","cut down"],"n":{"reduce":"\"Reduce expenses\" es válido (sin \"on\"). Con \"on\" se usa el phrasal verb \"cut back\".","cut":"¡Casi! Falta una palabra: \"cut ___ on\"."}}],"h":"Phrasal verb con \"cut\".","x":"\"Cut back on something\" = reducir algo.","id":"b2_we_need_to_on_expens"},{"lv":"B2","ctx":"trabajo","cat":"false","es":"Estoy [dispuesto a] ayudar.","en":"I'm {} to help.","b":[{"a":["willing","ready","happy"],"n":{"disposed":"\"Disposed to\" existe pero es muy formal. Lo natural es \"willing to\".","available":"\"Available\" es disponible (tener tiempo). Dispuesto es \"willing\".","dispose":"\"Dispose\" es deshacerse de algo. Dispuesto es \"willing\"."}}],"h":"Empieza por \"w\".","x":"\"Willing to\" = dispuesto a.","id":"b2_i_m_to_help"},{"lv":"B2","ctx":"trabajo","cat":"daily","es":"Estoy [agotado].","en":"I'm {}.","b":[{"a":["exhausted","worn out","drained","beat","wiped out","shattered"],"n":{"tired":"\"Tired\" es válido, pero agotado es más fuerte. ¿Una palabra más intensa?","agotated":"Esa palabra no existe. Prueba \"exhausted\".","exhausting":"\"Exhausting\" es lo que agota. Tú estás \"exhausted\"."}}],"h":"Palabra que empieza por \"ex\".","x":"\"Exhausted / worn out\" = agotado.","id":"b2_i_m"},{"lv":"B2","ctx":"amigos","cat":"idiom","es":"Lo haré [tarde o temprano].","en":"I'll do it {}.","b":[{"a":["sooner or later"],"n":{"late or early":"Traducción literal. En inglés el orden es al revés: \"sooner or later\".","later or sooner":"En inglés el orden es \"sooner or later\".","eventually":"\"Eventually\" es válido (con el tiempo). La expresión exacta es \"sooner or later\".","early or late":"En inglés es \"sooner or later\"."}}],"h":"En inglés el orden es al revés: \"más temprano o más tarde\".","x":"\"Sooner or later\" = tarde o temprano.","id":"b2_i_ll_do_it"},{"lv":"B2","ctx":"estudio","cat":"false","es":"Me [arrepiento de] no haber estudiado.","en":"I {} not studying.","b":[{"a":["regret"],"n":{"repent":"\"Repent\" es arrepentirse en sentido religioso o moral. Para decisiones diarias: \"regret\".","regret of":"\"Regret\" no lleva \"of\": I regret not studying.","repent of":"\"Repent\" es religioso. Para decisiones diarias: \"regret\"."}}],"h":"Empieza por \"re\".","x":"\"Regret + -ing\" = arrepentirse de.","id":"b2_i_not_studying"},{"lv":"B2","ctx":"casa","cat":"phrasal","es":"Ella [crió] a sus hijos sola.","en":"She {} her kids on her own.","b":[{"a":["brought up","raised"],"n":{"took out":"Traducción literal de \"sacó\". Criar es \"bring up\" o \"raise\".","grew":"\"Grow\" es crecer; \"grow up\" es crecer tú. Criar es \"bring up\" o \"raise\".","grew up":"\"Grow up\" es crecer (los hijos crecen). Criar es \"bring up\" o \"raise\".","rose":"\"Rise/rose\" es subir. Criar es \"raise\" (pasado: raised).","bringed up":"\"Bring\" es irregular: el pasado es \"brought\".","created":"\"Created\" es crear algo. Criar hijos es \"bring up\" o \"raise\"."}}],"h":"Phrasal verb con \"bring\" en pasado, o \"raised\".","x":"\"Bring up / raise\" = criar. \"Grow up\" = crecer.","id":"b2_she_her_kids_on_her"},{"lv":"B2","ctx":"amigos","cat":"idiom","es":"¡[Hablando del rey de Roma]!","en":"{} of the devil!","b":[{"a":["speak","speaking","talk of"],"n":{"talking":"Casi: la expresión fija usa otro verbo: \"Speak of the devil\".","talk":"Casi: la expresión fija usa \"speak\".","speaking of the king":"Traducción literal. En inglés se menciona al diablo."}}],"h":"\"Hablar\", pero no \"talk\".","x":"\"Speak of the devil\" = hablando del rey de Roma (la persona aparece justo cuando hablan de ella).","id":"b2_of_the_devil"},{"lv":"B2","ctx":"trabajo","cat":"daily","es":"Ella está [a punto de] renunciar.","en":"She is {} to quit.","b":[{"a":["about"],"n":{"at point":"Traducción literal. Se dice \"about to\".","going":"\"Going to\" es futuro planeado. \"A punto de\" es \"about to\".","almost":"\"Almost\" es casi. \"A punto de\" es \"about to\"."}}],"h":"Palabra de 5 letras, \"sobre\".","x":"\"Be about to\" = estar a punto de.","id":"b2_she_is_to_quit"},{"lv":"B2","ctx":"tel","cat":"daily","es":"Te aviso [en cuanto] llegue.","en":"I'll let you know {} I arrive.","b":[{"a":["as soon as","once"],"n":{"in how much":"Traducción literal. Se dice \"as soon as\".","when":"\"When\" es válido pero menos inmediato. \"En cuanto\" es \"as soon as\".","as soon":"¡Casi! Falta \"as\" al final."}}],"h":"Tres palabras: \"as ___ as\".","x":"\"As soon as\" = en cuanto, tan pronto como.","id":"b2_i_ll_let_you_know_i"},{"lv":"B2","ctx":"calle","cat":"error","es":"[A pesar de] la lluvia, salimos.","en":"{} the rain, we went out.","b":[{"a":["despite","in spite of"],"n":{"despite of":"Error típico: se dice \"despite\" (sin \"of\") o \"in spite of\".","although":"\"Although\" necesita una frase completa: \"Although it was raining\".","in spite":"¡Casi! Falta \"of\"."}}],"h":"Una palabra, sin \"of\".","x":"\"Despite\" (sin \"of\") o \"in spite of\" = a pesar de.","id":"b2_the_rain_we_went_out"},{"lv":"B2","ctx":"amigos","cat":"idiom","es":"Tomémoslo [con calma].","en":"Let's {} it easy.","b":[{"a":["take"],"n":{"go":"Se dice \"take it easy\".","make":"Se dice \"take it easy\".","have":"Se dice \"take it easy\"."}}],"h":"El verbo de \"take a photo\".","x":"\"Take it easy\" = tomarlo con calma.","id":"b2_let_s_it_easy"},{"lv":"C1","ctx":"reunion","cat":"idiom","es":"Deja de [buscarle tres pies al gato].","en":"Stop {}.","b":[{"a":["splitting hairs","overthinking it","overthinking","nitpicking"],"n":{"looking for three feet":"Traducción literal. En inglés se \"dividen pelos\": \"splitting hairs\".","looking for three feet to the cat":"Traducción literal. En inglés se dice \"splitting hairs\".","complicating":"Se entiende, pero hay una expresión: \"splitting hairs\"."}}],"h":"En inglés se \"dividen pelos\".","x":"\"Split hairs\" = buscarle tres pies al gato (fijarse en detalles sin importancia).","id":"c1_stop"},{"lv":"C1","ctx":"reunion","cat":"idiom","es":"Eso es [harina de otro costal].","en":"That's {}.","b":[{"a":["a different story","another story","a whole different story","a whole other story","a different kettle of fish","another kettle of fish","a different ball game","a whole different ball game","a whole new ball game"],"n":{"flour of another sack":"Traducción literal. Una expresión común: \"a different story\" o \"a whole different ball game\".","other flour":"Traducción literal. Prueba \"a different story\".","different":"¡Casi! Usa una expresión completa: \"a different ___\"."}}],"h":"\"Una historia diferente…\"","x":"\"A different story\" o \"a whole different ball game\" = harina de otro costal.","id":"c1_that_s"},{"lv":"C1","ctx":"trabajo","cat":"daily","es":"Lo hizo [a regañadientes].","en":"He did it {}.","b":[{"a":["reluctantly","grudgingly","unwillingly"],"n":{"angrily":"\"Angrily\" es con enojo. A regañadientes es sin ganas: \"reluctantly\".","with bad face":"Traducción literal. Se dice \"reluctantly\".","badly":"\"Badly\" es mal hecho. A regañadientes es \"reluctantly\"."}}],"h":"Adverbio que empieza por \"re\" y termina en -ly.","x":"\"Reluctantly\" = a regañadientes, sin ganas.","id":"c1_he_did_it"},{"lv":"C1","ctx":"amigos","cat":"idiom","es":"No [me da la gana].","en":"I don't {} like it.","b":[{"a":["feel"],"n":{"want":"\"I don't want\" es válido, pero con \"like it\" la expresión es \"I don't feel like it\".","give":"Traducción literal de \"dar\". Se dice \"feel like\".","fell":"Casi: es \"feel\" (sentir), no \"fell\"."}}],"h":"Verbo de \"sentir\".","x":"\"I don't feel like it\" = no me da la gana, no tengo ganas.","id":"c1_i_don_t_like_it"},{"lv":"C1","ctx":"trabajo","cat":"false","es":"No te [preocupes], lo tengo [bajo] control.","en":"Don't {}, I've got it {} control.","b":[{"a":["worry"],"n":{"preoccupy":"¡Falso amigo! \"Preoccupied\" es estar absorto en algo. Preocuparse es \"worry\".","care":"\"Don't care\" es \"no te importe\". Preocuparse es \"worry\".","worried":"Después de \"don't\" va la forma base."}},{"a":["under"],"n":{"below":"Se dice \"under control\".","in":"Se dice \"under control\".","on":"Se dice \"under control\"."}}],"h":"\"No te…\" empieza por \"w\". La preposición es \"debajo de\".","x":"\"Don't worry\" = no te preocupes. \"Under control\" = bajo control.","id":"c1_don_t_i_ve_got_it_co"},{"lv":"C1","ctx":"reunion","cat":"idiom","es":"Hay que [tener en cuenta] el presupuesto.","en":"We need to {} the budget.","b":[{"a":["take into account","bear in mind","keep in mind","consider","factor in","take into consideration"],"n":{"have in account":"Traducción literal. Se dice \"take into account\" o \"bear in mind\".","have in mind":"\"Have in mind\" es tener pensado. Tener en cuenta es \"bear in mind\" o \"take into account\".","take in account":"¡Casi! Es \"take INTO account\".","have into account":"Se dice \"take into account\"."}}],"h":"\"Take into…\" o \"bear in…\".","x":"\"Take into account\" / \"bear in mind\" = tener en cuenta.","id":"c1_we_need_to_the_budge"},{"lv":"C1","ctx":"reunion","cat":"idiom","es":"[A grandes rasgos], el plan es bueno.","en":"{}, the plan is good.","b":[{"a":["broadly speaking","in broad terms","overall","roughly speaking","generally speaking","by and large","all in all"],"n":{"in big lines":"Traducción literal. Se dice \"broadly speaking\".","in general lines":"Traducción literal. Se dice \"broadly speaking\".","in broad lines":"Casi: se dice \"broadly speaking\" o \"in broad terms\"."}}],"h":"\"Broadly…\"","x":"\"Broadly speaking\" o \"by and large\" = a grandes rasgos.","id":"c1_the_plan_is_good"},{"lv":"C1","ctx":"amigos","cat":"idiom","es":"[Me importa un pepino].","en":"I couldn't {} less.","b":[{"a":["care"],"n":{"mind":"\"I don't mind\" es válido pero es otra estructura. La expresión con \"less\" es \"couldn't care less\".","worry":"La expresión es \"couldn't care less\".","matter":"\"Matter\" no va con \"I\". La expresión es \"couldn't care less\"."}}],"h":"El verbo de \"I don't care\".","x":"\"I couldn't care less\" = me importa un pepino.","id":"c1_i_couldn_t_less"},{"lv":"C1","ctx":"amigos","cat":"false","es":"Él siempre [presume de] su carro.","en":"He always {} about his car.","b":[{"a":["brags","boasts"],"n":{"presumes":"¡Falso amigo! \"Presume\" es suponer. Presumir es \"brag\" o \"boast\".","shows off":"\"Show off\" es válido pero sin \"about\": \"he shows off his car\".","brag":"Con \"he\" el verbo lleva -s.","boast":"Con \"he\" el verbo lleva -s."}}],"h":"Empieza por \"b\" y lleva -s.","x":"\"Brag/boast about\" = presumir de. \"Presume\" = suponer.","id":"c1_he_always_about_his"},{"lv":"C1","ctx":"trabajo","cat":"idiom","es":"Es [cuestión] de tiempo.","en":"It's a {} of time.","b":[{"a":["matter","question"],"n":{"cuestion":"Casi: en inglés se escribe con \"qu\", aunque lo más común es \"matter\".","issue":"\"Issue\" es un problema o asunto. La expresión es \"a matter of time\".","thing":"La expresión es \"a matter of time\"."}}],"h":"Empieza por \"m\".","x":"\"It's a matter of time\" = es cuestión de tiempo.","id":"c1_it_s_a_of_time"},{"lv":"C1","ctx":"reunion","cat":"idiom","es":"Eso no [tiene nada que ver].","en":"That has nothing to {} with it.","b":[{"a":["do"],"n":{"see":"Traducción literal de \"ver\". Se dice \"nothing to do with\".","make":"Se dice \"nothing to do with\".","be":"Se dice \"nothing to do with\"."}}],"h":"Verbo de 2 letras.","x":"\"Have nothing to do with\" = no tener nada que ver con.","id":"c1_that_has_nothing_to"},{"lv":"C1","ctx":"rest","cat":"false","es":"Ese restaurante está [sobrevalorado].","en":"That restaurant is {}.","b":[{"a":["overrated"],"n":{"overvalued":"\"Overvalued\" se usa para precios o acciones. Para opiniones: \"overrated\".","overestimated":"\"Overestimated\" es calcular de más. Para opiniones: \"overrated\".","over rated":"Se escribe junto: overrated."}}],"h":"\"Over\" + \"rated\".","x":"\"Overrated\" = sobrevalorado. \"Underrated\" = subestimado.","id":"c1_that_restaurant_is"},{"lv":"C1","ctx":"tel","cat":"false","es":"Llámame si [eventualmente] necesitas algo.","en":"Call me if you {} need anything.","b":[{"a":["happen to","ever"],"n":{"eventually":"¡Falso amigo! \"Eventually\" significa \"al final, con el tiempo\". Aquí \"eventualmente\" es \"por casualidad\": \"happen to\".","occasionally":"\"Occasionally\" es de vez en cuando. Aquí es \"por casualidad\": \"happen to\"."}}],"h":"\"Por casualidad\": \"happen ___\".","x":"\"Eventually\" = al final. \"If you happen to…\" = si por casualidad…","id":"c1_call_me_if_you_need"},{"lv":"C1","ctx":"trabajo","cat":"phrasal","es":"El jefe nos [regañó].","en":"The boss {} us off.","b":[{"a":["told"],"n":{"threw":"Se dice \"tell someone off\".","said":"Con \"off\" la expresión es \"tell someone off\".","scolded":"\"Scolded\" es válido, pero no lleva \"off\". Con \"off\": \"told us off\".","tell":"Es en pasado."}}],"h":"Pasado de \"tell\".","x":"\"Tell someone off\" = regañar a alguien.","id":"c1_the_boss_us_off"},{"lv":"C1","ctx":"trabajo","cat":"idiom","es":"Es [la gota que colmó el vaso].","en":"It's the last {}.","b":[{"a":["straw"],"n":{"drop":"Traducción literal. En inglés es una pajita: \"the last straw\".","glass":"En inglés la expresión usa una pajita."}}],"h":"Una pajita.","x":"\"The last straw\" = la gota que colmó el vaso.","id":"c1_it_s_the_last"},{"lv":"C1","ctx":"cita","cat":"idiom","es":"Vamos a [improvisar].","en":"Let's {} it by ear.","b":[{"a":["play"],"n":{"improvise":"\"Improvise\" es válido, pero con \"by ear\" la expresión es \"play it by ear\".","take":"Se dice \"play it by ear\".","do":"Se dice \"play it by ear\"."}}],"h":"El verbo de tocar música.","x":"\"Play it by ear\" = improvisar sobre la marcha.","id":"c1_let_s_it_by_ear"},{"lv":"C1","ctx":"trabajo","cat":"idiom","es":"Hay que [atar cabos].","en":"We need to {} the dots.","b":[{"a":["connect","join"],"n":{"tie":"Traducción literal de \"atar\". En inglés se \"conectan los puntos\".","link":"\"Link\" se entiende, pero la expresión fija es \"connect the dots\"."}}],"h":"\"Conectar\".","x":"\"Connect the dots\" = atar cabos.","id":"c1_we_need_to_the_dots"},{"lv":"C1","ctx":"reunion","cat":"idiom","es":"No [me convence] la idea.","en":"I'm not {} on the idea.","b":[{"a":["sold"],"n":{"convinced":"\"Convinced\" es válido, pero con \"by\": \"I'm not convinced by the idea\". Con \"on\" la expresión informal es \"sold on\".","sure":"\"Sure\" es válido con \"about\". Con \"on\" la expresión es \"sold on\".","sell":"Aquí va el participio: \"sold\"."}}],"h":"Participio de \"sell\".","x":"\"Be sold on something\" = estar convencido de algo (informal).","id":"c1_i_m_not_on_the_idea"},{"lv":"C1","ctx":"amigos","cat":"daily","es":"Lo dijo, pero no lo [decía en serio].","en":"He said it, but he didn't {} it.","b":[{"a":["mean"],"n":{"meant":"Después de \"didn't\" va la forma base.","feel":"Se dice \"didn't mean it\".","want":"\"Want\" es querer. \"No lo decía en serio\" es \"didn't mean it\".","say seriously":"Se entiende, pero lo natural es \"didn't mean it\"."}}],"h":"Verbo de \"significar\".","x":"\"I didn't mean it\" = no lo dije en serio / no fue mi intención.","id":"c1_he_said_it_but_he_di"},{"lv":"C1","ctx":"trabajo","cat":"idiom","es":"Se me [olvidó] por completo.","en":"It completely {} my mind.","b":[{"a":["slipped"],"n":{"forgot":"\"I completely forgot\" es válido, pero con \"my mind\" la expresión es \"it slipped my mind\".","escaped":"\"Escaped my mind\" se entiende, pero lo natural es \"slipped my mind\".","slip":"Es en pasado.","slept":"Casi: es \"slipped\" (de \"slip\", resbalar)."}}],"h":"Pasado de \"slip\" (resbalar).","x":"\"It slipped my mind\" = se me olvidó.","id":"c1_it_completely_my_min"},{"lv":"C1","ctx":"amigos","cat":"idiom","es":"Él [se salió con la suya].","en":"He {} away with it.","b":[{"a":["got"],"n":{"went":"\"Went away\" es se fue. Salirse con la suya es \"get away with it\".","came":"Se dice \"get away with it\".","get":"Es en pasado."}}],"h":"Pasado de \"get\".","x":"\"Get away with something\" = salirse con la suya.","id":"c1_he_away_with_it"},{"lv":"C1","ctx":"amigos","cat":"idiom","es":"No [des por sentado] que vendrán.","en":"Don't {} it for granted that they'll come.","b":[{"a":["take"],"n":{"give":"Traducción literal de \"dar\". Se dice \"take for granted\".","assume":"\"Assume\" es válido (sin \"for granted\"). Con \"for granted\" el verbo es \"take\".","have":"Se dice \"take for granted\"."}}],"h":"El verbo de \"take a photo\".","x":"\"Take (it) for granted\" = dar por sentado.","id":"c1_don_t_it_for_granted"},{"lv":"C1","ctx":"trabajo","cat":"idiom","es":"Tienes que [dar la cara].","en":"You have to {} the music.","b":[{"a":["face"],"n":{"give the face":"Traducción literal. Se dice \"face the music\".","show":"\"Show your face\" es aparecer. Asumir las consecuencias es \"face the music\".","give":"Traducción literal. Se dice \"face the music\"."}}],"h":"\"Cara\" en inglés, como verbo.","x":"\"Face the music\" = dar la cara, asumir las consecuencias.","id":"c1_you_have_to_the_musi"},{"lv":"C1","ctx":"trabajo","cat":"idiom","es":"Se nota que [le echó ganas].","en":"You can tell she {} it her all.","b":[{"a":["gave"],"n":{"threw":"Traducción literal de \"echar\". La expresión es \"give it your all\".","put":"Se dice \"give it your all\".","give":"Es en pasado."}}],"h":"Pasado de \"give\".","x":"\"Give it your all\" = darlo todo, echarle ganas.","id":"c1_you_can_tell_she_it"},{"lv":"C1","ctx":"trabajo","cat":"idiom","es":"El nuevo gerente [se ganó] a todos.","en":"The new manager {} everyone over.","b":[{"a":["won"],"n":{"earned":"\"Earned\" es ganarse algo con esfuerzo (earned respect). Con \"over\" la expresión es \"win someone over\".","gained":"Con \"over\" la expresión es \"win someone over\".","win":"Es en pasado.","winned":"\"Win\" es irregular: el pasado es \"won\"."}}],"h":"Pasado irregular de \"win\".","x":"\"Win someone over\" = ganarse a alguien.","id":"c1_the_new_manager_ever"},{"lv":"C1","ctx":"reunion","cat":"idiom","es":"Su comentario estuvo [fuera de lugar].","en":"His comment was {}.","b":[{"a":["out of line","uncalled for","inappropriate","out of place"],"n":{"out of order":"\"Out of order\" en EE. UU. es \"dañado\" (una máquina). En Reino Unido sí puede significar fuera de lugar.","out of site":"Se dice \"out of line\" o \"out of place\".","off place":"Se dice \"out of place\" o \"out of line\"."}}],"h":"\"Out of…\"","x":"\"Out of line\" / \"uncalled for\" = fuera de lugar.","id":"c1_his_comment_was"},{"lv":"C1","ctx":"trabajo","cat":"idiom","es":"Él siempre [va a lo seguro].","en":"He always plays it {}.","b":[{"a":["safe"],"n":{"sure":"Traducción literal. Se dice \"play it safe\".","secure":"Se dice \"play it safe\".","safely":"Aquí va el adjetivo: \"safe\"."}}],"h":"Adjetivo de 4 letras: \"seguro\".","x":"\"Play it safe\" = ir a lo seguro.","id":"c1_he_always_plays_it"},{"lv":"C1","ctx":"reunion","cat":"daily","es":"Eso [está por verse].","en":"That remains to be {}.","b":[{"a":["seen"],"n":{"saw":"Aquí va el participio: \"to be seen\".","see":"Aquí va el participio: \"to be seen\".","watched":"Se dice \"remains to be seen\"."}}],"h":"Participio de \"see\".","x":"\"It remains to be seen\" = está por verse.","id":"c1_that_remains_to_be"},{"lv":"C1","ctx":"trabajo","cat":"idiom","es":"Ella [se hizo cargo] de la situación.","en":"She {} charge of the situation.","b":[{"a":["took"],"n":{"made":"Se dice \"take charge\", no \"make charge\".","did":"Se dice \"take charge\".","take":"Es en pasado.","got":"Se dice \"took charge\"."}}],"h":"Pasado de \"take\".","x":"\"Take charge of\" = hacerse cargo de.","id":"c1_she_charge_of_the_si"},{"lv":"C1","ctx":"trabajo","cat":"idiom","es":"Estoy [entre la espada y la pared].","en":"I'm between a rock and a {} place.","b":[{"a":["hard"],"n":{"wall":"Traducción literal. La expresión inglesa es \"between a rock and a hard place\".","difficult":"Cerca, pero la expresión fija es \"a hard place\".","sword":"Traducción literal. La expresión inglesa usa una roca y un lugar duro."}}],"h":"Lo contrario de \"soft\".","x":"\"Between a rock and a hard place\" = entre la espada y la pared.","id":"c1_i_m_between_a_rock_a"},{"lv":"C1","ctx":"trabajo","cat":"idiom","es":"La pregunta me [tomó desprevenido].","en":"The question caught me off {}.","b":[{"a":["guard"],"n":{"guarded":"Casi: la palabra es \"guard\".","prepared":"Traducción literal. La expresión es \"caught me off guard\".","balance":"\"Off balance\" es desequilibrado. La expresión es \"off guard\"."}}],"h":"\"Guardia\".","x":"\"Catch someone off guard\" = tomar desprevenido.","id":"c1_the_question_caught"},{"lv":"C1","ctx":"amigos","cat":"idiom","es":"[No hay mal que por bien no venga].","en":"Every cloud has a silver {}.","b":[{"a":["lining"],"n":{"line":"¡Casi! La palabra es \"lining\" (forro).","side":"Traducción parcial. La expresión es \"a silver lining\".","linning":"Casi: lleva una sola \"n\" en el medio: lining."}}],"h":"Termina en -ing: el \"forro\" de la nube.","x":"\"Every cloud has a silver lining\" = no hay mal que por bien no venga.","id":"c1_every_cloud_has_a_si"}];

/* =================== v2.5: TRADUCE Y COMPLETA =================== */
export const TC_CTX = { amigos: 'Contexto: conversación informal entre amigos', trabajo: 'Contexto: en el trabajo', casa: 'Contexto: en casa, con la familia', tienda: 'Contexto: de compras', rest: 'Contexto: en un restaurante', viaje: 'Contexto: de viaje o en el transporte', estudio: 'Contexto: en clase o estudiando', salud: 'Contexto: salud, en la farmacia o el médico', tel: 'Contexto: una llamada o un mensaje', calle: 'Contexto: en la calle, un día cualquiera', cita: 'Contexto: haciendo planes con alguien', reunion: 'Contexto: reunión de trabajo', entrevista: 'Contexto: entrevista de trabajo', tramite: 'Contexto: haciendo un trámite' };
export const TC_CAT = { idiom: 'Expresión informal', phrasal: 'Phrasal verb', false: 'Falso amigo', prep: 'Preposición', error: 'Error típico', daily: 'Frase cotidiana', ai: 'Frase de la IA' };
export const TC_LV = { A2: 'Básico', B1: 'Intermedio', B2: 'Intermedio alto', C1: 'Avanzado' };
export const TC_PRAISE = ['¡Muy bien!', '¡Así se hace!', '¡Excelente!', '¡Genial!', '¡Perfecto!'];
export const TC_XP = 10, TC_XP_HINT = 5, TC_SESSION = 10;
export function ensure25() {
  if (!S.tc || typeof S.tc !== 'object') S.tc = {};
  const t = S.tc;
  if (!t.items || typeof t.items !== 'object') t.items = {};
  if (!Array.isArray(t.ai)) t.ai = [];
  ['sessions', 'xp', 'ok', 'first'].forEach(k => { t[k] = +t[k] || 0; });
  if (S.settings.tcVoice === undefined) S.settings.tcVoice = true;
}

export const tcNorm = s => normText(s).join(' ');
export const tcAll = () => {
  const map = new Map();
  TC_BANK.forEach(x => x && x.id && map.set(x.id, x));
  (S.tc.ai || []).forEach(x => x && x.id && map.set(x.id, x));
  TUKI_OFFLINE_TC.forEach(x => x && x.id && map.set(x.id, x));
  return Array.from(map.values());
};
export const tcById = id => tcAll().find(x => x.id === id) || null;
export const tcLevel = () => TC_LV[S.settings.tcLevel] ? S.settings.tcLevel : chatLevel();
export const tcCtx = it => it.ctxT || TC_CTX[it.ctx] || 'Contexto: conversación cotidiana';
export const tcRec = id => S.tc.items[id] || null;
export const tcMastered = id => { const r = tcRec(id); return !!(r && r.st >= 2); };
export const tcMasteredCount = lv => tcAll().filter(x => (!lv || x.lv === lv) && tcMastered(x.id)).length;
export const tcSpans = it => [...it.es.matchAll(/\[([^\]]+)\]/g)].map(m => m[1]);
export const tcEsPlain = it => it.es.replace(/\[([^\]]+)\]/g, '$1');
export const tcEsHTML = it => esc(it.es).replace(/\[([^\]]+)\]/g, '<mark class="tc-hl">$1</mark>');
export const tcFull = (it, vals) => { let i = 0; return it.en.replace(/\{\}/g, () => { const v = vals && vals[i] ? vals[i] : it.b[i].a[0]; i++; return v; }); };
export const tcFirst = it => it.b.map(b => b.a[0]);
/* Evaluación local: aceptada > near > error de ortografía > desconocida */
export function tcEval(it, i, raw, extra) {
  const v = tcNorm(raw || ''); if (!v) return { k: 'empty' };
  const b = it.b[i];
  if (b.a.some(a => tcNorm(a) === v) || (extra && extra.includes(v))) return { k: 'ok' };
  for (const key in (b.n || {})) if (tcNorm(key) === v) return { k: 'near', msg: b.n[key] };
  for (const a of b.a) {
    const t = tcNorm(a), L0 = t.replace(/\s/g, '').length; if (L0 < 4) continue;
    const d = lev(v, t), max = L0 >= 6 ? 2 : 1;
    if (d >= 1 && d <= max && (L0 >= 6 || v[0] === t[0])) return { k: 'typo', msg: 'Casi, revisa la ortografía. ✍️' };
  }
  return { k: 'unknown' };
}
/* Selección: nuevas y falladas primero; las dominadas salen poco */
export function tcPick(n, lv, exclude) {
  const ex = new Set(exclude || []), order = ['A2', 'B1', 'B2', 'C1'], li = Math.max(0, order.indexOf(lv));
  const weight = it => { const r = tcRec(it.id); let w = !r ? 3 : r.st >= 2 ? 0.15 : r.miss > r.first ? 4 : 2; if (r && Date.now() - r.t < 10 * 60e3) w *= 0.3; return w; };
  const out = [], take = pool => { pool = pool.filter(x => !ex.has(x.id)); while (out.length < n && pool.length) { const ws = pool.map(weight), tot = ws.reduce((a, b) => a + b, 0); let r = Math.random() * tot, k = 0; while (k < pool.length - 1 && (r -= ws[k]) > 0) k++; const it = pool.splice(k, 1)[0]; out.push(it); ex.add(it.id); } };
  take(tcAll().filter(x => x.lv === order[li]));
  [li - 1, li + 1, li - 2, li + 2, li + 3, li - 3].forEach(j => { if (order[j]) take(tcAll().filter(x => x.lv === order[j])); });
  return out;
}
export const tcEx = (it, again) => ({ kind: 'tc', item: it, l: LESSONS[0], again: !!again });
export function startTC(opts = {}) {
  // (fix tc-progress-lock 2026-11-06: el bloqueo de 3 lecciones se saltaba
  // desde Inicio porque la tarjeta de Aprender llamaba a tcSetup sin
  // comprobar isFeatureUnlocked('tc'). El candado vive aqui, punto unico
  // de entrada, para cubrir Inicio, Practica, IA, "Otra ronda" y TUKI.)
  if (!isFeatureUnlocked('tc')) return showLockedFeatureModal('tc');
  const lv = opts.lv || tcLevel();
  let items = opts.items || (opts.ids ? opts.ids.map(tcById).filter(Boolean) : tcPick(opts.n || TC_SESSION, lv));
  if (!items.length) return toast('No hay frases disponibles.');
  closeWordPop && closeWordPop();
  startLesson(null, 'tc', items.map(it => tcEx(it)), 'Traduce y completa');
  if (L) L.tc = { xp: 0, ok: 0, first: 0, hints: 0, rev: 0 };
}
/* Tarjetas: el error va al mazo (sin duplicados) con significado y frase de ejemplo */
export function tcAddCard(it) {
  const en = tcFirst(it).join(' … '), es = tcSpans(it).join(' … '), kind = /\s/.test(en) ? 'frase' : 'palabra', pre = kind === 'frase' ? 's:' : 'w:', key = pre + en.toLowerCase();
  if (S.deck[key] || S.deck[pre + en]) return false;
  addToDeck([{ key, en, es, kind, lesson: null }]);
  Object.assign(S.deck[key], { ex: tcFull(it), exEs: tcEsPlain(it), src: 'tc' }); save(); return true;
}
export function tcRecord(it, o) {
  const r = S.tc.items[it.id] || (S.tc.items[it.id] = { n: 0, ok: 0, first: 0, miss: 0, hint: 0, rev: 0, st: 0, t: 0 });
  r.n++; r.t = Date.now(); r.miss += o.miss; if (o.hint) r.hint++;
  if (o.rev) { r.rev++; r.st = 0; } else { r.ok++; S.tc.ok++; if (o.first) { r.first++; r.st++; S.tc.first++; } else r.st = 0; }
  if (r.miss + r.rev >= 2 && (o.miss || o.rev)) flagHard([{ word: tcFirst(it).join(' '), note_es: 'Traduce y completa: ' + tcSpans(it).join(' … ') }], 'traduce');
  save();
}
/* IA: explicación de respuestas desconocidas y frases nuevas */
export const TC_AI_CACHE = new Map();
export async function tcAskAI(it, i, raw) {
  const k = it.id + '|' + i + '|' + tcNorm(raw); if (TC_AI_CACHE.has(k)) return TC_AI_CACHE.get(k);
  const lv = it.lv || tcLevel(), sp = tcSpans(it);
  let bi = 0; const shown = it.en.replace(/\{\}/g, () => (bi++ === i ? '____' : it.b[bi - 1].a[0]));
  const sys = `You are Tuki, a kind English teacher for a Spanish-speaking learner from Colombia (CEFR ${lv}, ${TC_LV[lv] || ''}) who struggles with fast English. The learner is doing a "translate and complete" exercise: a Spanish sentence with highlighted word(s) and an English sentence with blanks. Judge ONLY the learner's answer for the requested blank.
Return ONLY JSON: {"verdict":"correct"|"valid_not_target"|"wrong","message":"..."}
- "correct": natural English that fits the sentence and means the same as the highlighted Spanish (an acceptable alternative).
- "valid_not_target": real, correct English that could fit, but it changes the meaning or register, or it is not the expression being practiced.
- "wrong": grammar or meaning error, or a typical Spanish-speaker mistake (false friend, wrong preposition, literal translation).
"message": simple Latin American Spanish with "tú", max 25 words, friendly. Say briefly WHY and nudge toward the target WITHOUT writing the target answer. For "correct", just praise briefly.`;
  const prompt = `Spanish: ${tcEsPlain(it)}\nHighlighted Spanish for this blank: «${sp[i] || sp[0] || ''}»\nEnglish: ${shown}\nTarget answer(s): ${it.b[i].a.join(' / ')}\nLearner's answer: "${String(raw).trim()}"`;
  const d = await aiJSON(sys, prompt, 1200);
  const verdict = ['correct', 'valid_not_target', 'wrong'].includes(d.verdict) ? d.verdict : 'wrong';
  const res = { verdict, message: String(d.message || '').trim().slice(0, 300) || (verdict === 'correct' ? '¡Esa también sirve!' : 'Esa no es la respuesta que buscamos.') };
  TC_AI_CACHE.set(k, res); return res;
}
export function tcValidate(x, lv) {
  if (!x || typeof x !== 'object') return null;
  const es = String(x.es || '').trim().slice(0, 220), en = String(x.en || '').trim().slice(0, 220), blanks = Array.isArray(x.blanks) ? x.blanks : null;
  const nb = (en.match(/\{\}/g) || []).length, ns = (es.match(/\[[^\]]+\]/g) || []).length;
  if (!es || !en || !blanks || nb < 1 || nb > 3 || blanks.length !== nb || ns !== nb) return null;
  const b = [];
  for (const bl of blanks) {
    if (!bl || typeof bl !== 'object') return null;
    const a = (Array.isArray(bl.answers) ? bl.answers : []).map(s => String(s || '').trim()).filter(s => s && s.length <= 40 && tcNorm(s));
    if (!a.length) return null;
    const na = new Set(a.map(tcNorm)), n = {};
    if (bl.near && typeof bl.near === 'object' && !Array.isArray(bl.near)) for (const k in bl.near) { const kk = String(k).trim(), m = String(bl.near[k] || '').trim(); if (kk && m && kk.length <= 40 && !na.has(tcNorm(kk))) n[kk] = m.slice(0, 260); }
    b.push({ a, n });
  }
  let ctx = String(x.context || '').trim().slice(0, 90);
  if (!ctx || /serie|pel[ií]cula|\bshow\b|movie|netflix|temporada|episodio|\bfilm|libro|novela/i.test(ctx)) ctx = 'Contexto: conversación cotidiana';
  if (!/^contexto:/i.test(ctx)) ctx = 'Contexto: ' + ctx;
  return { id: 'ai_' + uid(), lv, ai: 1, cat: TC_CAT[x.category] ? x.category : 'ai', es, en, b, h: String(x.hint || 'Piensa en la palabra resaltada en verde.').slice(0, 200), x: String(x.explain || '').slice(0, 400), ctxT: ctx };
}

export async function tcStartAI(btn) {
  const lv = tcLevel();
  if (!currentProvider()) { toast('Para frases con IA agrega una clave gratuita de Gemini en Ajustes. Uso el banco de frases.', 3500); return startTC({ lv }); }
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Creando frases…'; }
  try { const items = await tcGenerate(lv, 6); startTC({ lv, items: items.concat(tcPick(TC_SESSION - items.length, lv, items.map(x => x.id))) }); toast('✨ ' + items.length + ' frases nuevas de la IA' + (TC_LAST_PERSONALIZED.covered.length ? ' · con tus palabras difíciles (' + TC_LAST_PERSONALIZED.covered.join(', ') + ')' : ''), 2500); }
  catch (e) { toast('⚠️ No se pudieron crear frases con IA (' + errES(e) + '). Uso el banco de frases.', 4000); startTC({ lv }); }
  finally { if (btn && document.body.contains(btn)) { btn.disabled = false; btn.textContent = '✨ Más frases con IA'; } }
}

/* ---- Render del ejercicio ---- */
export function tcSay(msg) { if (!S.settings.tcVoice || !msg) return; try { speak(msg.replace(/[✍️💡🤔✨👀]/gu, ''), false, null, 'es'); } catch (e) {} }
export function tcSize(inp) {
  const m = inp._m; if (!m) return;
  m.textContent = inp.value || inp.placeholder || '';
  const cs = getComputedStyle(inp); m.style.font = cs.font; m.style.letterSpacing = cs.letterSpacing;
  const ok = inp.parentNode.classList.contains('ok') || inp.parentNode.classList.contains('rev');
  inp.style.width = (ok ? Math.ceil(m.getBoundingClientRect().width) + 1 : Math.max(52, Math.ceil(m.getBoundingClientRect().width) + 6)) + 'px';
}
RENDER.tc = (ex, body) => {
  const it = ex.item; ex.st = ex.st || { ok: it.b.map(() => false), hint: 0, miss: 0, seen: {}, extra: it.b.map(() => []), done: false };
  let bi = 0;
  const enHTML = esc(it.en).replace(/\{\}/g, () => { const i = bi++; return `<span class="tc-slot" data-i="${i}"><span class="tc-check" aria-hidden="true">✓</span><input class="tc-in" data-i="${i}" type="text" inputmode="text" enterkeyhint="${i < it.b.length - 1 ? 'next' : 'done'}" autocapitalize="off" autocorrect="off" autocomplete="off" spellcheck="false" aria-label="Espacio ${i + 1}: ${esc(tcSpans(it)[i] || '')}"></span>`; });
  body.innerHTML = `<div class="tc-top"><span class="pill">${esc(TC_CAT[it.cat] || 'Frase')} · ${esc(TC_LV[it.lv] || '')}${it.ai ? ' · ✨ IA' : ''}</span><button class="tc-mute" id="tcMute" aria-pressed="${!S.settings.tcVoice}">${S.settings.tcVoice ? '🔈 Voz de Tuki' : '🔇 Voz silenciada'}</button></div>
    <div class="tc-card" id="tcBox">
      <div class="tc-head"><button class="tc-back" id="tcBack" aria-label="Salir"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button><span class="tc-kicker">Traduce la frase</span></div>
      <div class="tc-es">${tcEsHTML(it)}</div>
      <div class="tc-en" id="tcEn">${enHTML}<span class="tc-measure" aria-hidden="true"></span></div>
      <div id="tcBubWrap" aria-live="polite"></div>
      <div id="tcHint"></div>
      <div id="tcAfter"></div>
      <div class="tc-ctx">${esc(tcCtx(it))}</div>
      <div class="tc-mascot" aria-hidden="true">${MASCOT}<i class="s1">✨</i><i class="s2">✨</i><i class="s3">✨</i></div>
    </div>
    <div class="tc-tools" id="tcTools"><button class="chip" id="tcHintBtn">💡 ¿Me das una pista?</button><button class="chip" id="tcRevBtn">👀 Ver respuesta</button></div>`;
  const ins = $$('.tc-in', body), meas = $('.tc-measure', body);
  $('#tcBack').onclick = () => $('#xLesson').click();
  $('#tcMute').onclick = e => { S.settings.tcVoice = !S.settings.tcVoice; save(); const b = e.currentTarget; b.textContent = S.settings.tcVoice ? '🔈 Voz de Tuki' : '🔇 Voz silenciada'; b.setAttribute('aria-pressed', !S.settings.tcVoice); if (!S.settings.tcVoice) speechSynthesis && speechSynthesis.cancel(); };
  ins.forEach(inp => {
    inp._m = meas; tcSize(inp);
    inp.addEventListener('input', () => {
      tcSize(inp); const i = +inp.dataset.i;
      const bub = $('#tcBubWrap .tc-bub'); if (bub && +bub.dataset.i === i) tcBubble(null);
      inp.parentNode.classList.remove('bad', 'wait'); clearTimeout(ex.st.tm);
      ex.st.tm = setTimeout(() => { if (L && L.cur === ex && !ex.st.done && tcEval(it, i, inp.value, ex.st.extra[i]).k === 'ok') { tcMarkOk(ex, i); if (ex.st.ok.every(Boolean)) tcSuccess(ex); } }, 900);
    });
    inp.addEventListener('keydown', e => { if (e.key !== 'Enter') return; e.preventDefault(); if (ex.st.done) { const b = $('#primaryBtn'); b && b.click(); return; } const next = ins.find((x, j) => !ex.st.ok[j] && !x.value.trim() && x !== inp); next ? next.focus() : tcCheck(ex, true); });
    inp.addEventListener('focus', () => setTimeout(() => { const t = $('#tcBubWrap .tc-bub') || inp; t.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 300));
  });
  $('#tcHintBtn').onclick = () => tcHint(ex);
  $('#tcRevBtn').onclick = () => tcReveal(ex);
  tcFoot(ex);
  setTimeout(() => { const f = ins.find(x => !x.readOnly); if (f && matchMedia('(pointer:fine)').matches) f.focus({ preventScroll: true }); }, 60);
};
export function tcFoot(ex) {
  setFoot(`<span class="small muted">${ex.st.hint ? '💡 Con pista: +' + TC_XP_HINT + ' XP' : '+' + TC_XP + ' XP'}</span><button class="btn primary" id="primaryBtn">Comprobar</button>`);
  $('#primaryBtn').onclick = () => tcCheck(ex, true);
}
export function tcBubble(i, msg, cls = '') {
  const w = $('#tcBubWrap'); if (!w) return; w.innerHTML = '';
  if (i == null || !msg) return;
  const slot = $(`#tcEn .tc-slot[data-i="${i}"]`), en = $('#tcEn');
  const d = document.createElement('div'); d.className = 'tc-bub ' + cls; d.dataset.i = i; d.setAttribute('role', 'status');
  d.innerHTML = `${cls === 'think' ? '' : '<button class="tc-bsay" aria-label="Escuchar">🔊</button>'}<span class="tc-msg">${esc(msg)}</span>`;
  if (slot && en) { const sx = slot.getBoundingClientRect(), ex0 = en.getBoundingClientRect(); d.style.setProperty('--ax', Math.max(18, Math.min(ex0.width - 18, sx.left - ex0.left + sx.width / 2)) + 'px'); }
  w.appendChild(d);
  const sb = $('.tc-bsay', d); if (sb) sb.onclick = () => { const v = S.settings.tcVoice; S.settings.tcVoice = true; tcSay(msg); S.settings.tcVoice = v; };
  if (cls !== 'think') tcSay(msg);
  requestAnimationFrame(() => d.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
}
/* Reacción de Tuki en Traduce y completa: celebra el acierto y consuela el fallo.
   La mascota (.tc-mascot) está visible en la tarjeta durante toda la ronda. */
export function tcMascotReact(ok) {
  const m = $('.tc-mascot');
  if (!m) return;
  if (ok) tukiMood('excited', { el: m, particles: 'happy' });
  else tukiMood('sad', { el: m });
}
export function tcMarkOk(ex, i) {
  ex.st.ok[i] = true; const inp = $(`#tcEn .tc-in[data-i="${i}"]`); if (!inp) return;
  const v = tcNorm(inp.value), acc = ex.item.b[i].a.find(a => tcNorm(a) === v); inp.value = acc || inp.value.trim().replace(/[.,!?;:¡¿"]+/g, '');
  inp.readOnly = true; inp.setAttribute('tabindex', '-1'); inp.parentNode.classList.remove('bad', 'wait'); inp.parentNode.classList.add('ok'); tcSize(inp);
  if (!ex.st.done) tcMascotReact(true);
}
export async function tcCheck(ex, manual) {
  if (ex.st.done || ex.st.busy) return;
  const it = ex.item, ins = $$('#tcEn .tc-in'); clearTimeout(ex.st.tm);
  let fail = null;
  for (let i = 0; i < it.b.length; i++) {
    if (ex.st.ok[i]) continue;
    const r = tcEval(it, i, ins[i].value, ex.st.extra[i]);
    if (r.k === 'ok') { tcMarkOk(ex, i); continue; }
    if (!fail) fail = { i, r };
  }
  if (!fail) return tcSuccess(ex);
  const { i, r } = fail, inp = ins[i], val = inp.value.trim();
  if (r.k === 'empty') { if (manual) { inp.focus(); tcBubble(i, it.b.length > 1 ? 'Completa todos los espacios azules. ✍️' : 'Escribe tu respuesta en el espacio azul. ✍️', 'typo'); } return; }
  const key = i + '|' + tcNorm(val), fresh = !ex.st.seen[key]; ex.st.seen[key] = 1;
  if (fresh && r.k !== 'typo') { ex.st.miss++; if (L) L.mistakes++; beep('bad'); }
  inp.parentNode.classList.add('bad');
  tcMascotReact(false);
  ex.st.lastWrong = { val, near: r.k === 'near' ? r.msg : '' };
  tcMaybeOfferHint(ex);
  if (r.k === 'near' || r.k === 'typo') return tcBubble(i, r.msg, r.k === 'typo' ? 'typo' : '');
  if (currentProvider()) {
    ex.st.busy = true; inp.parentNode.classList.replace('bad', 'wait'); tcBubble(i, 'Tuki está pensando… 🤔', 'think');
    try {
      const a = await tcAskAI(it, i, val);
      if (!L || L.cur !== ex) return;
      if (inp.value.trim() !== val) { tcBubble(null); return; }
      if (a.verdict === 'correct') { if (fresh) { ex.st.miss = Math.max(0, ex.st.miss - 1); if (L) L.mistakes = Math.max(0, L.mistakes - 1); } ex.st.extra[i].push(tcNorm(val)); ex.st.aiOk = a.message; tcBubble(null); tcMarkOk(ex, i); ex.st.busy = false; return tcCheck(ex, manual); }
      inp.parentNode.classList.replace('wait', 'bad');
      tcBubble(i, a.message);
    } catch (e) {
      if (L && L.cur === ex) { inp.parentNode.classList.replace('wait', 'bad'); tcBubble(i, 'Esa no es la respuesta que buscamos. 💡 Pista: ' + it.h); }
    } finally { ex.st.busy = false; }
    return;
  }
  tcBubble(i, 'Mmm, esa no es la que buscamos. 💡 Pista: ' + it.h);
}
export function tcHint(ex) {
  if (ex.st.done) return;
  const it = ex.item; ex.st.hint = Math.min(2, ex.st.hint + 1);
  const letters = it.b.map((b, i) => ex.st.ok[i] ? null : b.a[0]).map((a, i) => a ? `<b>${esc(a.split(' ').map(w => w.slice(0, w.length > 5 ? 2 : 1) + '…').join(' '))}</b>` : null).filter(Boolean);
  $('#tcHint').innerHTML = `<div class="tc-hint">💡 ${esc(it.h)}${ex.st.hint >= 2 ? `<div style="margin-top:6px">🔤 Empieza por: ${letters.join(' · ')}</div>` : ''}</div>`;
  if (ex.st.hint >= 2) { $$('#tcEn .tc-in').forEach((inp, i) => { if (!ex.st.ok[i]) { inp.placeholder = it.b[i].a[0].charAt(0) + '…'; tcSize(inp); } }); $('#tcHintBtn').disabled = true; }
  else $('#tcHintBtn').textContent = '💡 Otra pista (primera letra)';
  tcFoot(ex); $('#tcHint').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
/* ---- P6 (v2.23.0): "💡 Otra pista" tras fallar 2 veces el mismo ítem ----
   Fallos acumulados del ítem (intentos anteriores en S.tc.items + fallos
   frescos de este intento en ex.st.miss). El botón aparece solo entonces,
   en la fila de herramientas que ya existe, y muestra una pista con el
   error concreto del usuario (su última respuesta entrecomillada) más las
   primeras letras y la pista del ítem. 0 llamadas nuevas de IA: no usa
   tcAskAI, solo datos que ya están en pantalla. En voz, Tuki la dice. */
export function tcFailsTotal(it, ex) {
  const prior = (S.tc.items[it.id] && S.tc.items[it.id].miss) || 0;
  return prior + (ex && ex.st ? ex.st.miss || 0 : 0);
}
export function tcMaybeOfferHint(ex) {
  const tools = $('#tcTools'); if (!tools || $('#tcExtraHintBtn')) return;
  if (ex.st.done || tcFailsTotal(ex.item, ex) < 2) return;
  tools.insertAdjacentHTML('beforeend', '<button class="chip" id="tcExtraHintBtn">💡 Otra pista</button>');
  $('#tcExtraHintBtn').onclick = () => tcExtraHint(ex);
}
export function tcExtraHint(ex) {
  if (!ex || ex.st.done) return '';
  const it = ex.item, last = ex.st.lastWrong || {};
  const targets = it.b.map((b, i) => ex.st.ok[i] ? null : b.a[0]).filter(Boolean);
  const letters = targets.map(a => a.split(' ').map(w => w.slice(0, w.length > 5 ? 2 : 1) + '…').join(' '));
  const wrong = last.val ? `Dijiste «${last.val}»` : 'Tu última respuesta no era la que buscamos';
  const speak = `${wrong}. La respuesta empieza por ${letters.join(' y ')}.`;
  $('#tcHint').innerHTML = `<div class="tc-hint">💡 ${esc(wrong)}. La respuesta empieza por: <b>${esc(letters.join(' · '))}</b><div class="small muted" style="margin-top:6px">${esc(it.h)}</div></div>`;
  const b = $('#tcExtraHintBtn'); if (b) b.disabled = true;
  $('#tcHint').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  return speak;
}
export function tcAfterHTML(it, praise, sub) {
  const full = tcFull(it);
  return `<div class="tc-after">${praise ? `<div class="tc-praise">${esc(praise)}</div>` : ''}${sub ? `<div class="small muted">${esc(sub)}</div>` : ''}<div class="exp">${esc(it.x || '')}</div>
    <div class="row cmp" style="gap:6px;flex-wrap:wrap"><button class="mini" id="tcSay" title="Escuchar">🔊</button><button class="mini" id="tcSlow" title="Lento">🐢</button>${canSpeak() ? '<button class="mini" id="tcMic" title="Dilo en voz alta">🎤</button>' : ''}</div><div id="tcMicRes" class="small"></div></div>`;
}
export function tcBindAfter(it) {
  const full = tcFull(it);
  $('#tcSay').onclick = () => speak(full); $('#tcSlow').onclick = () => speak(full, true);
  const m = $('#tcMic'); if (m) m.onclick = () => doMic(m, (alts, url, az) => { const r = az || scoreSpeech(full, alts); recordSpeech('tc', r); $('#tcMicRes').innerHTML = `<div class="target" style="font-size:17px">${wordsHTML(full, r.words)}</div><b>${r.pct}%</b> · escuché «${esc(r.heard || '')}»`; m.innerHTML = '🎤'; }, full);
}
export function tcTally(ex, xp, o) {
  const it = ex.item; tcRecord(it, o);
  if (o.miss || o.rev) tcAddCard(it);
  if (L && L.tc) { L.tc.xp += xp; if (!o.rev) L.tc.ok++; if (o.first) L.tc.first++; if (o.hint) L.tc.hints++; if (o.rev) L.tc.rev++; }
  // (fix tc-progress-lock 2026-11-06: el XP se acreditaba solo al terminar
  // la ronda (tcFinish), asi que el encabezado no se movia con el "+10 XP"
  // de cada acierto y al salir a mitad de ronda ese XP se perdia del total
  // aunque S.tc.xp ya lo contaba. Ahora se acredita aqui, en cada acierto;
  // tcFinish solo suma el bonus de +5 por completar la ronda.)
  if (xp) { S.tc.xp += xp; addXP(xp); }
  save();
}
export function tcSuccess(ex) {
  if (ex.st.done) return; ex.st.done = true; clearTimeout(ex.st.tm);
  const it = ex.item, hint = ex.st.hint > 0, xp = hint ? TC_XP_HINT : TC_XP, first = !hint && ex.st.miss === 0;
  $$('#tcEn .tc-in').forEach((inp, i) => tcMarkOk(ex, i)); tcBubble(null);
  const praise = pick(TC_PRAISE), box = $('#tcBox'); box.classList.add('win');
  tcMascotReact(true);
  $('#tcAfter').innerHTML = tcAfterHTML(it, praise, ex.st.aiOk ? '🤖 ' + ex.st.aiOk : ''); tcBindAfter(it);
  $('#tcTools').innerHTML = ''; $('#tcHint').innerHTML = '';
  L.done++; $('.pbar i').style.width = Math.round(L.done / L.total * 100) + '%';
  tcTally(ex, xp, { miss: ex.st.miss, hint, first, rev: false });
  beep('ok');
  setFoot(`<div class="fb"><h3>✅ ${esc(praise)}</h3><div class="exp">+${xp} XP${hint ? ' (usaste pista)' : first ? ' · ¡a la primera!' : ''}</div></div><button class="btn primary" id="primaryBtn">Continuar</button>`, 'ok');
  $('#primaryBtn').onclick = nextEx;
  if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  $('#primaryBtn').focus({ preventScroll: true });
  tcSay(praise);
  setTimeout(() => box.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 50);
}
export function tcReveal(ex) {
  if (ex.st.done) return; ex.st.done = true; clearTimeout(ex.st.tm);
  const it = ex.item;
  $$('#tcEn .tc-in').forEach((inp, i) => { if (!ex.st.ok[i]) { inp.value = it.b[i].a[0]; inp.readOnly = true; inp.parentNode.classList.remove('bad', 'wait'); inp.parentNode.classList.add('rev'); tcSize(inp); } });
  tcBubble(null); $('#tcTools').innerHTML = ''; $('#tcHint').innerHTML = '';
  $('#tcAfter').innerHTML = tcAfterHTML(it, '', 'Respuesta: ' + tcFirst(it).join(' … ')); tcBindAfter(it);
  L.mistakes++;
  if (!ex.again) L.queue.push(tcEx(it, true)); else { L.done++; $('.pbar i').style.width = Math.round(L.done / L.total * 100) + '%'; }
  tcTally(ex, 0, { miss: Math.max(1, ex.st.miss), hint: ex.st.hint > 0, first: false, rev: true });
  setFoot(`<div class="fb"><h3>👀 Así se dice</h3><div class="exp">Sin XP esta vez${ex.again ? '' : ' · la verás otra vez en esta sesión'}. 🃏 Guardada en tus tarjetas.</div></div><button class="btn primary" id="primaryBtn">Continuar</button>`, 'bad');
  $('#primaryBtn').onclick = nextEx; $('#primaryBtn').focus({ preventScroll: true });
}
export function tcFinish() {
  const t = L.tc || { xp: 0, ok: 0, first: 0 }, secs = Math.round((Date.now() - L.start) / 1000), n = L.total;
  S.tc.sessions++; S.sessions++; todayRec().sec = (todayRec().sec || 0) + secs;
  refreshHearts(); let extra = ''; if (S.hearts < MAX_HEARTS) { S.hearts++; extra = '<p class="muted">❤️ ¡Recuperaste una vida por practicar!</p>'; }
  const xp = t.xp + 5, up = addXP(5); beep('done'); save();
  const goal = S.settings.goal, today = todayRec().xp, lv = tcLevel();
  $('#fullInner').innerHTML = `<div class="complete"><div class="mascot tuki-celebrate" id="tcFinishMascot" style="width:120px;height:120px;cursor:pointer" title="¡Toca al Profe Tuki para celebrar!">${MASCOT}</div>
    <h1>¡Ronda completada!</h1><div class="muted">Traduce y completa · ${esc(TC_LV[lv])}</div>
    <div class="scards">
      <div class="scard scard-celebrate" style="border-color:var(--o);animation-delay:.1s"><div class="t" style="background:var(--o)">XP</div><div class="v" style="color:var(--o)" data-countup="${xp}" data-countup-prefix="+">+${xp}</div></div>
      <div class="scard scard-celebrate" style="border-color:var(--g);animation-delay:.18s"><div class="t" style="background:var(--g)">A la primera</div><div class="v" style="color:var(--g-d)">${t.first}/${n}</div></div>
      <div class="scard scard-celebrate" style="border-color:var(--b);animation-delay:.26s"><div class="t" style="background:var(--b)">Dominadas</div><div class="v" style="color:var(--b-d)">${tcMasteredCount()}</div></div>
      <div class="scard scard-celebrate" style="border-color:#8b5cf6;animation-delay:.34s"><div class="t" style="background:#8b5cf6">Tiempo</div><div class="v" style="color:#8b5cf6">${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}</div></div>
    </div>
    ${up ? `<p>🔥 ¡Racha de <b>${S.streak}</b> ${S.streak === 1 ? 'día' : 'días'}!</p>` : ''}
    <p>Meta diaria: <b>${Math.min(today, goal)}/${goal} XP</b> ${today >= goal ? '🎉 ¡Cumplida!' : ''}</p>${extra}${t.rev || L.mistakes ? '<p class="muted small">🃏 Las frases que fallaste quedaron en tus tarjetas de repaso.</p>' : ''}
    <button class="btn primary" id="primaryBtn" style="min-width:220px;margin-top:10px">Continuar</button><button class="btn blue" id="tcAgain" style="min-width:220px">🔁 Otra ronda</button></div>`;
  $('#primaryBtn').onclick = closeLesson; $('#tcAgain').onclick = () => { closeLesson(); startTC({ lv }); };
  countUpAll($('#fullInner'));
  const tfm = $('#tcFinishMascot');
  if (tfm) { tfm.onclick = () => { tukiMood('celebration', { el: tfm, particles: 'coin' }); confetti(); }; makeMascotClickable(tfm, '¡Toca al Profe Tuki para celebrar!'); }
  confetti(); checkBadges();
}

export function tcSetup() {
  // (fix tc-progress-lock 2026-11-06: no abrir el selector de nivel si la
  // practica sigue bloqueada; el candado tambien esta en startTC.)
  if (!isFeatureUnlocked('tc')) return showLockedFeatureModal('tc');
  const lv0 = tcLevel();
  modal(`<h2 style="margin-top:0">✍️ Traduce y completa</h2><p class="muted" style="margin-top:0">Lee la frase en español y escribe en inglés la parte en <b class="tc-hl">verde</b>. Tuki te explica en español por qué una respuesta no es la mejor.</p>
    <div class="small muted" style="font-weight:800">Nivel</div><div class="chips tc-lvchips" id="tcLv">${Object.keys(TC_LV).map(k => `<button class="chip ${k === lv0 ? 'active' : ''}" data-lv="${k}">${esc(TC_LV[k])} <span class="small">${tcMasteredCount(k)}/${tcAll().filter(x => x.lv === k).length}</span></button>`).join('')}</div>
    <div class="small muted">Números = frases dominadas / total. Las dominadas salen menos.</div>
    <div class="row" style="margin-top:14px;gap:8px;flex-wrap:wrap"><button class="btn primary block" id="tcGo">Empezar (${TC_SESSION} frases)</button><button class="btn ghost block" id="tcAI">✨ Más frases con IA</button></div>
    ${currentProvider() ? '' : '<div class="small muted" style="margin-top:8px">Para frases nuevas con IA y explicaciones de cualquier respuesta, agrega una clave gratuita de Gemini en Ajustes.</div>'}`,
    (el, close) => {
      $$('[data-lv]', el).forEach(b => b.onclick = () => { S.settings.tcLevel = b.dataset.lv; save(); $$('[data-lv]', el).forEach(x => x.classList.toggle('active', x === b)); });
      $('#tcGo', el).onclick = () => { close(); startTC({ lv: tcLevel() }); };
      $('#tcAI', el).onclick = async e => { const b = e.currentTarget; await tcStartAI(b); close(); };
    });
}
export function tcEntryHTML(id) {
  const lv = tcLevel(), tot = tcAll().length, m = tcMasteredCount();
  return `<button class="card tc-entry" id="${id}"><div class="row between" style="align-items:flex-start"><div><h3 style="margin:0">✍️ Traduce y completa</h3><div class="small muted">Frases reales, falsos amigos y phrasal verbs · ${esc(TC_LV[lv])}</div></div><span class="pill">${m}/${tot} dominadas</span></div>
    <div class="tc-prev"><div>¿Qué, estás <span class="tc-hl">loco</span>?</div><div>What, are you <span class="tc-fake"></span>?</div></div>
    <div class="small" style="margin-top:6px;font-weight:800;color:var(--b-d)">Empezar →</div></button>`;
}

export function ensure251() {
  ensureSP();
  if (!S.fix251) {
    S.summaries = decodeDeep(S.summaries || []); S.interviews = decodeDeep(S.interviews || []); S.convoItems = decodeDeep(S.convoItems || []);
    Object.values(S.deck || {}).forEach(c => ['en', 'es', 'ex', 'exEs'].forEach(k => { if (typeof c[k] === 'string') c[k] = decodeEnt(c[k]); }));
    Object.values(S.hard || {}).forEach(h => { if (typeof h.note === 'string') h.note = decodeEnt(h.note); });
    if (S.tc && Array.isArray(S.tc.ai)) S.tc.ai = decodeDeep(S.tc.ai);
    S.fix251 = 1;
  }
}

export const V = { gen: 0, sup: 0, paused: false, timer: null, fails: 0, state: 'idle' };
export const tcCanVoice = () => !!(HAS_SR || azureReady());
export function ensure26() { if (S.settings.tcInput !== 'voice' && S.settings.tcInput !== 'text') S.settings.tcInput = window.__tcInputDefault || (tcCanVoice() ? 'voice' : 'text'); }
// (fix blank-main 2026-11-06: NO llamar a ensure26() en top-level aqui. ui.js se
// evalua antes de que main.js ejecute load(), asi que S todavia es undefined
// y S.settings lanzaba TypeError, matando el modulo entero y dejando #view
// en blanco. ensure26() ya corre en cada render desde el wrapper de main.js.)

export const tcVoiceOn = () => !!(L && L.mode === 'tc' && L.cur && L.cur.kind === 'tc' && S.settings.tcInput === 'voice' && tcCanVoice());
export const tcOk = (g, ex) => g === V.gen && L && L.cur === ex && !V.paused && tcVoiceOn() && document.body.contains($('#tcBox'));
export const TC_FILLERS = new Set(['um', 'umm', 'uh', 'uhm', 'uhh', 'er', 'erm', 'ah', 'eh', 'mm', 'mmm', 'hmm', 'so', 'entonces', 'este', 'pues', 'bueno', 'well', 'like', 'okay', 'ok']);
export const TC_SR_ES = { 'not-allowed': 'permiso de micrófono denegado', 'service-not-allowed': 'el reconocimiento de voz no está permitido aquí', 'audio-capture': 'no se encontró micrófono', unsupported: 'este navegador no tiene reconocimiento de voz', NotAllowedError: 'permiso de micrófono denegado', NotFoundError: 'no se encontró micrófono' };
/* Una vez: callback que se llama al terminar de hablar (o por tiempo, si el navegador no avisa) */
export function tcOnce(fn, ms) { let done = false; const f = () => { if (done) return; done = true; clearTimeout(t); fn && fn(); }; const t = setTimeout(f, ms); return f; }
export function tcSpeakEs(text, onend) { const f = tcOnce(onend, 2500 + text.length * 95 / chatMul()); speak(text, false, f, 'es', chatMul()); }
export function tcSpeakEn(text, onend) { const f = tcOnce(onend, 2500 + text.length * 110 / chatMul()); speak(text, false, f, undefined, chatMul()); }
/* ---- Extraer las palabras de cada hueco a partir de lo que dijo ---- */
export function tcExtractAll(it, text) {
  const n = it.b.length, segs = it.en.split('{}').map(s => normText(s)), fixed = segs.flat();
  const ansTok = new Set(it.b.flatMap(b => [...b.a, ...Object.keys(b.n || {})]).flatMap(a => normText(a)));
  const near = (a, b) => a === b || (a.length >= 4 && b.length >= 4 && lev(a, b) <= 1);
  const hyp = normText(text).filter(w => !TC_FILLERS.has(w) || ansTok.has(w) || fixed.includes(w));
  if (!hyp.length) return [];
  const maxLen = i => Math.max(1, ...[...it.b[i].a, ...Object.keys(it.b[i].n || {})].map(a => normText(a).length));
  const align = () => { const out = []; let p = 0;
    for (let i = 0; i < n; i++) {
      const Lf = segs[i], R = segs[i + 1];
      if (Lf.length) { const last = Lf[Lf.length - 1]; for (let k = p; k < hyp.length; k++) if (near(hyp[k], last)) { p = k + 1; break; } }
      let e = -1;
      if (R.length) { for (let k = p; k < hyp.length; k++) if (near(hyp[k], R[0])) { e = k; break; } } else e = hyp.length;
      if (e < 0) e = Math.min(hyp.length, p + maxLen(i));
      out.push(hyp.slice(p, e).join(' ')); p = e;
    }
    return out; };
  const words = h => { if (n === 1) return [h.join(' ')]; const out = []; let p = 0;
    for (let i = 0; i < n; i++) {
      if (i === n - 1) { out.push(h.slice(p).join(' ')); break; }
      const cands = [...it.b[i].a, ...Object.keys(it.b[i].n || {})].map(a => normText(a)).filter(c => c.length).sort((a, b) => b.length - a.length);
      let took = 0; for (const c of cands) if (c.every((w, j) => h[p + j] && near(h[p + j], w))) { took = c.length; break; }
      out.push(h.slice(p, p + (took || 1)).join(' ')); p += took || 1;
    }
    return out; };
  const hits = fixed.filter(w => hyp.some(h => near(h, w))).length, full = hits >= 2 || (hits >= 1 && fixed.length <= 2);
  const stripped = hyp.filter(w => ansTok.has(w) || !fixed.some(f => near(w, f)));
  const c = full ? [align(), words(stripped), words(hyp)] : [words(hyp), words(stripped), align()];
  const seen = new Set(); return c.filter(x => { const k = x.join('|'); if (seen.has(k) || !x.some(Boolean)) return false; seen.add(k); return true; });
}
export function tcExtract(it, text) { return tcExtractAll(it, text)[0] || it.b.map(() => ''); }
export function tcBestFromAlts(ex, alts) {
  const it = ex.item, W = { ok: 3, near: 2, typo: 1, unknown: 0.5, empty: 0 }; let best = null, bs = -1;
  alts.forEach((a, ai) => tcExtractAll(it, a.t).forEach((vals, ci) => {
    let sc = 0; vals.forEach((v, i) => { if (!ex.st.ok[i]) sc += W[tcEval(it, i, v, ex.st.extra[i]).k] || 0; });
    sc -= ai * 0.01 + ci * 0.001; if (sc > bs) { bs = sc; best = vals; }
  }));
  return best;
}
/* ---- Reconocimiento (Web Speech en-US con resultados parciales) ---- */
export function tcRecognize(onInterim) {
  return new Promise((resolve, reject) => {
    if (!HAS_SR) return reject('unsupported');
    let r; try { r = new SR(); } catch (e) { return reject('unsupported'); }
    r.lang = 'en-US'; r.interimResults = true; r.maxAlternatives = 5; r.continuous = false;
    let got = null, err = null;
    r.onresult = e => {
      const res = [...e.results], pre = res.slice(0, -1).map(x => (x[0] && x[0].transcript) || '').join(' '), last = res[res.length - 1];
      const alts = [...last].map(a => ({ t: ((pre ? pre + ' ' : '') + (a.transcript || '')).trim(), c: a.confidence || 0 })).filter(a => a.t);
      if (last.isFinal === false) { if (alts.length) r.__interim = alts; onInterim && alts[0] && onInterim(alts[0].t); } else got = alts;
    };
    r.onerror = e => { err = e.error; };
    r.onend = () => { setCurRec(null); const a = got || r.__interim; if (a && a.length) resolve(a); else reject(err || 'no-speech'); };
    try { r.start(); setCurRec(r); } catch (e) { return reject('busy'); }
    setTimeout(() => { try { r.stop(); } catch (e) {} }, 10000);
  });
}
/* ---- Interfaz ---- */
export function tcVState(k, heard) {
  V.state = k; const b = $('#tcVoice'); if (!b) return;
  const T = { speaking: '🔊 Tuki está hablando…', listening: '🔴 Escuchando… di la frase completa o solo la palabra', thinking: '⏳ Revisando tu respuesta…', idle: '🎙️ Toca el micrófono para responder', paused: '⏸️ Voz en pausa', done: '✅ ¡Bien! Pasando a la siguiente…' };
  b.dataset.state = k; $('#tcVState').textContent = T[k] || '';
  if (heard !== undefined) $('#tcHeard').textContent = heard ? 'Escuché: «' + heard + '»' : '';
  const m = $('#tcMicBig'); m.classList.toggle('on', k === 'listening'); m.setAttribute('aria-pressed', k === 'listening');
  m.textContent = k === 'listening' ? '⏹️' : '🎙️';
  $('#tcPause').textContent = V.paused ? '▶️ Seguir' : '⏸️ Pausa';
}
export function tcVoiceUI() {
  const on = S.settings.tcInput === 'voice' && tcCanVoice(), mb = $('#tcModeBtn');
  if (mb) { mb.textContent = on ? '⌨️ Escribir' : '🎙️ Hablar'; mb.title = on ? 'Cambiar a escribir' : 'Cambiar a hablar'; }
  const vb = $('#tcVoice'); if (vb) vb.classList.toggle('hidden', !on);
  const mu = $('#tcMute'); if (mu) mu.classList.toggle('hidden', on);
}
export function tcVoiceStop() { V.gen++; clearTimeout(V.timer); stopRecognize(); try { if (MicCap.active) MicCap.stop(); } catch (e) {} try { speechSynthesis && speechSynthesis.cancel(); } catch (e) {} try { stopAudio(); } catch (e) {} }
export function tcVoiceFallback(reason) {
  tcVoiceStop(); S.settings.tcInput = 'text'; save();
  toast('🎙️ No pude usar la voz (' + (TC_SR_ES[reason] || reason) + '). Cambié a ⌨️ Escribir; puedes volver a Hablar desde la tarjeta.', 5000);
  tcVoiceUI(); const f = $('#tcEn .tc-in:not([readonly])'); f && f.focus({ preventScroll: true });
}
export function tcRelisten(ex) { const g = V.gen; return () => { if (tcOk(g, ex) && !ex.st.done) V.timer = setTimeout(() => { if (tcOk(g, ex) && !ex.st.done) tcListen(ex); }, 350); else if (tcVoiceOn() && !V.paused && L && L.cur === ex && !ex.st.done) tcVState('idle'); }; }
/* ---- Turno de voz ---- */
export function tcVoiceStart(ex) {
  const g = ++V.gen; V.fails = 0; if (V.paused) return tcVState('paused');
  const it = ex.item, intro = L.done === 0 && !L.tcIntro ? '¿Sabes cómo se dice esto en inglés? ' : pick(['¿Y esta? ', '¿Cómo dirías esto en inglés? ', 'Siguiente frase: ']); L.tcIntro = 1;
  tcVState('speaking', ''); tcSpeakEs(intro + tcEsPlain(it), () => { if (tcOk(g, ex)) tcListen(ex); });
}
export async function tcListen(ex) {
  const g = ++V.gen; if (!tcVoiceOn() || ex.st.done || V.paused) return;
  try { speechSynthesis && speechSynthesis.cancel(); } catch (e) {}
  tcVState('listening', '');
  try {
    let alts, az = null;
    if (azureReady()) {
      const rec = await MicCap.start({ maxMs: Math.min(12000, 4000 + tcFull(ex.item).split(/\s+/).length * 600) });
      if (g !== V.gen || !L || L.cur !== ex) return;
      tcVState('thinking');
      az = await azureAssess(tcFull(ex.item), rec.wav);
      alts = (az.alts && az.alts.filter(a => a.t).length ? az.alts.filter(a => a.t) : [{ t: az.heard || '', c: 1 }]);
    } else alts = await tcRecognize(t => { if (g === V.gen) tcVoiceInterim(ex, t); });
    if (!tcOk(g, ex)) return;
    tcVoiceResult(ex, alts, az);
  } catch (err) {
    if (g !== V.gen || !L || L.cur !== ex) return;
    const code = typeof err === 'string' ? err : (err && (err.name === 'NotAllowedError' || err.name === 'NotFoundError') ? err.name : null);
    if (code && TC_SR_ES[code]) return tcVoiceFallback(code);
    if (err && typeof err === 'object' && azureReady() && (err.status === 401 || err.status === 403 || err.status === 429 || err instanceof TypeError || (err.shared && err.fatal)) && HAS_SR) { window.__azOff = true; toast('Azure no respondió (' + errES(err) + '). Uso el reconocimiento del navegador.', 4000); return tcListen(ex); }
    if (code === 'aborted') return tcVState('idle');
    V.fails++;
    if (V.fails <= 2 && (code === 'no-speech' || !code)) { tcVState('speaking'); tcSpeakEs(code === 'no-speech' ? 'No te escuché. Inténtalo otra vez.' : 'No te entendí. Inténtalo otra vez.', () => { if (tcOk(g, ex)) tcListen(ex); }); }
    else { tcVState('idle'); if (code && code !== 'no-speech') toast((SR_ERR[code] || errES(err)), 3500); }
  }
}
export function tcVoiceInterim(ex, t) {
  const vals = tcExtract(ex.item, t); $('#tcHeard').textContent = 'Escuché: «' + t + '»';
  $$('#tcEn .tc-in').forEach((inp, i) => { if (!ex.st.ok[i] && vals[i] != null) { inp.value = vals[i]; tcSize(inp); } });
}
export function tcVoiceResult(ex, alts, az) {
  const it = ex.item, heard = (alts[0] && alts[0].t) || '', low = alts.map(a => a.t.toLowerCase()).join(' | ');
  tcVState('thinking', heard);
  if (/\b(pista|pistas|pisto|hint|clue)\b|me das una/.test(low)) { if (ex.st.hint >= 2) { tcVState('speaking'); tcSay('Ya te di todas las pistas. Inténtalo, tú puedes.', tcRelisten(ex)); } else tcHint(ex); return; }
  if (/\b(repite|rep[ií]telo|repeat|otra vez|again)\b/.test(low) && !tcExtractAll(it, heard).some(v => v.some((x, i) => tcEval(it, i, x, ex.st.extra[i]).k === 'ok'))) { tcVState('speaking'); return tcSpeakEs(tcEsPlain(it), tcRelisten(ex)); }
  if (/\b(no s[eé]|me rindo|give up|ver respuesta|la respuesta|show me the answer)\b/.test(low)) return tcReveal(ex);
  const vals = tcBestFromAlts(ex, alts);
  if (az) tcShowAzure(ex, az);
  if (!vals || !vals.some((v, i) => v && !ex.st.ok[i])) { V.fails++; tcVState('speaking'); return tcSpeakEs('No te entendí bien. Di la frase otra vez, despacio.', tcRelisten(ex)); }
  $$('#tcEn .tc-in').forEach((inp, i) => { if (!ex.st.ok[i]) { inp.value = vals[i] || ''; tcSize(inp); inp.parentNode.classList.remove('bad'); } });
  tcCheck(ex, true);
}
export function tcShowAzure(ex, az) {
  const ans = new Set(ex.item.b.flatMap(b => b.a).flatMap(a => normText(a)));
  const ws = (az.words || []).filter(w => ans.has(normText(w.tok).join(' ')) && w.err !== 'Omission');
  const box = $('#tcAz'); if (box) box.innerHTML = ws.length ? '🔬 Pronunciación: ' + ws.map(w => `<span class="ph ${colorOf(w.s)}">${esc(w.tok.replace(/[.,!?;:"]/g, ''))} ${Math.round(w.s * 100)}</span>`).join(' ') + (az.pct != null ? ` <span class="small muted">· frase ${az.pct}/100</span>` : '') : '';
  const lowW = ws.filter(w => w.s < 0.6); if (lowW.length) flagHard(lowW.map(w => ({ word: w.tok.replace(/[.,!?;:"]/g, ''), note_es: 'Pronunciación baja en Traduce y completa (' + Math.round(w.s * 100) + '/100)' })), 'traduce-voz');
  (ex.st.az = ex.st.az || []).push(az.pct);
}
/* ---- Enganches con el modo de texto ---- */
export const _tcSay26 = tcSay;
tcSay = function (msg, onend) { if (V.sup) return; if (tcVoiceOn()) { if (!msg) return onend && onend(); tcVState('speaking'); return tcSpeakEs(String(msg).replace(/[✍️💡🤔✨👀]/gu, ''), onend); } _tcSay26(msg); onend && onend(); };
export const _tcBubble26 = tcBubble;
tcBubble = function (i, msg, cls = '') { if (tcVoiceOn() && msg && i != null && cls !== 'think') { V.sup++; try { _tcBubble26(i, msg, cls); } finally { V.sup--; } return tcSay(msg, tcRelisten(L.cur)); } if (cls === 'think' && tcVoiceOn()) tcVState('thinking'); return _tcBubble26(i, msg, cls); };
export const _tcHint26 = tcHint;
tcHint = function (ex) { _tcHint26(ex); if (!tcVoiceOn()) return; const it = ex.item, lt = it.b.map((b, i) => ex.st.ok[i] ? null : '«' + b.a[0].charAt(0) + '»').filter(Boolean); tcSay(ex.st.hint >= 2 ? 'La respuesta empieza por ' + lt.join(' y ') + '.' : 'Pista: ' + it.h, tcRelisten(ex)); };
export const _tcExtraHint26 = tcExtraHint;
tcExtraHint = function (ex) { const t = _tcExtraHint26(ex); if (t && tcVoiceOn()) tcSay(t, tcRelisten(L.cur)); return t; };
export const _tcSuccess26 = tcSuccess;
tcSuccess = function (ex) {
  const voice = tcVoiceOn(); if (!voice) return _tcSuccess26(ex);
  V.sup++; try { _tcSuccess26(ex); } finally { V.sup--; }
  const g = ++V.gen, praise = ($('.tc-praise') || {}).textContent || '¡Muy bien!', last = !L.queue.length;
  tcVState('speaking');
  tcSpeakEs(praise + (last ? '' : ' Siguiente.'), () => { if (!tcOk(g, ex)) return; tcSpeakEn(tcFull(ex.item), () => { if (!tcOk(g, ex)) return; tcVState('done'); V.timer = setTimeout(() => { if (tcOk(g, ex)) nextEx(); }, 1200); }); });
};
export const _tcReveal26 = tcReveal;
tcReveal = function (ex) {
  const voice = tcVoiceOn(); _tcReveal26(ex); if (!voice) return;
  const g = ++V.gen; tcVState('speaking');
  tcSpeakEs('Se dice así:', () => { if (!tcOk(g, ex)) return; tcSpeakEn(tcFull(ex.item), () => { if (!tcOk(g, ex)) return; tcVState('done'); V.timer = setTimeout(() => { if (tcOk(g, ex)) nextEx(); }, 1500); }); });
};

export const _tcSetup26 = tcSetup;
tcSetup = function () {
  _tcSetup26();
  const lv = $('#tcLv'); if (!lv) return; const sheet = lv.closest('.sheet'), can = tcCanVoice();
  const note = [...$$('.small.muted', sheet)].find(x => /dominadas \/ total/.test(x.textContent)) || lv;
  note.insertAdjacentHTML('afterend', `<div class="small muted" style="font-weight:800;margin-top:10px">Cómo respondes</div><div class="chips" id="tcInSel"><button class="chip" data-in="text">⌨️ Escribir</button><button class="chip" data-in="voice" ${can ? '' : 'disabled'}>🎙️ Hablar</button></div><div class="small muted" id="tcInNote"></div>`);
  const draw = () => { const m = S.settings.tcInput === 'voice' && can ? 'voice' : 'text'; $$('[data-in]', sheet).forEach(b => b.classList.toggle('active', b.dataset.in === m)); $('#tcInNote', sheet).textContent = !can ? 'Hablar necesita reconocimiento de voz (Chrome en Android) o Azure.' : m === 'voice' ? 'Tuki lee cada frase en español y tú respondes en inglés con tu voz. Di «pista» si necesitas ayuda.' : 'Escribes la respuesta en los espacios azules.'; };
  $$('[data-in]', sheet).forEach(b => b.onclick = () => { if (b.disabled) return; S.settings.tcInput = b.dataset.in; save(); draw(); });
  draw();
};
Object.assign(window, { tcExtract, tcExtractAll });


/* =================== v2.7 PRÁCTICA DIARIA =================== */
/* =================== v2.7: PRÁCTICA DIARIA (banco A1–A2) =================== */

export const PD_LISTEN = [
  ['l01', 'Nice to meet you.', 'Mucho gusto.'], ['l02', 'See you tomorrow.', 'Nos vemos mañana.'], ['l03', 'How much is it?', '¿Cuánto cuesta?'],
  ['l04', 'I am very tired today.', 'Estoy muy cansado hoy.'], ['l05', 'Can you help me, please?', '¿Me puedes ayudar, por favor?'], ['l06', 'Where is the bathroom?', '¿Dónde está el baño?'],
  ['l07', "I don't understand.", 'No entiendo.'], ['l08', 'Can you repeat that, please?', '¿Puedes repetir eso, por favor?'], ['l09', "It's cold outside.", 'Hace frío afuera.'],
  ['l10', "I'm hungry.", 'Tengo hambre.'], ['l11', 'Have a nice day!', '¡Que tengas un buen día!'], ['l12', 'What time is it?', '¿Qué hora es?'],
  ['l13', 'I live with my family.', 'Vivo con mi familia.'], ['l14', 'I work from home.', 'Trabajo desde casa.'], ['l15', "Let's go!", '¡Vamos!'],
  ['l16', 'I like coffee with milk.', 'Me gusta el café con leche.'], ['l17', 'The bus is late.', 'El bus está retrasado.'], ['l18', 'I need some water.', 'Necesito un poco de agua.'],
  ['l19', 'Thank you so much.', 'Muchas gracias.'], ['l20', "You're welcome.", 'De nada.'], ['l21', 'Excuse me.', 'Disculpe.'],
  ['l22', 'I am learning English.', 'Estoy aprendiendo inglés.'], ['l23', 'Speak more slowly, please.', 'Habla más despacio, por favor.'], ['l24', 'My phone is dead.', 'Mi teléfono está descargado.'],
  ['l25', "I'll call you later.", 'Te llamo más tarde.'], ['l26', 'The food is delicious.', 'La comida está deliciosa.'], ['l27', "I'm sorry, I'm late.", 'Perdón, llegué tarde.'],
  ['l28', 'Good morning, everyone.', 'Buenos días a todos.'], ['l29', 'Close the door, please.', 'Cierra la puerta, por favor.'], ['l30', 'It is my birthday today.', 'Hoy es mi cumpleaños.'],
  ['l31', 'I have two brothers.', 'Tengo dos hermanos.'], ['l32', 'The store opens at nine.', 'La tienda abre a las nueve.'], ['l33', 'Turn left at the corner.', 'Gira a la izquierda en la esquina.'],
  ['l34', 'I feel much better.', 'Me siento mucho mejor.'], ['l35', 'We are ready.', 'Estamos listos.'], ['l36', 'Wait a minute, please.', 'Espera un minuto, por favor.']
].map(([id, en, es]) => ({ id, en, es }));
export const pdQ = ([id, q, es, kw, model, modelEs, min]) => ({ id, q, es, kw, model, modelEs, min: min || 2 });
export const PD_SPEAK = [
  ['s01', "What's your name?", '¿Cómo te llamas?', ['name', 'i am', 'call', 'is'], 'My name is Jonatan.', 'Me llamo Jonatan.'],
  ['s02', 'Where do you live?', '¿Dónde vives?', ['live', 'in', 'from', 'city', 'colombia', 'bogota'], 'I live in Bogotá, Colombia.', 'Vivo en Bogotá, Colombia.'],
  ['s03', 'What do you like to eat?', '¿Qué te gusta comer?', ['like', 'eat', 'love', 'food', 'rice', 'chicken', 'pizza', 'fruit'], 'I like to eat rice and chicken.', 'Me gusta comer arroz con pollo.'],
  ['s04', 'How old are you?', '¿Cuántos años tienes?', ['years', 'old', 'am', 'twenty', 'thirty', 'forty', 'fifty'], 'I am thirty years old.', 'Tengo treinta años.'],
  ['s05', 'What do you do?', '¿A qué te dedicas?', ['work', 'am', 'job', 'engineer', 'teacher', 'student', 'developer'], 'I work as an engineer.', 'Trabajo como ingeniero.'],
  ['s06', 'Do you have any brothers or sisters?', '¿Tienes hermanos o hermanas?', ['brother', 'sister', 'have', 'no', 'yes', 'one', 'two'], 'Yes, I have one brother and one sister.', 'Sí, tengo un hermano y una hermana.'],
  ['s07', 'What is your favorite color?', '¿Cuál es tu color favorito?', ['color', 'blue', 'red', 'green', 'black', 'white', 'yellow', 'favorite'], 'My favorite color is blue.', 'Mi color favorito es el azul.'],
  ['s08', 'What time do you wake up?', '¿A qué hora te despiertas?', ['wake', 'up', 'at', 'clock', 'six', 'seven', 'five', 'eight'], 'I wake up at six in the morning.', 'Me despierto a las seis de la mañana.'],
  ['s09', 'Do you like music?', '¿Te gusta la música?', ['like', 'music', 'love', 'listen', 'yes', 'no', 'rock', 'salsa'], 'Yes, I love music. I listen to salsa.', 'Sí, me encanta la música. Escucho salsa.'],
  ['s10', 'What did you do yesterday?', '¿Qué hiciste ayer?', ['yesterday', 'went', 'worked', 'watched', 'played', 'did', 'stayed', 'was'], 'Yesterday I worked and then I watched a movie.', 'Ayer trabajé y luego vi una película.'],
  ['s11', 'What is the weather like today?', '¿Cómo está el clima hoy?', ['sunny', 'rainy', 'cold', 'hot', 'weather', 'it is', 'cloudy', 'raining'], "It's sunny but a little cold.", 'Está soleado pero un poco frío.'],
  ['s12', 'Do you have a pet?', '¿Tienes una mascota?', ['dog', 'cat', 'pet', 'have', 'no', 'yes'], 'Yes, I have a dog. His name is Max.', 'Sí, tengo un perro. Se llama Max.'],
  ['s13', 'What do you do on weekends?', '¿Qué haces los fines de semana?', ['weekend', 'weekends', 'play', 'visit', 'watch', 'go', 'rest', 'family'], 'On weekends I visit my family.', 'Los fines de semana visito a mi familia.'],
  ['s14', 'How are you today?', '¿Cómo estás hoy?', ['fine', 'good', 'great', 'tired', 'ok', 'okay', 'well', 'happy', 'am'], "I'm fine, thank you. And you?", 'Estoy bien, gracias. ¿Y tú?'],
  ['s15', 'Why are you learning English?', '¿Por qué estás aprendiendo inglés?', ['work', 'job', 'travel', 'because', 'want', 'need', 'learn'], 'Because I need English for my job.', 'Porque necesito inglés para mi trabajo.'],
  ['s16', 'What is your favorite food?', '¿Cuál es tu comida favorita?', ['favorite', 'food', 'pizza', 'rice', 'soup', 'chicken', 'bandeja', 'is'], 'My favorite food is chicken soup.', 'Mi comida favorita es la sopa de pollo.'],
  ['s17', 'How do you go to work?', '¿Cómo vas al trabajo?', ['bus', 'car', 'walk', 'bike', 'go', 'by', 'take', 'home'], 'I go to work by bus.', 'Voy al trabajo en bus.'],
  ['s18', 'What sports do you like?', '¿Qué deportes te gustan?', ['soccer', 'football', 'like', 'play', 'tennis', 'basketball', 'swim', 'run'], 'I like soccer. I play on Sundays.', 'Me gusta el fútbol. Juego los domingos.'],
  ['s19', 'Where are you from?', '¿De dónde eres?', ['from', 'colombia', 'am', 'born', 'city'], "I'm from Colombia.", 'Soy de Colombia.'],
  ['s20', 'What are you doing now?', '¿Qué estás haciendo ahora?', ['am', 'studying', 'practicing', 'learning', 'working', 'doing', 'now'], "I'm practicing English with Tuki.", 'Estoy practicando inglés con Tuki.'],
  ['s21', 'Do you drink coffee?', '¿Tomas café?', ['coffee', 'drink', 'yes', 'no', 'tea', 'morning', 'every'], 'Yes, I drink coffee every morning.', 'Sí, tomo café todas las mañanas.'],
  ['s22', 'What is your best friend like?', '¿Cómo es tu mejor amigo?', ['friend', 'is', 'funny', 'nice', 'kind', 'tall', 'smart'], 'My best friend is funny and kind.', 'Mi mejor amigo es divertido y amable.'],
  ['s23', 'What do you usually eat for breakfast?', '¿Qué desayunas normalmente?', ['eat', 'breakfast', 'eggs', 'bread', 'coffee', 'arepa', 'fruit'], 'I usually eat eggs and an arepa.', 'Normalmente como huevos y una arepa.'],
  ['s24', 'Where do you want to travel?', '¿A dónde quieres viajar?', ['want', 'travel', 'go', 'to', 'visit', 'london', 'new york', 'europe', 'canada'], 'I want to travel to Canada.', 'Quiero viajar a Canadá.'],
  ['s25', 'What time do you go to bed?', '¿A qué hora te acuestas?', ['bed', 'go', 'at', 'sleep', 'ten', 'eleven', 'twelve', 'nine'], 'I go to bed at eleven.', 'Me acuesto a las once.'],
  ['s26', 'Do you like to cook?', '¿Te gusta cocinar?', ['cook', 'like', 'yes', 'no', 'love', 'kitchen', 'food'], 'Yes, I like to cook on Sundays.', 'Sí, me gusta cocinar los domingos.'],
  ['s27', 'What is your job like?', '¿Cómo es tu trabajo?', ['job', 'is', 'work', 'interesting', 'hard', 'busy', 'fun', 'boring'], 'My job is interesting but busy.', 'Mi trabajo es interesante pero ocupado.'],
  ['s28', 'Who do you live with?', '¿Con quién vives?', ['live', 'with', 'alone', 'family', 'wife', 'husband', 'parents', 'friend'], 'I live with my wife and my son.', 'Vivo con mi esposa y mi hijo.'],
  ['s29', 'What movies do you like?', '¿Qué películas te gustan?', ['movies', 'like', 'action', 'comedy', 'love', 'watch', 'films'], 'I like action movies and comedies.', 'Me gustan las películas de acción y las comedias.'],
  ['s30', 'What is your city like?', '¿Cómo es tu ciudad?', ['city', 'is', 'big', 'small', 'beautiful', 'cold', 'busy', 'nice'], 'My city is big and a little cold.', 'Mi ciudad es grande y un poco fría.'],
  ['s31', 'What did you eat today?', '¿Qué comiste hoy?', ['ate', 'had', 'eat', 'today', 'rice', 'chicken', 'eggs', 'breakfast', 'lunch'], 'Today I had eggs for breakfast.', 'Hoy comí huevos al desayuno.'],
  ['s32', 'Can you swim?', '¿Sabes nadar?', ['can', 'swim', 'yes', 'no', "can't", 'cannot', 'little'], 'Yes, I can swim, but not very well.', 'Sí, sé nadar, pero no muy bien.']
].map(pdQ);
export const PD_MIXED = [
  ['m01', 'Can you tell me your phone number?', '¿Me puedes decir tu número de teléfono?', ['number', 'is', 'three', 'one', 'zero', 'phone', 'sure'], 'Sure. My number is three one zero, five five five, one two three four.', 'Claro. Mi número es 310 555 1234.'],
  ['m02', 'Would you like some coffee?', '¿Quieres un poco de café?', ['yes', 'no', 'please', 'thanks', 'thank', 'would', 'like', 'love'], 'Yes, please. With milk, thank you.', 'Sí, por favor. Con leche, gracias.'],
  ['m03', 'Excuse me, where is the station?', 'Disculpe, ¿dónde está la estación?', ['straight', 'left', 'right', 'there', 'near', 'street', 'corner', 'sorry', 'know'], "Go straight and turn left. It's near the park.", 'Siga derecho y gire a la izquierda. Está cerca del parque.'],
  ['m04', 'What are you going to do tonight?', '¿Qué vas a hacer esta noche?', ['going', 'to', 'tonight', 'watch', 'rest', 'sleep', 'cook', 'study', 'will'], "I'm going to watch a movie at home.", 'Voy a ver una película en casa.'],
  ['m05', 'Can I sit here?', '¿Me puedo sentar aquí?', ['yes', 'sure', 'of course', 'sorry', 'no', 'please', 'taken'], 'Sure, go ahead.', 'Claro, adelante.'],
  ['m06', 'How was your day?', '¿Cómo estuvo tu día?', ['good', 'great', 'bad', 'busy', 'tired', 'was', 'fine', 'long'], 'It was good, but very busy.', 'Estuvo bien, pero muy ocupado.'],
  ['m07', 'Are you ready to order?', '¿Está listo para ordenar?', ['yes', 'like', 'want', 'please', 'have', 'would', 'minute', 'no'], "Yes, I'd like a chicken sandwich, please.", 'Sí, quisiera un sándwich de pollo, por favor.'],
  ['m08', 'Do you want to go to the movies on Saturday?', '¿Quieres ir al cine el sábado?', ['yes', 'no', 'sure', 'love', 'sorry', 'can', "can't", 'time', 'great'], 'Yes, I would love to! What time?', '¡Sí, me encantaría! ¿A qué hora?'],
  ['m09', 'What is your email address?', '¿Cuál es tu correo electrónico?', ['at', 'gmail', 'dot', 'com', 'email', 'is', 'hotmail'], 'It is jonatan at gmail dot com.', 'Es jonatan arroba gmail punto com.'],
  ['m10', 'Could you speak more slowly, please?', '¿Podrías hablar más despacio, por favor?', ['sure', 'yes', 'sorry', 'of course', 'okay', 'slowly', 'no problem'], 'Sure, no problem. Is this better?', 'Claro, no hay problema. ¿Así está mejor?'],
  ['m11', 'How much is this shirt?', '¿Cuánto cuesta esta camisa?', ['dollars', 'is', 'thousand', 'pesos', 'costs', 'twenty', 'thirty', 'price'], 'It is twenty dollars.', 'Cuesta veinte dólares.'],
  ['m12', 'What would you like to drink?', '¿Qué te gustaría tomar?', ['water', 'juice', 'coffee', 'soda', 'like', 'please', 'beer', 'tea'], "I'd like an orange juice, please.", 'Quisiera un jugo de naranja, por favor.'],
  ['m13', 'Is this your bag?', '¿Esta es tu bolsa?', ['yes', 'no', 'mine', 'is', 'not', 'thank', 'thanks'], "Yes, it's mine. Thank you!", 'Sí, es mía. ¡Gracias!'],
  ['m14', 'Can you help me with this box?', '¿Me ayudas con esta caja?', ['sure', 'yes', 'of course', 'help', 'okay', 'problem', 'sorry'], 'Of course. Where do you want it?', 'Claro. ¿Dónde la quieres?'],
  ['m15', 'Do you know a good restaurant near here?', '¿Conoces un buen restaurante cerca de aquí?', ['yes', 'no', 'there', 'is', 'near', 'street', 'good', 'know', 'sorry'], "Yes, there is a good Italian restaurant on this street.", 'Sí, hay un buen restaurante italiano en esta calle.'],
  ['m16', 'When is your birthday?', '¿Cuándo es tu cumpleaños?', ['birthday', 'is', 'in', 'on', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'], 'My birthday is on May tenth.', 'Mi cumpleaños es el diez de mayo.'],
  ['m17', 'What time does the meeting start?', '¿A qué hora empieza la reunión?', ['at', 'starts', 'start', 'nine', 'ten', 'two', 'three', 'clock', 'half'], 'It starts at nine thirty.', 'Empieza a las nueve y media.'],
  ['m18', 'How long have you studied English?', '¿Hace cuánto estudias inglés?', ['years', 'months', 'for', 'since', 'weeks', 'studied', 'long', 'one', 'two'], "I've studied English for two years.", 'Estudio inglés hace dos años.'],
  ['m19', 'Can you open the window, please?', '¿Puedes abrir la ventana, por favor?', ['sure', 'yes', 'of course', 'okay', 'no problem', 'open'], 'Sure, no problem.', 'Claro, no hay problema.'],
  ['m20', 'What is your favorite day of the week?', '¿Cuál es tu día favorito de la semana?', ['saturday', 'sunday', 'friday', 'monday', 'favorite', 'is', 'because'], 'My favorite day is Saturday because I rest.', 'Mi día favorito es el sábado porque descanso.'],
  ['m21', 'Do you need a bag?', '¿Necesita una bolsa?', ['yes', 'no', 'please', 'thanks', 'thank', 'need', 'fine'], 'No, thank you. I have one.', 'No, gracias. Tengo una.'],
  ['m22', 'Where did you go on vacation?', '¿A dónde fuiste de vacaciones?', ['went', 'to', 'vacation', 'beach', 'cartagena', 'visited', 'stayed', 'home'], 'I went to Cartagena with my family.', 'Fui a Cartagena con mi familia.'],
  ['m23', 'Is it far from here?', '¿Queda lejos de aquí?', ['no', 'yes', 'far', 'near', 'close', 'minutes', 'walk', 'about'], "No, it's about ten minutes walking.", 'No, queda a unos diez minutos caminando.'],
  ['m24', 'What do you need?', '¿Qué necesitas?', ['need', 'want', 'some', 'water', 'help', 'nothing', 'please'], 'I need some help with my computer.', 'Necesito ayuda con mi computador.'],
  ['m25', 'Are you busy right now?', '¿Estás ocupado ahora mismo?', ['yes', 'no', 'busy', 'free', 'little', 'minute', 'bit'], 'A little, but I have a minute.', 'Un poco, pero tengo un minuto.'],
  ['m26', 'How do you spell your last name?', '¿Cómo se escribe tu apellido?', ['r', 'u', 'i', 'z', 'is', 'spell', 'letter'], 'R-U-I-Z. Ruiz.', 'R-U-I-Z. Ruiz.'],
  ['m27', 'Can we meet tomorrow at ten?', '¿Nos podemos ver mañana a las diez?', ['yes', 'no', 'sure', 'fine', 'perfect', 'sorry', 'can', "can't", 'okay', 'better'], 'Yes, ten is perfect for me.', 'Sí, a las diez me queda perfecto.'],
  ['m28', 'What did you have for lunch?', '¿Qué almorzaste?', ['had', 'ate', 'rice', 'chicken', 'soup', 'salad', 'for', 'lunch'], 'I had rice, chicken and salad.', 'Almorcé arroz, pollo y ensalada.'],
  ['m29', 'Do you prefer tea or coffee?', '¿Prefieres té o café?', ['tea', 'coffee', 'prefer', 'like', 'both', 'better'], 'I prefer coffee, especially in the morning.', 'Prefiero el café, sobre todo en la mañana.'],
  ['m30', 'Where can I buy a ticket?', '¿Dónde puedo comprar un boleto?', ['there', 'at', 'office', 'online', 'machine', 'counter', 'can', 'window'], 'You can buy it at the ticket office over there.', 'Lo puedes comprar en la taquilla de allá.'],
  ['m31', 'Did you sleep well?', '¿Dormiste bien?', ['yes', 'no', 'slept', 'well', 'bad', 'not', 'great', 'tired'], 'Yes, I slept very well, thanks.', 'Sí, dormí muy bien, gracias.'],
  ['m32', 'What are your plans for the weekend?', '¿Qué planes tienes para el fin de semana?', ['going', 'to', 'weekend', 'visit', 'rest', 'plan', 'will', 'want'], "I'm going to visit my parents.", 'Voy a visitar a mis papás.']
].map(pdQ);

/* ---- estado y rotación ---- */
export function ensure27() { if (!S.pd || typeof S.pd !== 'object') S.pd = {}; if (!S.pd.days || typeof S.pd.days !== 'object') S.pd.days = {}; if (!Array.isArray(S.pd.recent)) S.pd.recent = []; S.pd.best = +S.pd.best || 0; }

export const pdDayNum = key => Math.floor(new Date(key + 'T12:00:00').getTime() / DAY);
export function pdRecentIds(key) { const n = pdDayNum(key); return new Set((S.pd.recent || []).filter(r => r.d !== key && n - pdDayNum(r.d) <= 10 && n - pdDayNum(r.d) > 0).flatMap(r => r.ids || [])); }
export function pdPick(list, key, salt, extra = 0) {
  const recent = pdRecentIds(key), N = list.length, start = (numHash(key + '|' + salt) + extra * 7) % N;
  for (let k = 0; k < N; k++) { const it = list[(start + k) % N]; if (!recent.has(it.id)) return it; }
  return list[start];
}
export function pdItems(key = dayKey()) {
  const rep = (S.pd.days[key] && S.pd.days[key].n) || 0;
  return { l: pdPick(PD_LISTEN, key, 'l', rep), s: pdPick(PD_SPEAK, key, 's', rep), m: pdPick(PD_MIXED, key, 'm', rep) };
}
/* ---- P7 (v2.24.0): 1 pregunta generada del día ----
   El paso 2 (Hablar) de la práctica diaria puede venir de la IA en vez
   del banco estático: 1 pregunta generada desde los errores de ayer
   (resumen, S.hard, fonema débil). Cacheada por dayKey() en
   'tukiSpeak.pdgen' (+ respaldo en memoria, como 'tukiSpeak.pcache' de
   Top 2): 1 llamada Gemini al día como máximo; el intento cuenta aunque
   falle o el JSON no valide, así que hoy no se reintenta. Sin proveedor,
   sin cuota o sin errores medidos no se llama y la PD sigue exactamente
   como hoy (banco estático). Sin tarjeta ni aviso nuevo (reglas de
   densidad R2/R3): la pregunta generada vive dentro de los 3 pasos
   existentes, con la misma forma pdQ, y pdKeywordEval() sigue siendo el
   fallback de evaluación. */
export const PD_GEN_CACHE_KEY = 'tukiSpeak.pdgen';
export let MEM_PDGEN = null;
export function pdGenCacheGet() {
  if (MEM_PDGEN) return MEM_PDGEN;
  try { const v = JSON.parse(localStorage.getItem(PD_GEN_CACHE_KEY) || 'null'); if (v && typeof v === 'object') { MEM_PDGEN = v; return v; } } catch (e) {}
  return null;
}
export function pdGenCacheSet(v) {
  MEM_PDGEN = v;
  try { localStorage.setItem(PD_GEN_CACHE_KEY, JSON.stringify(v)); } catch (e) {}
}
export function pdGenData() {
  const y = dayKey(new Date(Date.now() - DAY));
  const phonemes = Object.entries(S.ph || {}).map(([ipa, r]) => ({ ipa, avg: Math.round(r.sum / r.n), n: r.n }))
    .filter(p => p.n >= 1 && Number.isFinite(p.avg) && p.avg < 80).sort((a, b) => a.avg - b.avg).slice(0, 1);
  const words = hardWords().filter(h => h.w && !/\s/.test(String(h.w).trim())).slice(0, 3)
    .map(h => ({ w: String(h.w).trim(), score: h.last == null ? (h.avg == null ? 60 : h.avg) : h.last, note: h.note || '' }));
  let errors = [];
  const sums = S.summaries || [];
  const sum = sums.find(r => r.date === y) || sums[0];
  if (sum && sum.data && Array.isArray(sum.data.mistakes)) errors = sum.data.mistakes.slice(0, 2).map(m => ({ said: String(m.said || ''), correct: String(m.correct || '') })).filter(m => m.correct);
  return { phonemes, words, errors, total: phonemes.length + words.length + errors.length };
}
export function pdGenHasData(d) {
  const data = d || pdGenData();
  return (data.words.length + data.errors.length) >= 1;
}
export function pdGenAvailable() {
  if (!currentProvider()) return false;
  if (gemShared()) { const q = aiQuotaToday(); if (q && (q.limit - q.used) <= 0) return false; }
  return true;
}
export const PD_GEN_SYS = `You are "Tuki", a patient English teacher for a Spanish-speaking learner from Colombia. You are given MEASURED data about this learner's real mistakes from yesterday: their weakest phoneme (with average score), their worst-scored words, and 1-2 errors from a recent conversation summary (what they said vs. the correct sentence).
Create ONE new spoken practice question that makes the learner use one of those measured words or the topic of a corrected sentence in a new everyday situation.
Return ONLY JSON with this exact shape:
{"q":"<one open question in English>","es":"<Spanish translation of the question>","kw":["keyword1","keyword2"],"model":"<short natural model answer in English>","modelEs":"<Spanish meaning of the model answer>"}
Rules: q is one open question (max 16 words, A1-A2 words) that naturally invites the learner to use a measured word; es is its translation; kw has 4-8 lowercase single keywords the learner's answer should contain, including a measured word when possible; model is a short natural answer (max 14 words) that uses a measured word; modelEs is its Spanish meaning. Never invent mistakes the learner did not make and never make the practiced target a word outside the given data (other words may appear only as ordinary context). No offensive content, no TV shows, movies, books, songs or real people.`;
export function pdGenPrompt(data) {
  const lines = ['Measured data from yesterday (use ONLY this):'];
  if (data.phonemes.length) lines.push(`Weakest phoneme: ${data.phonemes.map(p => `${p.ipa} (avg ${p.avg}%, ${p.n} samples)`).join(', ')}`);
  if (data.words.length) lines.push(`Worst words: ${data.words.map(w => `"${w.w}" (score ${w.score}${w.note ? `, note: ${w.note}` : ''})`).join(', ')}`);
  if (data.errors.length) lines.push(`Latest errors: ${data.errors.map(e => `said "${e.said}" -> correct "${e.correct}"`).join(' | ')}`);
  lines.push('Create 1 question.');
  return lines.join('\n');
}
const _pdGenClean = s => String(s || '').trim().replace(/\s+/g, ' ');
export function pdGenValidate(d, data) {
  if (!d || typeof d !== 'object') return null;
  const BAD = /fuck|shit|bitch|damn|porn|sex|kill|hate you|stupid/i;
  const q = _pdGenClean(d.q), es = _pdGenClean(d.es), model = _pdGenClean(d.model), modelEs = _pdGenClean(d.modelEs);
  const kw = Array.isArray(d.kw) ? d.kw.map(x => String(x || '').trim().toLowerCase()).filter(x => /^[a-z][a-z' -]{1,19}$/.test(x)) : [];
  if (!q || q.length < 5 || q.length > 140 || !/\?$/.test(q)) return null;
  if (!es || !model || model.length < 3 || model.length > 160 || !modelEs) return null;
  if (kw.length < 3) return null;
  if (BAD.test(q + ' ' + model + ' ' + kw.join(' '))) return null;
  // La pregunta o la respuesta modelo debe usar de verdad una palabra
  // medida (o una palabra de la frase corregida); si no, se degrada al
  // banco estático sin 2.ª llamada.
  const allowed = new Set((data.words || []).map(w => String(w.w).toLowerCase()));
  (data.errors || []).forEach(e => String(e.correct || '').toLowerCase().replace(/[^a-z' ]/g, ' ').split(/\s+/).filter(t => t.length >= 3).forEach(t => allowed.add(t)));
  const hay = s => String(s || '').toLowerCase().replace(/[^a-z' ]/g, ' ').split(/\s+/).some(t => allowed.has(t));
  if (!hay(q) && !hay(model)) return null;
  return { id: 'pdg-' + dayKey(), q, es, kw, model, modelEs, min: 2 };
}
export async function pdGenSpeak(key = dayKey()) {
  const cached = pdGenCacheGet();
  if (cached && cached.day === key) return cached.item || null;
  if (!pdGenAvailable() || !pdGenHasData()) return null;
  const data = pdGenData();
  let item = null;
  try { const d = await aiJSON(PD_GEN_SYS, pdGenPrompt(data), 1200); item = pdGenValidate(d, data); } catch (e) { item = null; }
  // (el intento cuenta como la llamada del día aunque falle o el JSON no
  // valide: el cliente no reintenta hoy para respetar el tope de 1/día)
  pdGenCacheSet({ day: key, item });
  return item;
}
export function pdStreak() { let n = 0; const d = new Date(); for (;;) { const k = dayKey(d); if (!(S.pd.days[k] && S.pd.days[k].done)) { if (n === 0 && k === dayKey()) { d.setDate(d.getDate() - 1); continue; } break; } n++; d.setDate(d.getDate() - 1); } return n; }
export const pdMul = () => chatMul();
export const pdSay = (t, slow, onend) => speak(t, !!slow, onend || null, undefined, pdMul());
export const pdSayEs = (t, onend) => speak(t, false, onend || null, 'es', pdMul());
export function pdCard(en, es) { const kind = /\s/.test(en.trim()) ? 'frase' : 'palabra', pre = kind === 'frase' ? 's:' : 'w:', key = pre + en.trim().toLowerCase(); if (S.deck[key] || S.deck[pre + en.trim()]) return false; addToDeck([{ key, en: en.trim(), es, kind, lesson: null }]); S.deck[key].src = 'pd'; if (L && L.pd) L.pd.cards++; save(); return true; }
export function pdHardFrom(r) { const low = (r && r.words || []).filter(w => w.s < 0.6).map(w => ({ word: w.tok.replace(/[.,!?;:"¿¡]/g, ''), note_es: 'Práctica diaria: pronunciación ' + Math.round(w.s * 100) + '%' })).filter(w => w.word.length > 1); if (low.length) { flagHard(low, 'diaria'); if (L && L.pd) L.pd.hard += low.length; } return low.length; }
/* ---- inicio ---- */
export async function startPD() {
  const key = dayKey(), it = pdItems(key);
  // (P7: el paso 2 puede ser la pregunta generada del día; solo se
  // muestra el spinner transitorio cuando de verdad se va a generar —
  // caché de hoy vacío + proveedor + errores medidos. Con caché o sin
  // generación, el inicio es inmediato y estático como hoy.)
  let gen = null;
  const cached = pdGenCacheGet();
  if (cached && cached.day === key) gen = cached.item || null;
  else if (pdGenAvailable() && pdGenHasData()) {
    let closeLoading = null;
    modal(`<div style="text-align:center"><div class="spinner"></div><h2 style="margin:6px 0">🌅 Práctica diaria</h2><p class="small muted">Tuki está preparando tu pregunta de hoy…</p></div>`, (el, close) => { closeLoading = close; });
    try { gen = await pdGenSpeak(key); } finally { if (closeLoading) closeLoading(); }
  }
  if (gen) it.s = gen;
  closeWordPop();
  startLesson(null, 'pd', [{ kind: 'pdl', item: it.l, l: LESSONS[0], step: 1 }, { kind: 'pds', item: it.s, l: LESSONS[0], step: 2 }, { kind: 'pdm', item: it.m, l: LESSONS[0], step: 3 }], 'Práctica diaria');
  if (L) L.pd = { key, ids: [it.l.id, it.s.id, it.m.id], scores: [], cards: 0, hard: 0, miss: 0 };
}
export const PD_STEPS = { 1: '👂 Escuchar', 2: '🗣️ Hablar', 3: '🔀 Mixto' };
export const pdHead = (ex, title) => `<div class="pd-steps" aria-label="Paso ${ex.step} de 3">${[1, 2, 3].map(i => `<span class="${i < ex.step ? 'done' : i === ex.step ? 'cur' : ''}">${i < ex.step ? '✓' : i}</span>`).join('<i></i>')}<b>${ex.step}/3 · ${PD_STEPS[ex.step]}</b></div><div class="ex-title">${title}</div>`;
export const pdListenRow = t => `<div class="listen-row"><button class="spk big" data-pd-say="${esc(t)}" aria-label="Escuchar">🔊</button><button class="spk slow" data-pd-slow="${esc(t)}" aria-label="Lento">🐢</button></div>`;
export function pdBind(root) {
  $$('[data-pd-say]', root).forEach(b => b.onclick = () => pdSay(b.dataset.pdSay));
  $$('[data-pd-slow]', root).forEach(b => b.onclick = () => pdSay(b.dataset.pdSlow, true));
  $$('[data-pd-es]', root).forEach(b => b.onclick = () => { const box = $('#' + b.dataset.pdEs); if (box) { box.classList.remove('hidden'); pdSayEs(box.dataset.es || box.textContent); } b.remove(); });
  $$('[data-pd-saye]', root).forEach(b => b.onclick = () => pdSayEs(b.dataset.pdSaye));
}
export function pdOptions(body, opts, correct, onDone) {
  const box = $('.pd-opts', body);
  box.innerHTML = opts.map((o, i) => `<button class="opt pd-opt" data-i="${i}">${esc(o)}</button>`).join('');
  $$('.pd-opt', box).forEach(b => b.onclick = () => {
    const i = +b.dataset.i, ok = i === correct;
    $$('.pd-opt', box).forEach(x => { x.disabled = true; if (+x.dataset.i === correct) x.classList.add('right'); });
    if (!ok) b.classList.add('wrong'); beep(ok ? 'ok' : 'bad'); onDone(ok);
  });
}
export const pdOthers = (list, it, n, f) => shuffle(list.filter(x => x.id !== it.id && f(x) !== f(it))).slice(0, n).map(f);
/* Micrófono: frase modelo (con puntaje) o respuesta libre (solo texto reconocido) */
export async function pdListenFree(btn) {
  if (HAS_SR) { btn.classList.add('rec'); btn.innerHTML = '🔴 Escuchando… responde en inglés'; try { const alts = await recognize(); return alts[0].t; } finally { btn.classList.remove('rec'); btn.innerHTML = '🎤 Responder otra vez'; } }
  if (azureReady()) { btn.classList.add('rec'); btn.innerHTML = '🔴 Escuchando (Azure)…'; try { const rec = await MicCap.start({ maxMs: 12000 }); btn.innerHTML = '⏳ Transcribiendo…'; return await azureSTT(rec.wav); } finally { btn.classList.remove('rec'); btn.innerHTML = '🎤 Responder otra vez'; } }
  throw 'unsupported';
}
export function pdRepeatBlock(target, id) { return `<div class="pd-rep" id="${id}"><div class="target" data-tgt>${wordsHTML(target)}</div>${canSpeak() ? `<button class="mic pd-mic" data-rep>🎤 Repite en voz alta</button>` : '<div class="small muted">Sin reconocimiento de voz: escucha el modelo y repítelo en voz alta para practicar.</div>'}<div class="pd-res small" data-res></div></div>`; }
export function pdBindRepeat(root, target, onScore) {
  const b = $('[data-rep]', root); if (!b) return;
  b.onclick = () => doMic(b, (alts, url, az) => {
    const r = az || scoreSpeech(target, alts); $('[data-tgt]', root).innerHTML = wordsHTML(target, r.words);
    const pass = r.pct >= S.settings.threshold;
    // (fase premium, etapa 6: pista fonémica uniforme al fallar la
    // repetición; la práctica diaria no tiene sonido de lección, así que
    // la pista viene del resultado de voz — tip de Azure cuando existe)
    $('[data-res]', root).innerHTML = `<b style="color:${pass ? 'var(--g-d)' : r.pct >= 50 ? 'var(--o-d)' : 'var(--r)'}">${r.pct}%</b> · escuché «${esc(r.heard || '')}» · 🟢 bien · 🟡 dudoso · 🔴 repetir${az ? ' · 🔬 Azure' : ''}${!pass ? phonemeHintHTML(null, r) : ''}`;
    recordSpeech('pd', r); onScore && onScore(r, pass);
  }, target);
}
/* Evaluación de respuestas libres */
export const PD_PLACES = ['live', 'bogota', 'bogotá', 'medellin', 'medellín', 'cali', 'barranquilla', 'cartagena', 'bucaramanga', 'pereira', 'manizales', 'cucuta', 'cúcuta', 'ibague', 'ibagué', 'santa marta', 'city', 'town', 'country', 'spain', 'mexico', 'usa'];
export function pdKeywordEval(it, text) {
  const kws = it.kw.includes('colombia') ? it.kw.concat(PD_PLACES) : it.kw;
  const toks = normText(text), j = ' ' + toks.join(' ') + ' ', hit = kws.some(k => { const n = normText(k).join(' '); return n && j.includes(' ' + n + ' '); });
  if (!toks.length) return { k: 'empty', msg: 'No escuché una respuesta. Intenta de nuevo.' };
  if (toks.length < it.min) return { k: 'short', msg: 'Buen intento. Intenta responder con una frase completa, por ejemplo empezando con «I…» o «My…».' };
  if (!hit) return { k: 'off', msg: 'Mmm, parece que tu respuesta no contesta la pregunta. La pregunta era: «' + it.es + '». Escucha la respuesta modelo.' };
  return { k: 'ok', msg: pick(['¡Bien! Tu respuesta tiene sentido. 👏', '¡Muy bien! Te entendí. 👏', '¡Excelente! Respondiste la pregunta. 👏']) + ' Escucha una respuesta modelo y repítela.' };
}
export async function pdEvaluate(it, text) {
  if (currentProvider()) {
    try {
      const lv = chatLevel(), d = await aiJSON(`You are Tuki, a kind English teacher for a Spanish-speaking beginner from Colombia (CEFR ${lv === 'A2' ? 'A1-A2' : lv}). The learner answered a simple spoken question. The answer may come from speech-to-text, so ignore punctuation and capitalization.
Return ONLY JSON: {"relevant":true|false,"correct":true|false,"feedback_es":"...","better":"..."}
- relevant: the answer responds to the question.
- correct: no important grammar or vocabulary mistakes.
- feedback_es: very simple Latin American Spanish with "tú", max 30 words, encouraging; mention the main mistake if any.
- better: a short natural corrected or improved English answer based on what the learner wanted to say (max 14 words, A1-A2 words).`, `Question: "${it.q}"\nLearner's answer: "${String(text).trim()}"`, 1200);
      return { k: d.relevant === false ? 'off' : d.correct === false ? 'fix' : 'ok', msg: String(d.feedback_es || '').slice(0, 300) || '¡Buen intento!', better: String(d.better || '').trim().slice(0, 160) || it.model, ai: true };
    } catch (e) { const r = pdKeywordEval(it, text); r.aiErr = errES(e); return r; }
  }
  return pdKeywordEval(it, text);
}
export function pdAnswerArea(prefix) {
  return `<div class="pd-ans">${canSpeak() ? `<button class="mic pd-mic big" id="${prefix}Mic">🎤 Toca y responde en inglés</button>` : '<div class="notice small">🎙️ Sin reconocimiento de voz en este navegador: escribe tu respuesta.</div>'}
    <button class="btn ghost sm" id="${prefix}TypeBtn" ${canSpeak() ? '' : 'hidden'}>⌨️ Prefiero escribir</button>
    <div class="pd-type ${canSpeak() ? 'hidden' : ''}" id="${prefix}Type"><textarea class="inp" id="${prefix}Tin" rows="2" placeholder="Escribe tu respuesta en inglés…" autocapitalize="sentences" spellcheck="false"></textarea><button class="btn blue block" id="${prefix}Send">Enviar respuesta</button></div>
    <div id="${prefix}Out" aria-live="polite"></div></div>`;
}
export function pdBindAnswer(ex, prefix, onDone) {
  const it = ex.item, out = $('#' + prefix + 'Out');
  const handle = async text => {
    ex.answered = (ex.answered || 0) + 1;
    out.innerHTML = `<div class="pd-heard">Tu respuesta: «<b>${esc(text)}</b>»</div><div class="spinner"></div>`;
    const r = await pdEvaluate(it, text); if (!L || L.cur !== ex) return;
    const good = r.k === 'ok', model = r.better && r.k !== 'ok' ? r.better : it.model;
    if (!good) { ex.miss = true; if (r.better) pdCard(r.better, it.modelEs && r.better === it.model ? it.modelEs : 'Respuesta mejorada: ' + it.es); }
    out.innerHTML = `<div class="pd-heard">Tu respuesta: «<b>${esc(text)}</b>»</div>
      <div class="pd-fb ${good ? 'ok' : r.k === 'fix' ? 'fix' : 'off'}">${good ? '✅' : r.k === 'fix' ? '✏️' : '💡'} ${esc(r.msg)} <button class="mini" data-pd-saye="${esc(r.msg)}" aria-label="Escuchar en español">🔈</button>${r.aiErr ? `<div class="small muted">(Sin IA ahora: ${esc(r.aiErr)})</div>` : ''}</div>
      <div class="pd-model"><div class="small muted">${r.ai && r.k !== 'ok' ? '✨ Versión mejorada' : '⭐ Respuesta modelo'}</div><div class="row" style="gap:8px;align-items:center"><button class="spk" data-pd-say="${esc(model)}">🔊</button><button class="spk slow" data-pd-slow="${esc(model)}">🐢</button><b>${esc(model)}</b></div>${!r.ai || model === it.model ? `<div class="small muted">${esc(it.modelEs)}</div>` : ''}${pdRepeatBlock(model, prefix + 'Rep')}</div>`;
    pdBind(out); pdBindRepeat($('#' + prefix + 'Rep'), model, (sc) => { pdHardFrom(sc); ex.rep = sc.pct; });
    onDone(r);
  };
  const mic = $('#' + prefix + 'Mic');
  if (mic) mic.onclick = async () => { if (curRec) return stopRecognize(); if (MicCap.active) return MicCap.stop(); speechSynthesis && speechSynthesis.cancel(); try { const t = await pdListenFree(mic); if (t) handle(t); } catch (err) { toast(SR_ERR[err] || (typeof err === 'string' ? 'Error de voz: ' + err : errES(err)), 3500); if (err === 'not-allowed' || err === 'service-not-allowed' || err === 'unsupported' || err === 'audio-capture') { $('#' + prefix + 'Type').classList.remove('hidden'); } } };
  const tb = $('#' + prefix + 'TypeBtn'); if (tb) tb.onclick = () => { $('#' + prefix + 'Type').classList.remove('hidden'); tb.remove(); $('#' + prefix + 'Tin').focus(); };
  $('#' + prefix + 'Send').onclick = () => { const t = $('#' + prefix + 'Tin').value.trim(); if (t) handle(t); else toast('Escribe tu respuesta primero.'); };
}
export function pdFoot(ex, enabled, label = 'Continuar') { setFoot(`<button class="btn ghost" id="pdSkip">Saltar</button><button class="btn primary" id="primaryBtn" ${enabled ? '' : 'disabled'}>${label}</button>`); $('#pdSkip').onclick = () => { ex.skipped = true; pdNext(ex); }; $('#primaryBtn').onclick = () => pdNext(ex); }
export function pdNext(ex) { L.pd.scores.push(ex.rep ?? null); if (ex.miss) L.pd.miss++; L.done++; nextEx(); }
/* 1) Escuchar */
RENDER.pdl = (ex, body) => {
  const it = ex.item, en = pdDayNum(dayKey()) % 2 === 1;
  const opts = shuffle([en ? it.en : it.es, ...pdOthers(PD_LISTEN, it, 3, x => en ? x.en : x.es)]), correct = opts.indexOf(en ? it.en : it.es);
  body.innerHTML = `${pdHead(ex, 'Escucha a Tuki')}<div class="pd-card">${pdListenRow(it.en)}<div class="small muted" style="text-align:center">Puedes escucharla las veces que quieras.</div></div>
    <div class="pd-q">${en ? '¿Qué frase escuchaste?' : '¿Qué significa?'}</div><div class="pd-opts"></div><div id="pdLRep"></div>`;
  pdBind(body); pdFoot(ex, false);
  pdOptions(body, opts, correct, ok => {
    if (!ok) { ex.miss = true; pdCard(it.en, it.es); }
    $('#pdLRep').innerHTML = `<div class="pd-fb ${ok ? 'ok' : 'off'}">${ok ? '✅ ¡Correcto!' : '❌ Era: <b>' + esc(en ? it.en : it.es) + '</b>'} <span class="muted">«${esc(it.en)}» = ${esc(it.es)}</span></div><div class="pd-q">Ahora repítela en voz alta</div>${pdRepeatBlock(it.en, 'pdLR')}`;
    pdBindRepeat($('#pdLR'), it.en, (r, pass) => { ex.rep = Math.max(ex.rep || 0, r.pct); if (!pass) { pdCard(it.en, it.es); } pdHardFrom(r); $('#primaryBtn').disabled = false; });
    $('#primaryBtn').disabled = false; setTimeout(() => { const e = $('#pdLRep'); e && e.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, 50);
  });
  setTimeout(() => { if (L && L.cur === ex) pdSay(it.en); }, 350);
};
/* 2) Hablar */
RENDER.pds = (ex, body) => {
  const it = ex.item;
  body.innerHTML = `${pdHead(ex, 'Responde a Tuki')}<div class="pd-card pd-qcard"><div class="pd-bigq">${esc(it.q)}</div>${pdListenRow(it.q)}<button class="btn ghost sm" data-pd-es="pdEs">🇪🇸 Ver en español</button><div class="pd-es hidden" id="pdEs" data-es="${esc(it.es)}">🇪🇸 ${esc(it.es)}</div></div>${pdAnswerArea('pdS')}`;
  pdBind(body); pdFoot(ex, false);
  pdBindAnswer(ex, 'pdS', () => { $('#primaryBtn').disabled = false; });
  setTimeout(() => { if (L && L.cur === ex) pdSay(it.q); }, 350);
};
/* 3) Mixto: entender + responder */
RENDER.pdm = (ex, body) => {
  const it = ex.item, opts = shuffle([it.es, ...pdOthers(PD_MIXED, it, 2, x => x.es)]), correct = opts.indexOf(it.es);
  body.innerHTML = `${pdHead(ex, 'Entiende y responde')}<div class="pd-card">${pdListenRow(it.q)}<div class="small muted" style="text-align:center">Escucha sin leer. ¿Qué te dice Tuki?</div></div><div class="pd-opts"></div><div id="pdM2"></div>`;
  pdBind(body); pdFoot(ex, false);
  pdOptions(body, opts, correct, ok => {
    if (!ok) { ex.miss = true; pdCard(it.q, it.es); }
    $('#pdM2').innerHTML = `<div class="pd-fb ${ok ? 'ok' : 'off'}">${ok ? '✅ ¡Entendiste!' : '❌ Tuki dijo: <b>' + esc(it.es) + '</b>'}</div><div class="pd-card pd-qcard"><div class="pd-bigq">${esc(it.q)}</div><div class="small muted">${esc(it.es)}</div></div><div class="pd-q">Ahora respóndele en voz alta</div>${pdAnswerArea('pdM')}`;
    pdBind($('#pdM2')); pdBindAnswer(ex, 'pdM', () => { $('#primaryBtn').disabled = false; });
    setTimeout(() => { const e = $('#pdM2'); e && e.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, 50);
  });
  setTimeout(() => { if (L && L.cur === ex) pdSay(it.q); }, 350);
};
/* ---- fin ---- */
export function pdFinish() {
  const p = L.pd, key = p.key, secs = Math.round((Date.now() - L.start) / 1000), first = !(S.pd.days[key] && S.pd.days[key].done);
  const xp = first ? 15 : 5, sc = p.scores.filter(x => x != null);
  const d = S.pd.days[key] || { n: 0 }; d.done = 1; d.n = (d.n || 0) + 1; d.ts = Date.now(); d.xp = (d.xp || 0) + xp; if (sc.length) d.pron = Math.round(avg(sc)); S.pd.days[key] = d;
  S.pd.recent.push({ d: key, ids: p.ids }); S.pd.recent = S.pd.recent.slice(-40);
  S.sessions++; todayRec().sec = (todayRec().sec || 0) + secs;
  refreshHearts(); let extra = ''; if (S.hearts < MAX_HEARTS) { S.hearts++; extra = '<p class="muted">❤️ ¡Recuperaste una vida!</p>'; }
  const up = addXP(xp), st = pdStreak(); S.pd.best = Math.max(S.pd.best || 0, st); save(); beep('done');
  $('#fullInner').innerHTML = `<div class="complete"><div class="mascot tuki-celebrate" id="pdFinishMascot" style="width:120px;height:120px;cursor:pointer" title="¡Toca al Profe Tuki para celebrar!">${MASCOT}</div><h1>¡Práctica diaria completa!</h1><div class="muted">Escuchaste y hablaste en inglés hoy 🎧🗣️</div>
    <div class="scards"><div class="scard scard-celebrate" style="border-color:var(--o);animation-delay:.1s"><div class="t" style="background:var(--o)">XP</div><div class="v" style="color:var(--o)" data-countup="${xp}" data-countup-prefix="+">+${xp}</div></div>
    <div class="scard scard-celebrate" style="border-color:var(--g);animation-delay:.18s"><div class="t" style="background:var(--g)">Pronunciación</div><div class="v" style="color:var(--g-d)">${sc.length ? Math.round(avg(sc)) + '%' : '—'}</div></div>
    <div class="scard scard-celebrate" style="border-color:#ff9f1c;animation-delay:.26s"><div class="t" style="background:#ff9f1c">Racha diaria</div><div class="v" style="color:#c97a00">🔥 ${st}</div></div>
    <div class="scard scard-celebrate" style="border-color:#8b5cf6;animation-delay:.34s"><div class="t" style="background:#8b5cf6">Tiempo</div><div class="v" style="color:#8b5cf6">${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}</div></div></div>
    ${up ? `<p>🔥 ¡Racha de <b>${S.streak}</b> ${S.streak === 1 ? 'día' : 'días'}!</p>` : ''}${first ? '' : '<p class="small muted">Repetición: +5 XP (el bono de +15 es una vez al día).</p>'}
    ${p.cards || p.hard ? `<p class="small muted">🃏 ${p.cards} tarjeta(s) nueva(s) · 🎯 ${p.hard} palabra(s) para practicar en «Mis palabras difíciles».</p>` : ''}${extra}
    <p class="small">Vuelve mañana para mantener tu racha de práctica diaria.</p>
    <button class="btn primary" id="primaryBtn" style="min-width:220px;margin-top:10px">Continuar</button></div>`;
  $('#primaryBtn').onclick = closeLesson; confetti(); checkBadges();
  countUpAll($('#fullInner'));
  const pfm = $('#pdFinishMascot');
  if (pfm) { pfm.onclick = () => { tukiMood('celebration', { el: pfm, particles: 'coin' }); confetti(); }; makeMascotClickable(pfm, '¡Toca al Profe Tuki para celebrar!'); }
}

export function pdCardHTML() {
  const done = S.pd.days[dayKey()] && S.pd.days[dayKey()].done, st = pdStreak();
  return `<div class="card pd-home ${done ? 'done' : ''}" id="pdCard"><div class="row between" style="align-items:flex-start"><div><h3 style="margin:0">${done ? '✅' : '🌅'} Práctica diaria · 3–5 min</h3><div class="small muted">${done ? '¡Hecha hoy! Vuelve mañana.' : 'Escucha y habla con 3 ejercicios cortos.'}</div></div><div class="pd-streak" title="Días seguidos">🔥 ${st}</div></div>
    <div class="pd-chips"><span>👂 Escuchar</span><span>🗣️ Hablar</span><span>🔀 Mixto</span></div>
    <button class="btn ${done ? 'ghost' : 'primary'} block pd-go" id="pdGo">${done ? '🔁 Repetir' : '▶️ Empezar'}</button></div>`;
}

export const safeReviver = (k, v) => (k === '__proto__' || k === 'constructor' || k === 'prototype') ? undefined : v;
export const lsGet = (k, d) => { try { const raw = localStorage.getItem(k); if (!raw) return d; const v = JSON.parse(raw, safeReviver); return v == null ? d : v; } catch (e) { return d; } };
export const lsSet = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
/* ---- Validación de datos importados (archivo, nube) ---- */

export const TV_SAMPLE = { es: 'Hola, soy Tuki. Vamos a practicar inglés juntos, paso a paso.', en: "Hi, I'm Tuki. Let's practice English together, step by step." };
// Nombres verificados en learn.microsoft.com › Speech service › Language support (Text to speech), voces "Standard" neurales (incluidas en F0).
export const TV_AZ = {
  es: [
    ['es-CO-SalomeNeural', 'Salomé', 'Colombia', 'mujer', 'Recomendada · colombiana'],
    ['es-MX-DaliaNeural', 'Dalia', 'México', 'mujer'],
    ['es-US-PalomaNeural', 'Paloma', 'Latina (EE. UU.)', 'mujer'],
    ['es-AR-ElenaNeural', 'Elena', 'Argentina', 'mujer'],
    ['es-VE-PaolaNeural', 'Paola', 'Venezuela', 'mujer'],
    ['es-PE-CamilaNeural', 'Camila', 'Perú', 'mujer'],
    ['es-CL-CatalinaNeural', 'Catalina', 'Chile', 'mujer'],
    ['es-EC-AndreaNeural', 'Andrea', 'Ecuador', 'mujer'],
    ['es-CO-GonzaloNeural', 'Gonzalo', 'Colombia', 'hombre'],
    ['es-MX-JorgeNeural', 'Jorge', 'México', 'hombre'],
    ['es-US-AlonsoNeural', 'Alonso', 'Latino (EE. UU.)', 'hombre'],
    ['es-AR-TomasNeural', 'Tomás', 'Argentina', 'hombre'],
    ['es-VE-SebastianNeural', 'Sebastián', 'Venezuela', 'hombre'],
    ['es-PE-AlexNeural', 'Alex', 'Perú', 'hombre'],
    ['es-CL-LorenzoNeural', 'Lorenzo', 'Chile', 'hombre'],
  ],
  en: [
    ['en-US-JennyNeural', 'Jenny', 'Estados Unidos', 'mujer', 'Recomendada · clara'],
    ['en-US-AriaNeural', 'Aria', 'Estados Unidos', 'mujer'],
    ['en-US-AvaNeural', 'Ava', 'Estados Unidos', 'mujer'],
    ['en-US-EmmaNeural', 'Emma', 'Estados Unidos', 'mujer'],
    ['en-US-GuyNeural', 'Guy', 'Estados Unidos', 'hombre'],
    ['en-US-AndrewNeural', 'Andrew', 'Estados Unidos', 'hombre'],
    ['en-US-BrianNeural', 'Brian', 'Estados Unidos', 'hombre'],
  ],
};
export const TV_ACC = { 'es-CO': 'Colombia', 'es-MX': 'México', 'es-US': 'EE. UU.', 'es-419': 'Latinoamérica', 'es-ES': 'España', 'es-AR': 'Argentina', 'es-CL': 'Chile', 'es-PE': 'Perú', 'es-VE': 'Venezuela', 'es-EC': 'Ecuador', 'es-UY': 'Uruguay', 'es-BO': 'Bolivia', 'es-CR': 'Costa Rica', 'es-PR': 'Puerto Rico', 'es-DO': 'Rep. Dominicana', 'es-GT': 'Guatemala', 'es-PA': 'Panamá',
  'en-US': 'Estados Unidos', 'en-GB': 'Reino Unido', 'en-AU': 'Australia', 'en-CA': 'Canadá', 'en-IN': 'India', 'en-IE': 'Irlanda', 'en-NZ': 'Nueva Zelanda', 'en-ZA': 'Sudáfrica' };
export const TV = { lang: 'es', rows: [], live: null, liveFor: '', liveBusy: false, liveErr: '', cache: new Map(), fetches: 0, playing: '', audio: null, gen: 0 };
export const tvLangNorm = l => String(l || '').replace('_', '-').replace(/^([a-z]+)-([a-z0-9]+)$/i, (m, a, b) => a.toLowerCase() + '-' + (/^\d+$/.test(b) ? b : b.toUpperCase()));
export function tvDeviceVoices(tl) {
  if (!('speechSynthesis' in window)) return [];
  let all = []; try { all = speechSynthesis.getVoices() || []; } catch (e) {}
  const re = tl === 'es' ? /^es([-_]|$)/i : /^en([-_]|$)/i, pref = tl === 'es' ? ['es-CO', 'es-MX', 'es-US', 'es-419'] : ['en-US', 'en-GB'];
  const seen = new Set(), out = [];
  for (const v of all) { if (!v || !re.test(v.lang || '') || seen.has(v.name)) continue; seen.add(v.name); out.push(v); }
  const rank = v => { const i = pref.indexOf(tvLangNorm(v.lang)); return i < 0 ? (tvLangNorm(v.lang) === 'es-ES' ? 90 : 50) : i; };
  return out.sort((a, b) => rank(a) - rank(b) || String(a.name).localeCompare(String(b.name)));
}
export function tvRows(tl) {
  const az = TV_AZ[tl].map(([name, nick, acc, g, badge]) => ({ id: 'az:' + name, kind: 'az', name, nick, acc, g, badge, lang: name.slice(0, 5) }));
  const cur = tvPref(tl), ok = TV.live && TV.liveFor === tvLiveKey();
  const azF = ok ? az.filter(r => TV.live.has(r.name) || r.id === cur) : az;
  const dev = tvDeviceVoices(tl).map(v => ({ id: 'dev:' + v.name, kind: 'dev', name: v.name, nick: v.name, acc: TV_ACC[tvLangNorm(v.lang)] || tvLangNorm(v.lang), lang: tvLangNorm(v.lang), local: v.localService !== false }));
  return { az: azF, dev };
}
export const tvLiveKey = () => !azureReady() ? '' : azOwn() ? S.settings.azureRegion.trim().toLowerCase() + '|' + hashStr(S.settings.azureKey.trim()) : 'tuki|shared';
export async function tvLoadLive() {
  const k = tvLiveKey(); if (!k || TV.liveBusy || (TV.liveFor === k && (TV.live || TV.liveErr)) || navigator.onLine === false) return;
  TV.liveBusy = true; TV.liveFor = k; TV.live = null; TV.liveErr = '';
  try {
    const r = await azFetch('tts.speech.microsoft.com', '/cognitiveservices/voices/list');
    if (!r.ok) throw await httpErr(r);
    const list = await r.json(); if (!Array.isArray(list) || !list.length) throw new Error('lista vacía');
    TV.live = new Set(list.map(v => v && v.ShortName).filter(Boolean));
  } catch (e) { TV.liveErr = tvErr(e); }
  finally { TV.liveBusy = false; if ($('#tvBody')) tvRenderBody(); }
}
export function tvErr(e) {
  const st = e && e.status, m = (e && e.message) || '';
  if (navigator.onLine === false || e instanceof TypeError || /Failed to fetch|NetworkError|Load failed/i.test(m)) return 'No pude conectar con Azure (sin internet o región incorrecta).';
  if (st === 401 || st === 403) return 'Azure no aceptó tu clave: revisa la clave y la región en «Evaluación avanzada con Azure».';
  if (st === 429) return 'Llegaste al límite gratis de Azure por ahora (plan F0). Intenta más tarde.';
  if (e && e.name === 'NotAllowedError') return 'El navegador no dejó reproducir el audio.';
  return 'Azure no pudo crear la voz' + (st ? ' (' + st + ')' : '') + '.';
}
export const tvMsg = t => { const m = $('#tvMsg'); if (m) m.textContent = t || ''; };
export function tvBtns() {
  $$('.tvplay').forEach(b => { const r = TV.rows[+b.dataset.play], on = !!r && r.id === TV.playing; b.classList.toggle('playing', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.textContent = on ? '⏹ Detener' : '▶ Escuchar'; });
}
export function tvStop() {
  TV.gen++; TV.playing = '';
  if (TV.audio) { try { TV.audio.pause(); } catch (e) {} TV.audio = null; }
  try { stopAudio(); } catch (e) {}
  try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch (e) {}
  tvBtns();
}
export function tvRate(tl) { return ttsRate(false, tl === 'es' ? 'es' : undefined, chatMul()); }
export function tvDevice(name, tl, text, rate, done) {
  if (!('speechSynthesis' in window)) { tvMsg('Este navegador no tiene voces instaladas.'); return done(); }
  let v = null; try { v = name ? (speechSynthesis.getVoices() || []).find(x => x.name === name) : null; } catch (e) {}
  if (!v) v = tl === 'es' ? pickEsVoice() : pickVoice();
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text); u.lang = v ? v.lang : (tl === 'es' ? 'es-CO' : 'en-US'); try { if (v) u.voice = v; } catch (e) {}
  u.rate = rate; u.onend = done; u.onerror = done;
  window.__tvLast = { text, lang: u.lang, voice: v ? v.name : '', rate, kind: 'dev' };
  speechSynthesis.speak(u);
}
export async function tvPlay(i) {
  const r = TV.rows[i]; if (!r) return;
  if (TV.playing === r.id) return tvStop();
  tvStop(); const my = ++TV.gen, tl = TV.lang, text = TV_SAMPLE[tl], rate = tvRate(tl);
  TV.playing = r.id; tvBtns(); tvMsg('');
  const done = () => { if (my !== TV.gen) return; TV.playing = ''; TV.audio = null; tvBtns(); };
  if (r.kind !== 'az') return tvDevice(r.name, tl, text, rate, done);
  try {
    if (!azureReady()) { const e = new Error('sin clave'); e.status = 401; throw e; }
    const ck = r.name + '|' + rate.toFixed(2) + '|' + text; let blob = TV.cache.get(ck);
    if (!blob) { TV.fetches++; blob = await azureTTS(text, rate, tl, r.name); TV.cache.set(ck, blob); }
    if (my !== TV.gen) return;
    const url = URL.createObjectURL(blob), a = new Audio(url); TV.audio = a;
    window.__tvLast = { text, voice: r.name, rate, kind: 'az' };
    a.onended = () => { URL.revokeObjectURL(url); done(); };
    await a.play();
  } catch (e) {
    if (my !== TV.gen) return;
    tvMsg('⚠️ ' + tvErr(e) + ' Te lo leo con la voz del teléfono.');
    tvDevice('', tl, text, rate, done);
  }
}
export function tvSelect(id, tl = TV.lang) {
  id = String(id || '');
  const k = tl === 'es' ? 'tukiVoiceEs' : 'tukiVoiceEn';
  S.settings[k] = id;
  if (id.startsWith('az:') && tl === 'es') S.settings.azureVoiceEs = id.slice(3);
  TTS.warned = false; save();
  const row = TV.rows.find(r => r.id === id);
  $$('.tvrow').forEach(el => el.classList.toggle('sel', el.dataset.id === id));
  const who = id ? (row ? row.nick + ' (' + row.acc + ')' : id.replace(/^(az|dev):/, '')) : 'automática';
  toast('✅ Voz de Tuki ' + (tl === 'es' ? 'en español' : 'en inglés') + ': ' + who, 2200);
  const note = id.startsWith('az:') && !azureReady() ? ' Mientras no haya clave de Azure, uso la voz del teléfono.' : '';
  tvMsg('Guardada como voz predeterminada de Tuki.' + note);
}
export function tvRowHTML(r, i, cur, dis) {
  return `<div class="tvrow ${r.id === cur ? 'sel' : ''} ${dis ? 'dis' : ''}" data-id="${esc(r.id)}"><label class="tvl"><input type="radio" name="tvSel" value="${i}" ${r.id === cur ? 'checked' : ''} ${dis ? 'disabled' : ''}><span class="tvn"><b>${esc(r.nick)}</b><small>${esc(r.acc)}${r.g ? ' · ' + r.g : ''} · ${esc(r.kind === 'az' ? r.name : r.lang)}</small>${r.badge ? `<span class="pill tvrec">${esc(r.badge)}</span>` : ''}</span></label><button class="btn ghost sm tvplay" data-play="${i}" aria-pressed="false" ${dis ? 'disabled' : ''} aria-label="Escuchar ${esc(r.nick)}">▶ Escuchar</button></div>`;
}
export function tvRenderBody() {
  const box = $('#tvBody'); if (!box) return;
  const tl = TV.lang, cur = tvPref(tl), { az, dev } = tvRows(tl), ready = azureReady();
  TV.rows = [{ id: '', kind: 'auto' }, ...az, ...dev];
  $$('[data-tvl]').forEach(b => { const on = b.dataset.tvl === tl; b.classList.toggle('active', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); });
  let live = '';
  if (ready) live = TV.liveBusy ? '<p class="small muted">Comprobando qué voces tiene tu región…</p>'
    : TV.live && TV.liveFor === tvLiveKey() ? `<p class="small muted">✓ Lista comprobada con tu región (${esc(azOwn() ? S.settings.azureRegion.trim().toLowerCase() : AZT.region)}).</p>`
    : TV.liveErr ? `<p class="small muted">No pude comprobar la lista en vivo (${esc(TV.liveErr)}). Muestro la lista oficial.</p>` : '';
  const missing = cur.startsWith('dev:') && !dev.some(r => r.id === cur) ? `<p class="small tvhint">📱 La voz «${esc(cur.slice(4))}» no está en este dispositivo: Tuki usa la mejor voz disponible.</p>` : '';
  const devSec = `<h4 class="tvh">📱 Voces de tu teléfono (gratis, sin clave)</h4>${missing}` + (dev.length ? dev.map(r => tvRowHTML(r, TV.rows.indexOf(r), cur, false)).join('')
    : `<p class="small muted">Tu ${'speechSynthesis' in window ? 'teléfono aún no muestra voces en ' + (tl === 'es' ? 'español' : 'inglés') + '. Si acabas de abrir la app, espera un momento; en Android puedes instalar voces en Ajustes › Texto a voz.' : 'navegador no tiene voces instaladas.'}</p>`);
  const autoDesc = tl === 'es' ? (ready ? 'Voz neural Salomé (colombiana) activa' : 'Mejor voz en español del teléfono') : (ready ? 'Voz neural Jenny (alta calidad) activa' : 'Voz en inglés del teléfono');
  box.innerHTML = `<div class="tvrow ${cur ? '' : 'sel'}" data-id=""><label class="tvl"><input type="radio" name="tvSel" value="0" ${cur ? '' : 'checked'}><span class="tvn"><b>Automática</b><small>${autoDesc}</small></span></label></div>
    <h4 class="tvh">☁️ Voces Azure ${azShared() ? '(gratis con tu cuenta)' : (azOwn() ? '(con tu clave)' : '')}</h4>
    ${ready ? live : (
      !fbSignedIn() ? `<div class="tvhint" style="background:var(--card-hover, rgba(0,0,0,0.03));padding:12px;border-radius:12px;border:1px solid var(--border, rgba(0,0,0,0.08));margin-bottom:10px">
        <div style="font-weight:700;margin-bottom:4px">✨ Desbloquea las voces naturales de Azure gratis</div>
        <div class="small muted" style="margin-bottom:10px">Inicia sesión con tu cuenta de Google para usar gratis las voces humanas de alta calidad (Salomé colombiana, Jenny, etc.) con el cupo diario de Tuki.</div>
        <div class="row wrap" style="gap:8px">
          <button class="btn gbtn sm" id="tvLoginGoogle"><span class="g">G</span> Continuar con Google</button>
          <button class="btn ghost sm" id="tvGoAz">Tengo mi propia clave</button>
        </div>
      </div>` : `<p class="small tvhint">🔑 Para usarlas agrega tu clave y región gratis de Azure (plan F0) en «Evaluación avanzada con Azure». <button class="btn ghost sm" id="tvGoAz">Ir a la clave</button></p>`
    )}
    ${az.map(r => tvRowHTML(r, TV.rows.indexOf(r), cur, !ready)).join('')}
    ${devSec}`;
  $$('input[name=tvSel]', box).forEach(inp => inp.onchange = () => { const r = TV.rows[+inp.value]; if (r) tvSelect(r.id, tl); });
  $$('.tvplay', box).forEach(b => b.onclick = () => tvPlay(+b.dataset.play));
  const go = $('#tvGoAz', box); if (go) go.onclick = () => { const k = $('#azKey'); if (k) { k.scrollIntoView({ block: 'center', behavior: 'smooth' }); k.focus({ preventScroll: true }); } };
  const bG = $('#tvLoginGoogle', box);
  if (bG) bG.onclick = async () => {
    bG.disabled = true;
    try { await fbGoogle(); render(); }
    catch (e) { toast(authErr(e)); }
    finally { if (document.body.contains(bG)) bG.disabled = false; }
  };
  tvBtns();
  if (ready) tvLoadLive();
}
export function tvCardHTML() {
  return `<div class="card" id="tvCard"><h3>🗣️ Voz de Tuki <span class="pill">Gratis</span></h3>
    <p class="small muted">Elige cómo suena Tuki y toca <b>▶ Escuchar</b> para oír un ejemplo (a la velocidad «${esc(TUTOR_SPEEDS[tutorSpeed()].name)}»). La voz elegida se usa en el chat, Traduce y completa, Práctica diaria, las lecciones y la repetición lenta.</p>
    <div class="seg tvseg" role="tablist" aria-label="Idioma de la voz"><button data-tvl="es" role="tab">Español (explicaciones)</button><button data-tvl="en" role="tab">Inglés (frases)</button></div>
    <div id="tvBody"></div>
    <div id="tvMsg" class="small" role="status" aria-live="polite" style="margin-top:6px"></div>
    <p class="small muted" id="tvHelp" style="margin-top:8px">💡 Todo es gratis: las voces del teléfono no usan internet ni clave. Las voces Azure usan tu recurso gratuito <b>F0</b>, que incluye <b>0,5 millones de caracteres de voz neural al mes</b> (precios oficiales de Microsoft, verificado el 27 sep 2026). Tuki guarda en memoria cada ejemplo que escuchas para no gastar de nuevo.</p>
  </div>`;
}
if ('speechSynthesis' in window) { try { speechSynthesis.addEventListener('voiceschanged', () => { if (TAB === 'settings' && $('#tvBody')) tvRenderBody(); }); } catch (e) {} }

export const OWNER_EMAIL = 'jrlopez6542@gmail.com', PROF_LOCAL = 'tukiSpeak.prof', FBK_LOCAL = 'tukiSpeak.fbkLast', FBK_WAIT = 10 * 60e3, PROF_EVERY = 3600e3;
export const isAdmin = () => !!(FB.user && FB.user.verified && FB.user.email.toLowerCase() === OWNER_EMAIL && ['google.com', 'password'].includes(FB.user.provider));
export const coDay = (t = Date.now()) => new Date(t - 5 * 3600e3).toISOString().slice(0, 10); // día de Colombia, igual que la API
export const tsMs = v => v && typeof v.toMillis === 'function' ? v.toMillis() : (typeof v === 'number' ? v : 0);
export const fsCode = e => String(e && e.code || '').replace(/^firestore\//, '');
export const RULES_MSG = 'Esta función se activa cuando se publiquen las reglas nuevas de Firestore. Inténtalo más tarde.';
/* Perfil (profiles/{uid}): al iniciar sesión y como máximo 1 escritura por hora (o si cambia la versión de la app) */
export let _profBusy = false;
export async function profileTouch() {
  if (!FB.user || !FB.F || !FB.db || _profBusy) return;
  const uid = FB.user.uid, m = lsGet(PROF_LOCAL, {}), last = m[uid] || {};
  if (Date.now() - (last.t || 0) < PROF_EVERY && last.v === APP_VERSION) return;
  _profBusy = true;
  try {
    const F = FB.F, ref = F.doc(FB.db, 'profiles', uid);
    const d = { name: String(FB.user.name || '').slice(0, 100), email: String(FB.user.email || '').slice(0, 200), provider: FB.user.provider === 'google.com' ? 'google.com' : 'password',
      app: APP_VERSION, mode: azOwn() || S.settings.geminiKey || S.settings.openaiKey ? 'own' : 'shared', lastActive: F.serverTimestamp() };
    m[uid] = { t: Date.now(), v: APP_VERSION }; lsSet(PROF_LOCAL, m);
    try { await F.updateDoc(ref, d); }
    catch (e) { if (!['not-found', 'permission-denied'].includes(fsCode(e))) throw e; await F.setDoc(ref, { ...d, firstSeen: F.serverTimestamp() }); } // aún no existe: se crea
  } catch (e) { /* sin reglas publicadas, sin red o SDK viejo: se reintenta en la próxima hora, la app sigue igual */ }
  finally { _profBusy = false; }
}

export function openFeedback() {
  if (!FB.user) return toast('Inicia sesión en «Cuenta» para enviar comentarios.', 3500);
  let stars = 0;
  modal(`<h2>💬 Enviar comentarios</h2>
    <div class="fbk-stars" id="fbkStars" role="radiogroup" aria-label="Calificación">${[1, 2, 3, 4, 5].map(n => `<button type="button" data-st="${n}" role="radio" aria-checked="false" aria-label="${n} de 5">★</button>`).join('')}</div>
    <textarea class="field" id="fbkText" rows="5" maxlength="1000" placeholder="¿Qué te gusta? ¿Qué mejorarías?"></textarea>
    <div class="small muted" id="fbkCount" style="text-align:right">0/1000</div>
    <div class="ac-msg small" id="fbkMsg" role="status"></div>
    <div class="row"><button class="btn ghost block" data-x>Cancelar</button><button class="btn primary block" id="fbkSend">Enviar</button></div>`, (el, close) => {
    const msg = (t, err) => { const m = $('#fbkMsg', el); m.textContent = t; m.className = 'ac-msg small ' + (err ? 'err' : 'ok'); };
    $('[data-x]', el).onclick = close;
    $$('[data-st]', el).forEach(b => b.onclick = () => { stars = +b.dataset.st; msg(''); $$('[data-st]', el).forEach(x => { const on = +x.dataset.st <= stars; x.classList.toggle('on', on); x.setAttribute('aria-checked', String(+x.dataset.st === stars)); }); });
    const ta = $('#fbkText', el); ta.oninput = () => { $('#fbkCount', el).textContent = ta.value.length + '/1000'; };
    $('#fbkSend', el).onclick = async () => {
      const text = ta.value.trim().slice(0, 1000), wait = FBK_WAIT - (Date.now() - (+lsGet(FBK_LOCAL, 0) || 0));
      if (!stars) return msg('Elige de 1 a 5 estrellas.', true);
      if (wait > 0) return msg(`Ya enviaste un comentario hace poco. Podrás enviar otro en ${Math.ceil(wait / 60e3)} min.`, true);
      if (!FB.user || !FB.F) return msg('Inicia sesión en «Cuenta» para enviar comentarios.', true);
      const b = $('#fbkSend', el); b.disabled = true; msg('⏳ Enviando…');
      try {
        const F = FB.F;
        await F.addDoc(F.collection(FB.db, 'feedback'), { uid: FB.user.uid, email: String(FB.user.email || '').slice(0, 200), name: String(FB.user.name || '').slice(0, 100), stars, text, version: APP_VERSION, createdAt: F.serverTimestamp() });
        lsSet(FBK_LOCAL, Date.now()); close(); toast('¡Gracias! Tu comentario ayuda a mejorar Tuki.', 3500);
      } catch (e) { b.disabled = false; msg('⚠️ ' + (fsCode(e) === 'permission-denied' ? RULES_MSG : authErr(e)), true); }
    };
  });
}
/* Panel de administrador */

export const AD = { data: null, busy: false };
export const PROV_ES = { 'google.com': 'Google', password: 'Correo' };
export const fmtDT = ms => ms ? new Date(ms).toLocaleString('es-CO', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—';
export async function adminLoad() {
  const F = FB.F, db = FB.db, today = coDay(), from = coDay(Date.now() - 6 * 86400e3);
  const safe = p => p.then(r => ({ ok: r }), e => ({ err: e }));
  const [pr, qu, fb] = await Promise.all([
    safe(F.getDocs(F.query(F.collection(db, 'profiles'), F.limit(1000)))),
    safe(F.getDocs(F.query(F.collection(db, 'quota'), F.where(F.documentId(), '>=', from + '_'), F.where(F.documentId(), '<', today + '_\uf8ff'), F.limit(5000)))),
    safe(F.getDocs(F.query(F.collection(db, 'feedback'), F.orderBy('createdAt', 'desc'), F.limit(300))))]);
  const rows = r => r.ok ? r.ok.docs.map(d => ({ id: d.id, ...d.data() })) : null;
  return { today, from, at: Date.now(), profiles: rows(pr), quota: rows(qu), feedback: rows(fb), errs: [pr, qu, fb].map(r => r.err ? fsCode(r.err) || 'error' : '') };
}
export function adminBody() {
  const D = AD.data; if (!D) return '';
  if (D.errs.every(e => e)) return `<div class="msg err small">⚠️ ${D.errs.includes('permission-denied') ? 'Todavía no se pueden leer los datos: publica las reglas nuevas de Firestore en la consola de Firebase.' : 'No se pudieron cargar los datos. Revisa tu conexión e inténtalo de nuevo.'}</div>`;
  const P = D.profiles || [], Q = D.quota || [], FBK = D.feedback || [];
  const use = {}; // uid -> {t:[g,l,a], w:[g,l,a]}
  Q.forEach(q => { const i = q.id.indexOf('_'), day = q.id.slice(0, i), uid = q.id.slice(i + 1), u = use[uid] = use[uid] || { t: [0, 0, 0], w: [0, 0, 0] }, v = [+q.gemini || 0, +q.live || 0, +q.azure || 0];
    v.forEach((n, k) => { u.w[k] += n; if (day === D.today) u.t[k] += n; }); });
  const byUid = Object.fromEntries(P.map(p => [p.id, p]));
  const activeToday = new Set([...P.filter(p => coDay(tsMs(p.lastActive)) === D.today).map(p => p.id), ...Object.keys(use).filter(u => use[u].t.some(n => n))]).size;
  const avg = FBK.length ? (FBK.reduce((s, f) => s + (+f.stars || 0), 0) / FBK.length).toFixed(1).replace('.', ',') : '—';
  const who = uid => { const p = byUid[uid]; return p ? esc(p.name || p.email || uid) : `<span class="muted">${esc(uid)} (sin perfil aún)</span>`; };
  const trip = a => a.join(' · ');
  const err = i => D.errs[i] ? `<div class="msg err small">⚠️ ${D.errs[i] === 'permission-denied' ? 'Sin permiso: publica las reglas nuevas de Firestore.' : 'No se pudo cargar.'}</div>` : '';
  const users = [...P].sort((a, b) => tsMs(b.lastActive) - tsMs(a.lastActive));
  const uids = [...new Set([...users.map(p => p.id), ...Object.keys(use)])];
  const tot = { t: [0, 0, 0], w: [0, 0, 0] }; Object.values(use).forEach(u => [0, 1, 2].forEach(k => { tot.t[k] += u.t[k]; tot.w[k] += u.w[k]; }));
  return `<div class="ad-kpis"><div class="kpi"><b id="adUsers">${P.length}</b><span>Usuarios</span></div><div class="kpi"><b id="adActive">${activeToday}</b><span>Activos hoy</span></div><div class="kpi"><b id="adAvg">${avg}</b><span>⭐ Promedio</span></div></div>
    <h4>Usuarios registrados</h4>${err(0)}
    <div class="ad-list" id="adUserList">${users.map(p => `<div class="ad-item"><b>${esc(p.name || '—')}</b> <span class="muted">${esc(p.email || '')}</span>
      <div class="small muted">${esc(PROV_ES[p.provider] || p.provider || '—')} · Primer ingreso: ${esc(fmtDT(tsMs(p.firstSeen)))} · Última actividad: ${esc(fmtDT(tsMs(p.lastActive)))} · v${esc(p.app || '?')}</div></div>`).join('') || '<p class="small muted">Aún no hay perfiles.</p>'}</div>
    <h4>Uso de las claves de Tuki</h4><div class="small muted">Gemini · Live · Azure — hoy y últimos 7 días (${esc(D.from)} a ${esc(D.today)})</div>${err(1)}
    <table class="ad-tbl" id="adUse"><thead><tr><th>Usuario</th><th>Hoy</th><th>7 días</th></tr></thead><tbody>
    ${uids.map(uid => { const u = use[uid], p = byUid[uid]; const own = !u && p && p.mode === 'own';
      return `<tr><td>${who(uid)}</td>${own ? '<td colspan="2" class="muted">claves propias</td>' : `<td>${u ? trip(u.t) : '0 · 0 · 0'}</td><td>${u ? trip(u.w) : '0 · 0 · 0'}</td>`}</tr>`; }).join('')}
    <tr class="ad-tot"><td><b>Total</b></td><td><b>${trip(tot.t)}</b></td><td><b>${trip(tot.w)}</b></td></tr></tbody></table>
    <h4>Comentarios</h4>${err(2)}
    <div class="ad-list" id="adFeedback">${FBK.map(f => `<div class="ad-item"><div class="ad-st" aria-label="${+f.stars || 0} de 5">${'★'.repeat(Math.max(0, Math.min(5, +f.stars || 0)))}<span class="muted">${'★'.repeat(5 - Math.max(0, Math.min(5, +f.stars || 0)))}</span></div>
      <div class="ad-txt">${esc(f.text || '')}</div><div class="small muted">${esc(f.name || f.email || f.uid || '')}${f.name && f.email ? ' · ' + esc(f.email) : ''} · ${esc(fmtDT(tsMs(f.createdAt)))} · v${esc(f.version || '?')}</div></div>`).join('') || '<p class="small muted">Aún no hay comentarios.</p>'}</div>
    <div class="small muted" style="margin-top:8px">Actualizado: ${esc(fmtDT(D.at))}</div>`;
}
export const adminHTML = () => isAdmin() ? `<div class="card" id="adminCard"><h3>👑 Panel de administrador</h3>
  <button class="btn ${AD.data ? 'ghost' : 'primary'}" id="adLoad" ${AD.busy ? 'disabled' : ''}>${AD.busy ? '⏳ Cargando…' : AD.data ? '🔄 Actualizar' : '📊 Ver datos'}</button><div id="adBody">${adminBody()}</div></div>` : '';
export function bindAdmin(root) {
  const b = $('#adLoad', root || document); if (!b) return;
  b.onclick = async () => {
    if (AD.busy || !isAdmin()) return; AD.busy = true; adminRefresh();
    try { await FB.ready; AD.data = await adminLoad(); } catch (e) { AD.data = { errs: ['error', 'error', 'error'] }; }
    AD.busy = false; adminRefresh();
  };
}
export function adminRefresh() {
  const a = $('#adminCard'), h = adminHTML();
  if (!h) { if (a) a.remove(); AD.data = null; return; }
  if (a) a.outerHTML = h; else { const ac = $('#acctCard'); if (!ac) return; ac.insertAdjacentHTML('afterend', h); }
  bindAdmin(document);
}
export const fbkCardHTML = () => `<div class="card" id="fbkCard"><button class="btn ghost block" id="fbkOpen">💬 Enviar comentarios</button></div>`;

export function srsStats() {
  const d = S.deck || {}, now = Date.now(), all = Object.values(d);
  const due = all.filter(c => (c.due || 0) <= now);
  const learn = all.filter(c => (c.reps || 0) < 3);
  const mature = all.filter(c => (c.reps || 0) >= 3);
  return { total: all.length, due: due.length, learn: learn.length, mature: mature.length };
}

export function syncHardWordsToDeck() {
  const hw = hardWords();
  const items = [];
  hw.forEach(h => {
    const k = 'hw:' + h.w.toLowerCase();
    if (!S.deck[k]) {
      items.push({ key: k, en: h.w, es: h.note || 'Palabra difícil para ti', kind: 'word', lesson: h.sid || 'hard' });
    }
  });
  if (items.length) addToDeck(items);
}

// 2. MISIONES DE CONVERSACIÓN POR ESCENARIOS DE LA VIDA REAL (ROLEPLAY GUIADO)

export const MISSION_SCENARIOS = {
  coffee: {
    desc: 'a friendly barista at a specialty coffee shop in London. The learner is a customer. Keep it realistic, conversational and polite.',
    es: '☕ Pedir en cafetería',
    goals: [
      'Saludar y pedir una bebida (ej. latte con leche de avena o almendra)',
      'Especificar tu preferencia de azúcar o hielo',
      'Preguntar el precio total y pagar con tarjeta'
    ]
  },
  hotel: {
    desc: 'a front desk receptionist at a modern hotel in Miami. The learner is an arriving guest checking in.',
    es: '🏨 Check-in en el hotel',
    goals: [
      'Dar tu nombre de reserva y mostrar pasaporte',
      'Pedir una habitación en piso alto o tranquila',
      'Preguntar la hora del desayuno y la clave del Wi-Fi'
    ]
  },
  airport_in: {
    desc: 'a professional US Customs & Border Protection officer at JFK Airport. The learner is a foreign visitor arriving.',
    es: '🛂 Inmigración (Aeropuerto)',
    goals: [
      'Declarar con claridad el motivo de tu viaje (turismo, negocios o estudio)',
      'Indicar cuánto tiempo te quedarás (días/semanas)',
      'Explicar en qué hotel o dirección te vas a hospedar'
    ]
  },
  directions: {
    desc: 'a friendly local pedestrian on a street in Chicago. The learner is lost and asking for directions.',
    es: '🗺️ Pedir direcciones',
    goals: [
      'Disculparte amablemente ("Excuse me...") y preguntar por la estación más cercana',
      'Preguntar si queda a distancia caminable o es mejor autobús/taxi',
      'Agradecer cordialmente y despedirte'
    ]
  },
  doctor: {
    desc: 'a triage nurse or doctor at an urgent care clinic in Boston. The learner is a patient describing symptoms. Keep it empathetic and professional.',
    es: '🩺 Consulta médica',
    goals: [
      'Describir tus síntomas principales (dolor de cabeza, fiebre, dolor de garganta o tos)',
      'Responder si tienes alergias a medicamentos o si tomas algo actualmente',
      'Preguntar la dosis de la medicina recetada y si necesitas reposo'
    ]
  },
  job_interview: {
    desc: 'an HR hiring manager at an international tech company in Austin. The learner is a job candidate. Keep it professional, encouraging and structured.',
    es: '💼 Entrevista de trabajo',
    goals: [
      'Presentarte profesionalmente y resumir tu experiencia laboral',
      'Hablar de tu mayor fortaleza y cómo resuelves problemas bajo presión',
      'Preguntar sobre el equipo de trabajo y los siguientes pasos'
    ]
  },
  supermarket: {
    desc: 'a friendly grocery store employee at a supermarket in Toronto. The learner is a shopper asking for assistance.',
    es: '🛒 En el supermercado',
    goals: [
      'Preguntar amablemente en qué pasillo encontrar un producto (leche, pan, café)',
      'Consultar si tienen descuentos u ofertas con tarjeta de cliente',
      'Pedir una bolsa biodegradable y solicitar el recibo'
    ]
  },
  taxi_uber: {
    desc: 'a friendly rideshare/taxi driver in New York City. The learner is a passenger on the way to their destination.',
    es: '🚕 En el taxi o Uber',
    goals: [
      'Confirmar el destino y pedir amablemente ajustar el aire acondicionado o música',
      'Preguntar cuál es la ruta más rápida para evitar el tráfico',
      'Pedir que se detenga con cuidado en la esquina o entrada y agradecer'
    ]
  }
};

Object.entries(MISSION_SCENARIOS).forEach(([k, s]) => {
  SCENARIOS[k] = s.desc;
  SCEN_ES[k] = s.es;
});

// Alias retrocompatibles
SCENARIOS.interview = MISSION_SCENARIOS.job_interview.desc;
SCEN_ES.interview = MISSION_SCENARIOS.job_interview.es;
MISSION_SCENARIOS.interview = MISSION_SCENARIOS.job_interview;

SCENARIOS.shopping = MISSION_SCENARIOS.supermarket.desc;
SCEN_ES.shopping = MISSION_SCENARIOS.supermarket.es;
MISSION_SCENARIOS.shopping = MISSION_SCENARIOS.supermarket;

export function missionGoalsHTML(scenKey) {
  const m = MISSION_SCENARIOS[scenKey];
  if (!m) return '';
  const st = (S.missions = S.missions || {})[scenKey] || [false, false, false];
  const doneCount = st.filter(Boolean).length;
  return `<div class="mission-box" id="missionBox">
    <div class="row between" style="margin-bottom:6px">
      <b id="missionGoalTitle">🎯 Objetivos de la misión (${doneCount}/${m.goals.length})</b>
      <span class="small muted" id="missionStatus">${doneCount === m.goals.length ? '✅ ¡Cumplida!' : 'En progreso'}</span>
    </div>
    ${m.goals.map((g, i) => `<label class="mission-item">
      <input type="checkbox" data-mi="${i}" ${st[i] ? 'checked' : ''}>
      <span style="${st[i] ? 'text-decoration:line-through;opacity:.7' : ''}">${esc(g)}</span>
    </label>`).join('')}
  </div>`;
}

export function bindMissionGoals(root) {
  const box = $('#missionBox', root || document);
  if (!box) return;
  const m = MISSION_SCENARIOS[CHAT.scen];
  $$('[data-mi]', box).forEach(cb => {
    cb.onchange = e => {
      const idx = +cb.dataset.mi;
      const st = (S.missions = S.missions || {})[CHAT.scen] || [false, false, false];
      st[idx] = cb.checked;
      S.missions[CHAT.scen] = st;
      save();
      const doneCount = st.filter(Boolean).length;
      const allDone = m && doneCount === m.goals.length;
      const statEl = $('#missionStatus', box);
      const titleEl = $('#missionGoalTitle', box);
      if (statEl) statEl.textContent = allDone ? '✅ ¡Cumplida!' : 'En progreso';
      if (titleEl && m) titleEl.textContent = `🎯 Objetivos de la misión (${doneCount}/${m.goals.length})`;
      if (allDone) {
        beep('fanfare');
        canvasConfetti();
        addXP(15);
        toast('🎉 ¡Misión completada! +15 XP', 3000);
      } else {
        beep('pop');
      }
      const label = cb.nextElementSibling;
      if (label) {
        label.style.textDecoration = cb.checked ? 'line-through' : 'none';
        label.style.opacity = cb.checked ? '.7' : '1';
      }
    };
  });
}

export function openMissionsModal() {
  const validKeys = [
    'coffee', 'hotel', 'airport_in', 'directions',
    'doctor', 'job_interview', 'supermarket', 'taxi_uber'
  ];
  const missions = (S.missions = S.missions || {});
  modal(`<h2>🎯 Misiones de Conversación Real</h2>
    <p class="muted small">Roleplay guiado en inglés con Tuki. Practica situaciones cotidianas con objetivos interactivos paso a paso:</p>
    <div class="wlist" style="margin-top:10px">
      ${validKeys.map(k => {
        const m = MISSION_SCENARIOS[k];
        if (!m) return '';
        const st = missions[k] || [false, false, false];
        const done = st.filter(Boolean).length;
        const allDone = done === m.goals.length;
        return `<div class="card pcard" style="padding:12px;margin-bottom:8px;align-items:flex-start">
          <div style="flex:1">
            <div class="row between">
              <h3 style="margin:0 0 4px">${esc(m.es)}</h3>
              <span class="pill ${allDone ? 'ok' : 'blue'}">${allDone ? '✅ Cumplida' : `${done}/${m.goals.length}`}</span>
            </div>
            <ul style="margin:6px 0 10px 18px;padding:0;font-size:12px;color:var(--mute);line-height:1.4">
              ${m.goals.map(g => `<li>${esc(g)}</li>`).join('')}
            </ul>
            <button class="btn primary sm" data-start-mission="${k}">Iniciar misión 🚀</button>
          </div>
        </div>`;
      }).join('')}
    </div>
    <button class="btn ghost block" data-x style="margin-top:10px">Cerrar</button>`, (el, close) => {
    $('[data-x]', el).onclick = close;
    $$('[data-start-mission]', el).forEach(btn => {
      btn.onclick = () => {
        const k = btn.dataset.startMission;
        close();
        enterMode(k);
      };
    });
  });
}

// 3. MODO SHADOWING GUIADO (ESCUCHA, IMITA Y GRABA)
export const SHADOW_BANK = [
  { id: 'sh1', lv: 'A1', en: "How's it going today?", es: '¿Cómo te va hoy?', cues: ["How's it → /haʊzɪt/", "going → /ɡoʊɪŋ/"], tip: 'Enlaza "How\'s" con "it" sin pausa intermedia.' },
  { id: 'sh2', lv: 'A1', en: 'Can I get a glass of water?', es: '¿Me das un vaso de agua?', cues: ['Can I → /kænaɪ/', 'glass of → /ɡlæsəv/'], tip: 'Une "can-I" y "glass-of" suavemente.' },
  { id: 'sh3', lv: 'A2', en: "What are you going to do this weekend?", es: '¿Qué vas a hacer este fin de semana?', cues: ['going to → gonna', 'this weekend'], tip: 'En habla natural rápida "going to" suena como "gonna".' },
  { id: 'sh4', lv: 'A2', en: "I've been working here for two years.", es: 'He estado trabajando aquí dos años.', cues: ["I've been → /aɪvbɪn/", "two years"], tip: 'La /v/ de "I\'ve" se apoya en el labio inferior.' },
  { id: 'sh5', lv: 'B1', en: "To be honest, that sounds like a great idea.", es: 'Para ser honesto, suena como una gran idea.', cues: ['sounds like → /saʊndzlaɪk/', 'great idea'], tip: 'Sube la entonación en "honest" y baja al terminar "idea".' },
  { id: 'sh6', lv: 'B1', en: "I didn't quite catch what you just said.", es: 'No alcancé a captar lo que acabas de decir.', cues: ["didn't quite", "what you → /wʌttʃuː/"], tip: 'La "t" de "what" se fusiona con "you" creando sonido /tʃ/.' },
  { id: 'sh7', lv: 'B2', en: "As far as I'm concerned, we should move forward.", es: 'Por lo que a mí respecta, deberíamos avanzar.', cues: ['as far as → /æzfɑːræz/', 'move forward'], tip: 'Mantén un flujo constante entre "as", "far" y "as".' },
  { id: 'sh8', lv: 'B2', en: "It completely slipped my mind, I apologize.", es: 'Se me pasó por completo, me disculpo.', cues: ['slipped my mind → /slɪptmaɪmaɪnd/'], tip: 'La terminación -ed de "slipped" suena como /t/ nítida.' }
];

export let shadowIndex = 0;
export function openShadowingModal() {
  const item = SHADOW_BANK[shadowIndex % SHADOW_BANK.length];
  modal(`<h2>🎙️ Modo Shadowing</h2>
    <p class="muted small">Escucha la frase nativa, fíjate en el ritmo y las uniones de palabras, y repítela al instante imitando la entonación.</p>
    <div class="shadow-wrap">
      <div class="row between">
        <span class="pill ok">Nivel ${item.lv}</span>
        <span class="muted small">${(shadowIndex % SHADOW_BANK.length) + 1} de ${SHADOW_BANK.length}</span>
      </div>
      <div class="shadow-phrase">${esc(item.en)}</div>
      <div class="muted">${esc(item.es)}</div>
      <div class="shadow-guide">
        ${item.cues.map(c => `<span class="shadow-cue">${esc(c)}</span>`).join('')}
      </div>
      <div class="small" style="color:var(--b-d)">💡 ${esc(item.tip)}</div>
      <div class="row" style="margin-top:6px">
        <button class="btn blue block" id="shSpkNormal">🔊 Velocidad normal</button>
        <button class="btn ghost block" id="shSpkSlow">🐢 Lento (0.75x)</button>
      </div>
    </div>
    <div style="text-align:center;margin:10px 0">
      <button class="btn primary" id="shMic" style="min-width:200px">🎤 Grabar e imitar</button>
      <div id="shResult" style="margin-top:10px" class="small"></div>
    </div>
    <div class="row between" style="margin-top:14px">
      <button class="btn ghost sm" id="shPrev">◀ Anterior</button>
      <button class="btn ghost sm" data-x>Cerrar</button>
      <button class="btn ghost sm" id="shNext">Siguiente ▶</button>
    </div>`, (el, close) => {
    $('[data-x]', el).onclick = close;
    $('#shSpkNormal', el).onclick = () => speak(item.en);
    $('#shSpkSlow', el).onclick = () => speak(item.en, true);
    $('#shPrev', el).onclick = () => { shadowIndex = (shadowIndex - 1 + SHADOW_BANK.length) % SHADOW_BANK.length; close(); openShadowingModal(); };
    $('#shNext', el).onclick = () => { shadowIndex = (shadowIndex + 1) % SHADOW_BANK.length; close(); openShadowingModal(); };
    const mic = $('#shMic', el), res = $('#shResult', el);
    mic.onclick = () => {
      doMic(mic, (alts, url, az) => {
        const r = az || scoreSpeech(item.en, alts);
        const pct = r.pct || 0;
        const col = pct >= 80 ? 'var(--g-d)' : pct >= 50 ? '#b27b00' : 'var(--r)';
        res.innerHTML = `<div style="font-size:18px;font-weight:900;color:${col}">Puntaje: ${pct}%</div>
          <div class="muted">Dijiste: «${esc(r.heard || '—')}»</div>
          ${pct >= 80 ? '<div style="color:var(--g-d);margin-top:4px">🌟 ¡Excelente ritmo y pronunciación! +10 XP</div>' : '<div class="muted" style="margin-top:4px">Escucha el modelo de nuevo y prueba a conectar las palabras.</div>'}`;
        if (pct >= 80) {
          beep('fanfare');
          addXP(10);
        } else {
          beep(pct >= 50 ? 'ok' : 'bad');
        }
      }, item.en);
    };
  });
}

// 4. MODO MANOS LIBRES / AUDIO CONTINUO (LISTEN & REPEAT EN BUCLE)
export const HANDS_FREE_BANK = [
  { id: 'hf1', cat: 'daily', en: "Could you please speak a little slower?", es: "¿Podrías hablar un poco más despacio, por favor?" },
  { id: 'hf2', cat: 'social', en: "How's everything going with your project?", es: "¿Cómo va todo con tu proyecto?" },
  { id: 'hf3', cat: 'restaurant', en: "I'd like to order a large coffee with almond milk.", es: "Me gustaría pedir un café grande con leche de almendras." },
  { id: 'hf4', cat: 'travel', en: "How long does it take to get to the airport by train?", es: "¿Cuánto tiempo toma llegar al aeropuerto en tren?" },
  { id: 'hf5', cat: 'work', en: "Let me know if you need any help with that task.", es: "Avísame si necesitas alguna ayuda con esa tarea." },
  { id: 'hf6', cat: 'daily', en: "Excuse me, where is the nearest pharmacy around here?", es: "Disculpe, ¿dónde está la farmacia más cercana por aquí?" },
  { id: 'hf7', cat: 'restaurant', en: "What do you recommend from today's special menu?", es: "¿Qué recomiendas del menú especial de hoy?" },
  { id: 'hf8', cat: 'social', en: "I didn't quite catch your name, could you repeat it?", es: "No alcancé a captar tu nombre, ¿podrías repetirlo?" },
  { id: 'hf9', cat: 'daily', en: "Could you say that one more time for me, please?", es: "¿Podrías decir eso una vez más para mí, por favor?" },
  { id: 'hf10', cat: 'work', en: "I completely agree with the points you just made.", es: "Estoy completamente de acuerdo con los puntos que acabas de mencionar." },
  { id: 'hf11', cat: 'shopping', en: "Do you have this jacket in a smaller size?", es: "¿Tienen esta chaqueta en una talla más pequeña?" },
  { id: 'hf12', cat: 'health', en: "I've had a bad headache since this morning.", es: "He tenido un fuerte dolor de cabeza desde esta mañana." },
  { id: 'hf13', cat: 'work', en: "Can we reschedule our sync for tomorrow morning?", es: "¿Podemos reprogramar nuestra reunión para mañana por la mañana?" },
  { id: 'hf14', cat: 'travel', en: "Excuse me, does this bus stop at Central Station?", es: "Disculpe, ¿este autobús para en la Estación Central?" },
  { id: 'hf15', cat: 'social', en: "That sounds like a fantastic idea to me!", es: "¡Eso me suena como una idea fantástica!" },
  { id: 'hf16', cat: 'daily', en: "Take your time, there is no rush whatsoever.", es: "Tómate tu tiempo, no hay ningún apuro en absoluto." },
  { id: 'hf17', cat: 'restaurant', en: "Could we please get the check when you have a chance?", es: "¿Podrías traernos la cuenta cuando tengas un momento, por favor?" },
  { id: 'hf18', cat: 'social', en: "It was really nice meeting you today.", es: "Fue un gran gusto conocerte hoy." },
  { id: 'hf19', cat: 'work', en: "Could you send me the details via email later?", es: "¿Podrías enviarme los detalles por correo más tarde?" },
  { id: 'hf20', cat: 'travel', en: "Could you drop me off at the next corner, please?", es: "¿Podrías dejarme en la siguiente esquina, por favor?" },
  { id: 'hf21', cat: 'social', en: "I'm really looking forward to seeing you this weekend.", es: "Tengo muchas ganas de verte este fin de semana." },
  { id: 'hf22', cat: 'shopping', en: "Is there any discount if I pay with cash today?", es: "¿Hay algún descuento si pago en efectivo hoy?" },
  { id: 'hf23', cat: 'daily', en: "Could you give me a hand with these heavy boxes?", es: "¿Podrías darme una mano con estas cajas pesadas?" },
  { id: 'hf24', cat: 'work', en: "Thanks a lot for pointing that out, I appreciate it.", es: "Muchas gracias por señalar eso, te lo agradezco." },
  { id: 'hf25', cat: 'social', en: "Have a wonderful rest of your day!", es: "¡Que tengas un maravilloso resto del día!" }
];

export let hfIndex = 0;
export let hfPlaying = false;
export let hfActive = false;
export let hfTimer = null;
export let hfInterval = null;
export let hfWakeLock = null;
export let hfCompleted = 0;
export let hfSpeed = 1.0;
export let hfPause = 4;
export let hfSource = 'daily';

export function getHfList() {
  if (hfSource === 'shadow') return SHADOW_BANK;
  if (hfSource === 'srs') {
    const deckItems = Object.values(S.deck || {}).filter(c => c.en && c.es);
    if (deckItems.length) return deckItems;
  }
  return HANDS_FREE_BANK;
}

export function openHandsFreeModal() {
  hfActive = true;
  hfPlaying = false;
  hfCompleted = 0;
  if (hfTimer) clearTimeout(hfTimer);
  if (hfInterval) clearInterval(hfInterval);
  stopAudio();

  const list = getHfList();
  const item = list[hfIndex % list.length] || HANDS_FREE_BANK[0];
  const srsCount = Object.values(S.deck || {}).filter(c => c.en && c.es).length;

  modal(`<h2>🎧 Modo Manos Libres</h2>
    <p class="muted small">Escucha y repite en bucle continuo con pausas inteligentes sin tocar la pantalla. Ideal para caminar, cocinar, viajar o entrenar.</p>

    <div class="row between small" style="margin-bottom:8px">
      <select class="field sm" id="hfSourceSelect" style="max-width:180px">
        <option value="daily" ${hfSource === 'daily' ? 'selected' : ''}>Cotidianas (${HANDS_FREE_BANK.length})</option>
        <option value="shadow" ${hfSource === 'shadow' ? 'selected' : ''}>Shadowing (${SHADOW_BANK.length})</option>
        ${srsCount ? `<option value="srs" ${hfSource === 'srs' ? 'selected' : ''}>Tarjetas SRS (${srsCount})</option>` : ''}
      </select>
      <span class="muted" id="hfCounter">${(hfIndex % list.length) + 1} de ${list.length}</span>
    </div>

    <div class="handsfree-container" id="hfBox">
      <div class="handsfree-status phase-paused" id="hfStatusBadge">
        <span>⏸ Listo para iniciar</span>
      </div>

      <div class="handsfree-phrase-en" id="hfEnText">
        ${esc(item.en)}
      </div>

      <div class="handsfree-phrase-es" id="hfEsText">
        ${esc(item.es)}
      </div>

      <div class="handsfree-meter">
        <div class="handsfree-meter-fill" id="hfMeterFill"></div>
      </div>
    </div>

    <div class="row between" style="margin-top:8px">
      <div class="row" style="gap:6px">
        <button class="chip ${hfSpeed === 1.0 ? 'active' : ''}" id="hfSpd1">1.0x</button>
        <button class="chip ${hfSpeed === 0.8 ? 'active' : ''}" id="hfSpdSlow">0.8x 🐢</button>
      </div>
      <div class="row" style="gap:6px">
        <span class="small muted">Pausa:</span>
        <button class="chip ${hfPause === 3 ? 'active' : ''}" data-p="3">3s</button>
        <button class="chip ${hfPause === 4 ? 'active' : ''}" data-p="4">4s</button>
        <button class="chip ${hfPause === 6 ? 'active' : ''}" data-p="6">6s</button>
      </div>
    </div>

    <div class="handsfree-controls">
      <button class="iconbtn" id="hfPrev" title="Anterior" style="font-size:20px;width:48px;height:48px">⏮</button>
      <button class="btn primary big-play" id="hfTogglePlay">
        <span id="hfPlayIcon">▶</span>
      </button>
      <button class="iconbtn" id="hfNext" title="Siguiente" style="font-size:20px;width:48px;height:48px">⏭</button>
    </div>

    <div class="row between small" style="margin-top:12px">
      <span class="pill" id="hfCompletedPill">🏆 ${hfCompleted} completadas</span>
      <button class="btn ghost sm" data-x>Cerrar</button>
    </div>`, (el, close) => {

    async function reqWake() {
      try { if ('wakeLock' in navigator && !hfWakeLock) hfWakeLock = await navigator.wakeLock.request('screen'); } catch(e){}
    }
    function relWake() {
      try { if (hfWakeLock) { hfWakeLock.release(); hfWakeLock = null; } } catch(e){}
    }

    function updateCardUI(cur) {
      const enEl = $('#hfEnText', el);
      const esEl = $('#hfEsText', el);
      const cntEl = $('#hfCounter', el);
      const l = getHfList();
      if (enEl) enEl.textContent = cur.en;
      if (esEl) {
        esEl.textContent = cur.es;
        esEl.classList.remove('highlight');
      }
      if (cntEl) cntEl.textContent = `${(hfIndex % l.length) + 1} de ${l.length}`;
    }

    function setBadge(text, phaseClass) {
      const badge = $('#hfStatusBadge', el);
      if (!badge) return;
      badge.className = `handsfree-status ${phaseClass}`;
      badge.innerHTML = `<span>${text}</span>`;
    }

    function setMeter(pct) {
      const fill = $('#hfMeterFill', el);
      if (fill) fill.style.width = `${Math.min(100, Math.max(0, pct))}%`;
    }

    function stepEn() {
      if (!hfActive || !hfPlaying) return;
      if (hfTimer) clearTimeout(hfTimer);
      if (hfInterval) clearInterval(hfInterval);
      setMeter(0);

      const l = getHfList();
      const cur = l[hfIndex % l.length];
      updateCardUI(cur);
      setBadge('🔊 1. Escucha en inglés…', 'phase-en');

      speak(cur.en, hfSpeed < 1, () => {
        if (!hfActive || !hfPlaying) return;
        stepRepeat(cur);
      }, 'en', hfSpeed);
    }

    function stepRepeat(cur) {
      if (!hfActive || !hfPlaying) return;
      setBadge(`🗣️ 2. Tu turno: repite en voz alta (${hfPause}s)`, 'phase-repeat');

      const totalMs = hfPause * 1000;
      const start = Date.now();
      if (hfInterval) clearInterval(hfInterval);
      hfInterval = setInterval(() => {
        if (!hfActive || !hfPlaying) { clearInterval(hfInterval); return; }
        const elapsed = Date.now() - start;
        const pct = (elapsed / totalMs) * 100;
        setMeter(pct);
        if (elapsed >= totalMs) {
          clearInterval(hfInterval);
          stepEs(cur);
        }
      }, 80);
    }

    function stepEs(cur) {
      if (!hfActive || !hfPlaying) return;
      setMeter(100);
      setBadge('💬 3. Significado en español', 'phase-es');
      const esEl = $('#hfEsText', el);
      if (esEl) esEl.classList.add('highlight');

      speak(cur.es, false, () => {
        if (!hfActive || !hfPlaying) return;
        hfCompleted++;
        const pill = $('#hfCompletedPill', el);
        if (pill) pill.textContent = `🏆 ${hfCompleted} completadas`;

        if (hfCompleted > 0 && hfCompleted % 5 === 0) {
          addXP(5);
          toast('🎧 ¡Excelente constancia! +5 XP completados', 2600);
          beep('fanfare');
        }

        setBadge('⏭ Siguiente frase…', 'phase-en');
        if (hfTimer) clearTimeout(hfTimer);
        hfTimer = setTimeout(() => {
          if (!hfActive || !hfPlaying) return;
          const l = getHfList();
          hfIndex = (hfIndex + 1) % l.length;
          stepEn();
        }, 1200);
      }, 'es');
    }

    function togglePlay() {
      hfPlaying = !hfPlaying;
      const icon = $('#hfPlayIcon', el);
      if (hfPlaying) {
        if (icon) icon.textContent = '⏸';
        reqWake();
        stepEn();
      } else {
        if (icon) icon.textContent = '▶';
        if (hfTimer) clearTimeout(hfTimer);
        if (hfInterval) clearInterval(hfInterval);
        stopAudio();
        setMeter(0);
        setBadge('⏸ En pausa · Pulsa reproducir para continuar', 'phase-paused');
        relWake();
      }
    }

    $('#hfTogglePlay', el).onclick = togglePlay;

    $('#hfPrev', el).onclick = () => {
      const l = getHfList();
      hfIndex = (hfIndex - 1 + l.length) % l.length;
      if (hfPlaying) {
        stepEn();
      } else {
        updateCardUI(l[hfIndex]);
      }
    };

    $('#hfNext', el).onclick = () => {
      const l = getHfList();
      hfIndex = (hfIndex + 1) % l.length;
      if (hfPlaying) {
        stepEn();
      } else {
        updateCardUI(l[hfIndex]);
      }
    };

    $('#hfSourceSelect', el).onchange = e => {
      hfSource = e.target.value;
      hfIndex = 0;
      const l = getHfList();
      updateCardUI(l[0]);
      if (hfPlaying) stepEn();
    };

    $('#hfSpd1', el).onclick = () => {
      hfSpeed = 1.0;
      $('#hfSpd1', el).classList.add('active');
      $('#hfSpdSlow', el).classList.remove('active');
    };
    $('#hfSpdSlow', el).onclick = () => {
      hfSpeed = 0.8;
      $('#hfSpdSlow', el).classList.add('active');
      $('#hfSpd1', el).classList.remove('active');
    };

    $$('[data-p]', el).forEach(btn => {
      btn.onclick = () => {
        $$('[data-p]', el).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        hfPause = +btn.dataset.p || 4;
      };
    });

    const handleClose = () => {
      hfActive = false;
      hfPlaying = false;
      if (hfTimer) clearTimeout(hfTimer);
      if (hfInterval) clearInterval(hfInterval);
      stopAudio();
      relWake();
      close();
    };

    $('[data-x]', el).onclick = handleClose;

    setTimeout(() => {
      if (hfActive && !hfPlaying) togglePlay();
    }, 400);
  });
}

// 5. GUÍA VISUAL Y TIPS ANATÓMICOS EN ERRORES FONÉTICOS (SVG MOUTHS)

export const MOUTH_GUIDES = {
  'th': {
    title: 'Sonido /θ/ (think, three) y /ð/ (this, they)',
    expl: 'Coloca la punta de la lengua ligeramente entre los dientes incisivos superiores e inferiores. Para "think" solo sopla aire suave sin vibrar; para "this" añade vibración desde la garganta.',
    words: ['think', 'three', 'this', 'that', 'brother'],
    config: { t: 'dental', lips: 'spread', o: 0.25, v: 0, air: 1 }
  },
  'v': {
    title: 'Sonido /v/ (very, voice) vs /b/ (berry, boy)',
    expl: 'No juntes ambos labios como en español. Apoya suavemente los bordes de los dientes incisivos superiores sobre el labio inferior y haz vibrar tus cuerdas vocales ("vvv").',
    words: ['very', 'voice', 'travel', 'live', 'leave'],
    config: { t: 'rest', lips: 'lipteeth', o: 0.15, v: 1, air: 1 }
  },
  'r': {
    title: 'La "R" inglesa /ɹ/ (red, right, car)',
    expl: 'En inglés la lengua NUNCA toca el paladar ni vibra. La punta se curva suavemente hacia atrás en el centro de la boca, con los labios ligeramente redondeados.',
    words: ['red', 'right', 'read', 'car', 'tree'],
    config: { t: 'back', lips: 'round', o: 0.3, v: 1 }
  },
  'l': {
    title: 'La "L" /l/ (light vs ball)',
    expl: 'Punta de la lengua firmemente apoyada detrás de los dientes superiores (alvéolos). Al final de palabra ("ball") el dorso de la lengua sube creando la "dark L".',
    words: ['light', 'love', 'ball', 'tall', 'little'],
    config: { t: 'alveolar', lips: 'neutral', o: 0.25, v: 1 }
  },
  'sh': {
    title: 'Sonido /ʃ/ (she, ship) vs /tʃ/ (chair, chip)',
    expl: 'Para /ʃ/ redondea los labios hacia adelante y deja salir aire continuo ("shhh"). Para /tʃ/ bloquea el aire primero con la lengua como si fueras a decir una "t" y suéltalo.',
    words: ['ship', 'shoes', 'chair', 'church', 'watch'],
    config: { t: 'postalveolar', lips: 'round', o: 0.2, v: 0, air: 1 }
  }
};

export function openMouthGuide(key) {
  const g = MOUTH_GUIDES[key] || MOUTH_GUIDES.th;
  modal(`<h2>👄 Posición de la boca</h2>
    <h3>${esc(g.title)}</h3>
    <div style="display:flex;justify-content:center;margin:12px 0">
      <div style="width:160px;height:160px;background:var(--card);border:2px solid var(--line);border-radius:20px;padding:8px">
        ${mouthSVG(g.config)}
      </div>
    </div>
    <div class="tipbox" style="margin-bottom:12px">
      <p style="margin:0;line-height:1.45">${esc(g.expl)}</p>
    </div>
    <b>Palabras para practicar:</b>
    <div class="chips" style="margin-top:6px">
      ${g.words.map(w => `<button class="chip" data-say-w="${esc(w)}">🔊 ${esc(w)}</button>`).join('')}
    </div>
    <button class="btn primary block" data-x style="margin-top:14px">Entendido</button>`, (el, close) => {
    $('[data-x]', el).onclick = close;
    $$('[data-say-w]', el).forEach(b => b.onclick = () => speak(b.dataset.sayW));
  });
}

export function openMouthSelector() {
  modal(`<h2>👄 Guía Fonética y Bocas</h2>
    <p class="muted small">Elige el sonido que más te cuesta para ver cómo posicionar la lengua, los labios y los dientes:</p>
    <div class="wlist">
      ${Object.entries(MOUTH_GUIDES).map(([k, g]) => `
        <button class="card pcard" data-mg="${k}" style="padding:10px 14px">
          <div class="em" style="background:#eef6ff;font-size:24px">👄</div>
          <div>
            <b>${esc(g.title)}</b>
            <div class="muted small">${esc(g.words.slice(0, 3).join(', '))}</div>
          </div>
        </button>
      `).join('')}
    </div>
    <button class="btn ghost block" data-x style="margin-top:14px">Cerrar</button>`, (el, close) => {
    $('[data-x]', el).onclick = close;
    $$('[data-mg]', el).forEach(b => b.onclick = () => { close(); openMouthGuide(b.dataset.mg); });
  });
}

// 5. MICRO-INTERACCIONES: SONIDOS SINTETIZADOS Y CONFETTI CANVAS

export function canvasConfetti() {
  const cv = document.createElement('canvas');
  cv.className = 'cv-confetti';
  cv.width = window.innerWidth;
  cv.height = window.innerHeight;
  document.body.appendChild(cv);
  const ctx = cv.getContext('2d');
  if (!ctx) { cv.remove(); return; } // guarda defensiva (QA etapa 8): sin contexto 2D no hay confetti
  const cols = ['#1fa463', '#ff9f1c', '#1cb0f6', '#ffd23f', '#e5484d', '#8b5cf6'];
  const parts = [];
  // (fase premium, etapa 7: 70 → 50 partículas; mismo origen, colores y
  // duración, solo menos nodos por cuadro)
  for (let i = 0; i < 50; i++) {
    parts.push({
      x: cv.width / 2, y: cv.height * 0.45,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.7) * 16,
      size: 6 + Math.random() * 6,
      color: cols[Math.floor(Math.random() * cols.length)],
      rot: Math.random() * 360,
      vrot: (Math.random() - 0.5) * 10,
      life: 1
    });
  }
  let raf;
  const draw = () => {
    ctx.clearRect(0, 0, cv.width, cv.height);
    let alive = false;
    parts.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35;
      p.vx *= 0.98;
      p.rot += p.vrot;
      p.life -= 0.012;
      if (p.life > 0) {
        alive = true;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        ctx.restore();
      }
    });
    if (alive) raf = requestAnimationFrame(draw);
    else { cancelAnimationFrame(raf); cv.remove(); }
  };
  raf = requestAnimationFrame(draw);
}

// 6. PRÁCTICA MULTIMODAL: "DESCRIBE LA FOTO / OBJETO"

export const PHOTO_SCENARIOS = [
  { id: 'cafe', title: '☕ En la cafetería', img: '☕', q: 'What do you usually order at a coffee shop and why?', words: ['coffee', 'counter', 'pastry', 'order', 'table'] },
  { id: 'desk', title: '💻 Mi lugar de trabajo / estudio', img: '🖥️', q: 'Describe the objects on your desk right now in English.', words: ['laptop', 'notebook', 'keyboard', 'headphones', 'screen'] },
  { id: 'kitchen', title: '🍳 En la cocina', img: '🍳', q: 'What is your favorite dish to cook and what ingredients does it have?', words: ['plate', 'knife', 'pan', 'ingredients', 'delicious'] },
  { id: 'street', title: '🏙️ En la calle / transporte', img: '🚌', q: 'How do you usually commute and what do you see around you?', words: ['street', 'traffic', 'building', 'pedestrian', 'bus'] }
];

/* ---- P12 (v2.28.0): visión por claves compartidas para la foto ----
   «Analizar con IA» ya funcionaba solo con clave propia de Gemini
   (fetch directo a Google). Ahora también funciona con las claves
   compartidas de Tuki: la foto va a /api/gemini (1 llamada dentro de
   las 60/día compartidas, sin contador propio) y el servidor solo
   admite inlineData jpeg/png/webp de máx. ~2 MB con modelo multimodal.
   La visión cuesta más tokens upstream por llamada que el texto
   (§5.6 del informe de IA): el límite de tamaño y el contador de
   60/día son las mitigaciones, y quedan documentados aquí, en el PR
   y en el README. Consentimiento explícito antes de subir la foto por
   la ruta compartida (casilla; sin ella no se sube nada). La foto se
   redimensiona en el cliente (máx. 1024 px, JPEG 0.82) y se rechaza
   si sigue por encima de 2 MB. El arreglo mínimo F1 (fallback
   etiquetado como ejemplo genérico) NO se toca. Sin proveedor, la
   práctica sigue igual con el ejemplo genérico. */
export const PHOTO_SHARED_MODEL = 'gemini-2.5-flash';
export const PHOTO_MAX_DIM = 1024;
export const PHOTO_MAX_BYTES = 2_000_000;
export const PHOTO_PROMPT = 'Analyze this image for an English learner from Colombia. Identify 5 clear vocabulary words visible in English with their Spanish translation, and ask 1 engaging question in English for the learner to answer. Format: 5 bullet lines "- word: translation", then "QUESTION: your question in English"';
export function photoSharedAvailable() {
  if (!gemShared()) return false;
  const q = aiQuotaToday();
  if (q && (q.limit - q.used) <= 0) return false;
  return true;
}
export function resizePhoto(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const w0 = img.naturalWidth || img.width, h0 = img.naturalHeight || img.height;
        if (!w0 || !h0) throw new Error('sin tamaño');
        const scale = Math.min(1, PHOTO_MAX_DIM / Math.max(w0, h0));
        const w = Math.max(1, Math.round(w0 * scale)), h = Math.max(1, Math.round(h0 * scale));
        const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
        const g = cv.getContext('2d'); if (!g) throw new Error('sin canvas');
        g.drawImage(img, 0, 0, w, h);
        cv.toBlob(b => {
          if (!b) return reject(new Error('sin blob'));
          if (b.size > PHOTO_MAX_BYTES) return reject(new Error('too big'));
          const r = new FileReader();
          r.onload = () => { const du = String(r.result || ''); resolve({ dataUrl: du, mime: 'image/jpeg', b64: du.split(',')[1] || '', bytes: b.size }); };
          r.onerror = () => reject(new Error('read'));
          r.readAsDataURL(b);
        }, 'image/jpeg', 0.82);
      } catch (e) { reject(e); }
    };
    img.onerror = () => reject(new Error('load'));
    img.src = dataUrl;
  });
}
export async function photoAnalyzeShared(b64, mime) {
  const d = await tukiApi('gemini', { model: PHOTO_SHARED_MODEL, request: { contents: [{ role: 'user', parts: [{ text: PHOTO_PROMPT }, { inlineData: { mimeType: mime || 'image/jpeg', data: b64 } }] }], generationConfig: { temperature: 0.2, maxOutputTokens: 800 } } });
  return String((d && d.text) || '').trim();
}
export function openPhotoPractice() {
  const hasOwnGemini = !!(S.settings.geminiKey && S.settings.geminiKey.trim());
  modal(`<h2>📷 Describe y Aprende</h2>
    <p class="muted small">Toma una foto de lo que tienes alrededor o elige un escenario visual para aprender vocabulario y practicar conversación.</p>
    
    <label class="photo-uploader" id="photoDrop" for="photoFile">
      <div style="font-size:36px">📸</div>
      <b>Subir o tomar una foto</b>
      <span class="small muted">Toma una foto de tu escritorio, comida o cualquier objeto</span>
      <input type="file" id="photoFile" accept="image/*" style="display:none">
    </label>
    <div id="photoPreviewWrap" style="display:none;text-align:center">
      <img id="photoImg" class="photo-preview" alt="Vista previa">
      <div class="row" style="margin-top:8px">
        <button class="btn blue sm block" id="photoAnalyze">🔍 Analizar con IA</button>
      </div>
      <label id="photoConsentRow" class="small" style="display:none;gap:6px;align-items:flex-start;margin-top:8px;text-align:left"><input type="checkbox" id="photoConsent" style="margin-top:2px"><span>Acepto subir mi foto a las claves de Tuki para analizarla. Solo se usa para este análisis y cuenta en tus 60 llamadas de hoy.</span></label>
    </div>
    <div id="photoResult" style="margin-top:10px"></div>
    
    <div style="margin-top:16px">
      <b>O elige un escenario para describir:</b>
      <div class="wlist" style="margin-top:8px">
        ${PHOTO_SCENARIOS.map(s => `
          <button class="card pcard" data-ps="${s.id}" style="padding:10px 14px">
            <div class="em" style="background:#fff3d6;font-size:24px">${s.img}</div>
            <div>
              <b>${esc(s.title)}</b>
              <div class="muted small">${esc(s.q)}</div>
            </div>
          </button>
        `).join('')}
      </div>
    </div>
    <button class="btn ghost block" data-x style="margin-top:14px">Cerrar</button>`, (el, close) => {
    $('[data-x]', el).onclick = close;
    const inp = $('#photoFile', el), wrap = $('#photoPreviewWrap', el), img = $('#photoImg', el), drop = $('#photoDrop', el), res = $('#photoResult', el);
    let base64Img = null, photoB64 = null, photoMime = 'image/jpeg';
    const photoFallbackNote = () => {
      if (hasOwnGemini) return 'No pude analizar tu foto: estos objetos son un ejemplo, no lo que hay en tu foto.';
      if (gemShared()) { const q = aiQuotaToday(); if (q && (q.limit - q.used) <= 0) return 'Llegaste al límite gratis de hoy (60 llamadas de IA): estos objetos son un ejemplo, no lo que hay en tu foto.'; return 'No pude analizar tu foto con las claves de Tuki: estos objetos son un ejemplo, no lo que hay en tu foto.'; }
      return 'Sin tu clave de Gemini no puedo ver tu foto: estos objetos son un ejemplo, no lo que hay en tu foto.';
    };
    inp.onchange = e => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = ev => {
        resizePhoto(ev.target.result).then(r => {
          base64Img = r.dataUrl; photoB64 = r.b64; photoMime = r.mime;
          img.src = base64Img;
          wrap.style.display = 'block';
          drop.style.display = 'none';
          const crow = $('#photoConsentRow', el);
          if (crow) crow.style.display = (!hasOwnGemini && photoSharedAvailable()) ? 'flex' : 'none';
          res.innerHTML = '';
        }).catch(() => {
          res.innerHTML = '<div class="small">⚠️ No se pudo leer esa foto. Prueba con otra imagen (JPG o PNG, máx. 2 MB).</div>';
        });
      };
      reader.readAsDataURL(f);
    };
    $('#photoAnalyze', el).onclick = async () => {
      if (!base64Img) return;
      res.innerHTML = '<div class="small muted">⏳ Analizando imagen con Tuki...</div>';
      try {
        if (hasOwnGemini) {
          const rawB64 = base64Img.split(',')[1], mime = base64Img.split(';')[0].replace('data:', '') || 'image/jpeg';
          const prompt = PHOTO_PROMPT;
          const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(S.settings.geminiKey.trim())}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: mime, data: rawB64 } }] }] })
          });
          const d = await r.json();
          const txt = d.candidates && d.candidates[0] && d.candidates[0].content.parts[0].text;
          if (txt) {
            res.innerHTML = `<div class="tipbox" style="white-space:pre-wrap;font-size:14px">${esc(txt)}</div>
              <button class="btn primary sm block" style="margin-top:8px" id="goToChatFromPhoto">💬 Practicar esto en conversación</button>`;
            const bChat = $('#goToChatFromPhoto', el);
            if (bChat) bChat.onclick = () => { close(); go('chat'); };
            return;
          }
        } else if (photoSharedAvailable()) {
          const consent = $('#photoConsent', el);
          if (!consent || !consent.checked) { res.innerHTML = '<div class="small">⚠️ Marca la casilla para subir tu foto a las claves de Tuki.</div>'; return; }
          const txt = await photoAnalyzeShared(photoB64 || base64Img.split(',')[1], photoMime);
          if (txt) {
            res.innerHTML = `<div class="tipbox" style="white-space:pre-wrap;font-size:14px">${esc(txt)}</div>
              <button class="btn primary sm block" style="margin-top:8px" id="goToChatFromPhoto">💬 Practicar esto en conversación</button>`;
            const bChat = $('#goToChatFromPhoto', el);
            if (bChat) bChat.onclick = () => { close(); go('chat'); };
            return;
          }
        }
        res.innerHTML = `<div class="tipbox small">
          <b>📷 Ejemplo genérico para practicar:</b>
          <p class="muted" style="margin:4px 0">${photoFallbackNote()}</p>
          <p style="margin:4px 0">• <b>room</b>: habitación<br>• <b>desk</b>: escritorio<br>• <b>screen</b>: pantalla<br>• <b>light</b>: luz / lámpara<br>• <b>window</b>: ventana</p>
          <b>Pregunta para ti:</b>
          <p style="margin:4px 0"><i>"Can you describe what you use the most in this space?"</i></p>
        </div>
        <button class="btn primary sm block" style="margin-top:8px" id="goToChatFromPhoto">💬 Practicar esto en conversación</button>`;
        const bChat = $('#goToChatFromPhoto', el);
        if (bChat) bChat.onclick = () => { close(); go('chat'); };
      } catch (err) {
        res.innerHTML = `<div class="small muted">No se pudo analizar con la clave actual. Intenta con un escenario guiado abajo.</div>`;
      }
    };
    $$('[data-ps]', el).forEach(b => {
      b.onclick = () => {
        const sc = PHOTO_SCENARIOS.find(x => x.id === b.dataset.ps);
        if (!sc) return;
        close();
        modal(`<h2>${sc.img} ${esc(sc.title)}</h2>
          <div class="tipbox">
            <b>Pregunta de práctica:</b>
            <p style="font-size:16px;margin:6px 0">“${esc(sc.q)}”</p>
            <div class="row"><button class="spk" id="scSpk">🔊</button><span class="small muted">Escuchar pregunta</span></div>
          </div>
          <b>Vocabulario clave:</b>
          <div class="chips" style="margin-top:6px">
            ${sc.words.map(w => `<button class="chip" data-say-w="${esc(w)}">🔊 ${esc(w)}</button>`).join('')}
          </div>
          <button class="btn primary block" id="scGoChat" style="margin-top:14px">💬 Responder en conversación</button>
          <button class="btn ghost block" data-x style="margin-top:6px">Volver</button>`, (el2, close2) => {
          $('[data-x]', el2).onclick = close2;
          $('#scSpk', el2).onclick = () => speak(sc.q);
          $$('[data-say-w]', el2).forEach(sb => sb.onclick = () => speak(sb.dataset.sayW));
          $('#scGoChat', el2).onclick = () => {
            close2();
            CHAT.scen = 'free';
            go('chat');
            chatSend(`Let's talk about this topic: "${sc.q}"`, true);
          };
        });
      };
    });
  });
}

// 7. INTEGRACIÓN DE COMPONENTES EN LAS VISTAS

export const TUKI_SHOP_ITEMS = [
  // --- 🧢 Sombreros y Cabeza (14 ítems) ---
  { id: 'hat:none', type: 'hat', key: 'none', name: 'Plumas naturales', icon: '🪶', price: 0, desc: 'Look clásico y ligero.' },
  { id: 'hat:vueltiao', type: 'hat', key: 'vueltiao', name: 'Sombrero Vueltiao', icon: '🇨🇴', price: 50, desc: 'Orgullo colombiano tejido en caña flecha.' },
  { id: 'hat:cap', type: 'hat', key: 'cap', name: 'Gorra deportiva', icon: '🧢', price: 40, desc: 'Estilo urbano para salir a practicar.' },
  { id: 'hat:headphones', type: 'hat', key: 'headphones', name: 'Audífonos DJ / Gamer', icon: '🎧', price: 65, desc: 'Para escuchar la mejor pronunciación.' },
  { id: 'hat:glasses', type: 'hat', key: 'glasses', name: 'Gafas oscuras', icon: '🕶️', price: 60, desc: 'Toda la onda para pronunciar con estilo.' },
  { id: 'hat:chef', type: 'hat', key: 'chef', name: 'Gorro de chef', icon: '👨‍🍳', price: 70, desc: 'Cocinando la mejor fluidez paso a paso.' },
  { id: 'hat:beret', type: 'hat', key: 'beret', name: 'Boina de artista', icon: '🎨', price: 60, desc: 'Para amantes del arte y los idiomas.' },
  { id: 'hat:grad', type: 'hat', key: 'grad', name: 'Birrete de graduación', icon: '🎓', price: 75, desc: 'Para cuando apruebas lecciones con honores.' },
  { id: 'hat:cowboy', type: 'hat', key: 'cowboy', name: 'Sombrero vaquero', icon: '🤠', price: 80, desc: 'Estilo western para aventureros.' },
  { id: 'hat:flower', type: 'hat', key: 'flower', name: 'Corona de flores', icon: '🌸', price: 85, desc: 'Vibra primaveral fresca y colorida.' },
  { id: 'hat:vr', type: 'hat', key: 'vr', name: 'Visor VR Cyberpunk', icon: '🥽', price: 95, desc: 'Inmersión futurista en alta tecnología.' },
  { id: 'hat:party', type: 'hat', key: 'party', name: 'Gorro fiestero', icon: '🥳', price: 50, desc: '¡Celebra cada logro y racha!' },
  { id: 'hat:wizard', type: 'hat', key: 'wizard', name: 'Sombrero de mago', icon: '🧙', price: 90, desc: 'Hechizos de fluidez y magia fonética.' },
  { id: 'hat:crown', type: 'hat', key: 'crown', name: 'Corona real dorada', icon: '👑', price: 120, desc: 'El rey absoluto de la pronunciación.' },

  // --- 👔 Ropa y Atuendos (12 ítems) ---
  { id: 'outfit:none', type: 'outfit', key: 'none', name: 'Sin ropa', icon: '🦜', price: 0, desc: 'Al natural, listo para volar.' },
  { id: 'outfit:ruana', type: 'outfit', key: 'ruana', name: 'Ruana tradicional', icon: '🇨🇴', price: 55, desc: 'Calientita de Boyacá para el frío.' },
  { id: 'outfit:jersey', type: 'outfit', key: 'jersey', name: 'Camiseta tricolor', icon: '⚽', price: 65, desc: '¡Con toda la pasión por aprender!' },
  { id: 'outfit:bowtie', type: 'outfit', key: 'bowtie', name: 'Corbatín elegante', icon: '👔', price: 45, desc: 'Para entrevistas y reuniones de trabajo.' },
  { id: 'outfit:jacket', type: 'outfit', key: 'jacket', name: 'Chaqueta de cuero', icon: '🎸', price: 80, desc: 'Vibra rockstar rebelde y segura.' },
  { id: 'outfit:astronaut', type: 'outfit', key: 'astronaut', name: 'Traje de astronauta', icon: '🚀', price: 130, desc: '¡Lleva tu inglés hasta las estrellas!' },
  { id: 'outfit:lab', type: 'outfit', key: 'lab', name: 'Bata de laboratorio', icon: '🧪', price: 85, desc: 'Ciencia exacta aplicada a los fonemas.' },
  { id: 'outfit:vest', type: 'outfit', key: 'vest', name: 'Chaleco de safari', icon: '🦺', price: 75, desc: 'Explorando nuevos acentos por el mundo.' },
  { id: 'outfit:scarf', type: 'outfit', key: 'scarf', name: 'Bufanda abrigada', icon: '🧣', price: 55, desc: 'Para cuidar la voz al vocalizar.' },
  { id: 'outfit:hawaiian', type: 'outfit', key: 'hawaiian', name: 'Collar hawaiano', icon: '🌺', price: 70, desc: 'Vibra tropical relajada.' },
  { id: 'outfit:cape', type: 'outfit', key: 'cape', name: 'Capa de héroe', icon: '🦸', price: 95, desc: 'Habla inglés sin miedo a nada.' },
  { id: 'outfit:medal', type: 'outfit', key: 'medal', name: 'Medalla de oro', icon: '🥇', price: 110, desc: 'Premio al esfuerzo y perseverancia.' },

  // --- 🪄 Accesorios en Mano (7 ítems) ---
  { id: 'hand:none', type: 'hand', key: 'none', name: 'Alas libres', icon: '🪶', price: 0, desc: 'Alas despejadas para volar.' },
  { id: 'hand:mic', type: 'hand', key: 'mic', name: 'Micrófono dorado', icon: '🎤', price: 60, desc: 'Para que tu voz se escuche brillante.' },
  { id: 'hand:coffee', type: 'hand', key: 'coffee', name: 'Tinto colombiano', icon: '☕', price: 45, desc: 'El mejor café para activar las neuronas.' },
  { id: 'hand:book', type: 'hand', key: 'book', name: 'Diccionario EN', icon: '📖', price: 50, desc: 'Sabiduría y vocabulario infinito.' },
  { id: 'hand:flag', type: 'hand', key: 'flag', name: 'Bandera tricolor', icon: '🇨🇴', price: 40, desc: 'Llevando la bandera a todos los países.' },
  { id: 'hand:wand', type: 'hand', key: 'wand', name: 'Varita mágica', icon: '✨', price: 90, desc: 'Fluidez instantánea con un toque de magia.' },
  { id: 'hand:trophy', type: 'hand', key: 'trophy', name: 'Trofeo de campeón', icon: '🏆', price: 120, desc: '¡El máximo galardón al esfuerzo diario!' },

  // --- 🎨 Plumaje y Colores (5 ítems) ---
  { id: 'plumage:classic', type: 'plumage', key: 'classic', name: 'Plumaje Clásico', icon: '🦜', price: 0, desc: 'El tucán tradicional verde y negro.' },
  { id: 'plumage:gold', type: 'plumage', key: 'gold', name: 'Dorado Mítico', icon: '🌟', price: 150, desc: 'Aura radiante con plumaje de oro puro.' },
  { id: 'plumage:neon', type: 'plumage', key: 'neon', name: 'Cyberpunk Neón', icon: '🌌', price: 140, desc: 'Colores eléctricos futuristas y aura cyan.' },
  { id: 'plumage:fire', type: 'plumage', key: 'fire', name: 'Fénix de Fuego', icon: '🔥', price: 160, desc: 'Energía ardiente y plumaje carmesí.' },
  { id: 'plumage:ice', type: 'plumage', key: 'ice', name: 'Ártico Glacial', icon: '❄️', price: 140, desc: 'Plumas celestes cristalinas como el hielo.' }
];

export let shopActiveTab = 'hat';

export function openTukiShopModal() {
  const skin = S.tukiSkin || (S.tukiSkin = { hat: 'none', outfit: 'none', hand: 'none', plumage: 'classic', owned: ['hat:none', 'outfit:none', 'hand:none', 'plumage:classic'] });
  let previewSkin = { ...skin };

  const buildModalContent = () => {
    const items = TUKI_SHOP_ITEMS.filter(it => it.type === shopActiveTab);
    return `<h2>🛍️ Tienda y Armario de Tuki</h2>
      <p class="muted small">Gana monedas completando lecciones, retos y metas diarias para vestir a tu tucán.</p>
      
      <div class="tuki-shop-preview">
        <div class="mascot-wrap" id="shopPreviewMascot" title="¡Toca para interactuar!">${renderTukiSVG(previewSkin)}</div>
        <div class="tuki-speech" id="shopSpeech">¡Prueba atuendos, sombreros y colores! Tienes 🪙 <b>${S.coins || 0}</b> monedas.</div>
      </div>

      <div class="shop-tabs">
        <button class="shop-tab ${shopActiveTab === 'hat' ? 'active' : ''}" data-stab="hat">🧢 Cabeza (${TUKI_SHOP_ITEMS.filter(i=>i.type==='hat').length})</button>
        <button class="shop-tab ${shopActiveTab === 'outfit' ? 'active' : ''}" data-stab="outfit">👔 Ropa (${TUKI_SHOP_ITEMS.filter(i=>i.type==='outfit').length})</button>
        <button class="shop-tab ${shopActiveTab === 'hand' ? 'active' : ''}" data-stab="hand">🪄 En Mano (${TUKI_SHOP_ITEMS.filter(i=>i.type==='hand').length})</button>
        <button class="shop-tab ${shopActiveTab === 'plumage' ? 'active' : ''}" data-stab="plumage">🎨 Plumaje (${TUKI_SHOP_ITEMS.filter(i=>i.type==='plumage').length})</button>
      </div>

      <div class="shop-grid">
        ${items.map(it => {
          const isOwned = skin.owned.includes(it.id) || it.price === 0;
          const isEquipped = skin[it.type] === it.key;
          return `<div class="shop-card ${isEquipped ? 'equipped' : ''}" data-preview="${it.id}">
            <div class="icon">${it.icon}</div>
            <div class="name">${esc(it.name)}</div>
            <div class="price">${isOwned ? 'En tu armario' : `🪙 ${it.price} monedas`}</div>
            <div class="small muted" style="font-size:11px">${esc(it.desc)}</div>
            <button class="btn sm shop-btn ${isEquipped ? 'ghost' : isOwned ? 'blue' : 'primary'}" data-act="${it.id}" ${!isOwned && (S.coins || 0) < it.price ? 'disabled' : ''}>
              ${isEquipped ? 'Equipado ✓' : isOwned ? '⚡ Equipar' : `Comprar 🪙 ${it.price}`}
            </button>
          </div>`;
        }).join('')}
      </div>

      <div class="row" style="margin-top:14px">
        <button class="btn ghost block" data-x>Cerrar</button>
      </div>`;
  };

  modal(buildModalContent(), (el, close) => {
    $('[data-x]', el).onclick = close;
    
    $$('[data-stab]', el).forEach(tab => {
      tab.onclick = () => {
        shopActiveTab = tab.dataset.stab;
        close();
        openTukiShopModal();
      };
    });

    const pm = $('#shopPreviewMascot', el);
    if (pm) { pm.onclick = () => interactWithTuki(pm); makeMascotClickable(pm, '¡Toca para interactuar con Tuki!'); }

    $$('[data-preview]', el).forEach(card => {
      card.onclick = e => {
        if (e.target.closest('[data-act]')) return;
        const itId = card.dataset.preview;
        const it = TUKI_SHOP_ITEMS.find(x => x.id === itId);
        if (!it) return;
        previewSkin[it.type] = it.key;
        const pm = $('#shopPreviewMascot', el);
        if (pm) {
          pm.innerHTML = renderTukiSVG(previewSkin);
          tukiMood('happy', { el: pm, particles: 'sparkle' });
        }
        const sp = $('#shopSpeech', el);
        if (sp) sp.textContent = `Probando: ${it.name} ${it.icon}`;
        beep('tap');
      };
    });

    $$('[data-act]', el).forEach(btn => {
      btn.onclick = () => {
        const itId = btn.dataset.act;
        const it = TUKI_SHOP_ITEMS.find(x => x.id === itId);
        if (!it) return;
        const isOwned = skin.owned.includes(it.id) || it.price === 0;

        if (!isOwned) {
          if ((S.coins || 0) < it.price) return toast('No tienes suficientes monedas 🪙');
          S.coins -= it.price;
          skin.owned.push(it.id);
        }

        skin[it.type] = it.key;
        previewSkin = { ...skin };
        save();
        updateMascot();
        render();

        const pm = $('#shopPreviewMascot', el);
        if (pm) {
          pm.innerHTML = renderTukiSVG(previewSkin);
          tukiMood('excited', { el: pm, particles: 'sparkle' });
        } else tukiChirp('celebrate');
        confetti();

        const sp = $('#shopSpeech', el);
        const celebrateQuotes = [
          `¡Uff, qué pinta! Me queda genial ${it.name} ${it.icon}✨`,
          `¡Poder tucán activado! Estrenando ${it.name} 🦜🔥`,
          `¡Gracias por este look! Con ${it.name} aprendemos con estilo 💎`
        ];
        if (sp) sp.innerHTML = pick(celebrateQuotes);

        if (!isOwned) {
          beep('done');
          toast(`🎉 ¡Compraste y equipaste ${it.name}!`, 3000);
        } else {
          beep('ok');
          toast(`⚡ Equipaste ${it.name}`);
        }

        setTimeout(() => {
          close();
          openTukiShopModal();
        }, 550);
      };
    });
  });
}

// =================== MODO CARACOL 🐌 Y SÍLABAS ===================
export const SYLLABLE_DICT = {
  water: ['wa', 'ter'],
  computer: ['com', 'pu', 'ter'],
  together: ['to', 'geth', 'er'],
  beautiful: ['beau', 'ti', 'ful'],
  yesterday: ['yes', 'ter', 'day'],
  morning: ['mor', 'ning'],
  pronunciation: ['pro', 'nun', 'ci', 'a', 'tion'],
  practice: ['prac', 'tice'],
  understand: ['un', 'der', 'stand'],
  important: ['im', 'por', 'tant'],
  family: ['fa', 'mi', 'ly'],
  different: ['dif', 'fer', 'ent'],
  question: ['ques', 'tion'],
  answer: ['an', 'swer'],
  listen: ['lis', 'ten'],
  repeat: ['re', 'peat'],
  english: ['eng', 'lish'],
  welcome: ['wel', 'come'],
  conversation: ['con', 'ver', 'sa', 'tion'],
  interview: ['in', 'ter', 'view'],
  colombia: ['co', 'lom', 'bia'],
  coffee: ['cof', 'fee'],
  restaurant: ['res', 'tau', 'rant'],
  airport: ['air', 'port'],
  hospital: ['hos', 'pi', 'tal']
};

export function getSyllables(word) {
  const clean = String(word || '').toLowerCase().replace(/[^a-z]/g, '');
  if (!clean) return [word];
  if (SYLLABLE_DICT[clean]) return SYLLABLE_DICT[clean];
  const parts = clean.match(/[^aeiouy]*[aeiouy]+(?:[^aeiouy]+(?=$|[^aeiouy]))?/gi);
  return parts && parts.length > 1 ? parts : [clean];
}

export function speakSnail(text, onend) {
  if (!('speechSynthesis' in window)) { toast('Tu navegador no soporta síntesis de voz.'); return; }
  speechSynthesis.cancel();
  const words = String(text || '').trim().split(/\s+/);
  if (words.length === 1) {
    const syls = getSyllables(words[0]);
    toast(`🐌 Modo Caracol: [ ${syls.join(' · ')} ]`, 3000);
    let idx = 0;
    function nextSyl() {
      if (idx >= syls.length) { if (onend) onend(); return; }
      const u = new SpeechSynthesisUtterance(syls[idx]);
      u.lang = 'en-US';
      const v = pickVoice(); if (v) u.voice = v;
      u.rate = 0.42;
      u.onend = () => { idx++; setTimeout(nextSyl, 180); };
      speechSynthesis.speak(u);
    }
    nextSyl();
  } else {
    toast(`🐌 Modo Caracol (Cámara lenta extrema): "${text}"`, 3000);
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    const v = pickVoice(); if (v) u.voice = v;
    u.rate = 0.42;
    if (onend) u.onend = onend;
    speechSynthesis.speak(u);
  }
}

// =================== GUÍA DE VIAJE Y SUPERVIVENCIA ===================
export const TRAVEL_DATA = {
  airport: {
    title: 'Aeropuerto & Aduana', icon: '🛃',
    phrases: [
      { en: "I am visiting for two weeks on vacation.", es: "Vengo por dos semanas de vacaciones.", pron: "Ai am ví-si-ting for tuu uiiks on vei-kéi-shon" },
      { en: "Where is terminal two and gate B4?", es: "¿Dónde queda la terminal 2 y la puerta B4?", pron: "Uér is tér-mi-nal tuu and gueit bii-for?" },
      { en: "Here is my passport and boarding pass.", es: "Aquí está mi pasaporte y pase de abordar.", pron: "Jir is mai pás-port and bór-ding pas" },
      { en: "I have nothing to declare.", es: "No tengo nada que declarar.", pron: "Ai jav ná-zing tu di-klér" }
    ]
  },
  hotel: {
    title: 'Hotel & Alojamiento', icon: '🏨',
    phrases: [
      { en: "I have a reservation under the name Juan.", es: "Tengo una reserva a nombre de Juan.", pron: "Ai jav a re-ser-véi-shon án-der da néim Juan" },
      { en: "Could I have the Wi-Fi password, please?", es: "¿Me podría dar la clave del Wi-Fi, por favor?", pron: "Kuud ai jav da uái-fái pás-uord pliiz?" },
      { en: "What time is check-out tomorrow?", es: "¿A qué hora es el check-out mañana?", pron: "Uát táim is chek-áut tu-mó-rou?" },
      { en: "Could I get extra towels and water?", es: "¿Podría traerme toallas extra y agua?", pron: "Kuud ai guet éks-tra táu-els and uá-ter?" }
    ]
  },
  restaurant: {
    title: 'Restaurante & Comida', icon: '🍽️',
    phrases: [
      { en: "Could we have a table for two, please?", es: "¿Nos da una mesa para dos, por favor?", pron: "Kuud uii jav a téi-bol for tuu pliiz?" },
      { en: "Could I see the menu, please?", es: "¿Podría ver la carta o menú, por favor?", pron: "Kuud ai sii da mé-niu pliiz?" },
      { en: "Could I get the check, please?", es: "¿Me trae la cuenta, por favor?", pron: "Kuud ai guet da chek pliiz?" },
      { en: "I am allergic to peanuts.", es: "Soy alérgico al maní.", pron: "Ai am a-lér-yik tu pí-nats" }
    ]
  },
  transport: {
    title: 'Transporte & Direcciones', icon: '🚕',
    phrases: [
      { en: "Could you take me to this address, please?", es: "¿Me puede llevar a esta dirección, por favor?", pron: "Kuud iu téik mii tu dis a-drés pliiz?" },
      { en: "How much is the ride to downtown?", es: "¿Cuánto cuesta el viaje al centro?", pron: "Jáu mach is da ráid tu dáun-táun?" },
      { en: "Where is the nearest subway station?", es: "¿Dónde queda la estación de metro más cercana?", pron: "Uér is da nír-est sáb-uei stéi-shon?" },
      { en: "Is this the right bus to the airport?", es: "¿Es este el bus correcto para el aeropuerto?", pron: "Is dis da ráit bas tu di ér-port?" }
    ]
  },
  emergency: {
    title: 'Emergencias & Salud', icon: '🚨',
    phrases: [
      { en: "I need a doctor immediately.", es: "Necesito un médico de inmediato.", pron: "Ai niid a dák-tor im-mí-diet-li" },
      { en: "Where is the nearest 24-hour pharmacy?", es: "¿Dónde hay una farmacia 24 horas cercana?", pron: "Uér is da nír-est tuén-ti-for áur fár-ma-si?" },
      { en: "I lost my phone and wallet. Can you help me?", es: "Perdí mi celular y billetera. ¿Me puede ayudar?", pron: "Ai lost mai foun and uá-let. Kan iu jelp mii?" },
      { en: "Please call the police right now.", es: "Por favor llame a la policía ahora mismo.", pron: "Pliiz kol da po-líis ráit náu" }
    ]
  }
};

export let travelCurrentCat = 'airport';

export function openTravelGuideModal() {
  const buildHTML = () => {
    const cat = TRAVEL_DATA[travelCurrentCat];
    return `<h2>✈️ Guía de Viaje y Supervivencia</h2>
      <p class="muted small">Frases esenciales para situaciones reales con pronunciación fonética y audio lento.</p>
      
      <div class="travel-tabs">
        ${Object.keys(TRAVEL_DATA).map(k => `
          <button class="travel-tab ${travelCurrentCat === k ? 'active' : ''}" data-cat="${k}">
            ${TRAVEL_DATA[k].icon} ${esc(TRAVEL_DATA[k].title)}
          </button>
        `).join('')}
      </div>

      <div class="wlist" style="margin-top:10px;max-height:360px;overflow-y:auto">
        ${cat.phrases.map((item, idx) => `
          <div class="travel-item">
            <div class="row between">
              <b style="font-size:15px;color:var(--ink)">${esc(item.en)}</b>
              <div class="acts">
                <button class="spk" data-say-n="${esc(item.en)}" title="Escuchar">🔊</button>
                <button class="spk slow" data-say="${esc(item.en)}" title="Lento">🐢</button>
                <button class="spk snail" data-snail="${esc(item.en)}" title="Modo Caracol">🐌</button>
              </div>
            </div>
            <div class="small muted" style="margin-top:3px">🇪🇸 ${esc(item.es)}</div>
            <div class="travel-phon">🗣️ Como suena: <i>«${esc(item.pron)}»</i></div>
            <div class="row between" style="margin-top:8px">
              <button class="btn ghost sm" data-mic-travel="${idx}">🎙️ Practicar mi voz</button>
              <div id="travRes_${idx}" class="small"></div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="row" style="margin-top:14px">
        <button class="btn ghost block" data-x>Cerrar</button>
      </div>`;
  };

  modal(buildHTML(), (el, close) => {
    $('[data-x]', el).onclick = close;
    $$('[data-cat]', el).forEach(tab => {
      tab.onclick = () => {
        travelCurrentCat = tab.dataset.cat;
        close();
        openTravelGuideModal();
      };
    });
    $$('[data-say-n]', el).forEach(b => b.onclick = () => speak(b.dataset.sayN));
    $$('[data-say]', el).forEach(b => b.onclick = () => speak(b.dataset.say, true));
    $$('[data-snail]', el).forEach(b => b.onclick = () => speakSnail(b.dataset.snail));

    $$('[data-mic-travel]', el).forEach(btn => {
      btn.onclick = () => {
        const idx = +btn.dataset.micTravel;
        const item = TRAVEL_DATA[travelCurrentCat].phrases[idx];
        const res = $(`#travRes_${idx}`, el);
        doMic(btn, (alts, url, az) => {
          const r = az || scoreSpeech(item.en, alts);
          const pct = r.pct || 0;
          const col = pct >= 75 ? 'var(--g-d)' : pct >= 50 ? 'var(--o-d)' : 'var(--r)';
          res.innerHTML = `<span style="font-weight:800;color:${col}">${pct}%</span> <span class="muted small">(«${esc(r.heard || '')}»)</span>`;
          if (pct >= 75) {
            addXP(5);
            addCoins(3);
            beep('ok');
          } else beep('bad');
        });
      };
    });
  });
}

// =================== SIMULADOR DE ENTREVISTA LABORAL ===================
export const INTERVIEW_ROLES = {
  dev: {
    title: 'Desarrollador / Software Engineer', icon: '💻',
    questions: [
      { q: "Tell me about yourself and your technical background.", es: "Cuéntame sobre ti y tu experiencia técnica.", tip: "Enfócate en tu stack principal, años de experiencia y proyectos recientes." },
      { q: "How do you handle a production bug or unexpected issue under tight deadlines?", es: "¿Cómo manejas un error en producción bajo presión de tiempo?", tip: "Menciona comunicación transparente, análisis de logs, rollback/hotfix y post-mortem." },
      { q: "Why do you want to work with an international remote team?", es: "¿Por qué quieres trabajar con un equipo remoto internacional?", tip: "Destaca tu proactividad, comunicación asíncrona y deseo de impacto global." }
    ]
  },
  support: {
    title: 'Customer Support / BPO / Remote Agent', icon: '🎧',
    questions: [
      { q: "Can you introduce yourself and describe your customer service experience?", es: "Preséntate y describe tu experiencia en atención al cliente.", tip: "Habla sobre empatía, resolución de problemas y canales que has manejado." },
      { q: "How do you deal with an angry or frustrated customer?", es: "¿Cómo tratas a un cliente frustrado o molesto?", tip: "Escucha activa, pedir disculpas con empatía y ofrecer una solución concreta." },
      { q: "Tell me about a time you exceeded a customer's expectations.", es: "Cuéntame de una ocasión en que superaste las expectativas de un cliente.", tip: "Explica la situación, tu acción extraordinaria y el resultado positivo." }
    ]
  },
  general: {
    title: 'Entrevista Laboral General (Cualquier área)', icon: '💼',
    questions: [
      { q: "What are your greatest professional strengths and your main area of growth?", es: "¿Cuáles son tus mayores fortalezas profesionales y tu área de mejora?", tip: "Menciona 2 fortalezas concretas y un área de mejora que estés trabajando activamente." },
      { q: "Where do you see yourself in the next three years?", es: "¿Dónde te ves en los próximos tres años?", tip: "Muestra ambición alineada con aprendizaje continuo y asumir más responsabilidades." },
      { q: "Why should we hire you over other candidates?", es: "¿Por qué deberíamos contratarte a ti?", tip: "Combina tus habilidades técnicas con tu actitud positiva y compromiso." }
    ]
  }
};

export let curInterviewRole = 'dev';
export let curInterviewQIdx = 0;

export function openInterviewSimulatorModal() {
  const role = INTERVIEW_ROLES[curInterviewRole];
  const qItem = role.questions[curInterviewQIdx % role.questions.length];

  const buildHTML = () => `<h2>💼 Simulador de Entrevista Laboral (1-10)</h2>
    <p class="muted small">Practica preguntas reales en inglés con evaluación por rúbrica profesional (1 al 10).</p>
    
    <div class="travel-tabs" style="margin-bottom:10px">
      ${Object.keys(INTERVIEW_ROLES).map(k => `
        <button class="travel-tab ${curInterviewRole === k ? 'active' : ''}" data-irole="${k}">
          ${INTERVIEW_ROLES[k].icon} ${esc(INTERVIEW_ROLES[k].title)}
        </button>
      `).join('')}
    </div>

    <div class="card" style="background:var(--card);border:2px solid var(--line);border-radius:16px;padding:14px">
      <div class="row between">
        <span class="novice-badge">Pregunta ${curInterviewQIdx + 1} de ${role.questions.length}</span>
        <button class="spk" id="btnSpkIntQ">🔊 Escuchar</button>
      </div>
      <h3 style="margin:8px 0;font-size:17px;color:var(--ink)">“${esc(qItem.q)}”</h3>
      <div class="small muted">🇪🇸 ${esc(qItem.es)}</div>
      <div class="tipbox" style="margin-top:8px;font-size:12px">💡 <b>Consejo:</b> ${esc(qItem.tip)}</div>
    </div>

    <div class="card" style="margin-top:10px;text-align:center">
      <div class="small muted" style="margin-bottom:8px">Responde en inglés hablando con tu micrófono o escribiendo:</div>
      <textarea id="intAnswerText" class="field" rows="3" placeholder="O escribe tu respuesta aquí para evaluarla…"></textarea>
      <div class="row" style="margin-top:8px">
        <button class="btn primary block" id="btnIntMic">🎙️ Grabar Respuesta</button>
        <button class="btn blue block" id="btnIntEval">📊 Evaluar (1-10)</button>
      </div>
    </div>

    <div id="intResultArea" style="margin-top:10px"></div>

    <div class="row" style="margin-top:14px">
      <button class="btn ghost block" id="btnIntNext">Siguiente Pregunta ➡️</button>
      <button class="btn ghost block" data-x>Cerrar</button>
    </div>`;

  modal(buildHTML(), (el, close) => {
    $('[data-x]', el).onclick = close;
    $('#btnSpkIntQ', el).onclick = () => speak(qItem.q);

    $$('[data-irole]', el).forEach(tab => {
      tab.onclick = () => {
        curInterviewRole = tab.dataset.irole;
        curInterviewQIdx = 0;
        close();
        openInterviewSimulatorModal();
      };
    });

    $('#btnIntNext', el).onclick = () => {
      curInterviewQIdx = (curInterviewQIdx + 1) % role.questions.length;
      close();
      openInterviewSimulatorModal();
    };

    const micBtn = $('#btnIntMic', el);
    const textInput = $('#intAnswerText', el);
    const resArea = $('#intResultArea', el);

    micBtn.onclick = () => {
      doMic(micBtn, (alts, url, az) => {
        const transcript = (alts && alts[0] && alts[0].t) || '';
        textInput.value = transcript;
        evaluateAnswer(transcript, az);
      });
    };

    $('#btnIntEval', el).onclick = () => {
      const val = textInput.value.trim();
      if (!val) return toast('Habla o escribe tu respuesta primero.');
      evaluateAnswer(val, null);
    };

    function evaluateAnswer(answerText, azResult) {
      resArea.innerHTML = '<div class="small muted" style="text-align:center">⏳ Analizando tu respuesta con rúbrica profesional (1-10)…</div>';
      
      const words = answerText.split(/\s+/).filter(Boolean);
      const len = words.length;
      
      let fluency = Math.min(10, Math.max(3, Math.round(len / 3.5)));
      let vocab = Math.min(10, Math.max(4, Math.round(new Set(words).size / 2.8)));
      let grammar = Math.min(10, Math.max(4, Math.round(5 + (len > 8 ? 2 : 0) + (/because|also|however|experience|responsible|team/i.test(answerText) ? 2 : 0))));
      let pron = azResult ? Math.min(10, Math.max(3, Math.round((azResult.pct || 70) / 10))) : 8;
      
      const avgScore = ((fluency + vocab + grammar + pron) / 4).toFixed(1);
      const col = avgScore >= 7.5 ? 'var(--g-d)' : avgScore >= 5.5 ? 'var(--o-d)' : 'var(--r)';

      addXP(15);
      addCoins(10, 'Práctica de entrevista');

      resArea.innerHTML = `<div class="rubric-box">
        <div class="row between">
          <h3 style="margin:0">Calificación Global: <span style="color:${col};font-weight:900">${avgScore}/10</span></h3>
          <span class="novice-badge" style="background:#e0f2fe;color:#0369a1">+15 XP · +10 🪙</span>
        </div>
        <div class="small muted" style="margin:4px 0 10px">Respuesta evaluada: «${esc(answerText)}»</div>

        <div class="rubric-row">
          <span>🗣️ Fluidez y Longitud</span>
          <div class="rubric-meter"><div class="rubric-meter-fill" style="width:${fluency * 10}%"></div></div>
          <b>${fluency}/10</b>
        </div>
        <div class="rubric-row">
          <span>📚 Vocabulario Profesional</span>
          <div class="rubric-meter"><div class="rubric-meter-fill" style="width:${vocab * 10}%"></div></div>
          <b>${vocab}/10</b>
        </div>
        <div class="rubric-row">
          <span>🎯 Gramática y Estructura</span>
          <div class="rubric-meter"><div class="rubric-meter-fill" style="width:${grammar * 10}%"></div></div>
          <b>${grammar}/10</b>
        </div>
        <div class="rubric-row">
          <span>🎙️ Pronunciación / Seguridad</span>
          <div class="rubric-meter"><div class="rubric-meter-fill" style="width:${pron * 10}%"></div></div>
          <b>${pron}/10</b>
        </div>

        <div class="tipbox" style="margin-top:10px;font-size:13px">
          <b>🌟 Feedback de Tuki:</b><br>
          ${avgScore >= 8 ? '¡Excelente respuesta! Tienes buen impacto profesional y transmites seguridad.' : avgScore >= 6 ? 'Buena base. Intenta añadir más conectores (like "Moreover", "Specifically", "In addition") para sonar más natural.' : 'Respuesta muy corta. Desarrolla tu idea explicando un ejemplo concreto de tu experiencia.'}
        </div>
      </div>`;
    }
  });
}

// =================== COFRES Y RETOS DIARIOS ===================

export function renderDailyChestsAndQuests() {
  const k = dayKey();
  const today = todayRec();
  const goal = S.settings.goal || 20;
  const isGoalMet = today.xp >= goal;
  const isChestClaimed = S.chests && S.chests.dailyClaimed === k;

  const questVozDone = (today.n || 0) >= 3;
  const questGoalDone = isGoalMet;
  const questPracDone = (today.sec || 0) >= 60 || (today.xp >= 15);

  const q1Claimed = S.quests && S.quests[k + '_q1'];
  const q2Claimed = S.quests && S.quests[k + '_q2'];
  const q3Claimed = S.quests && S.quests[k + '_q3'];

  return `<div class="chest-card" id="dailyChestCard">
    <div class="row between">
      <div>
        <h3 style="margin:0;color:#92400e">🎁 Cofre Diario de Recompensas</h3>
        <div class="small" style="color:#b45309">
          ${isChestClaimed ? '✅ ¡Cofre de hoy reclamado! Vuelve mañana.' : isGoalMet ? '✨ ¡Meta cumplida! Abre tu cofre ahora.' : `Meta de hoy: ${Math.min(today.xp, goal)}/${goal} XP para abrir.`}
        </div>
      </div>
      <button class="btn sm ${isChestClaimed ? 'ghost' : isGoalMet ? 'orange chest-glow' : 'ghost'}" id="btnClaimChest" ${isChestClaimed || !isGoalMet ? 'disabled' : ''}>
        ${isChestClaimed ? 'Reclamado ✓' : 'Abrir Cofre 🎁'}
      </button>
    </div>
  </div>

  <div class="card" style="margin-bottom:14px">
    <div class="row between">
      <h3 style="margin:0">🎯 Retos de Hoy</h3>
      <span class="small muted">Gana monedas y XP extra</span>
    </div>

    <div class="quest-item">
      <div style="flex:1">
        <div class="row between"><span style="font-weight:700;font-size:13px">🗣️ Pronuncia 3 frases</span><span class="small" style="font-weight:800;color:#d97706">+20 🪙</span></div>
        <div class="quest-bar"><div class="quest-bar-fill" style="width:${Math.min(100, Math.round(((today.n || 0) / 3) * 100))}%"></div></div>
      </div>
      <button class="btn sm ${q1Claimed ? 'ghost' : questVozDone ? 'primary' : 'ghost'}" data-claim-q="q1" ${q1Claimed || !questVozDone ? 'disabled' : ''}>
        ${q1Claimed ? 'Listo ✓' : 'Reclamar'}
      </button>
    </div>

    <div class="quest-item">
      <div style="flex:1">
        <div class="row between"><span style="font-weight:700;font-size:13px">🎯 Cumple tu meta diaria de XP</span><span class="small" style="font-weight:800;color:#d97706">+30 🪙</span></div>
        <div class="quest-bar"><div class="quest-bar-fill" style="width:${Math.min(100, Math.round((today.xp / goal) * 100))}%"></div></div>
      </div>
      <button class="btn sm ${q2Claimed ? 'ghost' : questGoalDone ? 'primary' : 'ghost'}" data-claim-q="q2" ${q2Claimed || !questGoalDone ? 'disabled' : ''}>
        ${q2Claimed ? 'Listo ✓' : 'Reclamar'}
      </button>
    </div>

    <div class="quest-item">
      <div style="flex:1">
        <div class="row between"><span style="font-weight:700;font-size:13px">⏱️ Practica al menos 1 minuto</span><span class="small" style="font-weight:800;color:#d97706">+20 🪙</span></div>
        <div class="quest-bar"><div class="quest-bar-fill" style="width:${Math.min(100, Math.round((Math.min(60, today.sec || 0) / 60) * 100))}%"></div></div>
      </div>
      <button class="btn sm ${q3Claimed ? 'ghost' : questPracDone ? 'primary' : 'ghost'}" data-claim-q="q3" ${q3Claimed || !questPracDone ? 'disabled' : ''}>
        ${q3Claimed ? 'Listo ✓' : 'Reclamar'}
      </button>
    </div>
  </div>`;
}

export async function checkForAppUpdates(btn) {
  const status = $('#updStatus');
  if (!navigator.onLine) {
    if (status) status.textContent = '📴 Sin conexión a internet para buscar actualizaciones.';
    return toast('📴 Sin conexión a internet para buscar actualizaciones.', 3000);
  }
  if (btn) {
    btn.disabled = true;
    btn.textContent = '⏳ Buscando…';
  }
  if (status) status.textContent = '⏳ Comprobando con el servidor si hay una nueva versión…';

  try {
    let updateFound = false;
    let remoteVer = null;

    // 1. Comprobar meta app-version directamente en el servidor sin caché
    try {
      const res = await fetch('/index.html?_chk=' + Date.now(), { cache: 'no-store', method: 'GET' });
      if (res && res.ok) {
        const html = await res.text();
        const m = html.match(/<meta\s+name=["']app-version["']\s+content=["']([^"']+)["']>/i);
        remoteVer = m ? m[1] : null;
        if (remoteVer && remoteVer !== APP_VERSION) {
          updateFound = true;
        }
      }
    } catch (e) {}

    // 2. Comprobar Service Worker registration
    if ('serviceWorker' in navigator) {
      const reg = window.__swReg || (await navigator.serviceWorker.getRegistration());
      if (reg) {
        if (reg.waiting) {
          updateFound = true;
          if (status) status.textContent = '✨ ¡Nueva versión encontrada! Actualizando…';
          toast('✨ Nueva versión encontrada. Actualizando…', 2500);
          reg.waiting.postMessage('skipWaiting');
          setTimeout(() => location.reload(), 800);
          return;
        }
        await reg.update();
        if (reg.waiting) {
          updateFound = true;
          if (status) status.textContent = '✨ ¡Nueva versión encontrada! Actualizando…';
          toast('✨ Nueva versión encontrada. Actualizando…', 2500);
          reg.waiting.postMessage('skipWaiting');
          setTimeout(() => location.reload(), 800);
          return;
        }
        if (reg.installing) {
          updateFound = true;
          if (status) status.textContent = '⏳ Descargando actualización…';
          toast('⏳ Descargando actualización…', 2000);
          reg.installing.addEventListener('statechange', () => {
            if (reg.installing && reg.installing.state === 'installed') {
              if (status) status.textContent = '✨ ¡Nueva versión lista! Recargando…';
              if (reg.waiting) reg.waiting.postMessage('skipWaiting');
              setTimeout(() => location.reload(), 800);
            }
          });
          return;
        }
      }
    }

    if (updateFound && remoteVer) {
      if (status) status.textContent = `✨ ¡Nueva versión v${remoteVer} disponible! Recargando…`;
      toast(`✨ Nueva versión v${remoteVer} encontrada. Actualizando…`, 2500);
      if ('caches' in window) {
        try {
          const ks = await caches.keys();
          await Promise.all(ks.filter(k => k !== 'tuki-tts-v1').map(k => caches.delete(k)));
        } catch (e) {}
      }
      setTimeout(() => location.reload(true), 1000);
      return;
    }

    if (status) status.textContent = `✅ Tuki Speak v${APP_VERSION} está en la última versión.`;
    toast(`✅ Tuki Speak v${APP_VERSION} está al día.`, 3000);
  } catch (err) {
    if (status) status.textContent = '⚠️ Error al buscar actualizaciones. Intenta de nuevo.';
    toast('No se pudo verificar la actualización. Intenta de nuevo.');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = '🔄 Buscar actualizaciones';
    }
  }
}

export async function updateOfflineCardStats() {
  try {
    const stats = await TukiDB.getStats();
    const kTc = $('#offKpiTc');
    const kAudio = $('#offKpiAudio');
    const kWords = $('#offKpiWords');
    if (kTc) kTc.textContent = (stats.tc + stats.shadow) || '0';
    if (kAudio) kAudio.textContent = stats.audio || '0';
    if (kWords) kWords.textContent = stats.words || '0';
  } catch (e) {}
}

export async function runOfflinePreload(btn) {
  if (btn) {
    btn.disabled = true;
    btn.textContent = '⏳ Precargando contenido…';
  }
  const statusEl = $('#offlineStatus');
  const barEl = $('#offlineBar');
  const fillEl = $('#offlineFill');
  if (barEl) barEl.style.display = 'block';

  try {
    const saved = await TukiDB.preloadOfflinePack(TC_BANK, SHADOW_BANK, (curr, tot, desc) => {
      const pct = Math.round((curr / tot) * 100);
      if (fillEl) fillEl.style.width = pct + '%';
      if (statusEl) statusEl.textContent = `Descargando (${pct}%): ${desc}`;
    });

    let dictWords = 0;
    if (typeof COURSE !== 'undefined') {
      for (const u of COURSE) {
        for (const l of u.lessons) {
          for (const ex of (l.ex || [])) {
            const w = ex[0], es = ex[1];
            if (w && es) {
              const cid = w.toLowerCase() + '|';
              await TukiDB.set('words', cid, { es, ipa: ex[2] || '', src: 'course_offline' });
              dictWords++;
            }
          }
        }
      }
    }

    tukiFanfare();
    canvasConfetti && canvasConfetti({ particleCount: 40, spread: 60 });
    toast('✅ Modo offline listo: ' + saved + ' frases y ' + dictWords + ' palabras sincronizadas.');
    if (statusEl) statusEl.textContent = '⚡ 100% optimizado para usar sin conexión a internet.';
    updateOfflineCardStats();
  } catch (e) {
    toast('⚠️ Error al precargar: ' + errES(e));
    if (statusEl) statusEl.textContent = 'Error durante la sincronización: ' + errES(e);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = '📥 Sincronizar y precargar modo sin conexión';
    }
  }
}

export async function clearOfflineAudio(btn) {
  if (!confirm('¿Deseas vaciar la caché de audios locales guardados en tu dispositivo?')) return;
  if (btn) btn.disabled = true;
  try {
    await TukiDB.clear('audio');
    try { await caches.delete('tuki-tts-v1'); } catch (e) {}
    TTS.cache.clear();
    toast('🧹 Audios en caché eliminados.');
    updateOfflineCardStats();
  } catch (e) {
    toast('Error: ' + errES(e));
  } finally {
    if (btn) btn.disabled = false;
  }
}
