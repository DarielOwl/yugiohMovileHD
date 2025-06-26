// filter.js
export async function initFilterPanel({
  filterBtnSelector,
  listSelector,
  getAllCards,    // ()=> Promise<card[]>
  renderCards     // (cards:Array)=>void
}) {
  // 1) Inyectamos el <aside> al final del <body>
  const panelHTML = `
    <aside id="filter-panel">
      <h2>Filtros <span id="close-filters">×</span></h2>
      <div class="filter-group" data-filter="card_type">
        <h3>CARD TYPE</h3>
        <div class="buttons"></div>
      </div>
      <div class="filter-group" data-filter="type">
        <h3>TYPE</h3>
        <div class="buttons"></div>
      </div>
      <!-- añade más grupos si los necesitas -->
    </aside>
  `;
  document.body.insertAdjacentHTML('beforeend', panelHTML);

  const panel     = document.getElementById('filter-panel');
  const toggleBtn = document.querySelector(filterBtnSelector);
  const closeBtn  = document.getElementById('close-filters');
  let allCards    = await getAllCards();
  let filters     = {};   // ej. { card_type: 'Spell', type: 'Normal Monster' }

  // 2) Abrir / cerrar panel
  toggleBtn.addEventListener('click', () => panel.classList.toggle('open'));
  closeBtn .addEventListener('click', () => panel.classList.remove('open'));

  // 3) Generar botones dinámicamente
  panel.querySelectorAll('.filter-group').forEach(group => {
    const key      = group.dataset.filter;
    const container= group.querySelector('.buttons');
    // extraer valores únicos
    const opts = Array.from(new Set(
      allCards.map(c => c[key])
    )).sort();

    opts.forEach(val => {
      const btn = document.createElement('button');
      btn.className       = 'filter-btn';
      btn.textContent     = val;
      btn.dataset.value   = val;
      btn.addEventListener('click', () => {
        // toggle estado
        if (filters[key] === val) delete filters[key];
        else filters[key] = val;
        applyFilters();
        updateActiveBtns();
      });
      container.append(btn);
    });
  });

  // 4) Aplicar filtros y volver a pintar
  function applyFilters() {
    const filtered = allCards.filter(card =>
      Object.entries(filters).every(([k,v]) => card[k] === v)
    );
    renderCards(filtered);
  }

  // 5) Marcar botones activos
  function updateActiveBtns() {
    panel.querySelectorAll('.filter-btn').forEach(btn => {
      const grp = btn.closest('.filter-group').dataset.filter;
      btn.classList.toggle('active', filters[grp] === btn.dataset.value);
    });
  }
}
