/**
 * Сборка каталога материалов для сайта.
 *
 * Структура папок повторяет структуру сайта:
 *
 *   public/files/disciplines/<дисциплина>/<тип>/файлы   → страница дисциплины
 *   public/files/activities/<раздел>/файлы              → раздел «Активности»
 *   public/files/about/<раздел>/файлы                   → раздел «О лаборатории»
 *
 * Названия дисциплин, порядок блоков и описания задаются в catalog/site.json.
 * Описания конкретных работ — в необязательном _meta.json рядом с файлами.
 * Всё, что не описано, распознаётся по именам файлов. Работу можно объявить
 * и до того, как файл готов: «"placeholder": true» в _meta.json; вместо файла
 * можно указать ссылку наружу («"url": "https://…"»), а книге из списка
 * литературы — ссылку на каталог библиотеки («"catalog": "https://…"»).
 *
 * Результат: src/content/catalogIndex.json
 * Запуск: npm run catalog
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE_FILE = join(ROOT, 'catalog', 'site.json');
const FILES_DIR = join(ROOT, 'public', 'files');
const PREVIEWS_DIR = join(ROOT, 'public', 'previews');
const OUT_FILE = join(ROOT, 'src', 'content', 'catalogIndex.json');
const SEMINARS_SRC = join(ROOT, 'catalog', 'seminars.json');
const SEMINARS_OUT = join(ROOT, 'src', 'content', 'seminars.json');

const META_FILE_NAME = '_meta.json';

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

/** Тип работы по началу имени файла: «tr-01-usloviya.tex» → «Типовой расчёт № 1». */
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

/** Назначение файла по концу имени: «tr-01-usloviya.tex» → «Условия задач». */
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

/** Файлы LaTeX, которые студент скачивает готовым PDF (а не исходником). */
const PDF_BY_NAME = /(usloviya|zadanie|bilety|zadachi)/i;

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

/** Файлы каталога без служебных и скрытых. */
function listFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => !name.startsWith('.') && name !== META_FILE_NAME)
    .filter((name) => statSync(join(dir, name)).isFile())
    .sort();
}

function listDirs(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => !name.startsWith('.'))
    .filter((name) => statSync(join(dir, name)).isDirectory())
    .sort();
}

function prettify(name) {
  const text = name.replace(/[-_]+/g, ' ').trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

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
  return { groupKey: base, code: null, number: null, suffix: '' };
}

function describeRole(suffix, fileName) {
  for (const [key, role] of Object.entries(ROLE_BY_SUFFIX)) {
    if (suffix.includes(key)) return role;
  }
  return { label: prettify(basename(fileName, extname(fileName))), order: 9 };
}

/** Предпросмотр: PDF (для .tex), HTML (для .md/.ipynb/.csv) либо сам PDF. */
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

  // Готовый PDF: сам файл и есть предпросмотр, миниатюра лежит рядом в previews/
  if (extname(relPath).toLowerCase() === '.pdf') {
    const thumb = `${withoutExt}.png`;
    return {
      type: 'pdf',
      path: `files/${relPath}`,
      ...(existsSync(join(PREVIEWS_DIR, thumb)) ? { thumb: `previews/${thumb}` } : {}),
    };
  }

  return null;
}

/** Что скачивается по кнопке: готовый PDF для условий, исходник для шаблонов. */
function describeDownload(relPath, ext, preview, sourceSize, prefer) {
  const name = relPath.split('/').pop();
  const wantsPdf = prefer ? prefer === 'pdf' : PDF_BY_NAME.test(name);

  if (ext === '.tex' && wantsPdf && preview?.type === 'pdf') {
    const pdfFull = join(ROOT, 'public', preview.path);
    return {
      path: preview.path,
      name: name.replace(/\.tex$/i, '.pdf'),
      format: 'PDF',
      size: existsSync(pdfFull) ? statSync(pdfFull).size : 0,
      compiled: true,
    };
  }

  return {
    path: `files/${relPath}`,
    name,
    format: FORMAT_BY_EXT[ext] ?? ext.replace('.', '').toUpperCase(),
    size: sourceSize,
    compiled: false,
  };
}

/** Полное описание файла: размер, формат, предпросмотр, цель скачивания. */
function describeFile(relPath, fileMeta = {}, role = {}) {
  const full = join(FILES_DIR, relPath);
  if (!existsSync(full)) {
    console.error(`  ОШИБКА: файл не найден — ${relPath}`);
    problems += 1;
    return null;
  }

  const ext = extname(relPath).toLowerCase();
  const size = statSync(full).size;
  const preview = findPreview(relPath);

  return {
    path: relPath,
    name: relPath.split('/').pop(),
    ext: ext.replace('.', ''),
    format: FORMAT_BY_EXT[ext] ?? ext.replace('.', '').toUpperCase(),
    size,
    label: fileMeta.label ?? role.label ?? '',
    primary: Boolean(fileMeta.primary ?? role.primary),
    preview,
    download: describeDownload(relPath, ext, preview, size, fileMeta.download),
  };
}

/**
 * Метка факультета у работы.
 *
 * В _meta.json пишут «faculty»: «мт» либо список [«фн», «мт»].
 * Пустое значение означает, что материал общий для всех факультетов.
 * Здесь коды приводятся к тем, что перечислены в catalog/site.json.
 */
function normalizeFaculties(value, known) {
  if (!value) return [];
  const list = Array.isArray(value) ? value : [value];

  return list
    .map((entry) => {
      const key = String(entry).trim().toLowerCase();
      const found = known.find(
        (faculty) =>
          faculty.id.toLowerCase() === key ||
          (faculty.short ?? '').toLowerCase() === key ||
          faculty.title.toLowerCase() === key
      );
      if (!found) {
        console.warn(`  неизвестный факультет «${entry}» — проверьте список в catalog/site.json`);
        return null;
      }
      return found.id;
    })
    .filter(Boolean);
}

function finalizeItem(item) {
  return {
    ...item,
    hasPreview: item.files.some((file) => file.preview),
    thumb: item.files.find((file) => file.preview?.thumb)?.preview.thumb ?? null,
  };
}

/**
 * Собирает материалы одной папки.
 *
 * Сначала берутся работы, для которых в _meta.json явно перечислены файлы,
 * затем остальные файлы группируются по именам: «tr-01-usloviya» и
 * «tr-01-varianty» попадают в одну работу «Типовой расчёт № 1».
 */
function collectFolder(folderRel, faculties = []) {
  const dir = join(FILES_DIR, folderRel);
  const meta = readJson(join(dir, META_FILE_NAME), {}) ?? {};
  const files = listFiles(dir);
  const used = new Set();
  const items = [];

  // 1. Заглушки и работы с явно перечисленными файлами
  for (const [key, itemMeta] of Object.entries(meta.items ?? {})) {
    // Внешний ресурс: вместо файла ссылка — «"url": "https://…"».
    // Так на страницу попадают электронная библиотека, сторонние задачники
    // и прочее, что лежит не у нас. Такие карточки идут в конце раздела.
    if (itemMeta.url) {
      items.push({
        key,
        meta: itemMeta,
        files: [],
        link: itemMeta.url,
        order: 100,
        number: itemMeta.number ?? null,
      });
      continue;
    }

    // Заглушка — работа объявлена, файлов ещё нет: «"placeholder": true»
    // в _meta.json. Так в разделе заранее видно, что в нём будет.
    // Когда файл загружен, строчку из _meta.json можно убрать —
    // работа соберётся по имени файла, как обычно.
    if (itemMeta.placeholder) {
      const parsed = parseFileName(key);
      items.push({
        key,
        meta: itemMeta,
        files: [],
        placeholder: true,
        order: parsed.code ? KIND_ORDER.indexOf(parsed.code) : 99,
        number: itemMeta.number ?? parsed.number,
        code: parsed.code,
      });
      continue;
    }

    // Книга из списка литературы: ссылка на каталог библиотеки, файла может
    // и не быть — тогда карточка честно говорит, что читать её надо там.
    if (!Array.isArray(itemMeta.files)) {
      if (itemMeta.catalog) {
        items.push({ key, meta: itemMeta, files: [], order: -1, number: itemMeta.number ?? null });
      }
      continue;
    }

    const collected = itemMeta.files
      .map((name) => {
        used.add(name);
        const parsed = parseFileName(name);
        return describeFile(`${folderRel}/${name}`, meta.files?.[name] ?? {}, describeRole(parsed.suffix, name));
      })
      .filter(Boolean);

    if (!collected.length) continue;
    if (!collected.some((f) => f.primary)) collected[0].primary = true;

    items.push({ key, meta: itemMeta, files: collected, order: -1, number: itemMeta.number ?? null });
  }

  // 2. Остальные файлы — группировка по соглашению об именах
  const groups = new Map();
  for (const name of files) {
    if (used.has(name)) continue;
    const parsed = parseFileName(name);
    if (!groups.has(parsed.groupKey)) groups.set(parsed.groupKey, { parsed, names: [] });
    groups.get(parsed.groupKey).names.push(name);
  }

  for (const [key, group] of groups) {
    const collected = group.names
      .map((name) => {
        const parsed = parseFileName(name);
        const role = describeRole(parsed.suffix, name);
        const described = describeFile(`${folderRel}/${name}`, meta.files?.[name] ?? {}, role);
        return described ? { ...described, order: role.order ?? 9 } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.order - b.order)
      .map(({ order, ...file }) => file);

    if (!collected.length) continue;
    if (!collected.some((f) => f.primary)) collected[0].primary = true;

    items.push({
      key,
      meta: meta.items?.[key] ?? {},
      files: collected,
      // Работы с распознанным типом (tr-01, lecture-04) идут первыми
      // и по возрастанию номера, остальные материалы — следом.
      order: group.parsed.code ? KIND_ORDER.indexOf(group.parsed.code) : 99,
      number: group.parsed.number,
      code: group.parsed.code,
    });
  }

  // 3. Приводим к виду, который ждёт интерфейс
  // Работы с номером идут по возрастанию, а всё, что без номера, — после них:
  // «Типовой расчёт № 1» логично видеть раньше отдельного задания без номера.
  const numberOf = (item) =>
    item.number === undefined || item.number === null || item.number === ''
      ? Number.MAX_SAFE_INTEGER
      : Number(item.number);

  const result = items
    .sort((a, b) => a.order - b.order || numberOf(a) - numberOf(b) || a.key.localeCompare(b.key, 'ru'))
    .map((entry) =>
      finalizeItem({
        id: `${folderRel}/${entry.key}`.replace(/[^\w-]+/g, '-'),
        kind: entry.meta.kind ?? (entry.code ? KIND_BY_CODE[entry.code] : 'Материал'),
        number: entry.meta.number ?? entry.number ?? undefined,
        title: entry.meta.title ?? entry.files[0]?.label ?? '',
        description: entry.meta.description ?? '',
        // Ссылка наружу вместо файлов
        link: entry.link ?? '',
        // Карточка книги: ссылка на каталог библиотеки рядом с файлом
        catalog: entry.meta.catalog ?? '',
        // «groups» — файлы показываются плитками по группам, а не списком
        layout: entry.meta.layout ?? '',
        // Заглушка: карточка есть, скачивать пока нечего
        placeholder: Boolean(entry.placeholder),
        course: entry.meta.course,
        semester: entry.meta.semester,
        deadline: entry.meta.deadline ?? '',
        // Заметка к работе: сколько вариантов, из чего состоит. Это не срок
        // сдачи, поэтому и поле отдельное — иначе рядом с ней рисуются часы.
        note: entry.meta.note ?? '',
        faculties: normalizeFaculties(entry.meta.faculty, faculties),
        // Дата сдачи в формате ГГГГ-ММ-ДД: по ней сайт сам считает,
        // сколько осталось, и подставляет метку статуса.
        due: entry.meta.due ?? '',
        status: entry.meta.status ?? '',
        statusLabel: entry.meta.statusLabel ?? '',
        files: entry.files,
      })
    );

  return { items: result, description: meta.description ?? '' };
}

/* --- основной проход --- */

const site = readJson(SITE_FILE);
if (!site) {
  console.error(`Не удалось прочитать ${relative(ROOT, SITE_FILE)}`);
  process.exit(1);
}

const known = new Set();
let totalFiles = 0;
let totalItems = 0;

/** Дисциплины: внутри каждой — блоки по типам материалов. */
const disciplines = site.disciplines.map((discipline) => {
  const groups = [];
  let fileCount = 0;

  for (const type of site.types) {
    const folderRel = `disciplines/${discipline.id}/${type.id}`;
    if (!existsSync(join(FILES_DIR, folderRel))) continue;

    const { items, description } = collectFolder(folderRel, site.faculties ?? []);
    if (!items.length) continue;

    items.forEach((item) => item.files.forEach((f) => known.add(f.path)));
    const count = items.reduce((sum, item) => sum + item.files.length, 0);
    fileCount += count;
    totalItems += items.length;

    groups.push({
      type: type.id,
      title: type.title,
      icon: type.icon,
      description: description || type.description,
      items,
      fileCount: count,
    });
  }

  // Признаки, по которым на странице строятся переключатели.
  // Если у работ дисциплины признак не проставлен, переключателя не будет.
  const usedFaculties = (site.faculties ?? [])
    .map((faculty) => faculty.id)
    .filter((id) => groups.some((group) => group.items.some((item) => item.faculties.includes(id))));

  // Семестры: одна дисциплина может читаться в первом и третьем семестрах
  // разными работами — их нужно уметь разделить.
  const usedSemesters = [
    ...new Set(
      groups.flatMap((group) =>
        group.items.map((item) => item.semester).filter((value) => value !== undefined && value !== '')
      )
    ),
  ].sort((a, b) => Number(a) - Number(b));

  totalFiles += fileCount;
  return {
    ...discipline,
    // Прежние адреса дисциплины: по ним старые ссылки доедут до нового раздела
    aliases: discipline.aliases ?? [],
    groups,
    fileCount,
    faculties: usedFaculties,
    semesters: usedSemesters,
  };
});

/** Плоские разделы: активности и «О лаборатории». */
function buildFlatSections(list, prefix) {
  return list.map((section) => {
    const folderRel = `${prefix}/${section.id}`;
    const { items, description } = existsSync(join(FILES_DIR, folderRel))
      ? collectFolder(folderRel, site.faculties ?? [])
      : { items: [], description: '' };

    items.forEach((item) => item.files.forEach((f) => known.add(f.path)));
    const fileCount = items.reduce((sum, item) => sum + item.files.length, 0);
    totalFiles += fileCount;
    totalItems += items.length;

    return { ...section, description: description || section.description, items, fileCount };
  });
}

const activities = buildFlatSections(site.activities, 'activities');
const about = buildFlatSections(site.about, 'about');

/* Предупреждаем о файлах, которые лежат вне известных разделов */
function walkAll(dir, base = dir) {
  if (!existsSync(dir)) return [];
  const result = [];
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.') || name === META_FILE_NAME) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) result.push(...walkAll(full, base));
    else result.push(relative(base, full).split(/[\\/]/).join('/'));
  }
  return result;
}

for (const path of walkAll(FILES_DIR)) {
  if (known.has(path)) continue;
  console.warn(`  файл вне структуры сайта, на страницы не попадёт: ${path}`);
}

writeFileSync(
  OUT_FILE,
  `${JSON.stringify({ types: site.types, faculties: site.faculties ?? [], disciplines, activities, about, totals: { files: totalFiles, items: totalItems } }, null, 2)}\n`,
  'utf8'
);

// Расписание семинара кладём рядом с каталогом, чтобы страница импортировала
// его как обычные данные и не зависела от расположения папки catalog/.
const seminars = readJson(SEMINARS_SRC);
if (seminars) {
  writeFileSync(SEMINARS_OUT, `${JSON.stringify(seminars, null, 2)}\n`, 'utf8');
} else {
  console.warn('  расписание семинаров не найдено — страница покажет пустую таблицу');
}

console.log(
  `Каталог собран: ${disciplines.length} дисциплин, ${activities.length + about.length} прочих разделов, ` +
    `${totalItems} материалов, ${totalFiles} файлов → ${relative(ROOT, OUT_FILE)}`
);

if (problems) {
  console.error(`Обнаружено проблем: ${problems}`);
  process.exit(1);
}
