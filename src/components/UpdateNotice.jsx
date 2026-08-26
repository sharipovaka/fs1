import { useEffect, useRef, useState } from 'react';

import Icon from './Icon.jsx';
import { hasNewVersion } from '../appVersion.js';
import styles from './UpdateNotice.module.css';

/** Как часто спрашивать сервер о новой версии. */
const INTERVAL = 5 * 60 * 1000;
/** Чаще этого не проверяем, даже если вкладку дёргают туда-сюда. */
const COOLDOWN = 60 * 1000;

/**
 * Плашка «сайт обновился».
 *
 * Преподаватель загружает файл, сайт пересобирается, а у студента вкладка
 * уже открыта — и он до десяти минут видит прежнюю версию (см. appVersion.js).
 * Плашка показывает, что вышла новая, и предлагает перезагрузить страницу.
 * Сама ничего не перезагружает: человек может дочитывать страницу.
 */
export default function UpdateNotice() {
  const [visible, setVisible] = useState(false);
  const dismissed = useRef(false);
  const lastCheck = useRef(0);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      // Скрытая вкладка ничего не показывает — не тревожим сервер
      if (document.hidden || dismissed.current) return;

      const now = Date.now();
      if (now - lastCheck.current < COOLDOWN) return;
      lastCheck.current = now;

      if (await hasNewVersion()) {
        if (!cancelled && !dismissed.current) setVisible(true);
      }
    };

    check();
    const timer = setInterval(check, INTERVAL);
    // Вернулись во вкладку после перерыва — самый частый случай устаревшей страницы
    document.addEventListener('visibilitychange', check);

    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', check);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={styles.notice} role="status">
      <Icon name="fa-solid fa-arrows-rotate" className={styles.icon} />

      <span className={styles.text}>Сайт обновился — страница устарела.</span>

      <button type="button" className={styles.reload} onClick={() => window.location.reload()}>
        Обновить
      </button>

      <button
        type="button"
        className={styles.close}
        aria-label="Скрыть сообщение"
        onClick={() => {
          dismissed.current = true;
          setVisible(false);
        }}
      >
        <Icon name="fa-solid fa-xmark" />
      </button>
    </div>
  );
}
