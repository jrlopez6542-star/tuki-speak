# Tuki Speak – Pronunciación y conversación en inglés (gratis, sin servidor) · v2.9.0

App web estática (un solo `index.html` con CSS/JS dentro + `manifest.json` + `sw.js` + íconos).
Sin backend propio (la cuenta opcional usa Firebase en el plan gratuito Spark). Todo funciona gratis y sin claves; los servicios de pago son **opcionales** y las claves se guardan **solo en tu navegador** (`localStorage`), nunca en la exportación de progreso.

Publicada en: https://jrlopez6542-star.github.io/tuki-speak/ y https://tuki-speak.vercel.app (misma app estática, rutas relativas).

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
  - Escrituras con retardo: como máximo una cada 45 s mientras usas la app, más al ocultar la pestaña y con «Sincronizar ahora». Contadores de lecturas/escrituras de hoy en «Uso del plan gratis».
- **Claves de API cifradas** (Gemini, Azure clave + región, OpenAI) con una **frase de seguridad** (mín. 10 caracteres): PBKDF2-SHA256 con 310.000 iteraciones y sal aleatoria de 16 bytes → AES-GCM 256 con IV aleatorio de 12 bytes. En la nube solo se guarda `{v, alg, salt, iv, ct, iter}`. La frase nunca se guarda ni se envía. Opciones: cambiar frase (re-cifra), olvidé mi frase (borra `keysEnc`) y «Bloquear claves con la frase en este dispositivo» (solo guarda la versión cifrada localmente; pide la frase una vez por sesión).
- **Validación de datos** importados (nube, QR, Gist, archivo y enlace `#import=`): esquema, tipos, límites de tamaño y bloqueo de `__proto__`/`constructor`/`prototype`. Las claves nunca van en QR, Gist ni registros.
- **Cabeceras de seguridad**: `vercel.json` con CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options: DENY` / `frame-ancestors 'none'`, `Cross-Origin-Opener-Policy: same-origin-allow-popups` y HSTS. En GitHub Pages va la misma CSP como `<meta>` (sin `frame-ancestors`, que no funciona en meta). Los scripts en línea van con hash SHA-256; `style-src` necesita `'unsafe-inline'` (hay muchos atributos `style`). **Después de cambiar `index.html` ejecuta `python3 tools/build_csp.py`** para recalcular los hashes.
- **Reglas de Firestore** en `firestore.rules` (cada usuario solo su documento, sin consultas de lista, campos/tipos/tamaños validados), más `firebase.json` y `firestore.indexes.json`. Se publican en la consola de Firebase (Firestore → Reglas). Pruebas con el emulador: `npx firebase emulators:exec --only firestore "node tests/rules.test.mjs"` (requiere Java, `firebase-tools`, `firebase` y `@firebase/rules-unit-testing`).
- **Uso del plan gratis** en Ajustes: límites de Vercel Hobby (verificados el 27 sep 2026) y de Firebase Spark, con enlaces al uso en Vercel y en Firebase.

## Qué incluye
- **12 unidades / 36 lecciones**: vocales, consonantes, TH, finales, terminaciones, entonación, conversaciones reales, habla conectada (linking, reducciones, flap-t), números/fechas/horas, phrasal verbs, falsos amigos, small talk y entrevista avanzada.
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
- 📲 **Progreso en varios dispositivos** (Ajustes):
  - **Código QR / enlace**: exporta tu progreso comprimido (sin claves de API). Si es grande se muestran varios QR animados. En el otro dispositivo: escanear (cámara con BarcodeDetector) o pegar el enlace/código, y elegir **Combinar** o **Reemplazar**.
  - **Sincronización opcional con GitHub Gist**: pega un token con permiso `gist` (https://github.com/settings/tokens/new?scopes=gist&description=Tuki%20Speak, o fine-grained con «Gists: Read and write»). Se guarda en un gist **secreto** (no privado: quien tenga el enlace exacto podría verlo; no incluye claves). Sincroniza al abrir, al cerrar/cambiar de app y con «Sincronizar ahora», combinando sin perder progreso.
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

## Probar en tu computador
```bash
python3 -m http.server 8000
# abre http://localhost:8000 en Google Chrome
```
El micrófono, el reconocimiento de voz, la voz en vivo y el modo offline necesitan `http://localhost` o `https://`.

## Claves opcionales (Ajustes ⚙️)
| Servicio | Para qué | Dónde |
|---|---|---|
| Google Gemini (gratis con límites) | Chat de texto y **voz en vivo** | https://aistudio.google.com/apikey |
| OpenAI (pago) | Chat, voz en vivo Realtime, voz TTS | https://platform.openai.com/api-keys |
| Azure AI Speech (nivel gratuito F0 limitado) | Evaluación por fonemas, voces neurales | Portal de Azure → recurso "Speech" (clave + región) |
| GitHub token `gist` (gratis, opcional) | Sincronizar progreso entre dispositivos | https://github.com/settings/tokens/new?scopes=gist&description=Tuki%20Speak |

⚠️ Sin servidor propio, las claves se usan directamente desde el dispositivo: úsalas solo en tu propio equipo y configura límites de gasto.

## Publicar gratis
GitHub Pages, Netlify Drop, Vercel o Cloudflare Pages: sube `index.html`, `manifest.json`, `sw.js`, `icon.svg`, `icon-192.png`, `icon-512.png`.

## Instalar en el celular
- **Android (Chrome)**: menú ⋮ → "Instalar app".
- **iPhone (Safari)**: Compartir → "Agregar a inicio". (Sin Azure, el reconocimiento de voz del navegador en iOS es limitado.)

## Límites conocidos
- Sin Azure, el puntaje de pronunciación usa el reconocimiento del navegador (por palabra, no por fonema).
- Los recordatorios del navegador solo se muestran si la app está abierta o en segundo plano; el `.ics` es la opción confiable.
- El lector de QR integrado requiere `BarcodeDetector` (Chrome/Edge en Android, algunos navegadores de escritorio); si no existe, escanea con la cámara del teléfono o pega el código.
- La sincronización al cerrar la app es de mejor esfuerzo (el navegador puede cortarla); usa «Sincronizar ahora» antes de cambiar de dispositivo.
- Resúmenes, entrevista y reto necesitan una clave de IA (Gemini gratis u OpenAI). «Traduce y completa» funciona sin clave con su banco de frases; la IA solo agrega explicaciones para respuestas que no están en el banco y frases nuevas.
- La curva de entonación del modelo solo se dibuja con voces en la nube (el audio de la voz del dispositivo no se puede capturar).
