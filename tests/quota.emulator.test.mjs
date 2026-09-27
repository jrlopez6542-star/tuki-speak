// Prueba de api/_lib/quota.js contra el emulador de Firestore con las reglas reales (commit REST + increment).
//   npx firebase emulators:exec --only firestore "node tests/quota.emulator.test.mjs"
import { consume, _resetSession } from '../api/_lib/quota.js';
const EMU = 'http://127.0.0.1:8085/v1';
const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
const now = Math.floor(Date.now() / 1000);
const fakeTok = uid => b64({ alg: 'none', typ: 'JWT' }) + '.' + b64({ iss: 'https://securetoken.google.com/tuki-speak', aud: 'tuki-speak', sub: uid, user_id: uid, iat: now, exp: now + 3600, auth_time: now, firebase: { sign_in_provider: 'password' } }) + '.';
let asUid = 'R9hBV7CgH1geEUyZZT7wBkrIoE92';
const f = async (url, opt) => {
  if (url.includes('identitytoolkit')) return new Response(JSON.stringify({ idToken: fakeTok(asUid), expiresIn: '3600' }), { status: 200 });
  return fetch(url.replace('https://firestore.googleapis.com/v1', EMU), opt);
};
process.env.QUOTA_EMAIL = 'quota-server@tuki-speak.invalid'; process.env.QUOTA_PASSWORD = 'x'; process.env.LIMIT_GEMINI = '3';
let pass = 0, fail = 0; const t = (n, c, i = '') => { c ? pass++ : fail++; console.log((c ? 'PASS ' : 'FAIL ') + n, c ? '' : i); };
const u = { uid: 'emu_user_' + Date.now(), owner: false };
const got = [];
for (let i = 0; i < 3; i++) got.push((await consume(u, 'gemini', f)).used);
t('real REST commit + increment returns 1,2,3', JSON.stringify(got) === '[1,2,3]', got);
let e4; try { await consume(u, 'gemini', f); } catch (e) { e4 = e; }
t('4th call over LIMIT_GEMINI=3 → 429 DAILY_LIMIT', e4 && e4.status === 429 && e4.code === 'DAILY_LIMIT', e4 && e4.message);
const r = await consume({ uid: u.uid + '_b', owner: false }, 'gemini', f); await r.refund();
const r2 = await consume({ uid: u.uid + '_b', owner: false }, 'gemini', f);
t('refund (increment -1) works → next use counts 1 again', r2.used === 1, r2.used);
_resetSession(); asUid = 'someone_else';
let e5; try { await consume({ uid: u.uid + '_c', owner: false }, 'azure', f); } catch (e) { e5 = e; }
t('non-server account is denied by the rules → 503 fail-closed', e5 && e5.status === 503 && e5.code === 'QUOTA_UNAVAILABLE', e5 && e5.message);
console.log(`QUOTA EMULATOR RESULTS: ${pass}/${pass + fail}`); process.exit(fail ? 1 : 0);
