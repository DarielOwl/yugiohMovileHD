// 1) Importa las funciones desde db.js (ajusta la ruta según tu estructura)
import { abrirConexionDB, obtenerCartasDelStock } from '../db/db.js';

// 3) Función que genera los elementos HTML, los inserta en la UL y le pone el listener al botón
async function crearItemLista() {
  const ul = document.getElementById("lista-cartas");

  try {
    const cartas = await obtenerCartasDelStock();

    cartas.forEach(carta => {
      // a) Crea <li> vacío
      const li = document.createElement("li");

      // b) Genera el HTML dentro de <li>
      li.innerHTML = 
      `
        <div class="card-item">
          <a target="_self" href="../CardView/card.html?nombre=${encodeURIComponent(carta.nombre)}">
            <img src="${carta.imagen}" alt="${carta.nombre}">
          </a>
          <span class="card-name">${carta.nombre}</span>
          <span class="card-count">1</span>
        </div>
      `;

      // c) Añade el <li> al UL antes de asignar el listener
      ul.appendChild(li);
    });
  } catch (error) {
    console.error("Error al crear la lista:", error);
  }
}

// 4) Cuando cargue la página, primero abre la base y luego llama a crearItemLista()
window.addEventListener("DOMContentLoaded", async () => {
  try {
    await abrirConexionDB();
    crearItemLista();
  } catch (err) {
    console.error("No se pudo abrir la BD:", err);
  }
});
