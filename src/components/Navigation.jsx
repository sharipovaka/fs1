import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

import { MENU } from '../navConfig.js';
import styles from './Navigation.module.css';

/**
 * Верхняя навигационная панель: логотип слева, справа — два выпадающих меню
 * («Дисциплины» и «Активности»), собранных из конфига src/navConfig.js.
 *
 * Разметка и классы — родные бутстраповские (navbar / dropdown / container),
 * но состоянием открытия управляет React, а не bootstrap.bundle.js.
 * Так меню гарантированно закрывается при смене маршрута и не рассинхронизируется
 * с виртуальным DOM при повторных рендерах.
 */
export default function Navigation() {
  const location = useLocation();

  // Свёрнутое мобильное меню (аналог collapse) и идентификатор раскрытого dropdown.
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);

  const navRef = useRef(null);

  const closeAll = () => {
    setOpenMenuId(null);
    setIsCollapsed(true);
  };

  // Смена маршрута — закрываем всё открытое.
  useEffect(() => {
    closeAll();
  }, [location.pathname]);

  // Клик мимо навбара и клавиша Escape также закрывают меню.
  useEffect(() => {
    if (openMenuId === null && isCollapsed) return undefined;

    const handlePointerDown = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) closeAll();
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeAll();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openMenuId, isCollapsed]);

  const toggleMenu = (id) => setOpenMenuId((current) => (current === id ? null : id));

  // Ресурсы из папки public адресуются относительно BASE_URL,
  // иначе при публикации в подпапке GitHub Pages логотип не загрузится.
  const logoSrc = `${import.meta.env.BASE_URL}logo.svg`;

  return (
    <nav
      ref={navRef}
      className={`navbar navbar-expand-lg navbar-dark fixed-top ${styles.navbar}`}
      aria-label="Основная навигация"
    >
      <div className="container">
        {/* Логотип и название кафедры — ссылка на главную */}
        <Link className={`navbar-brand ${styles.brand}`} to="/">
          <img src={logoSrc} alt="" width="36" height="36" className={styles.logo} />
          <span className={styles.brandText}>
            <span className={styles.brandTitle}>Кафедра математики</span>
            <span className={styles.brandSubtitle}>учебные материалы и активности</span>
          </span>
        </Link>

        {/* Кнопка-«бургер» для мобильных экранов */}
        <button
          className={`navbar-toggler ${styles.toggler}`}
          type="button"
          aria-controls="main-navbar"
          aria-expanded={!isCollapsed}
          aria-label="Показать или скрыть меню"
          onClick={() => {
            setIsCollapsed((value) => !value);
            setOpenMenuId(null);
          }}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div
          id="main-navbar"
          className={`collapse navbar-collapse ${isCollapsed ? '' : 'show'} ${styles.collapse}`}
        >
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            {MENU.map((group) => {
              const isOpen = openMenuId === group.id;
              // Подсветка родительского пункта, если открыт любой его подраздел
              const isGroupActive = location.pathname.startsWith(group.basePath);

              return (
                <li className={`nav-item dropdown ${styles.navItem}`} key={group.id}>
                  <button
                    type="button"
                    id={`dropdown-${group.id}`}
                    className={`nav-link dropdown-toggle ${styles.navLink} ${
                      isGroupActive ? styles.navLinkActive : ''
                    }`}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    onClick={() => toggleMenu(group.id)}
                  >
                    <i className={`${group.icon} ${styles.navIcon}`} aria-hidden="true" />
                    {group.title}
                  </button>

                  <ul
                    className={`dropdown-menu dropdown-menu-end ${isOpen ? 'show' : ''} ${
                      styles.dropdownMenu
                    }`}
                    aria-labelledby={`dropdown-${group.id}`}
                  >
                    {group.items.map((item) => (
                      <li key={item.path}>
                        <NavLink
                          to={item.path}
                          className={({ isActive }) =>
                            `dropdown-item ${styles.dropdownItem} ${
                              isActive ? `active ${styles.dropdownItemActive}` : ''
                            }`
                          }
                        >
                          <i className={`${item.icon} ${styles.dropdownIcon}`} aria-hidden="true" />
                          <span>{item.title}</span>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}
