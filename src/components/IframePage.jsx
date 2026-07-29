import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { buildSrcDoc } from '../content/buildSrcDoc.js';
import styles from './IframePage.module.css';

const MIN_HEIGHT = 320;

/**
 * Универсальная страница-подраздел: выводит шапку раздела и рендерит <iframe>
 * с атрибутом srcdoc, в который подставляется HTML-код материала.
 *
 * Компонент переиспользуется всеми девятью подразделами — им остаётся лишь
 * импортировать нужный HTML и передать его в проп `html`.
 *
 * Атрибут sandbox намеренно не используется: содержимое iframe готовим мы сами
 * (доверенный источник), а одинаковое с родителем происхождение srcdoc-документа
 * позволяет измерять высоту контента и подгонять размер рамки без полос прокрутки.
 *
 * @param {object}  props
 * @param {string}  props.title       заголовок раздела
 * @param {string}  props.subtitle    краткое описание под заголовком
 * @param {string}  props.icon        класс иконки Font Awesome
 * @param {string}  props.html        HTML-код материала (импортируется как строка)
 * @param {boolean} [props.autoHeight=true] подгонять высоту iframe под контент
 */
export default function IframePage({ title, subtitle, icon, html, autoHeight = true }) {
  const frameRef = useRef(null);
  const observerRef = useRef(null);

  const [height, setHeight] = useState(MIN_HEIGHT);
  const [isLoading, setIsLoading] = useState(true);

  // Пересобираем документ только при смене исходного HTML.
  const srcDoc = useMemo(() => buildSrcDoc(html), [html]);

  // Новый материал — снова показываем индикатор загрузки.
  useEffect(() => {
    setIsLoading(true);
    setHeight(MIN_HEIGHT);
  }, [srcDoc]);

  /** Измеряет реальную высоту документа внутри iframe. */
  const measure = useCallback(() => {
    const doc = frameRef.current?.contentDocument;
    if (!doc?.body) return;
    const contentHeight = Math.max(
      doc.body.scrollHeight,
      doc.documentElement.scrollHeight,
      MIN_HEIGHT
    );
    // Небольшой запас, чтобы не появлялась внутренняя полоса прокрутки.
    setHeight(contentHeight + 8);
  }, []);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    if (!autoHeight) return;

    measure();

    // Высота может измениться после загрузки шрифтов/картинок — следим за body.
    observerRef.current?.disconnect();
    const doc = frameRef.current?.contentDocument;
    if (doc?.body && typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(measure);
      observer.observe(doc.body);
      observerRef.current = observer;
    }
  }, [autoHeight, measure]);

  // Отписываемся при размонтировании компонента.
  useEffect(() => () => observerRef.current?.disconnect(), []);

  /** Печать содержимого материала (без навбара и подвала сайта). */
  const handlePrint = () => {
    const frameWindow = frameRef.current?.contentWindow;
    if (!frameWindow) return;
    frameWindow.focus();
    frameWindow.print();
  };

  return (
    <article className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>
            {icon && <i className={`${icon} ${styles.titleIcon}`} aria-hidden="true" />}
            {title}
          </h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>

        <button
          type="button"
          className={`btn btn-outline-primary btn-sm ${styles.printButton}`}
          onClick={handlePrint}
        >
          <i className="fa-solid fa-print me-2" aria-hidden="true" />
          Печать
        </button>
      </header>

      <div className={styles.frameWrapper}>
        {isLoading && (
          <div className={styles.loader} role="status">
            <span className="spinner-border spinner-border-sm text-secondary me-2" aria-hidden="true" />
            Загрузка материала…
          </div>
        )}

        <iframe
          ref={frameRef}
          className={styles.frame}
          style={{ height: `${height}px` }}
          title={title}
          srcDoc={srcDoc}
          onLoad={handleLoad}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>
    </article>
  );
}
