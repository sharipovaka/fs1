# Сайт Лаборатории математики ФН1 — SPA на React

Одностраничное приложение — каталог учебных материалов лаборатории. Главный сценарий:
студент открывает раздел, находит свою работу по дисциплине и номеру и скачивает файл.
У файлов есть предпросмотр, а у шаблонов LaTeX — скомпилированный документ,
который видно, не устанавливая TeX. Навигация между разделами идёт без перезагрузки.

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
├── .github/workflows/deploy.yml   # автосборка и публикация при push в main
├── catalog/                       # необязательные описания работ
│   ├── disciplines.json           # папка → название дисциплины
│   ├── disciplines-plans.json     notes, templates, tasks
│   └── activities-practice.json   spring, seminars, reports, conferences
├── scripts/
│   ├── generate-icons.mjs         # PNG-иконки для PWA (без зависимостей)
│   ├── generate-previews.mjs      # предпросмотр: pandoc + pdflatex → public/previews
│   └── generate-catalog.mjs       # catalog/ + public/files → src/content/catalogIndex.json
├── public/                        # копируется в build как есть
│   ├── files/                     # сами файлы разделов
│   │   ├── disciplines/{plans,notes,templates,tasks}/
│   │   │   └── tasks/{linear-algebra,calculus,discrete-math,teorver}/
│   │   │       └── _meta.json     # необязательные уточнения к папке
│   │   └── activities/{practice,spring,seminars,reports,conferences}/
│   ├── previews/                  # предпросмотр (генерируется, коммитится)
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
    ├── catalog.js                 # чтение каталога, поиск и фильтрация
    ├── components/
    │   ├── Layout.jsx / .module.css            # навбар + крошки + контент + подвал
    │   ├── Navigation.jsx / .module.css        # панель навигации с Dropdown
    │   ├── SectionPage.jsx / .module.css       # страница раздела: каталог + методичка
    │   ├── CatalogFilters.jsx / .module.css    # поиск и кнопки фильтров
    │   ├── MaterialCard.jsx / .module.css      # карточка работы со списком файлов
    │   ├── FilePreviewModal.jsx / .module.css  # окно предпросмотра файла
    │   └── MaterialFrame.jsx / .module.css     # <iframe srcdoc> для HTML-материалов
    ├── pages/
    │   ├── Home.jsx / .module.css         # главная со сквозным поиском
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
        ├── catalogIndex.json      # генерируется автоматически, править не нужно
        └── html/                  # методические указания разделов
            ├── plans.html   notes.html   templates.html  tasks.html
            ├── practice.html spring.html seminars.html
            └── reports.html conferences.html
```

## Маршруты

| Путь | Компонент |
| --- | --- |
| `/` | `Home` — сквозной поиск по всем материалам и плитки разделов |
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
npm run catalog   # пересобрать каталог материалов
npm run previews  # пересобрать предпросмотр (нужны pandoc и pdflatex)
npm run icons     # перегенерировать PNG-иконки PWA
```

`npm run catalog` выполняется автоматически перед `dev` и `build` (хуки `predev` /
`prebuild`). `npm run previews` запускается вручную — только когда добавлены
или изменены файлы, для которых нужен предпросмотр.

## Каталог материалов

Сайт устроен как каталог файлов: на странице раздела сразу видны карточки работ
с кнопкой «Скачать». Пояснительный текст раздела убран в сворачиваемый блок
«Методические указания» внизу страницы.

### Из чего собирается каталог

| Источник | Что описывает | Кто правит |
| --- | --- | --- |
| `public/files/**` | сами файлы, разложенные по разделам и дисциплинам | преподаватель |
| имена папок и файлов | тип работы, номер, дисциплина, подписи файлов | распознаётся само |
| `_meta.json` в папке | название работы, курс, срок сдачи — необязательно | преподаватель |
| `catalog/*.json` | точные описания, если нужен полный контроль | преподаватель |
| `public/previews/**` | предпросмотр, создаётся автоматически | скрипт |
| `src/content/catalogIndex.json` | готовые данные для интерфейса | скрипт |

Пример описания работы в `catalog/disciplines-tasks.json`:

```json
{
  "id": "la-tr-01",
  "kind": "Типовой расчёт",
  "number": 1,
  "title": "Матрицы, определители и системы линейных уравнений",
  "discipline": "Линейная алгебра",
  "course": 1,
  "semester": 1,
  "deadline": "сдать до конца 9-й недели",
  "status": "open",
  "statusLabel": "приём открыт",
  "files": [
    { "path": "disciplines/tasks/linear-algebra/tr-01-usloviya.md",
      "label": "Условия задач", "primary": true },
    { "path": "disciplines/tasks/linear-algebra/tr-01-varianty.csv",
      "label": "Данные 25 вариантов" }
  ]
}
```

Поля `discipline`, `course` и `kind` автоматически превращаются в кнопки фильтров
над каталогом — отдельно настраивать их не нужно. Ряд фильтров показывается
только тогда, когда значений больше одного.

### Поиск

Строка поиска есть в каждом разделе и на главной (там — сразу по всем разделам).
Запрос разбивается на слова; слова из букв ищутся по началу слова
(«линейн» найдёт «линейная»), числа сравниваются точно — поэтому «типовой 1
линейная» находит ровно одну работу, а не все работы первого курса.

### Предпросмотр

`npm run previews` формирует `public/previews/`:

| Формат | Что создаётся | Чем |
| --- | --- | --- |
| `.md`, `.ipynb` | HTML-фрагмент, формулы в MathML | `pandoc` |
| `.csv` | HTML-таблица | собственный парсер |
| `.tex` | скомпилированный PDF + PNG-миниатюра первой страницы | `pdflatex` + `sips` |

Шаблон LaTeX открывается в окне предпросмотра целиком, всеми страницами —
студент видит, как выглядит готовый документ, не устанавливая TeX.
Миниатюра выводится прямо на карточке материала.

Результаты коммитятся в репозиторий, поэтому собрать сайт можно и без pandoc
с pdflatex — они нужны только для обновления предпросмотра. Повторно
обрабатываются лишь изменившиеся файлы; полная пересборка — `npm run previews -- --force`.

### Как добавить материалы

Достаточно загрузить файлы в репозиторий — хоть через веб-интерфейс GitHub
(«Add file → Upload files»), хоть обычным `git push`. Сборка и публикация
запускаются сами (см. «Автопубликация» ниже), работа появляется на сайте
через 2–4 минуты.

Пример: создаём папку `public/files/disciplines/tasks/teorver/` и кладём в неё
`tr-01-usloviya.tex` и `tr-01-varianty.csv`. Ничего больше делать не нужно —
на сайте появится карточка:

```
ТИПОВОЙ РАСЧЁТ № 1                            [Теория вероятностей]
Условия задач
  📄 Условия задач      tr-01-usloviya.tex · LaTeX · 5.1 КБ
  📊 Данные вариантов   tr-01-varianty.csv · CSV-таблица · 1.5 КБ
```

Слева встанет миниатюра скомпилированного LaTeX, у обоих файлов появятся
кнопки «Скачать» и «Просмотр», а «Теория вероятностей» добавится в фильтры.

### Соглашение об именах

Что распознаётся автоматически:

| Откуда | Что берётся | Пример |
| --- | --- | --- |
| имя папки | дисциплина | `teorver/` → «Теория вероятностей» |
| начало имени файла | тип работы и номер | `tr-01-…` → «Типовой расчёт № 1» |
| конец имени файла | подпись файла в карточке | `…-varianty.csv` → «Данные вариантов» |

Коды типов работ: `tr` — типовой расчёт, `dz` — домашнее задание,
`kr` — контрольная работа, `lab` — лабораторная, `rgr` — РГР,
`lecture` — лекция, `seminar` — семинар, `test` — тест.

Назначения файлов: `usloviya`, `zadanie` (основной файл работы), `varianty`,
`otvety`, `reshenie`, `samoproverka`, `metodichka`, `shablon`, `konspekt`, `slides`.

Соответствие «папка → название дисциплины» задаётся в
[catalog/disciplines.json](catalog/disciplines.json). Папку можно назвать
и по-русски — тогда словарь не нужен. Файл с именем не по соглашению не потеряется:
он станет отдельным материалом, подписанным своим именем.

### Уточнения: `_meta.json`

Автоопределение не знает названия работы, курса и срока сдачи. Их добавляет
необязательный файл `_meta.json` в той же папке — его удобно править прямо
в веб-редакторе GitHub:

```json
{
  "discipline": "Теория вероятностей",
  "course": 2,
  "semester": 4,
  "items": {
    "tr-01": {
      "title": "Случайные события и вероятность",
      "deadline": "сдать до конца 9-й недели",
      "status": "open",
      "statusLabel": "приём открыт"
    }
  }
}
```

Ключ внутри `items` — это распознанный код работы (`tr-01`). Значения `status`:
`open` (зелёная метка), `soon` (жёлтая), `done` (серая).

Для полного контроля над разделом остаётся вариант с центральным
`catalog/*.json` — описанные там работы показываются первыми, распознанные
автоматически идут следом.

### Автопубликация

[.github/workflows/deploy.yml](.github/workflows/deploy.yml) запускается при каждом
push в `main` и делает всё сам: ставит Node, pandoc и TeX Live, собирает
предпросмотр, пересобирает каталог и сайт, публикует результат в ветку `gh-pages`.

Значит, локально ставить Node и TeX не обязательно: файлы можно загружать прямо
через веб-интерфейс GitHub. Ход сборки виден на вкладке **Actions**; там же есть
кнопка ручного запуска.

Команда `npm run deploy` продолжает работать и делает то же самое с вашей машины —
это запасной путь, если Actions недоступны.

> Настройка GitHub Pages менять не нужно: публикация по-прежнему идёт из ветки
> `gh-pages` (**Settings → Pages → Deploy from a branch → gh-pages / (root)**).

### Кнопки у файла

| Кнопка | Что делает | Для каких файлов |
| --- | --- | --- |
| **Скачать** | прямая ссылка на файл, опубликованный вместе с сайтом | все |
| **Просмотр** | окно предпросмотра, без скачивания | у кого есть превью |
| **Colab** | открывает ноутбук в Google Colab и позволяет запустить код | `.ipynb` |
| **GitHub** | просмотр исходника в репозитории | все |

Ссылки GitHub и Colab строятся из `src/repoConfig.js`.

> **Важно.** Они ведут в **исходный** репозиторий, поэтому ветка `main` с папкой
> `public/files` должна быть запушена на GitHub, а сам репозиторий — публичным:
> Colab не открывает ноутбуки из приватных репозиториев.

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
