// Módulo de almacenamiento IndexedDB para Tuki Speak (Sprint 3: Offline Profundo)
// Gestiona almacenamiento ilimitado y persistente de frases, palabras, audios y ejercicios.

const DB_NAME = 'tuki-speak-db';
const DB_VERSION = 1;
const STORES = ['kv', 'audio', 'words', 'tc', 'shadow'];

let _dbPromise = null;
const _memFallback = new Map();

function isIndexedDBSupported() {
  try {
    return typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB !== null;
  } catch (e) {
    return false;
  }
}

function getMemStore(store) {
  if (!_memFallback.has(store)) _memFallback.set(store, new Map());
  return _memFallback.get(store);
}

function openDB() {
  if (_dbPromise) return _dbPromise;

  if (!isIndexedDBSupported()) {
    return Promise.resolve(null);
  }

  _dbPromise = new Promise((resolve) => {
    try {
      const req = window.indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        for (const s of STORES) {
          if (!db.objectStoreNames.contains(s)) {
            db.createObjectStore(s);
          }
        }
      };
      req.onsuccess = e => resolve(e.target.result);
      req.onerror = () => {
        console.warn('[TukiDB] Error abriendo IndexedDB, usando memoria de respaldo.');
        resolve(null);
      };
      req.onblocked = () => {
        console.warn('[TukiDB] Base de datos bloqueada.');
        resolve(null);
      };
    } catch (e) {
      console.warn('[TukiDB] Fallo al iniciar IndexedDB:', e);
      resolve(null);
    }
  });

  return _dbPromise;
}

export const TukiDB = {
  isSupported() {
    return isIndexedDBSupported();
  },

  async get(store, key) {
    const db = await openDB();
    if (!db) {
      return getMemStore(store).get(key);
    }
    return new Promise(resolve => {
      try {
        const tx = db.transaction(store, 'readonly');
        const st = tx.objectStore(store);
        const req = st.get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(undefined);
      } catch (e) {
        resolve(getMemStore(store).get(key));
      }
    });
  },

  async set(store, key, val) {
    getMemStore(store).set(key, val);
    const db = await openDB();
    if (!db) return val;
    return new Promise(resolve => {
      try {
        const tx = db.transaction(store, 'readwrite');
        const st = tx.objectStore(store);
        const req = st.put(val, key);
        req.onsuccess = () => resolve(val);
        req.onerror = () => resolve(val);
      } catch (e) {
        resolve(val);
      }
    });
  },

  async del(store, key) {
    getMemStore(store).delete(key);
    const db = await openDB();
    if (!db) return true;
    return new Promise(resolve => {
      try {
        const tx = db.transaction(store, 'readwrite');
        const st = tx.objectStore(store);
        const req = st.delete(key);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  },

  async keys(store) {
    const db = await openDB();
    if (!db) return Array.from(getMemStore(store).keys());
    return new Promise(resolve => {
      try {
        const tx = db.transaction(store, 'readonly');
        const st = tx.objectStore(store);
        const req = st.getAllKeys();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve(Array.from(getMemStore(store).keys()));
      } catch (e) {
        resolve(Array.from(getMemStore(store).keys()));
      }
    });
  },

  async getAll(store) {
    const db = await openDB();
    if (!db) return Array.from(getMemStore(store).values());
    return new Promise(resolve => {
      try {
        const tx = db.transaction(store, 'readonly');
        const st = tx.objectStore(store);
        const req = st.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve(Array.from(getMemStore(store).values()));
      } catch (e) {
        resolve(Array.from(getMemStore(store).values()));
      }
    });
  },

  async entries(store) {
    const [ks, vals] = await Promise.all([this.keys(store), this.getAll(store)]);
    return ks.map((k, i) => [k, vals[i]]);
  },

  async count(store) {
    const db = await openDB();
    if (!db) return getMemStore(store).size;
    return new Promise(resolve => {
      try {
        const tx = db.transaction(store, 'readonly');
        const st = tx.objectStore(store);
        const req = st.count();
        req.onsuccess = () => resolve(req.result || 0);
        req.onerror = () => resolve(getMemStore(store).size);
      } catch (e) {
        resolve(getMemStore(store).size);
      }
    });
  },

  async clear(store) {
    getMemStore(store).clear();
    const db = await openDB();
    if (!db) return true;
    return new Promise(resolve => {
      try {
        const tx = db.transaction(store, 'readwrite');
        const st = tx.objectStore(store);
        const req = st.clear();
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  },

  async getStats() {
    const supported = isIndexedDBSupported();
    const [words, audio, tc, shadow] = await Promise.all([
      this.count('words'),
      this.count('audio'),
      this.count('tc'),
      this.count('shadow')
    ]);
    return { words, audio, tc, shadow, supported };
  },

  async migrateFromLocalStorage(cacheKeys = { w: 'tukiSpeak.wcache', t: 'tukiSpeak.tcache' }) {
    if (typeof localStorage === 'undefined') return 0;
    let migrated = 0;
    try {
      if (cacheKeys.w) {
        const rawW = localStorage.getItem(cacheKeys.w);
        if (rawW) {
          const wordsObj = JSON.parse(rawW);
          for (const [k, v] of Object.entries(wordsObj)) {
            await this.set('words', k, v);
            migrated++;
          }
        }
      }
      if (cacheKeys.t) {
        const rawT = localStorage.getItem(cacheKeys.t);
        if (rawT) {
          const transObj = JSON.parse(rawT);
          for (const [k, v] of Object.entries(transObj)) {
            await this.set('kv', 'tr:' + k, v);
            migrated++;
          }
        }
      }
    } catch (e) {
      console.warn('[TukiDB] Error durante migración de localStorage:', e);
    }
    return migrated;
  },

  async preloadOfflinePack(tcItems = [], shadowItems = [], onProgress) {
    let saved = 0;
    const total = tcItems.length + shadowItems.length;

    for (let i = 0; i < tcItems.length; i++) {
      const it = tcItems[i];
      if (it && it.id) {
        await this.set('tc', it.id, it);
        saved++;
        if (onProgress) onProgress(saved, total, 'Frase: ' + (it.en ? it.en.replace(/\{\}/g, '...') : it.id));
      }
    }

    for (let i = 0; i < shadowItems.length; i++) {
      const sh = shadowItems[i];
      if (sh && sh.id) {
        await this.set('shadow', sh.id, sh);
        saved++;
        if (onProgress) onProgress(saved, total, 'Shadowing: ' + (sh.en || sh.id));
      }
    }

    await this.set('kv', 'offline_pack_synced_at', Date.now());
    return saved;
  }
};
