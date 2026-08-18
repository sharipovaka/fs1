import { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';

import EmptyState from '../components/EmptyState.jsx';
import FilePreviewModal from '../components/FilePreviewModal.jsx';
import Icon from '../components/Icon.jsx';
import DisciplineSidebar from '../components/DisciplineSidebar.jsx';
import DisciplineSummary from '../components/DisciplineSummary.jsx';
import MaterialFilters from '../components/MaterialFilters.jsx';
import MaterialCard from '../components/MaterialCard.jsx';
import SectionHero from '../components/SectionHero.jsx';
import { DISCIPLINES, getDiscipline, visibleItems } from '../catalog.js';
import { readChoice, saveChoice } from '../studentChoice.js';
import { materials } from '../plural.js';
import styles from './DisciplinePage.module.css';

/**
 * Страница дисциплины — основная страница сайта.
 *
 * Все разделы выведены подряд: студент сразу видит, что вообще есть
 * у дисциплины, и ничего не нужно раскрывать. Боковая панель показывает
 * список разделов, подсвечивает текущий при прокрутке и позволяет
 * перепрыгнуть к нужному одним нажатием.
 */
export default function DisciplinePage() {
  const { id } = useParams();
  const discipline = getDiscipline(id);
  const [previewFile, setPreviewFile] = useState(null);
  const [choice, setChoice] = useState(readChoice);

  const chooseFilters = (value) => {
    setChoice(value);
    saveChoice(value);
  };

  // Неизвестная дисциплина — отправляем на первую, чтобы не показывать 404
  if (!discipline) return <Navigate to={`/disciplines/${DISCIPLINES[0].id}`} replace />;

  // Разделы с учётом факультета и семестра; пустые после фильтра не показываем
  const groups = discipline.groups
    .map((group) => ({ ...group, items: visibleItems(group.items, choice) }))
    .filter((group) => group.items.length > 0);

  return (
    <div className={styles.page}>
      <SectionHero
        title={discipline.title}
        icon={discipline.icon}
        meta={discipline.meta}
        description={discipline.description}
        fileCount={discipline.fileCount}
      />

      {discipline.groups.length > 0 ? (
        // Слева навигация по разделам, справа сами разделы друг за другом
        <div className={styles.layout}>
          <DisciplineSidebar
            discipline={discipline}
            visibleTypes={groups.map((group) => group.type)}
          />

          <div className={styles.content}>
            {/* Сводка: коротко о курсе и ближайший срок сдачи */}
            <DisciplineSummary discipline={discipline} />

            {/* Одна дисциплина читается на разных факультетах по разным
                программам и растянута на несколько семестров */}
            <MaterialFilters
              faculties={discipline.faculties}
              semesters={discipline.semesters}
              value={choice}
              onChange={chooseFilters}
            />


            {groups.length > 0 ? (
              groups.map((group) => (
                <section key={group.type} id={group.type} className={styles.group}>
                  {/* Шапка прилипает к верху: при прокрутке всегда видно,
                      какой раздел сейчас перед глазами */}
                  <div className={styles.groupHeader}>
                    <h2 className={styles.groupTitle}>
                      <span className={styles.groupIconBox} aria-hidden="true">
                        <Icon name={group.icon} />
                      </span>
                      {group.title}
                      <span className={styles.groupCount}>{materials(group.items.length)}</span>
                    </h2>
                  </div>

                  {group.description && (
                    <p className={styles.groupDescription}>{group.description}</p>
                  )}

                  <div className={styles.cards}>
                    {group.items.map((item) => (
                      <MaterialCard key={item.id} item={item} onPreview={setPreviewFile} />
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <EmptyState mascot="think" title="Здесь пока пусто">
                Для выбранного факультета и семестра материалов нет.
                Нажмите «Все», чтобы увидеть остальные.
              </EmptyState>
            )}
          </div>
        </div>
      ) : (
        <EmptyState mascot="study" title="Материалы готовятся">
          По этой дисциплине пока ничего не опубликовано. Загляните позже
          или спросите преподавателя.
        </EmptyState>
      )}

      {previewFile && <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}
    </div>
  );
}
