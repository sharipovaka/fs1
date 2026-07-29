/**
 * Единый источник правды для структуры сайта.
 *
 * Этот же конфиг используют:
 *   - Navigation — построение выпадающих меню в навбаре;
 *   - Home       — плитки-ссылки на приветственной странице;
 *   - Layout     — «хлебные крошки» и заголовок вкладки браузера.
 *
 * Маршруты в App.jsx объявлены явно (каждому подразделу — свой компонент),
 * а пути здесь обязаны им соответствовать.
 */
export const MENU = [
  {
    id: 'disciplines',
    title: 'Дисциплины',
    icon: 'fa-solid fa-book-open-reader',
    basePath: '/disciplines',
    items: [
      {
        path: '/disciplines/plans',
        title: 'Планы',
        icon: 'fa-solid fa-list-check',
        description: 'Рабочие программы, тематические планы и распределение часов по семестрам.',
      },
      {
        path: '/disciplines/notes',
        title: 'Конспекты',
        icon: 'fa-solid fa-pen-nib',
        description: 'Лекционные материалы по математическому анализу, алгебре и уравнениям.',
      },
      {
        path: '/disciplines/templates',
        title: 'Шаблоны',
        icon: 'fa-solid fa-file-code',
        description: 'Титульные листы, LaTeX- и Jupyter-заготовки для отчётов и курсовых.',
      },
      {
        path: '/disciplines/tasks',
        title: 'Задания',
        icon: 'fa-solid fa-square-root-variable',
        description: 'Типовые расчёты, домашние задания и варианты контрольных работ.',
      },
    ],
  },
  {
    id: 'activities',
    title: 'Активности',
    icon: 'fa-solid fa-people-group',
    basePath: '/activities',
    items: [
      {
        path: '/activities/practice',
        title: 'Практика',
        icon: 'fa-solid fa-briefcase',
        description: 'Учебная и производственная практика: базы, сроки, отчётность.',
      },
      {
        path: '/activities/spring',
        title: 'Студвесна',
        icon: 'fa-solid fa-guitar',
        description: 'Творческий фестиваль: направления, репетиции и достижения лаборатории.',
      },
      {
        path: '/activities/seminars',
        title: 'Семинары',
        icon: 'fa-solid fa-chalkboard-user',
        description: 'Научный семинар лаборатории: расписание заседаний и темы докладов.',
      },
      {
        path: '/activities/reports',
        title: 'Доклады',
        icon: 'fa-solid fa-microphone-lines',
        description: 'Студенческие доклады, требования к презентациям и лучшие работы.',
      },
      {
        path: '/activities/conferences',
        title: 'Конференции',
        icon: 'fa-solid fa-globe',
        description: 'Прошедшие и предстоящие конференции, дедлайны подачи тезисов.',
      },
    ],
  },
];

/** Плоский список всех подразделов — удобен для поиска по текущему URL. */
export const ALL_SECTIONS = MENU.flatMap((group) =>
  group.items.map((item) => ({ ...item, groupTitle: group.title, groupId: group.id }))
);

/**
 * Находит описание раздела по пути.
 * @param {string} pathname путь из useLocation()
 * @returns {object|undefined}
 */
export function findSection(pathname) {
  return ALL_SECTIONS.find((section) => section.path === pathname);
}
