// Importar funciones desde db.js
import {
  abrirConexionDB,
  eliminarCartaStock,
  obtenerCartasDelStock
} from '../db/db.js';

let ul;
let cartas = [];
let currentIndex = 0;
const pageSize = 20;
const threshold = 100;

// Crea un <li> representando una carta
function makeListItem(carta) {
  const li = document.createElement("li");
  li.innerHTML = `
    <div class="card-item">
      <a target="_self" href="../CardView/card.html?nombre=${encodeURIComponent(carta.nombre)}">
        <img src="${carta.imagen}" alt="${carta.nombre}">
      </a>
      <span class="card-name">${carta.nombre}</span>
      <span class="card-count">${carta.cantidad}</span>
      <button class="card-count btn-eliminar">➖</button>
    </div>
  `;

  li.querySelector(".btn-eliminar").addEventListener("click", async () => {
    try {
      await eliminarCartaStock(carta.id);
      console.log(`Carta "${carta.nombre}" eliminada del stock`);
      li.remove(); // Elimina visualmente
    } catch (err) {
      console.error("Error eliminando en IndexedDB:", err);
    }
  });

  return li;
}

// Carga el siguiente lote de cartas
function renderNextBatch() {
  const batch = cartas.slice(currentIndex, currentIndex + pageSize);
  batch.forEach(carta => ul.appendChild(makeListItem(carta)));
  currentIndex += batch.length;
  if (currentIndex >= cartas.length) {
    ul.removeEventListener("scroll", onScroll);
  }
}

// Escucha el scroll y carga más cartas si es necesario
function onScroll() {
  if (ul.scrollTop + ul.clientHeight >= ul.scrollHeight - threshold) {
    renderNextBatch();
  }
}

// Función principal: abre BD, carga cartas, y configura scroll
async function createAndConfigureCardList() {
  try {
    await abrirConexionDB();
    ul = document.getElementById("lista-cartas");
    cartas = await obtenerCartasDelStock();
    currentIndex = 0;

    renderNextBatch();
    ul.addEventListener("scroll", onScroll);

  } catch (err) {
    console.error("Error al inicializar la lista de cartas:", err);
  }
}

// Ejecuta cuando el DOM está listo
window.addEventListener("DOMContentLoaded", createAndConfigureCardList);
