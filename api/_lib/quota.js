// Contadores diarios en Cloud Firestore (plan Spark, gratis), escritos SOLO por el servidor.
// El servidor entra con una cuenta propia de Firebase Auth (QUOTA_EMAIL / QUOTA_PASSWORD en Vercel) y las reglas
// permiten escribir quota/{doc} únicamente a esa cuenta: el navegador no puede leer ni cambiar los contadores.
// Cada consumo es un incremento atómico (commit con fieldTransforms.increment) que devuelve el nuevo valor.
import { PROJECT_ID, FIREBASE_WEB_API_KEY, MSG, limits } from './config.js';
import { HttpError } from './http.js';

export const dayKey = (t = Date.now()) => new Date(t - 5 * 3600_000).toISOString().slice(0, 10); // día de Colombia (UTC-5)
const FS = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
let session = null; // { idToken, exp }

async function serverToken(f) {
  if (session && session.exp > Date.now() + 60_000) return session.idToken;
  const email = process.env.QUOTA_EMAIL, password = process.env.QUOTA_PASSWORD;
  if (!email || !password) throw new Error('quota account not configured');
  const r = await f(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_WEB_API_KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Referer: 'https://tuki-speak.vercel.app/' }, body: JSON.stringify({ email, password, returnSecureToken: true })
  });
  if (!r.ok) throw new Error('quota sign-in ' + r.status);
  const d = await r.json();
  session = { idToken: d.idToken, exp: Date.now() + (parseInt(d.expiresIn, 10) || 3600) * 1000 };
  return session.idToken;
}
export const _resetSession = () => { session = null; };

async function increment(f, uid, kind, by) {
  const doc = `projects/${PROJECT_ID}/databases/(default)/documents/quota/${dayKey()}_${uid}`;
  const body = { writes: [{ transform: { document: doc, fieldTransforms: [{ fieldPath: kind, increment: { integerValue: String(by) } }, { fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' }] } }] };
  const call = async tok => f(`${FS}:commit`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + tok }, body: JSON.stringify(body) });
  let r = await call(await serverToken(f));
  if (r.status === 401) { session = null; r = await call(await serverToken(f)); }
  if (!r.ok) throw new Error('quota commit ' + r.status);
  const d = await r.json();
  const v = d.writeResults && d.writeResults[0] && d.writeResults[0].transformResults && d.writeResults[0].transformResults[0];
  const n = v && parseInt(v.integerValue, 10);
  if (!Number.isFinite(n)) throw new Error('quota result');
  return n;
}

// Suma 1 al contador del día; si pasa el límite, responde 429 con el mensaje en español. El dueño no tiene límite.
export async function consume(user, kind, f = fetch) {
  const limit = limits()[kind];
  if (user.owner) return { used: 0, limit: null, refund: async () => {} };
  let used;
  try { used = await increment(f, user.uid, kind, 1); }
  catch (e) { console.error('quota unavailable:', String(e.message).slice(0, 120)); throw new HttpError(503, 'QUOTA_UNAVAILABLE', MSG.quotaDown); }
  if (used > limit) throw new HttpError(429, 'DAILY_LIMIT', MSG.limit, { limit, kind });
  return { used, limit, refund: async () => { try { await increment(f, user.uid, kind, -1); } catch (e) {} } };
}
