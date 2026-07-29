/**
 * Сборка каталога материалов для сайта.
 *
 * На входе:
 *   catalog/*.json      — описания работ (необязательные, для точных формулировок)
 *   catalog/disciplines.json — как называть дисциплину по имени папки
 *   public/files/**     — сами файлы
 *   public/previews/**  — предпросмотр, созданный scripts/generate-previews.mjs
 *
 * На выходе:
 *   src/content/catalogIndex.json — готовые данные для интерфейса.
 *
 * Файлы, не описанные вручную, распознаются автоматически по именам папок
 * и файлов, поэтому достаточно загрузить папку в репозиторий — работа появится
 * на сайте сама. Уточнить название и срок сдачи можно необязательным файлом
 * _meta.json, положенным в ту же папку.
 *
 * Запуск: npm run catalog
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CATALOG_DIR = join(ROOT, 'catalog');
const FILES_DIR = join(ROOT, 'public', 'files');
const PREVIEWS_DIR = join(ROOT, 'public', 'previews');
const OUT_FILE = join(ROOT, 'src', 'content', 'catalogIndex.json');

/** Служебный файл с уточнениями, сам в списки не попадает. */
const META_FILE_NAME = '_meta.json';

/** Человекочитаемые названия форматов. */
const FORMAT_BY_EXT = {
  '.ipynb': 'Jupyter Notebook',
  '.md': 'Markdown',
  '.tex': 'LaTeX',
  '.csv': 'CSV-таблица',
  '.pdf': 'PDF',
  '.docx': 'Документ Word',
  '.xlsx': 'Таблица Excel',
  '.pptx': 'Презентация PowerPoint',
  '.py': 'Python',
  '.zip': 'Архив',
};

/**
 * Тип работы по началу имени файла: «tr-01-usloviya.tex» → «Типовой расчёт № 1».
 * Порядок влияет на сортировку работ внутри дисциплины.
 */
const KIND_BY_CODE = {
  lecture: 'Лекция',
  tr: 'Типовой расчёт',
  dz: 'Домашнее задание',
  kr: 'Контрольная работа',
  lab: 'Лабораторная работа',
  rgr: 'Расчётно-графическая работа',
  seminar: 'Семинар',
  test: 'Тест',
};
const KIND_ORDER = Object.keys(KIND_BY_CODE);

/**
 * Назначение файла по концу имени: «tr-01-usloviya.tex» → «Условия задач».
 * primary — файл, который скачивают в первую очередь; он выделен в карточке.
 */
const ROLE_BY_SUFFIX = {
  usloviya: { label: 'Условия задач', primary: true, order: 0 },
  zadanie: { label: 'Задание', primary: true, order: 0 },
  varianty: { label: 'Данные вариантов', order: 1 },
  otvety: { label: 'Ответы', order: 2 },
  reshenie: { label: 'Пример решения', order: 3 },
  samoproverka: { label: 'Материалы для самопроверки', order: 4 },
  metodichka: { label: 'Методические указания', order: 5 },
  shablon: { label: 'Шаблон оформления', order: 6 },
  template: { label: 'Шаблон оформления', order: 6 },
  konspekt: { label: 'Конспект', primary: true, order: 0 },
  slides: { label: 'Слайды', order: 1 },
};

let problems = 0;

/* --- вспомогательные функции --- */

function readJson(path, fallback = null) {
  try {
    const data = JSON.parse(readFileSync(path, 'utf8'));
    delete data._comment;
    return data;
  } catch {
    return fallback;
  }
}

function walk(dir) {
  if (!existsSync(dir)) return [];
  const result = [];
  for (const name of readdirSync(dir).sort()) {
    if (name.startsWith('.')) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) result.push(...walk(full));
    else if (name !== META_FILE_NAME) result.push(full);
  }
  return result;
}

/** «numerical-methods» → «Numerical methods» — запасной вариант для имён без словаря. */
function prettify(folderName) {
  const text = folderName.replace(/[-_]+/g, ' ').trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Разбор имени файла по соглашению.
 * «tr-01-usloviya.tex» → работа «tr-01», тип «tr», номер 1, назначение «usloviya».
 */
function parseFileName(fileName) {
  const base = fileName.slice(0, fileName.length - extname(fileName).length);
  const match = base.match(/^([a-zA-Zа-яёА-ЯЁ]+)[-_](\d+)(?:[-_](.+))?$/);

  if (match) {
    const code = match[1].toLowerCase();
    if (KIND_BY_CODE[code]) {
      return {
        groupKey: `${code}-${match[2]}`,
        code,
        number: parseInt(match[2], 10),
        suffix: (match[3] ?? '').toLowerCase(),
      };
    }
  }

  // Имя не по соглашению — файл становится самостоятельным материалом
  return { groupKey: base, code: null, number: null, suffix: '' };
}

/** Назначение файла: подпись и признак основного. */
function describeRole(suffix, fileName) {
  for (const [key, role] of Object.entries(ROLE_BY_SUFFIX)) {
    if (suffix.includes(key)) return role;
  }
  return { label: prettify(basename(fileName, extname(fileName))), order: 9 };
}

/** Ищет предпросмотр для файла: PDF (для .tex), HTML (для .md/.ipynb/.csv) или сам PDF. */
function findPreview(relPath) {
  const withoutExt = relPath.slice(0, -extname(relPath).length);

  const pdf = `${withoutExt}.pdf`;
  if (existsSync(join(PREVIEWS_DIR, pdf))) {
    const thumb = `${withoutExt}.png`;
    return {
      type: 'pdf',
      path: `previews/${pdf}`,
      ...(existsSync(join(PREVIEWS_DIR, thumb)) ? { thumb: `previews/${thumb}` } : {}),
    };
  }

  const html = `${withoutExt}.html`;
  if (existsSync(join(PREVIEWS_DIR, html))) return { type: 'html', path: `previews/${html}` };

  if (extname(relPath).toLowerCase() === '.pdf') return { type: 'pdf', path: `files/${relPath}` };

  return null;
}

/** Дополняет запись о файле данными с диска. */
function describeFile(entry, extra = {}) {
  const relPath = typeof entry === 'string' ? entry : entry.path;
  const full = join(FILES_DIR, relPath);

  if (!existsSync(full)) {
    console.error(`  ОШИБКА: файл описан в каталоге, но отсутствует — ${relPath}`);
    problems += 1;
    return null;
  }

  const ext = extname(relPath).toLowerCase();
  const manual = typeof entry === 'string' ? {} : entry;

  return {
    path: relPath,
    name: relPath.split('/').pop(),
    ext: ext.replace('.', ''),
    format: FORMAT_BY_EXT[ext] ?? ext.replace('.', '').toUpperCase(),
    size: statSync(full).size,
    label: manual.label ?? extra.label ?? '',
    primary: Boolean(manual.primary ?? extra.primary),
    preview: findPreview(relPath),
  };
}

function uniqueValues(items, field) {
  const seen = [];
  for (const item of items) {
    const value = item[field];
    if (value !== undefined && value !== null && value !== '' && !seen.includes(value)) seen.push(value);
  }
  return seen;
}

/** Проставляет вычисляемые поля материала. */
function finalizeItem(item) {
  return {
    ...item,
    hasPreview: item.files.some((file) => file.preview),
    thumb: item.files.find((file) => file.preview?.thumb)?.preview.thumb ?? null,
  };
}

/* --- 1. Описанные вручную материалы --- */

if (!existsSync(CATALOG_DIR)) {
  console.error(`Папка ${relative(ROOT, CATALOG_DIR)} не найдена`);
  process.exit(1);
}

const disciplineNames = readJson(join(CATALOG_DIR, 'disciplines.json'), {});
const index = {};
const referenced = new Set();

for (const fileName of readdirSync(CATALOG_DIR).filter((n) => n.endsWith('.json')).sort()) {
  if (fileName === 'disciplines.json') continue;

  const source = readJson(join(CATALOG_DIR, fileName));
  if (!source?.section) {
    console.error(`  ОШИБКА: в ${fileName} не указано поле "section"`);
    problems += 1;
    continue;
  }

  const items = (source.items ?? []).map((item) => {
    const files = (item.files ?? []).map((entry) => describeFile(entry)).filter(Boolean);
    files.forEach((file) => referenced.add(file.path));
    return finalizeItem({ ...item, files });
  });

  index[source.section] = { intro: source.intro ?? '', items, filters: null, fileCount: 0 };
}

/* --- 2. Автоматическое распознавание остальных файлов --- */

// Раскладываем нераспознанные файлы по «раздел → папка → работа»
const auto = new Map();

for (const full of walk(FILES_DIR)) {
  const relPath = relative(FILES_DIR, full).split(/[\\/]/).join('/');
  if (referenced.has(relPath)) continue;

  const parts = relPath.split('/');
  const section = parts.slice(0, 2).join('/');

  if (!index[section]) {
    console.warn(`  файл вне известных разделов, пропущен: ${relPath}`);
    continue;
  }

  // Папка дисциплины внутри раздела (может отсутствовать, если файл лежит прямо в разделе)
  const folder = parts.length > 3 ? parts[2] : '';
  const fileName = parts[parts.length - 1];
  const parsed = parseFileName(fileName);

  const bucketKey = `${section}|${folder}|${parsed.groupKey}`;
  if (!auto.has(bucketKey)) auto.set(bucketKey, { section, folder, parsed, files: [] });
  auto.get(bucketKey).files.push({ relPath, fileName, parsed });
}

let autoCount = 0;

for (const bucket of auto.values()) {
  const { section, folder, parsed } = bucket;

  // Уточнения из _meta.json той же папки — необязательны
  const metaPath = folder
    ? join(FILES_DIR, section, folder, META_FILE_NAME)
    : join(FILES_DIR, section, META_FILE_NAME);
  const meta = readJson(metaPath, {}) ?? {};
  const itemMeta = meta.items?.[parsed.groupKey] ?? {};

  const files = bucket.files
    .map((entry) => {
      const role = describeRole(entry.parsed.suffix, entry.fileName);
      const fileMeta = meta.files?.[entry.fileName] ?? {};
      const described = describeFile({ path: entry.relPath, ...fileMeta }, role);
      return described ? { ...described, order: role.order ?? 9 } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.order - b.order);

  if (!files.length) continue;

  // Если основной файл не определился, делаем основным первый
  if (!files.some((file) => file.primary)) files[0].primary = true;

  const discipline =
    itemMeta.discipline ?? meta.discipline ?? (folder ? disciplineNames[folder] ?? prettify(folder) : '');

  const item = finalizeItem({
    id: `auto-${section}-${folder}-${parsed.groupKey}`.replace(/[^\w-]+/g, '-'),
    kind: itemMeta.kind ?? (parsed.code ? KIND_BY_CODE[parsed.code] : 'Материал'),
    number: itemMeta.number ?? parsed.number ?? undefined,
    title: itemMeta.title ?? files[0].label,
    discipline,
    course: itemMeta.course ?? meta.course,
    semester: itemMeta.semester ?? meta.semester,
    deadline: itemMeta.deadline ?? '',
    status: itemMeta.status ?? '',
    statusLabel: itemMeta.statusLabel ?? '',
    files: files.map(({ order, ...file }) => file),
    // Служебные поля для сортировки
    _order: KIND_ORDER.indexOf(parsed.code ?? ''),
    _folder: folder,
  });

  index[section].items.push(item);
  autoCount += 1;
}

/* --- 3. Сортировка, фильтры, запись --- */

let totalItems = 0;
let totalFiles = 0;

for (const [section, data] of Object.entries(index)) {
  // Описанные вручную идут первыми, распознанные — следом,
  // сгруппированные по дисциплине и упорядоченные по типу и номеру работы.
  const manual = data.items.filter((item) => !item.id.startsWith('auto-'));
  const detected = data.items
    .filter((item) => item.id.startsWith('auto-'))
    .sort(
      (a, b) =>
        String(a._folder).localeCompare(String(b._folder), 'ru') ||
        a._order - b._order ||
        (a.number ?? 0) - (b.number ?? 0) ||
        String(a.title).localeCompare(String(b.title), 'ru')
    )
    .map(({ _order, _folder, ...item }) => item);

  data.items = [...manual, ...detected];
  data.fileCount = data.items.reduce((sum, item) => sum + item.files.length, 0);
  data.filters = {
    disciplines: uniqueValues(data.items, 'discipline'),
    kinds: uniqueValues(data.items, 'kind'),
    courses: uniqueValues(data.items, 'course').sort((a, b) => a - b),
  };

  totalItems += data.items.length;
  totalFiles += data.fileCount;

  if (data.items.length === 0) console.warn(`  раздел без материалов: ${section}`);
}

writeFileSync(OUT_FILE, `${JSON.stringify(index, null, 2)}\n`, 'utf8');

console.log(
  `Каталог собран: ${totalItems} материалов (${autoCount} распознано автоматически), ` +
    `${totalFiles} файлов в ${Object.keys(index).length} разделах → ${relative(ROOT, OUT_FILE)}`
);

if (problems) {
  console.error(`Обнаружено проблем: ${problems}`);
  process.exit(1);
}
