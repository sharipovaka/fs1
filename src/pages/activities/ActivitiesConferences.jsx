import SectionPage from '../../components/SectionPage.jsx';
import html from '../../content/html/conferences.html?raw';

/** Подраздел «Активности → Конференции» (маршрут /activities/conferences). */
export default function ActivitiesConferences() {
  return (
    <SectionPage
      title="Конференции"
      subtitle="Предстоящие и прошедшие конференции, дедлайны подачи тезисов и сборники материалов."
      icon="fa-solid fa-globe"
      html={html}
      section="activities/conferences"
    />
  );
}
