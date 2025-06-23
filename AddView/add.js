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
    precios: carta.card_prices
  }));
}

window.addEventListener("DOMContentLoaded", async () => {
  try {
    await abrirConexionDB();

    const ul = document.getElementById("lista-cartas");
    const cartas = await obtenerTodasLasCartas();

    let currentIndex = 0;
    const pageSize    = 20;
    const threshold   = 100; // px antes de llegar al fondo para disparar carga

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
    function renderNextBatch() {
      const batch = cartas.slice(currentIndex, currentIndex + pageSize);
      batch.forEach(carta => ul.appendChild(makeListItem(carta)));
      currentIndex += batch.length;
      if (currentIndex >= cartas.length) {
        ul.removeEventListener("scroll", onScroll);
      }
    }

    // Al hacer scroll dentro del UL, carga cuando estamos cerca del final
    function onScroll() {
      if (ul.scrollTop + ul.clientHeight >= ul.scrollHeight - threshold) {
        renderNextBatch();
      }
    }

    // Carga inicial y suscripción al scroll del UL
    renderNextBatch();
    ul.addEventListener("scroll", onScroll);

  } catch (err) {
    console.error("Error inicializando la lista de cartas:", err);
  }
});
