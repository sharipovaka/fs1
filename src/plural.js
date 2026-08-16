/**
 * Склонение существительных при числах.
 *
 * Правило русского языка: «1 файл», «2 файла», «5 файлов», но «11 файлов»
 * и «21 файл». Раньше счётчики сравнивали число с пятёркой, и на 11 или 21
 * получалось «11 файла».
 */
export function plural(count, one, few, many) {
  const lastDigit = count % 10;
  const lastTwo = count % 100;

  if (lastTwo >= 11 && lastTwo <= 14) return many;
  if (lastDigit === 1) return one;
  if (lastDigit >= 2 && lastDigit <= 4) return few;
  return many;
}

/** «3 файла», «11 файлов» */
export function files(count) {
  return `${count} ${plural(count, 'файл', 'файла', 'файлов')}`;
}

/** «3 материала», «11 материалов» */
export function materials(count) {
  return `${count} ${plural(count, 'материал', 'материала', 'материалов')}`;
}
