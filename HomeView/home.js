import { initFilterModule, renderNextBatch, onScroll }
  from '../Helper/filters.js';

// Importar funciones desde db.js
import {
  abrirConexionDB,
  eliminarCantidadCartaStock,
  obtenerCartasDelStock
} from '../db/db.js';


function mostrarMensajeEliminado(texto = "Carta eliminada del stock") {
  const mensaje = document.getElementById("mensaje-eliminado");
  mensaje.textContent = texto;
  mensaje.classList.add("mostrar");

  setTimeout(() => {
    mensaje.classList.remove("mostrar");
  }, 5000); // Ocultar después de 5 segundos
}


let ul;
let cartas = [];
let currentIndex = 0;

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('../service_worker.js')
    .then(reg => console.log('Registro del SW exitoso', reg))
    .catch(err => console.warn('Error al tratar de registrar el SW', err))
}

// async function recargarLista() {
//   ul.innerHTML = "";
//   ul.removeEventListener("scroll", onScroll);
//   ul.scrollTop = 0;

//   cartas = await obtenerCartasDelStock();

//   // Reiniciar index al completo y volver a enganchar scroll y render
//   currentIndex = 0;
//   renderNextBatch();
//   ul.addEventListener("scroll", onScroll);
// }

// Crea un <li> representando una carta
function makeListItem(card) {
  const li = document.createElement('li');
  li.innerHTML = `
    <div class="card-item">
      <a href="../CardView/card.html?nombre=${encodeURIComponent(card.name)}">
        <img src="${card.card_images[0].image_url}" alt="${card.name}">
      </a>
      <span class="card-name">${card.name}</span>
      <span class="card-count">${card.cantidad}</span>
      <button class="btn-eliminar">➖</button>
    </div>`;
  li.querySelector('.btn-eliminar').addEventListener('click', async () => {

    // 1) Elimino de IndexedDB
    await eliminarCantidadCartaStock({ id: card.id });
    mostrarMensajeEliminado(`Carta "${card.name}" eliminada del stock`);

    // 2) Re-cargo DB y re-mapeo
    const refreshed = (await obtenerCartasDelStock()).map(c2 => ({
      id: c2.id,
      name: c2.nombre,
      cantidad: c2.cantidad,
      humanReadableCardType: c2.humanReadableCardType,
      cardType: c2.cardType,
      card_images: [{ image_url: c2.imagen }]
    }));
    // 3) Limpio <ul> y scroll listener
    ul.removeEventListener('scroll', onScroll);
    ul.textContent = '';
    // 4) Reinicializo filtros y paginación
    initFilterModule(refreshed, ul, makeListItem);
    renderNextBatch();
    ul.addEventListener('scroll', onScroll);
  });
  return li;
}

// Carga el siguiente lote de cartas
// function renderNextBatch() {
//   const batch = cartas.slice(currentIndex, currentIndex + pageSize);
//   batch.forEach(carta => ul.appendChild(makeListItem(carta)));
//   currentIndex += batch.length;
//   if (currentIndex >= cartas.length) {
//     ul.removeEventListener("scroll", onScroll);
//   }
// }

// Escucha el scroll y carga más cartas si es necesario
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
              mostrarMensajeEliminado(`Carta "${carta.name}" eliminada del stock`);
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
window.addEventListener('DOMContentLoaded', async () => {
  await abrirConexionDB();
  // si quieres seguir teniendo el buscador, inicialízalo aquí…
  buscarCartaPorNombre();

  ul = document.getElementById('lista-cartas');
  const stored = await obtenerCartasDelStock();
  const cardsForFilter = stored.map(c => ({
    id: c.id,
    name: c.nombre,
    cantidad: c.cantidad,
    humanReadableCardType: c.humanReadableCardType,
    cardType: c.cardType,
    card_images: [{ image_url: c.imagen }]
  }));

  // 1) Arrancamos filtros + panel
  initFilterModule(cardsForFilter, ul, makeListItem);
  // 2) Primera carga + scroll infinito
  renderNextBatch();
  ul.addEventListener('scroll', onScroll);
});

