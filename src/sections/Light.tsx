"use client";

import { useRef } from "react";

import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { revealLines, reduced } from "@/animations/reveals";
import { Plate } from "@/components/Plate";

/**
 * The full-bleed reveal.
 *
 * A narrow column of image widens to the full viewport as you scroll, while the
 * picture inside counter-scales down. Because the clip-path opens horizontally
 * and the media shrinks at the same time, the image reads as being *revealed*
 * rather than stretched — the frame moves, the content stays still.
 */
export function Light() {
  const rootRef = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const splits: { revert: () => void }[] = [];
      const frame = root.querySelector<HTMLElement>("[data-light-frame]");
      const media = root.querySelector<HTMLElement>("[data-plate-media]");
      const caption = root.querySelector("[data-light-caption]");

      if (caption) splits.push(revealLines(caption, { start: "top 78%" }));

      if (frame && media && !reduced()) {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: root,
              start: "top 78%",
              end: "top 8%",
              scrub: 1.1,
            },
          })
          .fromTo(
            frame,
            { clipPath: "inset(0% 34% 0% 34%)" },
            { clipPath: "inset(0% 0% 0% 0%)", ease: "none" },
            0
          )
          .fromTo(media, { scale: 1.5 }, { scale: 1, ease: "none" }, 0);

        // Once open, it keeps drifting so the section never sits still.
        gsap.fromTo(
          media,
          { yPercent: -5 },
          {
            yPercent: 5,
            ease: "none",
            scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
          }
        );
      }
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} id="light" className="relative py-[clamp(4rem,10vh,9rem)]">
      <Plate
        id="colonnade"
        data-light-frame
        data-cursor="view"
        bleed={9}
        sizes="100vw"
        className="h-[62vh] w-full md:h-[92vh]"
      />

      <div className="pointer-events-none absolute inset-0 flex items-end">
        <div className="mx-auto w-full max-w-[100rem] gutter pb-[clamp(3rem,8vh,7rem)]">
          <p
            data-light-caption
            className="display invisible max-w-3xl text-[clamp(1.6rem,4.4vw,4rem)]"
            style={{ color: "var(--ink-strong)", mixBlendMode: "difference" }}
          >
            Light is the first ingredient. Everything after it is arrangement.
          </p>
        </div>
      </div>
    </section>
  );
}
