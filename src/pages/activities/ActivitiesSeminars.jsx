import SectionPage from '../../components/SectionPage.jsx';
import html from '../../content/html/seminars.html?raw';

/** Подраздел «Активности → Семинары» (маршрут /activities/seminars). */
export default function ActivitiesSeminars() {
  return (
    <SectionPage
      title="Научный семинар лаборатории"
      subtitle="Расписание заседаний, темы докладов и правила участия для студентов и аспирантов."
      icon="fa-solid fa-chalkboard-user"
      html={html}
      section="activities/seminars"
    />
  );
}
