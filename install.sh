#!/usr/bin/env bash
# Prepara el checkout existente. No modifica datos del navegador ni instala paquetes.
set -euo pipefail

APP_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"

if ! command -v python3 >/dev/null 2>&1; then
  echo 'Falta Python 3. Instálalo desde https://www.python.org/downloads/ y vuelve a ejecutar este script.' >&2
  exit 1
fi
if ! command -v node >/dev/null 2>&1; then
  echo 'Falta Node.js 20 o superior para ejecutar las pruebas. Instálalo desde https://nodejs.org/ y vuelve a ejecutar este script.' >&2
  exit 1
fi
python3 -c 'import sys; assert sys.version_info >= (3, 8), "Se requiere Python 3.8 o superior"'
node -e 'if (Number(process.versions.node.split(".")[0]) < 20) { console.error("Se requiere Node.js 20 o superior"); process.exit(1); }'

for file in index.html styles.css app.js sw.js manifest.webmanifest icon.svg tests/logic.test.js; do
  if [[ ! -f "$file" ]]; then
    printf 'Falta un archivo necesario: %s\n' "$file" >&2
    exit 1
  fi
done

node --check app.js
node --check sw.js
node --test tests/logic.test.js

printf '\nRespawnTech preparada. No requiere npm install ni compilación.\n'
printf 'Para iniciar desde esta carpeta: python3 -m http.server 8000 --bind 127.0.0.1\n'
printf 'Después abre http://127.0.0.1:8000 en tu navegador.\n'
printf 'Para producción sirve los archivos por HTTPS, por ejemplo mediante GitHub Pages.\n'
