/**
 * Выбранный факультет запоминается между визитами: студент выбирает его
 * один раз, а не на каждой странице. Хранение в localStorage, без него
 * выбор просто действует до перезагрузки.
 */
const KEY = 'fn1-faculty';

export function readFaculty() {
  try {
    return localStorage.getItem(KEY) ?? '';
  } catch {
    return '';
  }
}

export function saveFaculty(value) {
  try {
    if (value) localStorage.setItem(KEY, value);
    else localStorage.removeItem(KEY);
  } catch {
    /* приватный режим — просто не запоминаем */
  }
}
