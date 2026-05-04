const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const SIZE = 128;
const pixels = new Uint8Array(SIZE * SIZE * 4);

function setPixel(x, y, r, g, b, a = 255) {
  if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) {
    return;
  }
  const i = (y * SIZE + x) * 4;
  pixels[i] = r;
  pixels[i + 1] = g;
  pixels[i + 2] = b;
  pixels[i + 3] = a;
}

function blendPixel(x, y, r, g, b, a) {
  if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) {
    return;
  }
  const i = (y * SIZE + x) * 4;
  const srcA = a / 255;
  const dstA = pixels[i + 3] / 255;
  const outA = srcA + dstA * (1 - srcA);
  if (outA === 0) {
    return;
  }
  pixels[i] = Math.round((r * srcA + pixels[i] * dstA * (1 - srcA)) / outA);
  pixels[i + 1] = Math.round((g * srcA + pixels[i + 1] * dstA * (1 - srcA)) / outA);
  pixels[i + 2] = Math.round((b * srcA + pixels[i + 2] * dstA * (1 - srcA)) / outA);
  pixels[i + 3] = Math.round(outA * 255);
}

function insideRoundedRect(x, y, rx, ry, w, h, r) {
  const x2 = rx + w;
  const y2 = ry + h;
  if (x < rx || x >= x2 || y < ry || y >= y2) return false;
  const left = rx + r;
  const right = x2 - r;
  const top = ry + r;
  const bottom = y2 - r;
  if (x >= left && x < right) return true;
  if (y >= top && y < bottom) return true;
  const cx = x < left ? left : right - 1;
  const cy = y < top ? top : bottom - 1;
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}

function fillRoundedRect(rx, ry, w, h, r, color) {
  for (let y = Math.floor(ry); y < Math.ceil(ry + h); y++) {
    for (let x = Math.floor(rx); x < Math.ceil(rx + w); x++) {
      if (insideRoundedRect(x, y, rx, ry, w, h, r)) {
        setPixel(x, y, ...color);
      }
    }
  }
}

function fillCircle(cx, cy, radius, color) {
  const r2 = radius * radius;
  for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y++) {
    for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r2) {
        setPixel(x, y, ...color);
      }
    }
  }
}

function fillCircleAlpha(cx, cy, radius, color, alpha) {
  const r2 = radius * radius;
  for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y++) {
    for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r2) {
        blendPixel(x, y, ...color, alpha);
      }
    }
  }
}

function distToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  if (dx === 0 && dy === 0) {
    const ddx = px - ax;
    const ddy = py - ay;
    return Math.sqrt(ddx * ddx + ddy * ddy);
  }
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  const ddx = px - cx;
  const ddy = py - cy;
  return Math.sqrt(ddx * ddx + ddy * ddy);
}

function strokeLine(ax, ay, bx, by, thickness, color, alpha = 255) {
  const minX = Math.floor(Math.min(ax, bx) - thickness - 1);
  const maxX = Math.ceil(Math.max(ax, bx) + thickness + 1);
  const minY = Math.floor(Math.min(ay, by) - thickness - 1);
  const maxY = Math.ceil(Math.max(ay, by) + thickness + 1);
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (distToSegment(x + 0.5, y + 0.5, ax, ay, bx, by) <= thickness / 2) {
        blendPixel(x, y, ...color, alpha);
      }
    }
  }
  fillCircleAlpha(ax, ay, thickness / 2, color, alpha);
  fillCircleAlpha(bx, by, thickness / 2, color, alpha);
}

function drawPageFold(x, y, size, colorMain, colorShadow) {
  for (let yy = y; yy < y + size; yy++) {
    for (let xx = x; xx < x + size; xx++) {
      if (xx >= x + (yy - y)) {
        setPixel(xx, yy, ...colorMain);
      }
    }
  }
  strokeLine(x, y, x + size, y + size, 1.5, colorShadow, 110);
}

function crc32(buf) {
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      t[i] = c >>> 0;
    }
    return t;
  })());
  let c = 0xffffffff;
  for (const byte of buf) {
    c = table[(c ^ byte) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  const crc = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function makePng(rgba, width, height) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const row = y * (width * 4 + 1);
    raw[row] = 0;
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4;
      const dst = row + 1 + x * 4;
      raw[dst] = rgba[src];
      raw[dst + 1] = rgba[src + 1];
      raw[dst + 2] = rgba[src + 2];
      raw[dst + 3] = rgba[src + 3];
    }
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const idat = zlib.deflateSync(raw, { level: 9 });
  const iend = Buffer.alloc(0);
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', iend),
  ]);
}

// Transparent background by default.

// Clipboard frame.
fillRoundedRect(16, 12, 96, 104, 18, [25, 35, 52, 255]);

// Paper inside the clipboard.
fillRoundedRect(29, 28, 72, 88, 11, [250, 250, 252, 255]);

// Header clip.
fillRoundedRect(46, 10, 36, 24, 9, [25, 35, 52, 255]);
fillCircle(64, 26, 8, [25, 35, 52, 255]);
fillCircle(64, 18, 5, [250, 250, 252, 255]);

// Folded corner.
drawPageFold(91, 30, 14, [235, 239, 245, 255], [170, 181, 196, 255]);

// Main code symbol.
strokeLine(51, 62, 39, 74, 8, [31, 102, 255, 255]);
strokeLine(39, 74, 51, 86, 8, [31, 102, 255, 255]);
strokeLine(73, 50, 61, 78, 8, [31, 102, 255, 255]);
strokeLine(77, 62, 89, 74, 8, [31, 102, 255, 255]);
strokeLine(89, 74, 77, 86, 8, [31, 102, 255, 255]);

// Reference lines.
strokeLine(42, 97, 64, 97, 6, [164, 179, 212, 255]);
strokeLine(42, 110, 64, 110, 6, [164, 179, 212, 255]);
fillCircle(39, 97, 2.8, [164, 179, 212, 255]);
fillCircle(39, 110, 2.8, [164, 179, 212, 255]);

// Copy badge.
fillCircle(94, 98, 22, [28, 100, 255, 255]);
fillCircle(94, 98, 21, [28, 100, 255, 255]);
strokeLine(88, 88, 88, 113, 4.5, [255, 255, 255, 255]);
strokeLine(88, 88, 100, 88, 4.5, [255, 255, 255, 255]);
strokeLine(100, 88, 100, 96, 4.5, [255, 255, 255, 255]);
strokeLine(100, 96, 106, 96, 4.5, [255, 255, 255, 255]);
strokeLine(106, 96, 106, 113, 4.5, [255, 255, 255, 255]);
strokeLine(106, 113, 88, 113, 4.5, [255, 255, 255, 255]);
strokeLine(91, 92, 91, 111, 4.5, [255, 255, 255, 255]);
strokeLine(91, 92, 99, 92, 4.5, [255, 255, 255, 255]);
strokeLine(99, 92, 99, 101, 4.5, [255, 255, 255, 255]);
strokeLine(99, 101, 109, 101, 4.5, [255, 255, 255, 255]);
strokeLine(109, 101, 109, 113, 4.5, [255, 255, 255, 255]);
strokeLine(109, 113, 91, 113, 4.5, [255, 255, 255, 255]);

const outPath = path.join(__dirname, '..', 'media', 'icon.png');
fs.writeFileSync(outPath, makePng(pixels, SIZE, SIZE));
console.log(`Wrote ${outPath}`);
