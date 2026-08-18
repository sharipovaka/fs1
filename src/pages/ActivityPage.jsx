import { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';

import EmptyState from '../components/EmptyState.jsx';
import FilePreviewModal from '../components/FilePreviewModal.jsx';
import MaterialCard from '../components/MaterialCard.jsx';
import SectionHero from '../components/SectionHero.jsx';
import { ACTIVITIES, getActivity } from '../catalog.js';
import styles from './DisciplinePage.module.css';

/**
 * Страница раздела «Активности»: описание и материалы одним списком.
 * Один компонент обслуживает практику, студвесну, доклады и конференции —
 * у семинаров своя страница с расписанием.
 */
export default function ActivityPage() {
  const { id } = useParams();
  const section = getActivity(id);
  const [previewFile, setPreviewFile] = useState(null);

  if (!section) return <Navigate to={`/activities/${ACTIVITIES[0].id}`} replace />;

  return (
    <div className={styles.page}>
      <SectionHero
        title={section.title}
        icon={section.icon}
        description={section.description}
        fileCount={section.fileCount}
      />

      {section.items.length > 0 ? (
        <div className={styles.cards}>
          {section.items.map((item) => (
            <MaterialCard key={item.id} item={item} onPreview={setPreviewFile} />
          ))}
        </div>
      ) : (
        <EmptyState mascot="study" title="Материалы готовятся">
          В этом разделе пока ничего не опубликовано. Загляните позже.
        </EmptyState>
      )}

      {previewFile && <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}
    </div>
  );
}
