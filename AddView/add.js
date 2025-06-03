// Función para obtener todas las cartas con nombre e imagen
async function obtenerTodasLasCartas() {
    const response = await fetch("https://db.ygoprodeck.com/api/v7/cardinfo.php");
    if (!response.ok) throw new Error("Error en la respuesta");
    const data = await response.json();

    return data.data.map(carta => ({
        nombre: carta.name,
        imagen: carta.card_images[0].image_url,
        packs: carta.card_sets,
        precios: carta.card_prices,
        id: carta.id

    }));
}

// Función que genera los elementos HTML y los inserta en la UL
function crearItemLista() {
    const ul = document.getElementById("lista-cartas");

    obtenerTodasLasCartas()
        .then(cartas => {
            cartas.forEach(carta => {
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
                ul.appendChild(li);
            });
        })
        .catch(error => {
            console.error("Error al crear la lista:", error);
        });
}

// Ejecutar la función al cargar la página
window.addEventListener("DOMContentLoaded", crearItemLista);
