import Icon from './Icon.jsx';
import { files } from '../plural.js';
import styles from './SectionHero.module.css';

/**
 * Шапка раздела: название, короткое описание и сводка.
 *
 * Один и тот же блок открывает страницу дисциплины, активности и раздела
 * «О лаборатории», поэтому все страницы начинаются одинаково —
 * посетитель сразу понимает, куда попал.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} props.icon        класс иконки
 * @param {string} props.description текст под заголовком
 * @param {string} [props.meta]      подпись рядом с заголовком (курс, время, место)
 * @param {number} [props.fileCount] сколько файлов в разделе
 * @param {React.ReactNode} [props.children] дополнительное содержимое
 */
export default function SectionHero({ title, icon, description, meta, fileCount, children }) {
  return (
    <header className={styles.hero}>
      <div className={styles.titleRow}>
        {icon && (
          <span className={styles.iconBox} aria-hidden="true">
            <Icon name={icon} />
          </span>
        )}
        <div className={styles.titleText}>
          <h1 className={styles.title}>{title}</h1>
          {meta && <p className={styles.meta}>{meta}</p>}
        </div>
      </div>

      {description && <p className={styles.description}>{description}</p>}

      {(fileCount > 0 || children) && (
        <div className={styles.extras}>
          {fileCount > 0 && (
            <span className={styles.counter}>
              <Icon name="fa-solid fa-download" /> {files(fileCount)} для скачивания
            </span>
          )}
          {children}
        </div>
      )}
    </header>
  );
}
