// Nombre de la base de datos
const DB_NAME = 'YugiStockDb';
// Versión de la base de datos 
const DB_VERSION = 1;

let dbInstance;

export function abrirConexionDB() {
  return new Promise((resolve, reject) => {
    const consultaDb = indexedDB.open(DB_NAME, DB_VERSION);

    consultaDb.onupgradeneeded = event => {
      const db = event.target.result;
      // Verificamos si existe “yugiStock”; si no, lo creamos
      if (!db.objectStoreNames.contains('yugiStock')) {
        const store = db.createObjectStore('yugiStock', { keyPath: 'id' });
      }
    };

    consultaDb.onsuccess = event => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    consultaDb.onerror = event => {
      console.error('Error abriendo la Base de datos:', event.target.error);
      reject(event.target.error);
    };
  });
}

export function agregarCartaStock(carta) {
  return new Promise((resolve, reject) => {
    if (!dbInstance) {
      return reject(new Error('La base de datos no está abierta'));
    }

    const transaccion = dbInstance.transaction('yugiStock', 'readwrite');
    const store = transaccion.objectStore('yugiStock');

    const obtenerCarta = store.get(carta.id);

    obtenerCarta.onsuccess = () => {
      const cartaExistente = obtenerCarta.result;

      const cartaActualizada = {
        ...carta,
        cantidad: cartaExistente ? cartaExistente.cantidad + 1 : 1
      };

      const accion = store.put(cartaActualizada);
      console.log("Carta actualizada:", cartaActualizada);

      accion.onsuccess = () => resolve();
      accion.onerror = ev => reject(ev.target.error);
    };

    obtenerCarta.onerror = ev => reject(ev.target.error);
  });
}


export function obtenerCartasDelStock() {
  return new Promise((resolve, reject) => {
    if (!dbInstance) {
      return reject(new Error('La base de datos no está abierta'));
    }
    // 1) Crear una transacción con permisos readonly
    const transaccion = dbInstance.transaction('yugiStock', 'readonly');
    // 2) Obtener el objectStore
    const store = transaccion.objectStore('yugiStock');
    // 3) Llamar a getAll() para solicitar todos los objetos almacenados.
    const accion = store.getAll();

    accion.onsuccess = () => resolve(accion.result);
    accion.onerror = ev => reject(ev.target.error);

    // (La transacción se cierra sola cuando termina todo.)
  });
}


