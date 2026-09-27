import { vercel } from './_lib/http.js';
import { azureTokenHandler } from './_lib/handlers.js';
export default vercel(azureTokenHandler);
