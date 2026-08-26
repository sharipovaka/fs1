import Icon from './Icon.jsx';
import { LINKS } from '../catalog.js';
import styles from './ExternalLinks.module.css';

/**
 * Полезные ссылки наружу — строкой над материалами дисциплины.
 *
 * Того, чего нет у нас, студент всё равно будет искать: учебник, которого
 * не выложили, подписную базу. Ссылка стоит наверху страницы, чтобы её
 * не искали в конце, и подписана адресом сайта — видно, куда она ведёт.
 *
 * Список задаётся в catalog/site.json (раздел `links`), поэтому добавить
 * ещё одну ссылку можно без правки кода.
 */
export default function ExternalLinks() {
  if (!LINKS.length) return null;

  return (
    <div className={styles.row}>
      {LINKS.map((link) => (
        <a
          key={link.id}
          className={styles.link}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className={styles.iconBox} aria-hidden="true">
            <Icon name={link.icon ?? 'fa-solid fa-arrow-up-right-from-square'} />
          </span>

          <span className={styles.body}>
            <span className={styles.title}>{link.title}</span>
            {link.hint && <span className={styles.hint}>{link.hint}</span>}
          </span>

          <Icon name="fa-solid fa-arrow-up-right-from-square" className={styles.arrow} />
        </a>
      ))}
    </div>
  );
}
