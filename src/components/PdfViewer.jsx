import Icon from './Icon.jsx';
import { assetUrl } from '../repoConfig.js';
import styles from './PdfViewer.module.css';

/**
 * Просмотр PDF прямо на странице, без скачивания.
 *
 * Используется там, где документ — само содержимое раздела: аннотации докладов
 * семинара, статьи по истории кафедры. Браузер показывает документ встроенным
 * просмотрщиком со всеми страницами, поиском и печатью.
 *
 * @param {object} props
 * @param {string} props.path      путь от корня сайта, например «previews/…/annotacii.pdf»
 * @param {string} props.title     подпись для скринридеров и заголовок панели
 * @param {string} [props.downloadName] имя файла при скачивании
 * @param {string} [props.height]  высота области просмотра
 */
export default function PdfViewer({ path, title, downloadName, height }) {
  const url = assetUrl(path);

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <span className={styles.title}>
          <Icon name="fa-solid fa-file-pdf" className={styles.titleIcon} />
          {title}
        </span>

        <span className={styles.actions}>
          <a className="btn btn-sm btn-outline-secondary" href={url} target="_blank" rel="noopener noreferrer">
            <Icon name="fa-solid fa-up-right-from-square" className="me-1" />
            Открыть отдельно
          </a>
          <a className="btn btn-sm btn-primary" href={url} download={downloadName}>
            <Icon name="fa-solid fa-download" className="me-1" />
            Скачать
          </a>
        </span>
      </div>

      <iframe
        className={styles.frame}
        style={height ? { height } : undefined}
        src={url}
        title={title}
      />
    </div>
  );
}
