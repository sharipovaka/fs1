/**
 * Сканирует public/files/<группа>/<раздел>/ и собирает индекс файлов
 * в src/content/filesIndex.json — его импортирует компонент FileList.
 *
 * Подписи к файлам берутся из files-meta.json в корне проекта (необязательно:
 * файл без описания попадёт в список без подписи).
 *
 * Скрипт запускается автоматически перед `npm run dev` и `npm run build`,
 * вручную — командой `npm run files`.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILES_DIR = join(ROOT, 'public', 'files');
const META_FILE = join(ROOT, 'files-meta.json');
const OUT_FILE = join(ROOT, 'src', 'content', 'filesIndex.json');

/** Файлы, которые не попадают в список на сайте. */
const IGNORED = new Set(['.DS_Store', '.gitkeep']);

/** Человекочитаемые названия типов файлов. */
const KIND_BY_EXT = {
  '.ipynb': 'Jupyter Notebook',
  '.md': 'Markdown',
  '.tex': 'LaTeX',
  '.csv': 'CSV-таблица',
  '.pdf': 'PDF',
  '.docx': 'Документ Word',
  '.xlsx': 'Таблица Excel',
  '.py': 'Python',
  '.zip': 'Архив',
};

function loadMeta() {
  try {
    const meta = JSON.parse(readFileSync(META_FILE, 'utf8'));
    delete meta._comment;
    return meta;
  } catch {
    console.warn('files-meta.json не найден или повреждён — описания не будут добавлены');
    return {};
  }
}

/** Рекурсивно собирает пути всех файлов внутри каталога. */
function walk(dir) {
  const entries = [];
  for (const name of readdirSync(dir).sort()) {
    if (IGNORED.has(name) || name.startsWith('.')) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) entries.push(...walk(full));
    else entries.push(full);
  }
  return entries;
}

const meta = loadMeta();
const index = {};
let total = 0;

let groups = [];
try {
  groups = readdirSync(FILES_DIR).filter((name) => !name.startsWith('.'));
} catch {
  console.warn(`Папка ${FILES_DIR} не найдена — индекс будет пустым`);
}

for (const group of groups) {
  const groupDir = join(FILES_DIR, group);
  if (!statSync(groupDir).isDirectory()) continue;

  for (const section of readdirSync(groupDir).filter((name) => !name.startsWith('.'))) {
    const sectionDir = join(groupDir, section);
    if (!statSync(sectionDir).isDirectory()) continue;

    // Ключ раздела совпадает с путём маршрута: «disciplines/plans»
    const key = `${group}/${section}`;

    index[key] = walk(sectionDir).map((fullPath) => {
      // Путь относительно public/files — он же используется в URL и в ссылках на GitHub
      const path = relative(FILES_DIR, fullPath).split(/[\\/]/).join('/');
      const ext = extname(fullPath).toLowerCase();

      return {
        name: path.split('/').pop(),
        path,
        ext: ext.replace('.', ''),
        kind: KIND_BY_EXT[ext] ?? ext.replace('.', '').toUpperCase(),
        size: statSync(fullPath).size,
        description: meta[path] ?? '',
      };
    });

    total += index[key].length;
  }
}

writeFileSync(OUT_FILE, `${JSON.stringify(index, null, 2)}\n`, 'utf8');

const sections = Object.keys(index).length;
console.log(`Индекс файлов обновлён: ${total} файлов в ${sections} разделах → ${relative(ROOT, OUT_FILE)}`);

// Предупреждаем об описаниях, для которых больше нет файла.
const knownPaths = new Set(Object.values(index).flat().map((file) => file.path));
const orphans = Object.keys(meta).filter((path) => !knownPaths.has(path));
if (orphans.length) {
  console.warn(`В files-meta.json есть описания без файлов: ${orphans.join(', ')}`);
}
