import SectionPage from '../../components/SectionPage.jsx';
import html from '../../content/html/practice.html?raw';

/** Подраздел «Активности → Практика» (маршрут /activities/practice). */
export default function ActivitiesPractice() {
  return (
    <SectionPage
      title="Практика"
      subtitle="Учебная и производственная практика: базы практик, сроки, руководители и отчётность."
      icon="fa-solid fa-briefcase"
      html={html}
      section="activities/practice"
    />
  );
}
