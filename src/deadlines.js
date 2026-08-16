/**
 * Работа со сроками сдачи.
 *
 * Преподаватель указывает в _meta.json только дату («due»: «2026-10-14»),
 * а сайт сам считает, сколько осталось, и подставляет метку состояния.
 * Пересобирать сайт для этого не нужно: расчёт идёт в браузере при открытии
 * страницы, поэтому «осталось 3 дня» всегда актуально.
 */

import { plural } from './plural.js';

const MONTHS = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

/** Число «скоро дедлайн»: за сколько дней метка становится жёлтой. */
const SOON_DAYS = 14;

/** «2026-10-14» → отметка времени полуночи этого дня. */
function parseDate(iso) {
  const [year, month, day] = String(iso).split('-').map(Number);
  if (!year || !month || !day) return NaN;
  return new Date(year, month - 1, day).getTime();
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

/** «2026-10-14» → «14 октября 2026». */
export function formatDate(iso) {
  const [year, month, day] = String(iso).split('-').map(Number);
  if (!year || !month || !day) return String(iso);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}



/**
 * Разбор срока сдачи.
 *
 * @param {string} due дата в формате ГГГГ-ММ-ДД
 * @returns {{date: string, daysLeft: number, status: 'open'|'soon'|'done', label: string}|null}
 */
export function describeDue(due) {
  const target = parseDate(due);
  if (Number.isNaN(target)) return null;

  const daysLeft = Math.round((target - startOfToday()) / 86400000);

  if (daysLeft < 0) {
    return { date: formatDate(due), daysLeft, status: 'done', label: 'приём закрыт' };
  }
  if (daysLeft === 0) {
    return { date: formatDate(due), daysLeft, status: 'soon', label: 'сегодня последний день' };
  }
  if (daysLeft <= SOON_DAYS) {
    return {
      date: formatDate(due),
      daysLeft,
      status: 'soon',
      label: `осталось ${daysLeft} ${plural(daysLeft, 'день', 'дня', 'дней')}`,
    };
  }
  return { date: formatDate(due), daysLeft, status: 'open', label: 'приём открыт' };
}

/**
 * Ближайшие несданные работы дисциплины — для сводки в начале страницы.
 * Работы с прошедшим сроком в список не попадают.
 */
export function upcomingDeadlines(discipline) {
  return discipline.groups
    .flatMap((group) => group.items)
    .filter((item) => item.due)
    .map((item) => ({ item, due: describeDue(item.due) }))
    .filter((entry) => entry.due && entry.due.status !== 'done')
    .sort((a, b) => a.due.daysLeft - b.due.daysLeft);
}
