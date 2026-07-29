import IframePage from '../../components/IframePage.jsx';
import html from '../../content/html/conferences.html?raw';

/** Подраздел «Активности → Конференции» (маршрут /activities/conferences). */
export default function ActivitiesConferences() {
  return (
    <IframePage
      title="Конференции"
      subtitle="Предстоящие и прошедшие конференции, дедлайны подачи тезисов и сборники материалов."
      icon="fa-solid fa-globe"
      html={html}
    />
  );
}
