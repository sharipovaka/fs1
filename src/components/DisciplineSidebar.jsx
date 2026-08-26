import { useEffect, useState } from 'react';

import Icon from './Icon.jsx';
import styles from './DisciplineSidebar.module.css';

/**
 * Боковая навигация страницы дисциплины.
 *
 * Все разделы выведены на странице подряд, поэтому панель ничего не
 * переключает: она показывает, что вообще есть у дисциплины, и позволяет
 * сразу перепрыгнуть к нужному. Раздел, который сейчас на экране,
 * подсвечивается при прокрутке.
 *
 * Счётчик у раздела — число работ, а не файлов: у объявленной работы
 * файлов может ещё не быть.
 *
 * @param {object} props
 * @param {object} props.discipline текущая дисциплина из каталога
 * @param {string[]} props.visibleTypes разделы, оставшиеся после фильтра факультета
 */
export default function DisciplineSidebar({ discipline, visibleTypes }) {
  const groups = discipline.groups.filter((group) => visibleTypes.includes(group.type));
  const [activeType, setActiveType] = useState(groups[0]?.type ?? '');

  // Подсветка раздела, который сейчас на экране
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;

    const sections = groups.map((group) => document.getElementById(group.type)).filter(Boolean);
    if (!sections.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        // Активным считаем самый верхний из видимых сейчас разделов
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) setActiveType(visible[0].target.id);
      },
      // Полоса внимания — верхняя часть экрана, под фиксированной шапкой
      { rootMargin: '-15% 0px -70% 0px', threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
    // Пересобираем наблюдение, когда меняется набор разделов
  }, [groups.map((group) => group.type).join(',')]);

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav} aria-label="Разделы дисциплины">
        <p className={styles.caption}>На этой странице</p>
        <ul className={styles.list}>
          {groups.map((group) => {
            const isActive = group.type === activeType;
            return (
              <li key={group.type}>
                <a
                  href={`#${group.type}`}
                  className={`${styles.link} ${isActive ? styles.linkActive : ''}`}
                  aria-current={isActive ? 'true' : undefined}
                >
                  <Icon name={group.icon} className={styles.linkIcon} />
                  <span className={styles.linkTitle}>{group.title}</span>
                  <span className={styles.count}>{group.items.length}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
