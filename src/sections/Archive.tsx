"use client";

import { useRef } from "react";

import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { hoverFrame, revealLines, snapIn, velocitySkew } from "@/animations/reveals";
import { Plate } from "@/components/Plate";
import { ARCHIVE } from "@/content/site";

/**
 * The horizontal archive.
 *
 * The track is translated by the pinned scroll, and each picture is given a
 * counter-translation driven by that same tween via `containerAnimation` — so
 * the plates travel slower than their frames and the row gains depth instead of
 * sliding past as a flat strip.
 *
 * On top of that the track leans into the direction of travel by an amount
 * taken from live scroll velocity. It is the only thing on the page that
 * responds to *how hard* the reader scrolls rather than to how far, and a
 * flicked wheel here costs visibly more than a slow one.
 */
export function Archive() {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      const disposers: (() => void)[] = [];

      // Pointer response on every plate, at both breakpoints — the archive is
      // the densest run of imagery on the page and the easiest place for a
      // reader to want one picture rather than the row.
      gsap.utils.toArray<HTMLElement>("[data-archive-item]", track).forEach((item) => {
        disposers.push(
          hoverFrame(item, {
            media: item.querySelector<HTMLElement>("[data-plate-media]"),
            rule: item.querySelector<HTMLElement>("[data-archive-fill]"),
            shift: item.querySelector<HTMLElement>("[data-archive-index]"),
            distance: 8,
          })
        );
      });

      mm.add("(min-width: 1024px)", () => {
        const distance = () => track.scrollWidth - window.innerWidth;

        // Skew the plates, not the track: the track carries the pinned
        // translation, and adding a second transform to it fights ScrollTrigger
        // for the same matrix.
        const releaseSkew = velocitySkew("[data-archive-item]", {
          max: 5,
          factor: 300,
          prop: "skewX",
        });

        const drive = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: () => `+=${distance() + window.innerHeight * 0.4}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });

        gsap.utils.toArray<HTMLElement>("[data-archive-item]", track).forEach((item) => {
          const media = item.querySelector<HTMLElement>("[data-plate-media]");
          const caption = item.querySelector<HTMLElement>("[data-archive-caption]");

          if (media) {
            gsap.fromTo(
              media,
              { xPercent: -8 },
              {
                xPercent: 8,
                ease: "none",
                scrollTrigger: {
                  trigger: item,
                  containerAnimation: drive,
                  start: "left right",
                  end: "right left",
                  scrub: true,
                },
              }
            );
          }

          if (caption) {
            gsap.from(caption, {
              autoAlpha: 0,
              y: 20,
              duration: 0.5,
              ease: "settle",
              scrollTrigger: {
                trigger: item,
                containerAnimation: drive,
                start: "left 78%",
                once: true,
              },
            });
          }
        });

        return () => releaseSkew();
      });

      const heading = root.querySelector("[data-archive-heading]");
      const split = heading ? revealLines(heading, { start: "top 84%" }) : null;
      snapIn("[data-archive-lede]", { trigger: root, start: "top 84%", y: 14 });

      return () => {
        split?.revert();
        disposers.forEach((d) => d());
        mm.revert();
      };
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} id="archive" className="relative overflow-hidden py-[clamp(4rem,10vh,8rem)]">
      <div className="gutter">
        <div className="mx-auto flex w-full max-w-[100rem] items-end justify-between gap-8">
          <h2
            data-archive-heading
            className="display invisible max-w-xl text-[clamp(2.2rem,6vw,5.5rem)]"
            style={{ color: "var(--ink-strong)" }}
          >
            The archive
          </h2>
          <p data-archive-lede className="eyebrow hidden shrink-0 text-right lg:block">
            Scroll sideways
            <br />
            {ARCHIVE.length} plates
          </p>
        </div>
      </div>

      <div
        ref={trackRef}
        className="mt-[clamp(3rem,8vh,6rem)] flex gap-6 px-[var(--spacing-gutter)] max-lg:flex-col lg:mt-[clamp(2.5rem,6vh,4.5rem)] lg:w-max lg:gap-10"
        style={{ willChange: "transform" }}
      >
        {ARCHIVE.map((item, i) => (
          <figure
            key={item.plate}
            data-archive-item
            className="shrink-0 max-lg:w-full lg:w-[clamp(24rem,34vw,40rem)]"
          >
            {/* The section pins, so heading + plate + caption all have to fit
                inside one viewport; at 64vh the captions fell below the fold
                and stayed there for the whole horizontal run. */}
            <Plate
              id={item.plate}
              data-cursor="view"
              bleed={12}
              sizes="(max-width: 1024px) 100vw, 34vw"
              className="h-[54vh] w-full lg:h-[56vh]"
            />
            {/* The rule under the caption is the hover target: it fills brass
                left-to-right while the index steps aside for it. */}
            <span
              className="relative mt-5 block h-px w-full"
              style={{ backgroundColor: "var(--line)" }}
            >
              <span
                data-archive-fill
                className="absolute inset-0 block origin-left scale-x-0"
                style={{ backgroundColor: "var(--accent)" }}
              />
            </span>

            <figcaption
              data-archive-caption
              className="mt-4 flex items-baseline justify-between gap-6"
            >
              <span className="text-[0.9rem]" style={{ color: "var(--ink)" }}>
                {item.caption}
              </span>
              <span data-archive-index className="index whitespace-nowrap">
                {String(i + 1).padStart(2, "0")} — {item.year}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
