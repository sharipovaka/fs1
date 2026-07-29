/**
 * Генерация PNG-иконок для PWA-манифеста (192×192 и 512×512).
 *
 * Иконка повторяет favicon.svg: тёмно-синий фон, оси координат и график функции
 * фирменного жёлтого цвета. PNG собирается вручную (IHDR/IDAT/IEND + zlib),
 * поэтому скрипт не требует ни одной внешней зависимости.
 *
 * Запуск:  npm run icons
 */
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons');

// Палитра кафедры (см. src/index.css)
const NAVY_DARK = [13, 43, 69];
const NAVY = [18, 58, 95];
const AXIS = [127, 168, 204];
const ACCENT = [255, 200, 87];

/* --- Утилиты PNG --------------------------------------------------------- */

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
 * Кодирует массив RGBA-пикселей в PNG.
 * @param {number} size сторона квадратного изображения
 * @param {Uint8Array} rgba данные пикселей длиной size*size*4
 */
function encodePng(size, rgba) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); // ширина
  ihdr.writeUInt32BE(size, 4); // высота
  ihdr[8] = 8; // бит на канал
  ihdr[9] = 6; // цветовой тип: truecolor + alpha
  ihdr[10] = 0; // компрессия
  ihdr[11] = 0; // фильтрация
  ihdr[12] = 0; // без интерлейсинга

  // Каждая строка предваряется байтом фильтра (0 — без фильтра).
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y += 1) {
    const rowStart = y * (size * 4 + 1);
    raw[rowStart] = 0;
    Buffer.from(rgba.buffer, y * size * 4, size * 4).copy(raw, rowStart + 1);
  }

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* --- Рисование ----------------------------------------------------------- */

const clamp01 = (v) => Math.min(1, Math.max(0, v));
/** Плавный переход (сглаживание краёв фигур). */
const smooth = (edge0, edge1, x) => {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

/** Смешивает цвет `src` с фоном `dst` с прозрачностью `alpha`. */
function blend(dst, index, src, alpha) {
  if (alpha <= 0) return;
  const a = clamp01(alpha);
  for (let c = 0; c < 3; c += 1) {
    dst[index + c] = Math.round(dst[index + c] * (1 - a) + src[c] * a);
  }
}

/**
 * Кривая, повторяющая график из логотипа, в нормированных координатах [0,1].
 * Подобрана так, чтобы пересекать горизонтальную ось: слева идёт над ней,
 * образует «горб» и уходит вниз справа — иконка читается как график функции.
 */
function curveY(x) {
  return 0.5 - 0.32 * Math.sin(Math.PI * (x * 1.55 - 0.15));
}

function renderIcon(size) {
  const rgba = new Uint8Array(size * size * 4);
  const px = (v) => v * size; // доля стороны → пиксели

  const radius = px(0.22); // скругление углов
  const axisWidth = px(0.016);
  const curveWidth = px(0.075);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4;
      const cx = x + 0.5;
      const cy = y + 0.5;

      // 1. Фон: диагональный градиент со скруглёнными углами.
      const t = (cx + cy) / (2 * size);
      const bg = [
        Math.round(NAVY_DARK[0] + (NAVY[0] - NAVY_DARK[0]) * t),
        Math.round(NAVY_DARK[1] + (NAVY[1] - NAVY_DARK[1]) * t),
        Math.round(NAVY_DARK[2] + (NAVY[2] - NAVY_DARK[2]) * t),
      ];

      // Расстояние до скруглённого квадрата (signed distance field)
      const qx = Math.max(Math.abs(cx - size / 2) - (size / 2 - radius), 0);
      const qy = Math.max(Math.abs(cy - size / 2) - (size / 2 - radius), 0);
      const distToShape = Math.hypot(qx, qy) - radius;
      const shapeAlpha = 1 - smooth(-1, 1, distToShape);

      rgba[i] = bg[0];
      rgba[i + 1] = bg[1];
      rgba[i + 2] = bg[2];
      rgba[i + 3] = Math.round(255 * shapeAlpha);

      if (shapeAlpha <= 0) continue;

      // 2. Оси координат.
      const axisX = px(0.26);
      const axisY = px(0.62);
      const insetLo = px(0.16);
      const insetHi = px(0.86);

      const onVertical =
        cy > insetLo && cy < insetHi ? 1 - smooth(axisWidth * 0.6, axisWidth * 1.4, Math.abs(cx - axisX)) : 0;
      const onHorizontal =
        cx > insetLo && cx < insetHi ? 1 - smooth(axisWidth * 0.6, axisWidth * 1.4, Math.abs(cy - axisY)) : 0;
      blend(rgba, i, AXIS, 0.55 * Math.max(onVertical, onHorizontal));

      // 3. График функции: приближённое расстояние до кривой y = curveY(x).
      const nx = cx / size;
      let minDist = Infinity;
      // Просматриваем окрестность по x; шаг мелкий, иначе края кривой «махрятся».
      for (let s = -48; s <= 48; s += 1) {
        const sx = nx + (s / 96) * 0.16;
        if (sx < 0.14 || sx > 0.88) continue;
        const dx = (sx - nx) * size;
        const dy = curveY(sx) * size - cy;
        minDist = Math.min(minDist, Math.hypot(dx, dy));
      }
      const onCurve = 1 - smooth(curveWidth * 0.42, curveWidth * 0.62, minDist);
      blend(rgba, i, ACCENT, onCurve);
    }
  }

  return encodePng(size, rgba);
}

/* --- Точка входа --------------------------------------------------------- */

mkdirSync(OUT_DIR, { recursive: true });

for (const size of [192, 512]) {
  const file = join(OUT_DIR, `icon-${size}.png`);
  writeFileSync(file, renderIcon(size));
  console.log(`Создана иконка ${size}×${size}: ${file}`);
}
