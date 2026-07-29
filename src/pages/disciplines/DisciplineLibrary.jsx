import SectionPage from '../../components/SectionPage.jsx';
import html from '../../content/html/library.html?raw';

/** Подраздел «Дисциплины → Материалы и литература» (маршрут /disciplines/library). */
export default function DisciplineLibrary() {
  return (
    <SectionPage
      title="Материалы и литература"
      subtitle="Списки основной и дополнительной литературы, справочники и проверенные открытые ресурсы."
      icon="fa-solid fa-book-bookmark"
      html={html}
      section="disciplines/library"
    />
  );
}
