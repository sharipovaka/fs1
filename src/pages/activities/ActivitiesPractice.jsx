import IframePage from '../../components/IframePage.jsx';
import html from '../../content/html/practice.html?raw';

/** Подраздел «Активности → Практика» (маршрут /activities/practice). */
export default function ActivitiesPractice() {
  return (
    <IframePage
      title="Практика"
      subtitle="Учебная и производственная практика: базы практик, сроки, руководители и отчётность."
      icon="fa-solid fa-briefcase"
      html={html}
      folder="activities/practice"
    />
  );
}
