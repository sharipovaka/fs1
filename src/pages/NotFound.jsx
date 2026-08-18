import { Link } from 'react-router-dom';

import styles from './NotFound.module.css';
import Icon from '../components/Icon.jsx';
import Mascot from '../components/Mascot.jsx';

/** Страница для несуществующих маршрутов. */
export default function NotFound() {
  return (
    <div className={styles.wrapper}>
      <Mascot name="question" className={styles.mascot} />
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>Раздел не найден</h1>
      <p className={styles.text}>
        Похоже, такой страницы на сайте лаборатории нет. Возможно, адрес набран с опечаткой
        или материал был перемещён — выберите нужный подраздел в меню наверху.
      </p>
      <Link className="btn btn-primary" to="/">
        <Icon name="fa-solid fa-house" className="me-2" />
        На главную
      </Link>
    </div>
  );
}
