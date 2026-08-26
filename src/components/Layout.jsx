import { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

import Navigation from './Navigation.jsx';
import UpdateNotice from './UpdateNotice.jsx';
import { findSection } from '../navConfig.js';
import styles from './Layout.module.css';
import Icon from './Icon.jsx';

const SITE_TITLE = 'Лаборатория математики ФН1';

/**
 * Общая обёртка страниц: фиксированный навбар, «хлебные крошки»,
 * контейнер контента (<Outlet />) и подвал. Поверх всего — плашка
 * о новой версии сайта, если страница открыта давно.
 * Здесь же обновляются заголовок вкладки и позиция прокрутки при смене маршрута.
 */
export default function Layout() {
  const { pathname } = useLocation();
  const section = findSection(pathname);

  // Заголовок вкладки браузера отражает текущий подраздел.
  useEffect(() => {
    document.title = section ? `${section.title} — ${SITE_TITLE}` : SITE_TITLE;
  }, [section]);

  // При переходе между разделами возвращаем пользователя к началу страницы.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className={styles.shell}>
      <Navigation />
      <UpdateNotice />

      <main className={styles.main}>
        <div className="container">
          {/* Крошки показываем только внутри разделов, на главной они не нужны */}
          {section && (
            <nav aria-label="Хлебные крошки" className={styles.breadcrumbs}>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/">
                    <Icon name="fa-solid fa-house" /> Главная
                  </Link>
                </li>
                <li className="breadcrumb-item">{section.groupTitle}</li>
                <li className="breadcrumb-item active" aria-current="page">
                  {section.title}
                </li>
              </ol>
            </nav>
          )}

          <Outlet />
        </div>
      </main>

      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerRow}>
            <p className="mb-0">
              <Icon name="fa-solid fa-square-root-variable" className="me-2" />
              {SITE_TITLE} · учебные материалы и активности
            </p>
            <p className="mb-0 text-white-50">
              Сайт опубликован на GitHub&nbsp;Pages · собран на React&nbsp;+&nbsp;Bootstrap&nbsp;5
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
