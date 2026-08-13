"use client";

import { useRef } from "react";

import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { CLOSED, revealChars, revealLines, reduced } from "@/animations/reveals";
import { Plate } from "@/components/Plate";

/**
 * The cover.
 *
 * Two things happen at once on load: the plate opens outward from a centre seam
 * while the picture inside counter-scales, and the wordmark sets itself
 * character by character while releasing its tracking. On scroll the plate keeps
 * rising as the type sinks, so the two pass through each other rather than
 * moving as a block.
 *
 * The cover opens on the seam rather than from an edge like every other plate on
 * the page. The flacon stands dead centre in its frame, so a centre split has
 * the subject readable in the first few frames and spends the rest of the move
 * widening the light around it -- an edge wipe would spend a second and a half
 * on empty ground and deliver the bottle last, at the exact moment the wordmark
 * is also landing.
 */
export function Hero({ ready }: { ready: boolean }) {
  const rootRef = useRef<HTMLElement>(null);
  const started = useRef(false);

  // The plate takes its closed state at mount, not when the entrance starts.
  // `ready` fires as the last curtain panel lands, but the panels clear over
  // 1.25s with a stagger, so the cover is uncovered well before that -- a plate
  // that waits for `ready` to close itself is visible wide open first, then
  // snaps to the seam. Closing here means the curtain parts onto a shut plate.
  useIsomorphicLayoutEffect(() => {
    if (reduced()) return;
    const frame = rootRef.current?.querySelector<HTMLElement>("[data-hero-frame]");
    const media = frame?.querySelector<HTMLElement>("[data-plate-media]");
    if (frame) gsap.set(frame, { clipPath: CLOSED.split });
    if (media) gsap.set(media, { scale: 1.28 });
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (!ready || started.current) return;
    const root = rootRef.current;
    if (!root) return;
    started.current = true;

    const ctx = gsap.context(() => {
      const splits: { revert: () => void }[] = [];

      const word = root.querySelector("[data-hero-word]");
      const tagline = root.querySelector("[data-hero-tagline]");
      const frame = root.querySelector<HTMLElement>("[data-hero-frame]");
      const media = frame?.querySelector<HTMLElement>("[data-plate-media]");

      if (frame && media && !reduced()) {
        gsap
          .timeline()
          .fromTo(
            frame,
            { clipPath: CLOSED.split },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.9, ease: "drape" },
            0
          )
          // Lower than the old 1.45. A seam opening from the centre shows the
          // middle of the picture immediately, so an over-scale that large is
          // visibly drifting under the subject for the whole move; 1.28 still
          // reads as settling without pulling the flacon off its own axis.
          .fromTo(media, { scale: 1.28 }, { scale: 1, duration: 2.2, ease: "drape" }, 0);
      }

      if (word) splits.push(revealChars(word, { delay: 0.35, stagger: 0.035 }));
      if (tagline) splits.push(revealLines(tagline, { delay: 1.05, stagger: 0.1 }));

      // The marginalia snaps in under the wordmark's long set. Two speeds in
      // the first three seconds is what tells a reader the page has a range.
      gsap.from("[data-hero-meta]", {
        autoAlpha: 0,
        y: 20,
        duration: 0.55,
        stagger: 0.07,
        delay: 1.15,
        ease: "settle",
      });

      gsap.to("[data-hero-cue]", { autoAlpha: 1, duration: 0.5, delay: 1.55 });

      // A very slow float on the frame, forever. Once the entrance finishes the
      // cover is otherwise a still image until the reader scrolls, and a still
      // first screen is the one that gets read as "this site doesn't move".
      //
      // The frame is safe to drive here because the entrance and the departure
      // both animate the media inside it and its own clip-path — never its
      // position — so nothing overwrites this.
      if (frame && !reduced()) {
        gsap.to(frame, {
          y: -14,
          duration: 5.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 1.8,
        });
      }

      if (!reduced()) {
        // Departure: the plate keeps rising while the type sinks and loosens,
        // so the cover comes apart rather than scrolling away as a block.
        const out = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });

        if (media) out.to(media, { yPercent: -14, scale: 1.16, ease: "none" }, 0);
        if (word) out.to(word, { yPercent: 42, letterSpacing: "0.06em", ease: "none" }, 0);
        out
          .to("[data-hero-tagline], [data-hero-meta]", { autoAlpha: 0, y: -30, ease: "none" }, 0)
          .to("[data-hero-cue]", { autoAlpha: 0, ease: "none" }, 0);
      }

      return () => splits.forEach((s) => s.revert());
    }, root);

    return () => ctx.revert();
  }, [ready]);

  return (
    <section
      ref={rootRef}
      id="hero"
      className="relative flex min-h-[100svh] flex-col justify-between gutter pb-10 pt-32 md:pt-40"
    >
      {/* upper register */}
      <div className="mx-auto flex w-full max-w-[100rem] items-start justify-between gap-8">
        <p data-hero-meta className="eyebrow max-w-[14rem] leading-relaxed">
          Maison de Parfum
          <br />
          Grasse — Est. MMXIV
        </p>
        <p data-hero-meta className="eyebrow hidden text-right md:block">
          Ouverture
          <br />
          No. 01 / 09
        </p>
      </div>

      {/* the plate, set behind the wordmark */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <Plate
          id="flacon"
          data-hero-frame
          priority
          bleed={10}
          sizes="(max-width: 768px) 78vw, 34vw"
          className="h-[54vh] w-[62vw] md:h-[68vh] md:w-[30vw]"
        />
      </div>

      {/* lower register */}
      <div className="relative mx-auto w-full max-w-[100rem]">
        <h1
          data-hero-word
          className="display invisible text-[clamp(4rem,20vw,19rem)]"
          style={{ color: "var(--ink-strong)" }}
        >
          Vespera
        </h1>

        <div className="mt-10 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <p
            data-hero-tagline
            className="invisible max-w-md text-[clamp(0.95rem,1.15vw,1.1rem)] leading-relaxed"
            style={{ color: "var(--ink-muted)" }}
          >
            An atelier of scent and space. Eleven compositions in light, stone
            and glass — each one begun in an empty room.
          </p>

          <div data-hero-cue className="flex items-center gap-4 opacity-0">
            <span className="eyebrow">Scroll</span>
            <span
              className="block h-10 w-px animate-[hairline_2.6s_cubic-bezier(0.16,1,0.3,1)_infinite]"
              style={{ backgroundColor: "var(--accent)" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
