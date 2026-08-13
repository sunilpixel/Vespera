"use client";

import { useRef } from "react";

import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { reduced } from "@/animations/reveals";
import { Plate } from "@/components/Plate";
import { STORY_CHAPTERS } from "@/content/site";

/**
 * Pinned chapter sequence: text left, plate right.
 *
 * The plate is a single element for the whole section — it opens once, then
 * grows continuously across all three chapters, so the pin reads as one
 * uninterrupted camera push rather than three separate reveals. The chapters
 * themselves cross-fade against it on their own sub-timelines.
 */
export function Story() {
  const rootRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    const pin = pinRef.current;
    if (!root || !pin) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        const media = root.querySelector<HTMLElement>("[data-plate-media]");
        const frame = root.querySelector<HTMLElement>("[data-story-frame]");
        const chapters = gsap.utils.toArray<HTMLElement>("[data-chapter]", root);

        gsap.set(chapters.slice(1), { autoAlpha: 0, yPercent: 8 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: `+=${chapters.length * 90}%`,
            pin,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        // The frame widens and the picture inside settles down out of its
        // over-scale for the full length of the pin.
        if (frame) {
          tl.fromTo(
            frame,
            { clipPath: "inset(14% 0% 14% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", ease: "none", duration: chapters.length },
            0
          );
        }
        if (media) {
          tl.fromTo(
            media,
            { scale: 1.34, yPercent: -6 },
            { scale: 1, yPercent: 4, ease: "none", duration: chapters.length },
            0
          );
        }

        // Chapters hand over one at a time, and the cut is deliberately hard:
        // the outgoing chapter clears in a fifth of the scroll the plate takes
        // to move at all. Against a plate that never stops creeping, a fast cut
        // is the only thing that reads as an event.
        chapters.forEach((chapter, i) => {
          if (i === 0) return;
          tl.to(
            chapters[i - 1],
            { autoAlpha: 0, yPercent: -14, duration: 0.16, ease: "swift" },
            i - 0.24
          ).fromTo(
            chapter,
            { autoAlpha: 0, yPercent: 14 },
            { autoAlpha: 1, yPercent: 0, duration: 0.2, ease: "snap" },
            i - 0.06
          );
        });

        // Progress ticks alongside the chapter marks.
        gsap.utils.toArray<HTMLElement>("[data-chapter-tick]", root).forEach((tick, i) => {
          tl.to(tick, { scaleX: 1, duration: 0.22, ease: "swift" }, Math.max(0, i - 0.05));
        });
      });

      // Below the fold of a phone there is no room for a pinned two-column
      // layout, so the chapters simply stack and reveal in place.
      mm.add("(max-width: 767.98px)", () => {
        if (reduced()) return;
        gsap.utils.toArray<HTMLElement>("[data-chapter]", root).forEach((chapter) => {
          gsap.from(chapter, {
            autoAlpha: 0,
            y: 40,
            duration: 1.2,
            scrollTrigger: { trigger: chapter, start: "top 82%", once: true },
          });
        });
      });

      return () => mm.revert();
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} id="story" className="relative">
      <div ref={pinRef} className="relative flex min-h-[100svh] items-center gutter py-16">
        <div className="mx-auto grid w-full max-w-[100rem] items-center gap-12 md:grid-cols-[1fr_1fr] md:gap-20 lg:gap-28">
          {/* ------------------------------------------------------- text */}
          <div className="relative">
            <p className="eyebrow mb-10">The House</p>

            {/* Stacked so chapters cross-fade in the same box on desktop.
                Absolute children contribute no height, so the box has to
                reserve the tallest chapter (measured: 238px at this scale) —
                and no more than that, or the surplus shows up as a band of
                empty ground between the copy and the ticks. */}
            <div className="relative md:min-h-60">
              {STORY_CHAPTERS.map((chapter, i) => (
                <article
                  key={chapter.index}
                  data-chapter
                  className={`md:absolute md:inset-x-0 md:top-0 ${i > 0 ? "mt-16 md:mt-0" : ""}`}
                >
                  <span
                    className="display block text-[clamp(2.2rem,4vw,3.4rem)] italic"
                    style={{ color: "var(--accent)" }}
                  >
                    {chapter.index}
                  </span>
                  <h3
                    className="display mt-5 text-[clamp(1.8rem,3.4vw,3rem)]"
                    style={{ color: "var(--ink-strong)" }}
                  >
                    {chapter.title}
                  </h3>
                  <p
                    className="mt-6 max-w-md text-[clamp(0.9rem,1.05vw,1.0625rem)] leading-[1.75]"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    {chapter.body}
                  </p>
                </article>
              ))}
            </div>

            {/* A 1px hairline in brass at 64px wide is not readable as a
                progress indicator — it has to carry some weight to register at
                all. */}
            <div className="mt-12 hidden gap-3 md:flex">
              {STORY_CHAPTERS.map((chapter) => (
                <span
                  key={chapter.index}
                  className="relative block h-0.5 w-20 overflow-hidden"
                  style={{ backgroundColor: "var(--line)" }}
                >
                  <span
                    data-chapter-tick
                    className="absolute inset-0 block origin-left scale-x-0"
                    style={{ backgroundColor: "var(--accent)" }}
                  />
                </span>
              ))}
            </div>
          </div>

          {/* ------------------------------------------------------ plate */}
          <Plate
            id="atrium"
            data-story-frame
            data-cursor="view"
            bleed={10}
            sizes="(max-width: 768px) 100vw, 46vw"
            className="h-[46vh] w-full md:h-[84vh]"
          />
        </div>
      </div>
    </section>
  );
}
