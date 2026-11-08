import { vercel } from './_lib/http.js';
import { geminiHandler } from './_lib/handlers.js';
import { MAX_GEMINI_BODY_BYTES } from './_lib/config.js';
// P12: /api/gemini admite fotos (inlineData, máx. ~2 MB en base64);
// el cuerpo puede llegar a 3 MB. El resto de endpoints sigue en 200 KB.
export default vercel(geminiHandler, { maxBodyBytes: MAX_GEMINI_BODY_BYTES });
