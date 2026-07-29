import { useEffect, useRef, useState } from 'react';

import MaterialFrame from './MaterialFrame.jsx';
import { assetUrl, colabUrl, githubUrl } from '../repoConfig.js';
import styles from './FilePreviewModal.module.css';
import Icon from './Icon.jsx';

/**
 * Окно предпросмотра файла.
 *
 * Два режима в зависимости от типа предпросмотра, определённого при сборке:
 *   • pdf  — скомпилированный документ (шаблоны LaTeX) показывается целиком
 *            во встроенном просмотрщике браузера, со всеми страницами;
 *   • html — фрагмент, полученный из Markdown / Jupyter / CSV, подставляется
 *            в <iframe srcdoc> и оформляется общими стилями сайта.
 *
 * HTML подгружается по требованию (fetch при открытии), поэтому вес основного
 * бандла не растёт от количества материалов.
 *
 * @param {object}   props
 * @param {object}   props.file файл из каталога (с полем preview)
 * @param {function} props.onClose
 */
export default function FilePreviewModal({ file, onClose }) {
  const [html, setHtml] = useState('');
  const [error, setError] = useState('');
  const closeButtonRef = useRef(null);

  const preview = file?.preview;
  const isPdf = preview?.type === 'pdf';

  // Закрытие по Escape + запрет прокрутки страницы под окном.
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  // Подгрузка HTML-предпросмотра.
  useEffect(() => {
    if (!preview || isPdf) return undefined;

    let cancelled = false;
    setHtml('');
    setError('');

    fetch(assetUrl(preview.path))
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.text();
      })
      .then((text) => {
        if (!cancelled) setHtml(text);
      })
      .catch(() => {
        if (!cancelled) setError('Не удалось загрузить предпросмотр. Файл можно скачать целиком.');
      });

    return () => {
      cancelled = true;
    };
  }, [preview, isPdf]);

  if (!file) return null;

  return (
    <div
      className={styles.backdrop}
      onMouseDown={(event) => {
        // Закрываем только при клике по подложке, а не по содержимому окна
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-label={`Предпросмотр: ${file.name}`}>
        <header className={styles.header}>
          <div className={styles.headerText}>
            <span className={styles.fileName}>{file.name}</span>
            <span className={styles.fileMeta}>
              {file.label ? `${file.label} · ` : ''}
              {file.download.format}
            </span>
          </div>

          <div className={styles.headerActions}>
            <a
              className="btn btn-sm btn-primary"
              href={assetUrl(file.download.path)}
              download={file.download.name}
            >
              <Icon name="fa-solid fa-download" className="me-1" />{' '}
              {file.download.compiled ? 'Скачать PDF' : 'Скачать'}
            </a>
            {file.ext === 'ipynb' && (
              <a
                className={`btn btn-sm ${styles.colab}`}
                href={colabUrl(file.path)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="fa-solid fa-play" className="me-1" /> Colab
              </a>
            )}
            <a
              className="btn btn-sm btn-outline-secondary"
              href={githubUrl(file.path)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="fa-brands fa-github" />
              <span className="sr-only">Открыть на GitHub</span>
            </a>
            <button
              ref={closeButtonRef}
              type="button"
              className={`btn btn-sm btn-outline-secondary ${styles.close}`}
              onClick={onClose}
              aria-label="Закрыть предпросмотр"
            >
              <Icon name="fa-solid fa-xmark" />
            </button>
          </div>
        </header>

        <div className={styles.body}>
          {!preview && (
            <p className={styles.message}>
              Для этого формата предпросмотр не предусмотрен — скачайте файл, чтобы открыть его.
            </p>
          )}

          {isPdf && (
            <iframe
              className={styles.pdfFrame}
              src={assetUrl(preview.path)}
              title={`Предпросмотр документа ${file.name}`}
            />
          )}

          {preview && !isPdf && error && <p className={styles.message}>{error}</p>}

          {preview && !isPdf && !error && html && (
            <div className={styles.htmlScroll}>
              <MaterialFrame html={html} title={`Предпросмотр файла ${file.name}`} />
            </div>
          )}

          {preview && !isPdf && !error && !html && (
            <p className={styles.message}>
              <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
              Загрузка предпросмотра…
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
