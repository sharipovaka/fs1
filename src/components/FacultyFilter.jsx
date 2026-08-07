import Icon from './Icon.jsx';
import { FACULTIES } from '../catalog.js';
import styles from './FacultyFilter.module.css';

/**
 * Переключатель факультета.
 *
 * Одна и та же дисциплина читается на разных факультетах по разным
 * программам, поэтому у работ есть метка факультета. Переключатель
 * оставляет на странице только свои материалы плюс общие — те, у которых
 * метки нет (конспекты, учебники, шаблоны нужны всем).
 *
 * Показывается только там, где выбор действительно есть: если в дисциплине
 * нет ни одной работы с меткой, переключателя не будет.
 *
 * @param {object}   props
 * @param {string[]} props.available коды факультетов, встречающиеся в дисциплине
 * @param {string}   props.value     выбранный код или '' для «всех»
 * @param {function} props.onChange
 */
export default function FacultyFilter({ available, value, onChange }) {
  if (available.length < 1) return null;

  const options = FACULTIES.filter((faculty) => available.includes(faculty.id));

  return (
    <div className={styles.panel}>
      <span className={styles.label}>
        <Icon name="fa-solid fa-users-rectangle" className={styles.labelIcon} />
        Ваш факультет
      </span>

      <div className={styles.chips}>
        <button
          type="button"
          className={`${styles.chip} ${value === '' ? styles.chipActive : ''}`}
          onClick={() => onChange('')}
        >
          Все
        </button>

        {options.map((faculty) => (
          <button
            key={faculty.id}
            type="button"
            className={`${styles.chip} ${value === faculty.id ? styles.chipActive : ''}`}
            onClick={() => onChange(faculty.id)}
            title={faculty.title}
          >
            {faculty.short}
          </button>
        ))}
      </div>

      <p className={styles.hint}>
        {value
          ? 'Показаны материалы вашего факультета и общие для всех.'
          : 'Выберите факультет, чтобы убрать чужие задания.'}
      </p>
    </div>
  );
}
