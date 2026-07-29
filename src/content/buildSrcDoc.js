/**
 * Подготовка HTML-строки к подстановке в атрибут srcdoc у <iframe>.
 *
 * Исходные материалы готовятся заранее (Markdown / Jupyter Notebook → Pandoc → HTML)
 * и лежат в src/content/html/*.html. Vite импортирует их как строки через ?raw,
 * поэтому проблема экранирования кавычек не возникает: React сам корректно
 * сериализует значение атрибута srcdoc.
 *
 * Функция умеет работать с двумя видами исходников:
 *   1) фрагмент — только содержимое <body> (обычный `pandoc file.md -o out.html`);
 *   2) целостный документ — вывод `pandoc -s` со своими <html>/<head>.
 * В обоих случаях внутрь документа добавляется общая таблица стилей,
 * чтобы материалы разных разделов выглядели единообразно.
 */

/** Базовая типографика для содержимого iframe. */
const CONTENT_STYLES = `
  :root,
  :root[data-theme='light'] {
    --c-navy: #123a5f;
    --c-navy-light: #1d5688;
    --c-accent: #ffc857;
    --c-ink: #1f2933;
    --c-muted: #667685;
    --c-border: #dde3ea;
    --c-surface: #f5f7fa;
    --c-page: #ffffff;
    --c-code-bg: #0d2b45;
    --c-code-fg: #e8eef5;
    --c-quote: #33414f;
    --c-warning-bg: #fff8e8;
    --c-warning-border: #f3d08a;
    color-scheme: light;
  }

  /* Материал показывается внутри iframe — тему ему передаёт родительская
     страница атрибутом data-theme, см. buildSrcDoc(html, theme). */
  :root[data-theme='dark'] {
    --c-navy: #7db8ea;
    --c-navy-light: #9ccbf3;
    --c-accent: #ffc857;
    --c-ink: #e3eaf2;
    --c-muted: #93a2b1;
    --c-border: #2c3642;
    --c-surface: #1e2732;
    --c-page: #1a212a;
    --c-code-bg: #0b1118;
    --c-code-fg: #dbe7f3;
    --c-quote: #c3cedb;
    --c-warning-bg: #35270f;
    --c-warning-border: #6b4f1c;
    color-scheme: dark;
  }
  * { box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; }
  body {
    margin: 0;
    padding: 1.5rem 1.75rem 2rem;
    color: var(--c-ink);
    background: var(--c-page);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 16px;
    line-height: 1.65;
  }
  h1, h2, h3, h4 { color: var(--c-navy); line-height: 1.25; font-weight: 650; }
  h1 { font-size: 1.7rem; margin: 0 0 .75rem; }
  h2 {
    font-size: 1.3rem;
    margin: 2rem 0 .75rem;
    padding-bottom: .35rem;
    border-bottom: 2px solid var(--c-border);
  }
  h3 { font-size: 1.08rem; margin: 1.5rem 0 .5rem; }
  p { margin: 0 0 .9rem; }
  ul, ol { margin: 0 0 1rem; padding-left: 1.35rem; }
  li { margin-bottom: .35rem; }
  a { color: var(--c-navy-light); text-underline-offset: 2px; }
  a:hover { color: var(--c-navy); }
  strong { color: var(--c-navy); }
  hr { border: 0; border-top: 1px solid var(--c-border); margin: 2rem 0; }

  /* Таблицы — основной формат учебных планов и расписаний */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 0 0 1.25rem;
    font-size: .93rem;
  }
  caption {
    caption-side: top;
    text-align: left;
    color: var(--c-muted);
    font-size: .85rem;
    padding-bottom: .5rem;
  }
  th, td { border: 1px solid var(--c-border); padding: .55rem .7rem; text-align: left; vertical-align: top; }
  thead th { background: var(--c-navy); color: var(--c-page); font-weight: 600; border-color: var(--c-navy); }
  tbody tr:nth-child(even) { background: var(--c-surface); }
  td.num, th.num { text-align: center; white-space: nowrap; }

  /* Код и формулы */
  code, kbd, samp {
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
    font-size: .9em;
    background: var(--c-surface);
    border: 1px solid var(--c-border);
    border-radius: 4px;
    padding: .1em .35em;
  }
  pre {
    background: var(--c-code-bg);
    color: var(--c-code-fg);
    padding: 1rem 1.1rem;
    border-radius: 10px;
    overflow-x: auto;
    line-height: 1.5;
  }
  pre code { background: none; border: 0; padding: 0; color: inherit; }
  .formula {
    display: block;
    margin: 1rem auto;
    padding: .85rem 1rem;
    background: var(--c-surface);
    border-left: 3px solid var(--c-accent);
    border-radius: 0 8px 8px 0;
    font-family: "Cambria Math", Georgia, "Times New Roman", serif;
    font-size: 1.08rem;
    text-align: center;
  }

  /* Информационные блоки */
  blockquote {
    margin: 1rem 0;
    padding: .75rem 1rem;
    border-left: 3px solid var(--c-navy-light);
    background: var(--c-surface);
    border-radius: 0 8px 8px 0;
    color: var(--c-quote);
  }
  .note, .warning {
    margin: 1rem 0;
    padding: .8rem 1rem;
    border-radius: 8px;
    border: 1px solid var(--c-border);
    background: var(--c-surface);
  }
  .warning { border-color: var(--c-warning-border); background: var(--c-warning-bg); }
  .note strong, .warning strong { display: block; margin-bottom: .25rem; }

  /* Метки статусов (сроки, «идёт приём заявок» и т. п.) */
  .badge {
    display: inline-block;
    padding: .12em .6em;
    border-radius: 999px;
    font-size: .78rem;
    font-weight: 600;
    background: var(--c-navy);
    color: var(--c-page);
    white-space: nowrap;
  }
  .badge.soon { background: #b9791b; color: #fff; }
  .badge.done { background: #6b7a89; color: #fff; }
  .badge.open { background: #217a4b; color: #fff; }

  /* Карточки-плитки внутри материалов */
  .cards { display: grid; gap: .9rem; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); margin: 1rem 0 1.25rem; }
  .card {
    border: 1px solid var(--c-border);
    border-radius: 10px;
    padding: .9rem 1rem;
    background: var(--c-page);
  }
  .card h3 { margin: 0 0 .35rem; font-size: 1rem; }
  .card p { margin: 0; color: var(--c-muted); font-size: .9rem; }

  .lead { font-size: 1.05rem; color: var(--c-quote); }
  .muted { color: var(--c-muted); }
  .updated { color: var(--c-muted); font-size: .85rem; margin-top: 2rem; }

  @media (max-width: 640px) {
    body { padding: 1.1rem 1rem 1.5rem; font-size: 15px; }
    table { font-size: .86rem; }
    th, td { padding: .45rem .5rem; }
  }
`;

const STYLE_TAG = `<style>${CONTENT_STYLES}</style>`;
// Ссылки из материалов открываем в новой вкладке, а не внутри самого iframe.
const BASE_TAG = '<base target="_blank">';
const HEAD_INJECTION = `${BASE_TAG}\n${STYLE_TAG}`;

/** Оборачивает HTML-фрагмент в полноценный документ. */
function wrapFragment(fragment, theme) {
  return `<!doctype html>
<html lang="ru" data-theme="${theme}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${HEAD_INJECTION}
</head>
<body>
${fragment}
</body>
</html>`;
}

/**
 * @param {string} html содержимое HTML-файла (фрагмент или standalone-документ)
 * @param {'light'|'dark'} [theme='light'] тема родительской страницы
 * @returns {string} готовая строка для атрибута srcdoc
 */
export function buildSrcDoc(html, theme = 'light') {
  const source = (html ?? '').trim();

  if (!source) {
    return wrapFragment('<p class="muted">Материал для этого раздела ещё не подготовлен.</p>', theme);
  }

  // Вывод `pandoc -s` — самостоятельный документ: только дописываем свои стили.
  if (/<html[\s>]/i.test(source)) {
    // Тему передаём атрибутом на корневом теге, стили — в <head>
    const themed = source.replace(
      /<html([^>]*)>/i,
      (_match, attrs) => `<html${attrs.replace(/\s*data-theme="[^"]*"/i, '')} data-theme="${theme}">`
    );

    if (/<\/head>/i.test(themed)) {
      return themed.replace(/<\/head>/i, () => `${HEAD_INJECTION}\n</head>`);
    }
    return themed.replace(/<html([^>]*)>/i, (_match, attrs) => `<html${attrs}><head>${HEAD_INJECTION}</head>`);
  }

  // Обычный фрагмент — заворачиваем в шаблон документа.
  return wrapFragment(source, theme);
}

export default buildSrcDoc;
