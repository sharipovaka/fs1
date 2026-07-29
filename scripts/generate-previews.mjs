/**
 * Генерация предпросмотра файлов разделов в public/previews/.
 *
 *   .md, .ipynb → HTML-фрагмент (pandoc, формулы в MathML — без внешних библиотек)
 *   .csv        → HTML-таблица (собственный парсер, без зависимостей)
 *   .tex        → скомпилированный PDF (pdflatex) + PNG-миниатюра первой страницы
 *
 * Результат складывается рядом с исходной структурой:
 *   public/files/disciplines/templates/coursework.tex
 *   → public/previews/disciplines/templates/coursework.pdf
 *   → public/previews/disciplines/templates/coursework.png
 *
 * Файлы предпросмотра коммитятся в репозиторий, поэтому собрать сайт можно
 * и без pandoc/pdflatex — они нужны только для обновления превью.
 * Повторно обрабатываются только файлы, изменившиеся после прошлого запуска.
 *
 * Запуск: npm run previews (или npm run previews -- --force)
 */
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, relative } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILES_DIR = join(ROOT, 'public', 'files');
const OUT_DIR = join(ROOT, 'public', 'previews');
const FORCE = process.argv.includes('--force');

/** Ищет исполняемый файл, возвращает путь или null. */
function which(name, extraPaths = []) {
  for (const dir of [...extraPaths, '/usr/local/bin', '/opt/homebrew/bin', '/usr/bin', '/bin']) {
    const candidate = join(dir, name);
    if (existsSync(candidate)) return candidate;
  }
  try {
    return execFileSync('/usr/bin/which', [name], { encoding: 'utf8' }).trim() || null;
  } catch {
    return null;
  }
}

const PANDOC = which('pandoc');
const PDFLATEX = which('pdflatex', ['/Library/TeX/texbin']);
// Миниатюра первой страницы PDF: sips есть в macOS, pdftoppm — в Linux (poppler-utils).
// Благодаря второму варианту скрипт работает и на сборочном сервере GitHub Actions.
const SIPS = which('sips');
const PDFTOPPM = which('pdftoppm');

/**
 * Делает PNG-миниатюру первой страницы PDF доступным в системе инструментом.
 * @returns {boolean} удалось ли создать файл
 */
function makeThumbnail(pdfPath, pngPath) {
  try {
    if (SIPS) {
      execFileSync(SIPS, ['-s', 'format', 'png', '-Z', '900', pdfPath, '--out', pngPath], { stdio: 'pipe' });
      return true;
    }
    if (PDFTOPPM) {
      // -singlefile добавляет расширение сам, поэтому передаём путь без «.png»
      execFileSync(PDFTOPPM, ['-png', '-singlefile', '-scale-to', '900', pdfPath, pngPath.replace(/\.png$/, '')], {
        stdio: 'pipe',
      });
      return existsSync(pngPath);
    }
  } catch {
    /* обработается ниже */
  }
  return false;
}

/* --- вспомогательные функции --- */

const escapeHtml = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Рекурсивный обход каталога. */
function walk(dir) {
  const result = [];
  for (const name of readdirSync(dir).sort()) {
    if (name.startsWith('.')) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) result.push(...walk(full));
    else result.push(full);
  }
  return result;
}

/** Нужно ли пересобирать: нет результата или исходник новее. */
function isStale(source, target) {
  if (FORCE || !existsSync(target)) return true;
  return statSync(source).mtimeMs > statSync(target).mtimeMs;
}

function ensureDir(filePath) {
  mkdirSync(dirname(filePath), { recursive: true });
}

/** Разбор CSV с поддержкой кавычек и запятых внутри полей. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else inQuotes = false;
      } else field += char;
      continue;
    }

    if (char === '"') inQuotes = true;
    else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (char !== '\r') field += char;
  }

  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}

/* --- обработчики по типам --- */

function previewCsv(source, target) {
  const rows = parseCsv(readFileSync(source, 'utf8'));
  if (!rows.length) return false;

  const [header, ...body] = rows;
  const head = header.map((cell) => `<th>${escapeHtml(cell)}</th>`).join('');
  const lines = body
    .map((cells) => `<tr>${cells.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`)
    .join('\n');

  const html = `<p class="muted">Таблица из ${body.length} строк. Файл открывается в Excel, LibreOffice и Google Таблицах.</p>
<table>
<thead><tr>${head}</tr></thead>
<tbody>
${lines}
</tbody>
</table>`;

  ensureDir(target);
  writeFileSync(target, html, 'utf8');
  return true;
}

function previewWithPandoc(source, target, format) {
  if (!PANDOC) return false;
  const html = execFileSync(
    PANDOC,
    [source, '-f', format, '-t', 'html', '--mathml', '--wrap=none'],
    { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }
  );
  ensureDir(target);
  writeFileSync(target, html, 'utf8');
  return true;
}

/** Компилирует .tex в PDF и делает PNG-миниатюру первой страницы. */
function previewTex(source, pdfTarget, pngTarget) {
  if (!PDFLATEX) return false;

  const work = join(tmpdir(), `tex-preview-${basename(source, '.tex')}-${process.pid}`);
  rmSync(work, { recursive: true, force: true });
  mkdirSync(work, { recursive: true });

  try {
    copyFileSync(source, join(work, basename(source)));

    // Два прохода: оглавление и перекрёстные ссылки во втором проходе встают на место.
    for (let pass = 0; pass < 2; pass += 1) {
      execFileSync(PDFLATEX, ['-interaction=nonstopmode', '-halt-on-error', basename(source)], {
        cwd: work,
        stdio: 'pipe',
      });
    }

    const producedPdf = join(work, `${basename(source, '.tex')}.pdf`);
    if (!existsSync(producedPdf)) return false;

    ensureDir(pdfTarget);
    copyFileSync(producedPdf, pdfTarget);

    // Миниатюра первой страницы — для карточки материала.
    if (!makeThumbnail(pdfTarget, pngTarget)) {
      console.warn(`  миниатюру создать не удалось: ${relative(ROOT, pngTarget)}`);
    }
    return true;
  } catch (error) {
    const log = join(work, `${basename(source, '.tex')}.log`);
    const hint = existsSync(log) ? readFileSync(log, 'utf8').split('\n').filter((l) => l.startsWith('!')).slice(0, 2).join(' ') : '';
    console.warn(`  ошибка компиляции ${relative(ROOT, source)}: ${hint || error.message.slice(0, 120)}`);
    return false;
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

/* --- основной проход --- */

if (!existsSync(FILES_DIR)) {
  console.warn(`Папка ${relative(ROOT, FILES_DIR)} не найдена — предпросмотр не создан`);
  process.exit(0);
}

if (!PANDOC) console.warn('pandoc не найден: предпросмотр .md и .ipynb пропускается');
if (!PDFLATEX) console.warn('pdflatex не найден: предпросмотр .tex пропускается');

let built = 0;
let skipped = 0;

for (const source of walk(FILES_DIR)) {
  const rel = relative(FILES_DIR, source).split(/[\\/]/).join('/');
  const ext = extname(source).toLowerCase();
  const withoutExt = join(OUT_DIR, rel.slice(0, -ext.length));

  let done = false;

  if (ext === '.csv') {
    const target = `${withoutExt}.html`;
    if (isStale(source, target)) done = previewCsv(source, target);
    else skipped += 1;
  } else if (ext === '.md') {
    const target = `${withoutExt}.html`;
    if (isStale(source, target)) done = previewWithPandoc(source, target, 'markdown');
    else skipped += 1;
  } else if (ext === '.ipynb') {
    const target = `${withoutExt}.html`;
    if (isStale(source, target)) done = previewWithPandoc(source, target, 'ipynb');
    else skipped += 1;
  } else if (ext === '.tex') {
    const pdfTarget = `${withoutExt}.pdf`;
    const pngTarget = `${withoutExt}.png`;
    if (isStale(source, pdfTarget)) {
      console.log(`  компиляция ${rel} …`);
      done = previewTex(source, pdfTarget, pngTarget);
    } else skipped += 1;
  }

  if (done) built += 1;
}

console.log(`Предпросмотр: создано ${built}, актуально ${skipped} → ${relative(ROOT, OUT_DIR)}/`);
