// Pruebas de firestore.rules con el emulador:
//   npx firebase emulators:exec --only firestore "node tests/rules.test.mjs"
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, writeBatch, serverTimestamp } from 'firebase/firestore';

const env = await initializeTestEnvironment({ projectId: 'tuki-speak', firestore: { rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8'), host: '127.0.0.1', port: 8085 } });
let pass = 0, fail = 0;
async function t(name, p) { try { await p; pass++; console.log('PASS', name); } catch (e) { fail++; console.log('FAIL', name, e.message); } }
const ana = env.authenticatedContext('ana').firestore(), bob = env.authenticatedContext('bob').firestore(), anon = env.unauthenticatedContext().firestore();
const keys = { v: 1, alg: 'PBKDF2-SHA256/AES-GCM-256', salt: 'A'.repeat(22), iv: 'B'.repeat(16), ct: 'C'.repeat(200), iter: 310000 };
const meta = { schemaVersion: 1, updatedAt: Date.now(), device: 'Chrome · Android', progressSize: 1234, app: 'tuki-speak' };
const now = Date.now();

await t('owner creates meta', assertSucceeds(setDoc(doc(ana, 'users/ana'), meta)));
await t('owner writes batch (progress + settings + meta with keysEnc) like the app', (async () => { const b = writeBatch(ana);
  b.set(doc(ana, 'users/ana/data/progress'), { z: 'abc', enc: 'TK1', n: 3, updatedAt: now }); b.set(doc(ana, 'users/ana/data/settings'), { s: { goal: 20, theme: 'dark' }, updatedAt: now });
  b.set(doc(ana, 'users/ana'), { ...meta, keysEnc: keys }, { merge: true }); return assertSucceeds(b.commit()); })());
await t('owner reads own docs', assertSucceeds(Promise.all([getDoc(doc(ana, 'users/ana')), getDoc(doc(ana, 'users/ana/data/progress')), getDoc(doc(ana, 'users/ana/data/settings'))])));
await t('keysEnc: null allowed (Olvidé mi frase, merge)', assertSucceeds(setDoc(doc(ana, 'users/ana'), { keysEnc: null, updatedAt: now, schemaVersion: 1 }, { merge: true })));
await t('updatedAt as server timestamp allowed', assertSucceeds(updateDoc(doc(ana, 'users/ana'), { updatedAt: serverTimestamp() })));
await t('other user cannot read', assertFails(getDoc(doc(bob, 'users/ana'))));
await t('other user cannot read progress', assertFails(getDoc(doc(bob, 'users/ana/data/progress'))));
await t('other user cannot write', assertFails(setDoc(doc(bob, 'users/ana'), meta)));
await t('unauthenticated cannot read', assertFails(getDoc(doc(anon, 'users/ana'))));
await t('unauthenticated cannot write', assertFails(setDoc(doc(anon, 'users/x'), meta)));
await t('list on users denied', assertFails(getDocs(collection(ana, 'users'))));
await t('list on own data subcollection denied', assertFails(getDocs(collection(ana, 'users/ana/data'))));
await t('unknown top-level field denied', assertFails(setDoc(doc(ana, 'users/ana'), { ...meta, geminiKey: 'AIza...' })));
await t('progress embedded in meta denied', assertFails(setDoc(doc(ana, 'users/ana'), { ...meta, progress: {} })));
await t('updatedAt as string denied', assertFails(setDoc(doc(ana, 'users/ana'), { ...meta, updatedAt: 'ayer' })));
await t('schemaVersion missing denied', assertFails(setDoc(doc(ana, 'users/ana'), { updatedAt: now })));
await t('keysEnc with extra field (plain key) denied', assertFails(setDoc(doc(ana, 'users/ana'), { ...meta, keysEnc: { ...keys, geminiKey: 'x' } })));
await t('keysEnc with low iterations denied', assertFails(setDoc(doc(ana, 'users/ana'), { ...meta, keysEnc: { ...keys, iter: 1000 } })));
await t('keysEnc with huge ct denied', assertFails(setDoc(doc(ana, 'users/ana'), { ...meta, keysEnc: { ...keys, ct: 'x'.repeat(9000) } })));
await t('keysEnc salt as number denied', assertFails(setDoc(doc(ana, 'users/ana'), { ...meta, keysEnc: { ...keys, salt: 12345 } })));
await t('keysEnc as plain string denied', assertFails(setDoc(doc(ana, 'users/ana'), { ...meta, keysEnc: 'AIzaSy-plain' })));
await t('device too long denied', assertFails(setDoc(doc(ana, 'users/ana'), { ...meta, device: 'x'.repeat(200) })));
await t('progress with bad enc denied', assertFails(setDoc(doc(ana, 'users/ana/data/progress'), { z: 'a', enc: 'RAW', updatedAt: now })));
await t('progress over 1,000,000 chars denied', assertFails(setDoc(doc(ana, 'users/ana/data/progress'), { z: 'a'.repeat(1000001), enc: 'TK1', updatedAt: now })));
await t('progress extra field denied', assertFails(setDoc(doc(ana, 'users/ana/data/progress'), { z: 'a', enc: 'TK1', updatedAt: now, x: 1 })));
await t('settings with geminiKey denied', assertFails(setDoc(doc(ana, 'users/ana/data/settings'), { s: { geminiKey: 'AIza' }, updatedAt: now })));
await t('settings with openaiKey denied', assertFails(setDoc(doc(ana, 'users/ana/data/settings'), { s: { openaiKey: 'sk-' }, updatedAt: now })));
await t('settings not a map denied', assertFails(setDoc(doc(ana, 'users/ana/data/settings'), { s: 'x', updatedAt: now })));
await t('other doc id under data denied', assertFails(setDoc(doc(ana, 'users/ana/data/other'), { s: {}, updatedAt: now })));
await t('other subcollection denied', assertFails(setDoc(doc(ana, 'users/ana/extra/x'), { a: 1 })));
await t('other top-level collection denied', assertFails(setDoc(doc(ana, 'public/x'), { a: 1 })));
await t('owner can delete own data', assertSucceeds(deleteDoc(doc(ana, 'users/ana/data/progress'))));
await t('other user cannot delete', assertFails(deleteDoc(doc(bob, 'users/ana'))));
await env.cleanup();
console.log(`RULES RESULTS: ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
