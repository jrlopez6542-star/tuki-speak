import './styles/app.css';
import { TukiDB } from './tuki-db.js';
import { $, $$, esc, decodeEnt, decodeDeep, shuffle, pick, sample, clamp, avg, dayKey, dayDiff, numWords, normText, lev, charSim, align, simScore, colorOf, typedMatch, scoreSpeech, scorePair, sleep, hashStr, b64FromBytes, f32ToB64 } from './utils.js';
import { S, setState, KEY, DEFAULT_SETTINGS, DAY, HEART_MS, MAX_HEARTS, BAD_KEYS, load, refreshHearts, loseHeart, nextHeartIn, todayRec, isDone, recordSpeech, recordEar, soundAvg, addToDeck, sm2, dueCards, sm2Preview, intervalLabel } from './state.js';
import { VOICES, loadVoices, pickVoice, speak, SR, HAS_SR, curRec, setCurRec, recognize, stopRecognize, SR_ERR, Rec, canSpeak, vibrate, AZ_VOICES, OA_VOICES, GEM_VOICES, TTS, tvPref, AZ_NAME_RE, ttsEngineFor, azVoiceFor, stopAudio, cloudTTSReady, azureTTS, openaiTTS, ttsRate, cloudTTSBlob, ES_PREF, pickEsVoice, deviceSpeakEn, deviceSpeakEs, speakSeq, resample, StreamResampler, encodeWAV, MicCap, SAPI_IPA, toIPA, PH_TIPS, azureToResult, azureAssess, azureSTT, openaiSTT, pitchTrack, drawTrack, contourDir, expectRise } from './audio.js';
import { L, setL, tokensOf, earEx, sayPairEx, buildLesson, unlockedLessons, buildPractice, startLesson, lessonShell, nextEx, setFoot, footCheck, enableCheck, PRAISE, ENCOURAGE, feedback, earResult, checkEar, RENDER, optionsHTML, bindOptions, SPEAK_TITLES, speakTarget, createMicMeter, doMic, recOnlyActive, recOnlyToggle, compareHTML, bindCompare, onSpeechResult, victoryConfetti, noHeartsModal } from './lessons.js';
import { SCENARIOS, SCEN_ES, CHAT, chatSystem, geminiCall, gemini, parseTutor, TUKI_API, SHARED_TEXT_MODELS, keysLocked, fbSignedIn, fbCanShare, gemShared, azOwn, azShared, noAIMsg, sharedModel, tukiApi, AZT, azAuth, aiModeText, aiQuotaText, recordAiQuota, aiQuotaToday, aiQuotaLow, azFetch, azureReady, LIVE, LIVE_LABEL, GEMINI_LIVE_MODELS, currentProvider, LEVELS, LEVEL_KEYS, defaultLevel, chatLevel, levelRules, TUTOR_LANGS, tutorLang, langRules, TUTOR_SPEEDS, tutorSpeed, chatMul, speedRules, HELP_COMMANDS, isPerfect, tutorSpeechParts, liveSystem, liveSet, liveUI, liveAppend, liveTurnDone, LIVE_REC, LIVE_REC_MAX_SAMPLES, LIVE_REC_MIN_WORDS, LIVE_REC_MIN_SEC, LIVE_REC_MAX_TURNS, liveRecReset, liveRecStart, liveRecPush, liveRecTurnStart, liveRecTurnEnd, liveRecTrim, liveRecPickTurns, livePronWeak, livePronWeakWords, livePronEvaluate, livePronMaybeEvaluate, livePronSheetUpdate, Player, WORKLET_SRC, startMicStream, liveErrES, connectGemini, onGeminiMsg, startGeminiLive, listLiveModels, startOpenAIRealtime, onOAIEvent, startLive, stopLive, openaiChat, resetChat, tapWords, quoteTap, msgActs, trHTML, msgText, chatDraw, CACHE_KEYS, MEM_WCACHE, MEM_TCACHE, cacheGet, cacheSet, AIQ, GEM_QUICK_MODELS, aiTransient, aiStatus, aiBusyErr, gemQuickCall, aiQuick, toggleTranslate, errorTutorAvailable, explainError, chatSend, chatMic, fitChat, uid, clamp100, parseJSONLoose, aiJSON, sayBtns, bindSayTap, scoreBarH, convoTranscript, addLearnItems, flagHard, SUM_SYS, ensureSP, sumPendingAdd, summarizeConvo, runPendingSummary, summaryHTML, aiFriendly, openSummarySheet, endConversation, convoPracticeItems, hardWords, hardDrillItems, startHardDrill, numHash, SENIORITY, IV_END, modeRules, TOPICS, todayTopic, chSecs, enterMode, leaveMode, interviewSetup, ivQuestion, reportInterview, interviewHTML, openInterviewSheet, finishInterview, challengeSetup, chLeft, startChTimer, finishChallenge, chStreak, practiceErrorsData, practiceErrorsHasData, practiceErrorsAIAvailable, generatePracticeErrors, validatePracticeErrors, practiceErrorsToQueue, startPracticeErrors, PRACTICE_ERRORS_CACHE_KEY, weekKey, weeklyReviewData, weeklyReviewEligible, weeklyReviewAvailable, weeklyReviewValidate, weeklyReviewCacheGet, weeklyReviewCacheSet, generateWeeklyReview, WEEKLY_REVIEW_CACHE_KEY, chatProfileText, clearChatProfile, chatCompactAvailable, compactChatHistory, maybeCompactChat, CHAT_COMPACT_AT, CHAT_COMPACT_KEEP, CHAT_COMPACT_TAKE, levelSuggestion, levelSuggestionRaw, applyLevelSuggestion, levelSuggestHTML, bindLevelSuggest, markLevelSuggestShown, customScenarios, addCustomScenario, removeCustomScenario, registerCustomScenarios, sanitizeScenario } from './chat.js';
import { b64u, unb64u, clampNum, deepClean, sanitizeSettings, sanitizeState, KDF_ITER, LOCK_FIELDS, KEYS_LOCAL, KS, LOCKED, setLocked, kdf, newKS, sealKeys, validBlob, openKeys, ksFromPhrase, keysObj, keysSig, hasAnyKey, phraseStrength, lockApply, lockRelease, getLockSig, setLockSig, applyKeys, setLocalLock, FB_VER, FB_BASE, FB_CFG, FB_HINT, FB_OWNER, CLOUD_META, CLOUD_SCHEMA, SYNC_MIN_MS, SYNC_DEBOUNCE_MS, CLOUD_MAX, syncMin, syncDebounce, FB, AUTH_ERR, authErr, devName, fbLoad, fbFail, localHasData, cloudMeta, setCloudMeta, uref, readMeta, readData, cloudSettings, packProgress, keysForCloud, cloudPush, adoptMerged, cloudFirstSync, askOtherOwner, cloudSync, fbSchedule, fbMarkDirty, fbGoogle, fbEmail, fbReset, fbVerify, fbReload, fbSignOut, unlockPrompt, unlockKeys, createPhrase, changePhrase, forgetPhrase, acMsg, acctHTML, keysHTML, bindAcct, bindKeys } from './account.js';
import { HANDS_FREE_BANK, LAST_REC, MASCOT, MISSION_SCENARIOS, PD_LISTEN, PD_MIXED, PD_SPEAK, SHADOW_BANK, STUDIO_PRESET, TC_BANK, TC_CTX, TC_LV, TC_SESSION, TUKI_QUOTES_ES, TUKI_SHOP_ITEMS, TV, TV_AZ, TV_SAMPLE, V, WORDS_MODE, addCoins, adminHTML, adminRefresh, bindAdmin, bindExtra, bindMissionGoals, bindWordsToggle, buildPlacement, buildTopErrorsPractice, canvasConfetti, checkForAppUpdates, checkReminder, clearOfflineAudio, closeWordPop, confirmBox, countUpAll, currentLesson, dictLookup, downloadICS, ensure25, ensure251, ensure26, ensure27, errES, extraResultHTML, fbkCardHTML, getTop5Errors, guideSheet, httpErr, initServiceWorker, initTukiAnimPause, interactWithTuki, initTukiSleepWatch, makeMascotClickable, tukiSleepBusy, isFeatureUnlocked, lessonItems, lessonSheet, lsGet, lsSet, missionGoalsHTML, modal, netBanner, openFeedback, openHandsFreeModal, openInterviewSimulatorModal, openMissionsModal, openMouthSelector, openPhotoPractice, openShadowingModal, openTravelGuideModal, openTukiShopModal, openWordPop, pdCardHTML, pdEvaluate, pdFinish, pdGenAvailable, pdGenCacheGet, pdGenCacheSet, pdGenData, pdGenHasData, pdGenSpeak, pdGenValidate, PD_GEN_CACHE_KEY, pdItems, pdKeywordEval, pdPick, pdStreak, phonemeHintHTML, photoSharedAvailable, photoAnalyzeShared, resizePhoto, placementFinish, placementIntro, placementFreeAvailable, placementFreeValidate, placementFreeAnalyze, placementFreeFinish, placementFreeSave, placementFreeWeak, placementFreeHTML, bindPlacementFree, profileTouch, renderDailyChestsAndQuests, renderDict, renderTukiSVG, runOfflinePreload, sendTukiNotification, showLockedFeatureModal, spawnTukiParticles, speakSnail, speakTukiEs, srsStats, startPD, startTC, syncHardWordsToDeck, tcAll, tcById, tcCanVoice, tcEntryHTML, tcEval, tcEx, tcExtract, tcExtractAll, tcExtraHint, tcFailsTotal, tcFinish, tcLevel, tcListen, tcMasteredCount, tcPick, tcSetup, tcVState, tcValidate, tcVoiceOn, tcVoiceResult, tcVoiceStart, tcVoiceStop, tcVoiceUI, triggerTukiAnimation, tukiMood, getTukiMood, tukiMoodReduced, tvCardHTML, tvDeviceVoices, tvMsg, tvPlay, tvRenderBody, tvRows, tvSelect, tvStop, updateMascot, updateOfflineCardStats, wordsHTML, wordsToggleHTML } from './ui.js';
export { updateMascot, modal, confirmBox, wordsHTML, triggerTukiAnimation, tukiMood, tukiTutorBannerHTML, bindTukiTutorBanner, mouthPanelHTML, phonemeHintHTML, buildVocabLesson, renderVocabLearn, bindExtra, extraResultHTML, errES, httpErr, openWordPop, closeWordPop, azureMic, lsGet, lsSet, buildTopErrorsPractice } from './ui.js';
export { azFetch, azureReady, errorTutorAvailable, errorTutorHTML, bindErrorTutor, explainError } from './chat.js';
export { FB, KS, LOCKED } from './account.js';

/* =================== CONTENIDO DEL CURSO =================== */
// Lecciones de pronunciación: expl = explicación, mouth = posición de boca/lengua,
// ex = palabras ejemplo [en, es], pairs = pares mínimos [palabraSonidoA, palabraSonidoB] (a = sonido objetivo/lado A),
// pairLabels = etiqueta de cada lado, quiz = preguntas de oído, sents = frases [en, es]
export const COURSE = [
{ id:'u0', title:'Primeros pasos: Frases esenciales', icon:'🌱', color:'#059669',
  desc:'¡Desde cero absoluto! Saludos, cortesía y frases de supervivencia con pronunciación guiada.',
  lessons:[
  { id:'novice-greetings', sound:'saludos', title:'Saludos y despedidas', icon:'👋',
    expl:'Aprende a saludar y despedirte con confianza. En inglés, la "H" de "Hello" y "Hi" suena como un suspiro suave (no como una "J" fuerte).',
    mouth:'Para decir "Hello" y "Hi", deja salir un aire suave y cálido por la garganta como empañando un vidrio: "j-jelou".',
    pairLabels:['H suave (inglés)','J fuerte (español)'],
    ex:[['hello','hola'],['hi','hola (informal)'],['good morning','buenos días'],['goodbye','adiós'],['see you','nos vemos'],['bye','chao']],
    quiz:[{q:'¿Cómo suena la «H» en «Hello»?',say:'hello',opts:['Como un suspiro suave','Como una J fuerte y raspada','Es muda como en español'],a:0},
          {q:'¿Qué significa «Good morning»?',say:'good morning',opts:['Buenos días','Buenas noches','Buenas tardes'],a:0},
          {q:'¿Cuál es la forma más casual de decir «adiós»?',say:'bye',opts:['Bye','Good morning','Hello'],a:0}],
    sents:[['Hello, good morning!','¡Hola, buenos días!'],['Hi, see you later.','Hola, nos vemos luego.'],['Goodbye, have a nice day.','Adiós, ten un buen día.']] },
  { id:'novice-courtesy', sound:'cortesía', title:'Palabras mágicas de cortesía', icon:'🙏',
    expl:'Por favor, gracias y disculpas. En "Thank you", saca la puntita de la lengua entre los dientes para la TH. ¡Hará que suenes educado y natural!',
    mouth:'En "please", sonríe y estira los labios ("pliiiz"). En "thank you", punta de la lengua entre los dientes y suelta aire.',
    pairLabels:['Cortés','Directo'],
    ex:[['please','por favor'],['thank you','gracias'],['thanks','gracias (casual)'],["you're welcome",'de nada'],['sorry','lo siento / perdón'],['excuse me','con permiso / disculpe']],
    quiz:[{q:'¿Cómo dices «por favor»?',say:'please',opts:['Please','Sorry','Thanks'],a:0},
          {q:'¿Cómo respondes cuando alguien te dice «thank you»?',say:"you're welcome",opts:["You're welcome (de nada)",'Please','Sorry'],a:0},
          {q:'¿Qué dices para pedir permiso o llamar la atención?',say:'excuse me',opts:['Excuse me','Goodbye','Thanks'],a:0}],
    sents:[['Yes, please.','Sí, por favor.'],['Thank you very much.','Muchas gracias.'],['Excuse me, sorry!','¡Con permiso, lo siento!']] },
  { id:'novice-survival', sound:'supervivencia', title:'Frases de supervivencia', icon:'🆘',
    expl:'Las frases salvavidas para cuando no entiendes: pedir que hablen más despacio, decir que estás aprendiendo y pedir ayuda.',
    mouth:'Di despacio y con calma. No tengas miedo de decir "I don\'t understand", los hablantes nativos aprecian tu esfuerzo.',
    pairLabels:['Supervivencia','Habla normal'],
    ex:[['help','ayuda'],['slowly','despacio'],['understand','entender'],['english','inglés'],['repeat','repetir'],['speak','hablar']],
    quiz:[{q:'Si alguien habla muy rápido, le dices:',say:'More slowly, please',opts:['More slowly, please (más despacio, por favor)','Thank you','Goodbye'],a:0},
          {q:'¿Cómo dices «no entiendo»?',say:"I don't understand",opts:["I don't understand",'I speak English','You are welcome'],a:0},
          {q:'¿Cómo pides ayuda con cortesía?',say:'Can you help me?',opts:['Can you help me? (¿Me ayudas?)','Excuse me','Bye'],a:0}],
    sents:[['Can you speak slowly, please?','¿Puedes hablar despacio, por favor?'],["I don't understand English.","No entiendo inglés."],['Can you repeat that, please?','¿Puedes repetir eso, por favor?']] }
  ]},
{ id:'u1', title:'Vocales que cambian el significado', icon:'🅰️', color:'#1fa463',
  desc:'El inglés tiene más vocales que el español. ¡Aquí está la diferencia entre ship y sheep!',
  lessons:[
  { id:'ih-ee', sound:'ɪ / iː', title:'Ship vs. Sheep', icon:'🚢',
    expl:'El español tiene una sola "i". El inglés tiene dos: /iː/ larga y tensa (sheep, "oveja") y /ɪ/ corta y relajada (ship, "barco"). Si dices todo con la "i" española, "ship" suena como "sheep" y "sit" como "seat".',
    mouth:'/iː/: sonríe, labios estirados, lengua alta y tensa; alárgala un poco ("shiiip"). /ɪ/: relaja la cara y la lengua, boca un poco más abierta, sonido corto, entre una "i" y una "e" española.',
    pairLabels:['/ɪ/ corta','/iː/ larga'],
    ex:[['sit','sentarse'],['seat','asiento'],['live','vivir'],['leave','irse'],['big','grande'],['green','verde']],
    pairs:[['ship','sheep'],['live','leave'],['sit','seat'],['fill','feel'],['hit','heat'],['chip','cheap']],
    sents:[['Please sit in this seat.','Por favor siéntate en este asiento.'],['The big ship is green.','El barco grande es verde.'],['I live here, but I leave tomorrow.','Vivo aquí, pero me voy mañana.']] },
  { id:'ae-uh', sound:'æ / ʌ', title:'Cat vs. Cut', icon:'🐱',
    expl:'/æ/ (cat, "gato") es una "a" muy abierta, casi entre "a" y "e". /ʌ/ (cut, "cortar") es una "a" corta y relajada, como un "ah" rápido y débil. Los hispanohablantes suelen usar la misma "a" para ambas.',
    mouth:'/æ/: abre mucho la boca y baja la mandíbula, lengua baja y hacia adelante, sonríe un poco. /ʌ/: boca medio abierta y relajada, lengua en el centro, sonido corto como cuando dices "ah" sorprendido.',
    pairLabels:['/æ/ abierta','/ʌ/ corta'],
    ex:[['cat','gato'],['cut','cortar'],['bag','bolso'],['bus','bus'],['happy','feliz'],['money','dinero']],
    pairs:[['cat','cut'],['bag','bug'],['hat','hut'],['cap','cup'],['ran','run'],['match','much']],
    sents:[['The black cat is happy.','El gato negro está feliz.'],['I need a cup of coffee.','Necesito una taza de café.'],['My bag is on the bus.','Mi bolso está en el bus.']] },
  { id:'schwa', sound:'ə', title:'La vocal schwa', icon:'😶',
    expl:'La schwa /ə/ es el sonido más común del inglés: una vocal débil y neutra, como un "e" o "a" muy corto y relajado. Aparece en sílabas SIN acento: about (/əˈbaʊt/), banana (/bəˈnænə/), teacher (/ˈtiːtʃər/). Pronunciar cada vocal "completa" como en español hace que suenes poco natural.',
    mouth:'Relaja totalmente la boca, la lengua y los labios. Casi no muevas nada: es un sonido corto como "uh". Nunca va en la sílaba fuerte.',
    ex:[['about','acerca de'],['banana','banano'],['problem','problema'],['teacher','profesor'],['today','hoy'],['support','apoyo']],
    quiz:[{q:'En «about», la primera «a» suena como…',say:'about',opts:['/ə/ (débil, "uh")','/æ/ (abierta)','/eɪ/ ("ei")'],a:0},
          {q:'¿Cuál sílaba es fuerte en «banana»?',say:'banana',opts:['ba-NA-na','BA-na-na','ba-na-NA'],a:0},
          {q:'En «problem», la «e» suena como…',say:'problem',opts:['/ə/ débil','/e/ española clara','/iː/ larga'],a:0},
          {q:'En «today», la «o» suena como…',say:'today',opts:['/ə/ débil','/oʊ/ ("ou")','/ɔː/ larga'],a:0},
          {q:'En «teacher», la terminación «-er» suena como…',say:'teacher',opts:['/ər/ débil','/er/ con "e" fuerte','/ɪr/'],a:0}],
    sents:[['I have a problem with the computer.','Tengo un problema con el computador.'],['What are you talking about?','¿De qué estás hablando?'],['Today my teacher is not here.','Hoy mi profesor no está aquí.']] }
  ]},
{ id:'u2', title:'Consonantes difíciles', icon:'🔤', color:'#1cb0f6',
  desc:'Sonidos que en español no distinguimos: b/v, s/z y sh/ch.',
  lessons:[
  { id:'b-v', sound:'b / v', title:'Best vs. Vest', icon:'🦺',
    expl:'En español "b" y "v" suenan igual. En inglés son diferentes y cambian el significado: best (mejor) vs. vest (chaleco), very (muy) vs. berry (baya).',
    mouth:'/b/: junta los dos labios y suéltalos con fuerza (explosión). /v/: apoya los dientes de arriba sobre el labio de abajo y deja salir el aire vibrando, como un zumbido "vvvv". ¡Los labios NO se juntan!',
    pairLabels:['/b/ labios','/v/ dientes-labio'],
    ex:[['very','muy'],['voice','voz'],['video','video'],['best','mejor'],['travel','viajar'],['have','tener']],
    pairs:[['best','vest'],['berry','very'],['boat','vote'],['ban','van'],['bet','vet'],['curb','curve']],
    sents:[['I have a very good voice.','Tengo una voz muy buena.'],['We travel by van in November.','Viajamos en camioneta en noviembre.'],['This is the best video ever.','Este es el mejor video de todos.']] },
  { id:'s-z', sound:'s / z', title:'Zoo vs. Sue', icon:'🦓',
    expl:'El español casi no tiene el sonido /z/ (una "s" que vibra). En inglés es muy común: zoo, easy, is, was, please, busy. Muchas veces se escribe con "s" pero suena /z/.',
    mouth:'Pon la lengua igual que para la "s", pero haz vibrar las cuerdas vocales, como una abeja: "zzzz". Toca tu garganta: con /z/ debe vibrar, con /s/ no.',
    pairLabels:['/z/ vibra','/s/ sin vibrar'],
    ex:[['zoo','zoológico'],['easy','fácil'],['busy','ocupado'],['please','por favor'],['music','música'],['lazy','perezoso']],
    pairs:[['zoo','sue'],['rise','rice'],['eyes','ice'],['prize','price'],['zip','sip'],['lose','loose']],
    sents:[['Please close the door.','Por favor cierra la puerta.'],['The zoo is busy on Sundays.','El zoológico está lleno los domingos.'],['This music is easy to learn.','Esta música es fácil de aprender.']] },
  { id:'sh-ch', sound:'ʃ / tʃ', title:'Ship vs. Chip', icon:'🍟',
    expl:'/tʃ/ es como la "ch" española (chip, chair). /ʃ/ es un sonido suave y continuo, como cuando pides silencio: "shhh" (ship, share). En varias regiones se mezclan, pero en inglés cambian el significado: wash (lavar) vs. watch (mirar).',
    mouth:'/ʃ/: labios redondeados hacia adelante, la lengua NO toca el paladar, el aire sale continuo "shhh". /tʃ/: la lengua toca primero detrás de los dientes (como una "t") y luego suelta el aire: "t+sh" = "ch".',
    pairLabels:['/ʃ/ suave','/tʃ/ ch'],
    ex:[['shoes','zapatos'],['chair','silla'],['wash','lavar'],['watch','mirar / reloj'],['kitchen','cocina'],['fish','pescado']],
    pairs:[['ship','chip'],['share','chair'],['wash','watch'],['shoes','choose'],['sheet','cheat'],['cash','catch']],
    sents:[['I want to watch a movie.','Quiero ver una película.'],['Please wash the dishes in the kitchen.','Por favor lava los platos en la cocina.'],['She chose new shoes.','Ella escogió zapatos nuevos.']] }
  ]},
{ id:'u3', title:'La TH y los finales', icon:'👅', color:'#8b5cf6',
  desc:'Think, this, y no "comerse" el final de las palabras.',
  lessons:[
  { id:'th-voiceless', sound:'θ', title:'Think (TH sorda)', icon:'🤔',
    expl:'La /θ/ de think, three, thank es parecida a la "z" o "c" del español de España (zapato), pero en Colombia no la usamos. Si la cambias por "t" o "s", "think" suena como "sink" (hundirse) o "tink".',
    mouth:'Saca un poquito la punta de la lengua entre los dientes y sopla aire suavemente, sin vibrar. ¡Está bien que se vea la lengua!',
    pairLabels:['/θ/ TH','/s/ o /t/'],
    ex:[['think','pensar'],['three','tres'],['thank you','gracias'],['mouth','boca'],['birthday','cumpleaños'],['month','mes']],
    pairs:[['think','sink'],['three','tree'],['thank','tank'],['mouth','mouse'],['path','pass'],['thin','tin']],
    sents:[['Thank you for the three books.','Gracias por los tres libros.'],['I think my birthday is this month.','Creo que mi cumpleaños es este mes.'],['Open your mouth, please.','Abre la boca, por favor.']] },
  { id:'th-voiced', sound:'ð', title:'This (TH sonora)', icon:'👉',
    expl:'La /ð/ de this, the, they, mother es la misma posición que /θ/ pero con vibración. Es parecida a la "d" suave entre vocales en español ("nada"). No la pronuncies como una "d" fuerte: "they" no es "day".',
    mouth:'Punta de la lengua entre los dientes (o tocando detrás de los dientes de arriba) y haz vibrar la garganta, suave y continuo.',
    pairLabels:['/ð/ TH sonora','/d/ fuerte'],
    ex:[['this','esto'],['the','el / la'],['mother','mamá'],['brother','hermano'],['weather','clima'],['together','juntos']],
    pairs:[['they','day'],['then','den'],['those','doze'],['though','dough'],['there','dare'],['breathe','breed']],
    sents:[['This is my mother and my brother.','Esta es mi mamá y mi hermano.'],['They are there together.','Ellos están allá juntos.'],['The weather is nice this weekend.','El clima está agradable este fin de semana.']] },
  { id:'final-cons', sound:'finales', title:'Consonantes finales', icon:'🔚',
    expl:'En español pocas palabras terminan en consonantes como t, d, k, p. En inglés son muy frecuentes y si te las "comes", la palabra cambia: seat → sea, wait → way, bike → buy.',
    mouth:'Termina la palabra cerrando la boca o poniendo la lengua en su lugar: para la /t/ la lengua toca detrás de los dientes, para /k/ la parte de atrás de la lengua sube, para /p/ los labios se juntan. No agregues una "e" al final ("bigue").',
    pairLabels:['con consonante final','sin consonante final'],
    ex:[['night','noche'],['work','trabajo'],['cold','frío'],['help','ayuda'],['bread','pan'],['milk','leche']],
    pairs:[['seat','sea'],['wait','way'],['road','row'],['bike','buy'],['page','pay'],['boat','bow']],
    sents:[['I work at night.','Trabajo de noche.'],['It is cold outside.','Hace frío afuera.'],['Can you help me with the bread and milk?','¿Me ayudas con el pan y la leche?']] }
  ]},
{ id:'u4', title:'Inicios y terminaciones', icon:'🧩', color:'#ff9f1c',
  desc:'Sin "e" antes de sp/st, y cómo suenan -ed y -s.',
  lessons:[
  { id:'s-cluster', sound:'s+cons.', title:'Spain, no "Espain"', icon:'🇪🇸',
    expl:'En español ninguna palabra empieza por "s + consonante", por eso decimos "espanish", "estudent". En inglés debes empezar directamente con la "s": Spanish, student, school, street. ¡Cuidado!: "state" (estado) y "estate" (finca/patrimonio) son palabras diferentes.',
    mouth:'Empieza con un siseo largo "sssss" y luego di el resto: "sss-tudent". Aprieta los labios o sonríe antes de empezar para no abrir la boca con una "e".',
    pairLabels:['s inicial','e + s'],
    ex:[['Spanish','español'],['student','estudiante'],['school','colegio'],['street','calle'],['special','especial'],['stop','parar']],
    pairs:[['state','estate'],['steam','esteem']],
    sents:[['I am a Spanish student.','Soy un estudiante de español.'],['The school is on this street.','El colegio queda en esta calle.'],['Please stop here, it is a special place.','Por favor para aquí, es un lugar especial.']] },
  { id:'ed-endings', sound:'-ed', title:'Terminación -ed', icon:'⏪',
    expl:'La -ed del pasado NO se pronuncia "ed" casi nunca. Tiene 3 sonidos: /t/ después de sonidos sordos (worked, stopped, washed), /d/ después de sonidos sonoros (played, called, lived) e /ɪd/ solo después de t o d (wanted, needed). "Worked" tiene UNA sola sílaba: "workt".',
    mouth:'Para /t/ y /d/ no agregues una sílaba: une el sonido a la palabra ("plei-d", "wash-t"). Solo con t/d finales agrega "id": "wan-tid", "nee-did".',
    ex:[['worked','trabajó'],['played','jugó'],['wanted','quiso'],['stopped','paró'],['lived','vivió'],['needed','necesitó']],
    quiz:[{q:'¿Cómo suena la -ed en «worked»?',say:'worked',opts:['/t/','/d/','/ɪd/'],a:0},
          {q:'¿Cómo suena la -ed en «played»?',say:'played',opts:['/d/','/t/','/ɪd/'],a:0},
          {q:'¿Cómo suena la -ed en «wanted»?',say:'wanted',opts:['/ɪd/','/t/','/d/'],a:0},
          {q:'¿Cuántas sílabas tiene «stopped»?',say:'stopped',opts:['Una','Dos','Tres'],a:0},
          {q:'¿Cómo suena la -ed en «needed»?',say:'needed',opts:['/ɪd/','/d/','/t/'],a:0},
          {q:'¿Cómo suena la -ed en «washed»?',say:'washed',opts:['/t/','/ɪd/','/d/'],a:0}],
    sents:[['I worked late yesterday.','Trabajé hasta tarde ayer.'],['We played soccer and watched a movie.','Jugamos fútbol y vimos una película.'],['She needed help, so I helped her.','Ella necesitaba ayuda, así que la ayudé.']] },
  { id:'s-endings', sound:'-s', title:'Terminación -s / -es', icon:'➕',
    expl:'La -s del plural y de he/she/it también tiene 3 sonidos: /s/ después de sonidos sordos (cats, books), /z/ después de sonidos sonoros (dogs, plays) e /ɪz/ después de s, z, sh, ch, x (buses, watches, boxes). ¡No la omitas!: "she work" es un error muy común.',
    mouth:'Para /z/ haz vibrar la garganta ("dogzzz"). Para /ɪz/ agrega una sílaba corta: "bus-iz", "watch-iz".',
    ex:[['books','libros'],['dogs','perros'],['watches','relojes / mira'],['works','trabaja'],['boxes','cajas'],['plays','juega']],
    quiz:[{q:'¿Cómo suena la -s en «books»?',say:'books',opts:['/s/','/z/','/ɪz/'],a:0},
          {q:'¿Cómo suena la -s en «dogs»?',say:'dogs',opts:['/z/','/s/','/ɪz/'],a:0},
          {q:'¿Cómo suena la -es en «watches»?',say:'watches',opts:['/ɪz/','/s/','/z/'],a:0},
          {q:'¿Cuántas sílabas tiene «boxes»?',say:'boxes',opts:['Dos','Una','Tres'],a:0},
          {q:'¿Cómo suena la -s en «plays»?',say:'plays',opts:['/z/','/s/','/ɪz/'],a:0}],
    sents:[['She works in a big office.','Ella trabaja en una oficina grande.'],['My brother watches the news.','Mi hermano ve las noticias.'],['The dogs are next to the boxes.','Los perros están al lado de las cajas.']] }
  ]},
{ id:'u5', title:'Ritmo, acento y entonación', icon:'🎵', color:'#e5484d',
  desc:'La música del inglés: sílabas fuertes, palabras débiles y entonación.',
  lessons:[
  { id:'word-stress', sound:'acento', title:'Acento de la palabra', icon:'🔊',
    expl:'En inglés una sílaba de cada palabra es más fuerte, larga y aguda; las demás se debilitan (muchas veces a schwa). Poner el acento en la sílaba equivocada puede hacer que no te entiendan: comfortable es "COMF-ter-bl", no "com-for-TA-ble".',
    mouth:'En la sílaba fuerte: más volumen, más duración y tono más alto. Las otras sílabas: rápidas y relajadas. Nota: el reconocedor de voz evalúa palabras, no el acento; usa "Grabar y comparar" para escucharte junto al modelo.',
    ex:[['comfortable','cómodo'],['vegetable','verdura'],['hotel','hotel'],['photograph','fotografía'],['important','importante'],['chocolate','chocolate']],
    quiz:[{q:'¿Dónde va el acento en «hotel»?',say:'hotel',opts:['ho-TEL','HO-tel'],a:0},
          {q:'¿Dónde va el acento en «comfortable»?',say:'comfortable',opts:['COM-for-ta-ble','com-for-TA-ble','com-FOR-ta-ble'],a:0},
          {q:'¿Dónde va el acento en «important»?',say:'important',opts:['im-POR-tant','IM-por-tant','im-por-TANT'],a:0},
          {q:'¿Dónde va el acento en «vegetable»?',say:'vegetable',opts:['VEG-ta-ble','ve-ge-TA-ble','ve-GE-ta-ble'],a:0},
          {q:'¿Dónde va el acento en «photograph»?',say:'photograph',opts:['PHO-to-graph','pho-TO-graph','pho-to-GRAPH'],a:0},
          {q:'¿Dónde va el acento en «photographer»?',say:'photographer',opts:['pho-TOG-ra-pher','PHO-to-gra-pher','pho-to-GRA-pher'],a:0}],
    sents:[['This hotel is very comfortable.','Este hotel es muy cómodo.'],['Vegetables are important for your health.','Las verduras son importantes para tu salud.'],['I love chocolate cake.','Me encanta el pastel de chocolate.']] },
  { id:'weak-forms', sound:'formas débiles', title:'Palabras débiles y contracciones', icon:'🔗',
    expl:'En una frase, las palabras de contenido (sustantivos, verbos, adjetivos) son fuertes y las pequeñas (a, to, of, and, can, for) se debilitan: "a cup of tea" suena "a-CUP-a-TEA". Las contracciones (I\'m, don\'t, I\'ll) son normales en el habla y hacen que suenes natural.',
    mouth:'Di rápido y suave las palabras pequeñas, casi con schwa: "to" = /tə/, "for" = /fər/, "and" = /ən/, "can" = /kən/. Resalta las palabras importantes.',
    ex:[["I'm",'yo soy / estoy'],["don't",'no (auxiliar)'],["I'll",'yo (futuro)'],["can't",'no puedo'],["it's",'es / está'],["we're",'somos / estamos']],
    quiz:[{q:'En «a cup of tea», ¿qué palabras son fuertes?',say:'a cup of tea',opts:['cup y tea','a y of','todas iguales'],a:0},
          {q:'«I can swim»: la palabra «can» normalmente suena…',say:'I can swim',opts:['débil /kən/','fuerte /kæn/','no se dice'],a:0},
          {q:'«I want to go»: «to» suena…',say:'I want to go',opts:['débil /tə/','fuerte /tuː/','como "two"'],a:0},
          {q:'¿Cuál suena más natural en conversación?',say:"I'm fine, thanks",opts:["I'm fine, thanks",'I am fine, thank you very much sir'],a:0},
          {q:'En «bread and butter», «and» suena como…',say:'bread and butter',opts:['/ən/ o /n/ débil','/ænd/ fuerte','/end/'],a:0}],
    sents:[["I'd like a cup of tea, please.",'Quisiera una taza de té, por favor.'],["I can't go to the party tonight.",'No puedo ir a la fiesta esta noche.'],["We're going to the store for some bread.",'Vamos a la tienda por algo de pan.']] },
  { id:'intonation', sound:'entonación', title:'Entonación de preguntas', icon:'📈',
    expl:'Las preguntas de sí/no (Do you…? Are you…? Can I…?) SUBEN al final ↗. Las preguntas con palabra interrogativa (What, Where, How…) y las afirmaciones normalmente BAJAN al final ↘. Usar la entonación correcta hace que suenes amable y natural.',
    mouth:'Para subir: la última sílaba acentuada va más aguda. Para bajar: el tono cae en la última palabra importante. Escucha el modelo lento y grábate para comparar (el reconocedor no mide la entonación).',
    ex:[['Are you ready?','¿Estás listo?'],['Where do you live?','¿Dónde vives?'],['Can I help you?','¿Te puedo ayudar?'],['What time is it?','¿Qué hora es?'],['Do you like it?','¿Te gusta?'],['How are you?','¿Cómo estás?']],
    quiz:[{q:'«Are you ready?» — ¿la entonación sube o baja al final?',say:'Are you ready?',opts:['Sube ↗','Baja ↘'],a:0},
          {q:'«Where do you live?» — ¿sube o baja al final?',say:'Where do you live?',opts:['Baja ↘','Sube ↗'],a:0},
          {q:'«Can I help you?» — ¿sube o baja al final?',say:'Can I help you?',opts:['Sube ↗','Baja ↘'],a:0},
          {q:'«What is your name?» — ¿sube o baja al final?',say:'What is your name?',opts:['Baja ↘','Sube ↗'],a:0},
          {q:'«I live in Bogota.» — ¿sube o baja al final?',say:'I live in Bogota.',opts:['Baja ↘','Sube ↗'],a:0}],
    sents:[['Do you want some coffee?','¿Quieres café?'],['What do you do for work?','¿A qué te dedicas?'],['Is this seat free?','¿Está libre este asiento?']] }
  ]},
{ id:'u6', title:'Conversaciones reales I', icon:'🗣️', color:'#14b8a6',
  desc:'Diálogos de la vida real: tú dices tu parte y recibes un puntaje.',
  lessons:[
  { id:'c-greet', type:'dialog', sound:'conversación', title:'Saludos y presentaciones', icon:'👋',
    scene:'Conoces a una persona nueva en un evento. Tú eres B.',
    lines:[['A',"Hi! I'm Sarah. What's your name?",'¡Hola! Soy Sarah. ¿Cómo te llamas?'],
           ['B',"Hi Sarah, I'm Carlos. Nice to meet you.",'Hola Sarah, soy Carlos. Mucho gusto.'],
           ['A','Nice to meet you too. Where are you from?','Mucho gusto también. ¿De dónde eres?'],
           ['B',"I'm from Colombia. I live in Medellin.",'Soy de Colombia. Vivo en Medellín.'],
           ['A','Oh, cool! What do you do?','¡Qué bien! ¿A qué te dedicas?'],
           ['B',"I'm a software developer. And you?",'Soy desarrollador de software. ¿Y tú?'],
           ['A',"I'm a teacher. It was great talking to you!",'Soy profesora. ¡Fue genial hablar contigo!'],
           ['B','You too. See you later!','Igualmente. ¡Hasta luego!']] },
  { id:'c-food', type:'dialog', sound:'conversación', title:'En el restaurante', icon:'🍽️',
    scene:'Estás en un restaurante y hablas con el mesero. Tú eres B (cliente).',
    lines:[['A','Good evening. Are you ready to order?','Buenas noches. ¿Listos para ordenar?'],
           ['B',"Yes, I'd like the chicken with rice, please.",'Sí, quisiera el pollo con arroz, por favor.'],
           ['A','Great choice. Anything to drink?','Excelente elección. ¿Algo de tomar?'],
           ['B','Can I have a glass of water, please?','¿Me trae un vaso de agua, por favor?'],
           ['A','Of course. Would you like dessert?','Claro. ¿Quisiera postre?'],
           ['B',"No, thank you. Could we have the check, please?",'No, gracias. ¿Nos trae la cuenta, por favor?'],
           ['A',"Sure, here it is.",'Claro, aquí está.'],
           ['B','Thank you. The food was delicious.','Gracias. La comida estuvo deliciosa.']] },
  { id:'c-airport', type:'dialog', sound:'conversación', title:'En el aeropuerto', icon:'✈️',
    scene:'Estás haciendo el check-in en el aeropuerto. Tú eres B (pasajero).',
    lines:[['A','Good morning. Can I see your passport, please?','Buenos días. ¿Me muestra su pasaporte, por favor?'],
           ['B','Sure, here is my passport.','Claro, aquí está mi pasaporte.'],
           ['A','Thank you. Are you checking any bags today?','Gracias. ¿Va a documentar maletas hoy?'],
           ['B','Yes, I have one suitcase.','Sí, tengo una maleta.'],
           ['A','Would you like a window or an aisle seat?','¿Prefiere ventana o pasillo?'],
           ['B',"A window seat, please. What time does boarding start?",'Ventana, por favor. ¿A qué hora empieza el abordaje?'],
           ['A','Boarding starts at ten thirty at gate twelve.','El abordaje empieza a las diez y media en la puerta doce.'],
           ['B','Perfect. Thank you very much.','Perfecto. Muchas gracias.']] }
  ]},
{ id:'u7', title:'Conversaciones reales II', icon:'💼', color:'#6366f1',
  desc:'Trabajo, compras y tu rutina diaria.',
  lessons:[
  { id:'c-interview', type:'dialog', sound:'conversación', title:'Entrevista de trabajo', icon:'🤝',
    scene:'Estás en una entrevista de trabajo en inglés. Tú eres B (candidato).',
    lines:[['A','Thanks for coming. Tell me about yourself.','Gracias por venir. Háblame de ti.'],
           ['B','I have five years of experience in customer service.','Tengo cinco años de experiencia en servicio al cliente.'],
           ['A','What are your main strengths?','¿Cuáles son tus principales fortalezas?'],
           ['B',"I'm organized, and I work well in a team.",'Soy organizado y trabajo bien en equipo.'],
           ['A','Why do you want to work with us?','¿Por qué quieres trabajar con nosotros?'],
           ['B','I want to grow professionally and I like your company.','Quiero crecer profesionalmente y me gusta su empresa.'],
           ['A','Do you have any questions for me?','¿Tienes alguna pregunta para mí?'],
           ['B','Yes. What does a typical day look like?','Sí. ¿Cómo es un día típico?']] },
  { id:'c-shop', type:'dialog', sound:'conversación', title:'De compras', icon:'🛍️',
    scene:'Estás comprando ropa en una tienda. Tú eres B (cliente).',
    lines:[['A','Hi there! Can I help you find something?','¡Hola! ¿Le ayudo a encontrar algo?'],
           ['B',"I'm looking for a blue shirt.",'Estoy buscando una camisa azul.'],
           ['A','What size do you need?','¿Qué talla necesita?'],
           ['B','Medium, please. Can I try it on?','Mediana, por favor. ¿Me la puedo probar?'],
           ['A','Of course. The fitting rooms are over there.','Claro. Los probadores están por allá.'],
           ['B','It fits well. How much is it?','Me queda bien. ¿Cuánto cuesta?'],
           ['A',"It's thirty dollars, but today it's on sale.",'Cuesta treinta dólares, pero hoy está en oferta.'],
           ['B',"Great, I'll take it. Can I pay by card?",'Genial, me la llevo. ¿Puedo pagar con tarjeta?']] },
  { id:'c-routine', type:'dialog', sound:'conversación', title:'Tu rutina diaria', icon:'⏰',
    scene:'Un compañero te pregunta por tu día. Tú eres B.',
    lines:[['A','What time do you usually wake up?','¿A qué hora te despiertas normalmente?'],
           ['B','I usually wake up at six thirty.','Normalmente me despierto a las seis y media.'],
           ['A','Wow, early! What do you do in the morning?','¡Uy, temprano! ¿Qué haces en la mañana?'],
           ['B','I take a shower, have breakfast, and take the bus to work.','Me ducho, desayuno y tomo el bus al trabajo.'],
           ['A','And what do you do after work?','¿Y qué haces después del trabajo?'],
           ['B','I go to the gym three times a week.','Voy al gimnasio tres veces por semana.'],
           ['A','That sounds healthy. What about weekends?','Suena saludable. ¿Y los fines de semana?'],
           ['B','On weekends I sleep late and visit my family.','Los fines de semana duermo hasta tarde y visito a mi familia.']] }
  ]}
];


/* =================== CONTENIDO ADICIONAL (v2) =================== */
COURSE.push(
{ id:'u8', title:'Habla conectada', icon:'🔗', color:'#0ea5e9',
  desc:'Cómo hablan los nativos: palabras unidas, gonna/wanna y la T americana.',
  lessons:[
  { id:'linking', sound:'linking', title:'Unir palabras (linking)', icon:'🧷',
    expl:'En inglés natural, una palabra que termina en consonante se une con la siguiente si empieza por vocal: "turn it off" suena "tur-ni-toff" y "an apple" suena "a-napple". Si separas cada palabra, suenas robótico y te cuesta entender a los nativos.',
    mouth:'No hagas pausa entre palabras: pasa la consonante final a la vocal siguiente como si fuera una sola palabra larga. Practica despacio y luego acelera.',
    ex:[['turn it off','apágalo'],['an apple','una manzana'],['pick it up','recógelo'],['come on','¡vamos!'],['check it out','míralo'],['hold on','espera']],
    quiz:[{q:'«turn it off» suena más natural como…',say:'turn it off',opts:['tur-ni-toff (unido)','turn · it · off (separado)'],a:0},
          {q:'«an apple» suena como…',say:'an apple',opts:['a-napple','an · apple con pausa'],a:0},
          {q:'¿Cómo se une «pick it up»?',say:'pick it up',opts:['pi-ki-tup','pick · it · up con pausas','pik-kit-tup'],a:0},
          {q:'«hold on» suena como…',say:'hold on',opts:['hol-don','hold · on'],a:0},
          {q:'«miss you» en habla rápida suele sonar como…',say:'I miss you',opts:['mi-shu','miss · you con pausa','mis-yu con y fuerte'],a:0}],
    sents:[['Can you turn it off, please?','¿Puedes apagarlo, por favor?'],['Pick it up and put it on the table.','Recógelo y ponlo en la mesa.'],['Hold on, I need an apple.','Espera, necesito una manzana.']] },
  { id:'reductions', sound:'reducciones', title:'Gonna, wanna, gotta', icon:'💨',
    expl:'En conversación informal (sobre todo en EE. UU.) "going to" se reduce a "gonna", "want to" a "wanna", "got to" a "gotta", "let me" a "lemme" y "kind of" a "kinda". Entenderlas es clave para comprender series y nativos. Úsalas al hablar, no en escritura formal.',
    mouth:'Las palabras pequeñas pierden fuerza: "to" se vuelve /tə/ y se funde con la palabra anterior. Mantén la fuerza en el verbo principal: "I\'m gonna CALL you".',
    ex:[['going to','gonna (voy a)'],['want to','wanna (quiero)'],['got to','gotta (tengo que)'],['kind of','kinda (medio, algo)'],['let me','lemme (déjame)'],['give me','gimme (dame)']],
    quiz:[{q:'«I\'m gonna call you» significa…',say:"I'm gonna call you",opts:['Te voy a llamar','Te llamé','Quiero llamarte'],a:0},
          {q:'«I wanna go home» significa…',say:'I wanna go home',opts:['Quiero ir a casa','Voy a ir a casa','Tengo que ir a casa'],a:0},
          {q:'«I gotta go» significa…',say:'I gotta go',opts:['Tengo que irme','Me gusta ir','Me fui'],a:0},
          {q:'«Lemme see» significa…',say:'Lemme see',opts:['Déjame ver','Mírame','Lo vi'],a:0},
          {q:'«It\'s kinda cold» significa…',say:"It's kinda cold",opts:['Hace algo de frío','Hace mucho calor','No hace frío'],a:0}],
    sents:[["I'm going to call you tomorrow.",'Te voy a llamar mañana.'],['I want to learn English.','Quiero aprender inglés.'],["I've got to go now.",'Tengo que irme ya.']] },
  { id:'flap-t', sound:'ɾ', title:'La T americana (water)', icon:'💧',
    expl:'En inglés americano, la "t" entre vocales suena como una "r" suave del español (la de "pero"): water → "wárer", better → "bérer", city → "ciri". En inglés británico suele sonar como una "t" clara.',
    mouth:'Da un toque rápido y suave con la punta de la lengua detrás de los dientes de arriba, un solo golpe, igual que la "r" de "cara". No la hagas explosiva.',
    ex:[['water','agua'],['better','mejor'],['city','ciudad'],['party','fiesta'],['little','pequeño'],['computer','computador']],
    quiz:[{q:'En inglés americano, «water» suena como…',say:'water',opts:['wárer (t suave como r)','wa-ter (t fuerte)','wa-cher'],a:0},
          {q:'«better» suena como…',say:'better',opts:['bérer','be-ter con t fuerte','bet · ter con pausa'],a:0},
          {q:'¿En cuál palabra la T suena como r suave?',say:'city',opts:['city','ten','stop'],a:0},
          {q:'«get it» en habla rápida suena como…',say:'get it',opts:['gué-rit','get · it','guet-chit'],a:0},
          {q:'¿En cuál palabra la T NO es suave?',say:'table',opts:['table (t al inicio)','water','party'],a:0}],
    sents:[['Can I have a glass of water?','¿Me das un vaso de agua?'],['This city is better at night.','Esta ciudad es mejor de noche.'],['We had a little party.','Hicimos una pequeña fiesta.']] }
  ]},
{ id:'u9', title:'Números, fechas y horas', icon:'🔢', color:'#f59e0b',
  desc:'13 vs 30, fechas, precios y la hora sin confusiones.',
  lessons:[
  { id:'teen-ty', sound:'-teen / -ty', title:'Thirteen vs. Thirty', icon:'🔟',
    expl:'Los números en -teen (13-19) llevan el acento al final: thir-TEEN, con "t" clara e "ii" larga. Los números en -ty (30, 40…90) llevan el acento al inicio: THIR-ty, y la t suena suave. Confundirlos es muy común… ¡y costoso con precios!',
    mouth:'-teen: alarga y da fuerza a la última sílaba ("fif-TIIIN"). -ty: fuerza en la primera sílaba y final corto ("FIF-ti").',
    pairLabels:['-teen (13-19)','-ty (30-90)'],
    ex:[['thirteen','trece'],['thirty','treinta'],['fifteen','quince'],['fifty','cincuenta'],['nineteen','diecinueve'],['ninety','noventa']],
    pairs:[['thirteen','thirty'],['fourteen','forty'],['fifteen','fifty'],['sixteen','sixty'],['seventeen','seventy'],['eighteen','eighty']],
    sents:[['The ticket costs fifteen dollars.','El tiquete cuesta quince dólares.'],['My brother is thirty years old.','Mi hermano tiene treinta años.'],['The class has sixteen students.','La clase tiene dieciséis estudiantes.']] },
  { id:'dates', sound:'ordinales', title:'Fechas y ordinales', icon:'📅',
    expl:'Para las fechas se usan números ordinales: first (1st), second (2nd), third (3rd), fourth (4th), fifth (5th)… En EE. UU. se dice "May fifth" y en Reino Unido "the fifth of May". Los años se leen en pares: 1995 = "nineteen ninety-five", 2026 = "twenty twenty-six".',
    mouth:'Muchos ordinales terminan en /θ/: fifth, sixth, twelfth. Saca la lengua entre los dientes al final. "Fifth" y "twelfth" son difíciles: di despacio "fif-θ", "twelf-θ".',
    ex:[['first','primero'],['second','segundo'],['third','tercero'],['fifth','quinto'],['twelfth','duodécimo'],['twentieth','vigésimo']],
    quiz:[{q:'¿Cómo se dice la fecha «5 de mayo» (EE. UU.)?',say:'May fifth',opts:['May fifth','May five','Five of May'],a:0},
          {q:'«first, second, third» significan…',say:'first, second, third',opts:['primero, segundo, tercero','uno, dos, tres','primera, siguiente, última'],a:0},
          {q:'¿Cómo se lee normalmente el año 2026?',say:'twenty twenty-six',opts:['twenty twenty-six','two zero two six','twenty hundred twenty-six'],a:0},
          {q:'¿Cómo suena el final de «fifth»?',say:'fifth',opts:['/θ/ (lengua entre dientes)','/t/','/s/'],a:0},
          {q:'«My birthday is on the twelfth of March» — ¿qué día?',say:'My birthday is on the twelfth of March',opts:['12 de marzo','20 de marzo','2 de marzo'],a:0}],
    sents:[['My birthday is on May fifth.','Mi cumpleaños es el cinco de mayo.'],['The meeting is on the third of June.','La reunión es el tres de junio.'],['I was born in nineteen ninety-five.','Nací en 1995.']] },
  { id:'prices-time', sound:'hora y precios', title:'Precios y horas', icon:'🕒',
    expl:'Horas: "a quarter past five" = 5:15, "half past seven" = 7:30, "ten to nine" = 8:50; también puedes decir los números: "five fifteen". Precios: $4.99 se dice "four ninety-nine" y $120 "a hundred and twenty dollars".',
    mouth:'En los precios, junta los números sin pausa ("four-ninety-nine") y acentúa el número importante. Recuerda -teen vs -ty.',
    ex:[['a quarter past','y cuarto'],['half past','y media'],['a quarter to','menos cuarto'],['hundred','cien'],['thousand','mil'],["o'clock",'en punto']],
    quiz:[{q:'«It\'s a quarter past five» significa…',say:"It's a quarter past five",opts:['Son las 5:15','Son las 4:45','Son las 5:25'],a:0},
          {q:'«It\'s half past seven» significa…',say:"It's half past seven",opts:['Son las 7:30','Son las 6:30','Son las 7:50'],a:0},
          {q:'¿Cómo se dice $4.99 normalmente?',say:'four ninety-nine',opts:['four ninety-nine','four point ninety-nine cents','four and ninety-nine'],a:0},
          {q:'«It costs a hundred and twenty dollars» — ¿cuánto cuesta?',say:'It costs a hundred and twenty dollars',opts:['$120','$102','$1,200'],a:0},
          {q:'«It\'s ten to nine» significa…',say:"It's ten to nine",opts:['Son las 8:50','Son las 9:10','Son las 10:09'],a:0}],
    sents:[['The movie starts at half past eight.','La película empieza a las ocho y media.'],['This jacket costs sixty dollars.','Esta chaqueta cuesta sesenta dólares.'],["It's a quarter to ten.",'Son las diez menos cuarto.']] }
  ]},
{ id:'u10', title:'Phrasal verbs comunes', icon:'🧱', color:'#10b981',
  desc:'Verbo + partícula: el vocabulario que más usan los nativos.',
  lessons:[
  { id:'pv-daily', type:'vocab', sound:'phrasal verbs', title:'Phrasal verbs del día a día', icon:'☀️',
    expl:'Un phrasal verb es un verbo + una partícula (up, on, off, for…) y su significado cambia por completo: "look" = mirar, pero "look for" = buscar. Son muy frecuentes en la conversación diaria.',
    items:[['wake up','despertarse','I wake up at six every day.','Me despierto a las seis todos los días.'],
           ['get up','levantarse (de la cama)','I get up right after my alarm.','Me levanto justo después de la alarma.'],
           ['turn on','encender','Please turn on the lights.','Por favor enciende las luces.'],
           ['turn off','apagar','Turn off your phone, please.','Apaga tu teléfono, por favor.'],
           ['pick up','recoger','I pick up my kids at three.','Recojo a mis hijos a las tres.'],
           ['look for','buscar','I am looking for my keys.','Estoy buscando mis llaves.']] },
  { id:'pv-life', type:'vocab', sound:'phrasal verbs', title:'Phrasal verbs útiles', icon:'🧭',
    expl:'Estos phrasal verbs aparecen todo el tiempo en series, canciones y conversaciones. Apréndelos con un ejemplo completo: así los recuerdas mejor.',
    items:[['find out','averiguar / enterarse','I found out the truth yesterday.','Me enteré de la verdad ayer.'],
           ['give up','rendirse / dejar de','Don\'t give up, you can do it.','No te rindas, tú puedes.'],
           ['run out of','quedarse sin','We ran out of milk.','Nos quedamos sin leche.'],
           ['come back','volver','I will come back tomorrow.','Volveré mañana.'],
           ['figure out','resolver / entender','I can\'t figure out this problem.','No logro resolver este problema.'],
           ['look forward to','esperar con ganas','I look forward to meeting you.','Espero con ganas conocerte.']] },
  { id:'pv-work', type:'vocab', sound:'phrasal verbs', title:'Phrasal verbs en el trabajo', icon:'💼',
    expl:'En correos y reuniones de trabajo en inglés se usan muchísimo. Te harán sonar profesional y natural.',
    items:[['set up','organizar / configurar','Let\'s set up a meeting for Monday.','Organicemos una reunión para el lunes.'],
           ['follow up','hacer seguimiento','I will follow up by email.','Haré seguimiento por correo.'],
           ['call off','cancelar','They called off the meeting.','Cancelaron la reunión.'],
           ['put off','posponer','Don\'t put off your work.','No pospongas tu trabajo.'],
           ['fill out','llenar (un formulario)','Please fill out this form.','Por favor llena este formulario.'],
           ['carry on','continuar','Carry on with your presentation.','Continúa con tu presentación.']] }
  ]},
{ id:'u11', title:'Falsos amigos', icon:'🎭', color:'#ec4899',
  desc:'Palabras que parecen español pero significan otra cosa.',
  lessons:[
  { id:'ff-1', type:'vocab', sound:'falsos amigos', title:'Falsos amigos I', icon:'😳',
    expl:'Los "falsos amigos" se parecen a palabras en español pero significan otra cosa. Decir "I\'m embarrassed" pensando en "embarazada" puede causar una situación muy graciosa (o incómoda).',
    items:[['actually','en realidad','Actually, I live in Cali, not in Bogota.','En realidad vivo en Cali, no en Bogotá.','actualmente'],
           ['embarrassed','avergonzado','I was so embarrassed at the party.','Estaba muy avergonzado en la fiesta.','embarazada'],
           ['library','biblioteca','I study at the library.','Estudio en la biblioteca.','librería'],
           ['sensible','sensato','That is a sensible decision.','Esa es una decisión sensata.','sensible (emocional)'],
           ['realize','darse cuenta','I didn\'t realize it was so late.','No me di cuenta de que era tan tarde.','realizar'],
           ['exit','salida','The exit is on the left.','La salida está a la izquierda.','éxito']] },
  { id:'ff-2', type:'vocab', sound:'falsos amigos', title:'Falsos amigos II', icon:'🏫',
    expl:'Más falsos amigos muy comunes en el estudio y el trabajo. Fíjate especialmente en "assist" y "attend": ¡son al revés de lo que parece!',
    items:[['assist','ayudar','Can I assist you?','¿Le puedo ayudar?','asistir (ir a)'],
           ['attend','asistir (ir a)','I attend classes on Saturdays.','Asisto a clases los sábados.','atender'],
           ['career','carrera profesional','She has a great career in marketing.','Ella tiene una gran carrera profesional en mercadeo.','carrera universitaria'],
           ['college','universidad','My son is in college.','Mi hijo está en la universidad.','colegio'],
           ['carpet','alfombra','The carpet is new.','La alfombra es nueva.','carpeta'],
           ['fabric','tela','This fabric is very soft.','Esta tela es muy suave.','fábrica']] },
  { id:'ff-3', type:'vocab', sound:'falsos amigos', title:'Falsos amigos III', icon:'🎬',
    expl:'Estos confunden incluso a estudiantes avanzados. "Constipated" no es resfriado, "lecture" no es lectura y "record" no es recordar.',
    items:[['constipated','estreñido','I feel constipated today.','Hoy me siento estreñido.','constipado (resfriado)'],
           ['support','apoyar','My family supports me.','Mi familia me apoya.','soportar (aguantar)'],
           ['argument','discusión (pelea)','We had an argument yesterday.','Tuvimos una discusión ayer.','argumento (de película)'],
           ['lecture','conferencia / clase magistral','The lecture starts at nine.','La conferencia empieza a las nueve.','lectura'],
           ['pretend','fingir','He pretends to be busy.','Él finge estar ocupado.','pretender (intentar)'],
           ['record','grabar','Can I record the meeting?','¿Puedo grabar la reunión?','recordar']] }
  ]},
{ id:'u12', title:'Small talk y entrevista avanzada', icon:'🌟', color:'#a855f7',
  desc:'Charlas casuales, networking y preguntas difíciles de entrevista.',
  lessons:[
  { id:'c-smalltalk', type:'dialog', sound:'conversación', title:'Small talk', icon:'☕',
    scene:'Te encuentras a un compañero en la cafetería de la oficina. Tú eres B.',
    lines:[['A',"Hey! How's it going?",'¡Hola! ¿Cómo va todo?'],
           ['B','Pretty good, thanks. How about you?','Bastante bien, gracias. ¿Y tú?'],
           ['A','Not bad. Crazy weather today, right?','Nada mal. Qué clima tan loco hoy, ¿no?'],
           ['B',"I know! It was sunny this morning and now it's raining.",'¡Sí! Estaba soleado en la mañana y ahora está lloviendo.'],
           ['A','Any plans for the weekend?','¿Algún plan para el fin de semana?'],
           ['B',"I'm going to visit some friends and watch a soccer game.",'Voy a visitar a unos amigos y ver un partido de fútbol.'],
           ['A','Sounds fun. Who are you rooting for?','Suena divertido. ¿Por quién vas a hinchar?'],
           ['B',"Colombia, of course! It's going to be a great match.",'¡Por Colombia, claro! Va a ser un gran partido.']] },
  { id:'c-network', type:'dialog', sound:'conversación', title:'Evento de networking', icon:'🤝',
    scene:'Estás en un evento profesional y conoces a alguien. Tú eres B.',
    lines:[['A',"Hi, I don't think we've met. I'm David.",'Hola, creo que no nos conocemos. Soy David.'],
           ['B',"Nice to meet you, David. I'm Ana. I work in digital marketing.",'Mucho gusto, David. Soy Ana. Trabajo en mercadeo digital.'],
           ['A','Interesting! How long have you been doing that?','¡Interesante! ¿Hace cuánto te dedicas a eso?'],
           ['B','About four years. I really enjoy working with data.','Unos cuatro años. Me encanta trabajar con datos.'],
           ['A','Are you looking for new opportunities?','¿Estás buscando nuevas oportunidades?'],
           ['B',"Yes, I'm open to remote positions with international teams.",'Sí, estoy abierta a cargos remotos con equipos internacionales.'],
           ['A',"Let's keep in touch. Here's my card.",'Sigamos en contacto. Aquí está mi tarjeta.'],
           ['B',"Thanks! I'll send you a message on LinkedIn.",'¡Gracias! Te escribo por LinkedIn.']] },
  { id:'c-interview2', type:'dialog', sound:'conversación', title:'Entrevista avanzada', icon:'🎯',
    scene:'Segunda ronda de una entrevista con preguntas difíciles. Tú eres B (candidato).',
    lines:[['A','What would you say is your biggest weakness?','¿Cuál dirías que es tu mayor debilidad?'],
           ['B',"Sometimes I focus too much on details, but I'm learning to prioritize.",'A veces me enfoco demasiado en los detalles, pero estoy aprendiendo a priorizar.'],
           ['A','Tell me about a time you solved a difficult problem.','Cuéntame de una vez que resolviste un problema difícil.'],
           ['B','Last year our main client was unhappy, so I organized a meeting and we fixed the issue together.','El año pasado nuestro cliente principal estaba insatisfecho, así que organicé una reunión y resolvimos el problema juntos.'],
           ['A','Where do you see yourself in five years?','¿Dónde te ves en cinco años?'],
           ['B',"I'd like to lead a team and keep growing in this industry.",'Me gustaría liderar un equipo y seguir creciendo en esta industria.'],
           ['A','What are your salary expectations?','¿Cuáles son tus expectativas salariales?'],
           ['B',"Based on my experience, I'm looking for a competitive salary within the market range.",'Según mi experiencia, busco un salario competitivo dentro del rango del mercado.']] }
  ]},
{ id:'u13', title:'Fluidez y debate avanzado (C1)', icon:'🚀', color:'#dc2626',
  desc:'Matices, idioms nativos, persuasión y debate profesional de alto nivel.',
  lessons:[
  { id:'adv-idioms', type:'vocab', sound:'expresiones nativas', title:'Modismos y expresiones nativas', icon:'💡',
    expl:'Los hablantes nativos usan constantemente "idioms" que no se pueden traducir palabra por palabra. Dominarlos te da fluidez natural.',
    items:[['hit the nail on the head','dar en el clavo','You hit the nail on the head with that comment.','Diste en el clavo con ese comentario.'],
           ['cut to the chase','ir al grano','Let\'s cut to the chase and discuss budget.','Vayamos al grano y discutamos el presupuesto.'],
           ['burn the midnight oil','trasnochar trabajando','I had to burn the midnight oil to finish the report.','Tuve que trasnochar trabajando para terminar el informe.'],
           ['take it with a grain of salt','tomar con pinzas','You should take online rumors with a grain of salt.','Deberías tomar los rumores de internet con pinzas.'],
           ['a blessing in disguise','no hay mal que por bien no venga','Losing that job was a blessing in disguise.','Perder ese trabajo fue algo bueno a fin de cuentas.'],
           ['play devil\'s advocate','hacer de abogado del diablo','Just to play devil\'s advocate, what if we fail?','Solo por hacer de abogado del diablo, ¿qué pasa si fallamos?']] },
  { id:'c-debate', type:'dialog', sound:'debate', title:'Debate y negociación profesional', icon:'⚖️',
    scene:'Reunión directiva donde se negocia una estrategia crítica. Tú eres B.',
    lines:[['A','In my opinion, we should postpone the launch until next quarter.','En mi opinión, deberíamos posponer el lanzamiento hasta el próximo trimestre.'],
           ['B','I see your point, but delaying it might give competitors the upper hand.','Entiendo tu punto, pero retrasarlo podría darle ventaja a los competidores.'],
           ['A','What do you propose we do about the remaining technical issues?','¿Qué propones que hagamos respecto a los problemas técnicos pendientes?'],
           ['B','We could launch a beta version and address feedback in real time.','Podríamos lanzar una versión beta y resolver comentarios en tiempo real.'],
           ['A','That sounds reasonable. Can your team commit to that deadline?','Eso suena razonable. ¿Tu equipo puede comprometerse con esa fecha límite?'],
           ['B','Absolutely. We have the resources ready to execute immediately.','Totalmente. Tenemos los recursos listos para ejecutar de inmediato.']] }
  ]},
{ id:'u14', title:'Inglés para el trabajo', icon:'🏢', color:'#1d4ed8',
  desc:'Correos, reuniones y presentaciones: suena profesional y seguro en inglés.',
  lessons:[
  { id:'work-email', type:'vocab', sound:'correos profesionales', title:'Emails profesionales', icon:'📧',
    expl:'En un correo de trabajo, el tono importa tanto como las palabras: saluda con cortesía, ve al grano y cierra con una frase amable. Estas 6 frases te sirven para casi cualquier correo.',
    items:[['I am writing to...','Te escribo para...','I am writing to confirm our meeting on Friday.','Te escribo para confirmar nuestra reunión del viernes.'],
           ['Please find attached','Adjunto encontrarás','Please find attached the report for March.','Adjunto encontrarás el informe de marzo.'],
           ['Could you please...?','¿Podrías, por favor...?','Could you please send me the updated file?','¿Podrías enviarme el archivo actualizado, por favor?'],
           ['Looking forward to...','Quedo atento a... / Espero con ganas...','I am looking forward to your reply.','Quedo atento a tu respuesta.'],
           ['As discussed','Como acordamos','As discussed, I will send the proposal today.','Como acordamos, enviaré la propuesta hoy.'],
           ['Please let me know','Por favor, avísame','Please let me know if you have any questions.','Por favor, avísame si tienes alguna pregunta.']] },
  { id:'work-meeting', type:'dialog', sound:'conversación', title:'Participar en reuniones', icon:'💬',
    scene:'Estás en una reunión de equipo en inglés y quieres dar tu opinión. Tú eres B.',
    lines:[['A',"Let's start the meeting. Ana, what do you think about the new project?",'Empecemos la reunión. Ana, ¿qué piensas del nuevo proyecto?'],
           ['B',"I think it's a great opportunity for the team.",'Creo que es una gran oportunidad para el equipo.'],
           ['A',"That's interesting. Do you have any concerns?",'Interesante. ¿Tienes alguna preocupación?'],
           ['B','My only concern is the deadline. It is very tight.','Mi única preocupación es la fecha límite. Es muy ajustada.'],
           ['A','Good point. How can we solve that?','Buen punto. ¿Cómo podemos resolver eso?'],
           ['B','We could start with the most important tasks first.','Podríamos empezar primero con las tareas más importantes.'],
           ['A',"I agree. Let's do that. Any other ideas?",'Estoy de acuerdo. Hagamos eso. ¿Alguna otra idea?'],
           ['B','I would also like to suggest a weekly check-in.','También me gustaría sugerir una revisión semanal.']] },
  { id:'work-present', type:'dialog', sound:'presentación', title:'Presentar un proyecto', icon:'🎤',
    scene:'Presentas los resultados de tu proyecto a tu equipo. Tú eres B (presentador).',
    lines:[['A','Good morning, everyone. Now Ana will present the project results.','Buenos días a todos. Ahora Ana presentará los resultados del proyecto.'],
           ['B','Thank you. Let me start with a quick summary.','Gracias. Déjenme empezar con un resumen rápido.'],
           ['A','That sounds good. What were the main results?','Suena bien. ¿Cuáles fueron los resultados principales?'],
           ['B','Sales increased by twenty percent in three months.','Las ventas aumentaron un veinte por ciento en tres meses.'],
           ['A',"That's impressive. What was the biggest challenge?",'Impresionante. ¿Cuál fue el mayor reto?'],
           ['B','The biggest challenge was the short deadline, but we managed it.','El mayor reto fue la fecha límite tan corta, pero lo logramos.'],
           ['A','Great work. Do you have any questions for Ana?','Gran trabajo. ¿Tienen preguntas para Ana?'],
           ['B',"Thank you for listening. I'm happy to answer your questions.",'Gracias por escuchar. Con gusto respondo sus preguntas.']] }
  ]},
{ id:'u15', title:'Inglés de series y películas', icon:'🎬', color:'#c2410c',
  desc:'Slang, habla real y frases famosas: entiende lo que dicen en la pantalla.',
  lessons:[
  { id:'media-slang', type:'vocab', sound:'slang', title:'Slang y habla real', icon:'😎',
    expl:'En las series, nadie habla como en los libros: usan slang, frases cortas y expresiones con mucho significado. Estas 6 son de las más comunes.',
    items:[["What's up?",'¿Qué tal? / ¿Qué pasa?',"Hey, what's up? Long time no see!",'¡Hola! ¿Qué tal? ¡Hace mucho que no nos vemos!'],
           ['No way!','¡No puede ser! / ¡Ni loco!','No way! Did you really win the lottery?','¡No puede ser! ¿De verdad ganaste la lotería?'],
           ['Hang on','Espera un momento','Hang on, I need to check my phone.','Espera un momento, necesito revisar mi teléfono.'],
           ['That was awesome','Eso fue increíble / genial','The concert was awesome!','¡El concierto fue increíble!'],
           ['No worries','No hay problema / Tranquilo','Thanks for your help. — No worries!','Gracias por tu ayuda. — ¡No hay problema!'],
           ["I can't even...",'Ni siquiera puedo... (estoy sin palabras)','That ending was so good, I can\'t even...','Ese final fue tan bueno que ni siquiera puedo...']] },
  { id:'media-series', sound:'series sin subtítulos', title:'Entender series sin subtítulos', icon:'📺',
    expl:'En las series, los actores hablan rápido y unen las palabras: "What are you doing?" suena "Whatcha doin\'?". Si aprendes estas formas reducidas, entenderás mucho más sin subtítulos.',
    mouth:'Escucha la frase completa, no palabra por palabra. Las palabras pequeñas se debilitan y se unen: "do you" suena "d\'ya" y "what are you" suena "whatcha". Repite despacio y luego a velocidad normal.',
    ex:[["Whatcha doin'?",'¿Qué estás haciendo?'],['Dunno',"No sé (I don't know)"],['Gimme a sec','Dame un segundo'],['Lemme know','Avísame'],['Kinda busy','Algo ocupado'],['Sorta tired','Medio cansado']],
    quiz:[{q:'«Whatcha doin\'?» significa…',say:"Whatcha doin'?",opts:['¿Qué estás haciendo?','¿Qué hiciste?','¿Dónde estás?'],a:0},
          {q:'«Dunno» es la forma corta de…',say:'Dunno',opts:["I don't know",'I do know','I knew'],a:0},
          {q:'«Gimme a sec» significa…',say:'Gimme a sec',opts:['Dame un segundo','Dame un secreto','Dame una sección'],a:0},
          {q:'«Lemme know» significa…',say:'Lemme know',opts:['Avísame','Déjame solo','Mírame'],a:0},
          {q:'«Kinda busy» significa…',say:'Kinda busy',opts:['Algo ocupado','Muy ocupado','Nada ocupado'],a:0}],
    sents:[["Whatcha doin' tonight?",'¿Qué haces esta noche?'],["Dunno, lemme check my calendar.",'No sé, déjame revisar mi calendario.'],["I'm kinda tired, gimme a sec.",'Estoy medio cansado, dame un segundo.']] },
  { id:'media-movies', type:'vocab', sound:'expresiones de películas', title:'Expresiones famosas de películas', icon:'🎞️',
    expl:'Estas frases de películas famosas se usan en la vida real para bromear, motivar o despedirse. Conócelas y úsalas con confianza.',
    items:[["I'll be back",'Volveré · Terminator (1984)',"\"I'll be back,\" he said before leaving.",'"Volveré", dijo antes de irse.'],
           ['May the Force be with you','Que la Fuerza te acompañe · Star Wars (1977)','May the Force be with you on your first day at work.','Que la Fuerza te acompañe en tu primer día de trabajo.'],
           ['Life is like a box of chocolates','La vida es como una caja de chocolates · Forrest Gump (1994)',"Life is like a box of chocolates, you never know what you're gonna get.",'La vida es como una caja de chocolates, nunca sabes lo que te va a tocar.'],
           ['To infinity and beyond!','¡Hasta el infinito y más allá! · Toy Story (1995)',"To infinity and beyond! Let's start the adventure.",'¡Hasta el infinito y más allá! Empecemos la aventura.'],
           ["Here's looking at you, kid",'Brindo por ti · Casablanca (1942)',"Here's looking at you, kid. It was a pleasure to meet you.",'Brindo por ti. Fue un placer conocerte.'],
           ["You can't handle the truth!",'¡No puedes con la verdad! · A Few Good Men (1992)',"You can't handle the truth! It's too much for you.",'¡No puedes con la verdad! Es demasiado para ti.']] }
  ]},
{ id:'u16', title:'Sonidos que faltan', icon:'🎙️', color:'#65a30d',
  desc:'La R americana, la L oscura y la NG final: los tres sonidos que más delatan tu acento.',
  lessons:[
  { id:'am-r', sound:'r', title:'La R americana', icon:'🇺🇸',
    expl:'La R americana /r/ es muy distinta de la R española: no vibra. La lengua se enrolla hacia atrás sin tocar el paladar, como un gruñido suave. Si dices "red" con R española, suena como "led" para un nativo.',
    mouth:'Dobla la punta de la lengua hacia arriba y hacia atrás, sin tocar nada, y haz el sonido vibrando la garganta: "rrrr". Los labios se redondean un poco. Practica: "red, right, very".',
    pairLabels:['/r/ R americana','/l/ L'],
    ex:[['red','rojo'],['right','correcto / derecha'],['very','muy'],['car','carro'],['sorry','lo siento'],['practice','práctica']],
    pairs:[['rock','lock'],['right','light'],['read','lead'],['rain','lane'],['rice','lice'],['red','led']],
    sents:[['The red car is on the right.','El carro rojo está a la derecha.'],['I am very sorry, I read the wrong message.','Lo siento mucho, leí el mensaje equivocado.'],['Please practice every day.','Por favor practica todos los días.']] },
  { id:'dark-l', sound:'ɫ', title:'La L oscura', icon:'🌙',
    expl:'En inglés hay dos L: la L clara al inicio ("light", "love") y la L oscura /ɫ/ al final o antes de consonante ("milk", "school", "ball"). La L oscura se hace con la parte de atrás de la lengua levantada y suena casi como una "u" oscura. Si dices "milk" con L clara, suena raro.',
    mouth:'Para la L oscura, levanta la parte de atrás de la lengua hacia el velo del paladar y deja la punta abajo, relajada. El sonido sale por los lados y suena grave, como "mi-ulk".',
    ex:[['school','colegio'],['milk','leche'],['all','todo'],['ball','pelota'],['help','ayuda'],['feel','sentir']],
    quiz:[{q:'¿Cuándo suena oscura la L?',say:'school',opts:['Al final de la palabra o antes de consonante','Al inicio de la palabra','Nunca suena oscura'],a:0},
          {q:'¿Cuál palabra tiene L oscura?',say:'milk',opts:['milk','light','love'],a:0},
          {q:'¿Cuál palabra tiene L clara?',say:'light',opts:['light','ball','school'],a:0},
          {q:'En «all», la L suena…',say:'all',opts:['oscura, casi como una "u"','como la L de "luz"','como una R'],a:0},
          {q:'¿Cómo se hace la L oscura?',say:'feel',opts:['Con la parte de atrás de la lengua levantada','Con la punta de la lengua vibrando','Con los labios juntos'],a:0}],
    sents:[['I drink milk at school.','Tomo leche en el colegio.'],['Please help me with the ball.','Por favor ayúdame con la pelota.'],['I feel good today.','Me siento bien hoy.']] },
  { id:'ng-final', sound:'ŋ', title:'La NG final (sing, song)', icon:'🎶',
    expl:'El sonido /ŋ/ de "sing", "song" y "morning" no existe al final de las palabras en español: no es una "n" ni una "g". Es un solo sonido nasal que se hace con la parte de atrás de la lengua. Si dices "sing" como "sin", cambias el significado: sing (cantar) vs. sin (pecado).',
    mouth:'Levanta la parte de atrás de la lengua hasta tocar el velo del paladar y deja salir el aire por la nariz, sin mover la punta de la lengua. No pronuncies la "g": "sing" es "si-ŋ", no "sin-g".',
    pairLabels:['/ŋ/ NG','/n/ N'],
    ex:[['sing','cantar'],['song','canción'],['long','largo'],['morning','mañana'],['walking','caminando'],['thing','cosa']],
    pairs:[['sing','sin'],['song','son'],['king','kin'],['wing','win'],['bang','ban'],['thing','thin']],
    sents:[['I sing a song every morning.','Canto una canción cada mañana.'],['The king is walking a long way.','El rey está caminando un largo camino.'],['This thing is amazing.','Esta cosa es increíble.']] }
  ]}
);
// Las lecciones de vocabulario reutilizan ex/sents para tarjetas, diccionario y shadowing
COURSE.forEach(u => u.lessons.forEach(l => { if (l.type === 'vocab') { l.ex = l.items.map(i => [i[0], i[1]]); l.sents = l.items.map(i => [i[2], i[3]]); } }));


'use strict';
// (Fase 3, modulo 7: movido a src/ui.js, lineas 447-654)
export function freshState() {
  return { v: 2, badges: {}, freezes: 0, coins: 50, quests: {}, chests: { dailyClaimed: null }, tukiSkin: { hat: 'none', outfit: 'none', hand: 'none', plumage: 'classic', owned: ['hat:none', 'outfit:none', 'hand:none', 'plumage:classic'] }, placement: null, placementFree: null, plans: {}, reviewed: 0, chats: 0, lives: 0, ph: {}, chatProfile: null, xp: 0, streak: 0, bestStreak: 0, lastDay: null, hearts: MAX_HEARTS, heartTs: Date.now(), done: {}, deck: {}, snd: {}, ear: {}, wd: {}, days: {}, spoken: 0, sessions: 0, settings: { ...DEFAULT_SETTINGS } };
}
export function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { console.warn('save failed', e); } }
load();

/* ---- índice de lecciones ---- */
export const LESSONS = [];
COURSE.forEach((u, ui) => u.lessons.forEach((l, li) => { l.unit = u; l.ui = ui; l.li = li; l.idx = LESSONS.length; LESSONS.push(l); }));
export const LESSON = Object.fromEntries(LESSONS.map(l => [l.id, l]));
export const isUnlocked = l => S.settings.freeMode || l.idx === 0 || isDone(LESSONS[l.idx - 1].id) || isDone(l.id);
// (Fase 3, modulo 7: movido a src/ui.js, lineas 666-679)
export function streakNow() { if (!S.lastDay) return 0; const d = dayDiff(S.lastDay, dayKey()); return d <= 1 ? S.streak : 0; }
export function addXP(n) {
  const k = dayKey(); let streakUp = false;
  if (S.lastDay !== k) { const d = S.lastDay ? dayDiff(S.lastDay, k) : 99; S.streak = d === 1 ? S.streak + 1 : 1; S.lastDay = k; streakUp = true; }
  S.bestStreak = Math.max(S.bestStreak, S.streak);
  S.xp += n; todayRec().xp += n; save(); return streakUp;
}
// (Fase 3, modulo 7: movido a src/ui.js, lineas 687-696)
let AC = null;
export function beep(type) {
  if (!S.settings.sound) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const seq = { ok: [[660, .09], [880, .14]], bad: [[220, .12], [180, .2]], done: [[523, .1], [659, .1], [784, .1], [1047, .25]], tap: [[500, .03]] }[type] || [];
    let t = AC.currentTime;
    seq.forEach(([f, d]) => {
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = type === 'bad' ? 'sawtooth' : 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(type === 'bad' ? 0.06 : 0.15, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g).connect(AC.destination); o.start(t); o.stop(t + d + 0.02); t += d * 0.9;
    });
  } catch (e) {}
}
export function tukiFanfare() {
  if (!S.settings.sound) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === 'suspended') AC.resume();
    const notes = [
      [523.25, 0.12, 'triangle', 0.18],
      [659.25, 0.12, 'triangle', 0.20],
      [783.99, 0.15, 'triangle', 0.22],
      [1046.50, 0.32, 'triangle', 0.26],
      [783.99, 0.12, 'sine', 0.18],
      [1046.50, 0.65, 'triangle', 0.28],
      [1318.51, 0.65, 'sine', 0.16]
    ];
    let t = AC.currentTime + 0.05;
    notes.forEach(([f, d, wave, vol], idx) => {
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = wave || 'triangle';
      o.frequency.value = f;
      const noteTime = idx === 6 ? t - 0.65 : t;
      g.gain.setValueAtTime(0.0001, noteTime);
      g.gain.linearRampToValueAtTime(vol, noteTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, noteTime + d);
      o.connect(g).connect(AC.destination);
      o.start(noteTime);
      o.stop(noteTime + d + 0.03);
      if (idx < 5) t += d * 0.92;
    });
  } catch (e) {}
}

function tukiTrophyFanfare() {
  if (!S.settings.sound) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === 'suspended') AC.resume();
    // Gran fanfarria orquestal polifónica para trofeos y conquista de unidades
    const notes = [
      // Frase 1 (Llamado de metales)
      [261.63, 0.12, 'triangle', 0.22, 0.00],
      [392.00, 0.12, 'triangle', 0.22, 0.12],
      [523.25, 0.15, 'triangle', 0.26, 0.24],
      [523.25, 0.22, 'triangle', 0.28, 0.38],
      // Frase 2 (Respuesta heroica)
      [293.66, 0.12, 'triangle', 0.22, 0.65],
      [440.00, 0.12, 'triangle', 0.24, 0.77],
      [587.33, 0.15, 'triangle', 0.28, 0.89],
      [587.33, 0.24, 'triangle', 0.30, 1.03],
      // Frase 3 (Arpegio ascendente rápido)
      [392.00, 0.08, 'sawtooth', 0.18, 1.30],
      [493.88, 0.08, 'sawtooth', 0.20, 1.38],
      [587.33, 0.08, 'sawtooth', 0.22, 1.46],
      [783.99, 0.12, 'sawtooth', 0.26, 1.54],
      // Acorde triunfal sostenido C Mayor con brillo Ka-ching
      [261.63, 1.20, 'triangle', 0.30, 1.66],
      [523.25, 1.20, 'triangle', 0.32, 1.66],
      [659.25, 1.20, 'triangle', 0.28, 1.66],
      [783.99, 1.20, 'sine',     0.28, 1.66],
      [1046.50, 1.40, 'triangle', 0.32, 1.66],
      [1318.51, 1.40, 'sine',     0.18, 1.66]
    ];
    const t0 = AC.currentTime + 0.04;
    notes.forEach(([f, d, wave, vol, offset]) => {
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = wave;
      o.frequency.value = f;
      const startT = t0 + offset;
      g.gain.setValueAtTime(0.0001, startT);
      g.gain.linearRampToValueAtTime(vol, startT + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, startT + d);
      o.connect(g).connect(AC.destination);
      o.start(startT);
      o.stop(startT + d + 0.04);
    });
  } catch (e) {}
}

/* RECONOCIMIENTO DE VOZ -> ver src/audio.js */


/* ---- registro de estadísticas de voz ---- */
/* ---- UI helpers ---- */
export function toast(msg, ms = 2600) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), ms); }
// (Fase 3, modulo 7: movido a src/ui.js, lineas 795-833)
document.addEventListener('click', e => { const w = e.target.closest('[data-say]'); if (w && w.dataset.say) speak(w.dataset.say, true); });


/* =================== CONSTRUCCIÓN DE LECCIONES =================== */
// (Fase 3, modulo 4: movido a src/lessons.js, lineas 833-892)
/* =================== MOTOR DE LECCIÓN =================== */
// (Fase 3, modulo 4: movido a src/lessons.js, lineas 894-903)
export function closeLesson() { $$('.confetti').forEach(c => c.remove()); stopRecognize(); speechSynthesis && speechSynthesis.cancel(); $('#full').classList.add('hidden'); document.body.style.overflow = ''; setL(null); render(); }
// (Fase 3, modulo 4: movido a src/lessons.js, lineas 905-910)
// (Fase 3, modulo 7: movido a src/ui.js, lineas 843-872)
export function tukiChirp(mood = 'chirp') {
  if (!S.settings.sound) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const t = AC.currentTime;
    if (mood === 'celebrate') {
      const notes = [1046.5, 1318.5, 1567.98];
      notes.forEach((freq, idx) => {
        const o = AC.createOscillator(), g = AC.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(freq, t + idx * 0.08);
        g.gain.setValueAtTime(0.001, t + idx * 0.08);
        g.gain.linearRampToValueAtTime(0.18, t + idx * 0.08 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.12);
        o.connect(g).connect(AC.destination);
        o.start(t + idx * 0.08);
        o.stop(t + idx * 0.08 + 0.13);
      });
    } else if (mood === 'comfort') {
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(440, t);
      o.frequency.exponentialRampToValueAtTime(520, t + 0.15);
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.12, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      o.connect(g).connect(AC.destination);
      o.start(t); o.stop(t + 0.26);
    } else {
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(800, t);
      o.frequency.exponentialRampToValueAtTime(1400, t + 0.09);
      o.frequency.exponentialRampToValueAtTime(1100, t + 0.2);
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.18, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      o.connect(g).connect(AC.destination);
      o.start(t); o.stop(t + 0.23);
    }
  } catch (e) {}
}

// (Fase 3, modulo 7: movido a src/ui.js, lineas 916-1105)
export function confetti() { victoryConfetti(1); }
/* (fase premium, etapa 7: punto único para el doble confetti del fin de
   unidad — DOM + canvas a la vez — para no duplicar la decisión en la
   entrada y en el re-celebrar. El fin de lección normal solo usa DOM.) */
function unitConfetti(waves) { victoryConfetti(waves); canvasConfetti(); }

export function finishLesson() {
  const secs = Math.round((Date.now() - L.start) / 1000);
  const pron = L.speak.length ? Math.round(avg(L.speak)) : null;
  const ear = L.earN ? Math.round(L.earOk / L.earN * 100) : null;
  const isPerfect = L.mode === 'lesson' && L.mistakes === 0;
  const isGoldPron = pron !== null && pron >= 88;
  let xp = L.mode === 'lesson' ? 10 + (isPerfect ? 5 : 0) + (pron !== null && pron >= 85 ? 5 : 0) : 5 + Math.min(5, L.speak.length);
  let extra = '';
  if (L.mode === 'lesson') {
    const first = !S.done[L.l.id];
    const d = S.done[L.l.id] || { times: 0, best: 0 }; d.times++; d.best = Math.max(d.best, pron || 0); d.last = Date.now(); S.done[L.l.id] = d;
    addToDeck(lessonItems(L.l));
    if (first) extra = `<p class="muted">🃏 Se agregaron ${lessonItems(L.l).length} tarjetas a tu mazo de repaso.</p>`;
  } else { refreshHearts(); if (S.hearts < MAX_HEARTS) { S.hearts++; extra = '<p class="muted">❤️ ¡Recuperaste una vida por practicar!</p>'; } }
  S.sessions++; todayRec().sec = (todayRec().sec || 0) + secs;
  const up = addXP(xp);
  const earnedCoins = L.mode === 'lesson' ? (15 + (isPerfect ? 10 : 0)) : 10;
  addCoins(earnedCoins);
  const goal = S.settings.goal, today = todayRec().xp;
  updateMascot();

  let unitCompleted = false;
  let unitTitle = '';
  let unitIdx = 0;
  if (L.mode === 'lesson' && L.l && L.l.unit) {
    const u = L.l.unit;
    const allDone = u.lessons.every(l => l.id === L.l.id || isDone(l.id));
    if (allDone && (!S.unitsDone || !S.unitsDone[u.id])) {
      unitCompleted = true;
      unitTitle = u.title;
      unitIdx = L.l.ui + 1;
      S.unitsDone = S.unitsDone || {};
      S.unitsDone[u.id] = Date.now();
      save();
      addCoins(50, '🏆 Trofeo de Unidad');
      addXP(25);
    }
  }

  // Audio: Fanfarria de trofeo o de lección + chirps
  if (unitCompleted) {
    tukiTrophyFanfare();
    setTimeout(() => tukiChirp('celebrate'), 650);
    // (fase premium, etapa 6: el fin de unidad dispara los dos confettis
    // en el mismo momento — DOM + canvas — para que se sienta distinto
    // al fin de lección normal, que solo usa el DOM)
    unitConfetti(5);
  } else {
    tukiFanfare();
    setTimeout(() => tukiChirp('celebrate'), 450);
    victoryConfetti(isPerfect ? 4 : 3);
  }

  // Insignias ganadas en esta lección
  const badges = [];
  if (unitCompleted) {
    badges.push(`<div class="victory-badge trophy-badge">🏆 ¡UNIDAD ${unitIdx} CONQUISTADA: ${esc(unitTitle)}! (+50 🪙 Trofeo)</div>`);
  }
  if (isPerfect) badges.push('<div class="victory-badge perfect-badge">⭐ ¡LECCIÓN PERFECTA! (+10 🪙 Extra)</div>');
  if (isGoldPron) badges.push(`<div class="victory-badge gold-badge">💎 ¡PRONUNCIACIÓN DE ORO (${pron}%)!</div>`);
  if (up) badges.push(`<div class="victory-badge streak-badge">🔥 ¡RACHA AUMENTADA! (${S.streak} ${S.streak === 1 ? 'día' : 'días'})</div>`);

  const finishQuote = unitCompleted
    ? `¡IMPRESIONANTE! ¡Completaste toda la Unidad ${unitIdx}: ${unitTitle}! ¡Reclamaste tu trofeo y 50 monedas extra!`
    : pick(isPerfect ? [
    '¡Increíble! ¡Lección perfecta sin un solo error! ¡Te ganaste 10 monedas extra!',
    '¡Impecable, campeón! ¡Ni un solo fallo! Estás volando con tu inglés.',
    '¡Qué bárbaro! Lección impecable. ¡Tuki está súper orgulloso de ti!'
  ] : isGoldPron ? [
    '¡Qué berraquera de pronunciación! Hablas con mucha claridad y ritmo.',
    '¡Upa! Tu acento y entonación estuvieron de lujo hoy. ¡Sigue así!',
    '¡Excelente pronunciación! La constancia diaria te está dando alas.'
  ] : [
    '¡Excelente trabajo hoy! Cada lección te acerca más a tu fluidez.',
    '¡Qué berraquera de práctica! Tu pronunciación está mejorando notablemente.',
    '¡Muy bien hecho! La constancia diaria es el verdadero secreto.',
    '¡Orgulloso de tu avance hoy! Mañana seguimos con toda la energía.'
  ]);

  const cardsHtml = [
    { t: 'XP', v: `+${xp}`, n: xp, pre: '+', c: 'var(--o)', bg: 'var(--o)' },
    { t: 'Monedas', v: `+${earnedCoins} 🪙`, n: earnedCoins, pre: '+', suf: ' 🪙', c: '#d97706', bg: '#d97706' },
    { t: 'Pronunciación', v: pron === null ? '—' : pron + '%', c: 'var(--g-d)', bg: 'var(--g)' },
    { t: 'Oído', v: ear === null ? '—' : ear + '%', c: 'var(--b-d)', bg: 'var(--b)' },
    { t: 'Tiempo', v: `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`, c: '#8b5cf6', bg: '#8b5cf6' }
  ].map((card, i) => `
    <div class="scard scard-celebrate" style="border-color:${card.bg};animation-delay:${0.1 + i * 0.08}s">
      <div class="t" style="background:${card.bg}">${card.t}</div>
      <div class="v" style="color:${card.c}"${card.n === undefined ? '' : ` data-countup="${card.n}" data-countup-prefix="${card.pre || ''}" data-countup-suffix="${card.suf || ''}"`}>${card.v}</div>
    </div>`).join('');

  // (fase premium, etapa 5: el fin de unidad se distingue del fin de lección
  // normal con la clase unit-complete y el color propio de la unidad (--uc):
  // fondo ambiental tintado y aura tintada. Las recompensas no cambian.)
  $('#fullInner').innerHTML = `<div class="complete${unitCompleted ? ' unit-complete' : ''}"${unitCompleted ? ` style="--uc:${L.l.unit.color}"` : ''}>
    <div class="victory-podium-wrap">
      <div class="victory-aura"></div>
      <div class="mascot tuki-celebrate" id="finishMascot" style="width:130px;height:130px;cursor:pointer;position:relative;z-index:2" title="¡Toca al Profe Tuki para celebrar!">
        ${MASCOT}
      </div>
      <div class="victory-podium">
        <span class="victory-podium-star">🏆</span>
      </div>
    </div>
    <h1>${unitCompleted ? '🏆 ¡Unidad Conquistada!' : isPerfect ? '¡Lección Perfecta!' : L.mode === 'lesson' ? '¡Lección completada!' : '¡Práctica completada!'}</h1>
    ${badges.length ? `<div class="victory-badges">${badges.join('')}</div>` : ''}
    ${unitCompleted ? `<div class="unit-summary">Resumen de la unidad: <b>${L.l.unit.lessons.length} lecciones</b> · Trofeo <b>+50 🪙</b> · <b>+25 XP</b> de unidad</div>` : ''}
    <div class="tuki-speech" style="margin:6px auto 12px;max-width:340px;background:var(--card);border:2px solid var(--line);border-radius:14px;padding:8px 12px;font-size:13px;font-weight:700">
      🦜 <b>Profe Tuki:</b> «${finishQuote}»
    </div>
    <div class="muted">${esc(L.title)}</div>
    <div class="scards">${cardsHtml}</div>
    ${up ? `<p>🔥 ¡Racha de <b>${S.streak}</b> ${S.streak === 1 ? 'día' : 'días'}!</p>` : ''}
    <p>Meta diaria: <b>${Math.min(today, goal)}/${goal} XP</b> ${today >= goal ? '🎉 ¡Cumplida!' : ''}</p>${extra}
    <div class="row" style="margin-top:10px;gap:8px">
      <button class="celebrate-btn" id="reCelebrateBtn">🎉 ¡Celebrar!</button>
      <button class="btn primary" id="primaryBtn" style="min-width:180px">Continuar</button>
    </div>
  </div>`;

  const fm = $('#finishMascot');
  // (fase premium, etapa 3: count-up de XP/monedas en las tarjetas de fin)
  countUpAll($('#fullInner'));
  const doCelebration = () => {
    if (fm) tukiMood(unitCompleted ? 'celebration' : 'proud', { el: fm, particles: 'coin' });
    if (unitCompleted) tukiTrophyFanfare();
    // (fase premium, etapa 6: re-celebrar el fin de unidad también dispara
    // el confetti de canvas, igual que al entrar)
    if (unitCompleted) unitConfetti(3);
    else victoryConfetti(1);
    speakTukiEs(finishQuote, fm);
  };
  if (fm) { fm.onclick = doCelebration; makeMascotClickable(fm, '¡Toca al Profe Tuki para celebrar!'); }
  const rcb = $('#reCelebrateBtn');
  if (rcb) rcb.onclick = doCelebration;

  $('#primaryBtn').onclick = closeLesson;

  // Tuki habla felicitando al usuario y moviendo el pico
  setTimeout(() => {
    if (fm) {
      tukiMood(unitCompleted ? 'celebration' : 'proud', { el: fm, particles: 'coin' });
      speakTukiEs(finishQuote, fm);
    }
  }, 400);
}
// (Fase 3, modulo 4: movido a src/lessons.js, lineas 1696-1700)
document.addEventListener('keydown', e => {
  if (!L || $('#full').classList.contains('hidden')) return;
  if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
  if (e.key === 'Enter') { const b = $('#primaryBtn'); if (b && !b.disabled) { e.preventDefault(); b.click(); } }
  else if (/^[1-9]$/.test(e.key)) { const o = $$('#lbody .opt')[+e.key - 1]; if (o && !o.disabled) o.click(); }
});


/* =================== VISTAS =================== */
export let TAB = 'learn';
export function render() {
  refreshHearts();
  updateMascot();
  $('#brand').innerHTML = `<span class="brand-mascot-wrap" title="¡Toca a Tuki!">${MASCOT}</span><span>Tuki Speak</span>`;
  const st = streakNow();
  $('#stStreak').innerHTML = '🔥 ' + st; $('#stStreak').classList.toggle('off', st === 0 || S.lastDay !== dayKey());
  $('#stXp').innerHTML = '💎 ' + S.xp;
  $('#stHearts').innerHTML = '❤️ ' + S.hearts;
  const scEl = $('#stCoins');
  if (scEl) scEl.innerHTML = '🪙 ' + (S.coins || 0);
  $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === TAB));
  const v = $('#view'); (VIEWS[TAB] || VIEWS.learn)(v); window.scrollTo(0, 0);
}
export function go(tab) { TAB = tab; stopRecognize(); render(); }
$$('.tab').forEach(t => t.onclick = () => go(t.dataset.tab));
$('#stGear').onclick = () => go('settings');
const scBtn = $('#stCoins');
if (scBtn) scBtn.onclick = () => openTukiShopModal();
const brandEl = $('#brand');
if (brandEl) { brandEl.onclick = () => interactWithTuki(brandEl); makeMascotClickable(brandEl, '¡Toca a Tuki!'); }
$('#stHearts').onclick = () => modal(`<h2>❤️ Vidas: ${S.hearts}/${MAX_HEARTS}</h2><p class="muted">Pierdes una vida solo en ejercicios de <b>oído</b> (elegir, ordenar, escribir) durante las lecciones. Los ejercicios de voz nunca quitan vidas. ${S.hearts < MAX_HEARTS ? `Próxima vida en ~${nextHeartIn()} min.` : '¡Estás al máximo!'} Completar una práctica te da +1 vida.</p><button class="btn primary block" data-x>Entendido</button>`, (el, c) => $('[data-x]', el).onclick = c);
$('#stStreak').onclick = () => modal(`<h2>🔥 Racha: ${streakNow()} días</h2><p class="muted">Gana XP cada día para mantener tu racha. Mejor racha: ${S.bestStreak} días. Hoy: ${todayRec().xp}/${S.settings.goal} XP.</p><button class="btn primary block" data-x>¡Vamos!</button>`, (el, c) => $('[data-x]', el).onclick = c);
$('#stXp').onclick = () => go('progress');
export const VIEWS = {};

/* ---- Aprender: mapa ---- */
VIEWS.learn = v => {
  const goal = S.settings.goal, t = todayRec().xp, p = Math.min(100, Math.round(t / goal * 100)), cur = currentLesson();
  const due = dueCards().length;
  const curLevel = S.settings.learnerLevel || 'novice';
  let html = `<div class="level-picker-card">
    <div class="row between">
      <div>
        <h3 style="margin:0">🎓 Tu nivel de aprendizaje</h3>
        <div class="small muted">Personaliza la experiencia, frases y explicaciones</div>
      </div>
      <span class="novice-badge">${curLevel === 'novice' ? '🌱 Desde cero' : curLevel === 'intermediate' ? '⚡ Intermedio' : '🚀 Avanzado'}</span>
    </div>
    <div class="level-seg" id="levelSeg">
      <button class="level-seg-btn ${curLevel === 'novice' ? 'active' : ''}" data-lvl="novice">
        <span>🌱 Novato</span>
        <span style="font-size:10px;font-weight:600">Desde cero</span>
      </button>
      <button class="level-seg-btn ${curLevel === 'intermediate' ? 'active' : ''}" data-lvl="intermediate">
        <span>⚡ Intermedio</span>
        <span style="font-size:10px;font-weight:600">Bases claras</span>
      </button>
      <button class="level-seg-btn ${curLevel === 'advanced' ? 'active' : ''}" data-lvl="advanced">
        <span>🚀 Avanzado</span>
        <span style="font-size:10px;font-weight:600">Fluidez total</span>
      </button>
    </div>
  </div>`;

  if (curLevel === 'novice') {
    html += `<div class="novice-tip-banner">
      <div style="font-size:26px">💡</div>
      <div style="flex:1"><b>Modo Novato activo:</b> Incluye pronunciación figurada en español y ritmo pausado para que aprendas sin miedo. ¡Toca cualquier palabra para escucharla lento!</div>
    </div>`;
  }

  html += `<div class="card goal"><div class="ring" style="--p:${p}" data-t="${Math.min(t, goal)}/${goal}"></div><div style="flex:1"><h3>Meta diaria</h3><div class="muted small">${t >= goal ? '🎉 ¡Meta cumplida! Sigue si quieres.' : `Te faltan ${goal - t} XP hoy.`}</div>
    ${due ? `<button class="btn blue sm" style="margin-top:8px" id="dueBtn">🃏 Repasar ${due} tarjeta${due > 1 ? 's' : ''}</button>` : ''}</div></div>`;
  if (!canSpeak()) html += `<div class="notice">⚠️ Este navegador no tiene reconocimiento de voz: podrás escuchar, grabarte y comparar, pero no recibir puntaje (o configura Azure en Ajustes). Para la experiencia completa usa <b>Google Chrome</b> (Android o computador) o Edge.</div>`;
  COURSE.forEach((u, ui) => {
    const done = u.lessons.filter(l => isDone(l.id)).length;
    const prevUnitDone = ui === 0 || S.settings.freeMode || COURSE[ui - 1].lessons.every(l => isDone(l.id));
    // (fase premium, etapa 5: hito al final de cada unidad)
    const unitDone = done === u.lessons.length;
    html += `<section class="unit unit-ambient ${!prevUnitDone ? 'unit-locked' : ''}" style="--uc:${u.color}"><div class="unit-head" style="background:${u.color}"><div><p>Unidad ${ui + 1} · ${done}/${u.lessons.length} ${!prevUnitDone ? '🔒' : ''}</p><h3>${u.icon} ${esc(u.title)}</h3><p>${esc(u.desc)}</p></div><button class="guide" data-guide="${u.id}">📘 Guía</button></div><div class="path">`;
    u.lessons.forEach((l, li) => {
      const unl = isUnlocked(l), dn = isDone(l.id), isCur = cur && cur.id === l.id;
      const off = [0, 48, 64, 48, 0, -48, -64, -48][(l.idx) % 8];
      const avgS = soundAvg(l.id);
      html += `<div class="node-wrap" style="transform:translateX(${off}px)">${isCur ? '<div class="start-tip">¡EMPEZAR!</div>' : ''}
        <button class="node ${dn ? 'done' : unl ? '' : 'locked'} ${isCur ? 'current' : ''}" style="--uc:${u.color}" data-lesson="${l.id}" aria-label="${esc(l.title)}">${dn ? '⭐' : unl ? l.icon : '🔒'}</button>
        <div class="node-label">${esc(l.title)}${avgS !== null ? `<br><span class="pill ${avgS >= 80 ? 'ok' : ''}">${avgS}%</span>` : ''}</div>${isCur ? `<div class="tuki-guide"><div class="tuki-guide-mascot" title="¡Toca a Tuki!">${MASCOT}</div><div class="tuki-guide-bubble">${esc(TUKI_QUOTES_ES[0])}</div></div>` : ''}</div>`;
    });
    html += `<div class="node-wrap"><button class="unit-milestone ${unitDone ? 'reached' : ''}" style="--uc:${u.color}" data-guide="${u.id}" aria-label="Hito de la unidad ${ui + 1}: ${esc(u.title)}${unitDone ? ' (conquistado)' : ''}">🏆</button><div class="node-label">Hito · Unidad ${ui + 1}</div></div></div></section>`;
  });
  html += `<p class="muted small" style="text-align:center">¿Quieres saltar a otra lección? Activa el "modo libre" en ⚙️ Ajustes.</p>`;
  v.innerHTML = html;

  $$('#levelSeg .level-seg-btn', v).forEach(btn => {
    btn.onclick = () => {
      const lvl = btn.dataset.lvl;
      S.settings.learnerLevel = lvl;
      if (lvl === 'novice') {
        S.settings.rate = 0.8;
        S.settings.chatLevel = 'A2';
      } else if (lvl === 'intermediate') {
        S.settings.rate = 0.9;
        S.settings.chatLevel = 'B1';
      } else {
        S.settings.rate = 1.0;
        S.settings.chatLevel = 'C1';
      }
      save();
      toast(`Nivel cambiado a: ${lvl === 'novice' ? '🌱 Novato (Desde cero)' : lvl === 'intermediate' ? '⚡ Intermedio' : '🚀 Avanzado'}`);
      render();
    };
  });

  const db = $('#dueBtn'); if (db) db.onclick = () => startReview();
  $$('[data-lesson]', v).forEach(b => b.onclick = () => lessonSheet(LESSON[b.dataset.lesson]));
  $$('[data-guide]', v).forEach(b => b.onclick = () => guideSheet(COURSE.find(u => u.id === b.dataset.guide)));
  // (fase premium, etapa 5: Tuki guía en el nodo actual; tocarlo es lo mismo
  // que tocar a Tuki en la marca o en el banner del tutor: celebra y habla
  // con una frase existente de TUKI_QUOTES_ES. Al renderizar saluda con la
  // pose 'proud' del coordinador, en silencio y sin partículas.)
  $$('.tuki-guide-mascot', v).forEach(g => { g.onclick = () => interactWithTuki(g); makeMascotClickable(g, '¡Toca a Tuki!'); });
  const tg = $('.tuki-guide-mascot', v);
  if (tg) tukiMood('proud', { el: tg, chirp: null, particles: false });
};
// (Fase 3, modulo 7: movido a src/ui.js, lineas 1359-1440)

/* ---- Práctica ---- */
VIEWS.practice = v => {
  const anyDone = Object.keys(S.done).length > 0;
  const weakWords = buildPractice('words').length;
  // (densidad PR A, v2.30.0: la tarjeta base "Shadowing" se elimina —
  // queda "Modo Shadowing" (misma clave de desbloqueo 'shadow',
  // 6 lecciones, Unidad 2) con su modal; y "Practica mis errores"
  // vive ahora en la tarjeta "🎯 Tus errores" de arriba, con sus
  // 2 acciones. Sin cambios de destino ni de lógica.)
  const cards = [
    ['weak', '🎯', '#ffe8e8', 'Repaso de sonidos débiles', 'Mezcla los sonidos donde tienes menor puntaje. +1 vida.'],
    ['pairs', '👂', '#e3f4ff', 'Pares mínimos rápidos', 'ship/sheep, best/vest… escucha, elige y dilo.'],
    ['words', '🔁', '#fff3d6', 'Palabras para repetir', weakWords ? `${weakWords} palabras con puntaje bajo.` : 'Aparecerán aquí las palabras que te cuesten.'],
    ['studio', '🎙️', '#e3f8ec', 'Estudio: grabar y comparar', 'Grábate y escúchate junto al modelo nativo. Escribe cualquier frase.'],
    ['chat', '💬', '#e8f0ff', 'Conversación con IA (opcional)', S.settings.geminiKey || gemShared() ? 'Roleplay por voz con tutor que corrige.' : 'Requiere una clave gratuita de Gemini en Ajustes.']
  ];
  v.innerHTML = `<h2>Práctica 🎤</h2><p class="muted small">Practicar no quita vidas y te da XP.${anyDone ? '' : ' Completa lecciones en Aprender para desbloquear más modos estilo Duolingo.'}</p>
    ${cards.map(c => {
      const unl = isFeatureUnlocked(c[0]);
      return `<button class="card pcard ${!unl ? 'locked-card' : ''}" data-p="${c[0]}">
        <div class="em" style="background:${c[2]}">${unl ? c[1] : '🔒'}</div>
        <div style="flex:1">
          <div class="row between">
            <h3 style="margin:0 0 2px">${c[3]}</h3>
            ${!unl ? '<span class="lock-pill">🔒 Bloqueado</span>' : ''}
          </div>
          <div class="muted small">${c[4]}</div>
        </div>
      </button>`;
    }).join('')}`;
  $$('[data-p]', v).forEach(b => b.onclick = () => {
    const k = b.dataset.p;
    if (!isFeatureUnlocked(k)) return showLockedFeatureModal(k);
    if (k === 'studio') return go('studio');
    if (k === 'chat') return go('chat');
    const q = buildPractice(k);
    if (!q.length) return toast(k === 'words' ? 'Aún no hay palabras débiles. ¡Haz una lección con voz!' : 'Completa una lección primero.');
    startLesson(null, 'practice', q, b.querySelector('h3').textContent);
  });
};

/* ---- Estudio: grabar y comparar ---- */
VIEWS.studio = v => {
  const all = []; LESSONS.forEach(l => { if (l.type === 'dialog') l.lines.forEach(x => all.push(x[1])); else { l.ex.forEach(x => all.push(x[0])); l.sents.forEach(x => all.push(x[0])); } });
  // (fix qa-text-data: la misma frase aparece en varias lecciones y el
  // selector la repetía — p. ej. "please", "thank you", "help", "support"
  // dos veces. Se deduplica conservando el orden de primera aparición.)
  const opts = [...new Set(all)];
  v.innerHTML = `<button class="btn ghost sm" id="back">← Práctica</button><h2 style="margin-top:12px">🎙️ Estudio: grabar y comparar</h2>
    <p class="muted small">1) Escucha el modelo · 2) Grábate · 3) Compara tu voz con el modelo · 4) Evalúa con el reconocedor (Chrome).</p>
    <div class="card"><label class="small muted" for="stText">Frase o palabra</label><textarea class="inp" id="stText" style="min-height:70px">${esc(STUDIO_PRESET() || pick(opts))}</textarea>
    <div class="row wrap" style="margin-top:8px"><button class="btn ghost sm" id="rnd">🎲 Otra frase</button><select class="field" id="stSel" style="flex:1;min-width:0"><option value="">— Elegir del curso —</option>${opts.map(o => `<option>${esc(o)}</option>`).join('')}</select></div></div>
    <div class="card"><div class="target" id="tgt"></div>
      <div class="cmp"><button class="btn blue sm" id="m1">🔊 Modelo</button><button class="btn ghost sm" id="m2">🐢 Lento</button>
      ${Rec.supported ? `<button class="btn red sm" id="rec">⏺ Grabar</button><button class="btn orange sm" id="me" disabled>▶️ Mi voz</button><button class="btn ghost sm" id="ab" disabled>🔁 Modelo → Mi voz</button>` : '<span class="small muted">Grabación no disponible en este navegador.</span>'}</div>
      ${canSpeak() ? `<button class="mic" id="mic" style="margin-top:14px">🎯 Evaluar pronunciación</button>` : `<div class="notice">Evaluación automática no disponible: usa Chrome.</div>`}
      <div id="res"></div></div>`;
  const txt = () => $('#stText').value.trim() || 'Hello';
  const upd = () => { $('#tgt').innerHTML = wordsHTML(txt()); };
  upd(); $('#stText').oninput = upd;
  $('#back').onclick = () => go('practice');
  $('#rnd').onclick = () => { $('#stText').value = pick(opts); upd(); $('#res').innerHTML = ''; };
  $('#stSel').onchange = e => { if (e.target.value) { $('#stText').value = e.target.value; upd(); $('#res').innerHTML = ''; } };
  $('#m1').onclick = () => speak(txt()); $('#m2').onclick = () => speak(txt(), true);
  let myUrl = null;
  const rb = $('#rec'); if (rb) rb.onclick = () => recOnlyToggle(rb, url => { myUrl = url; $('#me').disabled = !url; $('#ab').disabled = !url; rb.innerHTML = '⏺ Grabar de nuevo'; });
  const me = $('#me'); if (me) me.onclick = () => Rec.play(myUrl);
  const ab = $('#ab'); if (ab) ab.onclick = () => speak(txt(), false, () => setTimeout(() => Rec.play(myUrl), 300));
  const mic = $('#mic'); if (mic) mic.onclick = () => doMic(mic, (alts, url, az) => {
    const r = az || scoreSpeech(txt(), alts); recordSpeech('studio', r); addXP(1);
    if (url) { myUrl = url; if (me) { me.disabled = false; ab.disabled = false; } }
    $('#tgt').innerHTML = wordsHTML(txt(), r.words);
    $('#res').innerHTML = `<div class="scorebig" style="margin-top:10px;color:${r.pct >= S.settings.threshold ? 'var(--g-d)' : 'var(--o-d)'}">${r.pct}%</div><div class="heard">Escuché: «<b>${esc(r.heard)}</b>» ${r.conf ? `<span class="small muted">(confianza ${Math.round(r.conf * 100)}%)</span>` : ''}</div>${extraResultHTML(r, txt(), myUrl)}`; bindExtra($('#res'), r, txt(), myUrl);
    mic.innerHTML = '🎯 Evaluar de nuevo';
  }, txt());
};

/* ---- Progreso ---- */
// (Fase 3, modulo 7: movido a src/ui.js, lineas 1512-1580)

VIEWS.progress = v => {
  const all = Object.values(S.snd).flat().sort((a, b) => a.t - b.t);
  const recent = all.slice(-30).map(x => x.s);
  const overall = recent.length ? Math.round(avg(recent)) : null;
  const earT = Object.values(S.ear).reduce((a, e) => ({ r: a.r + e.r, w: a.w + e.w }), { r: 0, w: 0 });
  const earPct = earT.r + earT.w ? Math.round(earT.r / (earT.r + earT.w) * 100) : null;
  const rows = LESSONS.map(l => ({ l, a: soundAvg(l.id), n: (S.snd[l.id] || []).length, e: S.ear[l.id] }));
  const withData = rows.filter(r => r.a !== null);
  const weakest = withData.slice().sort((a, b) => a.a - b.a).filter(r => r.a < 90).slice(0, 3);
  // (densidad PR C, v2.32.0, ítem 8: las barras se agrupan por unidad
  // para el <details> de la sección "Sonidos" fusionada.)
  const soundUnits = []; rows.forEach(r => { let g = soundUnits.find(g => g.ui === r.l.ui); if (!g) { g = { ui: r.l.ui, title: r.l.unit.title, rows: [] }; soundUnits.push(g); } g.rows.push(r); });
  const wwords = Object.entries(S.wd).filter(([k, r]) => r.n).map(([k, r]) => ({ k, disp: r.disp || k, a: Math.round(r.sum / r.n), n: r.n })).sort((a, b) => a.a - b.a).slice(0, 10);
  const top5 = getTop5Errors();
  // (fix qa-text-data: getTop5Errors rellena con 5 sugerencias fijas cuando
  // no hay datos reales; sin distinguirlas, un usuario nuevo veía "70-75%"
  // como si fueran sus puntajes medidos. hasRealErrors marca si hay al
  // menos un error real; las sugerencias se muestran como tales, sin %.)
  const hasRealErrors = top5.some(e => !e.isSuggested);
  // gráfico de 14 días
  const days = []; for (let i = 13; i >= 0; i--) { const d = new Date(Date.now() - i * DAY); const k = dayKey(d); const r = S.days[k]; days.push({ k, lab: d.getDate(), s: r && r.n ? Math.round(r.sum / r.n) : null, xp: r ? r.xp : 0 }); }
  const W = 320, H = 130, px = i => 18 + i * ((W - 30) / 13), py = s => H - 20 - s / 100 * (H - 36);
  const pts = days.map((d, i) => d.s !== null ? [px(i), py(d.s)] : null).filter(Boolean);
  const maxXp = Math.max(10, ...days.map(d => d.xp));
  const chart = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Historial 14 días">
    ${[0, 50, 100].map(s => `<line x1="14" x2="${W - 6}" y1="${py(s)}" y2="${py(s)}" stroke="#eef1f3"/><text x="0" y="${py(s) + 4}" font-size="9" fill="#9aa6b0">${s}</text>`).join('')}
    ${days.map((d, i) => `<rect x="${px(i) - 6}" y="${H - 20 - d.xp / maxXp * 40}" width="12" height="${d.xp / maxXp * 40}" rx="3" fill="#ffe1b3"/><text x="${px(i)}" y="${H - 6}" font-size="9" text-anchor="middle" fill="#9aa6b0">${d.lab}</text>`).join('')}
    ${pts.length > 1 ? `<polyline fill="none" stroke="#1fa463" stroke-width="3" stroke-linejoin="round" points="${pts.map(p => p.join(',')).join(' ')}"/>` : ''}
    ${pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="#1fa463"/>`).join('')}</svg>`;
  const cur = currentLesson();
  let rec = '';
  if (!withData.length) rec = cur ? `Empieza con <b>${esc(cur.title)}</b> para obtener tu primer puntaje.` : '¡Completaste todo! Usa shadowing y la IA.';
  else if (weakest.length) rec = `Tu sonido más débil es <b>${esc(weakest[0].l.title)}</b> (${weakest[0].a}%). Practícalo 5 minutos hoy${cur ? ` y luego sigue con <b>${esc(cur.title)}</b>` : ''}.`;
  else rec = `¡Excelentes puntajes! ${cur ? `Continúa con <b>${esc(cur.title)}</b>.` : 'Prueba el shadowing o la conversación con IA.'}`;
  v.innerHTML = `<h2>Tu progreso 📈</h2>
    <div class="kpis"><div class="kpi"><span>Pronunciación</span><b style="color:var(--g-d)">${overall === null ? '—' : overall + '%'}</b><span>últimos 30 intentos</span></div>
    <div class="kpi"><span>Oído (pares/quiz)</span><b style="color:var(--b-d)">${earPct === null ? '—' : earPct + '%'}</b><span>${earT.r + earT.w} respuestas</span></div>
    <div class="kpi"><span>Intentos de voz</span><b>${S.spoken}</b><span>${S.sessions} sesiones completadas</span></div>
    <div class="kpi"><span>Racha / XP</span><b>🔥 ${streakNow()} · 💎 ${S.xp}</b><span>mejor racha ${S.bestStreak}</span></div></div>
    
    <div class="card top-errors-card" id="topErrorsCard">
      <div class="row between" style="margin-bottom:8px">
        <div>
          <h3 style="margin:0 0 2px;color:#b91c1c">🎯 Radar de tus 5 Errores Frecuentes</h3>
          <div class="small muted">${hasRealErrors ? 'Puntos críticos analizados en tu voz y mazo de tarjetas' : 'Sugerencias comunes para hispanohablantes · aún no hay datos de tu voz'}</div>
        </div>
        <span class="badge" style="background:#fee2e2;color:#991b1b;font-weight:900">Analítica</span>
      </div>
      <div class="top-errors-list">
        ${top5.map((err, i) => `
          <div class="top-error-item">
            <div style="display:flex;align-items:center;gap:8px;min-width:0">
              <span style="font-weight:900;color:var(--mute);font-size:13px;width:18px">${i + 1}.</span>
              <button class="spk sm" data-say-n="${esc(err.word.replace(/\(.*\)/, '').trim())}" title="Escuchar">🔊</button>
              <div style="min-width:0">
                <div style="font-weight:800;font-size:14px;color:var(--ink)">${esc(err.word)} ${err.sound ? `<span class="pill" style="font-size:11px;padding:1px 6px">${esc(err.sound)}</span>` : ''}</div>
                <div class="small muted" style="font-size:11px;line-height:1.2;margin-top:2px">${esc(err.tip)}</div>
              </div>
            </div>
            <div style="text-align:right;flex:none">
              ${err.isSuggested ? '<span class="pill">Sugerencia</span>' : `<span style="font-weight:900;font-size:13px;color:${err.score >= 75 ? 'var(--g-d)' : err.score >= 60 ? 'var(--o-d)' : 'var(--r)'}">${err.score}%</span>`}
            </div>
          </div>`).join('')}
      </div>
      <button class="btn red block" id="trainErrorsBtn" style="margin-top:12px;font-weight:900;background:#dc2626;box-shadow:0 4px 0 #991b1b">
        🚀 Entrenar mis 5 puntos débiles (3 min)
      </button>
    </div>

    <div class="card"><h3>💡 Recomendación</h3><p style="margin:0">${rec}</p>${weakest.length ? `<button class="btn primary sm" style="margin-top:10px" data-drill="${weakest[0].l.id}">Practicar ${esc(weakest[0].l.title)}</button>` : ''}</div>
    <div class="card"><h3>Últimos 14 días</h3><div class="small muted">Línea verde: puntaje promedio de voz · barras: XP</div>${chart}</div>
    <div class="card" id="soundsCard"><h3>🔊 Sonidos</h3>
      <div id="soundsChips"></div>
      ${weakest.length ? `<div class="small muted" style="margin:6px 0 2px">Sonidos más débiles</div>${weakest.map(r => `<div class="row between" style="padding:6px 0"><span>${r.l.icon} <b>${esc(r.l.title)}</b> <span class="pill">${r.a}%</span></span><button class="btn ghost sm" data-drill="${r.l.id}">Practicar</button></div>`).join('')}` : ''}
      <details style="margin-top:10px"><summary><b>Puntaje por sonido</b> <span class="small muted">· promedio de tus últimos 10 intentos de voz por lección</span></summary><div class="bars" style="margin-top:8px">
      ${soundUnits.map(u => `<div class="small" style="margin:10px 0 4px"><b>Unidad ${u.ui + 1} · ${esc(u.title)}</b></div>${u.rows.map(r => `<div class="bar"><span title="${esc(r.l.title)}">${r.l.icon} ${esc(r.l.type ? r.l.title.split(' ').slice(-2).join(' ') : '/' + r.l.sound + '/')}</span><div class="tr"><i style="width:${r.a || 0}%;background:${r.a === null ? '#eef1f3' : r.a >= 80 ? 'var(--g)' : r.a >= 60 ? 'var(--o)' : 'var(--r)'}"></i></div><span>${r.a === null ? '—' : r.a + '%'}</span></div>`).join('')}`).join('')}</div></details></div>
    <div class="card"><h3>Palabras para repetir</h3>${wwords.length ? `<div class="chips">${wwords.map(w => `<span class="wd ${colorOf(w.a / 100)}" data-say="${esc(w.disp)}">${esc(w.disp)} · ${w.a}%</span>`).join('')}</div><button class="btn blue sm" id="ww">🔁 Practicar estas palabras</button>` : '<div class="muted small">Aún no hay datos. Haz ejercicios de voz.</div>'}</div>
    <p class="muted small">ℹ️ ${azureReady() ? 'Con Azure activo, los ejercicios usan evaluación fonema por fonema (precisión, fluidez, integridad y prosodia). Sin Azure, ' : ''}el puntaje compara, palabra por palabra, lo que el reconocedor de voz del navegador entendió con la frase objetivo (usando su confianza y alternativas). No es un análisis fonético por sonido como el de apps de pago; úsalo como guía y complementa con "Grabar y comparar".</p>`;
  $$('[data-drill]', v).forEach(b => b.onclick = () => { const l = LESSON[b.dataset.drill]; startLesson(l, 'practice', buildPractice('sound', l.id), 'Práctica: ' + l.title); });
  const ww = $('#ww'); if (ww) ww.onclick = () => { const q = buildPractice('words'); q.length ? startLesson(null, 'practice', q, 'Palabras para repetir') : toast('Todas tus palabras tienen buen puntaje. 🎉'); };
  const teBtn = $('#trainErrorsBtn'); if (teBtn) teBtn.onclick = () => { const q = buildTopErrorsPractice(); if (q.length) startLesson(null, 'practice', q, '🎯 Refuerzo: Top 5 Errores'); else toast('No hay errores críticos registrados.'); };
  $$('[data-say-n]', v).forEach(b => b.onclick = () => speak(b.dataset.sayN));
};

/* ---- Palabras / tarjetas ---- */
let wordFilter = 'all', wordSearch = '';
VIEWS.words = v => {
  const deck = Object.entries(S.deck).map(([k, c]) => ({ key: k, ...c })), due = dueCards();
  const list = deck.filter(c => (wordFilter === 'all' || c.kind === wordFilter) && (!wordSearch || (c.en + ' ' + c.es).toLowerCase().includes(wordSearch.toLowerCase()))).sort((a, b) => b.added - a.added);
  v.innerHTML = `<h2>Tus tarjetas 🃏</h2>
    <div class="card"><div class="row between"><div><b style="font-size:22px">${deck.length}</b> <span class="muted">tarjetas</span><br><span class="muted small">${due.length} para repasar ahora · repetición espaciada (SM-2)</span></div>
    <button class="btn primary" id="rev" ${deck.length ? '' : 'disabled'}>${due.length ? `Repasar (${due.length})` : 'Repasar extra'}</button></div></div>
    ${deck.length ? `<input class="search" id="ws" placeholder="Buscar…" value="${esc(wordSearch)}"><div class="chips">${[['all', 'Todas'], ['palabra', 'Palabras'], ['frase', 'Frases']].map(f => `<button class="chip ${wordFilter === f[0] ? 'active' : ''}" data-f="${f[0]}">${f[1]}</button>`).join('')}</div>
    <div class="wlist">${list.map(c => `<div class="witem"><button class="spk" data-say-n="${esc(c.en)}">🔊</button><div style="min-width:0"><div class="en">${esc(c.en)}</div><div class="es">${esc(c.es)}</div></div><div class="lvl" title="Nivel ${Math.min(5, c.reps)}/5">${[1, 2, 3, 4, 5].map(i => `<i class="${c.reps >= i ? 'on' : ''}"></i>`).join('')}</div></div>`).join('') || '<div class="empty">Sin resultados.</div>'}</div>`
    : `<div class="empty"><div style="font-size:48px">🃏</div>Completa lecciones y cada palabra y frase se agregará aquí automáticamente.</div>`}`;
  const r = $('#rev'); if (r) r.onclick = () => startReview();
  const ws = $('#ws'); if (ws) ws.oninput = e => { wordSearch = e.target.value; const pos = e.target.selectionStart; VIEWS.words(v); const n = $('#ws'); n.focus(); n.setSelectionRange(pos, pos); };
  $$('[data-f]', v).forEach(b => b.onclick = () => { wordFilter = b.dataset.f; VIEWS.words(v); });
  $$('[data-say-n]', v).forEach(b => b.onclick = () => speak(b.dataset.sayN));
};
let R = null;
function startReview() {
  let q = dueCards();
  if (!q.length) q = Object.entries(S.deck).map(([k, c]) => ({ key: k, ...c })).sort((a, b) => a.ef - b.ef || a.due - b.due).slice(0, 10);
  if (!q.length) return toast('Aún no tienes tarjetas.');
  R = { q: shuffle(q).slice(0, 20), n: 0, total: Math.min(20, q.length) };
  $('#full').classList.remove('hidden'); document.body.style.overflow = 'hidden';
  nextCard();
}
function closeReview() { $$('.confetti').forEach(c => c.remove()); R = null; stopRecognize(); $('#full').classList.add('hidden'); document.body.style.overflow = ''; render(); }
function nextCard() {
  if (!R) return;
  if (!R.q.length) {
    addXP(5); beep('done');
    $('#fullInner').innerHTML = `<div class="complete"><div class="mascot" style="width:110px;height:110px">${MASCOT}</div><h1>¡Repaso terminado!</h1><p class="muted">Repasaste ${R.n} tarjetas. +5 XP</p><button class="btn primary" id="primaryBtn" style="min-width:200px">Continuar</button></div>`;
    $('#primaryBtn').onclick = closeReview; confetti(); return;
  }
  const c = R.q[0], card = S.deck[c.key];
  $('#fullInner').innerHTML = `<div class="lhead"><button class="xbtn" id="xr">✕</button><div class="pbar"><i style="width:${Math.round(R.n / (R.n + R.q.length) * 100)}%"></i></div><div class="lhearts" style="color:var(--b)">🃏 ${R.q.length}</div></div>
    <div class="lbody"><div class="ex-title">Repaso de tarjetas</div>
    <div class="flash" id="flash"><div class="flash-in"><div class="face"><div class="muted small">${card.kind === 'frase' ? 'FRASE' : 'PALABRA'} · ¿Qué significa?</div><div class="big">${esc(card.en)}</div><div class="row"><button class="spk" id="c1">🔊</button><button class="spk slow" id="c2">🐢</button></div><div class="muted small">Toca la tarjeta para voltearla</div></div>
    <div class="face back"><div class="big" style="font-size:24px">${esc(card.es)}</div><div class="muted">${esc(card.en)}</div>${canSpeak() ? '<button class="btn blue sm" id="csay">🎤 Pronunciar</button><div id="cres" class="small"></div>' : ''}</div></div></div></div>
    <div class="lfoot" id="lfoot"><span></span><button class="btn primary" id="primaryBtn">Mostrar respuesta</button></div>`;
  $('#xr').onclick = closeReview;
  const flip = () => { $('#flash').classList.add('flipped'); showRate(); };
  $('.flash-in').onclick = e => { if (e.target.closest('button')) return; $('#flash').classList.contains('flipped') ? $('#flash').classList.remove('flipped') : flip(); };
  $('#c1').onclick = () => speak(card.en); $('#c2').onclick = () => speak(card.en, true);
  $('#primaryBtn').onclick = flip;
  const cs = $('#csay'); if (cs) cs.onclick = () => doMic(cs, (alts, url, az) => { const r = az || scoreSpeech(card.en, alts); recordSpeech(card.lesson, r); $('#cres').innerHTML = `<div class="target" style="font-size:18px">${wordsHTML(card.en, r.words)}</div><b>${r.pct}%</b> · escuché «${esc(r.heard)}»`; }, card.en);
  if (S.settings.autoplay) setTimeout(() => speak(card.en), 250);
  function showRate() {
    const f = $('#lfoot'); f.style.display = 'block';
    f.innerHTML = `<div class="rate">${[[1, 'Otra vez', 'red'], [3, 'Difícil', 'orange'], [4, 'Bien', 'blue'], [5, 'Fácil', 'primary']].map(([q, lab, cl]) => `<button class="btn ${cl}" data-q="${q}">${lab}<small>${intervalLabel(card, q)}</small></button>`).join('')}</div>`;
    $$('[data-q]', f).forEach(b => b.onclick = () => { const q = +b.dataset.q; sm2(card, q); R.n++; S.reviewed = (S.reviewed || 0) + 1; save(); const it = R.q.shift(); if (q < 3) R.q.push(it); beep(q < 3 ? 'bad' : 'ok'); nextCard(); });
  }
}

/* ---- Conversación con IA (Gemini, opcional) ---- */
/* =================== v2: AYUDAS GENERALES =================== */
export const APP_VERSION = '2.32.0';
// (Fase 3, modulo 7: movido a src/ui.js, lineas 1712-1725)
const _beep = beep; beep = function (t) { _beep(t); vibrate({ ok: 25, bad: [50, 40, 50], done: [30, 30, 80], tap: 8 }[t] || 0); };

/* VOZ (TTS): dispositivo, Azure u OpenAI -> ver src/audio.js */

/* CAPTURA DE MICRÓFONO (PCM/WAV) -> ver src/audio.js */
/* CAPTURA DE MICRÓFONO (PCM/WAV) -> ver src/audio.js */

/* AZURE: EVALUACIÓN DE PRONUNCIACIÓN -> ver src/audio.js */
/* AZURE: EVALUACIÓN DE PRONUNCIACIÓN -> ver src/audio.js */
// (Fase 3, modulo 7: movido a src/ui.js, lineas 1735-1785)
export async function decodeAudio(src) {
  if (src && LAST_REC && LAST_REC.samples && (src === LAST_REC.url || src === LAST_REC.blob || src === LAST_REC.samples)) {
    return LAST_REC.samples;
  }
  if (src instanceof Float32Array) return src;
  let ab;
  if (src instanceof Blob) {
    ab = await src.arrayBuffer();
  } else if (typeof src === 'string' && src.startsWith('blob:') && LAST_REC && LAST_REC.blob && src === LAST_REC.url) {
    ab = await LAST_REC.blob.arrayBuffer();
  } else {
    ab = await (await fetch(src)).arrayBuffer();
  }
  AC = AC || new (window.AudioContext || window.webkitAudioContext)();
  const buf = await AC.decodeAudioData(ab.slice(0));
  return resample(buf.getChannelData(0), buf.sampleRate, 16000);
}
/* VISUALIZACIÓN: ONDA Y TONO (pitch) -> ver src/audio.js */
// (Fase 3, modulo 7: movido a src/ui.js, lineas 1804-1890)
// (Fase 3, modulo 7: movido a src/ui.js, lineas 1891-1923)
function buildPlan() {
  const weak = buildPractice('weak').filter(e => e.kind !== 'learn').slice(0, 4);
  const due = dueCards().sort((a, b) => a.due - b.due).slice(0, 4).map(c => ({ kind: 'speak', variant: c.kind === 'frase' ? 'sentence' : 'word', l: LESSON[c.lesson] || LESSONS[0], text: c.en, es: c.es, cardKey: c.key }));
  const pairs = buildPractice('pairs').slice(0, 10 - weak.length - due.length);
  return shuffle([...weak, ...due]).concat(pairs).slice(0, 10);
}
function planCardHTML() {
  const done = S.plans && S.plans[dayKey()], due = dueCards().length, cur = currentLesson();
  return `<div class="card plan-card"><div class="row between"><div><h3 style="margin:0">📅 Plan de hoy · ~10 min</h3><div class="muted small">${done ? '✅ ¡Completado hoy! Puedes repetirlo.' : 'Sesión automática hecha para ti.'}</div></div><div style="font-size:34px">${done ? '🏆' : '🎯'}</div></div>
    <div class="plan-steps"><span class="plan-step">🎯 Sonidos débiles</span><span class="plan-step">🃏 ${Math.min(4, due)} tarjetas</span><span class="plan-step">👂 Pares mínimos</span>${cur ? `<span class="plan-step">⭐ ${esc(cur.title)}</span>` : ''}</div>
    <button class="btn orange block" id="planBtn">${done ? 'Repetir plan' : 'Empezar plan de hoy'}</button></div>`;
}
const _finishLesson = finishLesson;
finishLesson = function () {
  if (L.mode === 'placement') return placementFinish();
  const wasPlan = L.mode === 'plan';
  if (wasPlan) { S.plans = S.plans || {}; S.plans[dayKey()] = 1; }
  _finishLesson();
  if (wasPlan) { const cur = currentLesson(); if (cur) { const b = document.createElement('button'); b.className = 'btn blue'; b.style.minWidth = '220px'; b.textContent = '⭐ Lección nueva: ' + cur.title; b.onclick = () => { closeLesson(); startLesson(cur); }; $('.complete').appendChild(b); } }
  checkBadges();
};

/* =================== INSIGNIAS, RACHA, PREFERENCIAS =================== */
const nDone = () => Object.values(S.done).filter(d => !d.placed || d.times).length;
const BADGES = [
  { id: 'first', i: '🐣', t: 'Primer paso', d: 'Completa tu primera lección', c: () => nDone() >= 1 },
  { id: 'five', i: '📚', t: 'Constante', d: 'Completa 5 lecciones', c: () => nDone() >= 5 },
  { id: 'fifteen', i: '🎓', t: 'Dedicación', d: 'Completa 15 lecciones', c: () => nDone() >= 15 },
  { id: 'unit', i: '🏅', t: 'Unidad completa', d: 'Termina una unidad entera', c: () => COURSE.some(u => u.lessons.every(l => S.done[l.id] && S.done[l.id].times)) },
  { id: 'streak3', i: '🔥', t: 'Racha de 3', d: '3 días seguidos', c: () => S.bestStreak >= 3 },
  { id: 'streak7', i: '⚡', t: 'Racha de 7', d: 'Una semana seguida', c: () => S.bestStreak >= 7 },
  { id: 'streak30', i: '🏆', t: 'Racha de 30', d: 'Un mes seguido', c: () => S.bestStreak >= 30 },
  { id: 'voice50', i: '🎤', t: 'Buena voz', d: '50 intentos de voz', c: () => S.spoken >= 50 },
  { id: 'voice300', i: '🎙️', t: 'Imparable', d: '300 intentos de voz', c: () => S.spoken >= 300 },
  { id: 'perfect', i: '💯', t: 'Perfecto', d: '100% en un ejercicio de voz', c: () => Object.values(S.snd).some(a => a.some(x => x.s >= 100)) },
  { id: 'th', i: '👅', t: 'Maestro de la TH', d: '≥85% en /θ/ y /ð/', c: () => soundAvg('th-voiceless') >= 85 && soundAvg('th-voiced') >= 85 },
  { id: 'cards50', i: '🃏', t: 'Memoria de elefante', d: 'Repasa 50 tarjetas', c: () => (S.reviewed || 0) >= 50 },
  { id: 'chat', i: '💬', t: 'Conversador', d: 'Chatea con la IA', c: () => (S.chats || 0) >= 1 },
  { id: 'live', i: '📞', t: 'En vivo', d: 'Conversación de voz en vivo', c: () => (S.lives || 0) >= 1 },
  { id: 'plan5', i: '📅', t: 'Disciplina', d: 'Plan de hoy 5 días', c: () => Object.keys(S.plans || {}).length >= 5 },
  { id: 'placement', i: '🧭', t: 'Explorador', d: 'Haz la prueba de nivel', c: () => S.placement && typeof S.placement === 'object' },
  { id: 'goal', i: '🎯', t: 'Meta cumplida', d: 'Cumple tu meta diaria', c: () => Object.values(S.days).some(d => d.xp >= S.settings.goal) }
];
let badgeTimer = null;
export function checkBadges() {
  const fresh = BADGES.filter(b => !S.badges[b.id] && (() => { try { return b.c(); } catch (e) { return false; } })());
  if (!fresh.length) return; fresh.forEach(b => S.badges[b.id] = Date.now()); _save();
  fresh.forEach((b, i) => setTimeout(() => toast(`${b.i} ¡Nueva insignia: ${b.t}!`, 3200), i * 1200));
}
const _save = save; save = function () { _save(); clearTimeout(badgeTimer); badgeTimer = setTimeout(checkBadges, 400); };
streakNow = function () { if (!S.lastDay) return 0; const d = dayDiff(S.lastDay, dayKey()); return d <= 1 ? S.streak : (d - 1 <= (S.freezes || 0) ? S.streak : 0); };
addXP = function (n) {
  const k = dayKey(); let up = false;
  if (S.lastDay !== k) {
    const d = S.lastDay ? dayDiff(S.lastDay, k) : 99;
    if (d === 1) S.streak++;
    else if (d > 1 && d < 99 && d - 1 <= (S.freezes || 0)) { S.freezes -= d - 1; S.streak++; setTimeout(() => toast(`🧊 Usaste ${d - 1} protector${d > 2 ? 'es' : ''} de racha. ¡Tu racha sigue!`, 3500), 500); }
    else S.streak = 1;
    S.lastDay = k; up = true;
    if (S.streak > 0 && S.streak % 7 === 0 && (S.freezes || 0) < 2) { S.freezes = (S.freezes || 0) + 1; setTimeout(() => toast('🧊 ¡Ganaste un protector de racha por 7 días seguidos!', 3500), 800); }
  }
  S.bestStreak = Math.max(S.bestStreak, S.streak); S.xp += n; todayRec().xp += n; save(); return up;
};
function applyPrefs() {
  const s = S.settings, root = document.documentElement;
  const dark = s.theme === 'dark' || (s.theme === 'auto' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
  root.dataset.theme = dark ? 'dark' : 'light'; root.dataset.contrast = s.contrast ? 'high' : 'normal'; root.dataset.motion = s.reduceMotion ? 'reduce' : 'normal';
  document.body.style.zoom = s.fontScale && s.fontScale !== 1 ? s.fontScale : '';
  const m = $('meta[name=theme-color]'); if (m) m.content = dark ? '#0f1720' : '#1fa463';
}
if (window.matchMedia) try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyPrefs); } catch (e) {}
const _confetti = confetti; confetti = function () { if (!S.settings.reduceMotion && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) _confetti(); };


/* Un solo aviso a la vez; en la pestaña IA se muestra arriba para no tapar el botón de voz */
toast = function (msg, ms = 2600) { $$('.toast').forEach(x => x.remove()); const t = document.createElement('div'); t.className = 'toast' + (TAB === 'chat' ? ' top' : ''); t.setAttribute('role', 'status'); t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), ms); };
/* =================== DICCIONARIO / FRASES =================== */
// (Fase 3, modulo 7: movido a src/ui.js, lineas 2001-2024)
const _words = VIEWS.words;
VIEWS.words = v => { if (WORDS_MODE === 'dict') return renderDict(v); _words(v); v.insertAdjacentHTML('afterbegin', wordsToggleHTML()); bindWordsToggle(v); };

/* =================== VISTA APRENDER: plan + prueba de nivel =================== */
const _learn = VIEWS.learn;
VIEWS.learn = v => {
  _learn(v);
  const g = $('.card.goal', v);
  const cta = S.placement == null || S.placement === 'skipped' && !Object.keys(S.done).length ? `<div class="card row between"><div><b>🧭 Prueba de nivel</b><div class="small muted">3 minutos para empezar en la unidad correcta.</div></div><button class="btn blue sm" id="plBtn">Hacer</button></div>` : '';
  g.insertAdjacentHTML('afterend', planCardHTML() + cta);
  $('#planBtn').onclick = () => { const q = buildPlan(); q.length ? startLesson(null, 'plan', q, 'Plan de hoy') : toast('Completa una lección primero.'); };
  const pb = $('#plBtn'); if (pb) pb.onclick = placementIntro;
};

/* =================== PROGRESO: semana, fonemas, insignias =================== */
const _progress = VIEWS.progress;
VIEWS.progress = v => {
  _progress(v);
  const wk = off => { let xp = 0, n = 0, sum = 0, sec = 0, act = 0; for (let i = off; i < off + 7; i++) { const r = S.days[dayKey(new Date(Date.now() - i * DAY))]; if (r) { xp += r.xp; n += r.n; sum += r.sum; sec += r.sec || 0; if (r.xp) act++; } } return { xp, n, avg: n ? Math.round(sum / n) : null, min: Math.round(sec / 60), act }; };
  const a = wk(0), b = wk(7), delta = (x, y) => y ? ` <span class="small" style="color:${x >= y ? 'var(--g-d)' : 'var(--r)'}">${x >= y ? '▲' : '▼'} ${Math.abs(x - y)}</span>` : '';
  const days = []; for (let i = 6; i >= 0; i--) { const d = new Date(Date.now() - i * DAY); days.push({ l: 'DLMMJVS'[d.getDay()], xp: (S.days[dayKey(d)] || {}).xp || 0 }); }
  const mx = Math.max(10, ...days.map(d => d.xp));
  const phs = Object.entries(S.ph || {}).filter(([p, r]) => r.n >= 2).map(([p, r]) => ({ p, a: Math.round(r.sum / r.n), n: r.n })).sort((x, y) => x.a - y.a).slice(0, 8);
  $('.kpis', v).insertAdjacentHTML('afterend', `<div class="card"><h3>📆 Esta semana</h3>
    <div class="kpis" style="margin:6px 0 0"><div class="kpi"><span>XP</span><b>${a.xp}${delta(a.xp, b.xp)}</b></div><div class="kpi"><span>Minutos</span><b>${a.min}${delta(a.min, b.min)}</b></div><div class="kpi"><span>Intentos de voz</span><b>${a.n}${delta(a.n, b.n)}</b></div><div class="kpi"><span>Días activos</span><b>${a.act}/7</b></div></div>
    <div class="small muted">Promedio de voz: ${a.avg == null ? '—' : a.avg + '%'} (semana anterior: ${b.avg == null ? '—' : b.avg + '%'}) · 🧊 Protectores de racha: ${S.freezes || 0}</div>
    <div class="week" style="margin-bottom:22px">${days.map(d => `<div style="height:${Math.max(3, d.xp / mx * 100)}%" title="${d.xp} XP"><span>${d.l}</span></div>`).join('')}</div></div>`);
  // (densidad PR C, v2.32.0, ítem 8: los chips de fonemas (Azure) ya no
  // son una tarjeta aparte: van como resumen arriba de la sección
  // "Sonidos" fusionada. Si no existiera ese hueco, se mantiene la
  // tarjeta de antes como respaldo.)
  const sc = $('#soundsChips', v);
  if (phs.length && sc) sc.innerHTML = `<div class="small muted" style="margin-bottom:4px">🔬 Fonemas más débiles (Azure)</div><div class="chips">${phs.map(p => `<span class="ph ${colorOf(p.a / 100)}" style="font-size:16px;padding:4px 8px" title="${p.n} intentos">/${esc(p.p)}/ · ${p.a}</span>`).join('')}</div><div class="small muted">${esc(PH_TIPS[phs[0].p] || '')}</div>`;
  else if (phs.length) $('.kpis', v).insertAdjacentHTML('afterend', `<div class="card"><h3>🔬 Fonemas más débiles (Azure)</h3><div class="chips">${phs.map(p => `<span class="ph ${colorOf(p.a / 100)}" style="font-size:16px;padding:4px 8px" title="${p.n} intentos">/${esc(p.p)}/ · ${p.a}</span>`).join('')}</div><div class="small muted">${esc(PH_TIPS[phs[0].p] || '')}</div></div>`);
  const last = v.lastElementChild;
  // (densidad PR C, v2.32.0, ítem 9: las 24 insignias quedan plegadas
  // bajo un <details>; el encabezado con el conteo sigue visible.)
  last.insertAdjacentHTML('beforebegin', `<div class="card"><h3>🏅 Insignias (${Object.keys(S.badges).length}/${BADGES.length})</h3><details><summary><b>Ver las ${BADGES.length} insignias</b></summary><div class="badges" style="margin-top:8px">${BADGES.map(b => `<div class="badge ${S.badges[b.id] ? '' : 'off'}" title="${esc(b.d)}"><span class="i">${b.i}</span>${esc(b.t)}<div class="small muted" style="font-weight:600">${esc(b.d)}</div></div>`).join('')}</div></details></div>`);
};

/* =================== RACHA: modal con protectores =================== */
$('#stStreak').onclick = () => modal(`<h2>🔥 Racha: ${streakNow()} días</h2><p class="muted">Gana XP cada día para mantener tu racha. Mejor racha: ${S.bestStreak} días. Hoy: ${todayRec().xp}/${S.settings.goal} XP.</p>
  <div class="tipbox">🧊 <b>Protectores de racha: ${S.freezes || 0}/2</b><br><span class="small">Si un día no practicas, un protector mantiene tu racha. Ganas uno cada 7 días seguidos, o puedes canjear uno por 100 XP.</span></div>
  <div class="row"><button class="btn ghost block" data-buy ${(S.freezes || 0) >= 2 || S.xp < 100 ? 'disabled' : ''}>Canjear (100 XP)</button><button class="btn primary block" data-x>¡Vamos!</button></div>`,
  (el, c) => { $('[data-x]', el).onclick = c; $('[data-buy]', el).onclick = () => { S.xp -= 100; S.freezes = (S.freezes || 0) + 1; save(); c(); render(); toast('🧊 ¡Protector de racha listo!'); }; });

const _go = go; go = function (tab) { if (LIVE.on && tab !== 'chat') stopLive(); _go(tab); };
/* Popup de palabra */
// (Fase 3, modulo 7: movido a src/ui.js, lineas 2065-2124)
document.addEventListener('click', e => { const p = $('#wordPop'); if (p && !p.contains(e.target) && !e.target.closest('.tw')) closeWordPop(); }, true);
VIEWS.chat = v => {
  const s = S.settings, hasG = !!s.geminiKey || gemShared(), hasO = !!s.openaiKey, prov = currentProvider();
  if (!prov) {
    v.innerHTML = `<h2>Conversación con IA 💬</h2>
      <div class="card" style="text-align:center;padding:24px 16px">
        <div style="font-size:38px;margin-bottom:8px">🦜💬</div>
        <h3 style="margin:0 0 6px">Práctica de conversación con IA</h3>
        <p class="small muted" style="margin:0 auto 16px;max-width:320px">
          Habla en inglés con Tuki por voz en vivo (Gemini Live) o chat de texto. Inicia sesión para activar la IA gratis con el cupo diario de Tuki.
        </p>
        <button class="btn gbtn block" id="chatGoogle" style="margin-bottom:8px"><span class="g">G</span> Continuar con Google</button>
        <button class="btn ghost block sm" id="toSet">Opciones de inicio de sesión y claves</button>
      </div>
      <div class="card"><h3>Mientras tanto…</h3><p class="muted small">Prueba las <b>Conversaciones reales</b> guiadas (unidades 6, 7 y 12): dices tu parte del diálogo y recibes puntaje sin necesidad de IA.</p></div>`;
    const bg = $('#chatGoogle', v);
    if (bg) bg.onclick = async () => {
      bg.disabled = true;
      try { await fbGoogle(); render(); }
      catch (e) { toast(authErr(e)); }
      finally { if (document.body.contains(bg)) bg.disabled = false; }
    };
    $('#toSet', v).onclick = () => go('settings'); return;
  }
  if (CHAT.scen && String(CHAT.scen).startsWith('custom:') && !SCENARIOS[CHAT.scen]) CHAT.scen = 'free';
  const lv = chatLevel();
  v.innerHTML = `<div class="chatscreen" id="chatscreen">
    <div class="chattop">
      <div class="provider"><button class="chip ${prov === 'gemini' ? 'active' : ''}" data-prov="gemini" ${hasG ? '' : 'disabled title="Agrega una clave de Gemini en Ajustes"'}>✨ Gemini (gratis)</button><button class="chip ${prov === 'openai' ? 'active' : ''}" data-prov="openai" ${hasO ? '' : 'disabled title="Agrega una clave de OpenAI en Ajustes"'}>💳 OpenAI (pago)</button></div>
      <div class="chatsel"><select class="field" id="scen" aria-label="Escenario">${Object.keys(SCENARIOS).filter(k => k !== 'interview' && k !== 'shopping').map(k => `<option value="${k}" ${k === CHAT.scen ? 'selected' : ''}>${esc(SCEN_ES[k])}</option>`).join('')}<option value="__new__">✏️ Crear escenario…</option></select><select class="field sp" id="tspeed" aria-label="Velocidad de Tuki" title="Velocidad de Tuki">${Object.keys(TUTOR_SPEEDS).map(k => `<option value="${k}" ${k === tutorSpeed() ? 'selected' : ''}>${TUTOR_SPEEDS[k].label}</option>`).join('')}</select><button class="btn ghost sm" id="newc" title="Nueva conversación">Nueva</button></div>
      <div class="chatsel"><select class="field" id="level" aria-label="Nivel de inglés" title="Nivel de inglés de la conversación">${LEVEL_KEYS.map(k => `<option value="${k}" ${k === lv ? 'selected' : ''}>${LEVELS[k].label}</option>`).join('')}</select><select class="field" id="tlang" aria-label="Idioma del tutor" title="Idioma del tutor">${Object.keys(TUTOR_LANGS).map(k => `<option value="${k}" ${k === tutorLang() ? 'selected' : ''}>${TUTOR_LANGS[k].label}</option>`).join('')}</select></div>
    </div>
    <div class="chatlog" id="log" aria-live="polite"></div>
    <div class="chatbar"><button class="iconbtn" id="cmic" title="Dictar (modo alternativo)">🎤</button><textarea id="cin" placeholder="Escribe en inglés (o usa 🎤)…" rows="1" aria-label="Mensaje"></textarea><button class="iconbtn" id="csend" title="Enviar">➤</button></div>
    <div class="livedock">
      <div class="livestat"><span class="live-dot ${LIVE.state}" id="ldot"></span><b id="lstate">${LIVE_LABEL[LIVE.state]}</b><span class="meter" aria-hidden="true"><i id="lmeter"></i></span></div>
      <button class="livebtn ${LIVE.on ? 'on' : ''}" id="liveBtn" title="Voz a voz en tiempo real con ${prov === 'gemini' ? 'Gemini Live' : 'OpenAI Realtime'}">${LIVE.on ? '⏹ Terminar conversación' : '🎙️ Hablar en vivo'}</button>
    </div>
  </div>`;
  $$('[data-prov]', v).forEach(b => b.onclick = () => { if (b.disabled) return; if (LIVE.on) stopLive(); S.settings.chatProvider = b.dataset.prov; save(); resetChat(); VIEWS.chat(v); });
  const startText = () => { resetChat(); chatDraw(); chatSend('(Start the roleplay now with a short friendly greeting and a first question.)', true); };
  const restart = msg => { toast(msg, 2600); if (LIVE.on) { stopLive(true); resetChat(); chatDraw(); startLive(); } else if (CHAT.hist.length) startText(); else chatDraw(); };
  // P4 (v2.21.0): crear/borrar escenarios propios dentro del selector
  // existente; sin pestaña ni tarjeta nueva, solo aparece al elegirlo.
  const openCustomScenario = () => {
    modal(`<h2>✏️ Crear escenario</h2><p class="muted small">Describe una situación para practicar (máx. 120 caracteres, máx. 5 guardados).</p><input class="field" id="csText" maxlength="120" placeholder="en el médico explicando síntomas" aria-label="Descripción del escenario"><div class="row" style="margin-top:10px"><button class="btn primary block" data-save>Guardar y usar</button><button class="btn ghost block" data-x>Cancelar</button></div><div id="csList" style="margin-top:12px"></div>`, (el, close) => {
      const drawList = () => {
        $('#csList', el).innerHTML = customScenarios().length ? customScenarios().map((t, i) => `<div class="row" style="justify-content:space-between;margin-top:6px"><span class="small">✏️ ${esc(t)}</span><button class="mini" data-del="${i}" aria-label="Borrar escenario">✕</button></div>`).join('') : '<p class="muted small" style="margin-top:6px">Aún no tienes escenarios propios.</p>';
        $$('[data-del]', el).forEach(b => b.onclick = () => { removeCustomScenario(+b.dataset.del); drawList(); VIEWS.chat(v); toast('Escenario borrado.'); });
      };
      drawList();
      $('[data-x]', el).onclick = close;
      $('[data-save]', el).onclick = () => {
        const r = addCustomScenario($('#csText', el).value);
        if (!r.ok) return toast(r.reason === 'full' ? 'Ya tienes 5 escenarios: borra uno para crear otro.' : r.reason === 'dup' ? 'Ese escenario ya lo tienes guardado.' : 'Escribe una situación para practicar (sin instrucciones ni etiquetas del formato).', 4000);
        close(); CHAT.scen = r.key; restart('✏️ Nuevo escenario: conversación reiniciada');
      };
      $('#csText', el).onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); $('[data-save]', el).click(); } };
    });
  };
  $('#scen').onchange = e => { if (e.target.value === '__new__') { e.target.value = CHAT.scen; openCustomScenario(); return; } CHAT.scen = e.target.value; restart(LIVE.on ? '🔄 Nuevo escenario: reconectando la voz en vivo…' : '🔄 Nuevo escenario: conversación reiniciada'); };
  $('#level').onchange = e => { S.settings.chatLevel = e.target.value; save(); const n = LEVELS[e.target.value].label; restart(LIVE.on ? `🎚️ Nivel ${n}: reconectando la voz en vivo…` : `🎚️ Nivel ${n}` + (CHAT.hist.length ? ': conversación reiniciada' : '')); };
  $('#tlang').onchange = e => { S.settings.tutorLang = e.target.value; save(); const n = TUTOR_LANGS[e.target.value].name; restart(LIVE.on ? `🗣️ Idioma del tutor: ${n}. Reconectando la voz en vivo…` : `🗣️ Idioma del tutor: ${n}` + (CHAT.hist.length ? '. Conversación reiniciada' : '')); };
  $('#tspeed').onchange = e => { S.settings.tutorSpeed = e.target.value; save(); const n = TUTOR_SPEEDS[e.target.value].name; if (LIVE.on) { toast(`🐢 Velocidad ${n}: reconectando la voz en vivo…`, 2600); stopLive(true); resetChat(); chatDraw(); startLive(); } else { toast(`🐢 Velocidad de Tuki: ${n}`); chatDraw(true); } };
  $('#newc').onclick = () => { if (LIVE.on) stopLive(); startText(); };
  $('#liveBtn').onclick = () => LIVE.on ? stopLive() : startLive();
  const cin = $('#cin'); $('#csend').onclick = () => { const t = cin.value.trim(); cin.value = ''; chatSend(t); };
  cin.onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#csend').click(); } };
  $('#cmic').onclick = () => chatMic($('#cmic'));
  chatDraw(); liveUI(); fitChat();
};
const _render = render; let _lastTab = null; render = function () { const v = $('#view'); v.classList.toggle('chatmode', TAB === 'chat'); _render(); if (TAB !== _lastTab) { _lastTab = TAB; v.classList.remove('view-enter'); void v.offsetWidth; v.classList.add('view-enter'); } if (TAB === 'chat') fitChat(); };

/* =================== AJUSTES =================== */
VIEWS.settings = v => {
  const s = S.settings, opt = (arr, cur, lab) => arr.map(a => { const [val, l] = Array.isArray(a) ? a : [a, a]; return `<option value="${esc(val)}" ${String(cur) === String(val) ? 'selected' : ''}>${esc(lab ? lab(l) : l)}</option>`; }).join('');
  const sw = (id, on, label, desc) => `<div class="set-row"><div><label for="${id}">${label}</label>${desc ? `<div class="desc">${desc}</div>` : ''}</div><label class="switch"><input type="checkbox" id="${id}" ${on ? 'checked' : ''}><span></span></label></div>`;
  const azStatus = azureReady() ? ' (activo)' : (fbSignedIn() ? ' (falta clave)' : ' (inicia sesión)');
  v.innerHTML = `<h2>Ajustes ⚙️</h2>
  <div class="card"><h3>🔊 Voz y audio</h3>
    <div class="set-row"><div><label for="ttsEngine">Voz del modelo</label><div class="desc">Las voces en la nube suenan más naturales (Azure gratis con tu cuenta).</div></div><select class="field" id="ttsEngine" style="max-width:200px">${opt([['auto', 'Automática' + (azureReady() ? ' (Azure neural)' : ' (Dispositivo)')], ['azure', 'Azure neural' + azStatus], ['device', 'Dispositivo (sin internet)'], ['openai', 'OpenAI TTS' + (s.openaiKey ? ' (activo)' : ' (falta clave)')]], s.ttsEngine || 'auto')}</select></div>
    <div class="set-row"><div><label for="accent">Acento preferido</label></div><select class="field" id="accent" style="max-width:200px">${opt([['en-US', 'Estadounidense (en-US)'], ['en-GB', 'Británico (en-GB)']], s.accent)}</select></div>
    <div class="set-row"><div><label for="voice">Voz del dispositivo</label><div class="desc">Automática elige la más natural disponible</div></div><select class="field" id="voice" style="max-width:200px"><option value="">Automática${pickVoice() ? ' (' + esc(pickVoice().name) + ')' : ''}</option>${VOICES.map(x => `<option ${x.name === s.voice ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></div>
    <div class="set-row"><div><label for="azureVoice">Voz Azure</label></div><select class="field" id="azureVoice" style="max-width:200px">${opt(AZ_VOICES, s.azureVoice)}</select></div>
    <div class="set-row"><div><label for="openaiVoice">Voz OpenAI</label><div class="desc">También se usa en la voz en vivo de OpenAI</div></div><select class="field" id="openaiVoice" style="max-width:200px">${opt(OA_VOICES, s.openaiVoice)}</select></div>
    <div class="set-row"><div><label for="rate">Velocidad</label><div class="desc" id="rateV">${(+s.rate).toFixed(2)}×</div></div><div class="row"><input type="range" id="rate" min="0.5" max="1.3" step="0.05" value="${s.rate}"><button class="spk" id="tRate" aria-label="Probar voz">🔊</button></div></div>
    ${sw('autoplay', s.autoplay, 'Reproducir audio automáticamente')}${sw('sound', s.sound, 'Sonidos de efectos')}${sw('haptics', s.haptics, 'Vibración (móvil)', 'Vibra al acertar o fallar')}
    ${sw('recordVoice', s.recordVoice, 'Grabar mi voz en ejercicios', 'Para escucharte y ver tu onda. En algunos Android puede interferir con el reconocimiento de Chrome.')}
  </div>
  <div class="card"><h3>🔬 Evaluación avanzada con Azure <span class="pill">${azShared() ? 'Activo con tu cuenta' : (azOwn() ? 'Con tu clave' : 'Opcional')}</span></h3>
    <p class="small muted">Puntaje <b>fonema por fonema</b> con Azure AI Speech.</p>
    <details class="small muted" style="margin:-4px 0 8px"><summary>¿Por qué?</summary>Con Azure AI Speech obtienes puntaje fonema por fonema con IPA, fluidez, integridad y prosodia, y consejos precisos de pronunciación. La clave se guarda solo en este dispositivo.</details>
    ${sw('livePronOptIn', s.livePronOptIn, 'Medir mi pronunciación en vivo', 'Solo en voz en vivo con Gemini. Tu voz se envía a Azure solo para medirla y se borra al cerrar.')}
    <details class="small muted" style="margin:-4px 0 8px"><summary>Qué se hace con tu audio</summary>Al terminar la sesión, Azure evalúa tus 2–3 turnos más largos con tu propia transcripción como referencia. El audio queda solo en este dispositivo durante la sesión y se borra al cerrar; a Azure solo llega el fragmento evaluado, como en las lecciones. Mide consistencia fonémica y fonemas débiles, no es una nota absoluta. Sin Azure o sin este permiso, la sesión sigue igual que hoy.</details>
    ${azShared() ? '<p class="small" style="color:var(--g-d);font-weight:700">✅ Activo con tu cuenta de Tuki: evaluación fonema por fonema gratis con cupo diario.</p>' : ''}
    ${!azureReady() && !fbSignedIn() ? '<div class="notice small" style="margin-bottom:10px">💡 <b>Usa la evaluación gratis:</b> Si inicias sesión con Google abajo en <b>Cuenta</b>, Tuki activará la evaluación por fonemas gratis sin que tengas que crear claves.</div>' : ''}
    <input class="field" id="azKey" type="password" placeholder="Clave propia de Azure Speech (opcional)" value="${esc(s.azureKey)}" autocomplete="off" aria-label="Clave de Azure">
    <input class="field" id="azRegion" placeholder="Región (ej. eastus, westeurope, brazilsouth)" value="${esc(s.azureRegion)}" style="margin-top:8px" aria-label="Región de Azure" list="azRegions"><datalist id="azRegions">${['eastus', 'eastus2', 'westus', 'westus2', 'centralus', 'southcentralus', 'brazilsouth', 'canadacentral', 'westeurope', 'northeurope', 'uksouth', 'francecentral', 'southeastasia', 'japaneast', 'australiaeast', 'centralindia'].map(r => `<option value="${r}">`).join('')}</datalist>
    <div class="row wrap" style="margin-top:10px"><button class="btn primary sm" id="azSave">Guardar</button><button class="btn ghost sm" id="azTest">Probar conexión</button><button class="btn ghost sm" id="azDel">Borrar</button></div><div id="azMsg" class="small" style="margin-top:8px">${azShared() ? '✅ Usando la cuenta de Tuki (límite diario).' : (azOwn() ? '✅ Azure activo: los ejercicios de voz usan evaluación por fonemas.' : '')}</div>
  </div>
  <div class="card"><h3>🤖 Conversación con IA <span class="pill">${gemShared() ? 'Activo con tu cuenta' : (s.geminiKey || s.openaiKey ? 'Con tu clave' : 'Opcional')}</span></h3>
    <p class="small" id="aiMode">${esc(aiModeText())}</p>
    <p class="small muted" id="aiQuota">${esc(aiQuotaText())}</p>
    ${!fbSignedIn() && !s.geminiKey && !s.openaiKey ? `<div class="tvhint" style="background:var(--card-hover, rgba(0,0,0,0.03));padding:12px;border-radius:12px;border:1px solid var(--border, rgba(0,0,0,0.08));margin-bottom:12px">
      <div style="font-weight:700;margin-bottom:4px">✨ Usa la IA gratis sin configurar claves</div>
      <div class="small muted" style="margin-bottom:8px">Inicia sesión con Google para tener acceso a Gemini y Gemini Live gratis con el cupo diario de Tuki.</div>
      <button class="linkbtn" id="aiGoAcct">Usar la IA gratis →</button>
    </div>` : ''}
    <div class="set-row"><div><label for="chatProvider">Proveedor</label></div><select class="field" id="chatProvider" style="max-width:200px">${opt([['gemini', 'Gemini (gratis)'], ['openai', 'OpenAI (pago)']], s.chatProvider)}</select></div>
    <div class="set-row"><div><label for="chatLevel">Nivel de la conversación</label><div class="desc">Ajusta vocabulario, velocidad y correcciones del tutor</div></div><select class="field" id="chatLevel" style="max-width:200px">${opt(LEVEL_KEYS.map(k => [k, LEVELS[k].label]), chatLevel())}</select></div>
    <div class="set-row"><div><label for="tutorSpeed">Velocidad de Tuki</label><div class="desc">Frases más cortas, pausas y voz más lenta</div></div><select class="field" id="tutorSpeed" style="max-width:200px">${opt(Object.keys(TUTOR_SPEEDS).map(k => [k, TUTOR_SPEEDS[k].label]), tutorSpeed())}</select></div>
    <div class="set-row"><div><label for="tutorLang">Idioma del tutor</label><div class="desc">Bilingüe: conversa en inglés y te explica las correcciones en español</div></div><select class="field" id="tutorLang" style="max-width:200px">${opt(Object.keys(TUTOR_LANGS).map(k => [k, TUTOR_LANGS[k].label]), tutorLang())}</select></div>
    <h3 style="margin-top:10px;font-size:16px">✨ Google Gemini (gratis con límites)</h3>
    <p class="small muted">Clave gratuita en <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey</a>. Se usa para el chat y para la <b>voz en vivo (Gemini Live)</b>.</p>
    <input class="field" id="gkey" type="password" placeholder="AIza…" value="${esc(s.geminiKey)}" autocomplete="off" aria-label="Clave de Gemini">
    <div class="row" style="margin-top:8px"><input class="field" id="gmodel" placeholder="Modelo de chat" value="${esc(s.model)}" list="gmodels" aria-label="Modelo de chat Gemini"><datalist id="gmodels"><option value="gemini-2.5-flash"><option value="gemini-2.5-flash-lite"><option value="gemini-flash-latest"></datalist></div>
    <div class="row" style="margin-top:8px"><input class="field" id="lmodel" placeholder="Modelo de voz en vivo" value="${esc(s.liveModel)}" list="lmodels" aria-label="Modelo Gemini Live"><datalist id="lmodels">${[...GEMINI_LIVE_MODELS, ...(S.liveModels || [])].filter((x, i, a) => a.indexOf(x) === i).map(m => `<option value="${esc(m)}">`).join('')}</datalist><select class="field" id="lvoice" style="max-width:120px" aria-label="Voz Gemini Live">${opt(GEM_VOICES, s.liveVoice)}</select></div>
    <div class="row wrap" style="margin-top:10px"><button class="btn primary sm" id="gsave">Guardar</button><button class="btn ghost sm" id="gdetect">Detectar modelos</button><button class="btn ghost sm" id="gdel">Borrar clave</button></div><div id="gmsg" class="small" style="margin-top:8px"></div>
    <h3 style="margin-top:14px;font-size:16px">💳 OpenAI (pago)</h3>
    <p class="small muted">Tu clave de <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener">platform.openai.com</a>. Se usa directamente desde este dispositivo.</p>
    <details class="small muted" style="margin:-4px 0 8px"><summary>¿Por qué?</summary>⚠️ Sin servidor propio, la clave se usa directamente desde este dispositivo (para la voz en vivo se genera una clave temporal con ella). Úsala solo en tu propio teléfono o computador, con límite de gasto configurado en OpenAI.</details>
    <input class="field" id="okey" type="password" placeholder="sk-…" value="${esc(s.openaiKey)}" autocomplete="off" aria-label="Clave de OpenAI">
    <div class="row" style="margin-top:8px"><input class="field" id="omodel" value="${esc(s.openaiModel)}" list="omodels" aria-label="Modelo de chat OpenAI"><datalist id="omodels"><option value="gpt-4o-mini"><option value="gpt-4.1-mini"><option value="gpt-4.1-nano"><option value="gpt-4o"></datalist><input class="field" id="rtmodel" value="${esc(s.realtimeModel)}" list="rtmodels" aria-label="Modelo Realtime"><datalist id="rtmodels"><option value="gpt-realtime"><option value="gpt-realtime-mini"></datalist></div>
    <div class="row wrap" style="margin-top:10px"><button class="btn primary sm" id="osave">Guardar</button><button class="btn ghost sm" id="otest">Probar conexión</button><button class="btn ghost sm" id="odel">Borrar clave</button></div><div id="omsg" class="small" style="margin-top:8px"></div>
    ${S.chatProfile ? `<div class="set-row"><div><label>Nota de perfil del chat</label><div class="desc">Tuki recuerda tus errores frecuentes de conversaciones largas.</div></div><button class="btn ghost sm" id="chatProfileDel">Borrar nota</button></div>` : ''}
  </div>
  <div class="card"><h3>🎯 Aprendizaje</h3>
    <div class="set-row"><div><label for="learnerLevel">Nivel de aprendizaje</label><div class="desc">Ajusta guía fonética, frases y velocidad</div></div><select class="field" id="learnerLevel" style="max-width:200px">${opt([['novice', '🌱 Novato (Desde cero)'], ['intermediate', '⚡ Intermedio'], ['advanced', '🚀 Avanzado']], s.learnerLevel || 'novice')}</select></div>
    <div class="set-row"><div><label for="goal">Meta diaria</label></div><select class="field" id="goal" style="max-width:200px">${opt([[10, 'Relajada · 10 XP'], [20, 'Normal · 20 XP'], [30, 'Seria · 30 XP'], [50, 'Intensa · 50 XP']], s.goal)}</select></div>
    <div class="set-row"><div><label for="threshold">Exigencia de pronunciación</label><div class="desc">Puntaje mínimo para aprobar un ejercicio de voz</div></div><select class="field" id="threshold" style="max-width:200px">${opt([[60, 'Suave · 60%'], [75, 'Normal · 75%'], [85, 'Estricta · 85%']], s.threshold)}</select></div>
    ${sw('freeMode', s.freeMode, 'Modo libre (desbloquear todo)', 'Desactiva el orden secuencial tipo Duolingo y desbloquea todas las lecciones y prácticas')}
    <div class="set-row"><div><label>Prueba de nivel</label><div class="desc">${S.placement && typeof S.placement === 'object' ? 'Última: ' + S.placement.date + ' · ' + S.placement.score : 'Aún no la has hecho'}</div></div><button class="btn ghost sm" id="replace">Hacer ahora</button></div>
    <div class="set-row"><div><label>Reconocimiento de voz</label><div class="desc">${azureReady() ? 'Azure (fonemas) ✅' : HAS_SR ? 'Navegador (por palabras) ✅' : 'No disponible ❌ — usa Chrome/Edge o configura Azure'}</div></div><button class="btn ghost sm" id="testMic" ${canSpeak() ? '' : 'disabled'}>Probar 🎤</button></div>
  </div>
  <div class="card"><h3>⏰ Recordatorio diario</h3>
    ${sw('remindOn', s.remindOn, 'Notificación local y push', 'Aviso diario interactivo para no perder tu racha')}
    <div class="set-row"><div><label for="remindTime">Hora</label></div><input type="time" class="field" id="remindTime" value="${esc(s.remindTime)}" style="max-width:140px"></div>
    <div class="row" style="margin-top:8px;gap:8px">
      <button class="btn blue sm" id="btnTestNotify">🔔 Probar notificación</button>
      <button class="btn ghost sm" id="ics">📅 Calendario (.ics)</button>
    </div>
  </div>
  <div class="card"><h3>🎨 Apariencia y accesibilidad</h3>
    <div class="set-row"><div><label for="theme">Tema</label></div><select class="field" id="theme" style="max-width:200px">${opt([['auto', 'Automático'], ['light', 'Claro'], ['dark', 'Oscuro']], s.theme)}</select></div>
    <div class="set-row"><div><label for="fontScale">Tamaño de letra</label></div><select class="field" id="fontScale" style="max-width:200px">${opt([[0.9, 'Pequeño'], [1, 'Normal'], [1.15, 'Grande'], [1.3, 'Muy grande']], s.fontScale)}</select></div>
    ${sw('contrast', s.contrast, 'Alto contraste')}${sw('reduceMotion', s.reduceMotion, 'Reducir animaciones')}
  </div>
  <div class="card"><h3>💾 Datos</h3>
    <div class="row wrap"><button class="btn ghost sm" id="exp">⬇️ Exportar progreso</button><label class="btn ghost sm" style="margin:0">⬆️ Importar<input type="file" id="imp" accept="application/json" hidden></label></div>
    <p class="small muted">Las claves nunca se incluyen en la exportación.</p>
    <button class="btn red block" id="reset" style="margin-top:8px">Borrar todo mi progreso</button>
  </div>
  <p class="muted small" style="text-align:center">Tuki Speak v${APP_VERSION} · sin servidor · tus datos quedan en este dispositivo.</p>`;
  const set = (k, val) => { S.settings[k] = val; save(); };
  const bindSel = (id, k, num) => { const e = $('#' + id); if (e) e.onchange = ev => { if (k === 'ttsEngine') S.settings.__ttsDeviceExplicit = (ev.target.value === 'device'); set(k, num ? +ev.target.value : ev.target.value); if (['theme', 'fontScale'].includes(k)) applyPrefs(); if (['ttsEngine', 'azureVoice', 'openaiVoice', 'accent', 'voice'].includes(k)) { TTS.warned = false; speak('Hello! Think, three, very, ship, sheep.'); } }; };
  [['ttsEngine', 'ttsEngine'], ['accent', 'accent'], ['voice', 'voice'], ['azureVoice', 'azureVoice'], ['openaiVoice', 'openaiVoice'], ['goal', 'goal', 1], ['threshold', 'threshold', 1], ['learnerLevel', 'learnerLevel'], ['theme', 'theme'], ['fontScale', 'fontScale', 1], ['chatProvider', 'chatProvider'], ['lvoice', 'liveVoice'], ['chatLevel', 'chatLevel'], ['tutorLang', 'tutorLang'], ['tutorSpeed', 'tutorSpeed']].forEach(a => bindSel(...a));
  ['autoplay', 'sound', 'haptics', 'recordVoice', 'freeMode', 'contrast', 'reduceMotion', 'livePronOptIn'].forEach(k => $('#' + k).onchange = e => { set(k, e.target.checked); applyPrefs(); });
  $('#rate').oninput = e => { set('rate', +e.target.value); $('#rateV').textContent = (+e.target.value).toFixed(2) + '×'; };
  $('#tRate').onclick = () => speak('Hello! This is how fast I speak. Think, three, very, ship, sheep.');
  $('#replace').onclick = placementIntro;
  $('#testMic').onclick = () => doMic($('#testMic'), (alts, url, az) => { toast(az ? `Azure: «${az.heard}» · ${az.pct}%` : 'Escuché: «' + alts[0].t + '» (' + Math.round((alts[0].c || 0) * 100) + '%)', 4000); $('#testMic').innerHTML = 'Probar 🎤'; }, azureReady() ? 'Hello, how are you?' : undefined);
  // Azure
  const azMsg = $('#azMsg');
  $('#azSave').onclick = () => { set('azureKey', $('#azKey').value.trim()); set('azureRegion', $('#azRegion').value.trim().toLowerCase()); window.__azOff = false; azMsg.textContent = azureReady() ? '✅ Guardado. Toca "Probar conexión".' : 'Faltan clave o región: Azure queda desactivado.'; };
  $('#azDel').onclick = () => { set('azureKey', ''); $('#azKey').value = ''; if (s.ttsEngine === 'azure') set('ttsEngine', 'device'); azMsg.textContent = 'Clave de Azure borrada.'; };
  $('#azTest').onclick = async () => {
    const key = $('#azKey').value.trim(), reg = $('#azRegion').value.trim().toLowerCase(); if (!key || !reg) { azMsg.textContent = 'Escribe la clave y la región.'; return; }
    azMsg.textContent = 'Probando…';
    try { const r = await fetch(`https://${encodeURIComponent(reg)}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, { method: 'POST', headers: { 'Ocp-Apim-Subscription-Key': key, 'Content-Type': 'application/x-www-form-urlencoded' } }); if (!r.ok) throw await httpErr(r); set('azureKey', key); set('azureRegion', reg); window.__azOff = false; azMsg.textContent = '✅ Conexión correcta con Azure (' + reg + '). La evaluación por fonemas está activa.'; }
    catch (e) { azMsg.textContent = '❌ ' + errES(e, 'Azure') + (e.status === 401 ? ' Verifica que la región coincida con la de tu recurso.' : ''); }
  };
  // Gemini
  // (densidad PR B, v2.31.0, ítem 3: el único "Continuar con Google" de
  // Ajustes vive en la tarjeta 👤 Cuenta; aquí solo un enlace que
  // desplaza hasta ella.)
  const aiG = $('#aiGoAcct', v);
  if (aiG) aiG.onclick = () => { const c = $('#acctCard', v); if (c && c.scrollIntoView) c.scrollIntoView({ block: 'start', behavior: 'smooth' }); };
  const gmsg = $('#gmsg');
  $('#gsave').onclick = () => { set('geminiKey', $('#gkey').value.trim()); set('model', $('#gmodel').value.trim() || 'gemini-2.5-flash'); set('liveModel', $('#lmodel').value.trim() || GEMINI_LIVE_MODELS[0]); CHAT.hist = []; gmsg.textContent = S.settings.geminiKey ? '✅ Guardado. Ve a la pestaña IA.' : 'Clave vacía: Gemini queda desactivado.'; };
  $('#gdel').onclick = () => { set('geminiKey', ''); $('#gkey').value = ''; gmsg.textContent = 'Clave borrada.'; };
  $('#gdetect').onclick = async () => {
    const key = $('#gkey').value.trim(); if (!key) { gmsg.textContent = 'Primero pega tu clave.'; return; }
    gmsg.textContent = 'Consultando modelos…';
    try {
      const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200', { headers: { 'x-goog-api-key': key } }); if (!r.ok) throw await httpErr(r);
      const d = await r.json(), all = d.models || [];
      const chat = all.filter(m => (m.supportedGenerationMethods || []).includes('generateContent')).map(m => m.name.replace('models/', '')).filter(n => /flash/.test(n) && !/image|tts|audio|live|embedding/.test(n));
      const live = all.filter(m => (m.supportedGenerationMethods || []).includes('bidiGenerateContent')).map(m => m.name.replace('models/', ''));
      S.liveModels = live.filter(n => /live|native-audio/.test(n)); if (!S.liveModels.length) S.liveModels = live; save();
      $('#gmodels').innerHTML = chat.map(m => `<option value="${esc(m)}">`).join(''); $('#lmodels').innerHTML = S.liveModels.map(m => `<option value="${esc(m)}">`).join('');
      gmsg.innerHTML = '✅ Clave válida.<br>Chat: ' + (chat.slice(0, 8).map(esc).join(', ') || '—') + '<br>Voz en vivo: ' + (S.liveModels.slice(0, 6).map(esc).join(', ') || '— (tu clave no lista modelos Live)');
    } catch (e) { gmsg.textContent = '❌ ' + errES(e, 'Gemini'); }
  };
  // OpenAI
  const omsg = $('#omsg');
  $('#osave').onclick = () => { set('openaiKey', $('#okey').value.trim()); set('openaiModel', $('#omodel').value.trim() || 'gpt-4o-mini'); set('realtimeModel', $('#rtmodel').value.trim() || 'gpt-realtime'); omsg.textContent = S.settings.openaiKey ? '✅ Guardado.' : 'Clave vacía: OpenAI queda desactivado.'; };
  $('#odel').onclick = () => { set('openaiKey', ''); $('#okey').value = ''; if (s.ttsEngine === 'openai') set('ttsEngine', 'device'); if (s.chatProvider === 'openai') set('chatProvider', 'gemini'); omsg.textContent = 'Clave borrada.'; };
  $('#otest').onclick = async () => { const key = $('#okey').value.trim(); if (!key) { omsg.textContent = 'Pega tu clave primero.'; return; } omsg.textContent = 'Probando…'; try { const r = await fetch('https://api.openai.com/v1/models', { headers: { Authorization: 'Bearer ' + key } }); if (!r.ok) throw await httpErr(r); set('openaiKey', key); omsg.textContent = '✅ Conexión correcta con OpenAI.'; } catch (e) { omsg.textContent = '❌ ' + errES(e, 'OpenAI'); } };
  // (P10: borrar la nota de perfil del chat; la línea solo existe cuando hay nota)
  const cpDel = $('#chatProfileDel');
  if (cpDel) cpDel.onclick = () => { clearChatProfile(); render(); toast('Nota de perfil borrada.'); };
  // recordatorios
  $('#remindOn').onchange = async e => {
    if (e.target.checked) {
      if (!('Notification' in window)) { toast('Tu navegador no soporta notificaciones.'); e.target.checked = false; return; }
      const p = await Notification.requestPermission(); if (p !== 'granted') { toast('Permiso de notificaciones denegado.'); e.target.checked = false; set('remindOn', false); return; }
      set('remindOn', true); toast('⏰ Recordatorio activado a las ' + S.settings.remindTime);
    } else set('remindOn', false);
  };
  $('#remindTime').onchange = e => set('remindTime', e.target.value || '19:00');
  $('#ics').onclick = downloadICS;
  const bTestNotif = $('#btnTestNotify');
  if (bTestNotif) bTestNotif.onclick = async () => {
    if (!('Notification' in window)) return toast('Tu navegador no soporta notificaciones.');
    const p = await Notification.requestPermission();
    if (p !== 'granted') return toast('Permiso de notificaciones denegado.');
    sendTukiNotification(
      '🦜 ¡Profe Tuki cuida tu racha!',
      `¡Hola! Así te avisará Tuki para que no pierdas tu racha de ${streakNow()} días 🔥. Toca para practicar 5 min.`,
      'tuki-test'
    );
    toast('🔔 ¡Notificación de prueba enviada! Revisa tu barra de notificaciones.', 3500);
  };
  // datos
  $('#exp').onclick = () => { const a = document.createElement('a'); const s2 = { ...S, settings: { ...S.settings, geminiKey: '', openaiKey: '', azureKey: '' } }; a.href = URL.createObjectURL(new Blob([JSON.stringify(s2, null, 1)], { type: 'application/json' })); a.download = 'tuki-speak-progreso-' + dayKey() + '.json'; a.click(); };
  $('#imp').onchange = e => { const f = e.target.files[0]; if (!f) return; f.text().then(t => { const d = JSON.parse(t); if (!d || !(d.v === 1 || d.v === 2) || !d.settings) throw new Error('Archivo no válido'); const keys = { geminiKey: S.settings.geminiKey, openaiKey: S.settings.openaiKey, azureKey: S.settings.azureKey }; localStorage.setItem(KEY, JSON.stringify({ ...d, settings: { ...d.settings, ...keys } })); load(); save(); toast('Progreso importado ✅'); applyPrefs(); render(); }).catch(err => toast('Error: ' + err.message)); };
  $('#reset').onclick = () => confirmBox('¿Borrar todo tu progreso?', 'Se eliminarán XP, racha, lecciones, puntajes, insignias y tarjetas. Tus ajustes y claves se conservan. Esta acción no se puede deshacer.', 'Sí, borrar todo', () => { const keep = S.settings; setState(freshState()); S.settings = keep; S.placement = 'skipped'; save(); CHAT.hist = []; toast('Progreso borrado.'); go('learn'); }, true);
};

/* =================== RECORDATORIOS =================== */
// (Fase 3, modulo 7: movido a src/ui.js, lineas 2324-2372)
window.addEventListener('online', () => { netBanner(); toast('De nuevo en línea ✅'); });
window.addEventListener('offline', netBanner);
// (Fase 3, modulo 7: movido a src/ui.js, lineas 2375-2430)

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initServiceWorker();
} else {
  window.addEventListener('load', initServiceWorker);
}


/* =================== v2.4: DATOS NUEVOS (migración sin pérdida) =================== */
function ensure24() {
  S.summaries = Array.isArray(S.summaries) ? S.summaries : [];
  S.interviews = Array.isArray(S.interviews) ? S.interviews : [];
  S.challenges = S.challenges && typeof S.challenges === 'object' ? S.challenges : {};
  S.hard = S.hard && typeof S.hard === 'object' ? S.hard : {};
  S.convoItems = Array.isArray(S.convoItems) ? S.convoItems : [];
  if (!S.mt) S.mt = Date.now();
  if (S.settings.autoSummary === undefined) S.settings.autoSummary = true;
}
ensure24();
const _render24 = render; render = function () { ensure24(); _render24(); };
const _fresh24 = freshState; freshState = function () { return { ..._fresh24(), summaries: [], interviews: [], challenges: {}, hard: {}, convoItems: [] }; };

/* =================== 1) RESUMEN DE CONVERSACIÓN =================== */
const _go24 = go; go = function (tab) { const leaving = TAB === 'chat' && tab !== 'chat'; if (leaving && !LIVE.on) endConversation('leave'); _go24(tab); };
const _buildPlan24 = buildPlan;
buildPlan = function () { const base = _buildPlan24(), extra = [...convoPracticeItems(2), ...hardDrillItems(2)]; return [...extra, ...base].slice(0, 10); };

/* =================== 2) MIS PALABRAS DIFÍCILES =================== */
const _practice24 = VIEWS.practice;
VIEWS.practice = v => {
  _practice24(v);
  const hw = hardWords(), ci = S.convoItems.filter(c => Date.now() - c.ts < 14 * DAY);
  // (densidad PR A, v2.30.0: las entradas de errores de Práctica —
  // "Mis palabras difíciles" (con su <details>), "De tus conversaciones"
  // y "Practica mis errores" — se agrupan en UNA tarjeta "🎯 Tus errores"
  // con 2 acciones. El botón "Entrenar mis 5 puntos débiles" de Progreso
  // queda donde está: sacarlo de Progreso cambiaría esa vista. Sin cambios
  // de lógica: la acción estática es el mismo fallback de
  // startPracticeErrors (buildTopErrorsPractice) y la acción con IA llama
  // a startPracticeErrors tal cual, solo visible con datos y proveedor.)
  const peData = practiceErrorsHasData(), peAI = practiceErrorsAIAvailable();
  const h2 = $('h2', v).nextElementSibling;
  h2.insertAdjacentHTML('afterend', `<div class="card" id="errorsCard">
    <h3 style="margin:0">🎯 Tus errores${hw.length ? ` (${hw.length})` : ''}</h3>
    <div class="muted small" style="margin-top:4px">${hw.length ? `${hw.slice(0, 5).map(h => esc(h.w)).join(', ')}${hw.length > 5 ? '…' : ''} · ${azureReady() ? 'puntaje por fonemas con Azure' : 'puntaje con el reconocimiento del navegador'}` : 'Aquí aparecerán las palabras que pronuncies mal en lecciones y conversaciones.'}</div>
    ${hw.length ? `<details class="hardlist" style="border-top:1px solid var(--line);margin-top:10px;padding-top:6px"><summary><b>Ver mis palabras difíciles</b></summary>${hw.slice(0, 30).map(h => `<div class="witem"><button class="spk" data-say="${esc(h.w)}">🔊</button><div style="min-width:0"><div class="en">${esc(h.w)}</div><div class="es small">${h.last == null ? 'Sin practicar' : 'Último: ' + h.last + '%'}${h.src === 'convo' || h.src === 'both' ? ' · 💬 de una conversación' : ''}${h.note ? ' · ' + esc(h.note) : ''}</div></div><button class="spk slow" data-unhard="${esc(h.key)}" title="Quitar">✕</button></div>`).join('')}</details>` : ''}
    ${ci.length ? `<button class="btn ghost sm block" id="errorsConvoBtn" style="margin-top:10px">🗂️ De tus conversaciones (${ci.length})</button><div class="muted small">Correcciones y palabras nuevas de tus resúmenes.</div>` : ''}
    <div class="row wrap" style="margin-top:10px;gap:8px">
      <button class="btn primary" id="errorsReviewBtn">Repasar mis errores</button>
      ${peData && peAI ? '<button class="btn orange" id="errorsAIBtn">✨ Practicar con IA</button>' : ''}
    </div>
    ${peData && !peAI ? '<div class="muted small" style="margin-top:6px">Ejercicios nuevos con tus errores (la IA no está disponible ahora).</div>' : ''}
  </div>`);
  $('#errorsReviewBtn').onclick = () => { const q = buildTopErrorsPractice(); if (q.length) startLesson(null, 'practice', q, '🎯 Refuerzo: Top 5 Errores'); else toast('No hay errores críticos registrados.'); };
  const ab = $('#errorsAIBtn'); if (ab) ab.onclick = () => startPracticeErrors();
  const cb = $('#errorsConvoBtn'); if (cb) cb.onclick = () => startLesson(null, 'practice', convoPracticeItems(8), 'De tus conversaciones');
  $$('[data-unhard]', v).forEach(b => b.onclick = () => { const k = b.dataset.unhard; if (S.wd[k]) S.wd[k].last = 100; Object.keys(S.hard).forEach(w => { if (normText(w).join(' ') === k) delete S.hard[w]; }); save(); VIEWS.practice(v); });
};


/* =================== 3) SIMULADOR DE ENTREVISTA · 4) RETO DIARIO =================== */
BADGES.push(
  { id: 'ch1', i: '⏱️', t: 'Primer reto', d: 'Completa un reto diario de 5 minutos', c: () => Object.keys(S.challenges).length >= 1 },
  { id: 'ch7', i: '🔥', t: 'Retador', d: 'Completa 7 retos diarios', c: () => Object.keys(S.challenges).length >= 7 },
  { id: 'ch30', i: '🏆', t: 'Maestro del reto', d: 'Completa 30 retos diarios', c: () => Object.keys(S.challenges).length >= 30 },
  { id: 'iv1', i: '🧑‍💼', t: 'Entrevistado', d: 'Termina una entrevista simulada', c: () => S.interviews.length >= 1 }
);
const _chatView24 = VIEWS.chat;
VIEWS.chat = v => {
  if ((CHAT.scen === '__iv' && !CHAT.iv) || (CHAT.scen === '__ch' && !CHAT.ch)) CHAT.scen = 'free';
  _chatView24(v);
  const scen = $('#scen', v); if (!scen) return;
  const top = $('.chattop', v);
  if (CHAT.scen === '__iv') top.insertAdjacentHTML('afterbegin', `<div class="modebar iv"><span>🧑‍💼 <b>${esc(CHAT.iv.role)}</b> · <span id="ivK">Pregunta ${ivQuestion()}/${CHAT.iv.n}</span></span><button class="mini" id="modeEnd">Finalizar</button></div>`);
  if (CHAT.scen === '__ch') top.insertAdjacentHTML('afterbegin', `<div class="modebar ch"><span>⏱️ <b id="chClock">${Math.floor(chLeft() / 60)}:${String(chLeft() % 60).padStart(2, '0')}</b> · <span class="small">${esc(CHAT.ch.topic.en)}</span></span><button class="mini" id="modeEnd">Terminar</button></div>`);
  if (CHAT.scen === '__iv' || CHAT.scen === '__ch') { top.classList.add('inmode'); const me = $('#modeEnd', v); me.onclick = () => { if (LIVE.on) stopLive(); else endConversation('end'); }; }
  const origScen = scen.onchange;
  scen.onchange = e => {
    const val = e.target.value;
    if (val === '__iv' || val === '__ch') { e.target.value = CHAT.scen; return val === '__iv' ? interviewSetup() : challengeSetup(); }
    if (CHAT.scen === '__iv' || CHAT.scen === '__ch') { if (LIVE.on) stopLive(true); clearInterval(CHAT.timer); CHAT.iv = CHAT.ch = null; CHAT.scen = val; resetChat(); return render(); }
    if (!LIVE.on) endConversation('scen');
    origScen(e);
  };
  $('#newc', v).onclick = () => {
    if (CHAT.scen === '__iv' || CHAT.scen === '__ch') { if (LIVE.on) stopLive(); else endConversation('new'); return; }
    if (LIVE.on) stopLive(); else endConversation('new');
    resetChat(); chatDraw(); chatSend('(Start the roleplay now with a short friendly greeting and a first question.)', true);
  };
  fitChat();
};

/* Aprender: tarjeta de la entrevista (densidad PR C, v2.32.0, ítem 7:
   la tarjeta "Reto diario" del dúo se quita — el reto ya está en
   "Retos de Hoy" (bloque 2) — y queda solo la entrevista.) */
const _learn24 = VIEWS.learn;
VIEWS.learn = v => {
  _learn24(v);
  const html = `<div class="duo2">
    <button class="card mcard iv" id="ivCard"><div class="mc-ic">🧑‍💼</div><div><b>Entrevista de trabajo</b><div class="small muted">Simulador con informe</div><div class="small">${S.interviews.length ? 'Última: ' + S.interviews[0].data.overall + '/100' : '5, 8 o 12 preguntas'}</div></div></button></div>`;
  const anchor = $('.plan-card', v) || $('.card.goal', v);
  if (anchor) anchor.insertAdjacentHTML('afterend', html); else v.insertAdjacentHTML('afterbegin', html);
  $('#ivCard', v).onclick = interviewSetup;
};
/* Progreso: historial */
function historyHTML() {
  const items = [...S.summaries.map(s => ({ ts: s.ts, k: 's', id: s.id, ic: s.mode === 'challenge' ? '⏱️' : '📝', t: s.title, sc: Math.round((s.data.scores.fluency + s.data.scores.grammar + s.data.scores.vocabulary) / 3), d: s.date })), ...S.interviews.map(r => ({ ts: r.ts, k: 'i', id: r.id, ic: '🧑‍💼', t: 'Entrevista: ' + r.role, sc: r.data.overall, d: r.date }))].sort((a, b) => b.ts - a.ts);
  // (P9: la revisión semanal vive DENTRO de esta tarjeta — reglas de
  // densidad R3/R6, sin tarjeta ni sección nueva. Solo aparece con
  // datos: con la revisión de esta semana guardada se muestra; si no,
  // solo el botón cuando hay ≥2 resúmenes en la semana y hay proveedor;
  // si no, nada — ni botón ni estado vacío.)
  const wk = weeklyReviewData(), wkCache = weeklyReviewCacheGet();
  let wkBlock = '';
  if (wkCache && wkCache.week === wk.week && wkCache.review) {
    const r = wkCache.review;
    wkBlock = `<div class="wkrev"><h4 style="margin:10px 0 4px">📅 Tu semana con Tuki</h4><p class="small" style="margin:0 0 6px">${esc(r.progress_es)}</p><div class="small"><b>Para la próxima semana:</b><ol style="margin:4px 0 6px;padding-left:18px">${r.focuses.map(f => `<li>${esc(f)}</li>`).join('')}</ol></div><div class="small"><b>Frase para practicar:</b> ${esc(r.practice.en)} <button class="mini" data-wkrev-say="${esc(r.practice.en)}" aria-label="Escuchar">🔊</button><div class="muted">${esc(r.practice.es)}</div></div><div class="small muted">La IA puede equivocarse.</div></div>`;
  } else if (weeklyReviewEligible(wk) && weeklyReviewAvailable()) {
    wkBlock = `<button class="btn ghost block" data-wkrev type="button">✨ Ver mi semana con Tuki</button><div class="small muted" style="text-align:center">Tu progreso narrado, 3 focos y 1 frase para practicar.</div>`;
  }
  return `<div class="card" id="histCard"><h3>🗂️ Historial de conversaciones</h3><div class="small muted">Retos completados: <b>${Object.keys(S.challenges).length}</b> · Entrevistas: <b>${S.interviews.length}</b> · Resúmenes: <b>${S.summaries.length}</b></div>
    ${wkBlock}
    ${(S.sumPending || []).map(p => `<button class="hitem pend" data-hp="${p.id}"><span>⏳</span><span class="ht"><b>Resumen pendiente — ${esc(p.title)}</b><span class="small muted">${esc(p.date)} · la IA estaba ocupada</span></span><span class="pill gen">Generar</span></button>`).join('')}
    ${items.length ? items.slice(0, 20).map(x => `<button class="hitem" data-h="${x.k}:${x.id}"><span>${x.ic}</span><span class="ht"><b>${esc(x.t)}</b><span class="small muted">${esc(x.d)}</span></span><span class="pill">${x.sc}</span></button>`).join('') : (S.sumPending || []).length ? '' : '<p class="small muted">Cuando termines una conversación con la IA, aquí verás su resumen.</p>'}</div>`;
}
const _progress24 = VIEWS.progress;
VIEWS.progress = v => {
  _progress24(v);
  const cards = $$('.card', v); const anchor = cards[1] || cards[0];
  if (anchor) anchor.insertAdjacentHTML('afterend', historyHTML()); else v.insertAdjacentHTML('beforeend', historyHTML());
  const wkBtn = $('[data-wkrev]', v);
  if (wkBtn) wkBtn.onclick = async () => {
    wkBtn.disabled = true; wkBtn.textContent = '⏳ Tuki está repasando tu semana…';
    try { await generateWeeklyReview(); } catch (e) {}
    if (TAB === 'progress') VIEWS.progress($('#view'));
  };
  $$('[data-wkrev-say]', v).forEach(b => b.onclick = () => speak(b.dataset.wkrevSay));
  $$('[data-hp]', v).forEach(b => b.onclick = () => { const p = (S.sumPending || []).find(x => x.id === b.dataset.hp); if (!p) return; openSummarySheet(runPendingSummary(p.id), p.title); const re = () => { if (TAB === 'progress' && !$('.sumsheet')) VIEWS.progress($('#view')); else if ($('.sumsheet')) setTimeout(re, 800); }; setTimeout(re, 800); });
  $$('[data-h]', v).forEach(b => b.onclick = () => { const [k, id] = b.dataset.h.split(':'); if (k === 's') { const r = S.summaries.find(x => x.id === id); r && openSummarySheet(r, r.title); } else { const r = S.interviews.find(x => x.id === id); r && openInterviewSheet(r); } });
};


/* =================== 5) PROGRESO ENTRE DISPOSITIVOS =================== */
export const SECRET_KEYS = ['geminiKey', 'openaiKey', 'azureKey'];
const settingsSig = () => { const o = { ...S.settings }; SECRET_KEYS.forEach(k => delete o[k]); delete o.ivLast; return JSON.stringify(o); };
let _setSig = settingsSig();
const _save24 = save; save = function () { const g = settingsSig(); if (g !== _setSig) { _setSig = g; S.mt = Date.now(); } _save24(); };
export function exportState() { const o = JSON.parse(JSON.stringify(S)); SECRET_KEYS.forEach(k => { if (o.settings) delete o.settings[k]; }); return o; }
export async function streamBytes(bytes, T) { return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(T)).arrayBuffer()); }
export async function decodeState(code) {
  code = String(code || '').trim();
  const tag = code.slice(0, 3), body = code.slice(3); let bytes;
  if (!/^[A-Za-z0-9_\-]+$/.test(body)) throw new Error('Código no válido: tiene caracteres que no corresponden. Cópialo de nuevo completo.');
  try {
  if (tag === 'TK1') { if (!window.DecompressionStream) throw new Error('Este navegador no puede leer el código comprimido. Actualízalo o usa el archivo JSON.'); bytes = await streamBytes(unb64u(body), new DecompressionStream('deflate-raw')); }
  else if (tag === 'TK0') bytes = unb64u(body); else throw new Error('Código no válido: debe empezar por TK1 o TK0.');
  } catch (e) { if (/^Código|navegador/.test(e.message)) throw e; throw new Error('Código incompleto o dañado. Cópialo de nuevo completo.'); }
  let d; try { d = JSON.parse(new TextDecoder().decode(bytes)); } catch (e) { throw new Error('Código incompleto o dañado. Cópialo de nuevo completo.'); }
  if (!d || typeof d !== 'object' || !d.settings || !(d.v >= 1)) throw new Error('El código no contiene un progreso válido.');
  return d;
}
/* Fusión: nunca se pierde progreso */
export function mergeStates(a, b) {
  const o = JSON.parse(JSON.stringify(a)), num = x => +x || 0;
  ['xp', 'bestStreak', 'spoken', 'sessions', 'reviewed', 'chats', 'lives'].forEach(k => o[k] = Math.max(num(a[k]), num(b[k])));
  const al = a.lastDay || '', bl = b.lastDay || '';
  if (bl > al) { o.lastDay = b.lastDay; o.streak = num(b.streak); o.freezes = num(b.freezes); } else if (bl === al) { o.streak = Math.max(num(a.streak), num(b.streak)); o.freezes = Math.max(num(a.freezes), num(b.freezes)); }
  if (num(b.heartTs) > num(a.heartTs)) { o.hearts = b.hearts; o.heartTs = b.heartTs; }
  const fieldMax = (x = {}, y = {}) => { const r = { ...x }; for (const k in y) { if (typeof y[k] === 'number') r[k] = Math.max(num(r[k]), y[k]); else if (r[k] === undefined) r[k] = y[k]; } return r; };
  const perKey = (x = {}, y = {}, pick) => { const r = { ...x }; for (const k in y) r[k] = r[k] === undefined ? y[k] : pick(r[k], y[k]); return r; };
  o.days = perKey(a.days, b.days, fieldMax);
  o.done = perKey(a.done, b.done, (x, y) => { const r = fieldMax(x, y); if (x.placed && !y.placed || y.placed && !x.placed) delete r.placed; if (r.times && r.placed) delete r.placed; return r; });
  o.deck = perKey(a.deck, b.deck, (x, y) => num(y.reps) > num(x.reps) || (num(y.reps) === num(x.reps) && num(y.due) > num(x.due)) ? y : x);
  o.snd = perKey(a.snd, b.snd, (x, y) => { const seen = new Set(), r = []; [...x, ...y].sort((p, q) => p.t - q.t).forEach(e => { const k = e.t + ':' + e.s; if (!seen.has(k)) { seen.add(k); r.push(e); } }); return r.slice(-40); });
  const byN = (x, y) => num(y.n) > num(x.n) ? y : x;
  o.wd = perKey(a.wd, b.wd, byN); o.ph = perKey(a.ph, b.ph, byN);
  o.ear = perKey(a.ear, b.ear, (x, y) => num(y.r) + num(y.w) > num(x.r) + num(x.w) ? y : x);
  o.badges = perKey(a.badges, b.badges, (x, y) => Math.min(x, y));
  o.plans = { ...(b.plans || {}), ...(a.plans || {}) }; o.challenges = { ...(b.challenges || {}), ...(a.challenges || {}) };
  o.hard = perKey(a.hard, b.hard, (x, y) => num(y.t) > num(x.t) ? { ...y, n: Math.max(x.n, y.n) } : { ...x, n: Math.max(x.n, y.n) });
  const byId = (x = [], y = [], cap) => { const m = new Map(); [...x, ...y].forEach(e => e && e.id && !m.has(e.id) && m.set(e.id, e)); return [...m.values()].sort((p, q) => q.ts - p.ts).slice(0, cap); };
  o.summaries = byId(a.summaries, b.summaries, 60); o.interviews = byId(a.interviews, b.interviews, 30);
  const ci = new Map(); [...(a.convoItems || []), ...(b.convoItems || [])].forEach(c => { const k = String(c.en).toLowerCase(); if (!ci.has(k) || ci.get(k).ts < c.ts) ci.set(k, c); }); o.convoItems = [...ci.values()].sort((p, q) => q.ts - p.ts).slice(0, 60);
  o.placement = a.placement || b.placement || null;
  const keep = {}; SECRET_KEYS.forEach(k => keep[k] = a.settings[k] || '');
  if (num(b.mt) > num(a.mt)) { o.settings = { ...a.settings, ...b.settings }; o.mt = b.mt; }
  SECRET_KEYS.forEach(k => o.settings[k] = keep[k]);
  return o;
}
export function adoptState(d) {
  const f = freshState(); for (const k in f) if (d[k] === undefined || (d[k] === null && k !== 'placement' && k !== 'lastDay')) d[k] = f[k];
  d.settings = { ...DEFAULT_SETTINGS, ...d.settings }; setState(d);
  ['summaries', 'interviews', 'convoItems'].forEach(k => { if (!Array.isArray(S[k])) S[k] = []; }); ['challenges', 'hard'].forEach(k => { if (!S[k] || typeof S[k] !== 'object') S[k] = {}; });
  _setSig = settingsSig(); _save24(); applyPrefs(); render();
}
function applyImport(d, how) {
  const keep = {}; SECRET_KEYS.forEach(k => keep[k] = S.settings[k] || '');
  const next = how === 'replace' ? JSON.parse(JSON.stringify(d)) : mergeStates(S, d);
  next.settings = next.settings || {}; SECRET_KEYS.forEach(k => next.settings[k] = keep[k]);
  adoptState(next); checkBadges();
}
function importPrompt(d, src) {
  const days = Object.keys(d.days || {}).length, done = Object.values(d.done || {}).filter(x => x.times).length;
  modal(`<h2>📥 Importar progreso</h2><p class="small">${esc(src || 'Código')} con <b>${num0(d.xp)} XP</b>, racha <b>${num0(d.streak)}</b>, <b>${done}</b> lecciones, <b>${Object.keys(d.deck || {}).length}</b> tarjetas y <b>${days}</b> días de actividad.</p>
    <div class="tipbox small"><b>Combinar</b> junta ambos progresos sin perder nada (recomendado). <b>Reemplazar</b> borra el progreso de este dispositivo. Tus claves de API de este dispositivo se conservan.</div>
    <div class="row"><button class="btn ghost block" data-x>Cancelar</button><button class="btn ghost block" id="impRep">Reemplazar</button><button class="btn primary block" id="impMerge">Combinar</button></div>`, (el, close) => {
    $('[data-x]', el).onclick = close;
    $('#impMerge', el).onclick = () => { applyImport(d, 'merge'); close(); toast('✅ Progreso combinado'); };
    $('#impRep', el).onclick = () => confirmBox('¿Reemplazar progreso?', 'Se borrará el progreso de este dispositivo y se usará el importado. No se puede deshacer.', 'Reemplazar', () => { applyImport(d, 'replace'); close(); toast('✅ Progreso reemplazado'); }, true);
  });
}
const num0 = x => Math.round(+x || 0);
/* v2.10.1: se quitó la tarjeta «Progreso en varios dispositivos» (código QR, enlace #import= y sincronización con un Gist
   de GitHub): la cuenta de Google/Firebase la reemplaza. El token de GitHub guardado es una credencial que ya no se usa:
   se borra al cargar. El progreso no se toca. */
try { localStorage.removeItem('tukiSpeak.gist'); } catch (e) {}
/* Ajustes: resumen automático */
const _settings24 = VIEWS.settings;
VIEWS.settings = v => {
  _settings24(v);
  const s = S.settings;
  const html = `<div class="card"><h3>📝 Resúmenes de conversación</h3><div class="set-row"><div><label for="autoSummary">Resumen al terminar</label><div class="desc">Al terminar una conversación con la IA verás tus errores, palabras nuevas y puntajes. Se agregan a tus tarjetas.</div></div><label class="switch"><input type="checkbox" id="autoSummary" ${s.autoSummary !== false ? 'checked' : ''}><span></span></label></div></div>`;
  const cards = $$(':scope > .card', v), anchor = cards.find(x => /Datos|progreso|Respaldo/i.test($('h3', x) ? $('h3', x).textContent : '')) || cards[cards.length - 1];
  anchor.insertAdjacentHTML('beforebegin', html);
  $('#autoSummary', v).onchange = e => { S.settings.autoSummary = e.target.checked; save(); };
};


// (Fase 3, modulo 7: movido a src/ui.js, lineas 2619-2634)
ensure25();
const _render25 = render; render = function () { ensure25(); _render25(); };
const _fresh25 = freshState; freshState = function () { return { ..._fresh25(), tc: { items: {}, ai: [], sessions: 0, xp: 0, ok: 0, first: 0 } }; };
const _merge25 = mergeStates;
mergeStates = function (a, b) {
  const o = _merge25(a, b), ta = a.tc || {}, tb = b.tc || {}, n = r => (+(r && r.n) || 0), items = { ...(tb.items || {}) };
  for (const k in (ta.items || {})) items[k] = items[k] && n(items[k]) > n(ta.items[k]) ? items[k] : ta.items[k];
  const ai = new Map(); [...(ta.ai || []), ...(tb.ai || [])].forEach(x => x && x.id && !ai.has(x.id) && ai.set(x.id, x));
  o.tc = { items, ai: [...ai.values()].slice(-80) }; ['sessions', 'xp', 'ok', 'first'].forEach(k => o.tc[k] = Math.max(+ta[k] || 0, +tb[k] || 0));
  return o;
};
export let TUKI_OFFLINE_TC = [];
// (Fase 3, modulo 7: movido a src/ui.js, lineas 2647-2747)
/* ---- P6 (v2.23.0): TC personalizado con los errores del usuario ----
   tcGenerate() recibe las 3-5 palabras difíciles actuales (hardWords())
   y el prompt pide incluirlas en las frases nuevas, sin repetir las
   existentes (el "avoid" de siempre). Después de validar, se comprueba
   que las palabras pedidas aparezcan de verdad en las frases generadas;
   si ninguna aparece, se degrada a generación normal: las frases válidas
   se devuelven igual y el toast no anuncia personalización. Mismo costo
   que hoy: 1 Gemini por tanda de 6. */
export function tcHardWords() {
  return hardWords().filter(h => h.w && !/\s/.test(String(h.w).trim())).slice(0, 5).map(h => String(h.w).trim().toLowerCase());
}
export function tcWordsInItems(items, words) {
  const hay = (items || []).map(x => ' ' + normText(((x.en || '').replace(/\{\}/g, ' ')) + ' ' + ((x.es || '').replace(/\[[^\]]+\]/g, ' ')) + ' ' + ((x.b || []).flatMap(b => b.a || []).join(' '))).join(' ') + ' ');
  return (words || []).filter(w => { const nw = ' ' + normText(w).join(' ') + ' '; return nw.trim() && hay.some(h => h.includes(nw)); });
}
export let TC_LAST_PERSONALIZED = { asked: [], covered: [], degraded: false };
export async function tcGenerate(lv, n = 6) {
  const hard = tcHardWords();
  const sys = `You create "translate and complete" exercises for a Spanish-speaking learner from Colombia at CEFR ${lv} (${TC_LV[lv]}). Return ONLY JSON:
{"items":[{"es":"Spanish sentence with the key word(s) wrapped in [square brackets]","en":"natural English sentence where each translated key part is replaced by {}","blanks":[{"answers":["target","other fully correct alternative"],"near":{"common wrong or non-target answer":"short Spanish feedback (tú) saying why, without giving the answer"}}],"hint":"short clue in Spanish without the answer","explain":"1-2 short sentences in simple Spanish explaining the expression","context":"Contexto: ...","category":"idiom|phrasal|false|prep|error|daily"}]}
Rules: exactly ${n} items; 1 or 2 blanks per item; the number of [..] in "es" and of {} in "en" must equal the number of blanks, in the same order; each answer has 1-4 words; at least 2 "near" entries per blank focused on typical Spanish-speaker mistakes (false friends, literal translations, wrong prepositions, make/do, say/tell, since/for) or valid-but-less-natural options; everyday situations; "context" is an honest generic situation such as "Contexto: en el trabajo" or "Contexto: conversación informal entre amigos" — never mention TV shows, movies, books, songs or real people; vary topics; no offensive content.${hard.length ? `\nInclude these words the learner finds difficult: ${hard.join(', ')}. Use each of them at least once across the ${n} items, in a NEW English sentence (not copying the "Do not repeat" sentences below). If a word does not fit naturally, skip it — never force it.` : ''}`;
  const avoid = tcAll().filter(x => x.lv === lv).slice(0, 40).map(x => x.en.replace(/\{\}/g, '___')).join(' | ');
  const d = await aiJSON(sys, `Create ${n} new items. Do not repeat these: ${avoid}`, 6000);
  const items = (Array.isArray(d.items) ? d.items : Array.isArray(d) ? d : []).map(x => tcValidate(x, lv)).filter(Boolean).slice(0, n);
  if (!items.length) throw new Error('La IA no devolvió frases válidas.');
  const covered = tcWordsInItems(items, hard);
  TC_LAST_PERSONALIZED = { asked: hard, covered, degraded: hard.length > 0 && covered.length === 0 };
  S.tc.ai = [...S.tc.ai, ...items].slice(-80); save();
  for (const it of items) {
    TukiDB.set('tc', it.id, it).catch(() => {});
  }
  TUKI_OFFLINE_TC = [...TUKI_OFFLINE_TC, ...items];
  return items;
}
// (Fase 3, modulo 7: movido a src/ui.js, lineas 2763-2944)
const _finish25 = finishLesson;
finishLesson = function () { if (L && L.mode === 'tc') return tcFinish(); return _finish25(); };

/* ---- Entrada, Aprender, Práctica, Plan, Progreso, Insignias ---- */
// (Fase 3, modulo 7: movido a src/ui.js, lineas 2949-2967)
const _learn25 = VIEWS.learn;
VIEWS.learn = v => {
  _learn25(v);
  const anchor = $('.duo2', v) || $('.plan-card', v);
  if (anchor) { anchor.insertAdjacentHTML('afterend', tcEntryHTML('tcEntry')); $('#tcEntry', v).onclick = tcSetup; }
};
const _practice25 = VIEWS.practice;
VIEWS.practice = v => {
  _practice25(v);
  const h2 = $('h2', v).nextElementSibling;
  const unl = isFeatureUnlocked('tc');
  h2.insertAdjacentHTML('afterend', `<button class="card pcard ${!unl ? 'locked-card' : ''}" id="tcPractice">
    <div class="em" style="background:#dcf1ff">${unl ? '✍️' : '🔒'}</div>
    <div style="flex:1">
      <div class="row between">
        <h3 style="margin:0 0 2px">Traduce y completa</h3>
        ${!unl ? '<span class="lock-pill">🔒 Bloqueado</span>' : ''}
      </div>
      <div class="muted small">${TC_SESSION} frases · ${esc(TC_LV[tcLevel()])} · ${tcMasteredCount()} dominadas · pistas y explicaciones en español</div>
    </div>
  </button>`);
  $('#tcPractice', v).onclick = () => {
    if (!isFeatureUnlocked('tc')) return showLockedFeatureModal('tc');
    tcSetup();
  };
};
const _buildPlan25 = buildPlan;
buildPlan = function () { const base = _buildPlan25(); if (!base.length) return base; if (!isFeatureUnlocked('tc')) return base; const it = tcPick(1, tcLevel())[0]; return it ? [...base.slice(0, 9), tcEx(it)] : base; };
const _planCard25 = planCardHTML;
planCardHTML = function () { const base = _planCard25(); if (!isFeatureUnlocked('tc')) return base; return base.replace('</div>\n    <button class="btn orange', '<span class="plan-step">✍️ Traduce y completa</span></div>\n    <button class="btn orange'); };
const _progress25 = VIEWS.progress;
VIEWS.progress = v => {
  _progress25(v);
  const t = S.tc, per = Object.keys(TC_LV).map(k => ({ k, m: tcMasteredCount(k), n: tcAll().filter(x => x.lv === k).length })), tries = Object.values(t.items).reduce((a, r) => a + r.n, 0);
  const html = `<div class="card" id="tcStats"><h3>✍️ Traduce y completa</h3>
    <div class="kpis" style="margin:6px 0 0"><div class="kpi"><span>Dominadas</span><b>${tcMasteredCount()}</b></div><div class="kpi"><span>A la primera</span><b>${tries ? Math.round(t.first / tries * 100) + '%' : '—'}</b></div><div class="kpi"><span>Rondas</span><b>${t.sessions}</b></div><div class="kpi"><span>XP ganado</span><b>${t.xp}</b></div></div>
    ${per.map(p => `<div class="row between small" style="margin-top:8px"><b>${esc(TC_LV[p.k])}</b><span class="muted">${p.m}/${p.n}</span></div><div class="pbar" style="height:10px;margin-top:4px"><i style="width:${p.n ? Math.round(p.m / p.n * 100) : 0}%"></i></div>`).join('')}
    <div class="small muted" style="margin-top:8px">Una frase queda dominada cuando la aciertas a la primera y sin pista dos veces seguidas.</div></div>`;
  const k = $('.kpis', v); if (k) (k.nextElementSibling || k).insertAdjacentHTML('afterend', html); else v.insertAdjacentHTML('beforeend', html);
};
BADGES.push(
  { id: 'tc1', i: '✍️', t: 'Traductor', d: 'Completa una ronda de Traduce y completa', c: () => (S.tc && S.tc.sessions) >= 1 },
  { id: 'tc25', i: '🧠', t: 'Sin falsos amigos', d: 'Domina 25 frases de Traduce y completa', c: () => S.tc && tcMasteredCount() >= 25 }
);
const _nextCard25 = nextCard;
nextCard = function () {
  _nextCard25();
  const c = R && R.q[0], card = c && S.deck[c.key], back = card && card.ex && $('.face.back');
  if (back) { const m = $('.muted', back); (m || back.firstElementChild).insertAdjacentHTML('afterend', `<div class="small tc-cardex">“${esc(card.ex)}”${card.exEs ? `<div class="muted">${esc(card.exEs)}</div>` : ''}</div>`); }
};
Object.assign(window, { TC_BANK, startTC, tcEval, tcGenerate, tcValidate, tcSetup });


/* =================== v2.5.1: entidades HTML, TTS limpio, migración, resúmenes pendientes =================== */
// (Fase 3, modulo 7: movido a src/ui.js, lineas 3022-3031)
ensure251(); save();
const _render251 = render; render = function () { ensure251(); _render251(); };
const _merge251 = mergeStates;
mergeStates = function (a, b) { const o = _merge251(a, b), seen = new Set(), done = new Set((o.summaries || []).map(x => x.ts)); o.sumPending = [...(a.sumPending || []), ...(b.sumPending || [])].filter(p => p && p.id && !seen.has(p.id) && seen.add(p.id)).slice(0, 10); o.fix251 = 1; return o; };


/* =================== v2.6: TRADUCE Y COMPLETA POR VOZ =================== */
// (Fase 3, modulo 7: movido a src/ui.js, lineas 3039-3042)
const _render26 = render; render = function () { ensure26(); _render26(); };
// (Fase 3, modulo 7: movido a src/ui.js, lineas 3044-3208)
const _renderTC26 = RENDER.tc;
RENDER.tc = (ex, body) => {
  tcVoiceStop(); _renderTC26(ex, body);
  if (L.mode !== 'tc') return;
  $('.tc-top', body).insertAdjacentHTML('beforeend', `<button class="tc-mute" id="tcModeBtn"></button>`);
  $('#tcBox', body).insertAdjacentHTML('afterend', `<div class="tc-voice hidden" id="tcVoice" data-state="idle"><button class="tc-mic" id="tcMicBig" aria-label="Hablar">🎙️</button><div class="tc-vstat"><b id="tcVState"></b><div class="small muted" id="tcHeard"></div><div class="small" id="tcAz"></div></div><button class="chip" id="tcPause">⏸️ Pausa</button></div>`);
  $('#tcModeBtn').onclick = () => {
    if (S.settings.tcInput === 'voice' && tcCanVoice()) { S.settings.tcInput = 'text'; save(); tcVoiceStop(); tcVoiceUI(); return; }
    if (!tcCanVoice()) return toast('🎙️ Este navegador no tiene reconocimiento de voz. Usa Chrome en Android o configura Azure en Ajustes.', 4000);
    S.settings.tcInput = 'voice'; save(); tcVoiceUI(); if (!ex.st.done) { V.paused = false; tcVoiceStart(ex); }
  };
  $('#tcMicBig').onclick = () => { if (V.state === 'listening') { stopRecognize(); try { MicCap.active && MicCap.stop(); } catch (e) {} return; } V.paused = false; tcVoiceStop(); if (ex.st.done) return nextEx(); tcListen(ex); };
  $('#tcPause').onclick = () => { V.paused = !V.paused; if (V.paused) { tcVoiceStop(); tcVState('paused'); } else if (ex.st.done) nextEx(); else { tcVState('idle'); tcListen(ex); } };
  tcVoiceUI();
  if (tcVoiceOn()) { if (V.paused) tcVState('paused', ''); else setTimeout(() => { if (L && L.cur === ex) tcVoiceStart(ex); }, 250); }
};
const _close26 = closeLesson; closeLesson = function () { tcVoiceStop(); V.paused = false; _close26(); };
const _finish26 = finishLesson; finishLesson = function () { tcVoiceStop(); return _finish26(); };
/* Selector en la hoja de inicio */
// (Fase 3, modulo 7: movido a src/ui.js, lineas 3228-3242)
// (Fase 3, modulo 7: movido a src/ui.js, lineas 3243-3328)
ensure27();
const _render27 = render; render = function () { ensure27(); _render27(); };
const _fresh27 = freshState; freshState = function () { return { ..._fresh27(), pd: { days: {}, recent: [], best: 0 } }; };
const _merge27 = mergeStates;
mergeStates = function (a, b) {
  const o = _merge27(a, b), pa = a.pd || {}, pb = b.pd || {}, days = { ...(pb.days || {}) };
  for (const k in (pa.days || {})) days[k] = days[k] && (days[k].n || 0) > (pa.days[k].n || 0) ? days[k] : pa.days[k];
  const rec = new Map(); [...(pa.recent || []), ...(pb.recent || [])].forEach(r => r && r.d && rec.set(r.d + '|' + (r.ids || []).join(','), r));
  o.pd = { days, recent: [...rec.values()].sort((x, y) => x.d < y.d ? -1 : 1).slice(-40), best: Math.max(+pa.best || 0, +pb.best || 0) };
  return o;
};
// (Fase 3, modulo 7: movido a src/ui.js, lineas 3340-3505)
const _finish27 = finishLesson; finishLesson = function () { if (L && L.mode === 'pd') return pdFinish(); return _finish27(); };
/* ---- tarjeta en Aprender ---- */
// (Fase 3, modulo 7: movido a src/ui.js, lineas 3508-3513)
const _learn27 = VIEWS.learn;
VIEWS.learn = v => {
  _learn27(v);
  const g = $('.card.goal', v);
  if (g) g.insertAdjacentHTML('afterend', pdCardHTML()); else v.insertAdjacentHTML('afterbegin', pdCardHTML());
  $('#pdGo', v).onclick = startPD;
};
BADGES.push({ id: 'pd7', i: '🌅', t: 'Rutina de 7 días', d: 'Haz la Práctica diaria 7 días seguidos', c: () => S.pd && (Math.max(S.pd.best || 0, pdStreak()) >= 7) });
Object.assign(window, { startPD });


/* =================== v2.8 CUENTA, NUBE Y SEGURIDAD =================== */
// (Fase 3, modulo 7: movido a src/ui.js, lineas 3526-3529)
const _decode28 = decodeState; decodeState = async function (code) { return sanitizeState(await _decode28(code)); };
const _merge28 = mergeStates; mergeStates = function (a, b) { return _merge28(a, sanitizeState(b)); };
const _applyImport28 = applyImport; applyImport = function (d, how) { return _applyImport28(sanitizeState(d), how); };
const _importPrompt28 = importPrompt; importPrompt = function (d, src) { let c; try { c = sanitizeState(d); } catch (e) { return toast('⚠️ ' + (e.message || e), 4500); } return _importPrompt28(c, src); };

const _save28 = save; save = function () {
  if (LOCKED) lockApply();
  _save28();
  if (LOCKED && KS.key) { const sg = keysSig(); if (sg !== getLockSig()) { setLockSig(sg); sealKeys(keysObj(), KS).then(b => lsSet(KEYS_LOCAL, b)).catch(() => {}); } }
  if (typeof fbMarkDirty === 'function') fbMarkDirty();
};
const _adopt28 = adoptState; adoptState = function (d) {
  const keep = {}; LOCK_FIELDS.forEach(k => { keep[k] = (d.settings && d.settings[k]) || ''; if (LOCKED && d.settings) delete d.settings[k]; });
  _adopt28(d);
  if (LOCKED) { LOCK_FIELDS.forEach(k => { delete S.settings[k]; Object.defineProperty(S.settings, k, { value: keep[k], writable: true, enumerable: false, configurable: true }); }); _save28(); }
};
if (validBlob(lsGet(KEYS_LOCAL, null))) { setLocked(true); lockApply(); }

export function fbOnUser(u) {
  const prev = FB.user && FB.user.uid;
  FB.raw = u || null;
  FB.user = u ? { uid: u.uid, email: String(u.email || ''), name: String(u.displayName || ''), verified: !!u.emailVerified, provider: (u.providerData && u.providerData[0] && u.providerData[0].providerId) || 'password' } : null;
  if (u) { lsSet(FB_HINT, { uid: u.uid, email: FB.user.email }); if (prev !== u.uid) { FB.first = false; FB.remoteKeys = undefined; setTimeout(() => cloudFirstSync().catch(fbFail), 0); } }
  else { lsSet(FB_HINT, null); FB.remoteKeys = undefined; clearTimeout(FB.timer); FB.timer = null; }
  fbRefreshUI();
  if (TAB === 'settings' || TAB === 'chat') render();
}
export function fbRefreshUI() {
  if (TAB === 'chat' && !LIVE.on && !CHAT.busy && !$('#log') !== !currentProvider()) render(); // el chat cambia al iniciar/cerrar sesión
  if (TAB !== 'settings') return;
  const am = $('#aiMode'); if (am) am.textContent = aiModeText();
  const aq = $('#aiQuota'); if (aq) aq.textContent = aiQuotaText();
  const a = $('#acctCard'); if (a) { a.outerHTML = acctHTML(); bindAcct(document); }
  const k = $('#keysCard'); if (k && !(document.activeElement && k.contains(document.activeElement))) { k.outerHTML = keysHTML(); bindKeys(document); }
}
const _settings28 = VIEWS.settings;
VIEWS.settings = v => {
  _settings28(v);
  const h2 = $('h2', v); (h2 || v).insertAdjacentHTML(h2 ? 'afterend' : 'afterbegin', acctHTML());
  const cards = $$(':scope > .card', v), az = cards.find(x => /Azure/.test(($('h3', x) || {}).textContent || '')) || cards[1];
  az.insertAdjacentHTML('beforebegin', keysHTML());
  bindAcct(v); bindKeys(v);
  if (LOCKED && !KS.key) { $$('#azKey, #gkey, #okey', v).forEach(i => { i.placeholder = '🔒 Bloqueada: desbloquea con tu frase'; }); }
  const imp = $('#imp', v); if (imp) imp.onchange = e => { const f = e.target.files[0]; if (!f) return; f.text().then(t => { let d; try { d = JSON.parse(t); } catch (er) { throw new Error('El archivo no es JSON válido.'); } if (!d || !(d.v === 1 || d.v === 2) || !d.settings) throw new Error('Archivo no válido'); importPrompt(d, 'Archivo'); }).catch(err => toast('Error: ' + err.message)); e.target.value = ''; };
};
/* Arranque: la cuenta se conecta sola solo si ya habías iniciado sesión */
setTimeout(() => {
  if (lsGet(FB_HINT, null) && (navigator.onLine || window.__fbImport)) fbLoad().catch(() => {});
  if (LOCKED && !KS.key && !sessionStorage.getItem('tukiUnlockLater') && S.placement != null) unlockPrompt('local');
}, window.__fbBootMs ?? 1200);
window.addEventListener('online', () => { if (lsGet(FB_HINT, null) && !FB.ready) fbLoad().catch(() => {}); else if (FB.user && FB.dirty) fbSchedule(); });


/* =================== v2.9 VOZ DE TUKI (gratis: Azure F0 con tu clave o voces del teléfono) =================== */
// (Fase 3, modulo 7: movido a src/ui.js, lineas 3583-3762)
const _settings29 = VIEWS.settings;
VIEWS.settings = v => {
  _settings29(v);
  const cards = $$('.card', v), anchor = cards.find(c => /Voz y audio/.test((c.querySelector('h3') || {}).textContent || '')) || cards[0];
  if (anchor) anchor.insertAdjacentHTML('afterend', tvCardHTML()); else v.insertAdjacentHTML('beforeend', tvCardHTML());
  $$('[data-tvl]', v).forEach(b => b.onclick = () => { if (TV.lang !== b.dataset.tvl) { tvStop(); TV.lang = b.dataset.tvl; tvMsg(''); tvRenderBody(); } });
  // Si cambias la voz inglesa en «Voz y audio», esa elección manda (la de «Voz de Tuki» en inglés vuelve a Automática)
  if (!v.__tv29) v.__tv29 = true, v.addEventListener('change', e => { if (TAB !== 'settings') return; const id = e.target && e.target.id; if (['ttsEngine', 'voice', 'azureVoice'].includes(id) && S.settings.tukiVoiceEn) { S.settings.tukiVoiceEn = ''; save(); if (TV.lang === 'en') tvRenderBody(); } }, true);
  tvRenderBody();
  if (!tvDeviceVoices(TV.lang).length && 'speechSynthesis' in window) setTimeout(() => { if (TAB === 'settings' && $('#tvBody') && tvDeviceVoices(TV.lang).length) tvRenderBody(); }, 800);
};


/* =================== v2.11: PANEL DE ADMINISTRADOR (solo el dueño) + COMENTARIOS =================== */
// Acceso real lo imponen las reglas de Firestore (profiles/*, quota/*, feedback/*: solo el dueño lee). Esto solo decide qué se muestra.
// (Fase 3, modulo 7: movido a src/ui.js, lineas 3778-3800)
const _fbOnUser211 = fbOnUser; fbOnUser = function (u) { _fbOnUser211(u); if (u) setTimeout(profileTouch, 0); };
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') profileTouch(); });
/* Comentarios (feedback/{autoId}) */
// (Fase 3, modulo 7: movido a src/ui.js, lineas 3804-3831)
// (Fase 3, modulo 7: movido a src/ui.js, lineas 3832-3891)
const _fbRefresh211 = fbRefreshUI; fbRefreshUI = function () { _fbRefresh211(); if (TAB === 'settings') adminRefresh(); };
const _settings211 = VIEWS.settings;
VIEWS.settings = v => {
  _settings211(v);
  const ac = $('#acctCard', v); if (ac) ac.insertAdjacentHTML('afterend', adminHTML());
  // (densidad PR B, v2.31.0, ítem 4: "Enviar comentarios" deja de ser la
  // 2ª tarjeta y pasa al pie, junto al pie de versión.)
  const foot = [...v.children].find(el => el.tagName === 'P' && /Tuki Speak v/.test(el.textContent || ''));
  if (foot) foot.insertAdjacentHTML('beforebegin', fbkCardHTML()); else v.insertAdjacentHTML('beforeend', fbkCardHTML());
  $('#fbkOpen', v).onclick = openFeedback; bindAdmin(v);
};


/* =================== v2.12: SRS INTELIGENTE, MISIONES ROLEPLAY, SHADOWING, FONÉTICA ANATÓMICA, MULTIMODAL Y FEEDBACK =================== */

// 1. REPETICIÓN ESPACIADA (SM-2) ENRIQUECIDA
// (Fase 3, modulo 7: movido a src/ui.js, lineas 3904-3924)
// (Fase 3, modulo 7: movido a src/ui.js, lineas 3925-4473)
// (Fase 3, modulo 7: movido a src/ui.js, lineas 4474-4549)
const _beep211 = beep;
beep = function (type) {
  if (!S.settings.sound) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (type === 'fanfare') {
      const notes = [[523, .08], [659, .08], [784, .08], [1046, .26]];
      let t = AC.currentTime;
      notes.forEach(([f, d]) => {
        const o = AC.createOscillator(), g = AC.createGain();
        o.type = 'triangle'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.2, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + d);
        o.connect(g).connect(AC.destination);
        o.start(t); o.stop(t + d + 0.02);
        t += d * 0.85;
      });
      return;
    }
    if (type === 'streak') {
      const notes = [[440, .07], [554, .07], [659, .18]];
      let t = AC.currentTime;
      notes.forEach(([f, d]) => {
        const o = AC.createOscillator(), g = AC.createGain();
        o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.18, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + d);
        o.connect(g).connect(AC.destination);
        o.start(t); o.stop(t + d + 0.02);
        t += d * 0.9;
      });
      return;
    }
    if (type === 'pop') {
      const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime;
      o.type = 'sine'; o.frequency.setValueAtTime(800, t);
      o.frequency.exponentialRampToValueAtTime(400, t + 0.04);
      g.gain.setValueAtTime(0.08, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
      o.connect(g).connect(AC.destination);
      o.start(t); o.stop(t + 0.05);
      return;
    }
  } catch (e) {}
  _beep211(type);
};

// (Fase 3, modulo 7: movido a src/ui.js, lineas 4599-4648)
// (Fase 3, modulo 7: movido a src/ui.js, lineas 4649-4771)
const _practice211 = VIEWS.practice;
VIEWS.practice = function (v) {
  _practice211(v);
  syncHardWordsToDeck();
  const st = srsStats();
  
  const unlSrs = isFeatureUnlocked('srs'), unlHf = isFeatureUnlocked('handsfree'), unlMi = isFeatureUnlocked('missions');
  const unlSh = isFeatureUnlocked('shadow'), unlMo = isFeatureUnlocked('mouth'), unlPh = isFeatureUnlocked('photo');
  const unlTr = isFeatureUnlocked('travel'), unlInt = isFeatureUnlocked('interview');

  const srsHtml = `<button class="card pcard ${!unlSrs ? 'locked-card' : ''}" id="srsCard" style="margin-top:10px">
    <div class="em" style="background:#fff3d6">${unlSrs ? '🧠' : '🔒'}</div>
    <div style="flex:1">
      <div class="row between">
        <h3 style="margin:0 0 2px">Repaso Inteligente (SRS)</h3>
        ${unlSrs ? `<span class="srs-pill due">${st.due} hoy</span>` : '<span class="lock-pill">🔒 Bloqueado</span>'}
      </div>
      <div class="srs-stats">
        <span class="srs-pill learn">🌱 ${st.learn} aprendiendo</span>
        <span class="srs-pill mat">🏆 ${st.mature} dominadas</span>
      </div>
      <div class="muted small">Algoritmo SM-2 · repasa en el momento exacto antes de olvidar</div>
    </div>
  </button>
  <button class="card pcard ${!unlHf ? 'locked-card' : ''}" id="handsFreeCard" style="margin-top:10px">
    <div class="em" style="background:#e0f2fe">${unlHf ? '🎧' : '🔒'}</div>
    <div style="flex:1">
      <div class="row between">
        <h3 style="margin:0 0 2px">Modo Manos Libres</h3>
        ${!unlHf ? '<span class="lock-pill">🔒 Bloqueado</span>' : ''}
      </div>
      <div class="muted small">Escucha y repite en bucle continuo con pausas inteligentes sin tocar la pantalla</div>
    </div>
  </button>
  <button class="card pcard ${!unlMi ? 'locked-card' : ''}" id="missionsCard" style="margin-top:10px">
    <div class="em" style="background:#fef3c7">${unlMi ? '🎯' : '🔒'}</div>
    <div style="flex:1">
      <div class="row between">
        <h3 style="margin:0 0 2px">Misiones de Conversación Real</h3>
        ${!unlMi ? '<span class="lock-pill">🔒 Bloqueado</span>' : ''}
      </div>
      <div class="muted small">8 situaciones cotidianas guiadas con objetivos e IA (Médico, Trabajo, Supermercado, Taxi…)</div>
    </div>
  </button>
  <button class="card pcard ${!unlSh ? 'locked-card' : ''}" id="shadowCard" style="margin-top:10px">
    <div class="em" style="background:#e8f4fd">${unlSh ? '🎙️' : '🔒'}</div>
    <div style="flex:1">
      <div class="row between">
        <h3 style="margin:0 0 2px">Modo Shadowing</h3>
        ${!unlSh ? '<span class="lock-pill">🔒 Bloqueado</span>' : ''}
      </div>
      <div class="muted small">Escucha e imita frases con entonación nativa y habla conectada</div>
    </div>
  </button>
  <button class="card pcard ${!unlMo ? 'locked-card' : ''}" id="mouthCard" style="margin-top:10px">
    <div class="em" style="background:#f3fbf7">${unlMo ? '👄' : '🔒'}</div>
    <div style="flex:1">
      <div class="row between">
        <h3 style="margin:0 0 2px">Guía Fonética y Bocas</h3>
        ${!unlMo ? '<span class="lock-pill">🔒 Bloqueado</span>' : ''}
      </div>
      <div class="muted small">Diagramas anatómicos SVG de colocación de lengua y labios (/θ/, /v/, /ɹ/)</div>
    </div>
  </button>
  <button class="card pcard ${!unlPh ? 'locked-card' : ''}" id="photoCard" style="margin-top:10px">
    <div class="em" style="background:#fdf2f8">${unlPh ? '📷' : '🔒'}</div>
    <div style="flex:1">
      <div class="row between">
        <h3 style="margin:0 0 2px">Describe la Foto / Objeto</h3>
        ${!unlPh ? '<span class="lock-pill">🔒 Bloqueado</span>' : ''}
      </div>
      <div class="muted small">Práctica multimodal con tu cámara o fotos para ganar vocabulario</div>
    </div>
  </button>
  <button class="card pcard ${!unlTr ? 'locked-card' : ''}" id="travelCard" style="margin-top:10px">
    <div class="em" style="background:#e0f2fe">${unlTr ? '✈️' : '🔒'}</div>
    <div style="flex:1">
      <div class="row between">
        <h3 style="margin:0 0 2px">Guía de Viaje y Supervivencia</h3>
        ${!unlTr ? '<span class="lock-pill">🔒 Bloqueado</span>' : '<span class="novice-badge">🌱 Novato & Viajes</span>'}
      </div>
      <div class="muted small">Frases clave para aeropuerto, hotel, comida y emergencias con pronunciación fonética y modo caracol</div>
    </div>
  </button>
  <button class="card pcard ${!unlInt ? 'locked-card' : ''}" id="interviewCard" style="margin-top:10px">
    <div class="em" style="background:#fef3c7">${unlInt ? '💼' : '🔒'}</div>
    <div style="flex:1">
      <div class="row between">
        <h3 style="margin:0 0 2px">Simulador de Entrevista Laboral</h3>
        ${!unlInt ? '<span class="lock-pill">🔒 Bloqueado</span>' : '<span class="novice-badge" style="background:#fef3c7;color:#b45309">🚀 Rúbrica 1-10</span>'}
      </div>
      <div class="muted small">Preguntas reales (Dev, Customer Service, General) con calificación 1 al 10 en fluidez, vocabulario y gramática</div>
    </div>
  </button>
  <button class="card pcard" id="shopCard" style="margin-top:10px;background:linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%);border-color:#86efac">
    <div class="em" style="background:#dcfce7">🛍️</div>
    <div style="flex:1">
      <div class="row between">
        <h3 style="margin:0 0 2px">Tienda y Armario de Tuki</h3>
        <span class="novice-badge" style="background:#fef3c7;color:#b45309">🪙 ${S.coins || 0} monedas</span>
      </div>
      <div class="muted small">Viste a Tuki con birrete, corona, gafas, corbatín, bufanda o capa usando tus monedas ganadas</div>
    </div>
  </button>`;

  const tc = $('#tcPractice', v);
  if (tc) tc.insertAdjacentHTML('afterend', srsHtml);
  else v.insertAdjacentHTML('beforeend', srsHtml);

  const bSrs = $('#srsCard', v); if (bSrs) bSrs.onclick = () => { if (!isFeatureUnlocked('srs')) return showLockedFeatureModal('srs'); startReview(); };
  const bHf = $('#handsFreeCard', v); if (bHf) bHf.onclick = () => { if (!isFeatureUnlocked('handsfree')) return showLockedFeatureModal('handsfree'); openHandsFreeModal(); };
  const bMi = $('#missionsCard', v); if (bMi) bMi.onclick = () => { if (!isFeatureUnlocked('missions')) return showLockedFeatureModal('missions'); openMissionsModal(); };
  const bSh = $('#shadowCard', v); if (bSh) bSh.onclick = () => { if (!isFeatureUnlocked('shadow')) return showLockedFeatureModal('shadow'); openShadowingModal(); };
  const bMo = $('#mouthCard', v); if (bMo) bMo.onclick = () => { if (!isFeatureUnlocked('mouth')) return showLockedFeatureModal('mouth'); openMouthSelector(); };
  const bPh = $('#photoCard', v); if (bPh) bPh.onclick = () => { if (!isFeatureUnlocked('photo')) return showLockedFeatureModal('photo'); openPhotoPractice(); };
  const bTr = $('#travelCard', v); if (bTr) bTr.onclick = () => { if (!isFeatureUnlocked('travel')) return showLockedFeatureModal('travel'); openTravelGuideModal(); };
  const bInt = $('#interviewCard', v); if (bInt) bInt.onclick = () => { if (!isFeatureUnlocked('interview')) return showLockedFeatureModal('interview'); openInterviewSimulatorModal(); };
  const bShop = $('#shopCard', v); if (bShop) bShop.onclick = openTukiShopModal;
};

const _chatView211 = VIEWS.chat;
VIEWS.chat = function (v) {
  if (CHAT.scen === 'interview') CHAT.scen = 'job_interview';
  if (CHAT.scen === 'shopping') CHAT.scen = 'supermarket';
  _chatView211(v);
  const top = $('.chattop', v);
  const updateMission = () => {
    const prev = $('#missionBox', v);
    if (prev) prev.remove();
    if (top && MISSION_SCENARIOS[CHAT.scen]) {
      top.insertAdjacentHTML('afterend', missionGoalsHTML(CHAT.scen));
      bindMissionGoals(v);
    }
  };
  updateMission();
  const scenEl = $('#scen', v);
  if (scenEl) {
    const origCh = scenEl.onchange;
    scenEl.onchange = e => {
      if (origCh) origCh(e);
      updateMission();
    };
  }
};

const _words211 = VIEWS.words;
VIEWS.words = function (v) {
  _words211(v);
  syncHardWordsToDeck();
  const chips = $('.chips', v);
  if (chips && !$('#srsDueFilter', chips)) {
    const st = srsStats();
    chips.insertAdjacentHTML('beforeend', `
      <button class="chip" id="srsDueFilter" data-srs="due">⏰ Hoy (${st.due})</button>
      <button class="chip" data-srs="learn">🌱 Aprendiendo</button>
      <button class="chip" data-srs="mat">🏆 Dominadas</button>
    `);
    $$('[data-srs]', chips).forEach(b => {
      b.onclick = () => {
        const mode = b.dataset.srs;
        const now = Date.now();
        const filtered = Object.entries(S.deck).map(([k, c]) => ({ key: k, ...c })).filter(c => {
          if (mode === 'due') return (c.due || 0) <= now;
          if (mode === 'learn') return (c.reps || 0) < 3;
          if (mode === 'mat') return (c.reps || 0) >= 3;
          return true;
        });
        const wlist = $('.wlist', v);
        if (wlist) {
          wlist.innerHTML = filtered.map(c => `
            <div class="witem">
              <button class="spk" data-say-n="${esc(c.en)}">🔊</button>
              <div style="min-width:0">
                <div class="en">${esc(c.en)}</div>
                <div class="es">${esc(c.es)}</div>
                <div class="muted small" style="margin-top:2px">Intervalo: ${c.int ? c.int + ' días' : '1 min'} · Repasos: ${c.reps || 0}</div>
              </div>
              <div class="lvl">${[1, 2, 3, 4, 5].map(i => `<i class="${(c.reps || 0) >= i ? 'on' : ''}"></i>`).join('')}</div>
            </div>
          `).join('') || '<div class="empty">Sin tarjetas en esta categoría.</div>';
          $$('[data-say-n]', wlist).forEach(sb => sb.onclick = () => speak(sb.dataset.sayN));
        }
      };
    });
  }
};

// =================== TIENDA Y ARMARIO DE TUKI ===================
// (Fase 3, modulo 7: movido a src/ui.js, lineas 4960-5490)
// (Fase 3, modulo 7: movido a src/ui.js, lineas 5491-5557)
const _learnChests214 = VIEWS.learn;
VIEWS.learn = function (v) {
  _learnChests214(v);
  const path = $('#path', v) || $('.level-picker-card', v);
  const chestHTML = renderDailyChestsAndQuests();
  if (path) path.insertAdjacentHTML('beforebegin', chestHTML);
  else v.insertAdjacentHTML('afterbegin', chestHTML);

  const bChest = $('#btnClaimChest', v);
  if (bChest) {
    bChest.onclick = () => {
      const k = dayKey();
      if (S.chests && S.chests.dailyClaimed === k) return;
      S.chests = S.chests || {};
      S.chests.dailyClaimed = k;
      addCoins(45, '¡Cofre diario de recompensas!');
      addXP(15);
      beep('done');
      confetti();
      render();
    };
  }

  $$('[data-claim-q]', v).forEach(btn => {
    btn.onclick = () => {
      const q = btn.dataset.claimQ;
      const k = dayKey();
      S.quests = S.quests || {};
      const qKey = k + '_' + q;
      if (S.quests[qKey]) return;
      S.quests[qKey] = 1;
      const coinAmt = q === 'q2' ? 30 : 20;
      addCoins(coinAmt, 'Reto cumplido');
      addXP(10);
      beep('ok');
      confetti();
      render();
    };
  });
};

// 8. BOTÓN Y VERIFICACIÓN MANUAL DE ACTUALIZACIONES
// (Fase 3, modulo 7: movido a src/ui.js, lineas 5600-5691)
// (Fase 3, modulo 7: movido a src/ui.js, lineas 5692-5768)
const _settings212 = VIEWS.settings;
VIEWS.settings = function (v) {
  _settings212(v);
  const dataCard = $('#reset', v)?.closest('.card');
  const updHtml = `<div class="card" id="updCard" style="margin-top:14px">
    <div class="row between">
      <div>
        <h3 style="margin:0 0 2px">🔄 Actualizaciones</h3>
        <div class="small muted">Versión instalada: <b>v${APP_VERSION}</b></div>
      </div>
      <button class="btn blue sm" id="btnCheckUpdate">🔄 Buscar actualizaciones</button>
    </div>
    <div class="small muted" style="margin-top:6px" id="updStatus">Toca para comprobar si hay una nueva versión disponible e instalarla de inmediato.</div>
  </div>`;

  const offHtml = `<div class="card offline-card" id="offlineCard" style="margin-top:14px">
    <div class="row between">
      <div>
        <h3 style="margin:0 0 2px">📦 Modo Offline y Almacenamiento</h3>
        <div class="small muted">Base de datos local <b>IndexedDB (TukiDB)</b></div>
      </div>
      <span class="pill ok" id="offlineBadge">⚡ Listo Offline</span>
    </div>
    <div class="offline-kpis">
      <div class="offline-kpi"><span class="val" id="offKpiTc">—</span><span class="lbl">Frases offline</span></div>
      <div class="offline-kpi"><span class="val" id="offKpiAudio">—</span><span class="lbl">Audios en caché</span></div>
      <div class="offline-kpi"><span class="val" id="offKpiWords">—</span><span class="lbl">Palabras guardadas</span></div>
    </div>
    <div class="offline-progress-bar" id="offlineBar"><div class="offline-progress-fill" id="offlineFill"></div></div>
    <div class="small muted" style="margin:6px 0 10px" id="offlineStatus">Estudia sin gastar datos y sin conexión a internet (avión, metro, zonas rurales).</div>
    <div class="row" style="gap:8px;flex-wrap:wrap">
      <button class="btn blue sm" id="btnOfflinePreload">📥 Sincronizar y precargar modo sin conexión</button>
      <button class="btn ghost sm" id="btnOfflineClear">🧹 Liberar audios</button>
    </div>
  </div>`;

  if (dataCard) {
    dataCard.insertAdjacentHTML('beforebegin', offHtml);
    dataCard.insertAdjacentHTML('beforebegin', updHtml);
  } else {
    v.insertAdjacentHTML('beforeend', offHtml);
    v.insertAdjacentHTML('beforeend', updHtml);
  }

  const bUpd = $('#btnCheckUpdate', v);
  if (bUpd) bUpd.onclick = () => checkForAppUpdates(bUpd);

  const bOffPreload = $('#btnOfflinePreload', v);
  if (bOffPreload) bOffPreload.onclick = () => runOfflinePreload(bOffPreload);

  const bOffClear = $('#btnOfflineClear', v);
  if (bOffClear) bOffClear.onclick = () => clearOfflineAudio(bOffClear);

  updateOfflineCardStats();
};


/* =================== INICIO =================== */
applyPrefs(); save(); render(); netBanner(); initTukiSleepWatch(); initTukiAnimPause();
if (S.placement == null && !Object.keys(S.done).length && !S.xp) setTimeout(placementIntro, 300);
setInterval(() => { const h = S.hearts; refreshHearts(); if (h !== S.hearts && !L) render(); checkReminder(); }, 60e3);
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', e => {
    if (e.data && e.data.type === 'GOTO_PRACTICE') go('practice');
  });
}
TukiDB.migrateFromLocalStorage(CACHE_KEYS).then(() => {
  TukiDB.getAll('tc').then(items => {
    if (Array.isArray(items) && items.length) {
      const known = new Set(TC_BANK.map(x => x.id).concat((S.tc.ai || []).map(x => x.id)));
      TUKI_OFFLINE_TC = items.filter(x => x && x.id && !known.has(x.id));
    }
  }).catch(() => {});
  TukiDB.get('kv', 'offline_pack_synced_at').then(synced => {
    if (!synced) {
      TukiDB.preloadOfflinePack(TC_BANK, SHADOW_BANK).catch(() => {});
    }
  }).catch(() => {});
}).catch(() => {});

/* =================== v2.21.0 ESCENARIOS DE ROLEPLAY DEL USUARIO (P4) =================== */
// (ver src/chat.js: customScenarios/addCustomScenario/removeCustomScenario)
function ensure29() { registerCustomScenarios(); if (CHAT.scen && String(CHAT.scen).startsWith('custom:') && !SCENARIOS[CHAT.scen]) CHAT.scen = 'free'; }
ensure29();
const _render29 = render; render = function () { ensure29(); _render29(); };

/* =================== v2.22.0 DIFICULTAD ADAPTATIVA (P5) =================== */
// 1 slot del Plan de hoy viene del Top 2 (práctica estática de errores,
// sin llamada de IA) cuando hay errores recientes medidos. Se cambia el
// 9.º slot para no tocar el 10.º, que el wrapper v2.5 reserva a TC.
const _buildPlan30 = buildPlan;
buildPlan = function () {
  const plan = _buildPlan30();
  if (!plan.length || !practiceErrorsHasData()) return plan;
  const keyOf = e => e.text || (e.pair ? 'pair:' + e.pair.join('/') : e.kind);
  const cands = buildTopErrorsPractice();
  // Primer ítem del Top 2 que aún no esté en el plan; si todos lo están,
  // igual se usa el primero: el slot viene del Top 2 aunque se repita un par.
  const top = cands.find(e => e && !plan.some(p => keyOf(p) === keyOf(e))) || cands[0];
  if (!top) return plan;
  const slot = { ...top, fromTop2: true };
  if (plan.length >= 10) plan.splice(8, 1, slot); else plan.push(slot);
  return plan.slice(0, 10);
};
const _planCard30 = planCardHTML;
planCardHTML = function () { const base = _planCard30(); if (!practiceErrorsHasData()) return base; return base.replace('</div>\n    <button class="btn orange', '<span class="plan-step">🎯 Tus errores</span></div>\n    <button class="btn orange'); };

window.TUKI = { get S() { return S; }, TV, TV_AZ, TV_SAMPLE, tvRows, tvPlay, tvStop, tvSelect, tvDeviceVoices, ttsEngineFor, azVoiceFor, cloudTTSBlob, cloudSettings, get L() { return L; }, get R() { return R; }, get LIVE() { return LIVE; }, get CHAT() { return CHAT; }, LESSONS, COURSE, scoreSpeech, scorePair, typedMatch, normText, onSpeechResult, go, startLesson, finishLesson, buildPractice, buildPlan, azureToResult, azureAssess, errES, pitchTrack, contourDir, startLive, stopLive, chatSend, Player, LEVELS, chatLevel, tutorLang, TUTOR_LANGS, tutorSpeed, TUTOR_SPEEDS, speedRules, openWordPop, dictLookup, parseTutor: t => parseTutor(t), tutorSpeechParts, pickEsVoice, liveSystem: () => liveSystem(), chatSystem: () => chatSystem(), liveAppend, liveTurnDone, endConversation, summarizeConvo, summaryHTML, openSummarySheet, interviewHTML, openInterviewSheet, hardWords, startHardDrill, interviewSetup, challengeSetup, todayTopic, TOPICS, decodeState, mergeStates, aiJSON, chStreak, TC_BANK, TC_CTX, TC_VOICE: V, PD_LISTEN, PD_SPEAK, PD_MIXED, FB, FB_CFG, fbLoad, cloudSync, cloudFirstSync, cloudPush, fbSignOut, sanitizeState, sanitizeSettings, kdf, newKS, sealKeys, openKeys, ksFromPhrase, unlockKeys, createPhrase, changePhrase, forgetPhrase, setLocalLock, phraseStrength, KS, get LOCKED() { return LOCKED; }, KDF_ITER, packProgress, exportState, authErr, pdPick, pdItems, startPD, pdStreak, pdKeywordEval, pdEvaluate, pdGenSpeak, pdGenData, pdGenHasData, pdGenAvailable, pdGenValidate, pdGenCacheGet, pdGenCacheSet, PD_GEN_CACHE_KEY, ensure27, pdCardHTML, dayKey, tcExtract, tcExtractAll, tcCanVoice, tcVoiceResult: (a, az) => tcVoiceResult(L.cur, a, az), decodeEnt, decodeDeep, tapWords, quoteTap, aiQuick, AIQ, errorTutorAvailable, explainError, practiceErrorsData, practiceErrorsHasData, practiceErrorsAIAvailable, generatePracticeErrors, validatePracticeErrors, practiceErrorsToQueue, startPracticeErrors, PRACTICE_ERRORS_CACHE_KEY, weekKey, weeklyReviewData, weeklyReviewEligible, weeklyReviewAvailable, weeklyReviewValidate, weeklyReviewCacheGet, weeklyReviewCacheSet, generateWeeklyReview, WEEKLY_REVIEW_CACHE_KEY, chatProfileText, clearChatProfile, chatCompactAvailable, compactChatHistory, maybeCompactChat, CHAT_COMPACT_AT, CHAT_COMPACT_KEEP, CHAT_COMPACT_TAKE, runPendingSummary, sumPendingAdd, startTC, tcEval, tcEx, tcPick, tcGenerate, tcValidate, tcSetup, tcMasteredCount, tcById, ensure25, gemShared, azShared, azureReady, aiModeText, aiQuotaText, recordAiQuota, aiQuotaToday, aiQuotaLow, AZT, tukiApi, azAuth, TUKI_API, srsStats, openShadowingModal, openMouthSelector, openPhotoPractice, openHandsFreeModal, openMissionsModal, HANDS_FREE_BANK, canvasConfetti, MISSION_SCENARIOS, SHADOW_BANK, checkForAppUpdates, countUpAll, phonemeHintHTML, renderTukiSVG, openTukiShopModal, interactWithTuki, triggerTukiAnimation, tukiMood, getTukiMood, tukiMoodReduced, initTukiSleepWatch, initTukiAnimPause, makeMascotClickable, tukiSleepBusy, spawnTukiParticles, speakTukiEs, tukiChirp, tukiFanfare, tukiTrophyFanfare, victoryConfetti, speakSnail, openTravelGuideModal, openInterviewSimulatorModal, TUKI_SHOP_ITEMS, addCoins, getTop5Errors, buildTopErrorsPractice, sendTukiNotification, TukiDB, updateOfflineCardStats, runOfflinePreload, customScenarios, addCustomScenario, removeCustomScenario, sanitizeScenario, registerCustomScenarios, ensure29, levelSuggestion, levelSuggestionRaw, applyLevelSuggestion, levelSuggestHTML, bindLevelSuggest, markLevelSuggestShown, tcHardWords, tcWordsInItems, tcExtraHint, tcFailsTotal, placementFreeAvailable, placementFreeValidate, placementFreeAnalyze, placementFreeFinish, placementFreeSave, placementFreeWeak, placementFreeHTML, bindPlacementFree, buildPlacement, placementFinish, setL, photoSharedAvailable, photoAnalyzeShared, resizePhoto, LIVE_REC, liveRecReset, liveRecStart, liveRecPush, liveRecTurnStart, liveRecTurnEnd, liveRecTrim, liveRecPickTurns, livePronWeak, livePronWeakWords, livePronEvaluate, livePronMaybeEvaluate, livePronSheetUpdate, get tcLastPersonalized() { return TC_LAST_PERSONALIZED; }, version: APP_VERSION };
