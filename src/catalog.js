/**
 * Доступ к каталогу материалов.
 *
 * Данные лежат в src/content/catalogIndex.json — его собирает скрипт
 * scripts/generate-catalog.mjs из catalog/site.json и содержимого public/files.
 * Здесь только чтение, поиск и мелкие производные величины.
 */
import catalogIndex from './content/catalogIndex.json';

export const TYPES = catalogIndex.types;
export const DISCIPLINES = catalogIndex.disciplines;
export const ACTIVITIES = catalogIndex.activities;
export const ABOUT = catalogIndex.about;
export const TOTALS = catalogIndex.totals;

/** Дисциплина по идентификатору (он же имя папки). */
export function getDiscipline(id) {
  return DISCIPLINES.find((item) => item.id === id) ?? null;
}

/** Раздел «Активностей» по идентификатору. */
export function getActivity(id) {
  return ACTIVITIES.find((item) => item.id === id) ?? null;
}

/** Раздел «О лаборатории» по идентификатору. */
export function getAbout(id) {
  return ABOUT.find((item) => item.id === id) ?? null;
}

/** Приведение строки к виду, удобному для поиска: без регистра и без «ё». */
function normalize(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/ё/g, 'е');
}

/** Текст, по которому ищется материал. */
function searchableText(item) {
  const parts = [
    item.title,
    item.kind,
    item.discipline,
    item.groupTitle,
    item.sectionTitle,
    item.number ? `№ ${item.number} ${item.number}` : '',
    item.course ? `${item.course} курс` : '',
    item.deadline,
    ...item.files.flatMap((file) => [file.name, file.label, file.format]),
  ];
  return normalize(parts.filter(Boolean).join(' '));
}

/**
 * Поиск по списку материалов. Запрос разбивается на слова:
 * «тр 1 линейная» найдёт типовой расчёт № 1 по линейной алгебре.
 */
export function filterItems(items, { query = '' } = {}) {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (!words.length) return items;

  return items.filter((item) => {
    const haystack = searchableText(item);
    return words.every((word) => haystack.includes(word));
  });
}

/**
 * Все материалы сайта одним списком — для сквозного поиска на главной.
 * К каждому добавляются название раздела и ссылка на него.
 */
export function getAllMaterials() {
  const result = [];

  for (const discipline of DISCIPLINES) {
    for (const group of discipline.groups) {
      for (const item of group.items) {
        result.push({
          ...item,
          discipline: discipline.title,
          groupTitle: group.title,
          sectionTitle: `${discipline.short ?? discipline.title} · ${group.title}`,
          sectionPath: `/disciplines/${discipline.id}#${group.type}`,
        });
      }
    }
  }

  for (const [sections, prefix] of [
    [ACTIVITIES, '/activities'],
    [ABOUT, '/about'],
  ]) {
    for (const section of sections) {
      for (const item of section.items) {
        result.push({
          ...item,
          sectionTitle: section.title,
          sectionPath: `${prefix}/${section.id}`,
        });
      }
    }
  }

  return result;
}
