import { vercel } from './_lib/http.js';
import { liveTokenHandler } from './_lib/handlers.js';
export default vercel(liveTokenHandler);
