let cartas = [];
let filteredCartas = [];
let currentIndex = 0;
let ulElem = null;
let makeListItemFn = null;

const pageSize = 20;
const threshold = 100;

/**
 * Inicializa módulo de filtros.
 */
export function initFilterModule(allCards, ul, makeLI) {
  cartas = allCards;
  filteredCartas = allCards;
  currentIndex = 0;
  ulElem = ul;
  makeListItemFn = makeLI;

  // toggle panel
  document.getElementById('filter-btn')
    .addEventListener('click', () => document.body.classList.toggle('filter-open'));
  document.getElementById('filter-close-btn')
    .addEventListener('click', () => document.body.classList.remove('filter-open'));

  // categoría → radio buttons
  document.querySelectorAll('.category-radio')
    .forEach(r => r.addEventListener('change', onCategoryChange));

  // subtipo → comprobar primero si categoría está elegida
  document.querySelectorAll('.spell-checkbox, .trap-checkbox, .monster-checkbox')
    .forEach(cb => {
      // si no hay categoría seleccionada → popup
      cb.addEventListener('click', e => {
        const cat = document.querySelector('input[name="category"]:checked');
        if (!cat) {
          e.preventDefault();
          alert('Debe seleccionar una de las categorias primero!');
        }
      });
      // si pasa, aplica filtro
      cb.addEventListener('change', applyFilters);
    });
}

/** Carga siguiente lote de filteredCartas */
export function renderNextBatch() {
  const batch = filteredCartas.slice(currentIndex, currentIndex + pageSize);
  batch.forEach(c => ulElem.appendChild(makeListItemFn(c)));
  currentIndex += batch.length;
  if (currentIndex >= filteredCartas.length) {
    ulElem.removeEventListener('scroll', onScroll);
  }
}

/** Scroll handler */
export function onScroll() {
  if (ulElem.scrollTop + ulElem.clientHeight >= ulElem.scrollHeight - threshold) {
    renderNextBatch();
  }
}

/** Cuando cambias categoría */
function onCategoryChange() {
  const selectedCat = this.value; // "Monster", "Spell" o "Trap"

  // habilita sólo su grupo de subtipo, desmarca y deshabilita los otros
  const groups = [
    { cls: 'monster-checkbox', cat: 'Monster' },
    { cls: 'spell-checkbox', cat: 'Spell' },
    { cls: 'trap-checkbox', cat: 'Trap' }
  ];
  groups.forEach(g => {
    document.querySelectorAll(`.${g.cls}`)
      .forEach(cb => {
        if (g.cat === selectedCat) {
          cb.disabled = false;
        } else {
          cb.checked = false;
          cb.disabled = true;
        }
      });
  });

  // aplica filtro (solo por categoría por ahora)
  applyFilters();
}

/** Aplica filtros (categoría + subtipos) */
function applyFilters() {
  // reset UI
  ulElem.textContent = '';
  currentIndex = 0;

  // arranca con todo
  let resultado = cartas;

  // categoría
  const catRadio = document.querySelector('input[name="category"]:checked');
  if (catRadio) {
    const cat = catRadio.value; // Monster / Spell / Trap
    resultado = resultado.filter(c => c.cardType === cat);

    // ¿hay sub-filtros marcados?
    const subChecked = Array.from(
      document.querySelectorAll(`.${cat.toLowerCase()}-checkbox`)
    ).filter(cb => cb.checked)
      .map(cb => cb.value);

    if (subChecked.length) {
      resultado = resultado.filter(c =>
        subChecked.includes(c.humanReadableCardType)
      );
    }
  }

  // si no hay categoría, `resultado` queda igual (todas las cartas)
  filteredCartas = resultado;

  // reinicio scroll/paginación
  ulElem.removeEventListener('scroll', onScroll);
  ulElem.addEventListener('scroll', onScroll);
  renderNextBatch();
}
