function checkForIndexedDb() {
  if (!window.indexedDB) {
    console.log("Your browser doesn't support a stable version of IndexedDB.");
    return false;
  }
  return true;
}

function useIndexedDb(databaseName, storeName, method, object) {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(databaseName, 1);
    let db,
      tx,
      store;

    request.onupgradeneeded = function (e) {
      const db = request.result;
      db.createObjectStore(storeName, { keyPath: "_id" });
    };

    request.onerror = function (e) {
      console.log("There was an error");
    };

    request.onsuccess = function (e) {
      db = request.result;
      tx = db.transaction(storeName, "readwrite");
      store = tx.objectStore(storeName);

      db.onerror = function (e) {
        console.log("error");
      };
      if (method === "put") {
        store.put(object);
      } else if (method === "get") {
        const all = store.getAll();
        all.onsuccess = function () {
          resolve(all.result);
        };
      } else if (method === "delete") {
        store.delete(object._id);
      } else if (method === "clear") {
        store.clear()
      }
      tx.oncomplete = function () {
        db.close();
      };
    };
  });
}

function saveRecord({ name, value, date }) {
  useIndexedDb("budgetAppTransactions", "transactions", "put", {
    _id: name,
    name: name,
    value: value,
    date: date
  }).catch(err => {
    console.log("IndexedDb error: ", err)
  });
};

async function getAllRecords(req, res) {
  const bulkTransactions = [];
  await useIndexedDb("budgetAppTransactions", "transactions", "get")
    .then(res => {
      res.map(e => {
        bulkTransactions.push({ name: e.name, value: e.value, date: e.date });
      })
    });
  res = bulkTransactions;
  return res;
};

function deleteAllRecords() {
  useIndexedDb("budgetAppTransactions", "transactions", "clear")
    .then(res => {
      console.log("clear indexedDb response: ", res);
    })
    .catch(err => console.log(err));
};


