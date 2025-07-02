function cargarDetalleCarta() {
  const params = new URLSearchParams(window.location.search);
  const nombre = params.get("nombre");

  if (nombre) {
    //const contenedor = document.getElementById("card-name");
    const descripcion = document.getElementById("card-description");
    const imagen = document.getElementById("card-image");

    //contenedor.innerHTML = `<h2>${nombre}</h2>`;

    fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodeURIComponent(nombre)}`)
      .then(res => res.json())
      .then(data => {
        const carta = data.data[0];

        imagen.innerHTML = `
          <img src="${carta.card_images[0].image_url}" alt="card name" width="150px" height="200px" id="card-image">
        `;

        const rarezasHTML = carta.card_sets?.map(set => {
          const precio = parseFloat(set.set_price) === 0 ? 'Out of stock' : `$${set.set_price}`;
          return `
    <div class="rareza-item">
      <div><strong>Nombre:</strong> ${set.set_name}</div>
      <div><strong>Código:</strong> ${set.set_code}</div>
      <div><strong>Rareza:</strong> ${set.set_rarity}</div>
      <div><strong>Precio:</strong> ${precio}</div>
    </div>
  `;
        }).join('') ?? '<div class="rareza-item">No disponible</div>';

        descripcion.innerHTML = `
  <p>Rarezas disponibles:</p>
  <div class="rareza-container">${rarezasHTML}</div>
  
`;

      })
      .catch(err => {
        contenedor.innerHTML = `<p>Error al cargar los datos de la carta.</p>`;
        console.error(err);
      });
  }
}

document.addEventListener("DOMContentLoaded", cargarDetalleCarta);