import { useMemo, useState } from 'react';

import CatalogFilters from './CatalogFilters.jsx';
import FilePreviewModal from './FilePreviewModal.jsx';
import MaterialCard from './MaterialCard.jsx';
import MaterialFrame from './MaterialFrame.jsx';
import { filterItems, getSection } from '../catalog.js';
import { githubFolderUrl } from '../repoConfig.js';
import styles from './SectionPage.module.css';

const EMPTY_FILTER = { query: '', discipline: '', course: '', kind: '' };

/**
 * Страница подраздела.
 *
 * Главное содержимое — каталог материалов: поиск, фильтры и карточки работ
 * с кнопками скачивания. Методические указания (HTML-материал, подготовленный
 * Pandoc) вынесены в сворачиваемый блок внизу, чтобы не заслонять файлы.
 *
 * @param {object} props
 * @param {string} props.title    заголовок раздела
 * @param {string} props.subtitle пояснение под заголовком
 * @param {string} props.icon     класс иконки Font Awesome
 * @param {string} props.section  ключ раздела в каталоге, например «disciplines/tasks»
 * @param {string} props.html     методические указания (импортируются как строка)
 */
export default function SectionPage({ title, subtitle, icon, section, html }) {
  const data = getSection(section);

  const [filter, setFilter] = useState(EMPTY_FILTER);
  const [previewFile, setPreviewFile] = useState(null);
  const [isGuideOpen, setGuideOpen] = useState(false);

  const visibleItems = useMemo(() => filterItems(data.items, filter), [data.items, filter]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>
            {icon && <i className={`${icon} ${styles.titleIcon}`} aria-hidden="true" />}
            {title}
          </h1>
          <p className={styles.subtitle}>{data.intro || subtitle}</p>
        </div>

        <a
          className={styles.folderLink}
          href={githubFolderUrl(section)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="fa-brands fa-github" aria-hidden="true" /> Папка раздела на GitHub
        </a>
      </header>

      {data.items.length > 0 && (
        <CatalogFilters
          filters={data.filters}
          value={filter}
          onChange={setFilter}
          shown={visibleItems.length}
          total={data.items.length}
        />
      )}

      {visibleItems.length > 0 ? (
        <div className={styles.cards}>
          {visibleItems.map((item) => (
            <MaterialCard key={item.id} item={item} onPreview={setPreviewFile} />
          ))}
        </div>
      ) : (
        <p className={styles.empty}>
          {data.items.length === 0
            ? 'Материалы для этого раздела пока не опубликованы.'
            : 'По заданным условиям ничего не найдено. Попробуйте изменить запрос или сбросить фильтры.'}
        </p>
      )}

      {/* Методические указания: развёрнутый текст раздела по требованию */}
      {html && (
        <section className={styles.guide}>
          <button
            type="button"
            className={styles.guideToggle}
            onClick={() => setGuideOpen((open) => !open)}
            aria-expanded={isGuideOpen}
          >
            <i
              className={`fa-solid fa-chevron-${isGuideOpen ? 'down' : 'right'} ${styles.guideChevron}`}
              aria-hidden="true"
            />
            <span>Методические указания к разделу</span>
            <span className={styles.guideHint}>
              {isGuideOpen ? 'свернуть' : 'регламент, требования, сроки'}
            </span>
          </button>

          {/* Кадр создаётся только при раскрытии — лишней загрузки нет */}
          {isGuideOpen && (
            <div className={styles.guideBody}>
              <MaterialFrame html={html} title={`Методические указания: ${title}`} />
            </div>
          )}
        </section>
      )}

      {previewFile && <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}
    </div>
  );
}
