import IframePage from '../../components/IframePage.jsx';
import html from '../../content/html/spring.html?raw';

/** Подраздел «Активности → Студвесна» (маршрут /activities/spring). */
export default function ActivitiesSpring() {
  return (
    <IframePage
      title="Студенческая весна"
      subtitle="Творческий фестиваль: направления, график репетиций и достижения команды кафедры."
      icon="fa-solid fa-guitar"
      html={html}
    />
  );
}
