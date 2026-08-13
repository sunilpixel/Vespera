import type { PlateId } from "./plates.generated";

/** Drives both the nav and the scroll-progress indicator. */
export const SECTIONS = [
  { id: "hero", label: "Ouverture", inNav: false },
  { id: "story", label: "The House", inNav: true },
  { id: "light", label: "Light", inNav: false },
  { id: "compositions", label: "Compositions", inNav: true },
  { id: "archive", label: "Archive", inNav: true },
  { id: "craft", label: "Craft", inNav: true },
  { id: "ethos", label: "Ethos", inNav: false },
  { id: "noir", label: "Noir", inNav: false },
  { id: "enquire", label: "Enquire", inNav: true },
] as const;

/* ------------------------------------------------------------------ story */

export const STORY_CHAPTERS = [
  {
    index: "I",
    title: "A room before a scent",
    body: "Vespera began in an empty atrium in Grasse — bare stone, one high window, and the particular quiet of a building waiting to be used. Every composition since has started the same way: with the space, and only afterwards with the substance that fills it.",
  },
  {
    index: "II",
    title: "Twelve hours of maceration",
    body: "Our formulations rest longer than is commercially sensible. Iris takes three years from rhizome to butter. We have never found a way to hurry it that did not announce itself on the skin.",
  },
  {
    index: "III",
    title: "Nothing decorative",
    body: "No note is included because it is expected. The flacon is unlabelled on the front. What is not essential has been removed, repeatedly, until what remains could not be taken away without collapse.",
  },
];

/* ----------------------------------------------------------- compositions */

export const COMPOSITIONS: {
  index: string;
  name: string;
  family: string;
  note: string;
  plate: PlateId;
}[] = [
  {
    index: "01",
    name: "Atrium",
    family: "Mineral · Iris",
    note: "Cold stone at first light. Orris root, ambrette, a trace of wet limestone that never quite dries.",
    // The three composition cards name three fragrances, so they carry the
    // three flacons rather than three rooms. Until a usable bottle photograph
    // lands, these ids fall back to a drawn plate — see SOURCES in
    // scripts/build-plates.mjs.
    plate: "bottle-mineral",
  },
  {
    index: "02",
    name: "Veil",
    family: "Musk · Silk",
    note: "Worn linen and warm skin. The most transparent thing we make, and the hardest to leave behind.",
    plate: "bottle-musk",
  },
  {
    index: "03",
    name: "Monolith",
    family: "Woods · Smoke",
    note: "Vetiver held under cade and dry cedar. Severe for an hour, then unexpectedly soft.",
    plate: "bottle-woods",
  },
];

/* ---------------------------------------------------------------- archive */

export const ARCHIVE: { plate: PlateId; year: string; caption: string }[] = [
  { plate: "aperture", year: "MMXIX", caption: "Aperture — first light study" },
  { plate: "stair", year: "MMXX", caption: "Ascent — the Grasse stair" },
  { plate: "sphere", year: "MMXXI", caption: "Form — volume in ivory" },
  { plate: "vessel", year: "MMXXII", caption: "Vessel — unglazed stoneware" },
  { plate: "colonnade", year: "MMXXIII", caption: "Colonnade — the long room" },
  { plate: "fold", year: "MMXXIV", caption: "Fold — silk, raking light" },
];

/* ------------------------------------------------------------------ craft */

export const CRAFT: { index: string; title: string; body: string; plate: PlateId }[] = [
  {
    index: "01",
    title: "Distillation",
    body: "Copper alembics, unchanged since 1946. Small batches, because the last litre of a run is never the equal of the first.",
    plate: "vessel",
  },
  {
    index: "02",
    title: "Glass",
    body: "Each flacon is pressed, annealed and hand-ground at the base. Slight variance between bottles is intended and unremarked.",
    plate: "flacon",
  },
  {
    index: "03",
    title: "Rest",
    body: "Six months in darkness at fourteen degrees before a single bottle is filled. There is no accelerated version of this step.",
    plate: "horizon",
  },
];

/* ---------------------------------------------------------------- marquee */

/** The running band. Short phrases only — long ones never finish a pass. */
export const MARQUEE = [
  "Grasse — MMXIV",
  "Eleven compositions",
  "By appointment",
  "Nothing decorative",
  "Six months in darkness",
];

/* ------------------------------------------------------------------ ethos */

export const ETHOS = {
  quote:
    "We are not selling an object. We are selling the twenty minutes after you open it.",
  attribution: "Claire Vasseur — Founder, Nose",
};
