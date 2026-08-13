import "./style.css";
import { drawCreature, paintPlate, codeTag } from "./creature";
import { CATALOG, firstEmoji } from "./emoji";
import { myth } from "./lore";
import { fuseName } from "./names";
import { pairSeed, Rng, serialOf } from "./rng";
import { tryUpgrade } from "./upgrade";

const canvas = document.querySelector<HTMLCanvasElement>("#creature")!;
const ctx = canvas.getContext("2d")!;
const statusEl = document.querySelector("#status")!;
const nameEl = document.querySelector("#name")!;
const loreEl = document.querySelector("#lore")!;
const serialEl = document.querySelector("#serial")!;
const codesEl = document.querySelector("#codes")!;
const parentsEl = document.querySelector("#parents")!;

type Slot = "a" | "b";

let a = "🐙";
let b = "☕";
let name = "";
let lore = "";
let seed = 0;

function readQuery(): void {
  const q = new URLSearchParams(location.search);
  a = firstEmoji(q.get("a") ?? "") || a;
  b = firstEmoji(q.get("b") ?? "") || b;
}

function writeQuery(): void {
  const url = new URL(location.href);
  url.searchParams.set("a", a);
  url.searchParams.set("b", b);
  history.replaceState(null, "", url);
}

function setSlot(slot: Slot, glyph: string, syncInput = true): void {
  if (slot === "a") a = glyph;
  else b = glyph;
  document.querySelector(`#preview-${slot}`)!.textContent = glyph;
  if (syncInput) {
    document.querySelector<HTMLInputElement>(`#input-${slot}`)!.value = glyph;
  }
  document.querySelectorAll(`#grid-${slot} button`).forEach((btn) => {
    btn.classList.toggle("on", btn.textContent === glyph);
  });
}

function mountGrid(slot: Slot): void {
  const grid = document.querySelector(`#grid-${slot}`)!;
  const current = slot === "a" ? a : b;
  for (const glyph of CATALOG) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = glyph;
    btn.className = glyph === current ? "on" : "";
    btn.addEventListener("click", () => setSlot(slot, glyph));
    grid.append(btn);
  }
  const input = document.querySelector<HTMLInputElement>(`#input-${slot}`)!;
  input.addEventListener("input", () => {
    const g = firstEmoji(input.value);
    if (g) setSlot(slot, g, false);
  });
}

function sizeCanvas(): void {
  const css = Math.min(canvas.clientWidth || 420, 520);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(css * dpr);
  canvas.height = Math.floor(css * dpr);
}

function brew(): { name: string; lore: string; seed: number } {
  const s = pairSeed(a, b);
  const rng = new Rng(s);
  const n = fuseName(a, b, rng);
  return { name: n, lore: myth(n, a, b, rng), seed: s };
}

function show(specimen: { name: string; lore: string; seed: number }): void {
  name = specimen.name;
  lore = specimen.lore;
  seed = specimen.seed;
  nameEl.textContent = name;
  loreEl.textContent = lore;
  serialEl.textContent = serialOf(seed);
  codesEl.textContent = `${codeTag(a)}  ×  ${codeTag(b)}`;
  parentsEl.textContent = `${a}  ×  ${b}`;
  statusEl.textContent = "FUSION LOCKED  ·  DETERMINISTIC  ·  DO NOT FEED";
  paintView();
}

function paintView(): void {
  sizeCanvas();
  const rng = new Rng(seed);
  drawCreature(ctx, { x: 0, y: 0, w: canvas.width, h: canvas.height }, a, b, rng);
}

async function fuse(): Promise<void> {
  if (!firstEmoji(a) || !firstEmoji(b)) {
    statusEl.textContent = "NO SPECIMEN  ·  LOAD BOTH WELLS";
    return;
  }
  statusEl.textContent = "FUSING  ·  HOLD BRASS";
  canvas.closest(".crt-bezel")?.classList.add("hot");
  const local = brew();
  show(local);
  writeQuery();
  const up = await tryUpgrade({ a, b, name: local.name, seed: local.seed });
  if (up?.name || up?.lore) {
    show({
      name: up.name ?? local.name,
      lore: up.lore ?? local.lore,
      seed: local.seed,
    });
  }
  window.setTimeout(() => canvas.closest(".crt-bezel")?.classList.remove("hot"), 420);
}

async function downloadPlate(): Promise<void> {
  await document.fonts.ready;
  const rng = new Rng(seed);
  const plate = paintPlate(a, b, name, lore, serialOf(seed), rng);
  plate.toBlob((blob) => {
    if (!blob) return;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `chimemoji-${name.toLowerCase()}.png`;
    link.click();
    URL.revokeObjectURL(link.href);
  });
}

readQuery();
mountGrid("a");
mountGrid("b");
setSlot("a", a);
setSlot("b", b);
document.querySelector("#fuse")!.addEventListener("click", () => void fuse());
document.querySelector("#export")!.addEventListener("click", () => void downloadPlate());
window.addEventListener("resize", paintView);
void fuse();
