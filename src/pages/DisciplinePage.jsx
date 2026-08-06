import { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';

import FilePreviewModal from '../components/FilePreviewModal.jsx';
import Icon from '../components/Icon.jsx';
import DisciplineSidebar from '../components/DisciplineSidebar.jsx';
import DisciplineSummary from '../components/DisciplineSummary.jsx';
import MaterialCard from '../components/MaterialCard.jsx';
import SectionHero from '../components/SectionHero.jsx';
import { DISCIPLINES, getDiscipline } from '../catalog.js';
import styles from './DisciplinePage.module.css';

/**
 * Страница дисциплины — основная страница сайта.
 *
 * Всё содержимое дисциплины на одной странице: описание, затем блоки
 * «Планы», «Конспекты», «Материалы и литература», «Шаблоны», «Задания».
 * Пустые блоки не показываются, поэтому страница не выглядит перегруженной.
 * Наверху — ссылки-якоря, чтобы сразу перейти к нужному блоку.
 */
export default function DisciplinePage() {
  const { id } = useParams();
  const discipline = getDiscipline(id);
  const [previewFile, setPreviewFile] = useState(null);

  // Неизвестная дисциплина — отправляем на первую, чтобы не показывать 404
  if (!discipline) return <Navigate to={`/disciplines/${DISCIPLINES[0].id}`} replace />;

  const hasMaterials = discipline.groups.length > 0;

  return (
    <div className={styles.page}>
      <SectionHero
        title={discipline.title}
        icon={discipline.icon}
        meta={discipline.meta}
        description={discipline.description}
        fileCount={discipline.fileCount}
      />

      {hasMaterials ? (
        // Слева навигация по блокам, справа сами материалы
        <div className={styles.layout}>
          <DisciplineSidebar discipline={discipline} />

          <div className={styles.content}>
            {/* Сводка: коротко о курсе и ближайший срок сдачи */}
            <DisciplineSummary discipline={discipline} />

            {discipline.groups.map((group) => (
              <section key={group.type} id={group.type} className={styles.group}>
                <div className={styles.groupHeader}>
                  <h2 className={styles.groupTitle}>
                    <Icon name={group.icon} className={styles.groupIcon} />
                    {group.title}
                  </h2>
                  {group.description && <p className={styles.groupDescription}>{group.description}</p>}
                </div>

                <div className={styles.cards}>
                  {group.items.map((item) => (
                    <MaterialCard key={item.id} item={item} onPreview={setPreviewFile} />
                  ))}
                </div>
              </section>
            ))}
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
