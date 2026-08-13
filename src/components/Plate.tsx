"use client";

import { forwardRef } from "react";

import { PLATES, type PlateId } from "@/content/plates.generated";

interface PlateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "id"> {
  id: PlateId;
  /** Sizing/aspect belongs to the caller; the frame just fills it. */
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Extra bleed so parallax drift never exposes an edge. */
  bleed?: number;
  alt?: string;
}

/**
 * A framed plate.
 *
 * Structure matters to the animation layer:
 *   [frame]              clip-path opens on this
 *     [data-plate-media] counter-scale and parallax happen on this
 *       <picture>        never transformed directly
 *
 * The blur-up sits behind the picture as a background-image rather than a
 * second <img>, so there is no second element to fade out and no layout cost.
 */
export const Plate = forwardRef<HTMLDivElement, PlateProps>(function Plate(
  { id, className = "", sizes = "100vw", priority = false, bleed = 8, alt, style, ...rest },
  ref
) {
  const p = PLATES[id];

  return (
    <div
      ref={ref}
      data-plate={id}
      className={`relative overflow-hidden ${className}`}
      style={{ backgroundColor: "var(--bg-raised)", ...style }}
      {...rest}
    >
      <div
        data-plate-media
        className="absolute"
        style={{
          inset: `-${bleed}%`,
          backgroundImage: `url(${p.blur})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          willChange: "transform",
        }}
      >
        <picture>
          <source srcSet={p.avif} type="image/avif" />
          <source srcSet={p.webp} type="image/webp" />
          <img
            src={p.webp}
            alt={alt ?? p.label}
            width={p.width}
            height={p.height}
            sizes={sizes}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
            draggable={false}
            className="h-full w-full object-cover select-none"
          />
        </picture>
      </div>
    </div>
  );
});

interface CaptionProps {
  index?: string;
  children: React.ReactNode;
  className?: string;
}

/** The small run-in caption that sits under or beside a plate. */
export function Caption({ index, children, className = "" }: CaptionProps) {
  return (
    <figcaption className={`flex items-baseline gap-4 ${className}`}>
      {index && <span className="eyebrow tabular-nums">{index}</span>}
      <span className="text-[0.8125rem] leading-relaxed text-[var(--ink-muted)]">
        {children}
      </span>
    </figcaption>
  );
}
