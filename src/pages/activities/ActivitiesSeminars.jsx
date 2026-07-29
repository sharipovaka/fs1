import IframePage from '../../components/IframePage.jsx';
import html from '../../content/html/seminars.html?raw';

/** Подраздел «Активности → Семинары» (маршрут /activities/seminars). */
export default function ActivitiesSeminars() {
  return (
    <IframePage
      title="Научный семинар кафедры"
      subtitle="Расписание заседаний, темы докладов и правила участия для студентов и аспирантов."
      icon="fa-solid fa-chalkboard-user"
      html={html}
    />
  );
}
