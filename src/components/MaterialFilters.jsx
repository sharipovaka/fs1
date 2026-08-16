import Icon from './Icon.jsx';
import { FACULTIES } from '../catalog.js';
import styles from './MaterialFilters.module.css';

/**
 * Переключатели над материалами дисциплины: факультет и семестр.
 *
 * Одна дисциплина читается на разных факультетах по разным программам
 * и растянута на несколько семестров. Переключатели оставляют на странице
 * только подходящие работы; материалы без метки считаются общими
 * и видны всегда — конспекты и учебники не зависят ни от факультета,
 * ни от семестра.
 *
 * Ряд появляется только там, где есть из чего выбирать: если у дисциплины
 * один семестр и ни одной метки факультета, панели не будет вовсе.
 *
 * @param {object}   props
 * @param {string[]} props.faculties  коды факультетов, встречающиеся в дисциплине
 * @param {Array}    props.semesters  номера семестров, встречающиеся в дисциплине
 * @param {object}   props.value      { faculty, semester }
 * @param {function} props.onChange   получает новое состояние целиком
 */
export default function MaterialFilters({ faculties = [], semesters = [], value, onChange }) {
  const showFaculty = faculties.length > 0;
  const showSemester = semesters.length > 1;

  if (!showFaculty && !showSemester) return null;

  const set = (patch) => onChange({ ...value, ...patch });

  const facultyOptions = FACULTIES.filter((faculty) => faculties.includes(faculty.id));

  return (
    <div className={styles.panel}>
      {showFaculty && (
        <div className={styles.row}>
          <span className={styles.label}>
            <Icon name="fa-solid fa-users-rectangle" className={styles.labelIcon} />
            Факультет
          </span>

          <div className={styles.chips}>
            <button
              type="button"
              className={`${styles.chip} ${value.faculty === '' ? styles.chipActive : ''}`}
              onClick={() => set({ faculty: '' })}
            >
              Все
            </button>

            {facultyOptions.map((faculty) => (
              <button
                key={faculty.id}
                type="button"
                className={`${styles.chip} ${value.faculty === faculty.id ? styles.chipActive : ''}`}
                onClick={() => set({ faculty: faculty.id })}
                title={faculty.title}
              >
                {faculty.short}
              </button>
            ))}
          </div>
        </div>
      )}

      {showSemester && (
        <div className={styles.row}>
          <span className={styles.label}>
            <Icon name="fa-solid fa-calendar-days" className={styles.labelIcon} />
            Семестр
          </span>

          <div className={styles.chips}>
            <button
              type="button"
              className={`${styles.chip} ${value.semester === '' ? styles.chipActive : ''}`}
              onClick={() => set({ semester: '' })}
            >
              Все
            </button>

            {semesters.map((semester) => (
              <button
                key={semester}
                type="button"
                className={`${styles.chip} ${
                  String(value.semester) === String(semester) ? styles.chipActive : ''
                }`}
                onClick={() => set({ semester })}
              >
                {semester}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className={styles.hint}>
        Материалы без метки — общие: они остаются видны при любом выборе.
      </p>
    </div>
  );
}
