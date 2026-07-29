import SectionPage from '../../components/SectionPage.jsx';
import html from '../../content/html/spring.html?raw';

/** Подраздел «Активности → Студвесна» (маршрут /activities/spring). */
export default function ActivitiesSpring() {
  return (
    <SectionPage
      title="Студенческая весна"
      subtitle="Творческий фестиваль: направления, график репетиций и достижения команды лаборатории."
      icon="fa-solid fa-guitar"
      html={html}
      section="activities/spring"
    />
  );
}
