document.addEventListener("DOMContentLoaded", async () => {
    //Consultamos la Api de YGOPRO
    try {
        const respuesta = await fetch(
            "https://db.ygoprodeck.com/api/v7/cardinfo.php?banlist=tcg"
        );

        //Si no contesta un 200, sale error
        if (!respuesta.ok) {
            throw new Error(`HTTP ${respuesta.status}`);
        }

        // Cada "json" es un array que tiene la info de la carta
        const json = await respuesta.json();
        const cartas = json.data;

        //Crear las listas para cada categoria de la Banlist
        const forbidden = [];
        const limited = [];
        const semilimited = [];

        //Añadir a su respectiva lista
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
                case "Semi-Limited": //Nota: A veces el guion puede variar
                    semilimited.push(carta);
                    break;
                default:
                // si no coincide, lo ignoramos
            }
        });

        //Crear un <li> dado el nombre, la imagen y el 'icono'
        function makeListItem(card, symbol) {
            // card.card_name  → nombre
            // card.card_images[0].image_url → URL de la imagen
            const li = document.createElement("li");
            li.innerHTML = `
            <div class="card-item">
                <img
                src="${card.card_images[0].image_url}"
                alt="${card.card_name}"
                width="60"
                height="auto"
                />
                <span class="card-name">${card.card_name}</span>
                <span class="card-count">${symbol}</span>
            </div>
            `;
            return li;
        }

        // 4) Solo un <ul> en el DOM (La lista general)
        const ulBanlist = document.getElementById("banlist");

        // 5) Insertar en el siguiente orden: Forbidden → Limited → Semi-Limited
        forbidden.forEach((c) => {
            ulBanlist.appendChild(makeListItem(c, "🚫"));
        });
        limited.forEach((c) => {
            ulBanlist.appendChild(makeListItem(c, "1"));
        });
        semilimited.forEach((c) => {
            ulBanlist.appendChild(makeListItem(c, "2"));
        });

    } catch (err) {
        console.error("Error fetching or parsing banlist:", err);
    }
});

