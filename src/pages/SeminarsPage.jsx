import { useMemo, useState } from 'react';

import FilePreviewModal from '../components/FilePreviewModal.jsx';
import Icon from '../components/Icon.jsx';
import MaterialCard from '../components/MaterialCard.jsx';
import PdfViewer from '../components/PdfViewer.jsx';
import SectionHero from '../components/SectionHero.jsx';
import { getActivity } from '../catalog.js';
import seminars from '../content/seminars.json';
import styles from './SeminarsPage.module.css';

/** Подписи видов доклада по идентификатору из catalog/seminars.json. */
const TYPE_BY_ID = Object.fromEntries(seminars.types.map((type) => [type.id, type]));

const MONTHS = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

/** «2026-09-16» → «16 сентября 2026». */
function formatDate(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

/** Полночь по местному времени — чтобы сегодняшнее заседание считалось предстоящим. */
function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

function parseDate(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day).getTime();
}

/**
 * Страница научного семинара.
 *
 * Расписание — первое, что видит посетитель. Ближайшее заседание определяется
 * по текущей дате и подсвечивается, прошедшие показываются приглушённо.
 * Ниже — аннотации докладов, которые читаются прямо на странице,
 * без скачивания.
 */
export default function SeminarsPage() {
  const section = getActivity('seminars');
  const [previewFile, setPreviewFile] = useState(null);

  // Ближайшее заседание: первое, дата которого не раньше сегодняшней
  const { sessions, nextIndex } = useMemo(() => {
    const today = startOfToday();
    const ordered = [...seminars.sessions].sort((a, b) => a.date.localeCompare(b.date));
    const index = ordered.findIndex((session) => parseDate(session.date) >= today);
    return { sessions: ordered, nextIndex: index };
  }, []);

  const nextSession = nextIndex >= 0 ? sessions[nextIndex] : null;

  // Документ с аннотациями показываем встроенным просмотрщиком
  const annotations = section?.items
    .flatMap((item) => item.files)
    .find((file) => file.preview?.type === 'pdf');

  return (
    <div className={styles.page}>
      <SectionHero
        title={seminars.title}
        icon="fa-solid fa-chalkboard-user"
        meta={`${seminars.place} · ${seminars.time}`}
        description={section?.description}
      >
        {nextSession ? (
          <span className={styles.nextBadge}>
            <Icon name="fa-solid fa-calendar-day" /> Ближайшее заседание — {formatDate(nextSession.date)}
            {nextSession.time ? `, ${nextSession.time}` : ''}
          </span>
        ) : (
          <span className={styles.pendingBadge}>
            <Icon name="fa-solid fa-calendar-day" /> Расписание на следующий семестр уточняется
          </span>
        )}
      </SectionHero>

      <section className={styles.block}>
        <h2 className={styles.blockTitle}>Расписание заседаний</h2>

        {/* Пока расписание не составлено, здесь объясняется, чего ждать */}
        {seminars.notice && (
          <p className={styles.notice}>
            <Icon name="fa-solid fa-circle-exclamation" className={styles.noticeIcon} />
            {seminars.notice}
          </p>
        )}

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.colDate}>Дата</th>
                <th className={styles.colType}>Вид доклада</th>
                <th>Название</th>
                <th className={styles.colSpeaker}>Выступающий</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session, index) => {
                const isNext = index === nextIndex;
                const isPast = nextIndex < 0 || index < nextIndex;
                const type = TYPE_BY_ID[session.type] ?? TYPE_BY_ID.other;

                return (
                  <tr
                    key={session.date + session.title}
                    className={`${isNext ? styles.rowNext : ''} ${isPast ? styles.rowPast : ''}`}
                  >
                    <td className={styles.colDate}>
                      <span className={styles.date}>
                        {formatDate(session.date)}
                        {session.time && <span className={styles.time}>, {session.time}</span>}
                      </span>
                      {isNext && (
                        <span className={styles.nextMark}>
                          <Icon name="fa-solid fa-hourglass-half" /> следующее
                        </span>
                      )}
                      {isPast && <span className={styles.pastMark}>состоялось</span>}
                    </td>
                    <td className={styles.colType}>
                      <span className={`${styles.type} ${styles[`type_${session.type}`] ?? ''}`}>
                        {type.title}
                      </span>
                    </td>
                    <td className={styles.title}>{session.title}</td>
                    <td className={styles.colSpeaker}>{session.speaker}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <ul className={styles.legend}>
          {seminars.types.map((type) => (
            <li key={type.id} className={styles.legendItem}>
              <span className={`${styles.type} ${styles[`type_${type.id}`] ?? ''}`}>{type.title}</span>
              <span className={styles.legendHint}>— {type.hint}</span>
            </li>
          ))}
        </ul>
      </section>

      {annotations && (
        <section className={styles.block}>
          <h2 className={styles.blockTitle}>Аннотации докладов</h2>
          <p className={styles.blockHint}>
            О чём будет каждое заседание, что разбираем и что полезно знать заранее.
            Документ листается прямо здесь — скачивать не обязательно.
          </p>
          <PdfViewer
            path={annotations.preview.path}
            title="Аннотации докладов семестра"
            downloadName={annotations.download.name}
          />
        </section>
      )}

      {section && section.items.length > 0 && (
        <section className={styles.block}>
          <h2 className={styles.blockTitle}>Материалы семинара</h2>
          <div className={styles.cards}>
            {section.items.map((item) => (
              <MaterialCard key={item.id} item={item} onPreview={setPreviewFile} />
            ))}
          </div>
        </section>
      )}

      {previewFile && <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}
    </div>
  );
}
