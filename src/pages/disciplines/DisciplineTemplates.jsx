import IframePage from '../../components/IframePage.jsx';
import html from '../../content/html/templates.html?raw';

/** Подраздел «Дисциплины → Шаблоны» (маршрут /disciplines/templates). */
export default function DisciplineTemplates() {
  return (
    <IframePage
      title="Шаблоны работ"
      subtitle="Титульные листы, LaTeX- и Jupyter-заготовки, требования к оформлению отчётов и курсовых."
      icon="fa-solid fa-file-code"
      html={html}
      folder="disciplines/templates"
    />
  );
}
