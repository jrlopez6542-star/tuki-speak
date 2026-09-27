// Configuración compartida de la API de Tuki Speak (Vercel, funciones Node).
// Las claves del dueño SOLO viven en variables de entorno de Vercel; nunca se envían al navegador.
export const PROJECT_ID = 'tuki-speak';
export const OWNER_EMAIL = 'jrlopez6542@gmail.com';
export const FIREBASE_WEB_API_KEY = 'AIzaSyBdnIF-wOZSz49VP9iEXJKCfCG_4mLyoNA'; // clave pública de la app web (no es secreta)
export const ALLOWED_ORIGINS = ['https://tuki-speak.vercel.app', 'https://jrlopez6542-star.github.io'];
export const LOCAL_ORIGIN_RE = /^http:\/\/(localhost|127\.0\.0\.1)(:\d{1,5})?$/;

// Límites diarios por persona (día de Colombia, UTC-5). Se pueden cambiar con variables de entorno.
const int = (v, d) => { const n = parseInt(v, 10); return Number.isFinite(n) && n >= 0 ? n : d; };
export const limits = () => ({ gemini: int(process.env.LIMIT_GEMINI, 60), live: int(process.env.LIMIT_LIVE, 20), azure: int(process.env.LIMIT_AZURE, 100) });

// Modelos permitidos: los mismos que usa la app (texto con respaldo en cadena; Live)
export const TEXT_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-2.0-flash-lite'];
export const LIVE_MODELS = ['gemini-3.1-flash-live-preview', 'gemini-2.5-flash-native-audio-preview-12-2025', 'gemini-2.5-flash-native-audio-preview-09-2025', 'gemini-live-2.5-flash-preview'];

// Tamaños máximos
export const MAX_BODY_BYTES = 200_000;       // petición completa
export const MAX_INPUT_CHARS = 60_000;       // texto total (instrucción + mensajes)
export const MAX_CONTENTS = 100;             // mensajes de la conversación
export const MAX_PARTS = 4;                  // partes por mensaje
export const MAX_OUTPUT_TOKENS = 8192;       // tope de salida
export const MAX_OUTPUT_CHARS = 40_000;      // texto devuelto
export const GEMINI_BUDGET_MS = 40_000;      // tiempo total para la cadena de modelos

export const MSG = {
  noAuth: 'Inicia sesión para usar la IA de Tuki.',
  badAuth: 'Tu sesión venció o no es válida. Vuelve a iniciar sesión.',
  unverified: 'Verifica tu correo (o entra con Google) para usar la IA de Tuki.',
  limit: 'Llegaste al límite gratis de hoy. Vuelve mañana o pon tu propia clave en Ajustes.',
  quotaDown: 'El contador de uso gratis no está disponible ahora. Intenta más tarde o pon tu propia clave en Ajustes.',
  origin: 'Origen no permitido.',
  method: 'Método no permitido.',
  bad: 'Solicitud no válida.',
  tooBig: 'La solicitud es demasiado grande.',
  model: 'Modelo no permitido.',
  busy: 'Gemini está muy ocupado en este momento. Espera un minuto e intenta de nuevo.',
  upstream: 'El servicio de IA no respondió bien. Intenta de nuevo en un momento.',
  config: 'El servidor no está configurado para este servicio.'
};
