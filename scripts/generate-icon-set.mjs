/**
 * Сборка набора иконок, которые реально используются на сайте.
 *
 * Font Awesome подключается шрифтами: три файла .woff2 весят около 300 КБ —
 * две трети первой загрузки страницы. При этом из нескольких тысяч глифов
 * сайту нужны считанные десятки.
 *
 * Скрипт находит в исходниках все имена вида «fa-solid fa-download»,
 * берёт из пакета соответствующие SVG и складывает их контуры
 * в src/iconSet.generated.js. Дальше компонент Icon рисует их инлайново,
 * поэтому шрифты не нужны совсем.
 *
 * Имена иконок должны встречаться в коде целиком: строка,
 * собранная из кусков через ${...}, найдена не будет.
 *
 * Запуск: npm run icon-set
 */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = join(ROOT, 'src');
const CATALOG_DIR = join(ROOT, 'catalog');
const SVG_DIR = join(ROOT, 'node_modules', '@fortawesome', 'fontawesome-free', 'svgs');
const OUT_FILE = join(ROOT, 'src', 'iconSet.generated.js');

/** Каталог пакета для каждого стиля Font Awesome. */
const STYLE_DIR = { solid: 'solid', regular: 'regular', brands: 'brands' };

function walk(dir) {
  const result = [];
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.') || name === 'node_modules') continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) result.push(...walk(full));
    else if (/\.(jsx?|tsx?|json)$/.test(name)) result.push(full);
  }
  return result;
}

// 1. Ищем упоминания иконок в коде и в конфигурации каталога:
// иконки дисциплин и разделов задаются в catalog/site.json, а не в JSX.
const used = new Set();
for (const file of [...walk(SRC_DIR), ...walk(CATALOG_DIR)]) {
  const text = readFileSync(file, 'utf8');
  for (const match of text.matchAll(/fa-(solid|regular|brands)\s+fa-([a-z0-9-]+)/g)) {
    const [, style, name] = match;
    // Хвостовой дефис означает склейку имени из кусков — такое пропускаем
    if (name.endsWith('-')) {
      console.warn(`  имя иконки собрано динамически, пропущено: ${match[0]} (${relative(ROOT, file)})`);
      continue;
    }
    used.add(`${style}/${name}`);
  }
}

// 2. Достаём контуры из пакета
const icons = {};
let missing = 0;

for (const key of [...used].sort()) {
  const [style, name] = key.split('/');
  const path = join(SVG_DIR, STYLE_DIR[style], `${name}.svg`);

  if (!existsSync(path)) {
    console.error(`  ОШИБКА: нет такой иконки — fa-${style} fa-${name}`);
    missing += 1;
    continue;
  }

  const svg = readFileSync(path, 'utf8');
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1];
  // У иконок Font Awesome ровно один <path>
  const d = svg.match(/\sd="([^"]+)"/)?.[1];

  if (!viewBox || !d) {
    console.error(`  ОШИБКА: не разобран SVG — ${relative(ROOT, path)}`);
    missing += 1;
    continue;
  }

  icons[`fa-${style} fa-${name}`] = { viewBox, d };
}

// 3. Пишем модуль
const entries = Object.entries(icons)
  .map(([key, { viewBox, d }]) => `  '${key}': { viewBox: '${viewBox}', d: '${d}' },`)
  .join('\n');

const output = `/**
 * Контуры иконок, используемых на сайте.
 *
 * Файл создаётся автоматически: scripts/generate-icon-set.mjs
 * Править вручную не нужно — достаточно указать иконку в коде
 * и выполнить npm run icon-set.
 *
 * Источник: @fortawesome/fontawesome-free (лицензия CC BY 4.0).
 */
export const ICON_SET = {
${entries}
};

export default ICON_SET;
`;

writeFileSync(OUT_FILE, output, 'utf8');

const bytes = Buffer.byteLength(output, 'utf8');
console.log(
  `Набор иконок собран: ${Object.keys(icons).length} шт., ${(bytes / 1024).toFixed(1)} КБ → ${relative(ROOT, OUT_FILE)}`
);

if (missing) {
  console.error(`Не найдено иконок: ${missing}`);
  process.exit(1);
}
