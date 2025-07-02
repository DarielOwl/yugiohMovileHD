import requests, json
from urllib.parse import quote

base = "https://db.ygoprodeck.com/api/v7/cardinfo.php"
types = {
    "monster": "Normal Monster",
    "spell":   "Spell Card",
    "trap":    "Trap Card",
}

result = {}
for key, t in types.items():
    # 1) Escape manual para que no haya '+' en los espacios
    t_enc = quote(t, safe='')
    # 2) Incluimos tanto num como offset
    url   = f"{base}?type={t_enc}&num=1&offset=0"
    resp  = requests.get(url)
    resp.raise_for_status()
    data = resp.json().get("data", [])
    if not data:
        raise ValueError(f"No se encontró data para {t}")
    result[key] = data[0]

print(json.dumps(result, indent=2))

### Para ejecutar este script usa lo siguiente: python download_json.py > cards_sample.json