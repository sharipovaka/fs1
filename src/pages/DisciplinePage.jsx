import { useEffect, useRef, useState } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';

import FilePreviewModal from '../components/FilePreviewModal.jsx';
import Icon from '../components/Icon.jsx';
import DisciplineSidebar from '../components/DisciplineSidebar.jsx';
import DisciplineSummary from '../components/DisciplineSummary.jsx';
import FacultyFilter from '../components/FacultyFilter.jsx';
import MaterialCard from '../components/MaterialCard.jsx';
import SectionHero from '../components/SectionHero.jsx';
import { DISCIPLINES, forFaculty, getDiscipline } from '../catalog.js';
import { readFaculty, saveFaculty } from '../facultyChoice.js';
import styles from './DisciplinePage.module.css';

/**
 * Страница дисциплины — основная страница сайта.
 *
 * Слева боковая панель с разделами, справа открытый раздел: описание
 * и карточки материалов со скачиванием, просмотром и Colab. Одновременно
 * показывается только один раздел, поэтому страница остаётся короткой.
 *
 * Какой раздел открыт, определяет адрес: /disciplines/calculus#tasks.
 * Без якоря открывается первый раздел.
 */
export default function DisciplinePage() {
  const { id } = useParams();
  const { hash } = useLocation();
  const discipline = getDiscipline(id);
  const [previewFile, setPreviewFile] = useState(null);
  const [faculty, setFaculty] = useState(readFaculty);
  const previousType = useRef(null);

  const chooseFaculty = (value) => {
    setFaculty(value);
    saveFaculty(value);
  };

  // Якорь из адреса; если такого раздела нет — открываем первый
  const requested = decodeURIComponent(hash.replace('#', ''));
  const activeGroup = discipline
    ? discipline.groups.find((group) => group.type === requested) ?? discipline.groups[0]
    : null;

  const visibleItems = activeGroup ? forFaculty(activeGroup.items, faculty) : [];

  // При переключении раздела возвращаем к началу: иначе, если страница была
  // прокручена, новый раздел откроется где-то выше видимой области.
  // Хук объявлен до выхода по редиректу — их число не должно меняться между рендерами.
  useEffect(() => {
    const type = activeGroup?.type ?? null;
    if (previousType.current && previousType.current !== type) window.scrollTo(0, 0);
    previousType.current = type;
  }, [activeGroup?.type]);

  // Неизвестная дисциплина — отправляем на первую, чтобы не показывать 404
  if (!discipline) return <Navigate to={`/disciplines/${DISCIPLINES[0].id}`} replace />;

  return (
    <div className={styles.page}>
      <SectionHero
        title={discipline.title}
        icon={discipline.icon}
        meta={discipline.meta}
        description={discipline.description}
        fileCount={discipline.fileCount}
      />

      {activeGroup ? (
        // Слева навигация по разделам, справа открытый раздел
        <div className={styles.layout}>
          <DisciplineSidebar discipline={discipline} activeType={activeGroup.type} />

          <div className={styles.content}>
            {/* Сводка: коротко о курсе и ближайший срок сдачи */}
            <DisciplineSummary discipline={discipline} />

            {/* Одна дисциплина читается на разных факультетах по разным программам */}
            {discipline.faculties?.length > 0 && (
              <FacultyFilter
                available={discipline.faculties}
                value={faculty}
                onChange={chooseFaculty}
              />
            )}

            <section className={styles.group}>
              <div className={styles.groupHeader}>
                <h2 className={styles.groupTitle}>
                  <Icon name={activeGroup.icon} className={styles.groupIcon} />
                  {activeGroup.title}
                </h2>
                {activeGroup.description && (
                  <p className={styles.groupDescription}>{activeGroup.description}</p>
                )}
              </div>

              <div className={styles.cards}>
                {visibleItems.length > 0 ? (
                  visibleItems.map((item) => (
                    <MaterialCard key={item.id} item={item} onPreview={setPreviewFile} />
                  ))
                ) : (
                  <p className={styles.empty}>
                    Для выбранного факультета в этом разделе материалов нет.
                    Нажмите «Все», чтобы увидеть остальные.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      ) : (
        <p className={styles.empty}>
          Материалы по этой дисциплине пока не опубликованы. Загляните позже
          или спросите преподавателя.
        </p>
      )}

      {previewFile && <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}
    </div>
  );
}
