"use client";

import { useRef } from "react";

import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { countTo, revealLines, snapIn, reduced } from "@/animations/reveals";
import { Plate } from "@/components/Plate";
import { CRAFT } from "@/content/site";

/**
 * Three process cards.
 *
 * Entrance is a staggered clip-path wipe, deliberately different from the
 * spread above it. Hover is handled in CSS rather than GSAP — it needs to
 * respond instantly to the pointer and never queue behind a scrub.
 *
 * The card indices count up to their value instead of being printed. It is the
 * one genuinely quick, self-announcing move on the page, and it sits directly
 * after the archive so the section reads as a change of gear rather than more
 * of the same slow arrival.
 */
export function Craft() {
  const rootRef = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const splits: { revert: () => void }[] = [];
      const heading = root.querySelector("[data-craft-heading]");
      if (heading) splits.push(revealLines(heading, { start: "top 84%" }));

      snapIn("[data-craft-lede]", { trigger: root, start: "top 84%", y: 14 });

      if (!reduced()) {
        gsap.from("[data-craft-card]", {
          clipPath: "inset(0% 0% 100% 0%)",
          duration: 1.1,
          stagger: 0.1,
          ease: "drape",
          scrollTrigger: { trigger: "[data-craft-grid]", start: "top 78%", once: true },
        });
      }

      // Each index rolls as its own card clears the wipe, so the three figures
      // land in sequence rather than together.
      gsap.utils.toArray<HTMLElement>("[data-craft-count]", root).forEach((el, i) => {
        countTo(el, Number(CRAFT[i].index), { start: "top 74%", duration: 0.8 });
      });

      return () => splits.forEach((s) => s.revert());
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} id="craft" className="relative gutter py-[clamp(4.5rem,11vh,8rem)]">
      <div className="mx-auto w-full max-w-[100rem]">
        <div className="flex items-end justify-between gap-8">
          <h2
            data-craft-heading
            className="display invisible max-w-2xl text-[clamp(2.2rem,6vw,5.5rem)]"
            style={{ color: "var(--ink-strong)" }}
          >
            Made slowly, on purpose
          </h2>
          <p data-craft-lede className="eyebrow hidden shrink-0 text-right md:block">
            Atelier
            <br />
            Grasse
          </p>
        </div>

        <div
          data-craft-grid
          className="mt-[clamp(3rem,8vh,6rem)] grid gap-px md:grid-cols-3"
          style={{ backgroundColor: "var(--line)" }}
        >
          {CRAFT.map((item) => (
            <article
              key={item.index}
              data-craft-card
              data-cursor="link"
              className="group relative overflow-hidden"
              style={{ backgroundColor: "var(--bg)" }}
            >
              {/* the plate sits behind and lifts on hover */}
              <div className="relative h-[34vh] overflow-hidden md:h-[42vh]">
                <Plate
                  id={item.plate}
                  bleed={6}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="h-full w-full transition-transform duration-[820ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
                />
                {/* scrim deepens so the index stays legible over any plate */}
                <span
                  aria-hidden
                  className="absolute inset-0 transition-opacity duration-700 group-hover:opacity-0"
                  style={{
                    background:
                      "linear-gradient(to top, var(--bg) 2%, transparent 46%)",
                  }}
                />
                <span
                  data-craft-count
                  className="index absolute left-6 top-6 transition-[letter-spacing] duration-700 group-hover:tracking-[0.5em]"
                >
                  {item.index}
                </span>
              </div>

              <div className="relative p-6 md:p-8">
                {/* background wipes up from the base on hover */}
                <span
                  aria-hidden
                  className="absolute inset-0 origin-bottom scale-y-0 transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100"
                  style={{ backgroundColor: "var(--bg-raised)" }}
                />
                <div className="relative">
                  <h3
                    className="display text-[clamp(1.5rem,2.4vw,2.2rem)]"
                    style={{ color: "var(--ink-strong)" }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="mt-4 text-[0.9375rem] leading-[1.75]"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    {item.body}
                  </p>
                  <span
                    aria-hidden
                    className="mt-7 block h-px w-full origin-left scale-x-0 transition-transform duration-520 ease-snap group-hover:scale-x-100"
                    style={{ backgroundColor: "var(--accent)" }}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
