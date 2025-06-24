document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 1) Fetch de la API
    const respuesta = await fetch("https://db.ygoprodeck.com/api/v7/cardinfo.php?banlist=tcg");
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
    const json = await respuesta.json();
    const cartas = json.data;

    // 2) Separar en Forbidden, Limited y Semi-Limited
    const forbidden   = [];
    const limited     = [];
    const semilimited = [];

    cartas.forEach((carta) => {
      const status = carta.banlist_info?.ban_tcg || "";
      switch (status) {
        case "Forbidden":
          forbidden.push(carta);
          break;
        case "Limited":
          limited.push(carta);
          break;
        case "Semi-Limited":
          semilimited.push(carta);
          break;
      }
    });

    // 3) Referencia al <ul> con overflow y altura fija
    const ulBanlist = document.getElementById("banlist");

    // 4) Creación de cada <li>
    function makeListItem(card, symbol) {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="card-item">
          <img src="${card.card_images[0].image_url}" alt="${card.name}" />
          <p>${card.name}</p>
          <span class="symbol">${symbol}</span>
        </div>
      `;
      return li;
    }

    // 5) Lista combinada
    const combinedList = [
      ...forbidden  .map(c => ({ card: c, symbol: "🚫" })),
      ...limited    .map(c => ({ card: c, symbol: "1"  })),
      ...semilimited.map(c => ({ card: c, symbol: "2"  })),
    ];

    // 6) Paginación
    let currentIndex = 0;
    const pageSize  = 20;

    // 7) Renderizar siguiente lote
    function renderNextBatch() {
      const nextItems = combinedList.slice(currentIndex, currentIndex + pageSize);
      nextItems.forEach(({ card, symbol }) => {
        ulBanlist.appendChild(makeListItem(card, symbol));
      });
      currentIndex += nextItems.length;
      if (currentIndex >= combinedList.length) {
        ulBanlist.removeEventListener("scroll", onScroll);
      }
    }

    // 8) Detección de scroll dentro del UL
    function onScroll() {
      if (
        ulBanlist.scrollTop + ulBanlist.clientHeight
        >= ulBanlist.scrollHeight - 100
      ) {
        renderNextBatch();
      }
    }


function buscarCartaPorNombre() {
  document.getElementById('search-btn').addEventListener('click', function () {
    const nombre = document.getElementById('search-input').value.trim().toLowerCase();
    const ulContenedor = document.getElementById('banlist');
    ulContenedor.textContent = ''; // limpiar resultado previo

    if (!nombre) {
      ulContenedor.textContent = 'Por favor, ingresa un nombre.';
      return;
    }

    // Buscar en la lista local
    const resultados = combinedList.filter(({ card }) =>
      card.name.toLowerCase().includes(nombre)
    );

    if (resultados.length === 0) {
      ulContenedor.textContent = 'No se encontraron resultados.';
      return;
    }

    // Mostrar los resultados
    resultados.forEach(({ card, symbol }) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="card-item">
          <img src="${card.card_images[0].image_url}" alt="${card.name}" />
          <p>${card.name}</p>
          <span class="symbol">${symbol}</span>
        </div>
      `;
      ulContenedor.appendChild(li);
    });
  });
}



    // 9) Carga inicial y listener en el UL
    renderNextBatch();
    buscarCartaPorNombre();
    ulBanlist.addEventListener("scroll", onScroll);

  } catch (err) {
    console.error("Error fetching or parsing banlist:", err);
  }
});
