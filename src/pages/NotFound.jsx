import { Link } from 'react-router-dom';

import styles from './NotFound.module.css';

/** Страница для несуществующих маршрутов. */
export default function NotFound() {
  return (
    <div className={styles.wrapper}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>Раздел не найден</h1>
      <p className={styles.text}>
        Похоже, такой страницы на сайте кафедры нет. Возможно, адрес набран с опечаткой
        или материал был перемещён — выберите нужный подраздел в меню наверху.
      </p>
      <Link className="btn btn-primary" to="/">
        <i className="fa-solid fa-house me-2" aria-hidden="true" />
        На главную
      </Link>
    </div>
  );
}
