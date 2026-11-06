// Comprueba que la versión de la app sea la misma en todas partes.
// Fuente canónica: package.json ("version").
//   node tools/check_version.mjs
// Sale con exit 1 si falta alguna versión o si alguna no coincide.
// Solo usa la stdlib de Node, sin dependencias.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

const firstGroup = (text, re, label) => {
  const m = text.match(re);
  if (!m) throw new Error(`no se encontró la versión en ${label}`);
  return m[1];
};

const checks = [];
try {
  const pkg = JSON.parse(read('package.json'));
  const canonical = pkg.version;
  if (typeof canonical !== 'string' || !/^\d+\.\d+\.\d+$/.test(canonical)) {
    throw new Error(`versión inválida en package.json: ${String(canonical)}`);
  }

  const indexHtml = read('index.html');
  const mainJs = read('src/main.js');
  const readme = read('README.md');

  checks.push(['package.json', canonical]);
  checks.push([
    'index.html (meta app-version)',
    firstGroup(
      indexHtml,
      /<meta\s+name=["']app-version["']\s+content=["']([^"']+)["']/i,
      'index.html (meta app-version)',
    ),
  ]);
  checks.push([
    'index.html (APP_VERSION en línea)',
    firstGroup(
      indexHtml,
      /const APP_VERSION\s*=\s*['"]([^'"]+)['"]/,
      'index.html (APP_VERSION en línea)',
    ),
  ]);
  checks.push([
    'src/main.js (APP_VERSION)',
    firstGroup(
      mainJs,
      /const APP_VERSION\s*=\s*['"]([^'"]+)['"]/,
      'src/main.js (APP_VERSION)',
    ),
  ]);
  // Solo el título de la primera línea, no el historial de "Novedades vX.Y.Z".
  checks.push([
    'README.md (título)',
    firstGroup(readme.split('\n')[0], /v(\d+\.\d+\.\d+)/, 'README.md (título)'),
  ]);

  let ok = true;
  for (const [label, version] of checks) {
    const match = version === canonical;
    if (!match) ok = false;
    console.log(`${match ? 'PASS' : 'FAIL'} ${label}: ${version} (esperado ${canonical})`);
  }
  if (!ok) {
    console.error('Versiones desincronizadas: actualiza todas a la versión de package.json.');
    process.exit(1);
  }
  console.log(`Versión unificada: ${canonical}`);
} catch (err) {
  console.error(`check:version falló: ${err.message}`);
  process.exit(1);
}
