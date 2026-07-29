/**
 * Работа с каталогом материалов: поиск и фильтрация.
 *
 * Данные приходят из src/content/catalogIndex.json — он собирается скриптом
 * scripts/generate-catalog.mjs по описаниям из папки catalog/ и содержимому
 * public/files. Здесь только чтение и фильтрация, без обращений к диску.
 */
import catalogIndex from './content/catalogIndex.json';
import { ALL_SECTIONS } from './navConfig.js';

export { catalogIndex };

/** Данные одного раздела (или пустая заготовка, если раздел ещё не наполнен). */
export function getSection(sectionKey) {
  return (
    catalogIndex[sectionKey] ?? {
      intro: '',
      items: [],
      filters: { disciplines: [], kinds: [], courses: [] },
      fileCount: 0,
    }
  );
}

/** Приведение строки к виду, удобному для поиска без учёта регистра и «ё». */
function normalize(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/ё/g, 'е');
}

/**
 * Набор слов, по которым ищется материал: заголовок, тип, дисциплина, номер,
 * сроки, а также имена и подписи всех его файлов.
 *
 * Курс и семестр намеренно не включены: они вынесены в отдельные фильтры,
 * иначе запрос «типовой расчёт 1» находил бы все работы первого курса.
 */
function searchTokens(item) {
  const parts = [
    item.title,
    item.kind,
    item.discipline,
    item.deadline,
    item.number != null ? String(item.number) : '',
    ...item.files.flatMap((file) => [file.name, file.label, file.format]),
  ];

  // Разбиение по любым символам, кроме букв и цифр: «tr-01-varianty.csv»
  // даёт токены «tr», «01», «varianty», «csv».
  return normalize(parts.filter(Boolean).join(' '))
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

/**
 * Совпадение одного слова запроса с набором токенов материала.
 *
 * Слова из букв сравниваются по началу токена — «линейн» найдёт «линейная».
 * Числа сравниваются точно, иначе запрос «№ 1» попадал бы и в «15-й недели»,
 * и в «tr-01».
 */
function wordMatches(word, tokens) {
  const isNumber = /^\p{N}+$/u.test(word);
  return isNumber
    ? tokens.some((token) => token === word)
    : tokens.some((token) => token.startsWith(word));
}

/**
 * Фильтрация списка материалов.
 * Пустое значение фильтра означает «без ограничения».
 *
 * @param {Array}  items
 * @param {object} criteria { query, discipline, course, kind }
 */
export function filterItems(items, { query = '', discipline = '', course = '', kind = '' } = {}) {
  // Запрос разбивается на слова: «типовой 1 линейная» найдёт ровно одну работу
  const words = normalize(query)
    .split(/[^\p{L}\p{N}№]+/u)
    .map((word) => word.replace(/№/g, ''))
    .filter(Boolean);

  return items.filter((item) => {
    if (discipline && item.discipline !== discipline) return false;
    if (kind && item.kind !== kind) return false;
    if (course && String(item.course) !== String(course)) return false;

    if (!words.length) return true;
    const tokens = searchTokens(item);
    return words.every((word) => wordMatches(word, tokens));
  });
}

/**
 * Все материалы сайта одним списком — для общего поиска на главной странице.
 * К каждому материалу добавляются ключ и название раздела.
 */
export function getAllMaterials() {
  return ALL_SECTIONS.flatMap((section) => {
    const key = section.path.replace(/^\//, '');
    return getSection(key).items.map((item) => ({
      ...item,
      sectionKey: key,
      sectionPath: section.path,
      sectionTitle: section.title,
    }));
  });
}

/** Сколько файлов лежит в разделе (для подписей в меню и на плитках). */
export function getFileCount(sectionKey) {
  return getSection(sectionKey).fileCount;
}
