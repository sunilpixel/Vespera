"use client";

import { useRef } from "react";

import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import {
  drawRule,
  hoverFrame,
  parallaxPlate,
  revealLines,
  revealPlate,
  revealWords,
  snapIn,
  reduced,
} from "@/animations/reveals";
import { Plate } from "@/components/Plate";
import { COMPOSITIONS } from "@/content/site";

/**
 * The editorial spread.
 *
 * Rows alternate side, and the reveal direction alternates with them — the
 * plate always opens from the outer edge, so the spread reads as opening
 * outward from the gutter. The oversized name drifts against its plate at a
 * different rate, which is what stops an alternating layout feeling like a
 * repeating template.
 *
 * This is also the section that answers the pointer. Everything above it is
 * driven by scroll alone, so the first row that pushes back under the cursor is
 * where the page stops feeling like a document and starts feeling like a
 * surface. The whole row is the hit area, not just the picture.
 */
export function Compositions() {
  const rootRef = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const splits: { revert: () => void }[] = [];
      const disposers: (() => void)[] = [];

      const heading = root.querySelector("[data-comp-heading]");
      if (heading) splits.push(revealLines(heading, { start: "top 84%" }));

      gsap.utils.toArray<HTMLElement>("[data-comp-row]", root).forEach((row, i) => {
        const flipped = i % 2 === 1;
        const frame = row.querySelector<HTMLElement>("[data-plate]");
        const media = row.querySelector<HTMLElement>("[data-plate-media]");
        const name = row.querySelector<HTMLElement>("[data-comp-name]");
        const note = row.querySelector("[data-comp-note]");
        const rule = row.querySelector("[data-comp-rule]");
        const fill = row.querySelector<HTMLElement>("[data-comp-fill]");
        const meta = row.querySelectorAll("[data-comp-meta]");

        if (frame) {
          revealPlate(frame, { edge: flipped ? "right" : "left", start: "top 80%" });
          parallaxPlate(frame, 14);
        }
        // The note arrives on words rather than lines: it lands in roughly a
        // third of the time the plate beside it takes to open, which is the
        // whole reason the slow opening still registers as slow.
        if (note) splits.push(revealWords(note, { start: "top 86%" }));
        if (rule) drawRule(rule);
        if (meta.length) snapIn(meta, { trigger: row, start: "top 82%", y: 16 });

        // Pointer response. Scoped to the row so hovering the name moves the
        // picture too — they are one object, and treating them as one is what
        // separates this from a card that merely zooms.
        disposers.push(
          hoverFrame(row, { media, shift: name, rule: fill, distance: flipped ? -16 : 16 })
        );

        // The name is the counterweight: it travels the opposite way to the
        // plate's own parallax, at roughly half the distance.
        if (name && !reduced()) {
          gsap.fromTo(
            name,
            { yPercent: flipped ? 26 : -26 },
            {
              yPercent: flipped ? -26 : 26,
              ease: "none",
              scrollTrigger: {
                trigger: row,
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
              },
            }
          );
        }
      });

      return () => {
        splits.forEach((s) => s.revert());
        disposers.forEach((d) => d());
      };
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      id="compositions"
      className="relative gutter py-[clamp(4.5rem,11vh,8rem)]"
    >
      <div className="mx-auto w-full max-w-[100rem]">
        <div className="flex items-end justify-between gap-8">
          <h2
            data-comp-heading
            className="display invisible max-w-2xl text-[clamp(2.4rem,7vw,6.5rem)]"
            style={{ color: "var(--ink-strong)" }}
          >
            Three compositions
          </h2>
          <p className="eyebrow hidden shrink-0 text-right md:block">
            Édition
            <br />
            MMXXV
          </p>
        </div>

        {/* Rows used to be separated by up to 11rem of empty ground, which on a
            900px viewport meant a full screen of nothing between spreads. */}
        <div className="mt-[clamp(3rem,7vh,6rem)] flex flex-col gap-[clamp(3.5rem,9vh,7rem)]">
          {COMPOSITIONS.map((item, i) => {
            const flipped = i % 2 === 1;
            return (
              <article
                key={item.index}
                data-comp-row
                className={`grid items-center gap-8 md:gap-16 lg:gap-24 ${
                  flipped
                    ? "md:grid-cols-[0.9fr_1.1fr]"
                    : "md:grid-cols-[1.1fr_0.9fr]"
                }`}
              >
                <div className={flipped ? "md:order-2" : ""}>
                  <Plate
                    id={item.plate}
                    data-cursor="view"
                    bleed={12}
                    sizes="(max-width: 768px) 100vw, 52vw"
                    className="h-[52vh] w-full md:h-[78vh]"
                  />
                </div>

                <div className={`relative ${flipped ? "md:order-1" : ""}`}>
                  {/* The oversized name bleeds toward the gutter. */}
                  <h3
                    data-comp-name
                    className={`display text-[clamp(3rem,9vw,8rem)] ${
                      flipped ? "md:-mr-[12%] md:text-right" : "md:-ml-[12%]"
                    }`}
                    style={{ color: "var(--ink-strong)" }}
                  >
                    {item.name}
                  </h3>

                  <div className={flipped ? "md:flex md:flex-col md:items-end" : ""}>
                    {/* The hairline draws itself on scroll; the brass inside it
                        fills only under the pointer, so colour is the reward
                        for reaching rather than part of the resting page. */}
                    <span
                      data-comp-rule
                      className="relative mt-10 block h-px w-full max-w-xs origin-left scale-x-0"
                      style={{ backgroundColor: "var(--line-strong)" }}
                    >
                      <span
                        data-comp-fill
                        className="absolute inset-0 block origin-left scale-x-0"
                        style={{ backgroundColor: "var(--accent)" }}
                      />
                    </span>

                    <div
                      className={`mt-6 flex items-baseline gap-5 ${
                        flipped ? "md:justify-end" : ""
                      }`}
                    >
                      <span data-comp-meta className="index">
                        {item.index}
                      </span>
                      <span data-comp-meta className="eyebrow">
                        {item.family}
                      </span>
                    </div>

                    <p
                      data-comp-note
                      className={`invisible mt-6 max-w-sm text-[clamp(0.9rem,1.05vw,1.0625rem)] leading-[1.75] ${
                        flipped ? "md:text-right" : ""
                      }`}
                      style={{ color: "var(--ink-muted)" }}
                    >
                      {item.note}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
