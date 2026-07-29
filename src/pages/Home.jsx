import { Link } from 'react-router-dom';

import { MENU } from '../navConfig.js';
import styles from './Home.module.css';

/**
 * Приветственная страница на корневом пути «/».
 * Дублирует структуру навбара в виде плиток — так посетитель сразу видит
 * все девять подразделов сайта.
 */
export default function Home() {
  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Лаборатория математики ФН1</h1>
        <p className={styles.heroText}>
          Учебные планы и конспекты, шаблоны работ и задания, практика, семинары, доклады
          и конференции — все материалы лаборатории собраны в одном месте и открываются
          без перезагрузки страницы.
        </p>
        <div className={styles.heroActions}>
          <Link className="btn btn-primary" to="/disciplines/plans">
            <i className="fa-solid fa-list-check me-2" aria-hidden="true" />
            Перейти к учебным планам
          </Link>
          <Link className="btn btn-outline-primary" to="/activities/seminars">
            <i className="fa-solid fa-chalkboard-user me-2" aria-hidden="true" />
            Расписание семинаров
          </Link>
        </div>
      </section>

      {MENU.map((group) => (
        <section key={group.id} className={styles.group}>
          <h2 className={styles.groupTitle}>
            <i className={`${group.icon} ${styles.groupIcon}`} aria-hidden="true" />
            {group.title}
          </h2>

          <div className={styles.cards}>
            {group.items.map((item) => (
              <Link key={item.path} to={item.path} className={styles.card}>
                <span className={styles.cardIcon}>
                  <i className={item.icon} aria-hidden="true" />
                </span>
                <span className={styles.cardBody}>
                  <span className={styles.cardTitle}>{item.title}</span>
                  <span className={styles.cardText}>{item.description}</span>
                </span>
                <i className={`fa-solid fa-arrow-right ${styles.cardArrow}`} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
