// AddView/filters.js

let cartas = [];
let filteredCartas = [];
let currentIndex = 0;
let ulElem = null;
let makeListItemFn = null;

const pageSize = 20;
const threshold = 100;

/**
 * Inicializa el módulo de filtros.
 * @param {Array} allCards  — array de cartas completo
 * @param {HTMLElement} ul  — el <ul> donde renderizas las cartas
 * @param {Function} makeLI — tu función makeListItem
 */
export function initFilterModule(allCards, ul, makeLI) {
  cartas          = allCards;
  filteredCartas  = cartas;
  currentIndex    = 0;
  ulElem          = ul;
  makeListItemFn  = makeLI;

  // toggles
  document.getElementById('filter-btn')
          .addEventListener('click', () => document.body.classList.toggle('filter-open'));
  document.getElementById('filter-close-btn')
          .addEventListener('click', () => document.body.classList.remove('filter-open'));

  // checkbox listeners
  document.querySelectorAll('.filter-checkbox')
    .forEach(cb => cb.addEventListener('change', applyFilters));
}

/** Carga el siguiente lote de cartas desde filteredCartas */
export function renderNextBatch() {
  const batch = filteredCartas.slice(currentIndex, currentIndex + pageSize);
  batch.forEach(c => ulElem.appendChild(makeListItemFn(c)));
  currentIndex += batch.length;
  if (currentIndex >= filteredCartas.length) {
    ulElem.removeEventListener('scroll', onScroll);
  }
}

/** Maneja el scroll para disparar renderNextBatch */
export function onScroll() {
  if (ulElem.scrollTop + ulElem.clientHeight >= ulElem.scrollHeight - threshold) {
    renderNextBatch();
  }
}

/** Aplica los filtros marcados y reinicia paginación */
function applyFilters() {
  const seleccion = Array.from(document.querySelectorAll('.filter-checkbox'))
                         .filter(cb => cb.checked)
                         .map(cb => cb.value);

  // reset
  ulElem.textContent = '';
  currentIndex = 0;

  filteredCartas = seleccion.length
    ? cartas.filter(c => seleccion.includes(c.cardType))
    : cartas;

  ulElem.removeEventListener('scroll', onScroll);
  ulElem.addEventListener('scroll', onScroll);
  renderNextBatch();
}
