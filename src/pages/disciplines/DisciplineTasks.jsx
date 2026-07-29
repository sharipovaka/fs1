import IframePage from '../../components/IframePage.jsx';
import html from '../../content/html/tasks.html?raw';

/** Подраздел «Дисциплины → Задания» (маршрут /disciplines/tasks). */
export default function DisciplineTasks() {
  return (
    <IframePage
      title="Задания"
      subtitle="Типовые расчёты, домашние задания и варианты контрольных работ с указанием сроков сдачи."
      icon="fa-solid fa-square-root-variable"
      html={html}
    />
  );
}
