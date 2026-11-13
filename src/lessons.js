// src/lessons.js - Fase 3, modulo 4: construccion y motor de lecciones y practica.
// Extraido de src/main.js. L vive aqui como live binding: main.js lo importa
// y ve cada reasignacion hecha por startLesson/closeLesson.
// No se movieron: COURSE/LESSONS (indice, queda en main.js con el contenido),
// closeLesson, finishLesson y confetti (main.js los reasigna con wrappers en
// TC/PD/ajustes, asi que deben seguir siendo declaraciones de main.js),
// buildPlan/buildVocabLesson/placement (buildPlan tambien se reasigna),
// ni el bloque de interactividad de Tuki (911-1172, va con UI).
// Las funciones de main.js que se usan aqui se importan desde './main.js'
// (import circular; solo se usan dentro de funciones, nunca en top-level,
// y son function declarations con hoisting, igual que en state.js).
// LESSON, LESSONS e isUnlocked son const de main.js y solo se usan dentro
// de funciones, nunca en top-level de este archivo.
import { $, $$, esc, shuffle, pick, sample, avg, scoreSpeech, scorePair, colorOf, typedMatch, normText, align } from './utils.js';
import { S, loseHeart, nextHeartIn, recordEar, recordSpeech, refreshHearts, sm2, soundAvg } from './state.js';
import { HAS_SR, MicCap, Rec, SR_ERR, canSpeak, curRec, recognize, speak, stopAudio, stopRecognize } from './audio.js';
import { LESSON, LESSONS, azureMic, azureReady, beep, bindExtra, bindTukiTutorBanner, buildVocabLesson, closeLesson, confetti, confirmBox, errorTutorHTML, bindErrorTutor, extraResultHTML, finishLesson, isUnlocked, modal, mouthPanelHTML, phonemeHintHTML, renderVocabLearn, save, toast, tukiMood, tukiTutorBannerHTML, wordsHTML } from './main.js';

export const tokensOf = s => s.replace(/[¿¡?!.,;:"]/g, '').split(/\s+/).filter(Boolean);
export function earEx(l, i, P, Q) { return P ? { kind: 'pick', l, pair: P[i % P.length], side: Math.random() < .5 ? 0 : 1 } : { kind: 'quiz', l, q: Q[i % Q.length] }; }
export function sayPairEx(l, pair) { return { kind: 'saypair', l, pair, side: Math.random() < .6 ? 0 : 1 }; }
export function buildLesson(l, mode = 'lesson') {
  if (l.type === 'vocab') return buildVocabLesson(l, mode);
  const ex = [];
  if (l.type === 'dialog') {
    if (mode === 'lesson') ex.push({ kind: 'learn', l });
    const bIdx = l.lines.map((x, i) => x[0] === 'B' ? i : -1).filter(i => i >= 0);
    const aLines = l.lines.filter(x => x[0] === 'A').slice(1).sort((a, b) => a[1].length - b[1].length);
    const bLines = l.lines.filter(x => x[0] === 'B').slice().sort((a, b) => a[1].length - b[1].length);
    bIdx.forEach((i, k) => {
      ex.push({ kind: 'dialog', l, i });
      if (k === 1) ex.push({ kind: 'ltype', l, text: aLines[0][1], es: aLines[0][2] });
      if (k === 2) ex.push({ kind: 'order', l, text: bLines[0][1], es: bLines[0][2], pool: l.lines.map(x => x[1]) });
    });
    const sh = pick(aLines.slice(0, 3));
    ex.push({ kind: 'shadow', l, text: sh[1], es: sh[2] });
    return ex;
  }
  const P = l.pairs ? shuffle(l.pairs) : null, Q = l.quiz ? shuffle(l.quiz) : null;
  const W = shuffle(l.ex), T = shuffle(l.sents), pool = l.sents.map(s => s[0]);
  if (mode === 'lesson') ex.push({ kind: 'learn', l });
  ex.push(earEx(l, 0, P, Q), earEx(l, 1, P, Q));
  ex.push({ kind: 'speak', variant: 'word', l, text: W[0][0], es: W[0][1] });
  ex.push(P ? sayPairEx(l, P[2 % P.length]) : earEx(l, 2, P, Q));
  ex.push({ kind: 'speak', variant: 'word', l, text: W[1][0], es: W[1][1] });
  ex.push({ kind: 'speak', variant: 'sentence', l, text: T[0][0], es: T[0][1] });
  ex.push({ kind: 'order', l, text: T[1][0], es: T[1][1], pool });
  ex.push({ kind: 'shadow', l, text: T[2][0], es: T[2][1] });
  ex.push(P ? sayPairEx(l, P[3 % P.length]) : earEx(l, 3, P, Q));
  if (mode !== 'lesson') ex.push({ kind: 'speak', variant: 'word', l, text: W[2][0], es: W[2][1] });
  return ex;
}
export const unlockedLessons = () => LESSONS.filter(isUnlocked);
export function buildPractice(type, arg) {
  const U = unlockedLessons(), pron = U.filter(l => l.type !== 'dialog');
  if (type === 'sound') return buildLesson(LESSON[arg], 'practice');
  if (type === 'pairs') {
    const withP = pron.filter(l => l.pairs); const src = withP.length ? withP : LESSONS.filter(l => l.pairs).slice(0, 1);
    const out = []; for (let i = 0; i < 10; i++) { const l = pick(src); const p = pick(l.pairs); out.push(i % 2 ? sayPairEx(l, p) : { kind: 'pick', l, pair: p, side: Math.random() < .5 ? 0 : 1 }); }
    return out;
  }
  if (type === 'shadow') {
    const all = []; U.forEach(l => { if (l.type === 'dialog') l.lines.forEach(x => all.push({ l, text: x[1], es: x[2] })); else l.sents.forEach(x => all.push({ l, text: x[0], es: x[1] })); });
    return sample(all, 8).map(x => ({ kind: 'shadow', ...x }));
  }
  if (type === 'words') { // palabras con puntaje bajo
    const weak = Object.entries(S.wd).filter(([k, r]) => r.n && r.sum / r.n < 80).sort((a, b) => a[1].sum / a[1].n - b[1].sum / b[1].n).slice(0, 10);
    return weak.map(([k, r]) => ({ kind: 'speak', variant: 'word', l: LESSON[r.sid] || LESSONS[0], text: r.disp || k, es: '' }));
  }
  // 'weak': mezcla de los sonidos más débiles
  const scored = U.map(l => { const a = soundAvg(l.id); const e = S.ear[l.id]; const ea = e && (e.r + e.w) ? e.r / (e.r + e.w) * 100 : null; const vals = [a, ea].filter(v => v !== null); return { l, v: vals.length ? avg(vals) : 101 }; }).sort((a, b) => a.v - b.v);
  const tops = scored.slice(0, 2).map(x => x.l);
  const out = [];
  tops.forEach(l => { const ex = buildLesson(l, 'practice').filter(e => e.kind !== 'learn'); out.push(...sample(ex, 5)); });
  const weakW = buildPractice('words').slice(0, 3); out.push(...weakW);
  return shuffle(out).slice(0, 12);
}

export let L = null;
export function setL(v) { L = v; }
export function startLesson(l, mode = 'lesson', queue = null, title = '') {
  refreshHearts();
  if (mode === 'lesson' && S.hearts <= 0) return noHeartsModal();
  const q = queue || buildLesson(l, mode);
  if (!q.length) return toast('No hay ejercicios disponibles todavía.');
  L = { l, mode, title: title || (l && l.title) || 'Práctica', queue: q, total: q.length, done: 0, mistakes: 0, speak: [], earOk: 0, earN: 0, retry: {}, start: Date.now(), cur: null };
  $('#full').classList.remove('hidden'); document.body.style.overflow = 'hidden';
  nextEx();
}
export function lessonShell() {
  const pct = Math.round(L.done / L.total * 100);
  // (TUKI-IMPL-M1-001: chip de mundo + «X de 10» (U1) en la cabecera del
  // ejercicio. La posición es la del ejercicio en curso (total − cola),
  // no el contador de aciertos. En práctica sin lección o en la prueba de
  // nivel no hay mundo: solo el contador. La banda de feedback de A sigue
  // siendo el único patrón (setFoot ok/bad); no se añade feedback en línea.)
  const pos = L.total - L.queue.length;
  const ctx = L.l && L.l.unit
    ? `<div class="m1-ctx"><span class="m1-uchip" style="--uc:${L.l.unit.color}">${L.l.unit.icon} U${L.l.ui + 1}</span><span class="m1-ctx-tx">${esc(L.l.unit.title)} · Ejercicio ${pos} de ${L.total}</span><span class="m1-count">${pos} / ${L.total}</span></div>`
    : `<div class="m1-ctx"><span class="m1-ctx-tx">${L.mode === 'placement' ? 'Prueba de nivel' : 'Práctica'} · Ejercicio ${pos} de ${L.total}</span><span class="m1-count">${pos} / ${L.total}</span></div>`;
  return `<div class="lhead"><button class="xbtn" id="xLesson" aria-label="Salir">✕</button><div class="pbar"><i style="width:${pct}%"></i></div>${L.mode === 'lesson' ? `<div class="lhearts">❤️ ${S.hearts}</div>` : `<div class="lhearts" style="color:var(--b-d)">🎯</div>`}</div>
  ${ctx}
  <div class="lbody" id="lbody"></div><div class="lfoot" id="lfoot" aria-live="polite"></div>`;
}
// =================== INTERACTIVIDAD Y ANIMACIONES DE TUKI (TIPO DUOLINGO) ===================
export function nextEx() {
  if (!L) return;
  if (!L.queue.length) return finishLesson();
  L.cur = L.queue.shift(); L.cur.attempt = null; L.cur.sel = null;
  $('#fullInner').innerHTML = lessonShell();
  $('#xLesson').onclick = () => confirmBox('¿Salir de la lección?', 'Perderás el progreso de esta lección.', 'Salir', closeLesson, true);
  (RENDER[L.cur.kind])(L.cur, $('#lbody'));
  bindTukiTutorBanner($('#lbody'));
  // (fase premium, etapa 3: entrada suave por ejercicio; #lbody es un nodo
  // nuevo en cada nextEx, así que la animación corre una vez por ejercicio
  // sin re-animar el resto de la interfaz ni mover el foco)
  const lb = $('#lbody'); if (lb) lb.classList.add('ex-enter');
}
export function setFoot(html, cls = '') {
  const f = $('#lfoot'); f.className = 'lfoot ' + cls; f.innerHTML = html;
  /* (TUKI-IMPL-G-001: banda de feedback de la variante A — solo cuando
     el pie es feedback ok/bad: mini-Tuki raster EXISTENTE (celebrates /
     motivates, sin SVG nuevo) junto al texto, y body.band-open oculta
     la tabbar. El contenido del feedback (textos, XP, «volverá a
     aparecer») no cambia; con cls '' la banda se cierra.) */
  const isFb = cls === 'ok' || cls === 'bad';
  document.body.classList.toggle('band-open', isFb);
  if (isFb) {
    const fb = f.querySelector('.fb');
    if (fb) {
      const img = document.createElement('img');
      img.className = 'fb-tuki-img';
      img.src = cls === 'ok' ? './tuki/tuki-celebrates.webp' : './tuki/tuki-motivates.webp';
      img.alt = 'Tuki';
      const tx = document.createElement('div'); tx.className = 'fb-tx';
      while (fb.firstChild) tx.appendChild(fb.firstChild);
      fb.appendChild(img); fb.appendChild(tx);
    }
  }
  return f;
}
export function footCheck(enabled, extra = '') { setFoot(`${extra || '<span></span>'}<button class="btn primary" id="primaryBtn" ${enabled ? '' : 'disabled'}>Comprobar</button>`); $('#primaryBtn').onclick = checkEar; }
export function enableCheck() { const b = $('#primaryBtn'); if (b) b.disabled = false; }

/* ---- feedback ---- */
export const PRAISE = [
  '¡Excelente pronunciación y oído!',
  '¡Eso es! ¡Vas con toda!',
  '¡Qué berraquera, respuesta correcta!',
  '¡Muy bien! Estás avanzando rápido.',
  '¡Perfecto! Sigue con ese ritmo.'
];
export const ENCOURAGE = [
  '¡No te preocupes! De los errores se aprende.',
  '¡Casi lo tienes! Escúchalo otra vez con calma.',
  '¡Paso a paso! Vamos a revisar la respuesta correcta.',
  '¡Ánimo! La práctica diaria hace al maestro.'
];
export function feedback(ok, answerHTML, expl, sayText, tutor) {
  beep(ok ? 'ok' : 'bad');
  const coachNote = ok ? pick(PRAISE) : pick(ENCOURAGE);
  const m = $('.tuki-tutor-mascot', $('#lbody')) || $('.mascot', $('#lbody'));
  if (m) {
    if (ok) tukiMood('excited', { el: m, particles: 'happy' });
    else tukiMood('sad', { el: m });
  }
  // (tutor con IA en el momento del error: el botón solo aparece si hay
  // proveedor y cuota; nunca bloquea "Continuar")
  const tutorHTML = (!ok && tutor) ? errorTutorHTML(tutor) : '';
  const f = setFoot(`<div class="fb"><h3>${ok ? '✅ ' + coachNote : '❌ ' + coachNote}</h3>${answerHTML ? `<div class="ans">${answerHTML}</div>` : ''}${expl ? `<div class="exp">${expl}</div>` : ''}${tutorHTML}</div>
    <div class="row">${sayText ? `<button class="spk" data-say-n="${esc(sayText)}" title="Escuchar">🔊</button>` : ''}<button class="btn primary" id="primaryBtn">Continuar</button></div>`, ok ? 'ok' : 'bad');
  const s = $('[data-say-n]', f); if (s) s.onclick = () => speak(sayText);
  if (tutorHTML) bindErrorTutor(f, tutor);
  $('#primaryBtn').onclick = nextEx; $('#primaryBtn').focus();
}
/* Contexto medido para el tutor de IA en ejercicios de oído: lo esperado
   vs. lo que el usuario eligió/escribió. Sin inventar datos: si no hay
   respuesta del usuario, no hay contexto. */
export function earTutorCtx(ex) {
  let target = '', heard = '', typeLabel = '';
  if (ex.kind === 'pick') { target = ex.pair[ex.side]; heard = ex.sel == null ? '' : ex.pair[ex.sel]; typeLabel = 'par mínimo'; }
  else if (ex.kind === 'quiz') { target = ex.q.opts[ex.q.a]; heard = ex.sel == null ? '' : ex.q.opts[ex.sel]; typeLabel = 'pregunta'; }
  else if (ex.kind === 'order') { target = ex.text; heard = (ex.sel || []).map(i => ex.tiles[i]).join(' '); typeLabel = 'ordenar frase'; }
  else if (ex.kind === 'ltype') { target = ex.text; heard = typeof ex.sel === 'string' ? ex.sel : ''; typeLabel = 'dictado'; }
  else return null;
  // (C-01: comparación EXACTA, no insensible a mayúsculas: hay opciones
  // de quiz que solo difieren por el acento marcado en mayúsculas,
  // p. ej. «ba-NA-na» vs «ba-na-NA»; son respuestas distintas y la
  // explicación sí tiene sentido. typedMatch ya es insensible a
  // mayúsculas, así que un dictado nunca falla solo por la caja.)
  if (!target || !heard || target === heard) return null;
  return { kind: 'ear', type: ex.kind, typeLabel, target, heard, sound: ex.l && ex.l.sound };
}
export function earResult(ex, ok, answerHTML, expl, sayText) {
  // (fase premium, etapa 6: pista fonémica uniforme al fallar un ejercicio
  // de oído — pick/quiz/order/ltype — con el sonido de la lección)
  const hint = !ok ? phonemeHintHTML(ex.l) : '';
  if (L.mode === 'placement') { L.earN++; if (ok) L.earOk++; L.done++; (L.place = L.place || []).push({ u: ex.pu, ok }); $('.pbar i').style.width = Math.round(L.done / L.total * 100) + '%'; feedback(ok, answerHTML, expl + hint, sayText); return; }
  L.earN++; if (ok) { L.earOk++; L.done++; } else {
    L.mistakes++; ex.attempt = null; L.queue.push({ ...ex });
    if (L.mode === 'lesson') {
      const heartsBefore = S.hearts;
      loseHeart();
      // (Top-5 P2: al perder un corazón, Tuki pasa a pose de ánimo
      // ('sad' → 'motivates'; no hay pose triste en las 7 imágenes).
      // El texto de ánimo ya lo pone feedback() con ENCOURAGE; aquí
      // solo cambia la pose del Profe Tuki en el banner.)
      if (S.hearts < heartsBefore) { const bm = document.querySelector('.tuki-tutor-mascot'); if (bm) tukiMood('sad', { el: bm }); }
    }
  }
  recordEar(ex.l.id, ok);
  // (C-01 TUKI-CONTENIDO-NUEVO-001: guarda el contexto del error fallido
  // para el botón «¿Por qué me equivoqué?» de la hoja de resultados.
  // Sin duplicados seguidos: el mismo ejercicio reencolado no repite.)
  if (!ok) {
    const ec = earTutorCtx(ex);
    if (ec) {
      L.errCtxs = L.errCtxs || [];
      const last = L.errCtxs[L.errCtxs.length - 1];
      if (!last || last.target !== ec.target || last.heard !== ec.heard) L.errCtxs.push(ec);
    }
  }
  $('.pbar i').style.width = Math.round(L.done / L.total * 100) + '%';
  const lh = $('.lhearts'); if (lh && L.mode === 'lesson') lh.textContent = '❤️ ' + S.hearts;
  // (tutor con IA: solo en ejercicios fallidos fuera de la prueba de nivel)
  feedback(ok, answerHTML, expl + hint, sayText, !ok ? earTutorCtx(ex) : null);
  if (!ok && L.mode === 'lesson' && S.hearts <= 0) $('#primaryBtn').onclick = () => { closeLesson(); noHeartsModal(); };
}
export function checkEar() {
  const ex = L.cur; if (ex.sel === null || ex.sel === undefined) return;
  $$('.opt, .tile, textarea').forEach(e => e.disabled = true);
  if (ex.kind === 'pick') {
    const target = ex.pair[ex.side], ok = ex.sel === ex.side, lab = ex.l.pairLabels || ['', ''];
    earResult(ex, ok, `Escuchaste: «${esc(target)}»`, `${esc(ex.pair[0])} = ${esc(lab[0])} · ${esc(ex.pair[1])} = ${esc(lab[1])}`, target);
  } else if (ex.kind === 'quiz') {
    const ok = ex.sel === ex.q.a; earResult(ex, ok, `Respuesta: ${esc(ex.q.opts[ex.q.a])}`, (ex.q.expl ? esc(ex.q.expl) : esc(ex.l.title) + ' · ' + esc(ex.q.say)), ex.q.say);
  } else if (ex.kind === 'order') {
    const got = ex.sel.map(i => ex.tiles[i]).join(' ').toLowerCase(), want = ex.words.join(' ').toLowerCase();
    earResult(ex, got === want, esc(ex.text), esc(ex.es), ex.text);
  } else if (ex.kind === 'ltype') {
    const m = typedMatch(ex.sel, [ex.text]);
    earResult(ex, m.ok, (m.typo ? 'Ojo con la ortografía: ' : 'Correcto: ') + esc(ex.text), esc(ex.es), ex.text);
  }
}

/* ---- renderers ---- */
export const RENDER = {};
RENDER.learn = (ex, body) => {
  const l = ex.l;
  if (l.type === 'vocab') return renderVocabLearn(ex, body);
  if (l.type === 'dialog') {
    body.innerHTML = `${tukiTutorBannerHTML({
      title: 'Profe Tuki · Diálogo 🎬',
      msg: 'Escucha la conversación completa. Luego dirás las líneas de B y recibirás puntaje palabra por palabra.',
      sub: l.scene ? 'Escenario: ' + l.scene : '',
      speakText: 'Escucha la conversación completa con atención. Luego dirás las líneas del personaje B y te calificaré la pronunciación.'
    })}<div class="ex-title">${l.icon} ${esc(l.title)}</div><div class="tipbox">🎬 ${esc(l.scene)}</div>
      <p class="muted small">Escucha el diálogo completo. Luego dirás las líneas de <b>B</b> y recibirás un puntaje por palabra. Toca cualquier palabra para oírla lento.</p>
      <div class="dlg">${l.lines.map(x => `<div class="msg ${x[0] === 'B' ? 'me' : 'bot'}"><b>${x[0]}:</b> ${wordsHTML(x[1])}<div class="small" style="opacity:.8">${esc(x[2])}</div></div>`).join('')}</div>
      <button class="btn blue" id="playAll">▶️ Escuchar diálogo</button>`;
    $('#playAll').onclick = () => { let i = 0; const nxt = () => { if (i < l.lines.length && L) speak(l.lines[i++][1], false, nxt); }; nxt(); };
  } else {
    body.innerHTML = `<div class="badge-new">NUEVO SONIDO</div><div class="ex-title">${l.icon} ${esc(l.title)} <span class="ipa">/${esc(l.sound)}/</span></div>
      ${tukiTutorBannerHTML({
        title: 'Profe Tuki · Fonética 👄',
        msg: `Aprende el sonido /${l.sound}/ paso a paso con Tuki.`,
        speakText: l.expl + (l.mouth ? '. Colocación de la boca: ' + l.mouth : '')
      })}
      <div class="tipbox">${esc(l.expl)}${l.mouth ? `<p style="margin:6px 0 0"><b>👄 Boca y lengua:</b> ${esc(l.mouth)}</p>` : ''}</div>${mouthPanelHTML(l.id)}
      <h3>Ejemplos (toca para escuchar)</h3>
      <div class="wlist">${l.ex.map(w => `<div class="witem"><button class="spk" data-say-n="${esc(w[0])}">🔊</button><div><div class="en">${esc(w[0])}</div><div class="es">${esc(w[1])}</div></div><button class="spk slow" data-say="${esc(w[0])}" style="margin-left:auto" title="Lento">🐢</button></div>`).join('')}</div>
      ${l.pairs ? `<h3 style="margin-top:14px">Pares mínimos</h3><div class="chips">${l.pairs.map(p => `<button class="chip" data-pair="${esc(p.join('|'))}">${esc(p[0])} · ${esc(p[1])}</button>`).join('')}</div>` : ''}`;
    $$('[data-say-n]', body).forEach(b => b.onclick = () => speak(b.dataset.sayN));
    $$('[data-pair]', body).forEach(b => b.onclick = () => { const [a, c] = b.dataset.pair.split('|'); speak(a, false, () => setTimeout(() => speak(c), 250)); });
  }
  setFoot(`<span class="muted small">${L.mode === 'lesson' ? 'Lección ' + (l.li + 1) + ' · ' + esc(l.unit.title) : ''}</span><button class="btn primary" id="primaryBtn">¡Entendido!</button>`);
  $('#primaryBtn').onclick = () => { L.done++; nextEx(); };
};
export function optionsHTML(opts, cls = 'opts') { return `<div class="${cls}">${opts.map((o, i) => `<button class="opt" data-i="${i}"><span class="k">${i + 1}</span><span>${o}</span></button>`).join('')}</div>`; }
export function bindOptions(body, ex, onPick) { $$('.opt', body).forEach(b => b.onclick = () => { $$('.opt', body).forEach(x => x.classList.remove('sel')); b.classList.add('sel'); ex.sel = +b.dataset.i; beep('tap'); enableCheck(); onPick && onPick(ex.sel); }); }
RENDER.pick = (ex, body) => {
  const target = ex.pair[ex.side], lab = ex.l.pairLabels || ['', ''];
  body.innerHTML = `${tukiTutorBannerHTML({
    title: 'Profe Tuki · Afina el Oído 👂',
    msg: 'Escucha con atención: ¿cuál de estas dos palabras dije?',
    sub: ex.l.sound ? `Par mínimo · Sonido /${ex.l.sound}/` : '',
    speakText: 'Afina el oído. Escucha atentamente y elige cuál palabra estás oyendo.'
  })}<div class="ex-title">¿Qué palabra escuchas?</div><div class="muted small" style="margin:-8px 0 12px">Par mínimo · <span class="ipa">/${esc(ex.l.sound)}/</span></div>
    <div class="listen-row"><button class="spk big" id="pl">🔊</button><button class="spk slow" id="pls">🐢</button></div>
    <div class="pair">${ex.pair.map((w, i) => `<button class="opt" data-i="${i}"><span>${esc(w)}</span><span class="small muted">${esc(lab[i])}</span></button>`).join('')}</div>`;
  $('#pl').onclick = () => speak(target); $('#pls').onclick = () => speak(target, true);
  bindOptions(body, ex); footCheck(false); if (S.settings.autoplay) setTimeout(() => speak(target), 300);
};
RENDER.quiz = (ex, body) => {
  const q = ex.q; const order = shuffle(q.opts.map((o, i) => i)); ex.map = order;
  body.innerHTML = `${tukiTutorBannerHTML({
    title: 'Profe Tuki · Desafío 🧠',
    msg: 'Toca la opción correcta para responder.',
    speakText: q.q
  })}<div class="ex-title">${esc(q.q)}</div>${q.hide ? '<div style="height:10px"></div>' : '<div class="listen-row"><button class="spk big" id="pl">🔊</button><button class="spk slow" id="pls">🐢</button></div>'}${optionsHTML(order.map(i => esc(q.opts[i])))}`;
  if (!q.hide) { $('#pl').onclick = () => speak(q.say); $('#pls').onclick = () => speak(q.say, true); }
  bindOptions(body, ex, i => { ex.sel = order[i]; }); footCheck(false); if (S.settings.autoplay && !q.hide) setTimeout(() => speak(q.say), 300);
};
RENDER.order = (ex, body) => {
  ex.words = tokensOf(ex.text);
  const lower = new Set(ex.words.map(w => w.toLowerCase()));
  const distract = shuffle([...new Set((ex.pool || []).flatMap(tokensOf))].filter(w => !lower.has(w.toLowerCase()))).slice(0, 2);
  ex.tiles = shuffle([...ex.words, ...distract]); ex.sel = [];
  body.innerHTML = `${tukiTutorBannerHTML({
    title: 'Profe Tuki · Ordenar Palabras 🧩',
    msg: 'Escucha la frase y conecta las palabras en el orden correcto.',
    sub: ex.es ? 'Significado: ' + ex.es : '',
    speakText: 'Escucha la frase y conecta las palabras en el orden correcto.'
  })}<div class="ex-title">Escucha y ordena la frase</div><div class="prompt"><button class="spk" id="pl">🔊</button><button class="spk slow" id="pls">🐢</button><div class="muted">${esc(ex.es)}</div></div>
    <div class="answer-line" id="ansLine"></div><div class="bank" id="bank">${ex.tiles.map((t, i) => `<button class="tile" data-i="${i}">${esc(t)}</button>`).join('')}</div>`;
  $('#pl').onclick = () => speak(ex.text); $('#pls').onclick = () => speak(ex.text, true);
  const redraw = () => {
    $('#ansLine').innerHTML = ex.sel.map((i, k) => `<button class="tile" data-k="${k}">${esc(ex.tiles[i])}</button>`).join('');
    $$('#bank .tile').forEach(b => b.classList.toggle('used', ex.sel.includes(+b.dataset.i)));
    $$('#ansLine .tile').forEach(b => b.onclick = () => { ex.sel.splice(+b.dataset.k, 1); redraw(); });
    const pb = $('#primaryBtn'); if (pb) pb.disabled = !ex.sel.length;
  };
  $$('#bank .tile').forEach(b => b.onclick = () => { if (!ex.sel.includes(+b.dataset.i)) { ex.sel.push(+b.dataset.i); beep('tap'); speak(ex.tiles[+b.dataset.i]); redraw(); } });
  footCheck(false); redraw(); if (S.settings.autoplay) setTimeout(() => speak(ex.text), 300);
};
RENDER.ltype = (ex, body) => {
  body.innerHTML = `${tukiTutorBannerHTML({
    title: 'Profe Tuki · Dictado ✍️',
    msg: 'Escucha con atención y escribe la frase en inglés sin errores.',
    sub: 'Toca 🐢 para escucharla despacio.',
    speakText: 'Escucha con atención y escribe la frase en inglés sin errores.'
  })}<div class="ex-title">Escribe lo que escuchas</div><div class="listen-row"><button class="spk big" id="pl">🔊</button><button class="spk slow" id="pls">🐢</button></div>
    <textarea class="inp" id="tin" placeholder="Escribe en inglés…" autocapitalize="off" autocomplete="off" spellcheck="false"></textarea>`;
  $('#pl').onclick = () => speak(ex.text); $('#pls').onclick = () => speak(ex.text, true);
  const t = $('#tin'); t.oninput = () => { ex.sel = t.value.trim() || null; $('#primaryBtn').disabled = !ex.sel; };
  t.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); if (ex.sel) checkEar(); } };
  footCheck(false); if (S.settings.autoplay) setTimeout(() => speak(ex.text), 300);
};

/* ---- ejercicios de voz ---- */
export const SPEAK_TITLES = { word: 'Pronuncia esta palabra', sentence: 'Lee esta frase en voz alta', shadow: 'Shadowing: escucha e imita', dialog: 'Tu turno en la conversación', saypair: 'Di esta palabra' };
export function speakTarget(ex) { if (ex.kind === 'dialog') return ex.l.lines[ex.i][1]; if (ex.kind === 'saypair') return ex.pair[ex.side]; return ex.text; }
RENDER.speak = RENDER.shadow = RENDER.dialog = RENDER.saypair = (ex, body) => {
  const target = speakTarget(ex), variant = ex.kind === 'speak' ? ex.variant : ex.kind;
  let ctx = '';
  if (ex.kind === 'dialog') {
    const prev = ex.l.lines.slice(Math.max(0, ex.i - 2), ex.i);
    ctx = `<div class="tipbox small">🎬 ${esc(ex.l.scene)}</div><div class="dlg">${prev.map(x => `<div class="msg ${x[0] === 'B' ? 'me' : 'bot'}">${x[0] === 'A' ? `<button class="mini" data-say-n="${esc(x[1])}">🔊</button> ` : ''}${esc(x[1])}</div>`).join('')}</div>`;
  }
  const es = ex.kind === 'dialog' ? ex.l.lines[ex.i][2] : ex.kind === 'saypair' ? `Par mínimo: ${ex.pair[0]} / ${ex.pair[1]} — ${(ex.l.pairLabels || [])[ex.side] || ''}` : ex.es;

  const tutorVoiceTitle = variant === 'shadow'
    ? 'Profe Tuki · Shadowing 👥'
    : variant === 'dialog'
    ? 'Profe Tuki · Conversación 💬'
    : variant === 'saypair'
    ? 'Profe Tuki · Sonidos Clave 🎯'
    : 'Profe Tuki · Pronunciación 🎤';

  const tutorVoiceMsg = variant === 'shadow'
    ? 'Escucha 1 o 2 veces e imita el ritmo y la entonación como una sombra.'
    : variant === 'dialog'
    ? '¡Tu turno en la conversación! Di en voz alta la línea de tu personaje.'
    : variant === 'saypair'
    ? `Pronuncia claro para distinguir entre ${ex.pair[0]} y ${ex.pair[1]}.`
    : 'Lee en voz alta y pronuncia con calma. Recuerda: ¡en voz no pierdes vidas!';

  body.innerHTML = `${tukiTutorBannerHTML({
    title: tutorVoiceTitle,
    msg: tutorVoiceMsg,
    sub: es ? 'Significado: ' + es : 'Toca el micrófono cuando estés listo para hablar.',
    speakText: tutorVoiceMsg
  })}<div class="ex-title">${SPEAK_TITLES[variant]}</div>${ctx}
    <div class="card" style="margin-bottom:12px"><div class="target" id="tgt">${wordsHTML(target)}</div>${es ? `<div class="muted small">${esc(es)}</div>` : ''}
    <div class="row" style="margin-top:10px"><button class="spk" id="pl" title="Escuchar">🔊</button><button class="spk slow" id="pls" title="Lento">🐢</button><span class="muted small">${variant === 'shadow' ? 'Escucha 1-2 veces y repite imitando el ritmo y la entonación.' : 'Toca una palabra para oírla lento.'}</span></div></div>
    <div id="micArea"></div><div id="res"></div>`;
  $$('[data-say-n]', body).forEach(b => b.onclick = () => speak(b.dataset.sayN));
  $('#pl').onclick = () => speak(target); $('#pls').onclick = () => speak(target, true);
  const skip = `<button class="btn ghost" id="skipBtn">${canSpeak() ? 'No puedo hablar ahora' : 'Saltar'}</button>`;
  setFoot(`${skip}<button class="btn primary" id="primaryBtn" disabled>Continuar</button>`);
  $('#skipBtn').onclick = () => { L.done++; nextEx(); };
  if (canSpeak()) {
    $('#micArea').innerHTML = `<button class="mic" id="mic">🎤 Toca para hablar</button>`;
    $('#mic').onclick = () => doMic($('#mic'), (alts, url, az) => onSpeechResult(ex, target, alts, url, az), target);
  } else {
    $('#micArea').innerHTML = `<div class="notice">⚠️ Tu navegador no soporta reconocimiento de voz, así que no puedo darte un puntaje. <b>Chrome</b> (Android o computador) o Edge funcionan mejor. Mientras tanto puedes grabarte y comparar con el modelo.</div>
      ${Rec.supported ? `<button class="mic" id="recOnly">⏺ Grabar mi voz</button>` : ''}`;
    const rb = $('#recOnly'); if (rb) rb.onclick = () => recOnlyToggle(rb, url => {
      $('#res').innerHTML = compareHTML(target, url);
      bindCompare(target, url);
      setFoot(`<button class="btn ghost" id="skipBtn">Necesito practicar</button><button class="btn primary" id="primaryBtn">👍 Sonó parecido</button>`);
      $('#skipBtn').onclick = () => { L.done++; nextEx(); }; $('#primaryBtn').onclick = () => { L.done++; nextEx(); };
    });
  }
  if (S.settings.autoplay) setTimeout(() => speak(target, false, variant === 'shadow' ? () => setTimeout(() => L && L.cur === ex && speak(target, true), 400) : null), 350);
};
export function createMicMeter(btn) {
  let vu = $('#micVu');
  if (vu) vu.remove();
  if (btn && btn.parentElement) {
    vu = document.createElement('div');
    vu.id = 'micVu';
    vu.className = 'mic-vu-wrap';
    vu.innerHTML = `<div class="mic-vu-bar"><div class="mic-vu-fill low" id="micVuFill"></div></div>
      <div class="mic-vu-status low" id="micVuStatus">
        <span class="mic-vu-icon">🔉</span> <span class="mic-vu-text">Esperando voz… habla cerca del micrófono</span>
      </div>`;
    btn.parentElement.appendChild(vu);
  }
  let lastState = '';
  return {
    update(rms) {
      if (!vu) return;
      const fill = $('#micVuFill', vu), status = $('#micVuStatus', vu);
      const text = $('.mic-vu-text', vu), icon = $('.mic-vu-icon', vu);
      if (!fill || !status) return;
      const pct = Math.min(100, Math.max(4, Math.round(rms * 420)));
      fill.style.width = pct + '%';
      let state = 'low', sText = 'Volumen bajo: acércate al micrófono', sIcon = '🔉';
      if (rms >= 0.018 && rms <= 0.22) {
        state = 'good'; sText = '¡Volumen óptimo! Te escucho con claridad'; sIcon = '🟢';
      } else if (rms > 0.22) {
        state = 'high'; sText = 'Demasiado volumen o ruido de fondo'; sIcon = '🔴';
      }
      if (state !== lastState) {
        lastState = state;
        fill.className = 'mic-vu-fill ' + state;
        status.className = 'mic-vu-status ' + state;
        if (text) text.textContent = sText;
        if (icon) icon.textContent = sIcon;
      }
    },
    destroy() {
      if (vu) {
        vu.style.opacity = '0';
        vu.style.transition = 'opacity .2s ease';
        setTimeout(() => { if (vu.parentElement) vu.remove(); }, 200);
      }
    }
  };
}

export async function doMic(btn, onResult, target) {
  if (curRec) { stopRecognize(); return; }
  if (MicCap.active) { MicCap.stop(); return; }
  speechSynthesis && speechSynthesis.cancel(); stopAudio();
  if (target && azureReady()) return azureMic(btn, onResult, target);
  if (!HAS_SR) { toast(SR_ERR.unsupported + ' Usa Chrome o configura Azure en Ajustes.', 4000); return; }
  btn.classList.add('rec'); btn.innerHTML = '🔴 Escuchando… habla ahora';
  const micMeter = createMicMeter(btn);
  let recOn = false, stream = null, anCtx = null, animId = null;
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 } });
      anCtx = new (window.AudioContext || window.webkitAudioContext)();
      const src = anCtx.createMediaStreamSource(stream), an = anCtx.createAnalyser();
      an.fftSize = 256; src.connect(an);
      const buf = new Float32Array(an.fftSize);
      const loop = () => {
        if (!btn.classList.contains('rec')) return;
        an.getFloatTimeDomainData(buf);
        let s = 0; for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i];
        micMeter.update(Math.sqrt(s / buf.length));
        animId = requestAnimationFrame(loop);
      };
      loop();
    } catch (e) {}
  }
  if (S.settings.recordVoice && Rec.supported) { try { await Rec.start(); recOn = true; } catch (e) {} }
  try {
    const alts = await recognize();
    const url = recOn ? await Rec.stop() : null;
    onResult(alts, url);
  } catch (err) {
    if (recOn) await Rec.stop();
    toast(SR_ERR[err] || ('Error de voz: ' + err), 3500);
  } finally {
    if (animId) cancelAnimationFrame(animId);
    if (stream) stream.getTracks().forEach(t => t.stop());
    if (anCtx) anCtx.close().catch(() => {});
    micMeter.destroy();
    btn.classList.remove('rec');
    btn.innerHTML = '🎤 Toca para hablar de nuevo';
  }
}
export let recOnlyActive = false;
export async function recOnlyToggle(btn, onDone) {
  if (recOnlyActive) { recOnlyActive = false; const url = await Rec.stop(); btn.classList.remove('rec'); btn.innerHTML = '⏺ Grabar de nuevo'; onDone(url); return; }
  try { await Rec.start(); recOnlyActive = true; btn.classList.add('rec'); btn.innerHTML = '⏹ Detener grabación'; setTimeout(() => { if (recOnlyActive) btn.click(); }, 15000); }
  catch (e) { toast('No se pudo acceder al micrófono: ' + (e.message || e)); }
}
export function compareHTML(target, url) { return `<div class="cmp"><button class="btn blue sm" data-cmp="model">🔊 Modelo</button><button class="btn ghost sm" data-cmp="slow">🐢 Lento</button>${url ? `<button class="btn orange sm" data-cmp="me">▶️ Mi voz</button>` : ''}</div>`; }
export function bindCompare(target, url, root = document) { $$('[data-cmp]', root).forEach(b => b.onclick = () => { const k = b.dataset.cmp; if (k === 'model') speak(target); else if (k === 'slow') speak(target, true); else Rec.play(url); }); }
/* Contexto medido para el tutor de IA en ejercicios de voz: objetivo,
   lo escuchado, puntaje y palabras con puntaje bajo (máx. 6), más la
   pista fonémica medida de Azure cuando existe. Sin inventar datos. */
export function voiceTutorCtx(ex, target, r) {
  if (!target || !r || r.pct == null) return null;
  const weak = (r.words || []).filter(w => w.s != null && w.s < 0.8).slice(0, 6).map(w => ({ t: String(w.tok || '').replace(/[.,!?;:"]/g, ''), s: w.s }));
  const typeLabel = ex.kind === 'speak' ? (ex.variant === 'sentence' ? 'frase' : ex.variant === 'word' ? 'palabra' : ex.variant) : ex.kind === 'saypair' ? 'par mínimo' : ex.kind;
  return { kind: 'voice', type: ex.kind === 'speak' ? ex.variant : ex.kind, typeLabel, target, heard: r.heard || '', pct: r.pct, weak, tips: r.tips || [], sound: ex.l && ex.l.sound };
}
export function onSpeechResult(ex, target, alts, url0, az) {
  let r;
  if (az) { r = az; if (ex.kind === 'saypair') { r.ok = r.pct >= S.settings.threshold; r.msg = (r.tips && r.tips[0]) || (r.ok ? '¡Bien pronunciada!' : 'Intenta de nuevo exagerando el sonido.'); } }
  else if (ex.kind === 'saypair') { r = scorePair(target, ex.pair[1 - ex.side], alts); r.words = [{ tok: target, s: r.pct / 100, c: colorOf(r.pct / 100) }]; r.alts = alts; r.conf = alts[0].c; }
  else r = scoreSpeech(target, alts);
  if (!ex.attempt || r.pct >= ex.attempt.pct) ex.attempt = r;
  ex.tries = (ex.tries || 0) + 1;
  const url = url0 || (Rec.url && S.settings.recordVoice ? Rec.url : null);
  $('#tgt').innerHTML = wordsHTML(target, r.words);
  const retry = r.words.filter(w => w.c !== 'g').map(w => w.tok.replace(/[.,!?;:"]/g, ''));
  const pass = ex.kind === 'saypair' ? r.ok : r.pct >= S.settings.threshold;
  $('#res').innerHTML = `<div class="card"><div class="row between"><div><div class="scorebig" style="color:${pass ? 'var(--g-d)' : r.pct >= 50 ? 'var(--o-d)' : 'var(--r-d)'}">${r.pct}%</div><div class="small muted">Mejor intento: ${ex.attempt.pct}% · intentos: ${ex.tries}</div></div><div class="small" style="text-align:right">🟢 bien · 🟡 dudoso · 🔴 repetir</div></div>
    <div class="heard">Escuché: «<b>${esc(r.heard)}</b>»${r.conf ? ` <span class="muted small">(confianza ${Math.round(r.conf * 100)}%)</span>` : ''}</div>
    ${r.msg ? `<div class="small" style="margin-top:4px">${esc(r.msg)}</div>` : ''}
    ${retry.length && ex.kind !== 'saypair' ? `<div class="small" style="margin-top:8px">Repite: ${retry.map(w => `<span class="wd r" data-say="${esc(w)}">${esc(w)} 🐢</span>`).join(' ')}</div>` : ''}
    ${r.alts.length > 1 ? `<details class="small muted" style="margin-top:6px"><summary>Otras interpretaciones del reconocedor</summary>${r.alts.slice(1).map(a => esc(a.t)).join(' · ')}</details>` : ''}
    ${compareHTML(target, url)}${extraResultHTML(r, target, url, ex)}</div>`;
  bindCompare(target, url, $('#res')); bindExtra($('#res'), r, target, url, ex);
  beep(pass ? 'ok' : 'bad');
  const m = $('.tuki-tutor-mascot', $('#lbody')) || $('.mascot', $('#lbody'));
  if (m) {
    if (pass) tukiMood('excited', { el: m, particles: 'happy' });
    else tukiMood('sad', { el: m });
  }
  const speechTutorMsg = pass
    ? (r.pct >= 90 ? '🌟 Profe Tuki: ¡Excelente pronunciación!' : '✅ Profe Tuki: ¡Bien dicho!')
    : '🔁 Profe Tuki: ¡Casi! Sigue practicando';
  // (tutor con IA: solo al fallar un ejercicio de voz; el botón no aparece
  // sin proveedor o con la cuota agotada, y nunca bloquea "Continuar")
  const tutor = !pass ? voiceTutorCtx(ex, target, r) : null;
  // (C-01: mismo registro que en earResult, para el fin de lección.)
  if (tutor) {
    L.errCtxs = L.errCtxs || [];
    const last = L.errCtxs[L.errCtxs.length - 1];
    if (!last || last.target !== tutor.target || last.heard !== tutor.heard) L.errCtxs.push(tutor);
  }
  const tutorHTML = tutor ? errorTutorHTML(tutor) : '';
  const f = setFoot(`<div class="fb"><h3>${speechTutorMsg}</h3><div class="exp">${pass ? 'Puedes continuar o intentar mejorar tu puntaje.' : 'Escucha el modelo lento 🐢, fíjate en las palabras en rojo o amarillo y vuelve a intentarlo. En voz no pierdes vidas.'}${!pass ? phonemeHintHTML(ex.l, r) : ''}</div>${tutorHTML}</div>
    <div class="row"><button class="btn ghost" id="againBtn">Repetir</button><button class="btn primary" id="primaryBtn">Continuar</button></div>`, pass ? 'ok' : 'bad');
  $('#againBtn').onclick = () => $('#mic').click();
  if (tutorHTML) bindErrorTutor(f, tutor);
  $('#primaryBtn').onclick = () => { const best = ex.attempt; recordSpeech(ex.l.id, best); if (L.mode === 'placement') (L.place = L.place || []).push({ u: ex.pu, ok: best.pct >= S.settings.threshold }); if (ex.cardKey && S.deck[ex.cardKey]) sm2(S.deck[ex.cardKey], best.pct >= S.settings.threshold ? 4 : 2); if (best.words) best.words.forEach(w => { const k = normText(w.tok).join(' '); if (S.wd[k]) S.wd[k].sid = ex.l.id; }); save(); L.speak.push(best.pct); L.done++; nextEx(); };
}

/* ---- fin de lección ---- */
export function victoryConfetti(waves = 3) {
  for (let w = 0; w < waves; w++) {
    setTimeout(() => {
      const c = document.createElement('div');
      c.className = 'confetti';
      const cols = ['#1fa463', '#ff9f1c', '#1cb0f6', '#ffd23f', '#e5484d', '#8b5cf6', '#ec4899', '#facc15'];
      // (fase premium, etapa 7: 50 → 40 piezas por ola; mismos colores,
      // tamaños y tiempos, solo menos nodos: 5 olas pasan de 250 a 200)
      for (let i = 0; i < 40; i++) {
        const p = document.createElement('i');
        p.style.left = Math.random() * 100 + '%';
        p.style.background = pick(cols);
        p.style.animationDuration = (1.6 + Math.random() * 2) + 's';
        p.style.animationDelay = (Math.random() * 0.4) + 's';
        const sz = Math.floor(Math.random() * 7) + 8;
        p.style.width = sz + 'px';
        p.style.height = (sz * 1.3) + 'px';
        if (Math.random() > 0.6) p.style.borderRadius = '50%';
        c.appendChild(p);
      }
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 4800);
    }, w * 420);
  }
}
export function noHeartsModal() {
  modal(`<div style="text-align:center"><div style="font-size:54px">💔</div><h2>Te quedaste sin vidas</h2><p class="muted">Recuperas 1 vida cada 30 minutos (la próxima en ~${nextHeartIn()} min). También puedes ganar una vida completando una práctica.</p></div>
    <div class="row" style="margin-top:14px"><button class="btn ghost block" data-x>Esperar</button><button class="btn blue block" data-p>Practicar</button></div>`,
    (el, close) => { $('[data-x]', el).onclick = close; $('[data-p]', el).onclick = () => { close(); startLesson(null, 'practice', buildPractice('weak'), 'Repaso de sonidos débiles'); }; });
}
