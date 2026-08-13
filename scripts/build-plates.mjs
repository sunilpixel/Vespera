/**
 * Builds the editorial plates into /public/plates and emits a typed manifest.
 *
 *   node scripts/build-plates.mjs [--contact]
 *
 * Each plate takes its pixels from one of two sources:
 *
 *   a photograph in assets/photos, when SOURCES marks one approved, or
 *   the SVG scene in scripts/lib/plates.mjs, otherwise.
 *
 * The fallback is the point. Photographs arrive a few at a time and some get
 * rejected on review, so the build has to stay green with any subset present --
 * a missing or held-back photo silently returns that plate to its drawn version
 * rather than breaking the manifest and, with it, the type of PlateId.
 *
 * `--contact` also writes a contact sheet to .preview so the whole set can be
 * reviewed at a glance.
 */

import { mkdir, writeFile, rm, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";

import { PLATES } from "./lib/plates.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "public", "plates");
const PHOTOS = path.join(ROOT, "assets", "photos");
const MANIFEST = path.join(ROOT, "src", "content", "plates.generated.ts");
const PREVIEW = path.join(ROOT, ".preview");

const contact = process.argv.includes("--contact");

/**
 * Plates that exist only as photographs.
 *
 * The three Compositions cards name three fragrances, so they want three
 * bottles rather than three rooms. Until a usable bottle photograph exists for
 * one, it borrows the drawing of an existing plate -- `PlateId` has to stay
 * stable or every section referencing it stops type-checking.
 */
const PHOTO_ONLY = [
  { id: "bottle-mineral", label: "Atrium — the flacon", w: 1280, h: 1600, fallback: "flacon" },
  { id: "bottle-musk", label: "Veil — the flacon", w: 1280, h: 1600, fallback: "veil" },
  { id: "bottle-woods", label: "Monolith — the flacon", w: 1280, h: 1600, fallback: "monolith" },
];

/**
 * Which photographs are cleared for use.
 *
 * `use: false` keeps a file on disk and out of the build. Every rejection
 * carries its reason so the decision survives being revisited -- and so a file
 * that was rejected for something fixable is not silently forgotten.
 *
 * `file` points a plate at a differently-named photograph. Several arrived in
 * the opposite orientation to the slot they were named for, and no crop rescues
 * that -- a 16:9 band taken out of a portrait frame is two thirds of the
 * picture thrown away. Swapping which file feeds which slot costs nothing and
 * keeps both pictures whole.
 *
 * `crop` overrides the automatic subject-finding crop, which picks by local
 * detail and so tends to choose texture over subject.
 */
const SOURCES = {
  atrium: { use: true },

  // Light is the full-bleed section, ~2.3:1 on a desktop viewport. The
  // photograph named for it is portrait and its subject is the receding vault,
  // which a wide band cannot contain. The staircase is landscape, is carried by
  // one hard raking shadow, and is about light falling on stone -- which is
  // what the section's caption actually says.
  colonnade: { use: true, file: "stair" },

  // And the vault takes the portrait Archive slot the staircase vacated.
  stair: { use: true, file: "colonnade", crop: "center" },

  veil: { use: true },
  fold: { use: true },
  horizon: { use: true, crop: "center" },
  monolith: { use: true },
  sphere: { use: true },

  // The six below replace earlier downloads that were held back for legible
  // branding or a colour the palette could not absorb; the originals are kept
  // beside them as `<id>.rejected.jpg`, which `photoFor` does not match.

  // Standing flacon, unbranded, cut across by hard blind-light — the same
  // subject as the Light and Archive plates, which is what makes the cover read
  // as the front of this set rather than a product shot bolted to it.
  flacon: { use: true },

  "bottle-mineral": { use: true },
  "bottle-musk": { use: true },
  "bottle-woods": { use: true },
  aperture: { use: true },

  // Landscape still life into a 4:5 slot. `attention` fixes on the brightest
  // vase and crops the group in half; centre keeps the arrangement whole.
  vessel: { use: true, crop: "center" },
};

const PHOTO_EXT = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

/** The approved photograph for a plate id, or null to fall back to the drawing. */
function photoFor(id) {
  const source = SOURCES[id];
  if (!source?.use) return null;
  const stem = source.file ?? id;
  for (const ext of PHOTO_EXT) {
    const file = path.join(PHOTOS, stem + ext);
    if (existsSync(file)) return file;
  }
  return null;
}

const raster = (svg, width) =>
  new Resvg(svg, { fitTo: { mode: "width", value: width }, background: "rgba(0,0,0,0)" })
    .render()
    .asPng();

/**
 * The grade.
 *
 * Every scene is drawn from a warm palette whose usable range sits in the
 * bottom third -- soot, charcoal, stone -- and is then softened again by haze
 * and a vignette. Rendered straight, the whole set comes out as eleven
 * near-identical mid-grey rectangles with no black point and no highlight.
 *
 * `linear(a, b)` applies `a*x + b` per channel. At a = 1.32, b = -17:
 *
 *     shadow   38 -> 33    the black point finally reaches black
 *     mid     128 -> 152   the body of the image lifts off the floor
 *     high    204 -> 252   speculars clip, which is what a real highlight does
 *
 * The saturation bump afterwards is small on purpose: it recovers the warmth
 * the contrast pass flattens without tipping the greys toward sepia.
 */
const gradeDrawn = (pipeline) => pipeline.linear(1.32, -17).modulate({ saturation: 1.16 });

/**
 * The grade for photographic source.
 *
 * Almost the inverse of the one above, because the problem is the opposite. A
 * drawn scene arrives flat and undersaturated and needs pushing; a photograph
 * arrives with a black point, a highlight and far more colour than this palette
 * can hold -- the set is ivory, charcoal and one brass note, and a photograph
 * carrying its own blue or orange cast reads as a stray.
 *
 * So: pull saturation hard, leave a little warmth rather than going fully
 * monochrome, and apply only a light contrast lift. The `linear` here is
 * deliberately gentler than the drawn one and biased to protect highlights --
 * the drawn grade pushes 247 past 255, which on a photograph would flatten
 * every specular into a hard white blob.
 */
const gradePhoto = (pipeline) =>
  pipeline.modulate({ saturation: 0.22 }).linear(1.08, -6).gamma(1.02);

/**
 * A 24px-wide blurred version of the plate, inlined into the manifest as a
 * data URI. It stands in while the real file loads, so a full-bleed section
 * never flashes an empty rectangle mid-reveal.
 */
async function placeholder(buffer, grade) {
  // Graded identically to the full-size export, or the blur-up would hand over
  // to a visibly different image mid-reveal.
  const buf = await grade(sharp(buffer).resize(24)).blur(1.2).webp({ quality: 42 }).toBuffer();
  return `data:image/webp;base64,${buf.toString("base64")}`;
}

/**
 * Produce the pixels for one plate, and say where they came from.
 *
 * Photographs are cropped to the plate's aspect with sharp's `attention`
 * strategy rather than a centre crop: most of these arrived in the wrong
 * orientation, and a centre crop of a landscape frame into a 4:5 slot reliably
 * cuts the subject in half. `attention` picks the busiest region, which for
 * these single-subject frames is the subject.
 */
async function sourceFor(plate) {
  const photo = photoFor(plate.id);

  if (photo) {
    const crop = SOURCES[plate.id]?.crop;
    const buffer = await sharp(await readFile(photo))
      .rotate() // honour EXIF orientation before any geometry is decided
      .resize(plate.w, plate.h, {
        fit: "cover",
        position: crop ?? sharp.strategy.attention,
      })
      .toColourspace("srgb")
      .png()
      .toBuffer();
    return { buffer, grade: gradePhoto, origin: path.basename(photo) };
  }

  return {
    buffer: raster(plate.draw(plate.w, plate.h), plate.w),
    grade: gradeDrawn,
    origin: "drawn",
  };
}

async function main() {
  if (existsSync(OUT)) await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });
  await mkdir(path.dirname(MANIFEST), { recursive: true });

  const manifest = [];
  const provenance = [];
  let bytes = 0;
  let shot = 0;

  // Photo-only plates borrow a drawing until their own photograph lands.
  const all = [
    ...PLATES,
    ...PHOTO_ONLY.map((p) => ({
      ...p,
      draw: PLATES.find((q) => q.id === p.fallback).draw,
    })),
  ];

  for (const plate of all) {
    const { buffer, grade, origin } = await sourceFor(plate);

    // AVIF for the modern path, WebP as the fallback: these are smooth tonal
    // images, which is exactly where AVIF wins big over JPEG.
    const base = grade(sharp(buffer).toColourspace("srgb"));
    const [avif, webp] = await Promise.all([
      base.clone().avif({ quality: 58, effort: 6 }).toBuffer(),
      base.clone().webp({ quality: 82, effort: 6 }).toBuffer(),
    ]);

    await writeFile(path.join(OUT, `${plate.id}.avif`), avif);
    await writeFile(path.join(OUT, `${plate.id}.webp`), webp);
    bytes += avif.length + webp.length;
    if (origin !== "drawn") shot++;

    manifest.push({
      id: plate.id,
      label: plate.label,
      w: plate.w,
      h: plate.h,
      avif: `/plates/${plate.id}.avif`,
      webp: `/plates/${plate.id}.webp`,
      blur: await placeholder(buffer, grade),
    });

    provenance.push({ id: plate.id, origin, held: SOURCES[plate.id]?.why ?? null });

    process.stdout.write(
      `  ${plate.id.padEnd(15)} ${String(plate.w).padStart(4)}x${String(plate.h).padEnd(5)} ` +
        `${origin.padEnd(20)} ` +
        `avif ${(avif.length / 1024).toFixed(0).padStart(4)}kb   webp ${(webp.length / 1024).toFixed(0).padStart(4)}kb\n`
    );
  }

  await writeGrain(path.join(ROOT, "public", "grain.png"));
  await writeFile(MANIFEST, emit(manifest));
  // No timestamp: this file is committed, and a date would make it churn on
  // every run for no information gain.
  await writeFile(
    path.join(PHOTOS, "provenance.json"),
    JSON.stringify({ plates: provenance }, null, 2) + "\n"
  );

  if (contact) {
    await mkdir(PREVIEW, { recursive: true });
    await writeContactSheet(all);
  }

  const held = Object.entries(SOURCES).filter(([, s]) => !s.use);
  if (held.length) {
    console.log(`\n  held back:`);
    for (const [id, s] of held) console.log(`    ${id.padEnd(15)} ${s.why}`);
  }

  console.log(
    `\n  ${manifest.length} plates (${shot} photographed, ${manifest.length - shot} drawn), ` +
      `${(bytes / 1024 / 1024).toFixed(2)} MB total\n`
  );
}

/**
 * Film grain as a small repeating tile. A live SVG turbulence filter stretched
 * over the viewport would force the browser to re-composite the whole page on
 * every scroll frame; a 128px tile is one static layer.
 */
async function writeGrain(file) {
  const size = 128;
  const px = Buffer.alloc(size * size * 4);
  let seed = 20240816;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };
  for (let i = 0; i < size * size; i++) {
    const v = rand();
    px[i * 4] = 255;
    px[i * 4 + 1] = 255;
    px[i * 4 + 2] = 255;
    px[i * 4 + 3] = Math.round(v * 255);
  }
  await sharp(px, { raw: { width: size, height: size, channels: 4 } })
    .png({ compressionLevel: 9, effort: 9 })
    .toFile(file);
}

/** Reads the finished exports rather than re-rendering, so the sheet shows
 *  exactly what shipped -- photographed and drawn plates side by side. */
async function writeContactSheet(plates) {
  const cols = 4;
  const cell = 300;
  const rows = Math.ceil(plates.length / cols);

  const tiles = await Promise.all(
    plates.map(async (plate, i) => ({
      input: await sharp(await readFile(path.join(OUT, `${plate.id}.webp`)))
        .resize(cell - 12, cell - 12, { fit: "cover" })
        .toBuffer(),
      left: (i % cols) * cell + 6,
      top: Math.floor(i / cols) * cell + 6,
    }))
  );

  await sharp({
    create: {
      width: cols * cell,
      height: rows * cell,
      channels: 3,
      background: { r: 12, g: 11, b: 10 },
    },
  })
    .composite(tiles)
    .png()
    .toFile(path.join(PREVIEW, "contact-sheet.png"));

  console.log("  contact sheet -> .preview/contact-sheet.png");
}

function emit(manifest) {
  const ids = manifest.map((p) => `  | "${p.id}"`).join("\n");
  const rows = manifest
    .map(
      (p) =>
        // Quoted: ids may contain hyphens, which are not legal in a bare key.
        `  "${p.id}": {\n` +
        `    id: "${p.id}",\n` +
        `    label: ${JSON.stringify(p.label)},\n` +
        `    width: ${p.w},\n` +
        `    height: ${p.h},\n` +
        `    avif: "${p.avif}",\n` +
        `    webp: "${p.webp}",\n` +
        `    blur: "${p.blur}",\n` +
        `  },`
    )
    .join("\n");

  return `/**
 * GENERATED by \`npm run plates\` -- do not edit by hand.
 *
 * To use real photography instead, drop files into /public/plates and point
 * \`avif\`/\`webp\` at them; nothing downstream depends on how they were made.
 */

export type PlateId =
${ids};

export interface Plate {
  id: PlateId;
  label: string;
  width: number;
  height: number;
  avif: string;
  webp: string;
  /** Inlined 24px blur-up, shown until the full file decodes. */
  blur: string;
}

export const PLATES: Record<PlateId, Plate> = {
${rows}
};

export const plate = (id: PlateId): Plate => PLATES[id];
`;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
