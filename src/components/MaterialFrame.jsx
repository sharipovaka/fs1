import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { buildSrcDoc } from '../content/buildSrcDoc.js';
import styles from './MaterialFrame.module.css';

const MIN_HEIGHT = 240;

/**
 * Показ HTML-материала во встроенном <iframe> с атрибутом srcdoc.
 *
 * Компонент используется в двух местах: блок «Методические указания» на странице
 * раздела и окно предпросмотра файла. Высота подгоняется под содержимое,
 * поэтому внутренней полосы прокрутки не возникает.
 *
 * Атрибут sandbox не задан намеренно: материалы готовим мы сами, а общее
 * с родителем происхождение srcdoc-документа нужно для измерения высоты.
 *
 * @param {object}  props
 * @param {string}  props.html      HTML-код материала (фрагмент или целый документ)
 * @param {string}  props.title     подпись для скринридеров
 * @param {boolean} [props.autoHeight=true]
 * @param {number}  [props.maxHeight] ограничение высоты, px (для окна предпросмотра)
 */
export default function MaterialFrame({ html, title, autoHeight = true, maxHeight }) {
  const frameRef = useRef(null);
  const observerRef = useRef(null);

  const [height, setHeight] = useState(MIN_HEIGHT);
  const [isLoading, setIsLoading] = useState(true);

  const srcDoc = useMemo(() => buildSrcDoc(html), [html]);

  useEffect(() => {
    setIsLoading(true);
    setHeight(MIN_HEIGHT);
  }, [srcDoc]);

  const measure = useCallback(() => {
    const doc = frameRef.current?.contentDocument;
    if (!doc?.body) return;
    const contentHeight = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight, MIN_HEIGHT);
    setHeight(maxHeight ? Math.min(contentHeight + 8, maxHeight) : contentHeight + 8);
  }, [maxHeight]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    if (!autoHeight) return;

    measure();

    // Содержимое может подрасти после загрузки шрифтов и картинок — следим за body.
    observerRef.current?.disconnect();
    const doc = frameRef.current?.contentDocument;
    if (doc?.body && typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(measure);
      observer.observe(doc.body);
      observerRef.current = observer;
    }
  }, [autoHeight, measure]);

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return (
    <div className={styles.wrapper}>
      {isLoading && (
        <div className={styles.loader} role="status">
          <span className="spinner-border spinner-border-sm text-secondary me-2" aria-hidden="true" />
          Загрузка…
        </div>
      )}
      <iframe
        ref={frameRef}
        className={styles.frame}
        style={{ height: `${height}px` }}
        title={title}
        srcDoc={srcDoc}
        onLoad={handleLoad}
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
