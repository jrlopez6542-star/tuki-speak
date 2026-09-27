// Pruebas de la API (sin red): verificación del token de Firebase, CORS, forma de la petición, límites diarios,
// respaldo de modelos, token de Azure, token efímero de Gemini Live y exención del dueño.
//   node tests/api.test.mjs
import { generateKeyPair, SignJWT, exportJWK, createLocalJWKSet } from 'jose';
import { run } from '../api/_lib/http.js';
import { keyStore } from '../api/_lib/auth.js';
import { deps, geminiHandler, azureTokenHandler, liveTokenHandler } from '../api/_lib/handlers.js';
import { _resetSession, dayKey } from '../api/_lib/quota.js';

let pass = 0, fail = 0;
const t = (n, c, i = '') => { c ? pass++ : fail++; console.log((c ? 'PASS ' : 'FAIL ') + n, c ? '' : JSON.stringify(i).slice(0, 400)); };
const GK = 'TEST_GEMINI_SECRET_' + 'x'.repeat(20), AK = 'TEST_AZURE_SECRET_' + 'y'.repeat(20), QP = 'TEST_QUOTA_PASSWORD';
Object.assign(process.env, { GEMINI_API_KEY: GK, AZURE_SPEECH_KEY: AK, AZURE_SPEECH_REGION: 'eastus', QUOTA_EMAIL: 'quota-server@tuki-speak.invalid', QUOTA_PASSWORD: QP });
delete process.env.LIMIT_GEMINI; delete process.env.LIMIT_LIVE; delete process.env.LIMIT_AZURE;

// ---- claves de prueba ----
const { publicKey, privateKey } = await generateKeyPair('RS256');
const other = await generateKeyPair('RS256');
const jwk = { ...(await exportJWK(publicKey)), kid: 'k1', alg: 'RS256', use: 'sig' };
keyStore.override = createLocalJWKSet({ keys: [jwk] });
const now = () => Math.floor(Date.now() / 1000);
async function tok({ sub = 'uid_ana', email = 'ana@gmail.com', verified = true, provider = 'google.com', aud = 'tuki-speak', iss = 'https://securetoken.google.com/tuki-speak', exp = now() + 3600, iat = now() - 10, key = privateKey, kid = 'k1', alg = 'RS256' } = {}) {
  return new SignJWT({ email, email_verified: verified, firebase: { sign_in_provider: provider }, auth_time: iat, user_id: sub })
    .setProtectedHeader({ alg, kid }).setSubject(sub).setAudience(aud).setIssuer(iss).setIssuedAt(iat).setExpirationTime(exp).sign(key);
}

// ---- servicios simulados (Firestore REST, Identity Toolkit, Gemini, Azure) ----
const S = { counters: {}, calls: [], gem: [], gemPlan: {}, quotaDown: false, signins: 0, liveReq: null, azureFail: false };
const json = (status, o) => new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json' } });
deps.fetch = async (url, opt = {}) => {
  S.calls.push(url);
  const body = opt.body ? JSON.parse(opt.body) : null;
  if (url.includes('identitytoolkit.googleapis.com')) { S.signins++; return body.password === QP ? json(200, { idToken: 'srv.tok.en', expiresIn: '3600' }) : json(400, { error: { message: 'INVALID_PASSWORD' } }); }
  if (url.includes('firestore.googleapis.com')) {
    if (S.quotaDown) return json(403, { error: { status: 'PERMISSION_DENIED' } });
    if (opt.headers.Authorization !== 'Bearer srv.tok.en') return json(401, {});
    const w = body.writes[0].transform, ft = w.fieldTransforms[0], k = w.document + '#' + ft.fieldPath;
    S.counters[k] = (S.counters[k] || 0) + parseInt(ft.increment.integerValue, 10);
    return json(200, { writeResults: [{ transformResults: [{ integerValue: String(S.counters[k]) }, { timestampValue: new Date().toISOString() }] }] });
  }
  if (url.includes(':generateContent')) {
    const model = decodeURIComponent(url.split('/models/')[1].split(':')[0]);
    S.gem.push({ model, body, key: opt.headers['x-goog-api-key'] });
    const st = S.gemPlan[model] ?? 200;
    if (st !== 200) return json(st, { error: { status: 'UNAVAILABLE', message: 'high demand' } });
    return json(200, { candidates: [{ content: { parts: [{ text: 'Hola desde ' + model }] } }] });
  }
  if (url.includes('/auth_tokens')) { S.liveReq = { body, key: opt.headers['x-goog-api-key'] }; return json(200, { name: 'auth_tokens/eph_' + 'z'.repeat(40) }); }
  if (url.includes('.api.cognitive.microsoft.com/sts/v1.0/issueToken')) { S.azKey = opt.headers['Ocp-Apim-Subscription-Key']; return S.azureFail ? new Response('', { status: 401 }) : new Response('eyAzure.sts.token', { status: 200 }); }
  throw new Error('unexpected fetch ' + url);
};
const ORIGIN = 'https://tuki-speak.vercel.app';
const call = (handler, { token, body = {}, origin = ORIGIN, method = 'POST', headers = {} } = {}) =>
  run({ method, headers: { ...(origin ? { Origin: origin } : {}), ...(token ? { Authorization: 'Bearer ' + token } : {}), 'Content-Type': 'application/json', ...headers }, body }, handler);
const gReq = (extra = {}) => ({ model: 'gemini-2.5-flash', request: { systemInstruction: { parts: [{ text: 'You are Tuki.' }] }, contents: [{ role: 'user', parts: [{ text: 'Hi' }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 800 } }, ...extra });

// ---------- verificación del token ----------
const good = await tok();
let r = await call(geminiHandler, { token: good, body: gReq() });
t('valid Google ID token → 200 with text', r.status === 200 && r.body.text === 'Hola desde gemini-2.5-flash', r);
r = await call(geminiHandler, { body: gReq() });
t('no Authorization → 401 NO_AUTH with Spanish message', r.status === 401 && r.body.error.code === 'NO_AUTH' && /Inicia sesión/.test(r.body.error.message), r);
r = await call(geminiHandler, { body: gReq(), headers: { Authorization: 'Basic abc' } });
t('non-Bearer Authorization → 401', r.status === 401, r);
r = await call(geminiHandler, { token: await tok({ key: other.privateKey }), body: gReq() });
t('bad signature (other key) → 401 BAD_AUTH', r.status === 401 && r.body.error.code === 'BAD_AUTH', r);
const parts = good.split('.'); const forged = [parts[0], Buffer.from(JSON.stringify({ ...JSON.parse(Buffer.from(parts[1], 'base64url')), sub: 'uid_evil' })).toString('base64url'), parts[2]].join('.');
r = await call(geminiHandler, { token: forged, body: gReq() });
t('tampered payload (same signature) → 401', r.status === 401, r);
r = await call(geminiHandler, { token: await tok({ aud: 'other-project' }), body: gReq() });
t('wrong aud → 401', r.status === 401 && r.body.error.code === 'BAD_AUTH', r);
r = await call(geminiHandler, { token: await tok({ iss: 'https://securetoken.google.com/other-project' }), body: gReq() });
t('wrong iss → 401', r.status === 401, r);
r = await call(geminiHandler, { token: await tok({ exp: now() - 120, iat: now() - 4000 }), body: gReq() });
t('expired token → 401', r.status === 401, r);
r = await call(geminiHandler, { token: await tok({ kid: 'unknown' }), body: gReq() });
t('unknown kid → 401', r.status === 401, r);
const none = Buffer.from('{"alg":"none","typ":"JWT"}').toString('base64url') + '.' + parts[1] + '.sig';
r = await call(geminiHandler, { token: none, body: gReq() });
t('alg "none" token → 401', r.status === 401, r);
const hs = await new SignJWT({}).setProtectedHeader({ alg: 'HS256', kid: 'k1' }).setSubject('x').setAudience('tuki-speak').setIssuer('https://securetoken.google.com/tuki-speak').setIssuedAt().setExpirationTime('1h').sign(new TextEncoder().encode('secret-secret-secret-secret-1234'));
r = await call(geminiHandler, { token: hs, body: gReq() });
t('HS256 (algorithm confusion) → 401', r.status === 401, r);
r = await call(geminiHandler, { token: await tok({ provider: 'password', verified: false, email: 'nuevo@correo.com', sub: 'uid_unv' }), body: gReq() });
t('email/password with unverified email → 403 UNVERIFIED (Spanish)', r.status === 403 && r.body.error.code === 'UNVERIFIED' && /Verifica tu correo/.test(r.body.error.message), r);
r = await call(geminiHandler, { token: await tok({ provider: 'anonymous', verified: false, email: '', sub: 'uid_anon' }), body: gReq() });
t('anonymous account → 403', r.status === 403, r);
r = await call(geminiHandler, { token: await tok({ provider: 'password', verified: true, email: 'luis@correo.com', sub: 'uid_luis' }), body: gReq() });
t('email/password with verified email → 200', r.status === 200, r);

// ---------- CORS ----------
for (const o of ['https://tuki-speak.vercel.app', 'https://jrlopez6542-star.github.io', 'http://localhost:8931', 'http://127.0.0.1:8931']) {
  r = await call(geminiHandler, { method: 'OPTIONS', origin: o });
  t('preflight from ' + o + ' → 204 + ACAO echo + Authorization allowed', r.status === 204 && r.headers['Access-Control-Allow-Origin'] === o && /Authorization/.test(r.headers['Access-Control-Allow-Headers']) && r.headers.Vary === 'Origin', r);
}
for (const o of ['https://evil.example', 'https://tuki-speak.vercel.app.evil.example', 'https://jrlopez6542-star.github.io.evil.com', 'http://localhost.evil.com', 'https://tuki-speak-git-x.vercel.app', 'null']) {
  r = await call(geminiHandler, { method: 'OPTIONS', origin: o });
  const r2 = await call(geminiHandler, { token: good, body: gReq(), origin: o });
  t('origin ' + o + ' → 403, no ACAO header, no upstream call', r.status === 403 && r2.status === 403 && !r.headers['Access-Control-Allow-Origin'] && !r2.headers['Access-Control-Allow-Origin'], [r.status, r2.status]);
}
r = await call(geminiHandler, { method: 'GET', token: good });
t('GET → 405', r.status === 405, r);
r = await call(geminiHandler, { token: good, body: gReq(), origin: 'https://jrlopez6542-star.github.io' });
t('POST from GitHub Pages origin → 200 with ACAO', r.status === 200 && r.headers['Access-Control-Allow-Origin'] === 'https://jrlopez6542-star.github.io', r.status);

// ---------- forma de la petición ----------
r = await call(geminiHandler, { token: good, body: gReq({ model: 'gemini-2.5-pro' }) });
t('model outside the allowlist → 400 MODEL', r.status === 400 && r.body.error.code === 'MODEL', r);
r = await call(geminiHandler, { token: good, body: { ...gReq(), request: { ...gReq().request, tools: [{ googleSearch: {} }] } } });
t('extra request field (tools) → 400', r.status === 400, r);
r = await call(geminiHandler, { token: good, body: { ...gReq(), request: { contents: [{ role: 'user', parts: [{ inlineData: { mimeType: 'image/png', data: 'AAAA' } }] }] } } });
t('non-text part (inlineData) → 400', r.status === 400, r);
r = await call(geminiHandler, { token: good, body: { ...gReq(), request: { contents: [{ role: 'system', parts: [{ text: 'x' }] }] } } });
t('bad role → 400', r.status === 400, r);
r = await call(geminiHandler, { token: good, body: { ...gReq(), request: { contents: [{ role: 'user', parts: [{ text: 'x'.repeat(60001) }] }] } } });
t('input over 60,000 chars → 413', r.status === 413, r);
r = await call(geminiHandler, { token: good, body: { ...gReq(), request: { contents: Array.from({ length: 101 }, () => ({ role: 'user', parts: [{ text: 'a' }] })) } } });
t('more than 100 messages → 400', r.status === 400, r);
r = await call(geminiHandler, { token: good, body: JSON.stringify(gReq()).padEnd(200001, ' ') });
t('body over 200 KB → 413', r.status === 413, r);
r = await call(geminiHandler, { token: good, body: '{bad json' });
t('invalid JSON → 400', r.status === 400, r);
S.gem = [];
r = await call(geminiHandler, { token: good, body: { ...gReq(), request: { ...gReq().request, generationConfig: { maxOutputTokens: 999999, responseMimeType: 'application/json' } } } });
t('maxOutputTokens capped at 8192; JSON mime passes through', r.status === 200 && S.gem[0].body.generationConfig.maxOutputTokens === 8192 && S.gem[0].body.generationConfig.responseMimeType === 'application/json', S.gem[0] && S.gem[0].body.generationConfig);
r = await call(geminiHandler, { token: good, body: { ...gReq(), request: { ...gReq().request, generationConfig: { topK: 1 } } } });
t('unknown generationConfig field → 400', r.status === 400, r);
t('upstream call uses GEMINI_API_KEY from env (server side only)', S.gem.every(g => g.key === GK));

// ---------- respaldo de modelos ----------
S.gem = []; S.gemPlan = { 'gemini-2.5-flash': 503 };
r = await call(geminiHandler, { token: good, body: gReq() });
t('fallback: gemini-2.5-flash 503 → next model answers', r.status === 200 && r.body.model === 'gemini-2.5-flash-lite' && S.gem.map(g => g.model).join() === 'gemini-2.5-flash,gemini-2.5-flash-lite', S.gem.map(g => g.model));
S.gem = []; S.gemPlan = { 'gemini-2.5-flash-lite': 404 };
r = await call(geminiHandler, { token: good, body: gReq({ model: 'gemini-2.5-flash-lite' }) });
t('fallback: 404 on requested model → chain continues', r.status === 200 && r.body.model === 'gemini-2.5-flash', S.gem.map(g => g.model));
const bobTok = await tok({ sub: 'uid_bob', email: 'bob@gmail.com' });
const bobKey = () => Object.entries(S.counters).find(([k]) => k.includes('_uid_bob#gemini'));
S.gem = []; S.gemPlan = Object.fromEntries(['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-2.0-flash-lite'].map(m => [m, 503]));
r = await call(geminiHandler, { token: bobTok, body: gReq() });
t('all models busy → 503 BUSY in Spanish, request refunded (counter back to 0)', r.status === 503 && r.body.error.code === 'BUSY' && /ocupado/.test(r.body.error.message) && bobKey()[1] === 0, [r, bobKey()]);
S.gemPlan = { 'gemini-2.5-flash': 400 };
r = await call(geminiHandler, { token: bobTok, body: gReq() });
t('upstream 400 → 400, refunded, no fallback', r.status === 400 && bobKey()[1] === 0, [r.status, bobKey()]);
S.gemPlan = {};

// ---------- límites diarios ----------
S.counters = {};
const carl = await tok({ sub: 'uid_carl', email: 'carl@gmail.com' });
let codes = [];
for (let i = 0; i < 61; i++) codes.push((await call(geminiHandler, { token: carl, body: gReq() })).status);
const last = await call(geminiHandler, { token: carl, body: gReq() });
t('Gemini: 60 requests OK, 61st → 429', codes.slice(0, 60).every(c => c === 200) && codes[60] === 429, codes.slice(55));
t('limit error is clear and in Spanish (DAILY_LIMIT)', last.status === 429 && last.body.error.code === 'DAILY_LIMIT' && last.body.error.message === 'Llegaste al límite gratis de hoy. Vuelve mañana o pon tu propia clave en Ajustes.' && last.body.error.limit === 60, last.body);
t('counter doc is quota/{día Colombia}_{uid}', Object.keys(S.counters).some(k => k.endsWith(`/quota/${dayKey()}_uid_carl#gemini`)), Object.keys(S.counters));
r = await call(geminiHandler, { token: await tok({ sub: 'uid_dana', email: 'dana@gmail.com' }), body: gReq() });
t('another user is not affected by carl\'s limit', r.status === 200 && r.body.used === 1 && r.body.limit === 60, r.body);
codes = [];
for (let i = 0; i < 21; i++) codes.push((await call(liveTokenHandler, { token: carl, body: { model: 'gemini-3.1-flash-live-preview' } })).status);
t('Live: 20 sessions OK, 21st → 429', codes.slice(0, 20).every(c => c === 200) && codes[20] === 429, codes.slice(17));
codes = [];
for (let i = 0; i < 101; i++) codes.push((await call(azureTokenHandler, { token: carl })).status);
t('Azure: 100 tokens OK, 101st → 429', codes.slice(0, 100).every(c => c === 200) && codes[100] === 429, codes.slice(97));
process.env.LIMIT_GEMINI = '2';
const eve = await tok({ sub: 'uid_eve', email: 'eve@gmail.com' });
codes = []; for (let i = 0; i < 3; i++) codes.push((await call(geminiHandler, { token: eve, body: gReq() })).status);
t('limits configurable by env (LIMIT_GEMINI=2)', codes.join() === '200,200,429', codes);
delete process.env.LIMIT_GEMINI;

// ---------- dueño sin límite ----------
const owner = await tok({ sub: 'uid_owner', email: 'jrlopez6542@gmail.com', verified: true, provider: 'google.com' });
S.calls = []; codes = [];
for (let i = 0; i < 70; i++) codes.push((await call(geminiHandler, { token: owner, body: gReq() })).status);
for (let i = 0; i < 25; i++) codes.push((await call(liveTokenHandler, { token: owner, body: { model: 'gemini-3.1-flash-live-preview' } })).status);
for (let i = 0; i < 105; i++) codes.push((await call(azureTokenHandler, { token: owner })).status);
t('owner (jrlopez6542@gmail.com, verified) has no limit: 70 Gemini + 25 Live + 105 Azure all 200', codes.every(c => c === 200), codes.filter(c => c !== 200));
t('owner requests never touch the counter store', !S.calls.some(u => u.includes('firestore')), S.calls.filter(u => u.includes('firestore')).length);
r = await call(geminiHandler, { token: await tok({ sub: 'uid_fake_owner', email: 'JRLOPEZ6542@gmail.com', verified: false, provider: 'password' }), body: gReq() });
t('owner email but unverified password account → 403 (no bypass)', r.status === 403, r);
process.env.LIMIT_GEMINI = '0';
r = await call(geminiHandler, { token: await tok({ sub: 'uid_owner2', email: 'jrlopez6542@gmail.com', verified: true, provider: 'password' }), body: gReq() });
t('owner with verified email/password account also bypasses (even LIMIT_GEMINI=0)', r.status === 200 && r.body.limit === null, r);
r = await call(geminiHandler, { token: await tok({ sub: 'uid_gil', email: 'gil@gmail.com' }), body: gReq() });
t('LIMIT_GEMINI=0 blocks everyone else', r.status === 429, r.status);
delete process.env.LIMIT_GEMINI;

// ---------- contador no disponible: se niega (fail-closed) ----------
S.quotaDown = true;
r = await call(geminiHandler, { token: await tok({ sub: 'uid_hal', email: 'hal@gmail.com' }), body: gReq() });
t('counter store unavailable → 503 QUOTA_UNAVAILABLE (fail closed), Gemini not called', r.status === 503 && r.body.error.code === 'QUOTA_UNAVAILABLE' && /propia clave/.test(r.body.error.message), r);
r = await call(geminiHandler, { token: owner, body: gReq() });
t('…but the owner still works (no counter needed)', r.status === 200, r.status);
S.quotaDown = false;
_resetSession(); process.env.QUOTA_PASSWORD = 'wrong';
r = await call(azureTokenHandler, { token: await tok({ sub: 'uid_ivy', email: 'ivy@gmail.com' }) });
t('server account sign-in failure → 503 fail closed', r.status === 503, r);
process.env.QUOTA_PASSWORD = QP; _resetSession();

// ---------- Azure ----------
r = await call(azureTokenHandler, { token: good });
t('Azure token: {token, region:eastus, expiresIn:600}; key used only server side', r.status === 200 && r.body.token === 'eyAzure.sts.token' && r.body.region === 'eastus' && r.body.expiresIn === 600 && S.azKey === AK, r.body);
S.azureFail = true;
r = await call(azureTokenHandler, { token: await tok({ sub: 'uid_jo', email: 'jo@gmail.com' }) });
t('Azure STS failure → 502, refunded', r.status === 502 && Object.entries(S.counters).find(([k]) => k.includes('_uid_jo#azure'))[1] === 0, r);
S.azureFail = false;

// ---------- Gemini Live ----------
r = await call(liveTokenHandler, { token: good, body: { model: 'gemini-3.1-flash-live-preview' } });
const lb = S.liveReq.body, exp = Date.parse(lb.expireTime) - Date.now(), ns = Date.parse(lb.newSessionExpireTime) - Date.now();
t('Live token: returns auth_tokens/… for the model', r.status === 200 && r.body.token.startsWith('auth_tokens/') && r.body.model === 'gemini-3.1-flash-live-preview', r.body);
t('Live token request: uses=1, new session ≤ 1 min, expiry ≤ 30 min, model + AUDIO locked (fieldMask)', lb.uses === 1 && ns > 0 && ns <= 61000 && exp > 0 && exp <= 30 * 60000 + 1000 && lb.bidiGenerateContentSetup.model === 'models/gemini-3.1-flash-live-preview' && lb.fieldMask === 'model,generationConfig.responseModalities' && S.liveReq.key === GK, lb);
r = await call(liveTokenHandler, { token: good, body: { model: 'gemini-2.5-pro' } });
t('Live: model outside the allowlist → 400', r.status === 400, r);
r = await call(liveTokenHandler, { token: good, body: { model: 'gemini-3.1-flash-live-preview', setup: {} } });
t('Live: extra fields → 400', r.status === 400, r);

// ---------- las claves nunca salen ----------
const everything = JSON.stringify([r, await call(geminiHandler, { token: good, body: gReq() }), await call(azureTokenHandler, { token: good }), await call(liveTokenHandler, { token: good, body: { model: 'gemini-3.1-flash-live-preview' } }), await call(geminiHandler, { token: good, body: gReq({ model: 'x' }) })]);
t('no response ever contains the Gemini/Azure keys or the server password', !everything.includes(GK) && !everything.includes(AK) && !everything.includes(QP));
delete process.env.AZURE_SPEECH_KEY;
r = await call(azureTokenHandler, { token: good });
t('missing server key → 503 CONFIG (no crash)', r.status === 503 && r.body.error.code === 'CONFIG', r);

console.log(`\nAPI RESULTS: ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
