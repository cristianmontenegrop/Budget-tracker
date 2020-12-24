function checkForIndexedDb() {
  if (!window.indexedDB) {
    console.log('Your browser doesn\'t support a stable version of IndexedDB.');
    return false;
  }
  return true;
}

function useIndexedDb(databaseName, storeName, method, object) {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(databaseName, 1);
    let db;
    let tx;
    let store;

    request.onupgradeneeded = () => {
      const dbase = request.result;
      dbase.createObjectStore(storeName, { keyPath: '_id' });
    };

    request.onerror = (err) => console.log('There was an error', err);

    request.onsuccess = () => {
      db = request.result;
      tx = db.transaction(storeName, 'readwrite');
      store = tx.objectStore(storeName);

      db.onerror = (err) => console.log('error', err);
      if (method === 'put') {
        store.put(object);
      } else if (method === 'get') {
        const all = store.getAll();
        all.onsuccess = () => resolve(all.result);
      } else if (method === 'delete') {
        store.delete(object._id);
      } else if (method === 'clear') {
        store.clear();
      }
      tx.oncomplete = () => db.close();
    };
  });
}

function saveRecord({ name, value, date }) {
  useIndexedDb('budgetAppTransactions', 'transactions', 'put', {
    _id: name,
    name,
    value,
    date,
  }).catch((err) => console.log('IndexedDb error: ', err));
}

async function getAllRecords() {
  const bulkTransactions = [];
  await useIndexedDb('budgetAppTransactions', 'transactions', 'get').catch((err) => console.log('err:', err))
    .then((resp) => resp.map((e) => bulkTransactions
      .push({ name: e.name, value: e.value, date: e.date })));

  return bulkTransactions;
}

function deleteAllRecords() {
  useIndexedDb('budgetAppTransactions', 'transactions', 'clear')
    .then((res) => console.log('clear indexedDb response: ', res))
    .catch((err) => console.log('err:', err));
}
