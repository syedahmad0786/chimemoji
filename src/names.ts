import { CATALOG_NAMES } from "./emoji";
import { Rng } from "./rng";

const HEX_SYL = [
  "ka", "zu", "mi", "or", "vek", "tha", "lu", "nyx",
  "qo", "rix", "sa", "bel", "chi", "dor", "em", "fen",
] as const;

const SUF = ["oth", "ax", "ule", "ion", "yx", "ara", "oid", "ym", "ex", "ul"] as const;

export function syllables(glyph: string): string[] {
  const label = CATALOG_NAMES[glyph];
  return label ? sliceWord(label) : fromCode(glyph);
}

function sliceWord(label: string): string[] {
  const out: string[] = [];
  for (const w of label.toLowerCase().split(/\s+/)) {
    if (w.length <= 4) out.push(w);
    else {
      out.push(w.slice(0, 3));
      out.push(w.slice(3, 6) || w.slice(-3));
    }
  }
  return out.length ? out : ["chim"];
}

function fromCode(glyph: string): string[] {
  const out: string[] = [];
  for (const ch of glyph) {
    const hex = (ch.codePointAt(0) ?? 0).toString(16);
    out.push(HEX_SYL[parseInt(hex[0] ?? "0", 16) % 16]!);
    out.push(HEX_SYL[parseInt(hex.at(-1) ?? "0", 16) % 16]!);
  }
  return out.length ? out : ["chim"];
}

function clean(s: string): string {
  return s.toLowerCase().replace(/[^a-z]/g, "").slice(0, 4);
}

export function fuseName(a: string, b: string, rng: Rng): string {
  const A = syllables(a);
  const B = syllables(b);
  const p = clean(A[rng.int(A.length)] ?? "chim");
  const q = clean(B[rng.int(B.length)] ?? "eme");
  const tail = rng.next() > 0.4
    ? clean(A[rng.int(A.length)] ?? "ji").slice(0, 3)
    : SUF[rng.int(SUF.length)]!;
  const raw = (p + q + (tail === q ? "" : tail)).replace(/[^a-z]/g, "").slice(0, 14);
  const body = raw.length >= 4 ? raw : `${raw}yx`;
  return body[0]!.toUpperCase() + body.slice(1);
}
