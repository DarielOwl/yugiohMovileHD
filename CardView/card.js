function cargarDetalleCarta() {
  const params = new URLSearchParams(window.location.search);
  const nombre = params.get("nombre");

  if (nombre) {
    const contenedor = document.getElementById("card-name");
    const descripcion = document.getElementById("card-description");
    const imagen = document.getElementById("card-image");

    contenedor.innerHTML = `<h2>${nombre}</h2>`;

    fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodeURIComponent(nombre)}`)
      .then(res => res.json())
      .then(data => {
        const carta = data.data[0];

        imagen.innerHTML = `
          <img src="${carta.card_images[0].image_url}" alt="card name" width="150px" height="200px" id="card-image">
        `;

        descripcion.innerHTML = `
          <p>
            Rareza: 
            <span class="card-count"> ${
                carta.card_sets?.map(set => set.set_rarity).join(' | ')
            } </span> 
          </p> 
          <p>
            Precio: 
            <span class="card-count"> USD $${carta.card_prices[0]?.tcgplayer_price} </span> 
          </p> 
        `;
      })
      .catch(err => {
        contenedor.innerHTML = `<p>Error al cargar los datos de la carta.</p>`;
        console.error(err);
      });
  }
}

document.addEventListener("DOMContentLoaded", cargarDetalleCarta);