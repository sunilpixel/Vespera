# Source photographs

Drop the original downloads in this folder. `npm run plates` reads from here,
crops/grades each one and writes the optimised `avif` + `webp` into
`public/plates`, then regenerates `src/content/plates.generated.ts`.

Originals are the master copies — nothing here is served to the browser, so
size is not a concern. Bigger is better.

## Rules that apply to every file

- **Save as the exact filename in the table.** The build maps filename → plate
  id; a wrong name silently drops the plate.
- **JPG or PNG.** Anything sharp can decode is fine.
- **2000px minimum on the long edge.** Several of these render full-bleed.
- **Landscape vs portrait matters** — the column says which. A portrait photo in
  a landscape slot gets centre-cropped and usually loses its subject.
- **Prefer low-saturation frames.** The site is ivory/charcoal with one brass
  accent; a strongly blue or green photo will fight it. The build desaturates
  slightly but it cannot rescue a heavily coloured original.
- **Avoid people, faces, hands and text** in frame. Nothing here is about a
  person, and legible text in a photo reads as a mistake at this scale.

## On Pexels

Search at `https://www.pexels.com/search/<term>/`. Everything on Pexels is free
for commercial use with no attribution required, so no licence bookkeeping is
needed. Use the **Original** size from the download dropdown.

Two filters that help a lot: set **Orientation** to match the column below, and
set **Color** to _Black & White_ or a neutral swatch — it removes most of the
frames that would clash.

## What is needed

Fourteen images. The first four are the ones a visitor sees first, so they are
worth the most care.

| Save as              | Where it appears                          | Search for                     | Pick the frame that has                                                                                                                             |
| -------------------- | ----------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `flacon.jpg`         | **Hero**, full screen behind the wordmark | `perfume bottle`               | Portrait. One bottle, centred, dark or neutral ground, strong single light source. No boxes, no flowers, no hands. This is the most important file. |
| `bottle-mineral.jpg` | Compositions — **Atrium** card            | `perfume bottle minimal`       | Portrait. Cool, pale, stone-like. Clear or frosted glass.                                                                                           |
| `bottle-musk.jpg`    | Compositions — **Veil** card              | `perfume bottle soft light`    | Portrait. Warm and diffused, softer shadow than the others.                                                                                         |
| `bottle-woods.jpg`   | Compositions — **Monolith** card          | `dark perfume bottle`          | Portrait. Dark, severe, hard shadow. Amber or smoked glass.                                                                                         |
| `atrium.jpg`         | Story, pinned beside the chapters         | `empty concrete room sunlight` | Portrait. An empty interior with one shaft of light. Emptiness is the subject.                                                                      |
| `colonnade.jpg`      | Light, full-bleed                         | `stone arches corridor`        | **Landscape.** A long run of columns or arches receding, raking light.                                                                              |
| `veil.jpg`           | Ethos, behind the pull quote              | `sheer curtain sunlight`       | Portrait. Fabric lit from behind. Heavily darkened in use, so contrast helps.                                                                       |
| `fold.jpg`           | Noir, grows to full screen                | `silk fabric folds`            | Portrait. Close, abstract, one bright fold against dark.                                                                                            |
| `vessel.jpg`         | Craft — **Distillation** card             | `ceramic vase minimal`         | Portrait. Unglazed stoneware or clay, plain ground.                                                                                                 |
| `horizon.jpg`        | Craft — **Rest** card                     | `foggy minimal landscape`      | **Landscape.** Almost nothing in it — fog, a horizon line, no detail.                                                                               |
| `aperture.jpg`       | Archive                                   | `window shadow on wall`        | Portrait. A cast window shadow on a plain wall.                                                                                                     |
| `stair.jpg`          | Archive                                   | `minimal staircase shadow`     | Portrait. Stairs as pure geometry, strong diagonal.                                                                                                 |
| `sphere.jpg`         | Archive                                   | `stone sphere sculpture`       | Portrait. One round form, plain ground.                                                                                                             |
| `monolith.jpg`       | Archive                                   | `brutalist concrete`           | **Landscape.** A single concrete mass, hard shadow.                                                                                                 |

## What is on disk now

All fourteen slots are photographed; nothing falls back to a drawing.

Six of them were re-shot after the first pass, because the originals carried a
legible wordmark or a colour the palette could not absorb. Those files are still
here as `<id>.rejected.jpg` — `photoFor` matches the bare stem only, so a
suffixed file is on disk and out of the build. Two slots went through more than
one pass, so they carry more than one reject: `bottle-woods.denim.rejected.jpg`
(the emblem on the cap read as a brand name once graded),
`bottle-woods.stones.rejected.jpg` and `bottle-mineral.kraft.rejected.jpg` (both
fine, both beaten later).

The "avoid text in frame" rule below is relaxed for this build: `bottle-woods`
carries a small legible wordmark, kept because no unbranded frame came close to
it for the Monolith card. Everything else in the set is text-free, so it is one
deliberate exception rather than a dropped rule.

| Slot             | Pexels id  | Why this frame                                            |
| ---------------- | ---------- | --------------------------------------------------------- |
| `flacon`         | `34036480` | Standing bottle, unbranded, cut across by hard blind-light |
| `bottle-mineral` | `7814956`  | Frosted flacon and one incense reed on dark marble         |
| `bottle-musk`    | `5567098`  | Glass on gauze, soft and close — the diffused one          |
| `bottle-woods`   | `29805437` | A single black mass on a plinth, one hard raking light     |
| `aperture`       | `20435869` | Window grid on a plain wall, one plant in silhouette       |
| `vessel`         | `6825578`  | Stoneware and marble on travertine                         |

Originals come from `images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg`.

Perfume photography on the stock sites is almost entirely branded — most frames
that survive on light and form alone still have a wordmark on the glass. The
three bottle slots and the hero ended up on unbranded cosmetic and apothecary
glass for that reason, which is also why none of them is a recognisable flacon.

## If you would rather not download

Paste the Pexels **page URLs** (or just the numeric photo ids) next to the
filenames instead and the build will fetch them itself — the id is the number in
`pexels.com/photo/<slug>-<id>/`.
