"use client";

import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import { finePointer, reduced } from "@/lib/media";

/**
 * The reveal vocabulary.
 *
 * Every section is built from these so the site reads as one hand, but no two
 * sections combine them the same way. Deliberately no plain fade-up anywhere:
 * text arrives from behind a mask, images arrive through an opening clip-path.
 *
 * The set is split by tempo, and the split is the point. The slow half
 * (`revealLines`, `revealChars`, `revealPlate`) carries anything a reader has
 * to actually read. The fast half below it -- `revealWords`, `snapIn`,
 * `countTo`, `velocitySkew`, `hoverFrame` -- carries indices, rules, captions
 * and pointer response. A page built only from the slow half reads as a page
 * with no motion on it, because there is nothing quick for the long moves to be
 * slow *against*.
 */

/**
 * Re-exported rather than imported from `@/lib/media` at each call site: every
 * section already imports its motion vocabulary from here, and the guard that
 * decides whether that vocabulary runs at all belongs to the same surface.
 */
export { reduced };

/* ------------------------------------------------------------------ text */

interface LineRevealOptions {
  trigger?: Element;
  start?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
  /** Lines lean in from a slight rotation, like type settling onto a page. */
  skew?: boolean;
  scrub?: boolean;
}

/**
 * Split an element into masked lines and roll them up into place.
 *
 * Returns the SplitText so the caller can revert it: leaving the split in the
 * DOM breaks text selection and re-wraps badly on resize.
 */
export function revealLines(
  el: Element,
  {
    trigger,
    start = "top 82%",
    delay = 0,
    stagger = 0.09,
    duration = 1.35,
    skew = true,
    scrub = false,
  }: LineRevealOptions = {}
) {
  const split = new SplitText(el, {
    type: "lines",
    mask: "lines",
    linesClass: "line-mask",
  });

  gsap.set(el, { autoAlpha: 1 });

  if (reduced()) {
    gsap.set(split.lines, { yPercent: 0, rotate: 0 });
    return split;
  }

  gsap.from(split.lines, {
    yPercent: 112,
    rotate: skew ? 3 : 0,
    transformOrigin: "0% 100%",
    duration,
    stagger,
    delay,
    ease: "veil",
    scrollTrigger: {
      trigger: trigger ?? el,
      start,
      end: scrub ? "bottom 62%" : undefined,
      scrub: scrub ? 1 : false,
      once: !scrub,
    },
  });

  return split;
}

/**
 * Per-character stagger, used only on the wordmark and the closing heading.
 * Characters rise *and* release their tracking, which reads as type being set
 * rather than animated.
 */
export function revealChars(
  el: Element,
  {
    delay = 0,
    stagger = 0.028,
    duration = 1.5,
    /** Omit to play immediately (the cover); pass a start to gate on scroll. */
    start,
  }: { delay?: number; stagger?: number; duration?: number; start?: string } = {}
) {
  const split = new SplitText(el, {
    type: "chars,lines",
    mask: "lines",
    linesClass: "line-mask",
  });

  gsap.set(el, { autoAlpha: 1 });

  if (reduced()) return split;

  /*
   * Tracking is released with a per-character transform rather than by
   * animating letter-spacing on the element itself.
   *
   * letter-spacing is a layout property, and both of its costs land hardest
   * exactly where this is used. It reflows the whole line every frame -- at
   * wordmark size that is a ~290px didone re-laid-out sixty times a second, and
   * it stutters. And a start value wide enough to be worth animating makes the
   * line wider than the box it sits in: the wordmark overflows by roughly a
   * fifth of its width, so its tail begins the move clipped behind the line
   * mask and appears to snap into place as it narrows.
   *
   * A cumulative x offset per character is the same geometry -- uniform
   * tracking *is* a constant gap added between neighbours -- with neither cost.
   */
  const size = parseFloat(getComputedStyle(el).fontSize) || 16;
  const offset = new Map<Element, number>();

  for (const line of split.lines) {
    const chars = split.chars.filter((c) => line.contains(c));
    // The gap shrinks as a line gets longer so total spread stays near 1.2em:
    // a fixed per-character gap is fine for a seven-letter wordmark and pushes
    // the tail of a full sentence clean out of its mask.
    const gap = Math.min(0.14, 1.2 / Math.max(chars.length - 1, 1)) * size;
    chars.forEach((c, i) => offset.set(c, i * gap));
  }

  gsap
    .timeline({
      delay,
      scrollTrigger: start ? { trigger: el, start, once: true } : undefined,
    })
    .from(split.chars, {
      yPercent: 118,
      duration,
      stagger,
      ease: "veil",
    })
    .fromTo(
      split.chars,
      { x: (_i: number, target: Element) => offset.get(target) ?? 0 },
      { x: 0, duration: duration * 1.5, ease: "editorial" },
      0
    );

  return split;
}

/* ---------------------------------------------------------------- images */

export type Edge = "bottom" | "top" | "left" | "right" | "split";

export const CLOSED: Record<Edge, string> = {
  bottom: "inset(100% 0% 0% 0%)",
  top: "inset(0% 0% 100% 0%)",
  left: "inset(0% 100% 0% 0%)",
  right: "inset(0% 0% 0% 100%)",
  // The one that is not a wipe: both edges travel outward from a centre seam,
  // so the middle of the picture is legible from the first frame rather than
  // arriving last. Only worth using on a plate whose subject sits dead centre --
  // anywhere else it opens on empty ground and reads as a slower wipe.
  split: "inset(0% 50% 0% 50%)",
};

/**
 * Open an image from one edge while the picture inside counter-scales.
 *
 * The counter-scale is the whole trick: without it the frame grows but the
 * photograph inside stays nailed in place, which reads as a wipe. With it, the
 * image appears to settle *into* its frame.
 */
export function revealPlate(
  frame: HTMLElement,
  {
    edge = "bottom" as Edge,
    start = "top 84%",
    duration = 1.6,
    delay = 0,
    scale = 1.28,
  } = {}
) {
  const media = frame.querySelector<HTMLElement>("[data-plate-media]");

  if (reduced()) {
    gsap.set(frame, { clipPath: "inset(0% 0% 0% 0%)" });
    if (media) gsap.set(media, { scale: 1 });
    return;
  }

  const tl = gsap.timeline({
    delay,
    scrollTrigger: { trigger: frame, start, once: true },
  });

  tl.fromTo(
    frame,
    { clipPath: CLOSED[edge] },
    { clipPath: "inset(0% 0% 0% 0%)", duration, ease: "drape" },
    0
  );

  if (media) {
    tl.fromTo(media, { scale }, { scale: 1, duration: duration * 1.15, ease: "drape" }, 0);
  }
}

/**
 * Slow vertical drift of the picture inside a fixed frame, tied to scroll.
 * Amount is in percent of the media's own height, so it never exposes an edge
 * as long as the media is over-sized (see Plate).
 */
export function parallaxPlate(frame: HTMLElement, amount = 12) {
  const media = frame.querySelector<HTMLElement>("[data-plate-media]");
  if (!media || reduced()) return;

  gsap.fromTo(
    media,
    { yPercent: -amount / 2 },
    {
      yPercent: amount / 2,
      ease: "none",
      scrollTrigger: {
        trigger: frame,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    }
  );
}

/* ----------------------------------------------------------------- lines */

/** A hairline that draws itself in from one end. */
export function drawRule(el: Element, { start = "top 88%", duration = 1.4 } = {}) {
  if (reduced()) return;
  gsap.fromTo(
    el,
    { scaleX: 0, transformOrigin: "0% 50%" },
    {
      scaleX: 1,
      duration,
      ease: "editorial",
      scrollTrigger: { trigger: el, start, once: true },
    }
  );
}

/* ============================================================ the fast half */

/**
 * Word-level stagger, quick and tight.
 *
 * The counterpart to `revealLines`: same masked-line construction, but the unit
 * is the word and the whole phrase lands in about a third of the time. Used for
 * captions and eyebrows sitting beside something slow, so the two arrive at
 * visibly different speeds.
 */
export function revealWords(
  el: Element,
  { start = "top 88%", delay = 0, stagger = 0.035, duration = 0.62 } = {}
) {
  const split = new SplitText(el, {
    type: "words,lines",
    mask: "lines",
    linesClass: "line-mask",
  });

  gsap.set(el, { autoAlpha: 1 });
  if (reduced()) return split;

  gsap.from(split.words, {
    yPercent: 108,
    duration,
    stagger,
    delay,
    ease: "snap",
    scrollTrigger: { trigger: el, start, once: true },
  });

  return split;
}

/**
 * The short one. A small rise with a touch of overshoot, under half a second.
 *
 * Deliberately not a fade: opacity alone at this duration is invisible, and the
 * whole reason this exists is to be *seen* as quick.
 */
export function snapIn(
  targets: gsap.TweenTarget,
  {
    trigger,
    start = "top 88%",
    y = 22,
    stagger = 0.055,
    duration = 0.52,
    delay = 0,
  }: {
    trigger?: Element;
    start?: string;
    y?: number;
    stagger?: number;
    duration?: number;
    delay?: number;
  } = {}
) {
  const els = gsap.utils.toArray<Element>(targets);
  if (!els.length) return;

  if (reduced()) {
    gsap.set(els, { autoAlpha: 1, y: 0 });
    return;
  }

  gsap.from(els, {
    autoAlpha: 0,
    y,
    duration,
    stagger,
    delay,
    ease: "settle",
    scrollTrigger: { trigger: trigger ?? (els[0] as Element), start, once: true },
  });
}

/**
 * Roll a figure up to its value on scroll.
 *
 * Writes to textContent directly rather than through React: this runs on every
 * frame of the tween and a setState per frame would be an order of magnitude
 * more work for an identical result.
 */
export function countTo(
  el: HTMLElement,
  value: number,
  { start = "top 86%", duration = 1.1, pad = 2, prefix = "", suffix = "" } = {}
) {
  const write = (n: number) =>
    (el.textContent = prefix + String(Math.round(n)).padStart(pad, "0") + suffix);

  if (reduced()) {
    write(value);
    return;
  }

  const state = { n: 0 };
  write(0);

  gsap.to(state, {
    n: value,
    duration,
    ease: "swift",
    onUpdate: () => write(state.n),
    scrollTrigger: { trigger: el, start, once: true },
  });
}

/**
 * Skew targets by how fast the page is moving.
 *
 * This is the one effect that responds to the *reader* rather than to scroll
 * position, which is why a flicked scroll now feels like it costs something.
 * Returns a disposer.
 *
 * `quickTo` reuses one tween instead of allocating a new one per scroll frame,
 * and the `scrollEnd` listener is not optional: ScrollTrigger's onUpdate stops
 * firing the moment the scroll position settles, so without it the last
 * non-zero skew stays baked into the element.
 */
export function velocitySkew(
  targets: gsap.TweenTarget,
  { max = 6, factor = 340, prop = "skewY" as "skewY" | "skewX" } = {}
) {
  const els = gsap.utils.toArray<Element>(targets);
  if (!els.length || reduced()) return () => {};

  const set = gsap.quickTo(els, prop, { duration: 0.5, ease: "power3.out" });
  const clamp = gsap.utils.clamp(-max, max);
  const release = () => set(0);

  const st = ScrollTrigger.create({
    onUpdate: (self) => set(clamp(self.getVelocity() / factor)),
    onRefresh: release,
  });

  ScrollTrigger.addEventListener("scrollEnd", release);

  return () => {
    ScrollTrigger.removeEventListener("scrollEnd", release);
    st.kill();
  };
}

/**
 * Pointer response for a plate and the type beside it.
 *
 * Everything here is fast (< 0.6s) and interruptible via `overwrite`, because a
 * hover that queues behind its own exit tween reads as a broken control. The
 * picture pushes in, its frame's companions shift toward it, and a rule fills
 * with brass — one gesture, three elements, so the pair reads as linked rather
 * than as two things that happen to react.
 *
 * Returns a disposer.
 */
export function hoverFrame(
  root: HTMLElement,
  {
    media,
    shift,
    rule,
    distance = 14,
  }: {
    media?: HTMLElement | null;
    shift?: HTMLElement | null;
    rule?: HTMLElement | null;
    distance?: number;
  }
) {
  if (reduced() || !finePointer()) return () => {};

  const to = (on: boolean) => {
    if (media) {
      gsap.to(media, {
        scale: on ? 1.06 : 1,
        duration: 0.75,
        ease: "editorial",
        overwrite: "auto",
      });
    }
    if (shift) {
      gsap.to(shift, {
        x: on ? distance : 0,
        duration: 0.55,
        ease: "snap",
        overwrite: "auto",
      });
    }
    if (rule) {
      gsap.to(rule, {
        scaleX: on ? 1 : 0,
        duration: on ? 0.5 : 0.35,
        ease: on ? "snap" : "swift",
        overwrite: "auto",
      });
    }
  };

  const enter = () => to(true);
  const leave = () => to(false);

  root.addEventListener("pointerenter", enter);
  root.addEventListener("pointerleave", leave);

  return () => {
    root.removeEventListener("pointerenter", enter);
    root.removeEventListener("pointerleave", leave);
  };
}
