# Vespera

An editorial luxury site for a fictional maison de parfum — Next.js 15, React 19,
Tailwind v4, GSAP + ScrollTrigger, Lenis. No Three.js, no Framer Motion, no
Lottie, no image sequences.

```bash
npm install
npm run plates    # generate the imagery (already committed)
npm run dev
```

## The imagery

There is no stock photography here. `npm run plates` renders eleven original
light-and-form studies — architecture, drapery, glass, stone — as SVG scenes and
rasterises them to AVIF + WebP, alongside a 128px grain tile. Total weight for
the whole set is about 250 KB.

They are deliberately full-range monochrome so the same files read correctly in
both the ivory and the charcoal theme; no per-theme exports.

**To use real photography instead:** drop files into `public/plates/` and point
the `avif` / `webp` fields in `src/content/plates.generated.ts` at them. Nothing
downstream cares how the pixels were made. (Regenerating with `npm run plates`
will overwrite that file, so either stop running it or move your entries into a
hand-written module.)

`npm run plates:contact` also writes `.preview/contact-sheet.png` — the whole set
at a glance, which is the fastest way to judge a change to the drawing code.

## Structure

```
scripts/
  lib/atelier.mjs      drawing kit: gradients, blur, grain, vignette
  lib/plates.mjs       the eleven compositions
  build-plates.mjs     rasterise + emit the typed manifest
src/
  animations/reveals.ts   the shared reveal vocabulary
  components/             Plate, Cursor, Chrome (nav/grain/curtain/progress)
  content/                copy + generated plate manifest
  sections/               one file per section, one idea each
```

## How the motion is organised

`src/animations/reveals.ts` holds the vocabulary — masked line reveals,
character reveals, clip-path plate openings, parallax, rule draws. Every section
composes from it so the site reads as one hand, but **no two sections combine
them the same way**, which is what stops an editorial layout feeling like a
template:

| Section        | Its one idea                                                          |
| -------------- | --------------------------------------------------------------------- |
| Hero           | Plate opens from its base while the wordmark sets and releases tracking |
| Story          | Pinned; one continuous camera push across three cross-fading chapters   |
| Light          | Narrow column widens to full bleed as the picture counter-scales down   |
| Compositions   | Alternating spread; names counterweight their plates in parallax        |
| Archive        | Pinned horizontal; plates drift against the track via containerAnimation |
| Craft          | Staggered clip-path wipe in; hover is pure CSS so it never queues       |
| Ethos          | Scrubbed word-by-word rise while the scrim lifts off the backdrop       |
| Noir           | Small rectangle to full screen on a pinned clip-path                    |
| Enquire        | Character reveal, bookending the cover                                  |

### The counter-scale

Most image reveals here open a clip-path on the frame *and* scale the picture
inside it in the opposite direction. Without the counter-scale the frame grows
but the photograph stays nailed in place, which reads as a wipe. With it, the
image settles into its frame. `revealPlate()` does both off one timeline.

## Performance notes

These are the decisions that keep the scrub smooth, and they are easy to undo by
accident:

- **Nothing animates a layout property.** Noir grows a full-bleed frame with
  `clip-path`, not `width`/`height` — the latter forces a reflow on every scroll
  frame.
- **No `backdrop-filter`.** A frosted panel over a section that transforms every
  frame makes the compositor re-sample the backdrop every frame.
- **No animated `filter: blur()`.** A blurred element re-rasterises whenever it
  changes; the plates get their softness baked in at build time instead.
- **Grain is a static tile**, not a live `feTurbulence` over the viewport — that
  would re-composite the whole page on every scroll frame.
- **Lenis is driven from the GSAP ticker.** If they run on separate clocks, every
  pinned section lags the content by a frame and the pins visibly shudder.

## Theming

`data-theme` on `<html>`, set before first paint by a small inline script so a
reload in light mode never flashes dark. Semantic CSS variables are declared on
`:root` / `[data-theme="light"]` and only *referenced* from Tailwind's
`@theme inline` block, so one attribute swap repaints the site without
regenerating a single utility class.

## Accessibility

- `prefers-reduced-motion` is honoured throughout: Lenis is not started, splits
  resolve to their final state, pins and scrubs are skipped.
- SplitText instances are reverted on cleanup, so the original DOM — and its
  selectable, screen-reader-readable text — is restored.
- The custom cursor is fine-pointer only; touch keeps native behaviour.
