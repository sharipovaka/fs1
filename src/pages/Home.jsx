import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import FilePreviewModal from '../components/FilePreviewModal.jsx';
import MaterialCard from '../components/MaterialCard.jsx';
import { filterItems, getAllMaterials, getFileCount } from '../catalog.js';
import { MENU } from '../navConfig.js';
import styles from './Home.module.css';

/** Подсказки под строкой поиска — самые частые запросы. */
const QUICK_QUERIES = [
  'типовой расчёт',
  'линейная алгебра',
  'математический анализ',
  'шаблон',
  'практика',
];

/**
 * Главная страница.
 *
 * Основной сценарий сайта — найти и скачать файл, поэтому наверху стоит
 * сквозной поиск сразу по всем разделам: первокурсник вводит «линейная
 * алгебра» и видит нужный типовой расчёт, не заходя в меню.
 * Пока строка поиска пуста, показываются плитки разделов.
 */
export default function Home() {
  const [query, setQuery] = useState('');
  const [previewFile, setPreviewFile] = useState(null);

  const allMaterials = useMemo(() => getAllMaterials(), []);
  const results = useMemo(
    () => (query.trim() ? filterItems(allMaterials, { query }) : []),
    [allMaterials, query]
  );

  const totalFiles = useMemo(
    () => allMaterials.reduce((sum, item) => sum + item.files.length, 0),
    [allMaterials]
  );

  const isSearching = query.trim().length > 0;

  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Лаборатория математики ФН1</h1>
        <p className={styles.heroText}>
          Учебные материалы лаборатории: условия типовых расчётов, конспекты лекций,
          шаблоны работ и документы по практике. Всего доступно {totalFiles} файлов —
          найдите нужный и скачайте.
        </p>

        <div className={styles.searchWrapper}>
          <i className={`fa-solid fa-magnifying-glass ${styles.searchIcon}`} aria-hidden="true" />
          <input
            type="search"
            className={styles.search}
            placeholder="Например: типовой расчёт 1 линейная алгебра"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Поиск по всем материалам лаборатории"
          />
          {isSearching && (
            <button
              type="button"
              className={styles.searchClear}
              onClick={() => setQuery('')}
              aria-label="Очистить поиск"
            >
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className={styles.quick}>
          <span className={styles.quickLabel}>Часто ищут:</span>
          {QUICK_QUERIES.map((item) => (
            <button key={item} type="button" className={styles.quickChip} onClick={() => setQuery(item)}>
              {item}
            </button>
          ))}
        </div>
      </section>

      {isSearching ? (
        <section>
          <h2 className={styles.resultsTitle}>
            {results.length > 0
              ? `Найдено материалов: ${results.length}`
              : 'Ничего не найдено'}
          </h2>

          {results.length > 0 ? (
            <div className={styles.results}>
              {results.map((item) => (
                <MaterialCard
                  key={`${item.sectionKey}-${item.id}`}
                  item={item}
                  onPreview={setPreviewFile}
                  sectionLabel={item.sectionTitle}
                />
              ))}
            </div>
          ) : (
            <p className={styles.empty}>
              Попробуйте другой запрос — например, название дисциплины или номер работы.
            </p>
          )}
        </section>
      ) : (
        MENU.map((group) => (
          <section key={group.id} className={styles.group}>
            <h2 className={styles.groupTitle}>
              <i className={`${group.icon} ${styles.groupIcon}`} aria-hidden="true" />
              {group.title}
            </h2>

            <div className={styles.cards}>
              {group.items.map((item) => {
                const count = getFileCount(item.path.replace(/^\//, ''));
                return (
                  <Link key={item.path} to={item.path} className={styles.card}>
                    <span className={styles.cardIcon}>
                      <i className={item.icon} aria-hidden="true" />
                    </span>
                    <span className={styles.cardBody}>
                      <span className={styles.cardTitle}>{item.title}</span>
                      <span className={styles.cardText}>{item.description}</span>
                      {count > 0 && (
                        <span className={styles.cardCount}>
                          <i className="fa-solid fa-download" aria-hidden="true" /> {count}{' '}
                          {count === 1 ? 'файл' : count < 5 ? 'файла' : 'файлов'}
                        </span>
                      )}
                    </span>
                    <i className={`fa-solid fa-arrow-right ${styles.cardArrow}`} aria-hidden="true" />
                  </Link>
                );
              })}
            </div>
          </section>
        ))
      )}

      {previewFile && <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}
    </div>
  );
}
