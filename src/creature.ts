import { Rng } from "./rng";

export type Rgb = [number, number, number];
export type Box = { x: number; y: number; w: number; h: number };

export function rgbFromGlyph(g: string): Rgb {
  let n = 2166136261;
  for (const ch of g) {
    n ^= ch.codePointAt(0) ?? 0;
    n = Math.imul(n, 16777619);
  }
  return [
    40 + ((n & 255) % 150),
    45 + (((n >> 8) & 255) % 130),
    28 + (((n >> 16) & 255) % 120),
  ];
}

export function mixRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

export function cssRgb(c: Rgb, a = 1): string {
  return `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;
}

export function codeTag(g: string): string {
  return [...g]
    .map((ch) => "U+" + (ch.codePointAt(0) ?? 0).toString(16).toUpperCase())
    .join(" ");
}

function well(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const g = ctx.createRadialGradient(w * 0.5, h * 0.42, 16, w * 0.5, h * 0.5, w * 0.72);
  g.addColorStop(0, "#1c2616");
  g.addColorStop(1, "#070806");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function blob(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  n: number,
  rng: Rng,
  jitter: number,
): void {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const k = 1 + rng.range(-jitter, jitter);
    pts.push({ x: cx + Math.cos(t) * rx * k, y: cy + Math.sin(t) * ry * k });
  }
  const last = pts[n - 1]!;
  const first = pts[0]!;
  ctx.beginPath();
  ctx.moveTo((last.x + first.x) / 2, (last.y + first.y) / 2);
  for (let i = 0; i < n; i++) {
    const p = pts[i]!;
    const q = pts[(i + 1) % n]!;
    ctx.quadraticCurveTo(p.x, p.y, (p.x + q.x) / 2, (p.y + q.y) / 2);
  }
  ctx.closePath();
}

function limb(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  angle: number,
  len: number,
  thick: number,
  color: string,
  rng: Rng,
): void {
  const x2 = cx + Math.cos(angle) * len;
  const y2 = cy + Math.sin(angle) * len;
  const bend = rng.range(-0.7, 0.7);
  const cpx = cx + Math.cos(angle + bend) * len * 0.52;
  const cpy = cy + Math.sin(angle + bend) * len * 0.52;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = thick;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.quadraticCurveTo(cpx, cpy, x2, y2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x2, y2, thick * 0.85, 0, Math.PI * 2);
  ctx.fill();
}

function aura(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  color: string,
  rng: Rng,
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.42;
  ctx.lineWidth = Math.max(2, rx * 0.025);
  ctx.setLineDash([7, 9]);
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx * 1.38, ry * 1.34, rng.range(-0.2, 0.2), 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 0.18;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx * 1.55, ry * 1.5, rng.range(-0.1, 0.1), 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function eye(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.fillStyle = "#f3edd4";
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.82, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#12140e";
  ctx.beginPath();
  ctx.arc(x + r * 0.12, y, r * 0.44, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#8dff7a";
  ctx.beginPath();
  ctx.arc(x + r * 0.28, y - r * 0.18, r * 0.13, 0, Math.PI * 2);
  ctx.fill();
}

function spots(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  color: string,
  rng: Rng,
): void {
  ctx.fillStyle = color;
  const n = 4 + rng.int(5);
  for (let i = 0; i < n; i++) {
    const t = rng.range(0, Math.PI * 2);
    const d = rng.range(0.15, 0.55);
    ctx.beginPath();
    ctx.ellipse(
      cx + Math.cos(t) * rx * d,
      cy + Math.sin(t) * ry * d,
      rng.range(3, 9),
      rng.range(2, 7),
      t,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}

function stampParents(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  a: string,
  b: string,
): void {
  ctx.save();
  ctx.globalAlpha = 0.32;
  ctx.font = `${Math.floor(w * 0.16)}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(a, w * 0.18, h * 0.88);
  ctx.fillText(b, w * 0.82, h * 0.88);
  ctx.restore();
}

export function drawCreature(
  ctx: CanvasRenderingContext2D,
  box: Box,
  a: string,
  b: string,
  rng: Rng,
): void {
  ctx.save();
  ctx.translate(box.x, box.y);
  ctx.beginPath();
  ctx.rect(0, 0, box.w, box.h);
  ctx.clip();
  paintBeast(ctx, box.w, box.h, a, b, rng);
  ctx.restore();
}

function paintBeast(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  a: string,
  b: string,
  rng: Rng,
): void {
  well(ctx, w, h);
  const cx = w * 0.5;
  const cy = h * 0.46;
  const ca = rgbFromGlyph(a);
  const cb = rgbFromGlyph(b);
  const body = mixRgb(ca, cb, 0.5);
  const dark = mixRgb(body, [18, 22, 10], 0.45);
  const glow = mixRgb(body, [125, 255, 106], 0.28);
  const rx = w * rng.range(0.22, 0.28);
  const ry = h * rng.range(0.18, 0.26);
  aura(ctx, cx, cy, rx, ry, cssRgb(glow, 0.9), rng);
  drawLimbs(ctx, cx, cy, rx, ry, cssRgb(mixRgb(ca, dark, 0.2)), rng);
  blob(ctx, cx, cy, rx, ry, 8 + rng.int(4), rng, 0.18);
  ctx.fillStyle = cssRgb(body);
  ctx.fill();
  ctx.strokeStyle = cssRgb(dark);
  ctx.lineWidth = Math.max(3, w * 0.008);
  ctx.stroke();
  spots(ctx, cx, cy, rx, ry, cssRgb(dark, 0.35), rng);
  drawEyes(ctx, cx, cy, rx, rng);
  stampParents(ctx, w, h, a, b);
}

function drawLimbs(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  color: string,
  rng: Rng,
): void {
  const n = 2 + rng.int(4);
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2 + rng.range(-0.2, 0.2);
    limb(
      ctx,
      cx + Math.cos(t) * rx * 0.55,
      cy + Math.sin(t) * ry * 0.55,
      t,
      rng.range(rx * 0.7, rx * 1.25),
      rng.range(rx * 0.12, rx * 0.22),
      color,
      rng,
    );
  }
}

function drawEyes(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, rng: Rng): void {
  const n = 1 + rng.int(3);
  const r = rx * rng.range(0.14, 0.2);
  if (n === 1) eye(ctx, cx, cy - r * 0.4, r);
  else if (n === 2) {
    eye(ctx, cx - r * 1.15, cy - r * 0.35, r);
    eye(ctx, cx + r * 1.15, cy - r * 0.35, r);
  } else {
    eye(ctx, cx, cy - r * 1.1, r * 0.85);
    eye(ctx, cx - r * 1.2, cy - r * 0.1, r * 0.85);
    eye(ctx, cx + r * 1.2, cy - r * 0.1, r * 0.85);
  }
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  max: number,
  lh: number,
): number {
  const words = text.split(" ");
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > max) {
      ctx.fillText(line, x, y);
      line = word;
      y += lh;
    } else line = test;
  }
  if (line) ctx.fillText(line, x, y);
  return y;
}

function hazardBand(ctx: CanvasRenderingContext2D, y: number, w: number, h: number): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, y, w, h);
  ctx.clip();
  ctx.fillStyle = "#0e0f0a";
  ctx.fillRect(0, y, w, h);
  ctx.fillStyle = "#c4a035";
  for (let x = -h; x < w + h; x += 22) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + h, y);
    ctx.lineTo(x + h * 2, y + h);
    ctx.lineTo(x + h, y + h);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function plateChrome(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.fillStyle = "#14160f";
  ctx.fillRect(0, 0, w, h);
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#222616");
  g.addColorStop(1, "#10120c");
  ctx.fillStyle = g;
  ctx.fillRect(36, 36, w - 72, h - 72);
  ctx.strokeStyle = "#b8943e";
  ctx.lineWidth = 8;
  ctx.strokeRect(48, 48, w - 96, h - 96);
  hazardBand(ctx, 0, w, 28);
  hazardBand(ctx, h - 28, w, 28);
}

export function paintPlate(
  a: string,
  b: string,
  name: string,
  lore: string,
  serial: string,
  rng: Rng,
): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 1080;
  c.height = 1440;
  const ctx = c.getContext("2d")!;
  plateChrome(ctx, 1080, 1440);
  plateCopy(ctx, name, serial, a, b);
  drawCreature(ctx, { x: 190, y: 210, w: 700, h: 700 }, a, b, rng);
  ctx.fillStyle = "#c9c09a";
  ctx.font = "22px 'Share Tech Mono', monospace";
  ctx.textAlign = "left";
  wrapText(ctx, lore, 90, 1036, 900, 32);
  ctx.fillStyle = "#7a6a40";
  ctx.font = "18px 'Share Tech Mono', monospace";
  ctx.fillText("CHIMEMOJI  ·  EMOJI FUSION LABORATORY  ·  a Fun Toy", 90, 1388);
  return c;
}

function plateCopy(
  ctx: CanvasRenderingContext2D,
  name: string,
  serial: string,
  a: string,
  b: string,
): void {
  ctx.fillStyle = "#8dff7a";
  ctx.font = "20px 'Share Tech Mono', monospace";
  ctx.textAlign = "left";
  ctx.fillText("BAY 7  ·  FUSION PLATE  ·  " + serial, 90, 72);
  ctx.fillStyle = "#d6b45c";
  ctx.font = "700 56px Cinzel, serif";
  ctx.fillText("CHIMEMOJI", 90, 150);
  ctx.fillStyle = "#d6b45c";
  ctx.font = "700 48px Cinzel, serif";
  ctx.textAlign = "center";
  ctx.fillText(name, 540, 990);
  ctx.font = "28px serif";
  ctx.fillText(`${a}   ×   ${b}`, 540, 938);
}
