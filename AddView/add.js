// 1) Importa las funciones desde db.js (ajusta la ruta según tu estructura)
import { abrirConexionDB, agregarCartaStock } from '../db/db.js';

// 2) Función para obtener todas las cartas con nombre e imagen
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

// 3) Función que genera los elementos HTML, los inserta en la UL y le pone el listener al botón
async function crearItemLista() {
  const ul = document.getElementById("lista-cartas");

  try {
    const cartas = await obtenerTodasLasCartas();

    cartas.forEach(carta => {
      // a) Crea <li> vacío
      const li = document.createElement("li");

      // b) Genera el HTML dentro de <li>
      li.innerHTML = 
      `
        <div class="card-item">
          <a target="_self" href="../CardView/card.html?nombre=${encodeURIComponent(carta.nombre)}">
            <img src="${carta.imagen}" alt="${carta.nombre}">
          </a>
          <span class="card-name">${carta.nombre}</span>
          <button class="card-count">➕</button>
        </div>
      `;

      // c) Añade el <li> al UL antes de asignar el listener
      ul.appendChild(li);

      // d) Ahora, selecciona el botón dentro de este <li> y asigna el evento
      const btn = li.querySelector(".card-count");
      btn.addEventListener("click", async () => {
        try {
          // Llamas a agregarCartaStock pasando el objeto completo, por ejemplo:
          await agregarCartaStock({
            id: carta.id,
            nombre: carta.nombre,
            imagen: carta.imagen,
            packs: carta.packs,
            precios: carta.precios
          });
          console.log(`Carta "${carta.nombre}" agregada al stock`);
        } catch (err) {
          console.error("Error guardando en IndexedDB:", err);
        }
      });
    });
  } catch (error) {
    console.error("Error al crear la lista:", error);
  }
}

// 4) Cuando cargue la página, primero abre la base y luego llama a crearItemLista()
window.addEventListener("DOMContentLoaded", async () => {
  try {
    await abrirConexionDB();
    crearItemLista();
  } catch (err) {
    console.error("No se pudo abrir la BD:", err);
  }
});
