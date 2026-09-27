// Verificación del token de Firebase (ID token) en el servidor: firma RS256 contra las claves públicas
// de securetoken (JWKS), aud = proyecto, iss = securetoken.google.com/<proyecto>, exp/iat/auth_time.
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { PROJECT_ID, OWNER_EMAIL, MSG } from './config.js';
import { HttpError } from './http.js';

const JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
let remote = null;
export const keyStore = { override: null }; // pruebas: clave local
const keys = () => keyStore.override || (remote ||= createRemoteJWKSet(new URL(JWKS_URL), { cooldownDuration: 30_000, cacheMaxAge: 6 * 3600_000 }));

export async function verifyIdToken(token) {
  const { payload } = await jwtVerify(token, keys(), {
    issuer: `https://securetoken.google.com/${PROJECT_ID}`, audience: PROJECT_ID, algorithms: ['RS256'], clockTolerance: 60, requiredClaims: ['exp', 'iat', 'sub']
  });
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.sub !== 'string' || !payload.sub || payload.sub.length > 128) throw new Error('sub');
  if (payload.auth_time != null && payload.auth_time > now + 60) throw new Error('auth_time');
  return payload;
}

// Devuelve { uid, email, owner } o lanza 401/403. Exige Google o correo verificado.
export async function authorize(headers) {
  const m = /^Bearer\s+([A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+)$/.exec(headers.authorization || '');
  if (!m) throw new HttpError(401, 'NO_AUTH', MSG.noAuth);
  let p;
  try { p = await verifyIdToken(m[1]); } catch (e) { throw new HttpError(401, 'BAD_AUTH', MSG.badAuth); }
  const provider = p.firebase && p.firebase.sign_in_provider;
  const email = typeof p.email === 'string' ? p.email.toLowerCase() : '';
  if (!(provider === 'google.com' || (p.email_verified === true && email))) throw new HttpError(403, 'UNVERIFIED', MSG.unverified);
  return { uid: p.sub, email, owner: p.email_verified === true && email === OWNER_EMAIL };
}
