/**
 * Координаты репозитория на GitHub — из них строятся ссылки «GitHub» и «Colab»
 * для каждого файла в разделах сайта.
 *
 * Важно: эти ссылки ведут в **исходный** репозиторий, а не на опубликованный
 * сайт. Чтобы они работали, ветка `branch` с папкой `filesPath` должна быть
 * запушена на GitHub (обычная команда `git push origin main`).
 *
 * Если исходники не публикуются, а на GitHub уходит только сборка
 * (`npm run deploy` пушит папку build в ветку gh-pages), поменяйте значения на:
 *     branch: 'gh-pages',
 *     filesPath: 'files',
 * — в ветке gh-pages файлы лежат без префикса public/.
 */
export const REPO = {
  owner: 'sharipovaka',
  name: 'fs1',
  branch: 'main',
  /** Путь к папке с файлами внутри репозитория. */
  filesPath: 'public/files',
};

/** Путь к файлу внутри репозитория: public/files/disciplines/plans/x.md */
function repoPath(relativePath) {
  return `${REPO.filesPath}/${relativePath}`;
}

/**
 * Ссылка на любой статический ресурс сайта (путь от корня публикации).
 * BASE_URL — префикс подпапки GitHub Pages (например «/fs1/»).
 * Используется для файлов предпросмотра: «previews/…/coursework.pdf».
 */
export function assetUrl(path) {
  return `${import.meta.env.BASE_URL}${path}`;
}

/** Прямая ссылка на скачивание файла раздела. */
export function downloadUrl(relativePath) {
  return assetUrl(`files/${relativePath}`);
}

/** Просмотр файла на GitHub (ноутбуки GitHub отрисовывает сам). */
export function githubUrl(relativePath) {
  return `https://github.com/${REPO.owner}/${REPO.name}/blob/${REPO.branch}/${repoPath(relativePath)}`;
}

/**
 * Открытие ноутбука в Google Colab.
 * Colab умеет забирать .ipynb напрямую из публичного репозитория GitHub.
 */
export function colabUrl(relativePath) {
  return `https://colab.research.google.com/github/${REPO.owner}/${REPO.name}/blob/${REPO.branch}/${repoPath(
    relativePath
  )}`;
}

/** Ссылка на папку раздела в репозитории. */
export function githubFolderUrl(folder) {
  return `https://github.com/${REPO.owner}/${REPO.name}/tree/${REPO.branch}/${repoPath(folder)}`;
}
