# Chimemoji

Emoji Fusion Laboratory. Bay 7. Pick any two emoji; the bench hybridizes them into a creature, a name, and a three-sentence mythology. Same pair, same beast — including URLs like `/?a=🐙&b=☕`.

A Fun Toy. Not a startup.

## Run locally

```bash
npm install
npm run dev
```

`npm run build` then `npm run preview` for the production bundle. Vite `base` is `./` so the dist folder can sit on a static host.

## What it does

- Two live wells: a grid of 80 common emoji plus a field that accepts any glyph.
- Fuse draws a canvas hybrid (hashed colors, blob body, 2–5 limbs, eyes, aura) and stamps both parents at low opacity.
- Names and lore are local combinators. No API required.
- Export plate downloads a PNG card (creature + name + field notes).
- Query string updates on fuse. Load with `a` and `b` to reopen a specimen.
- Optional `src/upgrade.ts` will POST `/api/upgrade` and ignore failure.

## Stack

Vite + vanilla TypeScript. MIT © 2026 Ahmad Bukhari.
