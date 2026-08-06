import { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';

import FilePreviewModal from '../components/FilePreviewModal.jsx';
import Icon from '../components/Icon.jsx';
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
        <>
          {/* Быстрый переход к блоку: на длинной странице это удобнее прокрутки */}
          {discipline.groups.length > 1 && (
            <nav className={styles.anchors} aria-label="Разделы дисциплины">
              {discipline.groups.map((group) => (
                <a key={group.type} className={styles.anchor} href={`#${group.type}`}>
                  <Icon name={group.icon} className={styles.anchorIcon} />
                  {group.title}
                  <span className={styles.anchorCount}>{group.fileCount}</span>
                </a>
              ))}
            </nav>
          )}

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
        </>
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
