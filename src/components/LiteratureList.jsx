import { assetUrl } from '../repoConfig.js';
import { facultyTitle } from '../catalog.js';
import Icon from './Icon.jsx';
import styles from './LiteratureList.module.css';

/**
 * Список литературы — строками, а не карточками.
 *
 * У книги нет ни срока сдачи, ни вариантов, ни нескольких файлов: всё, что
 * нужно студенту, — название, ссылка на каталог библиотеки и файл, если он
 * выложен. Полноразмерная карточка на такую строчку тратит пол-экрана,
 * поэтому книги показываются плотным списком: пять названий видно сразу,
 * а не по одному на прокрутку.
 *
 * @param {object[]} props.items    книги (у каждой есть поле catalog)
 * @param {function} props.onPreview вызывается с файлом при нажатии «Просмотр»
 */
export default function LiteratureList({ items, onPreview }) {
  return (
    <ul className={styles.list}>
      {items.map((item) => {
        // У книги файл один: методичка целиком, без условий и вариантов
        const file = item.files[0];

        return (
          <li key={item.id} id={item.id} className={styles.row}>
            <div className={styles.body}>
              <p className={styles.heading}>
                <span className={styles.kind}>{item.kind}</span>
                <span className={styles.title}>{item.title}</span>
                {item.faculties?.map((id) => (
                  <span key={id} className={styles.faculty}>
                    {facultyTitle(id)}
                  </span>
                ))}
              </p>

              {item.description && <p className={styles.description}>{item.description}</p>}
            </div>

            <div className={styles.actions}>
              {item.catalog && (
                <a
                  className={styles.catalog}
                  href={item.catalog}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="fa-solid fa-book" />
                  <span>Каталог библиотеки</span>
                </a>
              )}

              {/* Файла может не быть — тогда на его месте неактивная пометка:
                  видно, что книга есть, просто читать её надо в библиотеке */}
              {file ? (
                <span className={styles.fileActions}>
                  <a
                    className={`btn btn-sm btn-primary ${styles.action}`}
                    href={assetUrl(file.download.path)}
                    download={file.download.name}
                    title={`${file.download.name} · ${file.download.format}`}
                  >
                    <Icon name="fa-solid fa-download" />
                    <span>Скачать</span>
                  </a>

                  {file.preview && (
                    <button
                      type="button"
                      className={`btn btn-sm btn-outline-secondary ${styles.action}`}
                      onClick={() => onPreview(file)}
                    >
                      <Icon name="fa-regular fa-eye" />
                      <span className="sr-only">Просмотр</span>
                    </button>
                  )}
                </span>
              ) : (
                <span className={styles.noFile}>файла нет</span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
