import SectionPage from '../../components/SectionPage.jsx';
import html from '../../content/html/tasks.html?raw';

/** Подраздел «Дисциплины → Задания» (маршрут /disciplines/tasks). */
export default function DisciplineTasks() {
  return (
    <SectionPage
      title="Задания"
      subtitle="Типовые расчёты, домашние задания и варианты контрольных работ с указанием сроков сдачи."
      icon="fa-solid fa-square-root-variable"
      html={html}
      section="disciplines/tasks"
    />
  );
}
