# Сайт Лаборатории математики ФН1 — SPA на React

Одностраничное приложение с навигацией без перезагрузки страницы. Материалы разделов
готовятся заранее в виде HTML-файлов и отображаются во встроенном `<iframe srcdoc="…">`.

## Стек

| Технология | Роль |
| --- | --- |
| React 18 (функциональные компоненты, хуки) | UI |
| React Router 6 | Навигация между разделами без перезагрузки |
| Bootstrap 5 | Адаптивная сетка, Navbar, Dropdown, Container |
| Font Awesome 6 | Иконки (подключён локально, без CDN) |
| CSS-модули (`*.module.css`) | Кастомное оформление компонентов |
| Vite 5 | Дев-сервер и сборка |
| gh-pages | Публикация на GitHub Pages |

> **Почему Vite, а не Create React App.** CRA снят с поддержки: `react-scripts` не
> обновляется и не собирается на актуальных версиях Node. Vite даёт тот же
> «zero-config» опыт, поддерживает импорт файлов как строк (`?raw`) из коробки
> и собирает проект за доли секунды. Папка сборки специально названа `build`,
> как в CRA, — команды деплоя из задания работают без изменений.

## Структура проекта

```
.
├── index.html                     # HTML-шаблон + скрипт восстановления пути (GitHub Pages)
├── vite.config.js                 # base (publicPath), outDir: build
├── package.json                   # homepage, скрипты build/deploy
├── files-meta.json                # подписи к файлам разделов
├── scripts/
│   ├── generate-icons.mjs         # генерация PNG-иконок для PWA (без зависимостей)
│   └── generate-file-index.mjs    # сканирование public/files → src/content/filesIndex.json
├── public/                        # копируется в build как есть
│   ├── files/                     # файлы разделов (см. «Файлы разделов» ниже)
│   │   ├── disciplines/plans, notes, templates, tasks
│   │   └── activities/practice, spring, seminars, reports, conferences
│   ├── manifest.json              # PWA-манифест
│   ├── favicon.svg                # фавиконка
│   ├── logo.svg                   # логотип в навбаре
│   ├── icons/icon-192.png,
│   │         icon-512.png         # иконки приложения
│   ├── 404.html                   # SPA-редирект для «глубоких» ссылок
│   └── .nojekyll                  # отключает Jekyll на GitHub Pages
└── src/
    ├── main.jsx                   # точка входа, BrowserRouter с basename
    ├── App.jsx                    # карта маршрутов
    ├── index.css                  # глобальные стили и дизайн-токены
    ├── navConfig.js               # структура меню (единый источник правды)
    ├── repoConfig.js              # координаты репозитория для ссылок GitHub/Colab
    ├── components/
    │   ├── Layout.jsx / .module.css       # навбар + крошки + контент + подвал
    │   ├── Navigation.jsx / .module.css   # панель навигации с Dropdown
    │   ├── IframePage.jsx / .module.css   # универсальная страница с <iframe srcdoc>
    │   └── FileList.jsx / .module.css     # панель файлов раздела
    ├── pages/
    │   ├── Home.jsx / .module.css         # приветственная страница
    │   ├── NotFound.jsx / .module.css     # 404
    │   ├── disciplines/
    │   │   ├── DisciplinePlans.jsx
    │   │   ├── DisciplineNotes.jsx
    │   │   ├── DisciplineTemplates.jsx
    │   │   └── DisciplineTasks.jsx
    │   └── activities/
    │       ├── ActivitiesPractice.jsx
    │       ├── ActivitiesSpring.jsx
    │       ├── ActivitiesSeminars.jsx
    │       ├── ActivitiesReports.jsx
    │       └── ActivitiesConferences.jsx
    └── content/
        ├── buildSrcDoc.js         # подготовка HTML к подстановке в srcdoc
        ├── filesIndex.json        # генерируется автоматически, править вручную не нужно
        └── html/                  # исходные материалы разделов
            ├── plans.html   notes.html   templates.html  tasks.html
            ├── practice.html spring.html seminars.html
            └── reports.html conferences.html
```

## Маршруты

| Путь | Компонент |
| --- | --- |
| `/` | `Home` — приветственная страница с плитками разделов |
| `/disciplines` | редирект на `/disciplines/plans` |
| `/disciplines/plans` | `DisciplinePlans` |
| `/disciplines/notes` | `DisciplineNotes` |
| `/disciplines/templates` | `DisciplineTemplates` |
| `/disciplines/tasks` | `DisciplineTasks` |
| `/activities` | редирект на `/activities/practice` |
| `/activities/practice` | `ActivitiesPractice` |
| `/activities/spring` | `ActivitiesSpring` |
| `/activities/seminars` | `ActivitiesSeminars` |
| `/activities/reports` | `ActivitiesReports` |
| `/activities/conferences` | `ActivitiesConferences` |
| любой другой | `NotFound` |

## Запуск

```bash
npm install       # установка зависимостей
npm run dev       # дев-сервер на http://localhost:3000
npm run build     # production-сборка в папку build/
npm run preview   # локальный просмотр собранного сайта
npm run files     # пересобрать индекс файлов разделов
npm run icons     # перегенерировать PNG-иконки PWA
```

`npm run files` выполняется автоматически перед `dev` и `build`
(через хуки `predev` / `prebuild`), отдельно запускать его обычно не требуется.

## Файлы разделов

У каждого из девяти подразделов есть своя папка внутри `public/files/`,
имя которой совпадает с маршрутом:

```
public/files/
├── disciplines/{plans,notes,templates,tasks}/
└── activities/{practice,spring,seminars,reports,conferences}/
```

Под содержимым раздела на сайте выводится панель «Материалы для скачивания».
Для каждого файла доступны:

| Кнопка | Что делает | Для каких файлов |
| --- | --- | --- |
| **Скачать** | прямая ссылка на файл, опубликованный вместе с сайтом (`/fs1/files/…`) | все |
| **GitHub** | просмотр исходника в репозитории; ноутбуки GitHub отрисовывает сам | все |
| **Colab** | открывает ноутбук в Google Colab и позволяет запустить код | только `.ipynb` |

### Как добавить файл

1. Положите его в нужную папку, например `public/files/disciplines/tasks/`.
2. При желании добавьте подпись в `files-meta.json` (ключ — путь относительно
   `public/files`):

   ```json
   "disciplines/tasks/tr-03.pdf": "Типовой расчёт № 3: условия и варианты"
   ```

3. Запустите `npm run dev` или `npm run build` — индекс пересоберётся сам.

Скрипт `scripts/generate-file-index.mjs` сканирует папки, определяет тип и размер
каждого файла и записывает результат в `src/content/filesIndex.json`. Отдельно
он предупредит, если в `files-meta.json` остались описания без файлов.

### Откуда берутся ссылки GitHub и Colab

Из `src/repoConfig.js`:

```js
export const REPO = {
  owner: 'sharipovaka',
  name: 'fs1',
  branch: 'main',
  filesPath: 'public/files',
};
```

> **Важно.** Эти ссылки ведут в **исходный** репозиторий, а не на опубликованный
> сайт, поэтому ветка `main` с папкой `public/files` должна быть запушена на GitHub
> (`git push origin main`), а репозиторий — быть публичным: Colab не открывает
> ноутбуки из приватных репозиториев.
>
> Если исходники не публикуются и на GitHub уходит только сборка, поменяйте
> в `repoConfig.js` `branch` на `'gh-pages'`, а `filesPath` на `'files'` —
> в ветке `gh-pages` файлы лежат без префикса `public/`.

## Как добавить или обновить материал раздела

1. Подготовьте HTML из исходника. Например, для Jupyter Notebook:

   ```bash
   pandoc notebook.ipynb -t html -s -o notebook.html
   ```

   Подходит и обычный фрагмент без `-s` — `buildSrcDoc.js` распознаёт оба варианта:
   самостоятельный документ получает дополнительный `<style>` в свой `<head>`,
   фрагмент оборачивается в шаблон документа.

2. Положите файл в `src/content/html/`.

3. Импортируйте его как строку и передайте в `IframePage`:

   ```jsx
   import IframePage from '../../components/IframePage.jsx';
   import html from '../../content/html/plans.html?raw';

   export default function DisciplinePlans() {
     return <IframePage title="Учебные планы" icon="fa-solid fa-list-check" html={html} />;
   }
   ```

   Суффикс `?raw` — механизм Vite: файл попадает в бандл как обычная JS-строка,
   поэтому проблемы с экранированием кавычек в `srcdoc` не возникает — React
   экранирует значение атрибута сам.

4. Если добавляется новый подраздел — пропишите его в `src/navConfig.js`
   (появится в меню и на главной) и добавьте `<Route>` в `src/App.jsx`.

### Альтернатива: загрузка через fetch

Если материалы обновляются чаще кода, положите HTML в `public/content/` и загружайте
их в рантайме — тогда для смены текста пересборка не нужна:

```jsx
const [html, setHtml] = useState('');
useEffect(() => {
  fetch(`${import.meta.env.BASE_URL}content/plans.html`)
    .then((r) => r.text())
    .then(setHtml);
}, []);
```

## Публикация на GitHub Pages

1. Проект уже настроен на репозиторий **`sharipovaka/fs1`**:

   * `package.json` → `"homepage": "https://sharipovaka.github.io/fs1/"`;
   * `vite.config.js` → `const BASE = '/fs1/'`;
   * `public/404.html` → `pathSegmentsToKeep = 1`.

   Значение `base` подставляется во все ссылки на JS, CSS, шрифты и картинки,
   поэтому статика корректно грузится из подпапки. При переезде в другой
   репозиторий поменяйте эти три значения; для сайта вида
   `https://<username>.github.io/` поставьте `base: '/'` и `pathSegmentsToKeep = 0`.

2. Опубликуйте:

   ```bash
   npm run deploy      # = npm run build && gh-pages -d build
   ```

   Команда создаёт (или обновляет) ветку `gh-pages`. В настройках репозитория:
   **Settings → Pages → Source: Deploy from a branch → gh-pages / (root)**.

   Ручной вариант — скопировать содержимое `build/` в ветку `gh-pages`.

### Почему нужен `public/404.html`

GitHub Pages — статический хостинг: он ничего не знает о маршрутах вроде
`/disciplines/plans` и при прямом заходе или обновлении страницы отдаёт `404.html`.
Скрипт в этом файле кодирует запрошенный путь в query-строку и перенаправляет на
`index.html`, а встречный скрипт в `index.html` восстанавливает адрес через
`history.replaceState`. Пользователь видит обычную ссылку, React Router получает
корректный путь.

Альтернатива — заменить `BrowserRouter` на `HashRouter` в `src/main.jsx`; тогда
`404.html` не нужен, но адреса будут вида `/#/disciplines/plans`.

## PWA

`public/manifest.json` содержит базовую конфигурацию: имя, `start_url`, `display:
standalone`, цвета темы и иконки 192/512 px (включая `maskable`). Service worker
намеренно не подключён — сайт статический, материалы обновляются пересборкой.

Иконки генерируются скриптом `npm run icons`: PNG собирается вручную из чанков
IHDR/IDAT/IEND, поэтому графические библиотеки не нужны. Чтобы изменить рисунок,
поправьте функцию `curveY()` и палитру в `scripts/generate-icons.mjs`.

## Особенности реализации

* **Выпадающие меню** используют разметку и классы Bootstrap, но состоянием
  открытия управляет React. Это гарантирует закрытие меню при смене маршрута
  и исключает рассинхронизацию с виртуальным DOM (`bootstrap.bundle.js` не нужен).
* **Высота `<iframe>`** подстраивается под содержимое: после загрузки замеряется
  `scrollHeight` документа, дальнейшие изменения отслеживает `ResizeObserver` —
  внутренней полосы прокрутки нет.
* **Ссылки внутри материалов** открываются в новой вкладке благодаря
  внедряемому тегу `<base target="_blank">`.
* **Кнопка «Печать»** печатает только сам материал, без навбара, подвала
  и панели файлов.
* Атрибут `sandbox` у `<iframe>` не задан намеренно: содержимое готовим мы сами,
  а общее с родителем происхождение `srcdoc`-документа необходимо для замера высоты.
