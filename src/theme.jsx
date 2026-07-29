import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/**
 * Переключение светлой и тёмной темы.
 *
 * Выбор запоминается в localStorage. Если пользователь ничего не выбирал,
 * тема следует за системной настройкой и меняется вместе с ней.
 *
 * Значение проставляется атрибутами на <html>:
 *   data-theme    — наши переменные из src/index.css;
 *   data-bs-theme — тёмный режим Bootstrap 5.3 (формы, кнопки, выпадающие меню).
 *
 * Чтобы при загрузке не мелькал светлый фон, тот же атрибут ставит небольшой
 * инлайновый скрипт в index.html — он выполняется до загрузки бандла.
 */

export const THEME_STORAGE_KEY = 'fn1-theme';

const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {}, isExplicit: false });

function readStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : null;
  } catch {
    // localStorage может быть недоступен (приватный режим) — молча работаем без него
    return null;
  }
}

function systemTheme() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => readStoredTheme() ?? systemTheme());
  const [isExplicit, setExplicit] = useState(() => readStoredTheme() !== null);

  // Применяем тему к документу
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-bs-theme', theme);

    // Цвет системной строки браузера на мобильных
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0b1f33' : '#123a5f');
  }, [theme]);

  // Пока выбор не сделан явно, следуем за системой
  useEffect(() => {
    if (isExplicit || !window.matchMedia) return undefined;
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event) => setTheme(event.matches ? 'dark' : 'light');
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, [isExplicit]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        /* без сохранения тема продержится до перезагрузки */
      }
      return next;
    });
    setExplicit(true);
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme, isExplicit }), [theme, toggleTheme, isExplicit]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** @returns {{theme: 'light'|'dark', toggleTheme: () => void, isExplicit: boolean}} */
export function useTheme() {
  return useContext(ThemeContext);
}
