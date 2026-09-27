# Tuki Speak – Pronunciación y conversación en inglés (gratis, sin servidor) · v2.0.0

App web estática (un solo `index.html` con CSS/JS dentro + `manifest.json` + `sw.js` + íconos).
Sin backend. Todo funciona gratis y sin claves; los servicios de pago son **opcionales** y las claves se guardan **solo en tu navegador** (`localStorage`), nunca en la exportación de progreso.

Publicada en: https://jrlopez6542-star.github.io/tuki-speak/

## Qué incluye
- **12 unidades / 36 lecciones**: vocales, consonantes, TH, finales, terminaciones, entonación, conversaciones reales, habla conectada (linking, reducciones, flap-t), números/fechas/horas, phrasal verbs, falsos amigos, small talk y entrevista avanzada.
- **Prueba de nivel** al primer uso (10 preguntas con oído y voz, se puede saltar o repetir en Ajustes).
- **Plan de hoy** (~10 min): sonidos débiles + tarjetas pendientes + pares mínimos.
- **Diccionario/Frases** con búsqueda (inglés o español), audio normal/lento, ➕ a tarjetas y 🎙️ practicar.
- Diagramas de boca (SVG), onda y curva de entonación de tu voz vs. el modelo.
- **Conversación con IA**
  - 🎙️ **Voz a voz en vivo (Gemini Live, gratis con límites)**: audio del micrófono → WebSocket `BidiGenerateContent` (PCM 16 kHz) → respuesta en audio (PCM 24 kHz), con transcripción de ambos lados, interrupción (barge-in) y corrección hablada breve. Usa la misma clave gratuita de Gemini.
  - 💳 **OpenAI Realtime (pago)** por WebRTC con tu propia clave (se crea una clave temporal).
  - Modo alternativo: chat de texto/dictado con corrección escrita (Gemini u OpenAI).
- **Evaluación avanzada con Azure** (opcional): puntaje fonema por fonema en IPA, precisión, fluidez, integridad y prosodia, y consejos tipo «en think la /θ/ sonó como /s/».
- Voces naturales opcionales: Azure neural (en-US/en-GB) u OpenAI TTS; si fallan, se usa la voz del dispositivo.
- Insignias, estadísticas semanales, protector de racha, modo oscuro, tamaño de letra, alto contraste, reducir animaciones, vibración.
- Recordatorio diario (notificación local o evento de calendario `.ics`), aviso sin conexión, aviso de nueva versión.

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

⚠️ Sin servidor propio, las claves se usan directamente desde el dispositivo: úsalas solo en tu propio equipo y configura límites de gasto.

## Publicar gratis
GitHub Pages, Netlify Drop, Vercel o Cloudflare Pages: sube `index.html`, `manifest.json`, `sw.js`, `icon.svg`, `icon-192.png`, `icon-512.png`.

## Instalar en el celular
- **Android (Chrome)**: menú ⋮ → "Instalar app".
- **iPhone (Safari)**: Compartir → "Agregar a inicio". (Sin Azure, el reconocimiento de voz del navegador en iOS es limitado.)

## Límites conocidos
- Sin Azure, el puntaje de pronunciación usa el reconocimiento del navegador (por palabra, no por fonema).
- Los recordatorios del navegador solo se muestran si la app está abierta o en segundo plano; el `.ics` es la opción confiable.
- La curva de entonación del modelo solo se dibuja con voces en la nube (el audio de la voz del dispositivo no se puede capturar).
