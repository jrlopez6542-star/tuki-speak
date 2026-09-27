# Tuki Speak – Pronunciación y conversación en inglés (gratis, sin servidor)

App web estática (un solo `index.html` con CSS/JS dentro + `manifest.json` + `sw.js` + íconos).
No usa backend ni APIs de pago. El progreso se guarda en `localStorage` del navegador.

## Probar en tu computador
```bash
cd ingles-app
python3 -m http.server 8000
# abre http://localhost:8000 en Google Chrome
```
(Abrirlo con doble clic como `file://` también carga, pero el micrófono, el reconocimiento de voz y el modo offline necesitan `http://localhost` o `https://`.)

## Publicarlo gratis
- **Netlify Drop**: entra a https://app.netlify.com/drop y arrastra la carpeta `ingles-app` (o el zip descomprimido). Te da una URL https al instante.
- **GitHub Pages**: crea un repositorio, sube `index.html`, `manifest.json`, `sw.js`, `icon.svg`, `icon-192.png`, `icon-512.png` → Settings → Pages → "Deploy from a branch" (`main` / root).
- **Vercel**: `npx vercel` dentro de la carpeta, o importa el repositorio desde vercel.com (framework: "Other", sin build).
- **Cloudflare Pages**: "Upload assets" y sube la carpeta.

## Instalar en el celular
- **Android (Chrome)**: abre la URL https → menú ⋮ → "Instalar app" / "Agregar a la pantalla principal".
- **iPhone (Safari)**: Compartir → "Agregar a inicio". (En iOS el reconocimiento de voz del navegador es limitado; la escucha, grabación y tarjetas sí funcionan.)

## IA opcional
En ⚙️ Ajustes pega una clave gratuita de Google Gemini (https://aistudio.google.com/apikey). Se guarda solo en tu navegador.
Modelo por defecto: `gemini-flash-latest` (botón "Detectar modelos" para ver los disponibles con tu clave).
