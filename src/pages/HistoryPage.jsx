import { useState } from 'react';

import Icon from '../components/Icon.jsx';
import PdfViewer from '../components/PdfViewer.jsx';
import SectionHero from '../components/SectionHero.jsx';
import { getAbout } from '../catalog.js';
import styles from './HistoryPage.module.css';

/**
 * История кафедры: короткая справка и опубликованные статьи,
 * которые читаются прямо на странице.
 *
 * Статьи лежат в public/files/about/history/ обычными PDF — чтобы добавить
 * ещё одну, достаточно положить туда файл и вписать название в _meta.json.
 */
export default function HistoryPage() {
  const section = getAbout('history');
  const articles = (section?.items ?? []).flatMap((item) =>
    item.files
      .filter((file) => file.preview?.type === 'pdf')
      .map((file) => ({ ...file, itemTitle: item.title, source: item.deadline }))
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const active = articles[activeIndex];

  return (
    <div className={styles.page}>
      <SectionHero
        title="История кафедры"
        icon="fa-solid fa-landmark"
        meta="с 1868 года"
        description={section?.description}
      />

      <section className={styles.block}>
        <h2 className={styles.blockTitle}>Коротко</h2>
        <div className={styles.timeline}>
          <div className={styles.event}>
            <span className={styles.year}>1832</span>
            <p className={styles.eventText}>
              В Московском ремесленном учебном заведении начинается преподавание математики.
              Курс включает элементарную алгебру и геометрию.
            </p>
          </div>
          <div className={styles.event}>
            <span className={styles.year}>1868</span>
            <p className={styles.eventText}>
              Училище получает статус высшего учебного заведения, и одной из первых
              создаётся кафедра «Высшая математика».
            </p>
          </div>
          <div className={styles.event}>
            <span className={styles.year}>1870-е</span>
            <p className={styles.eventText}>
              Благодаря работе А.&nbsp;В.&nbsp;Летникова и Н.&nbsp;А.&nbsp;Шапошникова курс
              высшей математики училища становится образцом для технических вузов России.
            </p>
          </div>
          <div className={styles.event}>
            <span className={styles.year}>1941–1945</span>
            <p className={styles.eventText}>
              Преподаватели уходят на фронт. С.&nbsp;В.&nbsp;Фролов и С.&nbsp;Ф.&nbsp;Шурлапов
              записываются в Бауманскую дивизию народного ополчения; Е.&nbsp;Б.&nbsp;Пасько —
              штурман эскадрильи, Герой Советского Союза.
            </p>
          </div>
          <div className={styles.event}>
            <span className={styles.year}>1944</span>
            <p className={styles.eventText}>
              Выходит «Задачник по высшей математике», на основе которого в 1959 году
              составлен известный сборник задач под редакцией Б.&nbsp;П.&nbsp;Демидовича.
            </p>
          </div>
          <div className={styles.event}>
            <span className={styles.year}>1960–1980-е</span>
            <p className={styles.eventText}>
              Работает методический семинар кафедры. На нём созданы и отредактированы
              индивидуальные домашние задания и согласованы единые требования к оценке,
              которые с поправками используются до сих пор.
            </p>
          </div>
        </div>
      </section>

      {articles.length > 0 && (
        <section className={styles.block}>
          <h2 className={styles.blockTitle}>Статьи</h2>
          <p className={styles.blockHint}>
            Публикации в журнале «Гуманитарный вестник» МГТУ им. Н.&nbsp;Э.&nbsp;Баумана.
            Открываются прямо здесь — скачивать не нужно.
          </p>

          {articles.length > 1 && (
            <div className={styles.tabs} role="tablist">
              {articles.map((article, index) => (
                <button
                  key={article.path}
                  type="button"
                  role="tab"
                  aria-selected={index === activeIndex}
                  className={`${styles.tab} ${index === activeIndex ? styles.tabActive : ''}`}
                  onClick={() => setActiveIndex(index)}
                >
                  <Icon name="fa-solid fa-file-pdf" className={styles.tabIcon} />
                  <span>
                    <span className={styles.tabTitle}>{article.itemTitle}</span>
                    {article.source && <span className={styles.tabSource}>{article.source}</span>}
                  </span>
                </button>
              ))}
            </div>
          )}

          {active && (
            <PdfViewer
              path={active.preview.path}
              title={active.itemTitle}
              downloadName={active.download.name}
            />
          )}
        </section>
      )}
    </div>
  );
}
