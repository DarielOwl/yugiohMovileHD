// Importar funciones desde db.js
import {
  abrirConexionDB,
  eliminarCantidadCartaStock,
  obtenerCartasDelStock
} from '../db/db.js';

let ul;
let cartas = [];
let currentIndex = 0;
const pageSize = 20;
const threshold = 100;

async function recargarLista() {
  ul.innerHTML = "";
  ul.removeEventListener("scroll", onScroll);
  ul.scrollTop = 0;

  cartas = await obtenerCartasDelStock();

  // Reiniciar index al completo y volver a enganchar scroll y render
  currentIndex = 0;
  renderNextBatch();
  ul.addEventListener("scroll", onScroll);
}

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
      await eliminarCantidadCartaStock(carta);
      console.log(`Carta "${carta.nombre}" eliminada del stock`);
       // Volvemos a renderizar todo desde cero
      await recargarLista();
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

function buscarCartaPorNombre() {
  document.getElementById('search-btn').addEventListener('click', function () {
    const nombre = document.getElementById('search-input').value.trim();
    const ulContenedor = document.getElementById('lista-cartas');
    ulContenedor.textContent = ''; // limpiar resultado previo

    if (!nombre) {
      ulContenedor.textContent = 'Por favor, ingresa un nombre.';
      return;
    }

    // URL de ejemplo, reemplaza con la real de tu API
    const url = `https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodeURIComponent(nombre)}`;

    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error('Error en la respuesta de la API');
        return response.json();
      })
      .then(data => {
        if (!data.data || data.data.length === 0) {
          ulContenedor.textContent = 'No se encontraron resultados.';
        } else {
          const carta = data.data[0]; // tomamos la primera carta
          const li = document.createElement("li");
          li.innerHTML = `
      <div class="card-item">
        <a target="_self" href="../CardView/card.html?nombre=${encodeURIComponent(carta.name)}">
          <img src="${carta.card_images[0].image_url}" alt="${carta.name}">
        </a>
        <span class="card-name">${carta.name}</span>
        <button class="card-count">➕</button>
      </div>
    `;

          li.querySelector(".card-count").addEventListener("click", async () => {
            try {
              await agregarCartaStock({
                id: carta.id,
                nombre: carta.name,
                imagen: carta.card_images[0].image_url,
                packs: carta.card_sets,
                precios: carta.card_prices,
                cantidad: 0
              });
              console.log(`Carta "${carta.name}" agregada al stock`);
            } catch (err) {
              console.error("Error guardando en IndexedDB:", err);
            }
          });

          ulContenedor.appendChild(li);
        }
      })

      .catch(error => {
        resultadoDiv.textContent = 'Error al consultar la API: ' + error.message;
      });
  });
}

// Función principal: abre BD, carga cartas, y configura scroll
async function createAndConfigureCardList() {
  try {
    await abrirConexionDB();
    buscarCartaPorNombre();
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
