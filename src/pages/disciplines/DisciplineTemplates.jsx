import SectionPage from '../../components/SectionPage.jsx';
import html from '../../content/html/templates.html?raw';

/** Подраздел «Дисциплины → Шаблоны» (маршрут /disciplines/templates). */
export default function DisciplineTemplates() {
  return (
    <SectionPage
      title="Шаблоны работ"
      subtitle="Титульные листы, LaTeX- и Jupyter-заготовки, требования к оформлению отчётов и курсовых."
      icon="fa-solid fa-file-code"
      html={html}
      section="disciplines/templates"
    />
  );
}
