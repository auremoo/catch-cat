const DB_NAME = 'catdex';
const DB_VERSION = 1;

let _db = null;

function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('cats')) {
        db.createObjectStore('cats', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('sightings')) {
        const s = db.createObjectStore('sightings', { keyPath: 'id' });
        s.createIndex('catId', 'catId');
      }
    };
    req.onsuccess = () => { _db = req.result; resolve(_db); };
    req.onerror = () => reject(req.error);
  });
}

function run(storeName, mode, fn) {
  return openDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const req = fn(store);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }));
}

export const localDB = {
  cats: {
    getAll: () => run('cats', 'readonly', s => s.getAll()),
    get: (id) => run('cats', 'readonly', s => s.get(id)),
    put: (cat) => run('cats', 'readwrite', s => s.put(cat)),
    delete: (id) => run('cats', 'readwrite', s => s.delete(id)),
  },
  sightings: {
    getAll: () => run('sightings', 'readonly', s => s.getAll()),
    put: (sighting) => run('sightings', 'readwrite', s => s.put(sighting)),
    delete: (id) => run('sightings', 'readwrite', s => s.delete(id)),
    deleteByCat: async (catId) => {
      const all = await localDB.sightings.getAll();
      await Promise.all(
        all.filter(s => s.catId === catId).map(s => localDB.sightings.delete(s.id))
      );
    },
  },
};
