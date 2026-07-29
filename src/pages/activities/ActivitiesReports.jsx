import SectionPage from '../../components/SectionPage.jsx';
import html from '../../content/html/reports.html?raw';

/** Подраздел «Активности → Доклады» (маршрут /activities/reports). */
export default function ActivitiesReports() {
  return (
    <SectionPage
      title="Студенческие доклады"
      subtitle="Требования к докладу и презентации, критерии оценивания и лучшие работы прошлых лет."
      icon="fa-solid fa-microphone-lines"
      html={html}
      section="activities/reports"
    />
  );
}
