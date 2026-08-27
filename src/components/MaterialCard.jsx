import { assetUrl, colabUrl, downloadUrl, githubUrl } from '../repoConfig.js';
import { describeDue } from '../deadlines.js';
import { facultyTitle } from '../catalog.js';
import styles from './MaterialCard.module.css';
import Icon from './Icon.jsx';

/** Иконка Font Awesome по расширению файла. */
const ICON_BY_EXT = {
  ipynb: 'fa-solid fa-book-open',
  md: 'fa-brands fa-markdown',
  tex: 'fa-solid fa-file-lines',
  csv: 'fa-solid fa-table',
  pdf: 'fa-solid fa-file-pdf',
  docx: 'fa-solid fa-file-word',
  xlsx: 'fa-solid fa-file-excel',
  py: 'fa-brands fa-python',
  zip: 'fa-solid fa-file-zipper',
};

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

/** Адрес сайта из ссылки: «https://library.bmstu.ru/» → «library.bmstu.ru». */
function linkHost(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/**
 * Карточка учебного материала: заголовок работы, её признаки (дисциплина, курс,
 * сроки) и список файлов с кнопками действий. У заглушки — работы, объявленной
 * до того, как готов файл, — вместо списка стоит пометка «файлы появятся позже»,
 * у внешнего ресурса — кнопка «Открыть» и адрес сайта, у книги из списка
 * литературы — ссылка на каталог библиотеки, а под ней файл, если он есть.
 *
 * Это основной элемент сайта: студент находит нужную работу по заголовку
 * и скачивает файл, не открывая никаких промежуточных страниц.
 *
 * @param {object}   props
 * @param {object}   props.item        материал из каталога
 * @param {function} props.onPreview   вызывается с файлом при нажатии «Просмотр»
 * @param {string}   [props.sectionLabel] подпись раздела (для общего поиска на главной)
 */
export default function MaterialCard({ item, onPreview, sectionLabel }) {
  // Заголовок вида «Типовой расчёт № 1»
  const heading = item.number ? `${item.kind} № ${item.number}` : item.kind;

  // Если у работы указана дата сдачи, метка и срок считаются по ней:
  // преподавателю достаточно вписать дату, статус обновляется сам.
  const due = item.due ? describeDue(item.due) : null;
  const status = due?.status ?? item.status;
  const statusLabel = due?.label ?? item.statusLabel;

  return (
    <article className={`${styles.card} ${item.placeholder ? styles.cardPlaceholder : ''}`} id={item.id}>
      {/* Миниатюра первой страницы — только чтобы узнать работу в лицо.
          Нажимать не на что: за файлом идут кнопки «Скачать» и «Просмотр»,
          а нажатие на картинку открывало голый PNG без них. */}
      {item.thumb && (
        <div className={styles.thumbBox}>
          <img className={styles.thumb} src={assetUrl(item.thumb)} alt="" loading="lazy" />
        </div>
      )}

      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headingBlock}>
            <p className={styles.kind}>{heading}</p>
            {item.title && <h3 className={styles.title}>{item.title}</h3>}
          </div>

          <div className={styles.badges}>
            {sectionLabel && <span className={`${styles.badge} ${styles.badgeSection}`}>{sectionLabel}</span>}
            {item.discipline && <span className={`${styles.badge} ${styles.badgeDiscipline}`}>{item.discipline}</span>}
            {/* Метка факультета — только у работ, которые читаются не всем */}
            {item.faculties?.map((id) => (
              <span key={id} className={`${styles.badge} ${styles.badgeFaculty}`}>
                {facultyTitle(id)}
              </span>
            ))}
            {item.course && <span className={styles.badge}>{item.course} курс</span>}
            {item.semester && <span className={styles.badge}>{item.semester} семестр</span>}
            {statusLabel && (
              <span className={`${styles.badge} ${styles[`status_${status}`] ?? ''}`}>{statusLabel}</span>
            )}
          </div>
        </header>

        {item.description && <p className={styles.description}>{item.description}</p>}

        {(due || item.deadline) && (
          <p className={styles.deadline}>
            <Icon name="fa-regular fa-clock" />{' '}
            {due ? `сдать до ${due.date}` : item.deadline}
            {due && item.deadline && <span className={styles.deadlineNote}> · {item.deadline}</span>}
          </p>
        )}

        {/* Книга из списка литературы: сначала каталог библиотеки, следом файл.
            Если файла нет — на его месте неактивная пометка, чтобы место
            в карточке не пустовало и было понятно, где книгу искать. */}
        {item.catalog && (
          <p className={styles.libraryRow}>
            <a
              className={`btn btn-sm btn-outline-primary ${styles.action}`}
              href={item.catalog}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="fa-solid fa-book" />
              <span>В каталоге библиотеки</span>
            </a>

            {item.files.length === 0 && (
              <span className={styles.noFile}>
                <Icon name="fa-regular fa-file" /> файла нет — читать в библиотеке
              </span>
            )}
          </p>
        )}

        {/* Внешний ресурс: файла у нас нет, есть ссылка наружу */}
        {item.link ? (
          <p className={styles.linkRow}>
            <a
              className={`btn btn-sm btn-primary ${styles.action}`}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="fa-solid fa-arrow-up-right-from-square" />
              <span>Открыть</span>
            </a>
            {/* Адрес виден заранее: понятно, куда уводит ссылка */}
            <span className={styles.linkHost}>{linkHost(item.link)}</span>
          </p>
        ) : item.placeholder ? (
          <p className={styles.placeholder}>
            <Icon name="fa-solid fa-hourglass-half" /> Файлы появятся позже — работа готовится.
          </p>
        ) : (
        <ul className={styles.files}>
          {item.files.map((file) => (
            <li key={file.path} className={`${styles.file} ${file.primary ? styles.filePrimary : ''}`}>
              <span className={styles.fileIcon} aria-hidden="true">
                <Icon name={ICON_BY_EXT[file.ext] ?? 'fa-solid fa-file'} />
              </span>

              <div className={styles.fileInfo}>
                {file.label && <span className={styles.fileLabel}>{file.label}</span>}
                <span className={styles.fileMeta}>
                  <code>{file.download.name}</code> · {file.download.format} ·{' '}
                  {formatSize(file.download.size)}
                  {/* Условия набраны в LaTeX: студент получает PDF,
                      исходник доступен отдельной ссылкой */}
                  {file.download.compiled && (
                    <>
                      {' · '}
                      <a className={styles.sourceLink} href={downloadUrl(file.path)} download={file.name}>
                        исходник {file.format}
                      </a>
                    </>
                  )}
                </span>
              </div>

              <div className={styles.fileActions}>
                <a
                  className={`btn btn-sm ${file.primary ? 'btn-primary' : 'btn-outline-primary'} ${styles.action}`}
                  href={assetUrl(file.download.path)}
                  download={file.download.name}
                >
                  <Icon name="fa-solid fa-download" />
                  <span>{file.download.compiled ? 'Скачать PDF' : 'Скачать'}</span>
                </a>

                {file.preview && (
                  <button
                    type="button"
                    className={`btn btn-sm btn-outline-secondary ${styles.action}`}
                    onClick={() => onPreview(file)}
                  >
                    <Icon name="fa-regular fa-eye" />
                    <span>Просмотр</span>
                  </button>
                )}

                {file.ext === 'ipynb' && (
                  <a
                    className={`btn btn-sm ${styles.action} ${styles.colab}`}
                    href={colabUrl(file.path)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Открыть и запустить в Google Colab"
                  >
                    <Icon name="fa-solid fa-play" />
                    <span>Colab</span>
                  </a>
                )}

                <a
                  className={`btn btn-sm btn-outline-secondary ${styles.iconAction}`}
                  href={githubUrl(file.path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Открыть на GitHub"
                >
                  <Icon name="fa-brands fa-github" />
                  <span className="sr-only">Открыть {file.name} на GitHub</span>
                </a>
              </div>
            </li>
          ))}
        </ul>
        )}
      </div>
    </article>
  );
}
