import { initFilterModule, renderNextBatch, onScroll } from '../Helper/filters.js';
import { abrirConexionDB, agregarCartaStock } from '../db/db.js';

async function obtenerTodasLasCartas() {
  const response = await fetch("https://db.ygoprodeck.com/api/v7/cardinfo.php");
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  return data.data.map(carta => ({
    id: carta.id,
    nombre: carta.name,
    imagen: carta.card_images[0].image_url,
    packs: carta.card_sets,
    precios: carta.card_prices,
    cantidad: 0,
    type: carta.type,  // <-- tipo original API
    cardType: carta.type.includes("Monster")
      ? "Monster"
      : carta.type.includes("Spell")
        ? "Spell"
        : carta.type.includes("Trap")
          ? "Trap"
          : "Other"
  }));
}

let ul;
let cartas = [];

// let currentIndex = 0;
// let filteredCartas = [];    // → aquí irá el resultado del filtro
// const pageSize = 20;
// const threshold = 100; // px antes de llegar al fondo para disparar carga

// Crea un <li> y le agrega el listener al botón
function makeListItem(carta) {
  const li = document.createElement("li");
  li.innerHTML = `
        <div class="card-item">
          <a target="_self" href="../CardView/card.html?nombre=${encodeURIComponent(carta.nombre)}">
            <img src="${carta.imagen}" alt="${carta.nombre}">
          </a>
          <span class="card-name">${carta.nombre}</span>
          <button class="card-count">➕</button>
        </div>
      `;
  // listener al botón
  li.querySelector(".card-count").addEventListener("click", async () => {
    try {
      await agregarCartaStock(carta);
      console.log(`Carta "${carta.nombre}" agregada al stock`);
    } catch (err) {
      console.error("Error guardando en IndexedDB:", err);
    }
  });
  return li;
}

// Renderiza el siguiente lote de cartas
// function renderNextBatch() {
//   const batch = filteredCartas.slice(currentIndex, currentIndex + pageSize);
//   batch.forEach(carta => ul.appendChild(makeListItem(carta)));
//   currentIndex += batch.length;
//   if (currentIndex >= filteredCartas.length) {
//     ul.removeEventListener("scroll", onScroll);
//   }
// }

// function renderNextBatchFilterList() {
//   const batch = filteredCartas.slice(currentIndex, currentIndex + pageSize);
//   batch.forEach(carta => ul.appendChild(makeListItem(carta)));
//   currentIndex += batch.length;
//   if (currentIndex >= filteredCartas.length) {
//     ul.removeEventListener("scroll", onScroll);
//   }
// }


// Al hacer scroll dentro del UL, carga cuando estamos cerca del final
// function onScroll() {
//   if (ul.scrollTop + ul.clientHeight >= ul.scrollHeight - threshold) {
//     renderNextBatch();
//   }
// }

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

    const ul = document.getElementById("lista-cartas");
    const cartas = await obtenerTodasLasCartas();

    // --- inicializa filtros + panel ---
    initFilterModule(cartas, ul, makeListItem);

    // --- render y scroll tal como antes ---
    renderNextBatch();
    ul.addEventListener("scroll", onScroll);

  } catch (err) {
    console.error("Error al inicializar la lista de cartas:", err);
  }
}

// ► Función que aplica el filtro y reinicia la paginación
// function applyFilters() {
//   const sel = Array.from(document.querySelectorAll('.filter-checkbox'))
//     .filter(cb => cb.checked)
//     .map(cb => cb.value);
//   // reset
//   ul.textContent = '';
//   currentIndex = 0;
//   // decide fuente de datos
//   filteredCartas = sel.length
//     ? cartas.filter(c => sel.includes(c.cardType))
//     : cartas;
//   // vuelve a enganchar scroll y renderiza
//   ul.removeEventListener("scroll", onScroll);
//   ul.addEventListener("scroll", onScroll);
//   renderNextBatch();
// }

// ► Asocia evento change a cada checkbox
// function setupFilters() {
//   document.querySelectorAll('.filter-checkbox')
//     .forEach(cb => cb.addEventListener('change', applyFilters));
// }

// ► Toggle del panel al pulsar el botón
// const filterBtn = document.getElementById('filter-btn');
// filterBtn.addEventListener('click', () => {
//   document.body.classList.toggle('filter-open');
// });

// al final de tu setup de JS, tras el toggle del filtro...
// const closeBtn = document.getElementById('filter-close-btn');
// closeBtn.addEventListener('click', () => {
//   document.body.classList.remove('filter-open');
// });


// Ejecuta cuando el DOM está listo
window.addEventListener("DOMContentLoaded", createAndConfigureCardList);
