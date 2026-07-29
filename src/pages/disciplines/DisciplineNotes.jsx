import SectionPage from '../../components/SectionPage.jsx';
// Этот материал сгенерирован командой `pandoc -s`, то есть представляет собой
// самостоятельный HTML-документ. buildSrcDoc() распознаёт такой случай
// и лишь дописывает в его <head> общие стили сайта.
import html from '../../content/html/notes.html?raw';

/** Подраздел «Дисциплины → Конспекты» (маршрут /disciplines/notes). */
export default function DisciplineNotes() {
  return (
    <SectionPage
      title="Конспекты лекций"
      subtitle="Лекционные материалы по математическому анализу, линейной алгебре и дифференциальным уравнениям."
      icon="fa-solid fa-pen-nib"
      html={html}
      section="disciplines/notes"
    />
  );
}
