import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import Icon from './Icon.jsx';
import { DISCIPLINES } from '../catalog.js';
import styles from './DisciplineSidebar.module.css';

/**
 * Боковая навигация страницы дисциплины.
 *
 * Сверху — блоки текущей дисциплины: видно, что есть на странице, и можно
 * перейти к нужному, не прокручивая. Активный блок подсвечивается при
 * прокрутке, поэтому всегда понятно, где вы находитесь.
 * Снизу — переход к другим дисциплинам без возврата в меню.
 *
 * На узких экранах панель встаёт над содержимым и прокручивается вбок.
 *
 * @param {object} props
 * @param {object} props.discipline текущая дисциплина из каталога
 */
export default function DisciplineSidebar({ discipline }) {
  const [activeType, setActiveType] = useState(discipline.groups[0]?.type ?? '');

  // Подсветка блока, который сейчас на экране
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;

    const sections = discipline.groups
      .map((group) => document.getElementById(group.type))
      .filter(Boolean);

    if (!sections.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        // Активным считаем самый верхний из видимых сейчас блоков
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) setActiveType(visible[0].target.id);
      },
      // Полоса внимания — верхняя треть экрана, под фиксированным навбаром
      { rootMargin: '-20% 0px -65% 0px', threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [discipline.groups]);

  const others = DISCIPLINES.filter((item) => item.id !== discipline.id);

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav} aria-label="Разделы дисциплины">
        <p className={styles.caption}>На этой странице</p>
        <ul className={styles.list}>
          {discipline.groups.map((group) => (
            <li key={group.type}>
              <a
                href={`#${group.type}`}
                className={`${styles.link} ${activeType === group.type ? styles.linkActive : ''}`}
                aria-current={activeType === group.type ? 'true' : undefined}
              >
                <Icon name={group.icon} className={styles.linkIcon} />
                <span className={styles.linkTitle}>{group.title}</span>
                <span className={styles.count}>{group.fileCount}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <nav className={styles.nav} aria-label="Другие дисциплины">
        <p className={styles.caption}>Другие дисциплины</p>
        <ul className={styles.list}>
          {others.map((item) => (
            <li key={item.id}>
              <Link to={`/disciplines/${item.id}`} className={styles.link}>
                <Icon name={item.icon} className={styles.linkIcon} />
                <span className={styles.linkTitle}>{item.short ?? item.title}</span>
                <span className={styles.count}>{item.fileCount}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
