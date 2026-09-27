import { ALLOWED_ORIGINS, LOCAL_ORIGIN_RE, MSG, MAX_BODY_BYTES } from './config.js';

export class HttpError extends Error {
  constructor(status, code, message, extra) { super(message); this.status = status; this.code = code; this.extra = extra; }
}
export const originAllowed = o => !o || ALLOWED_ORIGINS.includes(o) || LOCAL_ORIGIN_RE.test(o);

export function corsHeaders(origin) {
  const h = { Vary: 'Origin', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
  if (origin && originAllowed(origin)) Object.assign(h, {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '600'
  });
  return h;
}

// Ejecuta un manejador "puro" ({method, headers, body} → objeto JSON) con CORS y errores uniformes.
export async function run(req, handler) {
  const headers = lower(req.headers || {}), origin = headers.origin || '';
  const base = corsHeaders(origin);
  const out = (status, body) => ({ status, headers: { ...base, 'Content-Type': 'application/json; charset=utf-8' }, body });
  if (!originAllowed(origin)) return out(403, { error: { code: 'ORIGIN', message: MSG.origin } });
  if (req.method === 'OPTIONS') return { status: 204, headers: base, body: null };
  if (req.method !== 'POST') return out(405, { error: { code: 'METHOD', message: MSG.method } });
  try {
    const body = parseBody(req.body, headers);
    return out(200, await handler({ headers, body }));
  } catch (e) {
    if (e instanceof HttpError) return out(e.status, { error: { code: e.code, message: e.message, ...(e.extra || {}) } });
    console.error('api error:', e && e.name, e && String(e.message || '').slice(0, 200));
    return out(500, { error: { code: 'INTERNAL', message: MSG.upstream } });
  }
}
function lower(h) { const o = {}; for (const [k, v] of Object.entries(h)) o[k.toLowerCase()] = Array.isArray(v) ? v[0] : v; return o; }
function parseBody(b, headers) {
  if (b == null || b === '') return {};
  if (+headers['content-length'] > MAX_BODY_BYTES) throw new HttpError(413, 'TOO_BIG', MSG.tooBig);
  if (typeof b === 'string' || Buffer.isBuffer(b)) {
    const s = b.toString(); if (s.length > MAX_BODY_BYTES) throw new HttpError(413, 'TOO_BIG', MSG.tooBig);
    try { return JSON.parse(s); } catch (e) { throw new HttpError(400, 'BAD_JSON', MSG.bad); }
  }
  if (typeof b !== 'object') throw new HttpError(400, 'BAD_JSON', MSG.bad);
  if (JSON.stringify(b).length > MAX_BODY_BYTES) throw new HttpError(413, 'TOO_BIG', MSG.tooBig);
  return b;
}

// Adaptador para Vercel (req/res de Node)
export const vercel = handler => async (req, res) => {
  let body = req.body;
  if (body === undefined && req.method === 'POST' && typeof req.on === 'function') body = await readRaw(req); // sin el parser de Vercel
  const r = await run({ method: req.method, headers: req.headers, body }, handler);
  res.statusCode = r.status;
  for (const [k, v] of Object.entries(r.headers)) res.setHeader(k, v);
  res.end(r.body == null ? '' : JSON.stringify(r.body));
};
function readRaw(req) {
  return new Promise((resolve) => { let n = 0; const chunks = [];
    req.on('data', c => { n += c.length; if (n <= MAX_BODY_BYTES + 1) chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', () => resolve('')); });
}
