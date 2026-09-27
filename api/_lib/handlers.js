// Manejadores "puros" de la API (se prueban sin red: deps.fetch se puede reemplazar).
import { TEXT_MODELS, LIVE_MODELS, MAX_INPUT_CHARS, MAX_CONTENTS, MAX_PARTS, MAX_OUTPUT_TOKENS, MAX_OUTPUT_CHARS, GEMINI_BUDGET_MS, MSG } from './config.js';
import { HttpError } from './http.js';
import { authorize } from './auth.js';
import { consume } from './quota.js';

export const deps = { fetch: (...a) => fetch(...a) };
const GL = 'https://generativelanguage.googleapis.com/v1beta';
const bad = (msg = MSG.bad) => new HttpError(400, 'BAD_REQUEST', msg);
const isObj = x => x && typeof x === 'object' && !Array.isArray(x);
const onlyKeys = (o, ks) => Object.keys(o).every(k => ks.includes(k));

// ---- Gemini texto: forma de la petición en lista blanca ----
export function sanitizeGeminiRequest(body) {
  if (!isObj(body) || !onlyKeys(body, ['model', 'request'])) throw bad();
  const { model, request: q } = body;
  if (typeof model !== 'string' || !TEXT_MODELS.includes(model)) throw new HttpError(400, 'MODEL', MSG.model);
  if (!isObj(q) || !onlyKeys(q, ['systemInstruction', 'contents', 'generationConfig'])) throw bad();
  let chars = 0;
  const textParts = (parts) => {
    if (!Array.isArray(parts) || !parts.length || parts.length > MAX_PARTS) throw bad();
    return parts.map(p => { if (!isObj(p) || !onlyKeys(p, ['text']) || typeof p.text !== 'string') throw bad(); chars += p.text.length; return { text: p.text }; });
  };
  const out = {};
  if (q.systemInstruction != null) {
    if (!isObj(q.systemInstruction) || !onlyKeys(q.systemInstruction, ['parts', 'role'])) throw bad();
    out.systemInstruction = { parts: textParts(q.systemInstruction.parts) };
  }
  if (!Array.isArray(q.contents) || !q.contents.length || q.contents.length > MAX_CONTENTS) throw bad();
  out.contents = q.contents.map(c => {
    if (!isObj(c) || !onlyKeys(c, ['role', 'parts']) || !['user', 'model'].includes(c.role)) throw bad();
    return { role: c.role, parts: textParts(c.parts) };
  });
  if (chars > MAX_INPUT_CHARS) throw new HttpError(413, 'TOO_BIG', MSG.tooBig);
  const g = q.generationConfig == null ? {} : q.generationConfig;
  if (!isObj(g) || !onlyKeys(g, ['temperature', 'maxOutputTokens', 'responseMimeType'])) throw bad();
  const gc = { maxOutputTokens: 1024 };
  if (g.temperature != null) { if (typeof g.temperature !== 'number' || !(g.temperature >= 0 && g.temperature <= 2)) throw bad(); gc.temperature = g.temperature; }
  if (g.maxOutputTokens != null) { if (!Number.isInteger(g.maxOutputTokens) || g.maxOutputTokens < 1) throw bad(); gc.maxOutputTokens = Math.min(g.maxOutputTokens, MAX_OUTPUT_TOKENS); }
  if (g.responseMimeType != null) { if (!['application/json', 'text/plain'].includes(g.responseMimeType)) throw bad(); gc.responseMimeType = g.responseMimeType; }
  out.generationConfig = gc;
  return { model, request: out };
}

async function gemOnce(model, request, key, timeoutMs) {
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const r = await deps.fetch(`${GL}/models/${encodeURIComponent(model)}:generateContent`, { method: 'POST', signal: ctl.signal, headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body: JSON.stringify(request) });
    let d = {}; try { d = await r.json(); } catch (e) {}
    if (!r.ok) return { status: r.status, detail: String((d.error && d.error.status) || '') };
    const text = ((d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts) || []).map(p => (p && p.text) || '').join('').trim();
    return text ? { status: 200, text: text.slice(0, MAX_OUTPUT_CHARS) } : { status: 0 };
  } catch (e) { return { status: e.name === 'AbortError' ? 408 : 502 }; }
  finally { clearTimeout(t); }
}

export async function geminiHandler({ headers, body }) {
  const user = await authorize(headers);
  const { model, request } = sanitizeGeminiRequest(body);
  const key = process.env.GEMINI_API_KEY; if (!key) throw new HttpError(503, 'CONFIG', MSG.config);
  const q = await consume(user, 'gemini', deps.fetch);
  // Misma cadena de respaldo que la app: el modelo pedido y luego los demás de la lista.
  const chain = [model, ...TEXT_MODELS].filter((m, i, a) => a.indexOf(m) === i), t0 = Date.now();
  let last = { status: 0 };
  for (let pass = 0; pass < 2; pass++) {
    let transient = false;
    for (const m of chain) {
      const left = GEMINI_BUDGET_MS - (Date.now() - t0); if (left < 1500) break;
      const r = await gemOnce(m, request, key, Math.min(25_000, left));
      if (r.status === 200) return { text: r.text, model: m, used: q.used, limit: q.limit };
      last = r;
      if (r.status === 400) { await q.refund(); throw new HttpError(400, 'UPSTREAM_400', MSG.bad); }
      if ([408, 429, 500, 502, 503, 504].includes(r.status)) transient = true;
      if (r.status === 401 || r.status === 403) break; // clave del servidor rechazada
    }
    if (!transient || GEMINI_BUDGET_MS - (Date.now() - t0) < 3000) break;
    await new Promise(r => setTimeout(r, 800));
  }
  await q.refund(); // no se cobra una solicitud que no se pudo atender
  if ([408, 429, 500, 502, 503, 504].includes(last.status)) throw new HttpError(503, 'BUSY', MSG.busy);
  throw new HttpError(502, 'UPSTREAM', MSG.upstream);
}

// ---- Azure: token STS de 10 minutos (el navegador usa Authorization: Bearer) ----
export async function azureTokenHandler({ headers }) {
  const user = await authorize(headers);
  const key = process.env.AZURE_SPEECH_KEY, region = (process.env.AZURE_SPEECH_REGION || '').trim().toLowerCase();
  if (!key || !/^[a-z0-9]{3,30}$/.test(region)) throw new HttpError(503, 'CONFIG', MSG.config);
  const q = await consume(user, 'azure', deps.fetch);
  let r;
  try { r = await deps.fetch(`https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, { method: 'POST', headers: { 'Ocp-Apim-Subscription-Key': key, 'Content-Length': '0' } }); }
  catch (e) { await q.refund(); throw new HttpError(502, 'UPSTREAM', MSG.upstream); }
  const token = r.ok ? (await r.text()).trim() : '';
  if (!token) { await q.refund(); throw new HttpError(r.status === 429 ? 503 : 502, r.status === 429 ? 'BUSY' : 'UPSTREAM', MSG.upstream); }
  return { token, region, expiresIn: 600, used: q.used, limit: q.limit };
}

// ---- Gemini Live: token efímero oficial (1 uso, 1 min para abrir la sesión, 30 min de vida; modelo y audio bloqueados) ----
export async function liveTokenHandler({ headers, body }) {
  const user = await authorize(headers);
  if (!isObj(body) || !onlyKeys(body, ['model'])) throw bad();
  const model = body.model;
  if (typeof model !== 'string' || !LIVE_MODELS.includes(model)) throw new HttpError(400, 'MODEL', MSG.model);
  const key = process.env.GEMINI_API_KEY; if (!key) throw new HttpError(503, 'CONFIG', MSG.config);
  const q = await consume(user, 'live', deps.fetch);
  const now = Date.now(), expireTime = new Date(now + 30 * 60_000).toISOString();
  const req = { uses: 1, expireTime, newSessionExpireTime: new Date(now + 60_000).toISOString(),
    bidiGenerateContentSetup: { model: 'models/' + model, generationConfig: { responseModalities: ['AUDIO'] } }, fieldMask: 'model,generationConfig.responseModalities' };
  let r, d = {};
  try { r = await deps.fetch(`${GL}/auth_tokens`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body: JSON.stringify(req) }); d = await r.json().catch(() => ({})); }
  catch (e) { await q.refund(); throw new HttpError(502, 'UPSTREAM', MSG.upstream); }
  if (!r.ok || typeof d.name !== 'string' || !d.name.startsWith('auth_tokens/')) { await q.refund(); throw new HttpError(r.status === 429 ? 503 : 502, r.status === 429 ? 'BUSY' : 'UPSTREAM', MSG.upstream); }
  return { token: d.name, model, expireTime, used: q.used, limit: q.limit };
}
