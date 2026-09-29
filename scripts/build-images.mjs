/**
 * Готовит фото с Авито (photos/raw) для сайта и кладёт мастер-копии в src/assets/photos.
 *
 * Для каждого фото: закрашивает водяной знак Авито окружающим фоном, выравнивает баланс
 * белого, осветляет товар, делает фон ровнее по маске «товар / фон» из photos/masks
 * (её строит scripts/subject-mask.swift) и кадрирует в 4:5. AVIF/WebP из мастер-копий
 * Astro собирает сам.
 *
 * Заодно рисует превью ссылки (public/og.jpg) и иконку для iOS из public/favicon.svg.
 *
 * Запуск: npm run images
 */
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

const RAW_DIR = "photos/raw";
const MASK_DIR = "photos/masks";
const OUT_DIR = "src/assets/photos";

/** Тёплый кремовый, к которому приводим светлые фоны (соотношение каналов в линейном RGB). */
const CREAM = [1, 0.93, 0.84];

/** Где Авито ставит логотип на фото 720×960 и 630×840. */
const WATERMARK_720 = { left: 598, top: 902, width: 122, height: 56 };
const WATERMARK_630 = { left: 508, top: 782, width: 122, height: 54 };

/**
 * @typedef {{ left: number, top: number, width: number, height: number }} Rect
 *
 * @typedef {object} PhotoConfig
 * @property {string} name          имя итогового файла без расширения
 * @property {string} file          исходник в photos/raw
 * @property {Rect} crop            итоговый кадр, 4:5
 * @property {Rect} whiteRef        участок фона, по которому выставляется баланс белого
 * @property {number[]} whiteTarget каким должен стать whiteRef (соотношение каналов в линейном RGB)
 * @property {number} whiteStrength 0..1 — насколько сильно тянуть к whiteTarget
 * @property {Rect | null} watermark что закрасить окружающим фоном
 * @property {number} exposure      сколько ступеней экспозиции добавить товару
 * @property {number | null} background желаемая светлота фона (sRGB 0..1); null — фон как есть
 * @property {number} saturation    1 — насыщенность без изменений
 * @property {number} contrast      0..1 — насколько приблизить к S-кривой
 */

/** @type {PhotoConfig[]} */
const PHOTOS = [
  {
    name: "round-box-open",
    file: "round-box-open.png",
    crop: { left: 0, top: 60, width: 720, height: 900 },
    whiteRef: { left: 20, top: 20, width: 200, height: 150 },
    whiteTarget: CREAM,
    whiteStrength: 0.9,
    watermark: WATERMARK_720,
    exposure: 1.1,
    background: 0.93,
    saturation: 1.1,
    contrast: 0.2,
  },
  {
    name: "round-box-hand",
    file: "round-box-hand.png",
    crop: { left: 0, top: 0, width: 720, height: 900 },
    whiteRef: { left: 200, top: 20, width: 200, height: 80 },
    whiteTarget: CREAM,
    whiteStrength: 0.9,
    watermark: WATERMARK_720,
    exposure: 1.1,
    background: 0.92,
    saturation: 1.1,
    contrast: 0.2,
  },
  {
    name: "square-box",
    file: "square-box.webp",
    crop: { left: 0, top: 30, width: 720, height: 900 },
    whiteRef: { left: 20, top: 20, width: 200, height: 120 },
    whiteTarget: CREAM,
    whiteStrength: 0.9,
    watermark: WATERMARK_720,
    exposure: 0.9,
    background: 0.93,
    saturation: 1.1,
    contrast: 0.2,
  },
  {
    name: "narrow-boxes",
    file: "narrow-boxes.webp",
    crop: { left: 0, top: 20, width: 720, height: 900 },
    whiteRef: { left: 250, top: 20, width: 200, height: 60 },
    whiteTarget: CREAM,
    whiteStrength: 0.9,
    watermark: WATERMARK_720,
    exposure: 0.9,
    background: 0.93,
    saturation: 1.1,
    contrast: 0.2,
  },
  {
    name: "dome-pink",
    file: "dome-pink.png",
    crop: { left: 0, top: 30, width: 720, height: 900 },
    whiteRef: { left: 20, top: 20, width: 150, height: 150 },
    whiteTarget: [1, 0.72, 0.9],
    whiteStrength: 0.6,
    watermark: WATERMARK_720,
    exposure: 0.9,
    background: 0.86,
    saturation: 1.05,
    contrast: 0.15,
  },
  {
    name: "dome-window",
    file: "dome-window.png",
    crop: { left: 0, top: 60, width: 720, height: 900 },
    whiteRef: { left: 20, top: 20, width: 200, height: 150 },
    whiteTarget: CREAM,
    whiteStrength: 0.7,
    watermark: WATERMARK_720,
    exposure: 0.6,
    background: null,
    saturation: 1.05,
    contrast: 0.15,
  },
  {
    name: "mushrooms-table",
    file: "mushrooms-table.webp",
    crop: { left: 0, top: 0, width: 720, height: 900 },
    whiteRef: { left: 430, top: 222, width: 80, height: 36 },
    whiteTarget: [1, 0.97, 0.93],
    whiteStrength: 0.8,
    watermark: null,
    exposure: 0.75,
    background: null,
    saturation: 1.08,
    contrast: 0.15,
  },
  {
    name: "mushrooms-hand",
    file: "mushrooms-hand.webp",
    crop: { left: 0, top: 0, width: 720, height: 900 },
    whiteRef: { left: 600, top: 20, width: 100, height: 100 },
    whiteTarget: [1, 0.97, 0.93],
    whiteStrength: 0.6,
    watermark: WATERMARK_720,
    exposure: 0.9,
    background: null,
    saturation: 1.08,
    contrast: 0.15,
  },
  {
    name: "round-boxes-six",
    file: "round-boxes-six.webp",
    crop: { left: 0, top: 0, width: 630, height: 787 },
    whiteRef: { left: 20, top: 780, width: 150, height: 40 },
    whiteTarget: [1, 0.72, 0.78],
    whiteStrength: 0.5,
    watermark: WATERMARK_630,
    exposure: 0.2,
    background: null,
    saturation: 1,
    contrast: 0.1,
  },
];

const OG_PHOTOS = ["round-box-open", "dome-pink", "narrow-boxes"];

const KNEE = 0.8;
const FEATHER_RADIUS = 3;
const FILL_RADIUS = 14;
const LIGHT_RADIUS = 48;
const GRAIN_RADIUS = 3;
const BACKGROUND_SMOOTHING = 0.7;

const toLinearTable = Float32Array.from({ length: 256 }, (_, value) => {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
});

/** @param {number} c значение в линейном RGB */
function toSrgb(c) {
  if (c <= 0.0031308) {
    return 12.92 * c;
  }
  return 1.055 * c ** (1 / 2.4) - 0.055;
}

/** @param {number} r @param {number} g @param {number} b */
function luminance(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Мягкое сжатие светов вместо жёсткой обрезки. @param {number} x */
function rollOff(x) {
  if (x <= KNEE) {
    return x;
  }
  const headroom = 1 - KNEE;
  return KNEE + headroom * (1 - Math.exp(-(x - KNEE) / headroom));
}

/** @param {number} x */
function sCurve(x) {
  return x * x * (3 - 2 * x);
}

/** @param {number} x */
function clamp01(x) {
  return Math.min(1, Math.max(0, x));
}

/**
 * Один проход box-размытия по строкам или столбцам; за краем повторяется крайний пиксель.
 * @param {Float32Array} src @param {number} width @param {number} height
 * @param {number} radius @param {boolean} horizontal
 */
function boxPass(src, width, height, radius, horizontal) {
  const dst = new Float32Array(src.length);
  const lines = horizontal ? height : width;
  const length = horizontal ? width : height;
  const step = horizontal ? 1 : width;
  const size = 2 * radius + 1;
  for (let line = 0; line < lines; line++) {
    const start = horizontal ? line * width : line;
    const at = (/** @type {number} */ i) =>
      src[start + Math.min(length - 1, Math.max(0, i)) * step];
    let sum = 0;
    for (let i = -radius; i <= radius; i++) {
      sum += at(i);
    }
    for (let i = 0; i < length; i++) {
      dst[start + i * step] = sum / size;
      sum += at(i + radius + 1) - at(i - radius);
    }
  }
  return dst;
}

/** Три прохода box-размытия — почти гауссово размытие с sigma ≈ radius. */
function blur(
  /** @type {Float32Array} */ data,
  /** @type {number} */ width,
  /** @type {number} */ height,
  /** @type {number} */ radius,
) {
  let out = data;
  for (let pass = 0; pass < 3; pass++) {
    out = boxPass(boxPass(out, width, height, radius, true), width, height, radius, false);
  }
  return out;
}

/**
 * Размытие, в котором участвуют только пиксели с весом (нормированная свёртка).
 * @param {Float32Array} values @param {Float32Array} weights
 * @param {number} width @param {number} height @param {number} radius
 */
function weightedBlur(values, weights, width, height, radius) {
  const weighted = values.map((value, i) => value * weights[i]);
  const top = blur(weighted, width, height, radius);
  const bottom = blur(weights, width, height, radius);
  return top.map((value, i) => value / Math.max(bottom[i], 1e-4));
}

/** @param {Float32Array} rgb @param {number} channel */
function plane(rgb, channel) {
  const out = new Float32Array(rgb.length / 3);
  for (let i = 0; i < out.length; i++) {
    out[i] = rgb[i * 3 + channel];
  }
  return out;
}

/** @param {Rect} rect @param {number} x @param {number} y */
function inside(rect, x, y) {
  return (
    x >= rect.left && x < rect.left + rect.width && y >= rect.top && y < rect.top + rect.height
  );
}

/** Детерминированное зерно, чтобы повторный запуск давал те же файлы. @param {number} seed */
function grain(seed) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296 - 0.5;
  };
}

/** @param {Float32Array} rgb @param {number} width @param {Rect} rect */
function averageColor(rgb, width, rect) {
  const sum = [0, 0, 0];
  for (let y = rect.top; y < rect.top + rect.height; y++) {
    for (let x = rect.left; x < rect.left + rect.width; x++) {
      const i = (y * width + x) * 3;
      sum[0] += rgb[i];
      sum[1] += rgb[i + 1];
      sum[2] += rgb[i + 2];
    }
  }
  const count = rect.width * rect.height;
  return sum.map((value) => value / count);
}

/** Множители каналов: тянут оттенок эталонного участка к цели, не меняя его яркость. */
function whiteBalanceGains(/** @type {number[]} */ reference, /** @type {PhotoConfig} */ photo) {
  const full = reference.map((value, c) => (photo.whiteTarget[c] * reference[0]) / value);
  const partial = full.map((gain) => 1 + (gain - 1) * photo.whiteStrength);
  const before = luminance(reference[0], reference[1], reference[2]);
  const after = luminance(
    reference[0] * partial[0],
    reference[1] * partial[1],
    reference[2] * partial[2],
  );
  return partial.map((gain) => (gain * before) / after);
}

/** Заменяет водяной знак сглаженным фоном вокруг него с лёгким зерном. */
function repaintWatermark(
  /** @type {Float32Array} */ rgb,
  /** @type {Float32Array} */ mask,
  /** @type {number} */ width,
  /** @type {number} */ height,
  /** @type {Rect} */ rect,
) {
  const weights = new Float32Array(mask.length);
  for (let i = 0; i < weights.length; i++) {
    const x = i % width;
    const y = Math.floor(i / width);
    weights[i] = inside(rect, x, y) ? 0 : 1 - mask[i];
  }
  const fills = [0, 1, 2].map((c) =>
    weightedBlur(plane(rgb, c), weights, width, height, FILL_RADIUS),
  );
  const noise = grain(width * height);
  for (let y = rect.top; y < Math.min(height, rect.top + rect.height); y++) {
    for (let x = rect.left; x < Math.min(width, rect.left + rect.width); x++) {
      const i = y * width + x;
      const edge = Math.min(
        x - rect.left,
        rect.left + rect.width - 1 - x,
        y - rect.top,
        rect.top + rect.height - 1 - y,
      );
      const alpha = clamp01((edge + 1) / 4);
      const jitter = 1 + noise() * 0.03;
      for (let c = 0; c < 3; c++) {
        rgb[i * 3 + c] += (fills[c][i] * jitter - rgb[i * 3 + c]) * alpha;
      }
    }
  }
}

/**
 * Усиление для каждого пикселя: товар получает одинаковую экспозицию, а фон подтягивается
 * к ровной светлоте, сохраняя собственные тени.
 */
function exposureGains(
  /** @type {Float32Array} */ rgb,
  /** @type {Float32Array} */ mask,
  /** @type {number} */ width,
  /** @type {number} */ height,
  /** @type {PhotoConfig} */ photo,
) {
  const productGain = 2 ** photo.exposure;
  const gains = new Float32Array(mask.length).fill(productGain);
  if (photo.background === null) {
    return gains;
  }
  const light = new Float32Array(mask.length);
  const weights = new Float32Array(mask.length);
  for (let i = 0; i < light.length; i++) {
    light[i] = luminance(rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2]);
    weights[i] = 1 - mask[i];
  }
  const target = toLinearTable[Math.round(photo.background * 255)];
  const field = weightedBlur(light, weights, width, height, LIGHT_RADIUS);
  for (let i = 0; i < gains.length; i++) {
    const backgroundGain = target / Math.max(field[i], 1e-3);
    gains[i] = productGain * mask[i] + backgroundGain * (1 - mask[i]);
  }
  return gains;
}

/** Сглаживает JPEG-шум только на фоне. */
function smoothBackground(
  /** @type {Float32Array} */ rgb,
  /** @type {Float32Array} */ mask,
  /** @type {number} */ width,
  /** @type {number} */ height,
) {
  const smooth = [0, 1, 2].map((c) => blur(plane(rgb, c), width, height, GRAIN_RADIUS));
  for (let i = 0; i < mask.length; i++) {
    const amount = (1 - mask[i]) * BACKGROUND_SMOOTHING;
    for (let c = 0; c < 3; c++) {
      rgb[i * 3 + c] += (smooth[c][i] - rgb[i * 3 + c]) * amount;
    }
  }
}

/** Тоновая кривая, контраст и насыщенность в sRGB; возвращает 8-битные пиксели. */
function finish(/** @type {Float32Array} */ rgb, /** @type {PhotoConfig} */ photo) {
  const out = new Uint8Array(rgb.length);
  for (let i = 0; i < rgb.length; i += 3) {
    const display = [0, 1, 2].map((c) => {
      const value = clamp01(toSrgb(rollOff(rgb[i + c])));
      return value + (sCurve(value) - value) * photo.contrast;
    });
    const grey = luminance(display[0], display[1], display[2]);
    for (let c = 0; c < 3; c++) {
      out[i + c] = Math.round(clamp01(grey + (display[c] - grey) * photo.saturation) * 255);
    }
  }
  return out;
}

async function loadMask(
  /** @type {string} */ name,
  /** @type {number} */ width,
  /** @type {number} */ height,
) {
  const bytes = await sharp(`${MASK_DIR}/${name}.png`)
    .resize(width, height, { fit: "fill" })
    .toColourspace("b-w")
    .raw()
    .toBuffer();
  const mask = Float32Array.from(bytes, (value) => value / 255);
  return blur(mask, width, height, FEATHER_RADIUS);
}

async function processPhoto(/** @type {PhotoConfig} */ photo) {
  const { data, info } = await sharp(`${RAW_DIR}/${photo.file}`)
    .removeAlpha()
    .toColourspace("srgb")
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const rgb = Float32Array.from(data, (value) => toLinearTable[value]);
  const mask = await loadMask(photo.name, width, height);

  if (photo.watermark) {
    repaintWatermark(rgb, mask, width, height, photo.watermark);
  }
  const whiteGains = whiteBalanceGains(averageColor(rgb, width, photo.whiteRef), photo);
  for (let i = 0; i < rgb.length; i++) {
    rgb[i] *= whiteGains[i % 3];
  }
  const gains = exposureGains(rgb, mask, width, height, photo);
  for (let i = 0; i < rgb.length; i++) {
    rgb[i] *= gains[Math.floor(i / 3)];
  }
  if (photo.background !== null) {
    smoothBackground(rgb, mask, width, height);
  }

  const output = `${OUT_DIR}/${photo.name}.jpg`;
  await sharp(finish(rgb, photo), { raw: { width, height, channels: 3 } })
    .extract(photo.crop)
    .sharpen({ sigma: 0.6, m1: 0.3, m2: 1.5 })
    .jpeg({ quality: 92, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toFile(output);
  console.log(`${output}  ${photo.crop.width}×${photo.crop.height}`);
}

/** Три фото рядом, 1200×630 — превью, которое мессенджеры показывают для ссылки. */
async function makeLinkPreview() {
  const tileWidth = 392;
  const gap = 12;
  const tiles = await Promise.all(
    OG_PHOTOS.map((name) =>
      sharp(`${OUT_DIR}/${name}.jpg`).resize(tileWidth, 630, { fit: "cover" }).toBuffer(),
    ),
  );
  await sharp({ create: { width: 1200, height: 630, channels: 3, background: "#fbf7f2" } })
    .composite(tiles.map((input, index) => ({ input, left: index * (tileWidth + gap), top: 0 })))
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile("public/og.jpg");
  console.log("public/og.jpg  1200×630");
}

async function makeTouchIcon() {
  const mark = await sharp("public/favicon.svg", { density: 900 })
    .resize(128, 128)
    .png()
    .toBuffer();
  await sharp({ create: { width: 180, height: 180, channels: 4, background: "#fbf7f2" } })
    .composite([{ input: mark, gravity: "center" }])
    .png()
    .toFile("public/apple-touch-icon.png");
  console.log("public/apple-touch-icon.png  180×180");
}

await mkdir(OUT_DIR, { recursive: true });
const only = process.argv.slice(2);
for (const photo of PHOTOS) {
  if (only.length === 0 || only.includes(photo.name)) {
    await processPhoto(photo);
  }
}
if (only.length === 0) {
  await makeLinkPreview();
  await makeTouchIcon();
}
