import styles from './Mascot.module.css';

/**
 * Талисман лаборатории — лама.
 *
 * Картинки лежат в public/mascot и собираются скриптом `npm run icons`
 * из исходников в assets/mascot. Имена — по смыслу места, где картинка
 * стоит: study (учится), search (ищет), think (думает), question (не понял).
 *
 * Рисунок декоративный: он повторяет то, что уже сказано текстом рядом,
 * поэтому скрыт от чтения с экрана. Размер задаётся стилями места —
 * и высота, и ширина, чтобы страница не «прыгала», пока картинка грузится.
 */
export default function Mascot({ name, className = '' }) {
  // Ресурсы из public адресуются относительно BASE_URL,
  // иначе при публикации в подпапке GitHub Pages картинка не загрузится.
  const src = `${import.meta.env.BASE_URL}mascot/${name}.png`;

  return <img src={src} alt="" aria-hidden="true" className={`${styles.mascot} ${className}`} />;
}
