import { initFilterModule, renderNextBatch, onScroll } from '../Helper/filters.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1) Traer la banlist
    const res = await fetch('https://db.ygoprodeck.com/api/v7/cardinfo.php?banlist=tcg');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { data } = await res.json();

    // 2) Separar por estado
    const forbidden   = [];
    const limited     = [];
    const semilimited = [];
    data.forEach(card => {
      const status = card.banlist_info?.ban_tcg;
      if (status === 'Forbidden')   forbidden.push(card);
      if (status === 'Limited')     limited.push(card);
      if (status === 'Semi-Limited') semilimited.push(card);
    });

    // 3) Combinar en un solo array, añadiendo un símbolo
    const combined = [
      ...forbidden  .map(c => ({ ...c, symbol: '🚫' })),
      ...limited    .map(c => ({ ...c, symbol: '1'  })),
      ...semilimited.map(c => ({ ...c, symbol: '2'  })),
    ];

    // 4) Preparar los objetos para initFilterModule
    //    Necesitan: id, name, card_images, humanReadableCardType, cardType y symbol
    const cardsForFilter = combined.map(c => ({
      id: c.id,
      name: c.name,
      card_images: c.card_images,
      humanReadableCardType: c.humanReadableCardType,
      cardType: c.type.includes('Monster')
        ? 'Monster'
        : c.type.includes('Spell')
          ? 'Spell'
          : 'Trap',
      symbol: c.symbol
    }));

    // 5) Referencia al <ul> donde irá la lista
    const ulBanlist = document.getElementById('banlist');

    // 6) Función para generar cada <li>
    function makeListItem(card) {
      const li = document.createElement('li');
      li.innerHTML = `
        <div class="card-item">
          <img src="${card.card_images[0].image_url}" alt="${card.name}">
          <p>${card.name}</p>
          <span class="symbol">${card.symbol}</span>
        </div>
      `;
      return li;
    }

    // 7) Inicializar filtros (panel, radio, checkboxes)
    initFilterModule(cardsForFilter, ulBanlist, makeListItem);

    // 8) Cargar la primera tanda y enganchar el scroll
    renderNextBatch();
    ulBanlist.addEventListener('scroll', onScroll);

  } catch (err) {
    console.error('Error en forbidden.js:', err);
  }
});
