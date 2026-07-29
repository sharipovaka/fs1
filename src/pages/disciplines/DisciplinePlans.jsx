import IframePage from '../../components/IframePage.jsx';
// Суффикс ?raw — механизм Vite: файл импортируется как обычная строка,
// поэтому HTML можно без экранирования передать в атрибут srcdoc.
import html from '../../content/html/plans.html?raw';

/** Подраздел «Дисциплины → Планы» (маршрут /disciplines/plans). */
export default function DisciplinePlans() {
  return (
    <IframePage
      title="Учебные планы"
      subtitle="Рабочие программы дисциплин, распределение часов и формы контроля по семестрам."
      icon="fa-solid fa-list-check"
      html={html}
    />
  );
}
