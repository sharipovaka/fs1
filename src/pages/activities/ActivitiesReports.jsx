import IframePage from '../../components/IframePage.jsx';
import html from '../../content/html/reports.html?raw';

/** Подраздел «Активности → Доклады» (маршрут /activities/reports). */
export default function ActivitiesReports() {
  return (
    <IframePage
      title="Студенческие доклады"
      subtitle="Требования к докладу и презентации, критерии оценивания и лучшие работы прошлых лет."
      icon="fa-solid fa-microphone-lines"
      html={html}
      folder="activities/reports"
    />
  );
}
