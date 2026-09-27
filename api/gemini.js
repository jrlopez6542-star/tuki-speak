import { vercel } from './_lib/http.js';
import { geminiHandler } from './_lib/handlers.js';
export default vercel(geminiHandler);
