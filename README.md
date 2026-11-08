# Tuki Speak – Pronunciación y conversación en inglés (gratis) · v2.35.0

App web estática construida con Vite (`index.html`, `src/main.js`, `src/styles/app.css`, `public/`). El build usa rutas relativas para funcionar tanto en la raíz de Vercel como bajo `/tuki-speak/` en GitHub Pages.
Sin backend propio salvo una API mínima en Vercel para las claves compartidas (v2.10); la cuenta opcional usa Firebase en el plan gratuito Spark. Todo funciona gratis y sin claves; los servicios de pago son **opcionales** y las claves se guardan **solo en tu navegador** (`localStorage`), nunca en la exportación de progreso.

Publicada en: https://jrlopez6542-star.github.io/tuki-speak/ y https://tuki-speak.vercel.app (misma app estática, rutas relativas).

## Novedades v2.35.0
- **💬 Barra del chat premium (base)**: el campo de mensaje es ahora una píldora con sombra suave al enfocar; el botón de enviar solo se activa cuando hay texto y responde con resorte al tocarlo; el micrófono pulsa mientras graba; el campo crece solo al escribir (tope 120 px) y todo respeta el movimiento reducido. Sin cambios en el envío, el dictado, la IA ni el progreso.

## Novedades v2.34.0
- **🎨 Paleta refinada con contraste AA**: el verde sigue siendo el primario y no hay rediseño; los botones (principal, azul, naranja, rojo), los gradientes con texto blanco (en vivo, plan, micrófono de TC) y las etiquetas de las tarjetas de fin de lección usan ahora las variantes oscuras de cada acento, que pasan AA 4,5:1; los textos naranja, azul y rojo sobre fondo claro (stats, enlaces, errores, aciertos, placeholders) también suben a AA, y el modo oscuro gana sus tonos claros equivalentes (marca, tabs, enlaces, mensajes de error/éxito, stats). Los 17 colores de unidad se oscurecen en el mismo tono para que el título y la descripción del encabezado pasen AA con texto blanco. Medido con script WCAG: 132 pares reales, 0 por debajo de AA (antes 62 de 122). Sin cambios de estructura, textos ni comportamiento.

## Novedades v2.33.0
- **📝 Resumen, Estudio y Prueba de nivel menos cargados**: al final del resumen de conversación queda un solo botón — «🎯 Practicar mis errores» cuando hay errores medidos y proveedor (reutiliza la cola generada del día), y «🎤 Practicar ahora» en caso contrario —; cada palabra mal escuchada lleva un solo botón 🔊 (sin el 🐢). En Estudio, el selector de opciones pasa a ser un buscador con autocompletado sobre las mismas frases del curso. La tarjeta de Prueba de nivel ya desaparecía de Aprender una vez hecha (la entrada permanente sigue en Ajustes → 🎯 Aprendizaje → «Hacer ahora»). Sin cambios en la generación de ejercicios, el XP ni la lógica de errores.

## Novedades v2.32.0
- **📚 Aprender y Progreso menos cargados**: en Aprender, el dúo Reto diario/Entrevista queda solo con la entrevista (el reto ya está en «Retos de Hoy»): el dúo pasa de 2 tarjetas a 1, sin cambiar el número de bloques antes del camino (10 con datos, techo R10: 10 ✔); en Progreso, las 3 vistas de fonemas («Puntaje por sonido», «Sonidos más débiles» y «Fonemas más débiles (Azure)») se fusionan en una sola sección «🔊 Sonidos», con los chips de fonemas como resumen arriba, los sonidos débiles con su botón Practicar, y las 50 barras agrupadas por unidad bajo un desplegable; y las 24 insignias quedan plegadas bajo un desplegable. Sin cambios en puntajes, prácticas ni insignias. Progreso pasa de 11 a 9 tarjetas con datos (techo R10: 10 ✔).

## Novedades v2.31.0
- **⚙️ Ajustes menos cargados**: un solo botón «Continuar con Google» en Ajustes, en la tarjeta 👤 Cuenta; los de «Voz de Tuki» y «Conversación con IA» pasan a ser un enlace «Usar la IA gratis →» que desplaza hasta Cuenta. «💬 Enviar comentarios» deja de ser la 2ª tarjeta y pasa al pie, junto al pie de versión. «🗣️ Voz de Tuki» queda plegada por defecto (sus 14 botones «▶ Escuchar» ya no ocupan pantalla al abrir Ajustes). Los párrafos largos de Azure, OpenAI y Frase de seguridad se recortan a 1 línea con el detalle bajo «¿Por qué?». Sin cambios de lógica: iniciar sesión, las claves y las voces funcionan igual. ⚠️ Ajustes sigue en 14 tarjetas (techo R10: 12); llegar a 12 exigiría fusionar tarjetas de mantenimiento, fuera del alcance de estos ítems.

## Novedades v2.30.0
- **🎤 Práctica menos cargada**: en Práctica, los dos Shadowing se fusionan en uno solo («Modo Shadowing», mismo desbloqueo de 6 lecciones); y las entradas de errores se agrupan en una sola tarjeta «🎯 Tus errores» con 2 acciones: «Repasar mis errores» (práctica estática de siempre) y «✨ Practicar con IA» (ejercicios generados con tus errores medidos, solo cuando hay datos y proveedor). «Mis palabras difíciles» sigue con su lista desplegable y «De tus conversaciones» queda dentro de la misma tarjeta. El botón «Entrenar mis 5 puntos débiles» de Progreso no se mueve. Sin cambios en el progreso, el XP ni la lógica de errores.

## Novedades v2.29.0
- **🎙️ Pronunciación medida en vivo (opt-in)**: nuevo ajuste «Medir mi pronunciación en vivo» (apagado por defecto) en Ajustes → Evaluación avanzada con Azure. Solo en voz en vivo con Gemini: al cerrar la sesión, Azure evalúa tus 2–3 turnos más largos con tu propia transcripción como referencia y los fonemas débiles alimentan «Practica mis errores» y el Top 2. El audio queda solo en tu dispositivo durante la sesión y se borra al cerrar; a Azure solo llega el fragmento evaluado, con el token vigente (si la sesión supera 10 min se pide otro). El resultado mide consistencia fonémica, no es una nota absoluta. Sin permiso, sin Azure o con OpenAI, la sesión sigue exactamente como hoy.

## Novedades v2.28.0
- **📷 «Analizar con IA» ahora funciona sin clave propia**: la foto se analiza con las claves compartidas de Tuki (1 llamada dentro de tus 60/día, sin contador propio); la foto se redimensiona en tu dispositivo (máx. 1024 px, 2 MB) y solo se sube con tu consentimiento explícito (casilla). La visión cuesta más tokens que el texto, por eso el tamaño y el contador de 60/día son el límite. Sin proveedor, la práctica sigue con el ejemplo genérico etiquetado.

## Novedades v2.27.0
- **🎙️ Prueba de nivel con habla libre (opcional)**: al final de la prueba, si quieres, hablas 1 minuto sobre ti con tu consentimiento explícito: Azure evalúa tus fonemas y Gemini resume tu nivel con más detalle y tus 3 primeros focos. 1 token Azure + 1 llamada Gemini, una sola vez por usuario; el audio no se guarda. El nivel sugerido solo se aplica si tú lo aceptas. Sin proveedor, sin Azure o sin micrófono, la prueba termina exactamente como hoy.

## Novedades v2.26.0
- **💬 Conversaciones largas sin perder el hilo**: al superar 60 mensajes, Tuki resume los 40 primeros en una nota de perfil (errores frecuentes, nivel, temas) y conserva los últimos 20 intactos; 1 llamada por compactación. La nota se puede borrar en Ajustes → 🤖 Conversación con IA.

## Novedades v2.25.0
- **📅 Tu semana con Tuki**: dentro de 🗂️ Historial en Progreso, con al menos 2 resúmenes en la semana, 1 revisión con IA: tu progreso narrado, 3 focos para la próxima semana y 1 frase para practicar. 1 llamada por semana como máximo; si no hay suficientes resúmenes, no se genera nada.

## Novedades v2.24.0
- **🌅 Práctica diaria con tu pregunta**: el paso 2 (Hablar) puede ser 1 pregunta nueva con IA creada desde tus errores de ayer (resumen, palabras difíciles, fonema débil); cacheada por día, 1 llamada como máximo. Sin proveedor, sin cuota o sin errores medidos, la práctica sigue igual con el banco estático.

## Novedades v2.23.0
- **✍️ Traduce y completa con tus errores**: las frases nuevas con IA incluyen tus 3–5 palabras difíciles (verificado: si no aparece ninguna, se anuncia como tanda normal); y al fallar 2 veces el mismo ítem aparece «💡 Otra pista» con tu error concreto. Mismo costo: 1 llamada por tanda de 6.

## Novedades v2.22.0
- **📈 Dificultad adaptativa con sugerencia**: al guardar un resumen, si tu puntaje medio en los últimos 3 resúmenes es ≥85 o ≤50, Tuki te sugiere subir o bajar el nivel del chat — solo cambia si tú lo aceptas, mostrando el dato. Además, 1 slot del Plan de hoy puede ser un ejercicio de tus errores recientes.

## Novedades v2.21.0
- **✏️ Escenarios de roleplay propios**: en el selector de escenario del chat, «✏️ Crear escenario…» guarda hasta 5 situaciones tuyas (máx. 120 caracteres, p. ej. «en el médico explicando síntomas») que Tuki usa como roleplay en texto y en voz en vivo, sin llamadas extra.

## Novedades v2.20.0
- **📚 3 unidades nuevas (17 en total, 50 lecciones)**: Inglés para el trabajo (emails, reuniones, presentaciones), Inglés de series y películas (slang, series sin subtítulos, expresiones famosas) y Sonidos que faltan (R americana, L oscura, NG final), al final del mismo camino.
- **🤖 IA de Tuki en tus errores**: botón «¿Por qué me equivoqué?» en el feedback de ejercicio fallido (1 llamada por toque, solo si lo pides); «🎯 Practica mis errores» crea 6–8 ejercicios nuevos desde tus errores medidos (máx. 1 llamada de IA al día); y al terminar una conversación el resumen trae «🎧 Pronunciación en vivo» con las palabras que el reconocedor entendió mal, sin llamadas extra.
- **📷 Práctica con foto honesta y cuota visible**: el ejemplo sin clave de Gemini ya se etiqueta como ejemplo genérico, no como objetos detectados; y Ajustes muestra «IA de Tuki: X/60 llamadas hoy» con aviso cuando quedan 5 o menos.
- **Regla de versiones**: cada cambio grande sube la versión (minor para funciones y contenido, patch para arreglos); `npm run check:version` lo verifica en 5 lugares.

## Novedades v2.13.0
- **🎙️ Voz de alta fidelidad (Azure Neural) predeterminada en práctica**: Ahora todos los ejercicios de práctica (pares mínimos, shadowing, lecciones, repaso SRS, tarjetas) utilizan automáticamente las voces neurales de Azure (`en-US-JennyNeural` para inglés y `es-CO-SalomeNeural` para explicaciones en español) de forma predeterminada cuando inicias sesión con tu cuenta de Tuki. Si estás sin conexión o sin sesión, Tuki recurre automáticamente a las mejores voces del dispositivo sin interrumpir tu práctica.
- **⚡ Acceso rápido a IA y Voces de Estudio**: Tarjeta de bienvenida y botón directo de «Continuar con Google» en el chat de IA y en la configuración de «Voz de Tuki» para activar al instante la IA y las voces neurales gratuitas sin tener que configurar claves manuales.
- **🔄 Service Worker v19**: Actualización del sistema de caché offline PWA a `tuki-speak-v19` con detección y activación automática del banner de actualización para todos los usuarios.

## Novedades v2.12.0
- **🧠 Repetición Espaciada Inteligente (SRS / SM-2)**: Las palabras difíciles detectadas en lecciones o conversaciones se sincronizan automáticamente con el mazo de tarjetas (`S.deck`). Ahora en **Tarjetas** y en **Práctica** puedes ver cuántas tarjetas vencen hoy según el algoritmo SM-2, filtrar por estado («⏰ Para hoy», «🌱 Aprendiendo», «🏆 Dominadas») y repasar en el intervalo óptimo antes de olvidar.
- **🎯 Misiones de Conversación por Escenarios de la Vida Real**: Nuevos escenarios conversacionales estructurados con metas concretas:
  - ☕ **Pedir en cafetería** (Barista en Londres: pedir café con leche vegetal, azúcar/hielo, precio y pagar con tarjeta).
  - 🏨 **Check-in en el hotel** (Recepción en Miami: dar nombre y pasaporte, pedir piso alto/tranquilo, hora de desayuno y Wi-Fi).
  - 🛂 **Inmigración en el aeropuerto** (Oficial en JFK: motivo del viaje, duración de estancia, hospedaje).
  - 🗺️ **Pedir direcciones** (Peatón en Chicago: preguntar por la estación, si es caminable y despedirse cordialmente).
  Cada escenario muestra un checklist interactivo arriba del chat para que verifiques tus metas y ganes +15 XP al cumplirlas todas.
- **🎙️ Modo Shadowing (Escucha, Imita y Graba)**: Nueva herramienta en **Práctica** para dominar el habla conectada y el ritmo natural en inglés (A1 a B2). Escucha frases de ejemplo a velocidad normal o lenta (0.75x) con etiquetas fonéticas visuales de enlace ("How's it", "going to → gonna", "slipped my mind"), graba tu intento al instante y recibe puntaje de similitud y entonación.
- **👄 Guía Fonética y Bocas Anatómicas**: Diagramas SVG animados interactivos para corregir la posición de la lengua, labios y dientes en los sonidos más difíciles para hispanohablantes: /θ/ y /ð/ (think/this), /v/ vs /b/, la "R" inglesa /ɹ/, la "L" /l/, y /ʃ/ vs /tʃ/.
- **📷 Práctica Multimodal («Describe la Foto / Objeto»)**: Sube o toma una foto con tu cámara para que Tuki analice los objetos de tu entorno, enseñe 5 palabras de vocabulario clave y proponga una pregunta conversacional en inglés para responder.
- **✨ Micro-interacciones y Efectos Positivos**: Nuevos tonos sintetizados de alta fidelidad con `AudioContext` (`fanfare`, `streak`, `pop`) y animación de confetti dinámico en canvas para celebrar rachas y misiones sin dependencias externas.
- **Service Worker**: Actualizado a `tuki-speak-v18` para actualización automática limpia de caché PWA.

## Novedades v2.11.0
- **💬 Enviar comentarios** (Ajustes, debajo de Cuenta): 1 a 5 estrellas y un texto de hasta 1000 caracteres. Solo con sesión iniciada; como máximo un comentario cada 10 minutos. Se guarda en `feedback/{id}` (uid, correo, nombre, estrellas, texto, versión y fecha del servidor). Nadie puede leer, editar ni borrar comentarios ajenos.
- **👑 Panel de administrador** (Ajustes): solo aparece para el dueño (jrlopez6542@gmail.com con correo verificado) y **las reglas de Firestore imponen el acceso**, no solo la interfaz. Muestra: totales (usuarios, activos hoy, calificación promedio); usuarios registrados (nombre, correo, método, primer ingreso, última actividad y versión); uso de las claves de Tuki por usuario (Gemini · Live · Azure, hoy y últimos 7 días, con totales; «claves propias» si usa sus claves), leído directamente de `quota/*`; y los comentarios, del más nuevo al más viejo.
- **Perfiles** (`profiles/{uid}`): al iniciar sesión (y al abrir la app, así las cuentas existentes se registran solas) la app guarda nombre, correo, método, versión y si usa claves propias; la última actividad se actualiza como máximo una vez por hora. En Cuenta se avisa: «Al iniciar sesión, tu nombre, correo y uso se guardan para mejorar la app.»
- **Cambio en `firestore.rules`** (hay que publicarlo en la consola de Firebase): `profiles` (cada quien crea/actualiza solo el suyo; solo el dueño lee), `feedback` (crear con el uid propio y campos validados; solo el dueño lee y borra) y `quota` (ahora el dueño puede leer). Mientras no se publiquen, la app sigue funcionando y muestra un mensaje amable.

## Novedades v2.10.1
- Se quitó de Ajustes toda la tarjeta **«📲 Progreso en varios dispositivos»**: el código QR para pasar el progreso (mostrar/escanear, enlace `#import=` y pegar código) y la **sincronización automática con un Gist de GitHub**, con todo su código (incluida la librería de QR). Para usar Tuki en varios dispositivos inicia sesión en **Cuenta** (Google o correo): la sincronización con Firebase lo hace sola.
- El token de GitHub que hubieras guardado se **borra al abrir la app** (ya no se usa). El progreso no se toca, y **Exportar / Importar archivo** (💾 Datos) sigue igual.
- La CSP ya no permite `api.github.com` ni `gist.githubusercontent.com`, y `Permissions-Policy` ya no permite la cámara (solo la usaba el escáner de QR).

## Novedades v2.10.0 «claves compartidas»
- Si **iniciaste sesión** (con Google o con correo verificado) y **no pusiste tus propias claves**, la IA usa automáticamente las claves de Gemini y Azure del dueño de la app a través de una API mínima en Vercel (`/api/gemini`, `/api/azure-token`, `/api/live-token`). **Las claves nunca llegan al navegador**: Gemini texto va por el proxy (modelos y forma de la petición en lista blanca, tamaño limitado, misma cadena de respaldo de modelos), Azure usa un token de 10 minutos (`Authorization: Bearer`) y Gemini Live usa un **token efímero** oficial de un solo uso. Si pones tus claves, se usan como antes. Sin sesión verás «Inicia sesión para usar la IA de Tuki». En Ajustes, una línea indica el modo: «Usando tus claves» o «Usando las claves de Tuki · límite diario».
- **La cuota es compartida**: todos usan el plan gratuito del dueño (Google AI Studio y Azure F0), así que hay un **límite diario por persona** (60 solicitudes de Gemini, 20 sesiones de voz en vivo y 100 tokens de Azure; se reinicia a medianoche de Colombia). Al llegar al límite: «Llegaste al límite gratis de hoy. Vuelve mañana o pon tu propia clave en Ajustes.»
- La API verifica el token de Firebase en el servidor (firma, `aud`, `iss`, `exp`), acepta solo los orígenes de la app y guarda los contadores en Firestore (`quota/*`), que solo puede escribir la cuenta del servidor (cambio en `firestore.rules`).
- **Vercel Hobby es solo para uso personal, no comercial.** Todo sigue siendo gratis (Vercel Hobby + Firebase Spark, sin tarjeta).

## Novedades v2.9.1
- Se quitó la sección **«Uso del plan gratis»** de Ajustes (tablas de Vercel Hobby y Firebase Spark, contadores locales de lecturas/escrituras y botones «Ver uso en Vercel/Firebase»), junto con su código. La sincronización sigue igual y no se borra ningún dato guardado.

## Novedades v2.9.0
- 🗣️ **Voz de Tuki** (Ajustes, justo debajo de «Voz y audio»): eliges la voz de Tuki por idioma (pestañas **Español (explicaciones)** e **Inglés (frases)**), con **▶ Escuchar** en cada voz. El ejemplo en español es «Hola, soy Tuki. Vamos a practicar inglés juntos, paso a paso.» y en inglés «Hi, I'm Tuki. Let's practice English together, step by step.». Respeta la **Velocidad de Tuki** (por defecto «Lenta»). Solo suena un ejemplo a la vez; el botón cambia a «⏹ Detener».
  - **Voces Azure (gratis con tu clave)**: voces neurales *Standard* verificadas en la [documentación oficial de Microsoft](https://learn.microsoft.com/azure/ai-services/speech-service/language-support?tabs=tts) (27 sep 2026). Español, mujeres primero: `es-CO-SalomeNeural` (**Recomendada · colombiana**), `es-MX-DaliaNeural`, `es-US-PalomaNeural`, `es-AR-ElenaNeural`, `es-VE-PaolaNeural`, `es-PE-CamilaNeural`, `es-CL-CatalinaNeural`, `es-EC-AndreaNeural`; hombres: `es-CO-GonzaloNeural`, `es-MX-JorgeNeural`, `es-US-AlonsoNeural`, `es-AR-TomasNeural`, `es-VE-SebastianNeural`, `es-PE-AlexNeural`, `es-CL-LorenzoNeural`. Inglés: `en-US-JennyNeural`, `en-US-AriaNeural`, `en-US-AvaNeural`, `en-US-EmmaNeural`, `en-US-GuyNeural`, `en-US-AndrewNeural`, `en-US-BrianNeural`. Sin clave y región aparecen desactivadas con un aviso y el botón «Ir a la clave». Con clave, la app consulta una vez por sesión `https://{región}.tts.speech.microsoft.com/cognitiveservices/voices/list` y oculta las que tu región no tenga (si falla, usa la lista oficial).
  - **Voces de tu teléfono (gratis, sin clave)**: las de `speechSynthesis.getVoices()` (se actualiza con `voiceschanged`), solo `es-*` o `en-*` según la pestaña, con es-CO, es-MX, es-US y es-419 primero.
  - La voz elegida es la **predeterminada en toda la app** (chat, Traduce y completa, Práctica diaria, lecciones y repetición lenta), aunque «Voz del modelo» diga Dispositivo. Si la voz del teléfono no existe en otro dispositivo, o no hay clave de Azure, o Azure falla (clave mala, sin red, cuota), Tuki usa la mejor voz del teléfono y muestra un mensaje en español. «Automática» conserva el comportamiento anterior. Si cambias «Voz del modelo», «Voz del dispositivo» o «Voz Azure», la voz inglesa de Tuki vuelve a Automática.
  - Se guarda en los ajustes (`tukiVoiceEs`, `tukiVoiceEn`: `az:<voz>` · `dev:<nombre>` · vacío) y se sincroniza en `users/{uid}/data/settings` (sin campos de clave). Los nombres se validan antes de ir al SSML.
  - **Gratis**: el plan **F0** de Azure Speech incluye **0,5 millones de caracteres de voz neural al mes** ([precios de Microsoft](https://azure.microsoft.com/pricing/details/cognitive-services/speech-services/), verificado el 27 sep 2026). Cada ejemplo se guarda en memoria por voz + velocidad + texto, así que repetirlo no gasta más. No se usan voces de pago (ni xAI ni voces HD).

## Novedades v2.8.0
- **Cuenta (opcional)** en Ajustes: Google (ventana emergente, con redirección en móvil), correo y contraseña, «Olvidé mi contraseña», verificación de correo y cierre de sesión (con opción «Borrar datos de este dispositivo»). Mensajes de error en español.
- **Sincronización en la nube** con Firebase **Spark** (gratis): Auth + Cloud Firestore *lite* (sin listeners en tiempo real). El SDK se carga desde gstatic solo al abrir la cuenta o si ya iniciaste sesión; sin él la app funciona igual y sin conexión.
  - Documentos: `users/{uid}` (meta + `keysEnc`), `users/{uid}/data/progress` (progreso comprimido, `TK1` = deflate + base64url) y `users/{uid}/data/settings` (ajustes sin claves).
  - Primer inicio: sube lo local o lo **combina** (misma fusión sin pérdidas de «Combinar»). En otro dispositivo: descarga y combina. Si los datos locales son de **otra cuenta**, pregunta antes de mezclar.
  - Escrituras con retardo: como máximo una cada 45 s mientras usas la app, más al ocultar la pestaña y con «Sincronizar ahora».
- **Claves de API cifradas** (Gemini, Azure clave + región, OpenAI) con una **frase de seguridad** (mín. 10 caracteres): PBKDF2-SHA256 con 310.000 iteraciones y sal aleatoria de 16 bytes → AES-GCM 256 con IV aleatorio de 12 bytes. En la nube solo se guarda `{v, alg, salt, iv, ct, iter}`. La frase nunca se guarda ni se envía. Opciones: cambiar frase (re-cifra), olvidé mi frase (borra `keysEnc`) y «Bloquear claves con la frase en este dispositivo» (solo guarda la versión cifrada localmente; pide la frase una vez por sesión).
- **Validación de datos** importados (nube, QR, Gist, archivo y enlace `#import=`): esquema, tipos, límites de tamaño y bloqueo de `__proto__`/`constructor`/`prototype`. Las claves nunca van en QR, Gist ni registros.
- **Cabeceras de seguridad**: `vercel.json` con CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options: DENY` / `frame-ancestors 'none'`, `Cross-Origin-Opener-Policy: same-origin-allow-popups` y HSTS. En GitHub Pages va la misma CSP como `<meta>` (sin `frame-ancestors`, que no funciona en meta). Los scripts en línea van con hash SHA-256; `style-src` necesita `'unsafe-inline'` (hay muchos atributos `style`). **Después de cambiar `index.html` ejecuta `python3 tools/build_csp.py`** para recalcular los hashes.
- **Reglas de Firestore** en `firestore.rules` (cada usuario solo su documento, sin consultas de lista, campos/tipos/tamaños validados), más `firebase.json` y `firestore.indexes.json`. Se publican en la consola de Firebase (Firestore → Reglas). Pruebas con el emulador: `npx firebase emulators:exec --only firestore "node tests/rules.test.mjs"` (requiere Java, `firebase-tools`, `firebase` y `@firebase/rules-unit-testing`).
- ~~Uso del plan gratis~~ (quitado en v2.9.1).

## Qué incluye
- **17 unidades / 50 lecciones**: vocales, consonantes, TH, finales, terminaciones, entonación, conversaciones reales, habla conectada (linking, reducciones, flap-t), números/fechas/horas, phrasal verbs, falsos amigos, small talk y entrevista avanzada, inglés para el trabajo, inglés de series y películas, y sonidos que faltan (R americana, L oscura, NG final).
- **Prueba de nivel** al primer uso (10 preguntas con oído y voz, se puede saltar o repetir en Ajustes).
- **Plan de hoy** (~10 min): sonidos débiles + tarjetas pendientes + pares mínimos + una frase de «Traduce y completa».
- ✍️ **Traduce y completa** (nuevo en v2.5, en Aprender y Práctica): lees una frase en español con la parte clave en **verde** y escribes el inglés en huecos azules dentro de la frase, que crecen mientras escribes.
  - **Banco sin conexión de 155 frases** (Básico 35 · Intermedio 45 · Intermedio alto 43 · Avanzado 32): expresiones informales, phrasal verbs, falsos amigos (actually, embarrassed, assist, library, realize…), preposiciones, errores típicos (make/do, say/tell, since/for, «I have 20 years») y frases del día a día. Cada frase trae su contexto (p. ej. «Contexto: en el trabajo»).
  - **Retroalimentación inteligente**: si escribes una respuesta válida pero no la buscada o un error típico, una burbuja coral te explica en español por qué (p. ej. «"Crazy" es válido, pero piensa en algo más informal.»). Detecta errores de ortografía pequeños. Con una clave de IA, las respuestas desconocidas se evalúan con Gemini/OpenAI (correcta / válida pero distinta / incorrecta); sin clave, recibes una pista.
  - Tuki lee la burbuja en voz alta en español (Azure `es-CO-SalomeNeural` si está configurado; si no, la voz del dispositivo) y se puede silenciar. Hay 🔊 y 🐢 para la frase en inglés y 🎤 para decirla.
  - Pistas: la primera muestra una ayuda y la segunda la primera letra (+5 XP en vez de +10). «Ver respuesta» no da XP y la frase vuelve más tarde en la ronda.
  - Los errores van a tus tarjetas, sin duplicados y con la frase de ejemplo. Si fallas una frase varias veces, pasa a *Mis palabras difíciles*. Cada frase guarda tu dominio, y las dominadas salen menos. Verás tus estadísticas en Progreso y ganarás 2 insignias nuevas.
  - ✨ **Más frases con IA** (opcional): genera frases nuevas a tu nivel con el mismo formato. Si la IA falla, se usa el banco.
- **Diccionario/Frases** con búsqueda (inglés o español), audio normal/lento, ➕ a tarjetas y 🎙️ practicar.
- Diagramas de boca (SVG), onda y curva de entonación de tu voz vs. el modelo.
- **Conversación con IA**
  - 🎙️ **Voz a voz en vivo (Gemini Live, gratis con límites)**: audio del micrófono → WebSocket `BidiGenerateContent` (PCM 16 kHz) → respuesta en audio (PCM 24 kHz), con transcripción de ambos lados, interrupción (barge-in) y corrección hablada breve. Usa la misma clave gratuita de Gemini.
  - 💳 **OpenAI Realtime (pago)** por WebRTC con tu propia clave (se crea una clave temporal).
  - Modo alternativo: chat de texto/dictado con corrección escrita (Gemini u OpenAI).
  - Nivel A2/B1/B2/C1, idioma del tutor (solo inglés / bilingüe / más español), velocidad de Tuki y palabras tocables con significado.
  - 📝 **Resumen al terminar** (Terminar, Nueva o salir de la pestaña; voz o texto): errores (lo que dijiste → lo correcto + explicación), palabras nuevas, puntajes de fluidez/gramática/vocabulario y 1-2 consejos. Las frases corregidas y palabras nuevas se agregan a tus tarjetas, al **Plan de hoy** y a **Práctica**; el historial queda en **Progreso**. Se puede desactivar en Ajustes.
  - 🧑‍💼 **Simulador de entrevista de trabajo**: cargo/industria, nivel del cargo, tu nivel, 5/8/12 preguntas, por voz o texto. Contador «Pregunta k/N», botón Finalizar e **informe en español** con puntaje, retroalimentación por pregunta, respuestas modelo más fuertes en inglés (🔊/🐢) y errores comunes.
  - ⏱️ **Reto diario de 5 minutos**: tema del día según tu nivel (lista grande, elegido por fecha), temporizador, voz o texto, resumen al final, +20 XP (cuenta para la racha) e insignias de 1, 7 y 30 retos.
- 🎯 **Mis palabras difíciles** (Práctica): palabras con puntaje bajo en lecciones + palabras que la IA detectó mal pronunciadas en conversaciones. Se califican con Azure (fonemas) si está configurado, o con el reconocimiento del navegador.
- 🔄 **Progreso en varios dispositivos**: inicia sesión en **Cuenta** (Ajustes) y se sincroniza con Firebase; también puedes **Exportar / Importar** un archivo (💾 Datos).
- **Evaluación avanzada con Azure** (opcional): puntaje fonema por fonema en IPA, precisión, fluidez, integridad y prosodia, y consejos tipo «en think la /θ/ sonó como /s/».
- Voces naturales opcionales: Azure neural (en-US/en-GB) u OpenAI TTS; si fallan, se usa la voz del dispositivo.
- Insignias, estadísticas semanales, protector de racha, modo oscuro, tamaño de letra, alto contraste, reducir animaciones, vibración.
- Recordatorio diario (notificación local o evento de calendario `.ics`), aviso sin conexión, aviso de nueva versión.

### Novedades v2.7.0: Práctica diaria

- Nueva tarjeta **🌅 Práctica diaria · 3–5 min** arriba en Aprender, justo debajo de la meta diaria. Son 3 ejercicios cortos de nivel A1–A2 que combinan escuchar y hablar, con indicador de progreso 1/3 · 2/3 · 3/3:
  1. **👂 Escuchar:** Tuki lee una frase (🔊 normal, 🐢 lento, puedes repetirla). Eliges su significado o la frase que oíste entre 4 opciones y luego la repites en voz alta. La pronunciación se califica con el reconocimiento de voz, o con Azure si está configurado, y cada palabra se colorea en verde, amarillo o rojo.
  2. **🗣️ Hablar:** Tuki hace una pregunta sencilla ("Where do you live?"). Con 🇪🇸 ves la traducción y la escuchas. Luego respondes en voz alta.
     - Con clave de IA (Gemini u OpenAI): recibes una corrección breve en español y una versión mejorada para escuchar.
     - Sin clave: se revisa que la respuesta tenga palabras clave de la pregunta y una longitud mínima, y ves una respuesta modelo para escuchar y repetir.
  3. **🔀 Mixto:** primero demuestras que entendiste la pregunta (opción rápida) y después la respondes.
- **Contenido:** un banco de 36 frases, 32 preguntas y 32 preguntas mixtas. Rota cada día según la fecha y no repite lo que viste en los últimos 10 días.
- **Recompensas:** completar la rutina da +15 XP (+5 si la repites el mismo día), cuenta para la racha y recupera una vida. La tarjeta muestra ✅ «Vuelve mañana» y un botón Repetir. Hay una insignia 🌅 «Rutina de 7 días».
- **Repaso:** las frases que fallas o pronuncias mal pasan a tus tarjetas y a «Mis palabras difíciles».
- **Sin micrófono:** si no hay reconocimiento de voz, puedes escribir la respuesta.
- **Datos:** respeta la velocidad de Tuki y la voz en español. La migración conserva todos tus datos y la sincronización entre dispositivos fusiona los días hechos.

### Novedades v2.6.0: Traduce y completa por voz
- Nuevo selector **⌨️ Escribir / 🎙️ Hablar** en la hoja de inicio y en la tarjeta. Se guarda en Ajustes, y Hablar viene activado si el navegador tiene reconocimiento de voz.
- **Así funciona Hablar:** Tuki lee la frase en español («¿Sabes cómo se dice esto en inglés? …») con Azure `es-CO-SalomeNeural` o con la voz del dispositivo, a la velocidad Lenta o Muy lenta que elijas. Después escucha solo (en-US).
- Puedes decir la frase completa o solo la palabra que falta; las muletillas (umm, uh, so, entonces…) se ignoran. Los espacios azules se llenan mientras hablas y la respuesta se revisa como en el modo de texto. Tuki te lee la burbuja de ayuda en español y vuelve a escucharte.
- Di **«pista»** para recibir una pista hablada. Con **«repite»** Tuki vuelve a leer la frase, y con **«no sé»** te muestra la respuesta.
- Cuando aciertas, Tuki dice «¡Muy bien! Siguiente.», lee la frase en inglés y pasa sola a la siguiente, así puedes hacer toda la ronda sin tocar la pantalla. Tienes un botón **Pausa** y el micrófono grande para hablar cuando quieras.
- Con Azure configurado verás el puntaje de pronunciación de las palabras de tu respuesta, y las que salgan bajas pasan a *Mis palabras difíciles*.
- Si no hay reconocimiento de voz o niegas el micrófono, la app te avisa en español y cambia a Escribir.

### Novedades v2.5.1
- Corregido: las comillas, apóstrofes y «&» de los mensajes de la IA ya no aparecen como `&quot;`, `&#39;` o `&amp;`. Esto aplica al chat, la voz en vivo, las palabras tocables, Traducir, los resúmenes, los informes y Traduce y completa, y la voz tampoco los lee. Los datos guardados antes se corrigen solos.
- Si Gemini está saturado (503/429 o «high demand»), las llamadas únicas (resumen, traducción, informe, Traduce y completa) reintentan con espera y prueban otros modelos, incluidos los flash-lite, durante unos 25 s como máximo. Mientras tanto se muestra «Gemini está ocupado, probando otro modelo… (2/6)».
- Si el resumen igual falla, verás un mensaje claro en español, un botón **Reintentar** y los «Detalles» técnicos plegados. La conversación queda guardada como **Resumen pendiente** en Progreso → Historial para generarlo después, incluso si cierras la app.

## Desarrollo y publicación
```bash
npm ci
npm run dev
# abre la URL local que muestra Vite (normalmente http://localhost:3000)
```
Para generar el sitio publicable: `npm run build`. Publica el contenido de `dist/` en GitHub Pages o Vercel; no publiques la carpeta fuente como sitio estático sin compilar. Las rutas relativas permiten usar el mismo build en ambos destinos. El micrófono, el reconocimiento de voz, la voz en vivo y el modo offline necesitan `http://localhost` o `https://`.

## Claves opcionales (Ajustes ⚙️)
| Servicio | Para qué | Dónde |
|---|---|---|
| Google Gemini (gratis con límites) | Chat de texto y **voz en vivo** | https://aistudio.google.com/apikey |
| OpenAI (pago) | Chat, voz en vivo Realtime, voz TTS | https://platform.openai.com/api-keys |
| Azure AI Speech (nivel gratuito F0 limitado) | Evaluación por fonemas, voces neurales | Portal de Azure → recurso "Speech" (clave + región) |

⚠️ Sin servidor propio, las claves se usan directamente desde el dispositivo: úsalas solo en tu propio equipo y configura límites de gasto.

## Publicar gratis
GitHub Pages, Netlify, Vercel o Cloudflare Pages: ejecuta `npm run build` y publica el contenido de `dist/`. En GitHub Pages, configura la publicación desde un workflow/artefacto que use `dist/`.

## Instalar en el celular
- **Android (Chrome)**: menú ⋮ → "Instalar app".
- **iPhone (Safari)**: Compartir → "Agregar a inicio". (Sin Azure, el reconocimiento de voz del navegador en iOS es limitado.)

## Límites conocidos
- Sin Azure, el puntaje de pronunciación usa el reconocimiento del navegador (por palabra, no por fonema).
- Los recordatorios del navegador solo se muestran si la app está abierta o en segundo plano; el `.ics` es la opción confiable.
- La sincronización al cerrar la app es de mejor esfuerzo (el navegador puede cortarla); usa «Sincronizar ahora» antes de cambiar de dispositivo.
- Resúmenes, entrevista y reto necesitan una clave de IA (Gemini gratis u OpenAI). «Traduce y completa» funciona sin clave con su banco de frases; la IA solo agrega explicaciones para respuestas que no están en el banco y frases nuevas.
- La curva de entonación del modelo solo se dibuja con voces en la nube (el audio de la voz del dispositivo no se puede capturar).
