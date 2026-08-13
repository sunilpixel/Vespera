/**
 * Shared drawing kit for the editorial plates.
 *
 * The house palette is warm from the start rather than tinted afterwards with a
 * colour matrix -- one less filter pass, and the mid-tones stay clean enough to
 * sit on both the ivory and the charcoal theme without re-exporting.
 */

export const PALETTE = {
  ivory: "#F7F4EE",
  cream: "#EDE9E1",
  linen: "#DED7CA",
  sand: "#C4BCAD",
  taupe: "#9A9083",
  clay: "#6E665B",
  stone: "#4A443C",
  soot: "#26231F",
  charcoal: "#141311",
  black: "#050505",
};

const P = PALETTE;

/** Linear gradient in user space. */
export const lin = (id, x1, y1, x2, y2, stops) =>
  `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">` +
  stops
    .map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`)
    .join("") +
  `</linearGradient>`;

/** Radial gradient in user space. */
export const rad = (id, cx, cy, r, stops, fx, fy) =>
  `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${r}"` +
  (fx !== undefined ? ` fx="${fx}" fy="${fy}"` : "") +
  `>` +
  stops
    .map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`)
    .join("") +
  `</radialGradient>`;

/** Gaussian blur filter with a generous region so nothing clips. */
export const blur = (id, sd) =>
  `<filter id="${id}" x="-60%" y="-60%" width="220%" height="220%">` +
  `<feGaussianBlur stdDeviation="${sd}"/></filter>`;

/**
 * A soft cast shadow: the same silhouette, skewed toward the light's opposite,
 * blurred, and darkest where the form meets the ground.
 */
export const cast = (d, { dx = 0, dy = 0, skew = 0, scaleY = 1, o = 0.5, blurId }) =>
  `<g transform="translate(${dx} ${dy}) skewX(${skew}) scale(1 ${scaleY})" opacity="${o}"` +
  (blurId ? ` filter="url(#${blurId})"` : "") +
  `><path d="${d}" fill="${P.black}"/></g>`;

/** Film grain laid over the finished composition. */
export const grain = (w, h, amount = 0.055) => `
  <filter id="filmGrain" x="0" y="0" width="100%" height="100%" primitiveUnits="userSpaceOnUse">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" result="n"/>
    <feColorMatrix in="n" type="saturate" values="0"/>
  </filter>
  <rect width="${w}" height="${h}" filter="url(#filmGrain)" opacity="${amount}"/>
`;

/** Corner falloff. Every real photograph has one. */
export const vignette = (w, h, strength = 0.55) => `
  <radialGradient id="vig" gradientUnits="userSpaceOnUse" cx="${w / 2}" cy="${h * 0.46}" r="${Math.max(w, h) * 0.72}">
    <stop offset="0.42" stop-color="#000000" stop-opacity="0"/>
    <stop offset="0.78" stop-color="#000000" stop-opacity="${strength * 0.45}"/>
    <stop offset="1" stop-color="#000000" stop-opacity="${strength}"/>
  </radialGradient>
`;

/** Atmospheric haze -- the thing that reads as "depth" in a photograph. */
export const haze = (w, h, { cx = 0.5, cy = 0.4, o = 0.16 } = {}) => `
  <radialGradient id="haze" gradientUnits="userSpaceOnUse" cx="${w * cx}" cy="${h * cy}" r="${w * 0.8}">
    <stop offset="0" stop-color="${P.ivory}" stop-opacity="${o}"/>
    <stop offset="0.42" stop-color="${P.sand}" stop-opacity="${o * 0.4}"/>
    <stop offset="1" stop-color="${P.black}" stop-opacity="0"/>
  </radialGradient>
`;

/**
 * Cylinder shading: a lit side, a terminator, a core shadow and a bounce.
 * Used for columns, vessels and the flacon.
 */
export const cylinderStops = (light = 0.32) => [
  [0, P.soot],
  [Math.max(0, light - 0.26), P.stone],
  [light, P.cream],
  [Math.min(1, light + 0.1), P.linen],
  [Math.min(1, light + 0.34), P.clay],
  [0.86, P.soot],
  [1, P.stone],
];

/** Assemble a complete SVG document. */
export const doc = (w, h, defs, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
  `<defs>${defs}</defs>${body}</svg>`;

export { P };
