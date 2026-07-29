import { ICON_SET } from '../iconSet.generated.js';

/**
 * Инлайновая иконка.
 *
 * Заменяет собой шрифты Font Awesome: контуры нужных иконок собираются
 * при сборке (scripts/generate-icon-set.mjs) и попадают в общий бандл,
 * поэтому браузеру не приходится качать 300 КБ шрифтов ради трёх десятков
 * значков.
 *
 * Имя совпадает с классами Font Awesome, так что данные в navConfig.js
 * и таблицах соответствий менять не нужно: «fa-solid fa-download».
 *
 * Размер наследуется от кегля текста (1em), как и у шрифтовых иконок,
 * цвет — от currentColor.
 *
 * @param {object} props
 * @param {string} props.name      имя вида «fa-solid fa-download»
 * @param {string} [props.className] дополнительные классы (отступы Bootstrap и пр.)
 * @param {string} [props.title]   доступное описание; без него иконка скрыта от скринридеров
 */
export default function Icon({ name, className = '', title, ...rest }) {
  const icon = ICON_SET[name];

  // Иконки нет в наборе — не роняем страницу, просто ничего не рисуем.
  // Такой случай ловится на сборке: npm run icon-set сообщит об ошибке.
  if (!icon) {
    if (import.meta.env.DEV) console.warn(`Иконка не найдена в наборе: ${name}`);
    return null;
  }

  return (
    <svg
      className={`app-icon ${className}`.trim()}
      viewBox={icon.viewBox}
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : 'true'}
      focusable="false"
      {...rest}
    >
      {title && <title>{title}</title>}
      <path d={icon.d} />
    </svg>
  );
}
