/**
 * Выбор студента — факультет и семестр — запоминается между визитами:
 * он делается один раз, а не на каждой странице. Хранение в localStorage;
 * если оно недоступно (приватный режим), выбор просто действует
 * до перезагрузки.
 */
const KEYS = { faculty: 'fn1-faculty', semester: 'fn1-semester' };

/** Пустая строка означает «показывать всё». */
export const EMPTY_CHOICE = { faculty: '', semester: '' };

export function readChoice() {
  try {
    return {
      faculty: localStorage.getItem(KEYS.faculty) ?? '',
      semester: localStorage.getItem(KEYS.semester) ?? '',
    };
  } catch {
    return { ...EMPTY_CHOICE };
  }
}

export function saveChoice(choice) {
  try {
    for (const [field, key] of Object.entries(KEYS)) {
      const value = choice[field];
      if (value === '' || value === undefined || value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, String(value));
    }
  } catch {
    /* приватный режим — просто не запоминаем */
  }
}
