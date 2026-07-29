import SectionPage from '../../components/SectionPage.jsx';
import html from '../../content/html/spring.html?raw';

/** Подраздел «Активности → Студвесна» (маршрут /activities/spring). */
export default function ActivitiesSpring() {
  return (
    <SectionPage
      title="«Студенческая весна»"
      subtitle="Студенческая научная конференция лаборатории: программа секций, шаблон тезисов и сроки подачи заявок."
      icon="fa-solid fa-users-rectangle"
      html={html}
      section="activities/spring"
    />
  );
}
