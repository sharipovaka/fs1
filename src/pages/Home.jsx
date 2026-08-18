import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import EmptyState from '../components/EmptyState.jsx';
import FilePreviewModal from '../components/FilePreviewModal.jsx';
import Icon from '../components/Icon.jsx';
import MaterialCard from '../components/MaterialCard.jsx';
import { ABOUT, ACTIVITIES, DISCIPLINES, TOTALS, filterItems, getAllMaterials } from '../catalog.js';
import { files } from '../plural.js';
import styles from './Home.module.css';

/** Подсказки под строкой поиска — самые частые запросы. */
const QUICK_QUERIES = ['типовой расчёт', 'линейная алгебра', 'конспект', 'шаблон', 'практика'];

/**
 * Главная страница.
 *
 * Наверху — сквозной поиск по всем материалам: студент вводит «линейная
 * алгебра» и сразу видит нужную работу. Ниже — дисциплины крупными
 * карточками, затем активности и раздел о лаборатории.
 */
export default function Home() {
  const [query, setQuery] = useState('');
  const [previewFile, setPreviewFile] = useState(null);

  const allMaterials = useMemo(() => getAllMaterials(), []);
  const results = useMemo(
    () => (query.trim() ? filterItems(allMaterials, { query }) : []),
    [allMaterials, query]
  );

  const isSearching = query.trim().length > 0;

  return (
    <div className={styles.home}>
      {/* Предупреждение о том, что наполнение сайта ещё идёт */}
      <p className={styles.notice} role="status">
        <Icon name="fa-solid fa-wrench" className={styles.noticeIcon} />
        Сайт находится в разработке — материалы пополняются.
      </p>

      <section className={styles.hero}>
        <div className={styles.heroBody}>
          <h1 className={styles.heroTitle}>Лаборатория математики ФН1</h1>
          <p className={styles.heroText}>
            Учебные материалы по дисциплинам кафедры: планы, конспекты, литература,
            шаблоны работ и условия типовых расчётов. Всего {files(TOTALS.files)} —
            найдите нужный и скачайте.
          </p>

          <div className={styles.searchWrapper}>
            <Icon name="fa-solid fa-magnifying-glass" className={styles.searchIcon} />
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
                <Icon name="fa-solid fa-xmark" />
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
        </div>

        {/* Логотип лаборатории. На узком экране встаёт над заголовком —
            см. flex-direction в стилях */}
        <img
          className={styles.heroLogo}
          src={`${import.meta.env.BASE_URL}logo-full.png`}
          alt=""
          aria-hidden="true"
        />
      </section>

      {isSearching ? (
        <section>
          <h2 className={styles.blockTitle}>
            {results.length > 0 ? `Найдено материалов: ${results.length}` : 'Ничего не найдено'}
          </h2>

          {results.length > 0 ? (
            <div className={styles.results}>
              {results.map((item) => (
                <MaterialCard
                  key={item.id}
                  item={item}
                  onPreview={setPreviewFile}
                  sectionLabel={item.sectionTitle}
                />
              ))}
            </div>
          ) : (
            <EmptyState mascot="search">
              Попробуйте другой запрос — например, название дисциплины или номер работы.
            </EmptyState>
          )}
        </section>
      ) : (
        <>
          {/* Дисциплины — главный вход на сайт, поэтому карточки крупные */}
          <section className={styles.block}>
            <h2 className={styles.blockTitle}>Дисциплины</h2>
            <p className={styles.blockHint}>
              Внутри каждой дисциплины на одной странице собраны планы, конспекты,
              литература, шаблоны и задания.
            </p>

            <div className={styles.disciplineGrid}>
              {DISCIPLINES.map((discipline) => (
                <Link key={discipline.id} to={`/disciplines/${discipline.id}`} className={styles.disciplineCard}>
                  <span className={styles.disciplineIcon}>
                    <Icon name={discipline.icon} />
                  </span>

                  <span className={styles.disciplineTitle}>{discipline.title}</span>
                  {discipline.meta && <span className={styles.disciplineMeta}>{discipline.meta}</span>}

                  <span className={styles.disciplineFooter}>
                    {discipline.groups.map((group) => (
                      <span key={group.type} className={styles.chip}>
                        {group.title}
                      </span>
                    ))}
                  </span>

                  <span className={styles.disciplineCount}>
                    <Icon name="fa-solid fa-download" /> {discipline.fileCount}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className={styles.block}>
            <h2 className={styles.blockTitle}>Активности</h2>
            <div className={styles.cards}>
              {ACTIVITIES.map((section) => (
                <Link key={section.id} to={`/activities/${section.id}`} className={styles.card}>
                  <span className={styles.cardIcon}>
                    <Icon name={section.icon} />
                  </span>
                  <span className={styles.cardBody}>
                    <span className={styles.cardTitle}>{section.title}</span>
                    <span className={styles.cardText}>{section.menuHint ?? section.description}</span>
                  </span>
                  <Icon name="fa-solid fa-arrow-right" className={styles.cardArrow} />
                </Link>
              ))}
            </div>
          </section>

          <section className={styles.block}>
            <h2 className={styles.blockTitle}>О лаборатории</h2>
            <div className={styles.cards}>
              {ABOUT.map((section) => (
                <Link key={section.id} to={`/about/${section.id}`} className={styles.card}>
                  <span className={styles.cardIcon}>
                    <Icon name={section.icon} />
                  </span>
                  <span className={styles.cardBody}>
                    <span className={styles.cardTitle}>{section.title}</span>
                    <span className={styles.cardText}>{section.menuHint ?? section.description}</span>
                  </span>
                  <Icon name="fa-solid fa-arrow-right" className={styles.cardArrow} />
                </Link>
              ))}
            </div>
          </section>
        </>
      )}

      {previewFile && <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}
    </div>
  );
}
