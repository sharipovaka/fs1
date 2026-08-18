import Mascot from './Mascot.jsx';
import styles from './EmptyState.module.css';

/**
 * Пусто: ничего не нашлось или ещё не опубликовано.
 *
 * Пустая страница пугает — кажется, что сайт сломался. Лама и подсказка,
 * что делать дальше, показывают, что всё в порядке: просто здесь пока пусто.
 *
 * @param {string} mascot имя картинки в public/mascot (без расширения)
 * @param {string} [title] короткий заголовок, если его нет над блоком
 */
export default function EmptyState({ mascot, title, children }) {
  return (
    <div className={styles.empty}>
      <Mascot name={mascot} className={styles.image} />

      <div className={styles.body}>
        {title && <p className={styles.title}>{title}</p>}
        <p className={styles.text}>{children}</p>
      </div>
    </div>
  );
}
