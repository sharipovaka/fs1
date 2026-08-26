/**
 * Проверка, не вышла ли новая версия сайта.
 *
 * GitHub Pages отдаёт файлы с кэшем на десять минут, поэтому вкладка,
 * открытая до публикации, ещё какое-то время показывает прежнюю версию:
 * браузер берёт из кэша index.html, а тот ссылается на старый файл сборки.
 *
 * Имя файла сборки содержит хэш содержимого («index-D8RfUD9I.js»), значит
 * достаточно сравнить имя, с которым работает открытая страница, с тем,
 * что сейчас стоит в index.html на сервере. Никакого service worker
 * и никаких дополнительных файлов для этого не нужно.
 */
const ASSET = /assets\/(index-[\w-]+\.js)/;

/** Файл сборки, на котором работает открытая сейчас страница. */
function currentAsset() {
  // В собранном сайте весь код лежит в одном модуле, и import.meta.url —
  // это его адрес. Запасной вариант на случай другой схемы сборки —
  // тег <script> из самой страницы.
  const fromModule = ASSET.exec(import.meta.url)?.[1];
  if (fromModule) return fromModule;

  const tag = document.querySelector('script[type="module"][src]')?.getAttribute('src') ?? '';
  return ASSET.exec(tag)?.[1] ?? null;
}

/** Файл сборки, который сейчас стоит в index.html на сервере. */
async function publishedAsset() {
  // no-store — иначе браузер ответит из того же кэша, который мы проверяем
  const response = await fetch(`${import.meta.env.BASE_URL}index.html`, { cache: 'no-store' });
  if (!response.ok) return null;
  return ASSET.exec(await response.text())?.[1] ?? null;
}

/**
 * Опубликована ли версия новее открытой.
 * Ошибки сети считаются за «нет»: интернет мог пропасть, мешать не нужно.
 */
export async function hasNewVersion() {
  // В режиме разработки страница и так пересобирается на лету
  if (!import.meta.env.PROD) return false;

  const current = currentAsset();
  if (!current) return false;

  try {
    const published = await publishedAsset();
    return Boolean(published) && published !== current;
  } catch {
    return false;
  }
}
