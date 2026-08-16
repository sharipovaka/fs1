import Icon from './Icon.jsx';
import { upcomingDeadlines } from '../deadlines.js';
import styles from './DisciplineSummary.module.css';

/**
 * Сводка в начале страницы дисциплины.
 *
 * Отвечает на два вопроса, с которыми студент заходит на страницу:
 * что это за курс и когда ближайший срок сдачи. Навигация по блокам
 * вынесена в боковую панель, поэтому здесь её нет.
 * Ближайший срок вычисляется по датам в браузере, поэтому «осталось 5 дней»
 * не устаревает между пересборками сайта.
 */
export default function DisciplineSummary({ discipline }) {
  const deadlines = upcomingDeadlines(discipline);
  const nearest = deadlines[0];

  const facts = [
    discipline.course && { icon: 'fa-solid fa-graduation-cap', text: discipline.course },
    discipline.semester && { icon: 'fa-solid fa-calendar-days', text: discipline.semester },
  ].filter(Boolean);

  return (
    <section className={styles.summary} aria-label="Кратко о дисциплине">
      <div className={styles.column}>
        <h2 className={styles.columnTitle}>Коротко</h2>

        {facts.length > 0 ? (
          <ul className={styles.facts}>
            {facts.map((fact) => (
              <li key={fact.text} className={styles.fact}>
                <Icon name={fact.icon} className={styles.factIcon} />
                {fact.text}
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.plain}>Материалы, общие для всех дисциплин.</p>
        )}

        <p className={styles.total}>
          <Icon name="fa-solid fa-download" className={styles.factIcon} />
          {discipline.fileCount} файлов в {discipline.groups.length}{' '}
          {discipline.groups.length === 1 ? 'блоке' : 'блоках'}
        </p>
      </div>

      <div className={styles.column}>
        <h2 className={styles.columnTitle}>Сроки сдачи</h2>

        {nearest ? (
          <>
            <div className={`${styles.nearest} ${styles[`due_${nearest.due.status}`]}`}>
              <span className={styles.nearestLabel}>Ближайший срок</span>
              <span className={styles.nearestWork}>
                {nearest.item.kind}
                {nearest.item.number ? ` № ${nearest.item.number}` : ''}
              </span>
              <span className={styles.nearestDate}>
                <Icon name="fa-regular fa-clock" className={styles.factIcon} /> до{' '}
                {nearest.due.date}
              </span>
              <span className={styles.nearestLeft}>{nearest.due.label}</span>
            </div>

            {deadlines.length > 1 && (
              <ul className={styles.rest}>
                {deadlines.slice(1).map(({ item, due }) => (
                  <li key={item.id} className={styles.restItem}>
                    <span className={styles.restWork}>
                      {item.kind}
                      {item.number ? ` № ${item.number}` : ''}
                    </span>
                    <span className={styles.restDate}>до {due.date}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className={styles.plain}>
            Работ с назначенным сроком сейчас нет.
          </p>
        )}
      </div>
    </section>
  );
}
