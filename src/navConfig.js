/**
 * Структура меню сайта.
 *
 * Строится из каталога, поэтому добавленная в catalog/site.json дисциплина
 * появляется в меню сама — править этот файл не нужно.
 */
import { ABOUT, ACTIVITIES, DISCIPLINES } from './catalog.js';

export const MENU = [
  {
    id: 'disciplines',
    title: 'Дисциплины',
    icon: 'fa-solid fa-book-open-reader',
    basePath: '/disciplines',
    items: DISCIPLINES.map((discipline) => ({
      path: `/disciplines/${discipline.id}`,
      title: discipline.title,
      icon: discipline.icon,
      description: discipline.description,
      hint: discipline.meta,
      fileCount: discipline.fileCount,
    })),
  },
  {
    id: 'activities',
    title: 'Активности',
    icon: 'fa-solid fa-people-group',
    basePath: '/activities',
    items: ACTIVITIES.map((section) => ({
      path: `/activities/${section.id}`,
      title: section.title,
      icon: section.icon,
      description: section.menuHint ?? section.description,
      fileCount: section.fileCount,
    })),
  },
  {
    id: 'about',
    title: 'О лаборатории',
    icon: 'fa-solid fa-landmark',
    basePath: '/about',
    items: ABOUT.map((section) => ({
      path: `/about/${section.id}`,
      title: section.title,
      icon: section.icon,
      description: section.menuHint ?? section.description,
      fileCount: section.fileCount,
    })),
  },
];

/** Плоский список всех страниц — для «хлебных крошек» и заголовка вкладки. */
export const ALL_SECTIONS = MENU.flatMap((group) =>
  group.items.map((item) => ({ ...item, groupTitle: group.title, groupId: group.id }))
);

/** Описание страницы по адресу. */
export function findSection(pathname) {
  return ALL_SECTIONS.find((section) => section.path === pathname);
}
