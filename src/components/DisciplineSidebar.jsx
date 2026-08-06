import { Link, useLocation } from 'react-router-dom';

import Icon from './Icon.jsx';
import { DISCIPLINES } from '../catalog.js';
import styles from './DisciplineSidebar.module.css';

/**
 * Боковая навигация страницы дисциплины.
 *
 * Работает как переключатель: выбранный блок открывается один, остальные
 * скрыты — страница не растёт в длину и не приходится прокручивать мимо
 * ненужного. Выбор хранится в адресе (…/calculus#tasks), поэтому ссылку
 * на конкретный блок можно отправить студенту, а кнопки браузера
 * «назад» и «вперёд» работают как обычно.
 *
 * Снизу — переход к другим дисциплинам без возврата в меню.
 *
 * @param {object} props
 * @param {object} props.discipline текущая дисциплина из каталога
 * @param {string} props.activeType идентификатор открытого блока
 */
export default function DisciplineSidebar({ discipline, activeType }) {
  const { pathname } = useLocation();
  const others = DISCIPLINES.filter((item) => item.id !== discipline.id);

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav} aria-label="Разделы дисциплины">
        <p className={styles.caption}>Разделы</p>
        <ul className={styles.list}>
          {discipline.groups.map((group) => {
            const isActive = group.type === activeType;
            return (
              <li key={group.type}>
                <Link
                  to={{ pathname, hash: group.type }}
                  className={`${styles.link} ${isActive ? styles.linkActive : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon name={group.icon} className={styles.linkIcon} />
                  <span className={styles.linkTitle}>{group.title}</span>
                  <span className={styles.count}>{group.fileCount}</span>
                </Link>
              </li>
            );
          })}
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
