/**
 * Логотип, иконки и картинки талисмана лаборатории — ламы.
 *
 *   assets/llama.png  → public/logo.png            логотип в навбаре
 *                     → public/favicon.png         значок вкладки браузера
 *                     → public/icons/icon-192.png  иконка приложения (ярлык на телефоне)
 *                     → public/icons/icon-512.png
 *   assets/mascot/*.png → public/mascot/*.png      иллюстрации страниц, уменьшенные
 *
 * Логотип — круглый значок: лама на светлом поле, обод фирменного зелёного
 * цвета (он же цвет свитера ламы). Иконка приложения — тот же значок
 * на тёмно-синей плитке с фирменным градиентом.
 *
 * PNG читается и пишется вручную (zlib + фильтры строк), поэтому скрипт
 * не требует ни одной внешней зависимости — работает и на сборочном сервере.
 *
 * Запуск:  npm run icons
 */
import { deflateSync, inflateSync } from 'node:zlib';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(ROOT, 'assets', 'llama.png');
const MASCOT_DIR = join(ROOT, 'assets', 'mascot');
const PUBLIC_DIR = join(ROOT, 'public');

// Иллюстрации на страницах показываются высотой примерно 160 px,
// с запасом на экраны с удвоенной плотностью точек
const MASCOT_HEIGHT = 320;
const MASCOT_COLOR_STEP = 16; // огрубление цвета: вдвое меньше файл, на глаз незаметно

// Палитра (см. src/index.css и сам рисунок)
const NAVY_DARK = [13, 43, 69];
const NAVY = [18, 58, 95];
const CREAM = [252, 250, 246]; // поле значка — чуть тёплее белого
const GREEN = [9, 107, 69]; // свитер ламы, он же обод значка

// Раскладка значка в долях от его стороны
const RING_WIDTH = 0.05; // толщина обода
const ART_WIDTH = 0.56; // ширина рисунка
const ART_TOP = 0.069; // отступ рисунка сверху
const TILE_RADIUS = 0.22; // скругление плитки иконки приложения
const TILE_ART = 0.78; // доля плитки, занятая значком (остальное — поля,
//                        их обрезают «маскируемые» иконки Android)

/* --- Чтение и запись PNG ------------------------------------------------- */

const SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buffer) {
  let crc = -1;
  for (let i = 0; i < buffer.length; i += 1) {
    crc = CRC_TABLE[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

/** Собирает один PNG-чанк: длина + тип + данные + контрольная сумма. */
function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([length, typeAndData, crc]);
}

/**
 * Кодирует картинку {width, height, data (RGBA)} в PNG.
 *
 * Перед сжатием каждая строка предсказывается по соседям — это «фильтры» PNG.
 * Какой из них выгоднее, зависит от рисунка, поэтому пробуются все пять
 * и остаётся тот, после которого файл получился меньше.
 */
function encodePng({ width, height, data }) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // бит на канал
  ihdr[9] = 6; // цветовой тип: truecolor + alpha
  ihdr[10] = 0; // компрессия
  ihdr[11] = 0; // фильтрация
  ihdr[12] = 0; // без интерлейсинга

  const stride = width * 4;

  /** Готовит поток строк, отфильтрованных одним и тем же способом. */
  const filtered = (filter) => {
    const raw = Buffer.alloc(height * (stride + 1));
    for (let y = 0; y < height; y += 1) {
      const row = data.subarray(y * stride, (y + 1) * stride);
      const previous = y > 0 ? data.subarray((y - 1) * stride, y * stride) : null;
      const rowStart = y * (stride + 1);
      raw[rowStart] = filter;

      for (let i = 0; i < stride; i += 1) {
        const left = i >= 4 ? row[i - 4] : 0;
        const up = previous ? previous[i] : 0;
        const upLeft = previous && i >= 4 ? previous[i - 4] : 0;

        let value = row[i];
        if (filter === 1) value -= left;
        else if (filter === 2) value -= up;
        else if (filter === 3) value -= (left + up) >> 1;
        else if (filter === 4) value -= paeth(left, up, upLeft);

        raw[rowStart + 1 + i] = value & 0xff;
      }
    }
    return deflateSync(raw, { level: 9 });
  };

  let best = null;
  for (let filter = 0; filter <= 4; filter += 1) {
    const packed = filtered(filter);
    if (!best || packed.length < best.length) best = packed;
  }

  return Buffer.concat([
    Buffer.from(SIGNATURE),
    chunk('IHDR', ihdr),
    chunk('IDAT', best),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/** Предсказатель Paeth — один из пяти фильтров строк PNG. */
function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  return pb <= pc ? b : c;
}

/**
 * Разбирает PNG в {width, height, data (RGBA)}.
 * Поддерживаются восьмибитные картинки без интерлейсинга — с прозрачностью
 * и без неё; именно такие получаются из графических редакторов.
 */
function decodePng(buffer) {
  if (!SIGNATURE.every((byte, i) => buffer[i] === byte)) throw new Error('это не PNG');

  let width = 0;
  let height = 0;
  let channels = 0;
  const parts = [];

  for (let offset = 8; offset < buffer.length; ) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    offset += length + 12; // длина + тип + данные + CRC

    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      const depth = data[8];
      const colorType = data[9];
      const interlace = data[12];
      if (depth !== 8 || interlace !== 0 || (colorType !== 6 && colorType !== 2)) {
        throw new Error(`неподдерживаемый PNG: глубина ${depth}, тип ${colorType}, интерлейсинг ${interlace}`);
      }
      channels = colorType === 6 ? 4 : 3;
    } else if (type === 'IDAT') parts.push(data);
    else if (type === 'IEND') break;
  }

  const raw = inflateSync(Buffer.concat(parts));
  const stride = width * channels;
  const out = new Uint8Array(width * height * 4);
  let previous = new Uint8Array(stride);
  let cursor = 0;

  for (let y = 0; y < height; y += 1) {
    const filter = raw[cursor];
    cursor += 1;
    const line = raw.subarray(cursor, cursor + stride);
    cursor += stride;

    const row = new Uint8Array(stride);
    for (let i = 0; i < stride; i += 1) {
      const left = i >= channels ? row[i - channels] : 0;
      const up = previous[i];
      const upLeft = i >= channels ? previous[i - channels] : 0;
      let value = line[i];

      if (filter === 1) value += left;
      else if (filter === 2) value += up;
      else if (filter === 3) value += (left + up) >> 1;
      else if (filter === 4) value += paeth(left, up, upLeft);
      else if (filter !== 0) throw new Error(`неизвестный фильтр строки: ${filter}`);

      row[i] = value & 0xff;
    }

    for (let x = 0; x < width; x += 1) {
      const to = (y * width + x) * 4;
      const from = x * channels;
      out[to] = row[from];
      out[to + 1] = row[from + 1];
      out[to + 2] = row[from + 2];
      out[to + 3] = channels === 4 ? row[from + 3] : 255;
    }

    previous = row;
  }

  return { width, height, data: out };
}

/* --- Рисование ----------------------------------------------------------- */

const clamp01 = (v) => Math.min(1, Math.max(0, v));

/** Плавный переход — им сглаживаются края фигур. */
const smooth = (edge0, edge1, x) => {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

/** Смешивает цвет `src` поверх `base` с прозрачностью `alpha`. */
function mix(base, src, alpha) {
  const a = clamp01(alpha);
  if (a <= 0) return base;
  return [
    base[0] * (1 - a) + src[0] * a,
    base[1] * (1 - a) + src[1] * a,
    base[2] * (1 - a) + src[2] * a,
  ];
}

/**
 * Уменьшение картинки усреднением по площади: каждый новый пиксель — среднее
 * тех, что в него попали. Прозрачность учитывается заранее умноженной,
 * иначе по краям рисунка появляется светлая кайма.
 */
function resize(image, width, height) {
  const { width: sw, height: sh, data } = image;
  const out = new Uint8Array(width * height * 4);

  for (let y = 0; y < height; y += 1) {
    const top = (y * sh) / height;
    const bottom = ((y + 1) * sh) / height;

    for (let x = 0; x < width; x += 1) {
      const left = (x * sw) / width;
      const right = ((x + 1) * sw) / width;

      let r = 0;
      let g = 0;
      let b = 0;
      let alpha = 0;
      let total = 0;

      for (let sy = Math.floor(top); sy < Math.min(sh, Math.ceil(bottom)); sy += 1) {
        const weightY = Math.min(bottom, sy + 1) - Math.max(top, sy);
        for (let sx = Math.floor(left); sx < Math.min(sw, Math.ceil(right)); sx += 1) {
          const weight = weightY * (Math.min(right, sx + 1) - Math.max(left, sx));
          if (weight <= 0) continue;

          const i = (sy * sw + sx) * 4;
          const a = (data[i + 3] / 255) * weight;
          r += data[i] * a;
          g += data[i + 1] * a;
          b += data[i + 2] * a;
          alpha += a;
          total += weight;
        }
      }

      const o = (y * width + x) * 4;
      if (alpha > 0) {
        out[o] = Math.round(r / alpha);
        out[o + 1] = Math.round(g / alpha);
        out[o + 2] = Math.round(b / alpha);
      }
      out[o + 3] = Math.round(255 * (total > 0 ? alpha / total : 0));
    }
  }

  return { width, height, data: out };
}

/**
 * Огрубляет цвета до шага `step`.
 *
 * Рисунок талисмана плоский, на глаз разница незаметна, а файл после этого
 * вдвое меньше: одинаковых байтов становится больше, и zlib сжимает плотнее.
 * Полностью прозрачные и полностью непрозрачные точки остаются такими же,
 * иначе по краю рисунка появляется грязь.
 */
function posterize(image, step) {
  const { data } = image;
  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c += 1) data[i + c] = Math.min(255, Math.round(data[i + c] / step) * step);
    const alpha = data[i + 3];
    if (alpha > 250) data[i + 3] = 255;
    else if (alpha < 6) data[i + 3] = 0;
    else data[i + 3] = Math.round(alpha / step) * step;
  }
  return image;
}

/**
 * Круглый значок: лама на светлом поле с зелёным ободом.
 * Всё за пределами круга прозрачно, поэтому значок одинаково хорош
 * и на тёмном навбаре, и на светлой странице.
 */
function renderBadge(size, art) {
  const rgba = new Uint8Array(size * size * 4);
  const center = size / 2;
  const radius = size / 2 - 0.5;
  const ring = size * RING_WIDTH;

  const artWidth = Math.max(1, Math.round(size * ART_WIDTH));
  const artHeight = Math.max(1, Math.round((artWidth * art.height) / art.width));
  const drawing = resize(art, artWidth, artHeight);
  const artX = Math.round((size - artWidth) / 2);
  const artY = Math.round(size * ART_TOP);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const distance = Math.hypot(x + 0.5 - center, y + 0.5 - center) - radius;
      const inside = 1 - smooth(-0.75, 0.75, distance);
      if (inside <= 0) continue;

      let color = CREAM;

      // Рисунок, обрезанный краем круга
      const ax = x - artX;
      const ay = y - artY;
      if (ax >= 0 && ay >= 0 && ax < artWidth && ay < artHeight) {
        const i = (ay * artWidth + ax) * 4;
        color = mix(color, [drawing.data[i], drawing.data[i + 1], drawing.data[i + 2]], drawing.data[i + 3] / 255);
      }

      // Обод: кольцо шириной `ring` внутри края круга
      const onRing = inside * smooth(-ring - 0.75, -ring + 0.75, distance);
      color = mix(color, GREEN, onRing);

      const o = (y * size + x) * 4;
      rgba[o] = Math.round(color[0]);
      rgba[o + 1] = Math.round(color[1]);
      rgba[o + 2] = Math.round(color[2]);
      rgba[o + 3] = Math.round(255 * inside);
    }
  }

  return { width: size, height: size, data: rgba };
}

/**
 * Иконка приложения: значок на тёмно-синей плитке.
 * Поля вокруг значка нужны Android — он обрезает иконку по своей форме.
 */
function renderAppIcon(size, art) {
  const rgba = new Uint8Array(size * size * 4);
  const radius = size * TILE_RADIUS;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const cx = x + 0.5;
      const cy = y + 0.5;

      // Диагональный градиент фирменных синих
      const t = (cx + cy) / (2 * size);
      const background = [
        NAVY_DARK[0] + (NAVY[0] - NAVY_DARK[0]) * t,
        NAVY_DARK[1] + (NAVY[1] - NAVY_DARK[1]) * t,
        NAVY_DARK[2] + (NAVY[2] - NAVY_DARK[2]) * t,
      ];

      // Расстояние до скруглённого квадрата (signed distance field)
      const qx = Math.max(Math.abs(cx - size / 2) - (size / 2 - radius), 0);
      const qy = Math.max(Math.abs(cy - size / 2) - (size / 2 - radius), 0);
      const tileAlpha = 1 - smooth(-1, 1, Math.hypot(qx, qy) - radius);

      const o = (y * size + x) * 4;
      rgba[o] = Math.round(background[0]);
      rgba[o + 1] = Math.round(background[1]);
      rgba[o + 2] = Math.round(background[2]);
      rgba[o + 3] = Math.round(255 * tileAlpha);
    }
  }

  // Значок по центру плитки
  const badgeSize = Math.round(size * TILE_ART);
  const badge = renderBadge(badgeSize, art);
  const offset = Math.round((size - badgeSize) / 2);

  for (let y = 0; y < badgeSize; y += 1) {
    for (let x = 0; x < badgeSize; x += 1) {
      const from = (y * badgeSize + x) * 4;
      const alpha = badge.data[from + 3] / 255;
      if (alpha <= 0) continue;

      const to = ((y + offset) * size + x + offset) * 4;
      const color = mix([rgba[to], rgba[to + 1], rgba[to + 2]], [badge.data[from], badge.data[from + 1], badge.data[from + 2]], alpha);
      rgba[to] = Math.round(color[0]);
      rgba[to + 1] = Math.round(color[1]);
      rgba[to + 2] = Math.round(color[2]);
      rgba[to + 3] = Math.max(rgba[to + 3], badge.data[from + 3]);
    }
  }

  return { width: size, height: size, data: rgba };
}

/* --- Точка входа --------------------------------------------------------- */

const art = decodePng(readFileSync(SOURCE));
console.log(`Исходный рисунок: ${art.width}×${art.height}`);

const files = [
  ['logo.png', renderBadge(192, art)],
  ['favicon.png', renderBadge(64, art)],
  ['icons/icon-192.png', renderAppIcon(192, art)],
  ['icons/icon-512.png', renderAppIcon(512, art)],
];

for (const [name, image] of files) {
  const file = join(PUBLIC_DIR, name);
  mkdirSync(dirname(file), { recursive: true });
  const png = encodePng(image);
  writeFileSync(file, png);
  console.log(`  ${name} — ${image.width}×${image.height}, ${(png.length / 1024).toFixed(1)} КБ`);
}

// Картинки талисмана: те же рисунки, уменьшенные до размера, в котором
// показываются на страницах. Исходники остаются в assets/ и на сайт не едут.
if (existsSync(MASCOT_DIR)) {
  for (const name of readdirSync(MASCOT_DIR).sort()) {
    if (!name.endsWith('.png')) continue;

    const source = decodePng(readFileSync(join(MASCOT_DIR, name)));
    const height = Math.min(MASCOT_HEIGHT, source.height);
    const width = Math.max(1, Math.round((source.width * height) / source.height));
    const file = join(PUBLIC_DIR, 'mascot', name);

    mkdirSync(dirname(file), { recursive: true });
    const png = encodePng(posterize(resize(source, width, height), MASCOT_COLOR_STEP));
    writeFileSync(file, png);
    console.log(`  mascot/${name} — ${width}×${height}, ${(png.length / 1024).toFixed(1)} КБ`);
  }
}
