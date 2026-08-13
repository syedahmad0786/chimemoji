import { labelOf } from "./emoji";
import { Rng } from "./rng";

const PLACES = [
  "autoclave drain",
  "cracked CRT in the annex",
  "brass fume-hood lip",
  "night-shift coffee ring",
  "unlabeled jar on Shelf C",
  "static mat under Bay 7",
  "warning-stripe paint tin",
  "dead voltmeter case",
  "specimen fridge door seal",
  "greasy lab-book spine",
  "overflow sink trap",
  "lead apron pocket",
] as const;

const DIETS = [
  "spilled solvent and moth dust",
  "cold coffee and phosphor flake",
  "brass filings",
  "stale donut sugar",
  "static and leftover broth",
  "warning-paint chips",
  "CRT hum",
  "forgotten agar",
  "rust and tape adhesive",
  "night-shift gossip",
  "iodine stains",
  "unlabeled freeze-dried pellets",
] as const;

const FATES = [
  "the brass knobs turn one click by themselves",
  "the CRT greens out for 1.4 seconds",
  "the hazard stripes look wet",
  "a second shadow appears on the bench",
  "the stamped labels rearrange",
  "the fuse button stays warm",
  "OSHA forms fill themselves in",
  "the clipboard clip bites",
  "the serial number increments",
  "the well smells like rain on metal",
  "the parents blink in unison",
  "the night log writes an extra line",
] as const;

const S1 = [
  "Bay 7's night log records a {a} and a {b} occupying the same dish after the autoclave failed.",
  "{name} condensed on the {place} while the {a} still steamed.",
  "A bored technician left a {a} on the brass and a {b} in the well. Morning produced {name}.",
  "The {place} birthed {name} from leftover {b} residue and a restless {a}.",
  "Fusion was not scheduled. The {a} crawled into the {b} anyway. {name} is the receipt.",
  "Shelf C lists {name} as 'expected drift' after a {a} contaminated a {b}.",
  "It crawled out of the {place} during third shift, wearing both {a} and {b} like alibis.",
  "Nobody filed a card for the {a}. The {b} filed one for itself. {name} is the compromise.",
  "The fume hood was off. A {a} and a {b} were not. {name} took the open air as permission.",
  "{name} is what remains when you rinse a {a} with a {b} and ignore the beep.",
  "First seen under the {place}, pulsing in time with the {a}, stained like the {b}.",
  "The stamped plate said VOID. The {a} and {b} disagreed. {name} is their argument.",
  "Lab lore says the {place} keeps a {a}. Last Tuesday it kept a {b} too. Then {name}.",
  "Hybridization notes: parent {a}, parent {b}, witness: the night kettle. Product: {name}.",
  "A cracked petri still smelled of {b} when the {a} moved in. {name} refused the incinerator.",
  "The brass still shows a {a} burn and a {b} ring. {name} lives in the overlap.",
] as const;

const S2 = [
  "It nests in the {place} and feeds on {diet}.",
  "{name} prefers {diet}, and will not answer to its parents.",
  "By day it pretends to be equipment. By night it reorganizes the {place}.",
  "Technicians report it licking the {place} for {diet}.",
  "It molts warning-stripe skin twice a shift and hoards {diet}.",
  "Do not offer it the {a}. It already remembers being one. It wants {diet}.",
  "The hybrid sleeps with one limb in the drain and dreams of {diet}.",
  "It files itself under 'instrument' and eats {diet} when the lights flicker.",
  "{name} keeps the {b}'s habits and the {a}'s temper. Diet: {diet}.",
  "If ignored, it writes its name in condensation on the {place}.",
  "It is polite until hungry. Hunger looks like {diet} and sounds like a dying ballast.",
  "Three limbs are for walking. The extras are for sorting {diet}.",
  "It will not cross a fresh hazard stripe. It will wait, then eat {diet} beside it.",
  "Cage notes: 'responsive to brass, hostile to clipboards, diet {diet}.'",
  "The well fogs when it thinks. It thinks about {diet} and the {place}.",
  "Leave a saucer of {diet} on the {place}. {name} considers that a contract.",
] as const;

const S3 = [
  "If {fate}, log it as 'within spec' and do not look directly at {name}.",
  "Field rule: when {fate}, the hybrid is dreaming. Do not wake it with the {a}.",
  "Some say {name} is harmless. Those people have never been on shift when {fate}.",
  "The mythology ends the same way every time: {fate}, and someone restamps the label.",
  "Keep the parents visible. If they fade, {fate}.",
  "Night-shift creed: feed it, file it, forget it — unless {fate}.",
  "A senior tech once tried to unfuse it. The next log only says {fate}.",
  "Share the plate if you must. The creature does not travel. The story does. Watch for when {fate}.",
  "OSHA has no code for this. They have a rumor that {fate}.",
  "If you hear the {b} in an empty room, {name} is nearby and {fate}.",
  "Burial is not advised. The {place} already tried. Now {fate}.",
  "Treat {name} as a colleague. Colleagues also notice when {fate}.",
  "The clipboard will claim this is folklore. Folklore does not explain why {fate}.",
  "Close the well. Wipe the brass. Still, {fate}.",
  "Deterministic, they said. Same parents, same beast. They did not mention that {fate}.",
  "Stamp FILED. Go home. If {fate} on the walk to the lot, you took a plate with you.",
] as const;

type Slots = { name: string; a: string; b: string; place: string; diet: string; fate: string };

function fill(tpl: string, s: Slots): string {
  return tpl
    .replaceAll("{name}", s.name)
    .replaceAll("{a}", s.a)
    .replaceAll("{b}", s.b)
    .replaceAll("{place}", s.place)
    .replaceAll("{diet}", s.diet)
    .replaceAll("{fate}", s.fate);
}

export function myth(name: string, a: string, b: string, rng: Rng): string {
  const slots: Slots = {
    name,
    a: `${a} (${labelOf(a)})`,
    b: `${b} (${labelOf(b)})`,
    place: rng.pick(PLACES),
    diet: rng.pick(DIETS),
    fate: rng.pick(FATES),
  };
  return [rng.pick(S1), rng.pick(S2), rng.pick(S3)].map((t) => fill(t, slots)).join(" ");
}
