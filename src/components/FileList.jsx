import { colabUrl, downloadUrl, githubFolderUrl, githubUrl } from '../repoConfig.js';
import filesIndex from '../content/filesIndex.json';
import styles from './FileList.module.css';

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

/** Человекочитаемый размер файла. */
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

/**
 * Панель «Материалы для скачивания» под содержимым раздела.
 *
 * Список файлов берётся из src/content/filesIndex.json — он генерируется
 * скриптом scripts/generate-file-index.mjs по содержимому public/files/
 * перед каждой сборкой, поэтому достаточно положить файл в нужную папку.
 *
 * Для каждого файла доступны три действия:
 *   • Скачать — прямая ссылка на файл, опубликованный вместе с сайтом;
 *   • GitHub  — просмотр исходника в репозитории (ноутбуки GitHub рендерит сам);
 *   • Colab   — запуск ноутбука в Google Colab (только для .ipynb).
 *
 * @param {object} props
 * @param {string} props.folder ключ раздела, например «disciplines/plans»
 */
export default function FileList({ folder }) {
  const files = filesIndex[folder] ?? [];

  if (files.length === 0) {
    return (
      <section className={styles.panel}>
        <h2 className={styles.heading}>
          <i className="fa-solid fa-folder-open" aria-hidden="true" /> Материалы для скачивания
        </h2>
        <p className={styles.empty}>
          Для этого раздела файлы пока не загружены. Положите их в папку{' '}
          <code>public/files/{folder}/</code> — они появятся здесь после следующей сборки.
        </p>
      </section>
    );
  }

  return (
    <section className={styles.panel}>
      <div className={styles.headingRow}>
        <h2 className={styles.heading}>
          <i className="fa-solid fa-folder-open" aria-hidden="true" /> Материалы для скачивания
          <span className={styles.count}>{files.length}</span>
        </h2>

        <a
          className={styles.folderLink}
          href={githubFolderUrl(folder)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="fa-brands fa-github" aria-hidden="true" /> Открыть папку на GitHub
        </a>
      </div>

      <ul className={styles.list}>
        {files.map((file) => {
          const isNotebook = file.ext === 'ipynb';

          return (
            <li key={file.path} className={styles.item}>
              <span className={styles.fileIcon} aria-hidden="true">
                <i className={ICON_BY_EXT[file.ext] ?? 'fa-solid fa-file'} />
              </span>

              <div className={styles.fileInfo}>
                <span className={styles.fileName}>{file.name}</span>
                {file.description && <span className={styles.fileDescription}>{file.description}</span>}
                <span className={styles.fileMeta}>
                  {file.kind} · {formatSize(file.size)}
                </span>
              </div>

              <div className={styles.actions}>
                {/* Атрибут download заставляет браузер сохранить файл, а не открыть его */}
                <a
                  className={`btn btn-sm btn-primary ${styles.action}`}
                  href={downloadUrl(file.path)}
                  download={file.name}
                >
                  <i className="fa-solid fa-download" aria-hidden="true" />
                  <span>Скачать</span>
                </a>

                <a
                  className={`btn btn-sm btn-outline-secondary ${styles.action}`}
                  href={githubUrl(file.path)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa-brands fa-github" aria-hidden="true" />
                  <span>GitHub</span>
                </a>

                {/* Colab открывает только ноутбуки — для остальных файлов кнопки нет */}
                {isNotebook && (
                  <a
                    className={`btn btn-sm ${styles.action} ${styles.colab}`}
                    href={colabUrl(file.path)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fa-solid fa-play" aria-hidden="true" />
                    <span>Colab</span>
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
