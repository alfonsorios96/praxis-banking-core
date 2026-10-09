import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const ink = [31, 79, 70, 255] as const;
const paper = [243, 234, 215, 255] as const;
const gold = [166, 132, 86, 255] as const;

function crc32(buf: Buffer): number {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]!;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
  }
  return ~c >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function insideRound(x: number, y: number, size: number, radius: number): boolean {
  const max = size - 1;
  if (x >= radius && x <= max - radius) return y >= 0 && y <= max;
  if (y >= radius && y <= max - radius) return x >= 0 && x <= max;
  const cx = x < radius ? radius : max - radius;
  const cy = y < radius ? radius : max - radius;
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= radius * radius;
}

function inMark(nx: number, ny: number): boolean {
  const stem = nx > 0.3 && nx < 0.42 && ny > 0.22 && ny < 0.78;
  const cx = 0.5;
  const cy = 0.4;
  const dx = (nx - cx) / 0.22;
  const dy = (ny - cy) / 0.18;
  const outer = dx * dx + dy * dy <= 1;
  const idx = (nx - cx) / 0.11;
  const idy = (ny - cy) / 0.08;
  const inner = idx * idx + idy * idy <= 1;
  const bowl = outer && !inner && nx > 0.36 && ny < 0.58;
  return stem || bowl;
}

function paint(x: number, y: number, size: number, maskable: boolean): readonly [number, number, number, number] {
  if (!maskable) {
    const radius = size * 0.22;
    if (!insideRound(x, y, size, radius)) {
      return [0, 0, 0, 0];
    }
  }

  const nx = x / size;
  const ny = y / size;
  if (inMark(nx, ny)) return paper;
  if (ny > 0.82 && ny < 0.86 && nx > 0.3 && nx < 0.7) return gold;
  return ink;
}

function png(size: number, maskable: boolean): Buffer {
  const stride = size * 4 + 1;
  const raw = Buffer.alloc(stride * size);
  for (let y = 0; y < size; y++) {
    const row = y * stride;
    raw[row] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = paint(x, y, size, maskable);
      const i = row + 1 + x * 4;
      raw[i] = r;
      raw[i + 1] = g;
      raw[i + 2] = b;
      raw[i + 3] = a;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function write(relativePath: string, size: number, maskable: boolean) {
  const target = resolve(root, relativePath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, png(size, maskable));
}

write("public/icons/icon-192.png", 192, false);
write("public/icons/icon-512.png", 512, false);
write("public/icons/icon-maskable-512.png", 512, true);
write("src/app/icon.png", 192, false);
write("src/app/apple-icon.png", 180, false);

console.log("Iconos de Praxis escritos.");
