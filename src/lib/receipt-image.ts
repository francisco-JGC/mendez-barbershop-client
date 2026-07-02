export interface ReceiptBitmap {
  widthDots: number;
  heightDots: number;
  bytes: Uint8Array;
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}

/**
 * Converts an image (data URL) into a 1-bit-per-pixel bitmap sized for a
 * thermal printer. The output width is rounded down to a multiple of 8 so
 * each byte cleanly packs 8 horizontal pixels — ESC/POS raster requires this.
 *
 * Uses Floyd–Steinberg dithering to approximate greyscale as patterns of
 * black/white dots, which looks noticeably better than a hard threshold on
 * logos that aren't pure B/W.
 */
export async function imageToReceiptBitmap(
  dataUrl: string,
  maxWidthDots: number,
): Promise<ReceiptBitmap> {
  const image = await loadImage(dataUrl);

  // Fit within maxWidthDots while keeping aspect ratio, and round width down
  // to the nearest multiple of 8 (raster bitmaps pack 8 px per byte).
  const scale = Math.min(1, maxWidthDots / image.naturalWidth);
  const widthDots = Math.max(8, Math.floor((image.naturalWidth * scale) / 8) * 8);
  const heightDots = Math.max(
    1,
    Math.round((image.naturalHeight * widthDots) / image.naturalWidth),
  );

  const canvas = document.createElement('canvas');
  canvas.width = widthDots;
  canvas.height = heightDots;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  // Fill white so transparent PNGs render on white (not black) after threshold.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, widthDots, heightDots);
  ctx.drawImage(image, 0, 0, widthDots, heightDots);

  const { data } = ctx.getImageData(0, 0, widthDots, heightDots);

  // Convert RGBA → grayscale in a plain Float32Array so we can mutate it
  // during Floyd–Steinberg dithering (values may go outside 0..255).
  const gray = new Float32Array(widthDots * heightDots);
  for (let i = 0; i < gray.length; i += 1) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    const a = data[i * 4 + 3] / 255;
    // Compose over white for transparency: value * a + 255 * (1 - a)
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    gray[i] = lum * a + 255 * (1 - a);
  }

  const widthBytes = widthDots / 8;
  const bytes = new Uint8Array(widthBytes * heightDots);

  for (let y = 0; y < heightDots; y += 1) {
    for (let x = 0; x < widthDots; x += 1) {
      const idx = y * widthDots + x;
      const oldPixel = gray[idx];
      const newPixel = oldPixel < 128 ? 0 : 255;
      const error = oldPixel - newPixel;
      gray[idx] = newPixel;

      // Distribute the quantization error to unprocessed neighbours.
      if (x + 1 < widthDots) gray[idx + 1] += (error * 7) / 16;
      if (y + 1 < heightDots) {
        if (x > 0) gray[idx + widthDots - 1] += (error * 3) / 16;
        gray[idx + widthDots] += (error * 5) / 16;
        if (x + 1 < widthDots) gray[idx + widthDots + 1] += (error * 1) / 16;
      }

      // Pack this pixel into the output byte (MSB = leftmost pixel).
      if (newPixel === 0) {
        const byteIndex = y * widthBytes + (x >> 3);
        bytes[byteIndex] |= 1 << (7 - (x & 7));
      }
    }
  }

  return { widthDots, heightDots, bytes };
}
