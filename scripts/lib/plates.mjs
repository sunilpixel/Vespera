/**
 * The editorial plates.
 *
 * Original light-and-form studies rather than stock photography: architecture,
 * drapery, glass and stone under studio light. Each is a complete SVG scene
 * rasterised at build time, so the site ships plain image files.
 *
 * To swap in real photography, drop a file into /public/plates and point the
 * plate's `file` at it -- nothing downstream cares how the pixels were made.
 */

import { P, lin, rad, blur, grain, vignette, haze, cylinderStops, doc } from "./atelier.mjs";

/* ------------------------------------------------------------------ atrium */

function atrium(w, h) {
  const defs = `
    ${lin("wall", 0, 0, 0, h, [
      [0, P.soot],
      [0.34, P.stone],
      [0.72, P.charcoal],
      [1, P.black],
    ])}
    ${lin("shaft", w * 0.1, 0, w * 0.95, h, [
      [0, P.ivory, 0.92],
      [0.34, P.cream, 0.5],
      [0.68, P.sand, 0.16],
      [1, P.taupe, 0],
    ])}
    ${lin("floor", 0, h * 0.72, 0, h, [
      [0, P.clay],
      [0.4, P.stone],
      [1, P.charcoal],
    ])}
    ${lin("pool", 0, h * 0.72, 0, h * 0.98, [
      [0, P.linen, 0.5],
      [0.6, P.taupe, 0.14],
      [1, P.stone, 0],
    ])}
    ${blur("bSoft", 26)}
    ${blur("bWide", 64)}
    ${haze(w, h, { cx: 0.62, cy: 0.3, o: 0.2 })}
    ${vignette(w, h, 0.62)}
  `;

  // Louvred light: a run of shafts raking down the wall and breaking at the
  // floor line, each one a touch weaker than the last.
  const slats = Array.from({ length: 7 }, (_, i) => {
    const x = w * 0.06 + i * w * 0.132;
    const o = 0.85 - i * 0.1;
    return `<path d="M ${x} 0 L ${x + w * 0.052} 0 L ${x + w * 0.29} ${h * 0.72} L ${x + w * 0.2} ${h * 0.72} Z"
              fill="url(#shaft)" opacity="${o}" filter="url(#bSoft)"/>
            <path d="M ${x + w * 0.2} ${h * 0.72} L ${x + w * 0.29} ${h * 0.72} L ${x + w * 0.44} ${h} L ${x + w * 0.3} ${h} Z"
              fill="url(#pool)" opacity="${o * 0.7}" filter="url(#bWide)"/>`;
  }).join("");

  return doc(
    w,
    h,
    defs,
    `
    <rect width="${w}" height="${h}" fill="url(#wall)"/>
    <rect y="${h * 0.72}" width="${w}" height="${h * 0.28}" fill="url(#floor)"/>
    ${slats}
    <rect y="${h * 0.715}" width="${w}" height="2" fill="${P.taupe}" opacity="0.3"/>
    <rect width="${w}" height="${h}" fill="url(#haze)"/>
    <rect width="${w}" height="${h}" fill="url(#vig)"/>
    ${grain(w, h, 0.06)}
  `
  );
}

/* -------------------------------------------------------------------- veil */

function veil(w, h) {
  const defs = `
    ${lin("bg", 0, 0, w, h, [
      [0, P.charcoal],
      [0.5, P.soot],
      [1, P.black],
    ])}
    ${blur("bFold", 30)}
    ${blur("bAir", 80)}
    ${haze(w, h, { cx: 0.34, cy: 0.28, o: 0.24 })}
    ${vignette(w, h, 0.6)}
  `;

  // Each fold is a tapered ribbon shaded across its width, so the fabric reads
  // as catching light on the crest and losing it in the trough.
  const folds = Array.from({ length: 9 }, (_, i) => {
    const t = i / 8;
    const x = w * (0.04 + t * 0.94);
    const wobble = Math.sin(i * 1.7) * w * 0.05;
    const width = w * (0.1 + Math.sin(i * 0.9) * 0.035);
    const light = 0.9 - Math.abs(t - 0.3) * 1.15;

    return (
      lin(`fold${i}`, x - width, 0, x + width, 0, [
        [0, P.charcoal, 0.9],
        [0.34, P.clay, Math.max(0.1, light * 0.6)],
        [0.52, P.cream, Math.max(0.04, light)],
        [0.64, P.linen, Math.max(0.03, light * 0.7)],
        [1, P.soot, 0.92],
      ]) +
      `<path d="M ${x} ${-h * 0.05}
                C ${x + wobble} ${h * 0.3}, ${x - wobble} ${h * 0.62}, ${x + wobble * 0.6} ${h * 1.05}
                L ${x + width + wobble * 0.6} ${h * 1.05}
                C ${x + width - wobble} ${h * 0.62}, ${x + width + wobble} ${h * 0.3}, ${x + width} ${-h * 0.05} Z"
             fill="url(#fold${i})" filter="url(#bFold)"/>`
    );
  }).join("");

  return doc(
    w,
    h,
    defs,
    `
    <rect width="${w}" height="${h}" fill="url(#bg)"/>
    ${folds}
    <ellipse cx="${w * 0.32}" cy="${h * 0.24}" rx="${w * 0.42}" ry="${h * 0.3}"
             fill="${P.ivory}" opacity="0.1" filter="url(#bAir)"/>
    <rect width="${w}" height="${h}" fill="url(#haze)"/>
    <rect width="${w}" height="${h}" fill="url(#vig)"/>
    ${grain(w, h, 0.07)}
  `
  );
}

/* ------------------------------------------------------------------ flacon */

function flacon(w, h) {
  const cx = w * 0.5;
  const top = h * 0.24;
  const bot = h * 0.8;
  const bw = w * 0.3;

  const defs = `
    ${lin("bg", 0, 0, 0, h, [
      [0, P.soot],
      [0.46, P.charcoal],
      [0.68, P.black],
      [1, P.charcoal],
    ])}
    ${rad("keylight", cx, h * 0.3, w * 0.62, [
      [0, P.linen, 0.4],
      [0.45, P.taupe, 0.14],
      [1, P.black, 0],
    ])}
    ${lin("glass", cx - bw, 0, cx + bw, 0, cylinderStops(0.3))}
    ${lin("glassInner", cx - bw * 0.5, 0, cx + bw * 0.5, 0, [
      [0, P.stone, 0.6],
      [0.4, P.linen, 0.5],
      [0.62, P.cream, 0.3],
      [1, P.clay, 0.5],
    ])}
    ${lin("liquid", 0, h * 0.48, 0, bot, [
      [0, P.sand, 0.55],
      [0.4, P.clay, 0.7],
      [1, P.soot, 0.85],
    ])}
    ${lin("cap", cx - bw * 0.42, 0, cx + bw * 0.42, 0, cylinderStops(0.28))}
    ${lin("plinth", 0, h * 0.78, 0, h, [
      [0, P.stone],
      [0.3, P.soot],
      [1, P.black],
    ])}
    ${blur("bShadow", 26)}
    ${blur("bGlow", 44)}
    ${vignette(w, h, 0.66)}
  `;

  const body = `M ${cx - bw} ${top + h * 0.06}
                Q ${cx - bw} ${top}, ${cx - bw * 0.72} ${top}
                L ${cx + bw * 0.72} ${top}
                Q ${cx + bw} ${top}, ${cx + bw} ${top + h * 0.06}
                L ${cx + bw} ${bot - h * 0.03}
                Q ${cx + bw} ${bot}, ${cx + bw * 0.86} ${bot}
                L ${cx - bw * 0.86} ${bot}
                Q ${cx - bw} ${bot}, ${cx - bw} ${bot - h * 0.03} Z`;

  return doc(
    w,
    h,
    defs,
    `
    <rect width="${w}" height="${h}" fill="url(#bg)"/>
    <rect width="${w}" height="${h}" fill="url(#keylight)"/>
    <rect y="${h * 0.78}" width="${w}" height="${h * 0.22}" fill="url(#plinth)"/>

    <!-- cast shadow, thrown long and low across the plinth -->
    <ellipse cx="${cx + w * 0.1}" cy="${bot + h * 0.012}" rx="${bw * 1.5}" ry="${h * 0.022}"
             fill="${P.black}" opacity="0.75" filter="url(#bShadow)"/>

    <!-- the glass -->
    <path d="${body}" fill="url(#glass)"/>
    <path d="${body}" fill="url(#liquid)" opacity="0.5"/>
    <!-- inner wall refraction: what makes it read as glass rather than plastic -->
    <path d="M ${cx - bw * 0.62} ${top + h * 0.03} L ${cx + bw * 0.62} ${top + h * 0.03}
             L ${cx + bw * 0.62} ${bot - h * 0.02} L ${cx - bw * 0.62} ${bot - h * 0.02} Z"
          fill="url(#glassInner)" opacity="0.32"/>

    <!-- specular edges -->
    <rect x="${cx - bw * 0.94}" y="${top + h * 0.03}" width="${w * 0.008}" height="${bot - top - h * 0.07}"
          fill="${P.ivory}" opacity="0.75"/>
    <rect x="${cx + bw * 0.86}" y="${top + h * 0.05}" width="${w * 0.005}" height="${bot - top - h * 0.12}"
          fill="${P.cream}" opacity="0.4"/>
    <rect x="${cx - bw * 0.3}" y="${top + h * 0.05}" width="${w * 0.016}" height="${bot - top - h * 0.14}"
          fill="${P.ivory}" opacity="0.16"/>

    <!-- shoulder highlight -->
    <path d="M ${cx - bw * 0.7} ${top + h * 0.012} L ${cx + bw * 0.7} ${top + h * 0.012}"
          stroke="${P.ivory}" stroke-width="${h * 0.004}" opacity="0.55"/>

    <!-- stopper -->
    <rect x="${cx - bw * 0.42}" y="${top - h * 0.1}" width="${bw * 0.84}" height="${h * 0.1}"
          fill="url(#cap)"/>
    <rect x="${cx - bw * 0.42}" y="${top - h * 0.1}" width="${bw * 0.84}" height="${h * 0.006}"
          fill="${P.ivory}" opacity="0.5"/>

    <ellipse cx="${cx}" cy="${h * 0.36}" rx="${w * 0.34}" ry="${h * 0.18}"
             fill="${P.linen}" opacity="0.07" filter="url(#bGlow)"/>
    <rect width="${w}" height="${h}" fill="url(#vig)"/>
    ${grain(w, h, 0.06)}
  `
  );
}

/* --------------------------------------------------------------- colonnade */

function colonnade(w, h) {
  const defs = `
    ${lin("bg", 0, 0, 0, h, [
      [0, P.charcoal],
      [0.55, P.soot],
      [1, P.black],
    ])}
    ${rad("vanish", w * 0.56, h * 0.46, w * 0.34, [
      [0, P.ivory, 0.95],
      [0.28, P.cream, 0.45],
      [0.62, P.taupe, 0.12],
      [1, P.black, 0],
    ])}
    ${lin("floorC", 0, h * 0.6, 0, h, [
      [0, P.clay, 0.7],
      [0.5, P.stone, 0.4],
      [1, P.black, 0.9],
    ])}
    ${blur("bArch", 8)}
    ${vignette(w, h, 0.72)}
  `;

  // Arches marching to a vanishing point; each ring is darker and tighter than
  // the one behind it, which is what creates the sense of distance.
  const arches = Array.from({ length: 8 }, (_, i) => {
    const t = i / 7;
    const k = 1 - t * 0.78;
    const cxA = w * 0.56 - (w * 0.56 - w * 0.5) * t;
    const aw = w * 0.44 * k;
    const ah = h * 0.68 * k;
    const yTop = h * 0.46 - ah * 0.5;
    const yBot = h * 0.46 + ah * 0.5;
    const tone = [P.stone, P.clay, P.taupe][i % 3];
    const o = 0.16 + t * 0.5;

    return `<path d="M ${cxA - aw / 2} ${yBot}
                    L ${cxA - aw / 2} ${yTop + aw * 0.42}
                    A ${aw / 2} ${aw * 0.42} 0 0 1 ${cxA + aw / 2} ${yTop + aw * 0.42}
                    L ${cxA + aw / 2} ${yBot} Z"
             fill="none" stroke="${tone}" stroke-width="${Math.max(2, w * 0.016 * k)}"
             opacity="${o}" filter="url(#bArch)"/>`;
  })
    .reverse()
    .join("");

  return doc(
    w,
    h,
    defs,
    `
    <rect width="${w}" height="${h}" fill="url(#bg)"/>
    <rect width="${w}" height="${h}" fill="url(#vanish)"/>
    ${arches}
    <rect y="${h * 0.6}" width="${w}" height="${h * 0.4}" fill="url(#floorC)"/>
    <ellipse cx="${w * 0.56}" cy="${h * 0.72}" rx="${w * 0.2}" ry="${h * 0.1}"
             fill="${P.linen}" opacity="0.18" filter="url(#bArch)"/>
    <rect width="${w}" height="${h}" fill="url(#vig)"/>
    ${grain(w, h, 0.055)}
  `
  );
}

/* ---------------------------------------------------------------- monolith */

function monolith(w, h) {
  const x = w * 0.38;
  const bw = w * 0.17;
  const top = h * 0.16;
  const ground = h * 0.82;

  const defs = `
    ${lin("bgM", 0, 0, w, h, [
      [0, P.soot],
      [0.42, P.charcoal],
      [1, P.black],
    ])}
    ${rad("wash", w * 0.14, h * 0.2, w * 0.8, [
      [0, P.linen, 0.34],
      [0.4, P.taupe, 0.12],
      [1, P.black, 0],
    ])}
    ${lin("slab", x, 0, x + bw, 0, [
      [0, P.linen],
      [0.16, P.sand],
      [0.44, P.clay],
      [0.78, P.stone],
      [1, P.soot],
    ])}
    ${lin("slabTop", x, top, x + bw, top - h * 0.02, [
      [0, P.ivory],
      [1, P.sand],
    ])}
    ${lin("groundM", 0, ground, 0, h, [
      [0, P.stone, 0.8],
      [0.4, P.soot],
      [1, P.black],
    ])}
    ${blur("bCast", 22)}
    ${vignette(w, h, 0.6)}
  `;

  return doc(
    w,
    h,
    defs,
    `
    <rect width="${w}" height="${h}" fill="url(#bgM)"/>
    <rect width="${w}" height="${h}" fill="url(#wash)"/>
    <rect y="${ground}" width="${w}" height="${h - ground}" fill="url(#groundM)"/>

    <!-- shadow raked away from the key light -->
    <path d="M ${x + bw} ${ground} L ${w * 0.95} ${ground + h * 0.1}
             L ${w * 0.99} ${ground + h * 0.15} L ${x + bw * 0.2} ${ground + h * 0.012} Z"
          fill="${P.black}" opacity="0.8" filter="url(#bCast)"/>

    <rect x="${x}" y="${top}" width="${bw}" height="${ground - top}" fill="url(#slab)"/>
    <path d="M ${x} ${top} L ${x + bw} ${top - h * 0.014} L ${x + bw} ${top} Z" fill="url(#slabTop)" opacity="0.9"/>
    <rect x="${x}" y="${top}" width="${w * 0.004}" height="${ground - top}" fill="${P.ivory}" opacity="0.5"/>
    <ellipse cx="${x + bw * 0.5}" cy="${ground}" rx="${bw * 0.9}" ry="${h * 0.008}"
             fill="${P.black}" opacity="0.85" filter="url(#bCast)"/>

    <rect width="${w}" height="${h}" fill="url(#vig)"/>
    ${grain(w, h, 0.06)}
  `
  );
}

/* ------------------------------------------------------------------- stair */

function stair(w, h) {
  const defs = `
    ${lin("bgS", 0, 0, 0, h, [
      [0, P.charcoal],
      [0.6, P.soot],
      [1, P.black],
    ])}
    ${rad("sun", w * 0.86, h * 0.1, w * 0.9, [
      [0, P.ivory, 0.5],
      [0.34, P.sand, 0.16],
      [1, P.black, 0],
    ])}
    ${blur("bStep", 5)}
    ${vignette(w, h, 0.58)}
  `;

  // A real stair profile: each step advances by exactly one tread depth and
  // rises by one riser height, then the whole run is extruded along a single
  // vanishing direction. Treads face the light, risers face away -- that
  // alternation is the whole read.
  const N = 9;
  const dx = w * 0.062; // tread depth, on screen
  const dy = h * 0.052; // riser height
  const Dx = w * 0.21; // extrusion toward the vanishing point
  const Dy = -h * 0.076;
  const x0 = w * 0.05;
  const y0 = h * 0.87;

  const quad = (pts, fill, o) =>
    `<path d="M ${pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L ")} Z" fill="${fill}" opacity="${o}"/>`;

  // Painted far-to-near so the nearer steps occlude correctly.
  const steps = Array.from({ length: N }, (_, i) => i)
    .reverse()
    .map((i) => {
      const t = i / (N - 1);
      const ax = x0 + i * dx;
      const ay = y0 - i * dy;
      const lit = 0.62 + t * 0.34; // higher steps sit closer to the source

      const tread = [
        [ax, ay],
        [ax + dx, ay],
        [ax + dx + Dx, ay + Dy],
        [ax + Dx, ay + Dy],
      ];
      const riser = [
        [ax + dx, ay],
        [ax + dx + Dx, ay + Dy],
        [ax + dx + Dx, ay + Dy - dy],
        [ax + dx, ay - dy],
      ];

      return (
        quad(riser, P.stone, 0.42 + t * 0.16) +
        quad(tread, P.linen, lit) +
        `<path d="M ${ax + Dx} ${ay + Dy} L ${ax + dx + Dx} ${ay + Dy}"
               stroke="${P.ivory}" stroke-width="${h * 0.0022}" opacity="${lit * 0.8}" fill="none"/>` +
        `<path d="M ${ax} ${ay} L ${ax + dx} ${ay}"
               stroke="${P.black}" stroke-width="${h * 0.005}" opacity="0.4" fill="none" filter="url(#bStep)"/>`
      );
    })
    .join("");

  return doc(
    w,
    h,
    defs,
    `
    <rect width="${w}" height="${h}" fill="url(#bgS)"/>
    <rect width="${w}" height="${h}" fill="url(#sun)"/>
    ${steps}
    <rect width="${w}" height="${h}" fill="url(#vig)"/>
    ${grain(w, h, 0.06)}
  `
  );
}

/* ------------------------------------------------------------------ sphere */

function sphere(w, h) {
  const cx = w * 0.5;
  const cy = h * 0.46;
  const r = Math.min(w, h) * 0.27;
  const ground = h * 0.74;

  const defs = `
    ${lin("cove", 0, 0, 0, h, [
      [0, P.soot],
      [0.5, P.charcoal],
      [0.74, P.stone, 0.9],
      [1, P.soot],
    ])}
    ${rad("ball", cx - r * 0.42, cy - r * 0.46, r * 1.75, [
      [0, P.ivory],
      [0.16, P.cream],
      [0.38, P.sand],
      [0.6, P.clay],
      [0.82, P.soot],
      [1, P.charcoal],
    ])}
    ${rad("bounce", cx + r * 0.2, cy + r * 0.86, r * 0.9, [
      [0, P.taupe, 0.5],
      [1, P.taupe, 0],
    ])}
    ${blur("bBall", 20)}
    ${vignette(w, h, 0.55)}
  `;

  return doc(
    w,
    h,
    defs,
    `
    <rect width="${w}" height="${h}" fill="url(#cove)"/>
    <ellipse cx="${cx + r * 0.5}" cy="${ground}" rx="${r * 1.5}" ry="${r * 0.2}"
             fill="${P.black}" opacity="0.7" filter="url(#bBall)"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#ball)"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#bounce)"/>
    <ellipse cx="${cx - r * 0.38}" cy="${cy - r * 0.44}" rx="${r * 0.3}" ry="${r * 0.2}"
             fill="${P.ivory}" opacity="0.5" filter="url(#bBall)"/>
    <rect width="${w}" height="${h}" fill="url(#vig)"/>
    ${grain(w, h, 0.055)}
  `
  );
}

/* ---------------------------------------------------------------- aperture */

function aperture(w, h) {
  const defs = `
    ${lin("bgA", 0, 0, w, h, [
      [0, P.black],
      [0.5, P.charcoal],
      [1, P.black],
    ])}
    ${lin("slit", w * 0.44, 0, w * 0.62, 0, [
      [0, P.ivory, 0],
      [0.34, P.ivory, 0.95],
      [0.62, P.cream, 0.85],
      [1, P.sand, 0],
    ])}
    ${lin("beam", w * 0.3, 0, w * 0.98, h, [
      [0, P.cream, 0.34],
      [0.44, P.taupe, 0.1],
      [1, P.stone, 0],
    ])}
    ${blur("bSlit", 14)}
    ${blur("bBeam", 54)}
    ${vignette(w, h, 0.74)}
  `;

  const motes = Array.from({ length: 26 }, (_, i) => {
    const s = Math.sin(i * 12.9898) * 43758.5453;
    const r1 = s - Math.floor(s);
    const s2 = Math.sin(i * 78.233) * 43758.5453;
    const r2 = s2 - Math.floor(s2);
    return `<circle cx="${w * (0.42 + r1 * 0.42)}" cy="${h * (0.06 + r2 * 0.88)}"
              r="${1 + r1 * 2.4}" fill="${P.ivory}" opacity="${0.14 + r2 * 0.4}"/>`;
  }).join("");

  return doc(
    w,
    h,
    defs,
    `
    <rect width="${w}" height="${h}" fill="url(#bgA)"/>
    <path d="M ${w * 0.44} 0 L ${w * 0.6} 0 L ${w * 0.92} ${h} L ${w * 0.62} ${h} Z"
          fill="url(#beam)" filter="url(#bBeam)"/>
    <rect x="${w * 0.46}" y="0" width="${w * 0.075}" height="${h}" fill="url(#slit)" filter="url(#bSlit)"/>
    ${motes}
    <rect width="${w}" height="${h}" fill="url(#vig)"/>
    ${grain(w, h, 0.075)}
  `
  );
}

/* ----------------------------------------------------------------- horizon */

function horizon(w, h) {
  const defs = `
    ${lin("cove2", 0, 0, 0, h, [
      [0, P.charcoal],
      [0.3, P.soot],
      [0.56, P.stone],
      [0.68, P.clay],
      [0.84, P.soot],
      [1, P.black],
    ])}
    ${rad("pool2", w * 0.5, h * 0.62, w * 0.55, [
      [0, P.ivory, 0.4],
      [0.3, P.linen, 0.18],
      [0.68, P.taupe, 0.05],
      [1, P.black, 0],
    ])}
    ${blur("bCove", 70)}
    ${vignette(w, h, 0.68)}
  `;

  return doc(
    w,
    h,
    defs,
    `
    <rect width="${w}" height="${h}" fill="url(#cove2)"/>
    <ellipse cx="${w * 0.5}" cy="${h * 0.6}" rx="${w * 0.44}" ry="${h * 0.2}"
             fill="url(#pool2)" filter="url(#bCove)"/>
    <rect y="${h * 0.598}" width="${w}" height="${h * 0.004}" fill="${P.linen}" opacity="0.2"/>
    <rect width="${w}" height="${h}" fill="url(#vig)"/>
    ${grain(w, h, 0.05)}
  `
  );
}

/* ------------------------------------------------------------------ vessel */

function vessel(w, h) {
  const cx = w * 0.5;
  const ground = h * 0.79;
  const rw = w * 0.24;

  const defs = `
    ${lin("bgV", 0, 0, 0, h, [
      [0, P.stone],
      [0.36, P.soot],
      [0.78, P.charcoal],
      [1, P.black],
    ])}
    ${lin("clayBody", cx - rw, 0, cx + rw, 0, cylinderStops(0.3))}
    ${blur("bV", 22)}
    ${vignette(w, h, 0.6)}
  `;

  // A lathed profile: narrow neck, full shoulder, tapered foot.
  const body = `M ${cx - rw * 0.34} ${h * 0.26}
                C ${cx - rw * 0.4} ${h * 0.34}, ${cx - rw} ${h * 0.42}, ${cx - rw} ${h * 0.56}
                C ${cx - rw} ${h * 0.7}, ${cx - rw * 0.66} ${ground}, ${cx - rw * 0.44} ${ground}
                L ${cx + rw * 0.44} ${ground}
                C ${cx + rw * 0.66} ${ground}, ${cx + rw} ${h * 0.7}, ${cx + rw} ${h * 0.56}
                C ${cx + rw} ${h * 0.42}, ${cx + rw * 0.4} ${h * 0.34}, ${cx + rw * 0.34} ${h * 0.26} Z`;

  return doc(
    w,
    h,
    defs,
    `
    <rect width="${w}" height="${h}" fill="url(#bgV)"/>
    <ellipse cx="${cx + rw * 0.6}" cy="${ground + h * 0.006}" rx="${rw * 1.4}" ry="${h * 0.018}"
             fill="${P.black}" opacity="0.75" filter="url(#bV)"/>
    <path d="${body}" fill="url(#clayBody)"/>
    <ellipse cx="${cx}" cy="${h * 0.26}" rx="${rw * 0.34}" ry="${h * 0.012}" fill="${P.soot}"/>
    <ellipse cx="${cx}" cy="${h * 0.259}" rx="${rw * 0.34}" ry="${h * 0.012}"
             fill="none" stroke="${P.linen}" stroke-width="2" opacity="0.55"/>
    <path d="M ${cx - rw * 0.72} ${h * 0.44} C ${cx - rw * 0.82} ${h * 0.56}, ${cx - rw * 0.6} ${h * 0.68}, ${cx - rw * 0.44} ${h * 0.74}"
          stroke="${P.ivory}" stroke-width="${w * 0.006}" fill="none" opacity="0.28" filter="url(#bV)"/>
    <rect width="${w}" height="${h}" fill="url(#vig)"/>
    ${grain(w, h, 0.06)}
  `
  );
}

/* -------------------------------------------------------------------- fold */

function fold(w, h) {
  const defs = `
    ${lin("bgF", 0, 0, w, h, [
      [0, P.black],
      [0.6, P.charcoal],
      [1, P.soot],
    ])}
    ${lin("sheet", 0, 0, w, h, [
      [0, P.soot],
      [0.26, P.clay],
      [0.44, P.cream],
      [0.52, P.ivory],
      [0.62, P.sand],
      [0.8, P.stone],
      [1, P.charcoal],
    ])}
    ${blur("bF", 34)}
    ${vignette(w, h, 0.62)}
  `;

  return doc(
    w,
    h,
    defs,
    `
    <rect width="${w}" height="${h}" fill="url(#bgF)"/>
    <path d="M ${-w * 0.1} ${h * 0.72}
             C ${w * 0.24} ${h * 0.3}, ${w * 0.4} ${h * 0.88}, ${w * 0.66} ${h * 0.42}
             C ${w * 0.82} ${h * 0.16}, ${w * 0.96} ${h * 0.36}, ${w * 1.1} ${h * 0.2}
             L ${w * 1.1} ${h * 1.1} L ${-w * 0.1} ${h * 1.1} Z"
          fill="url(#sheet)"/>
    <path d="M ${-w * 0.1} ${h * 0.72}
             C ${w * 0.24} ${h * 0.3}, ${w * 0.4} ${h * 0.88}, ${w * 0.66} ${h * 0.42}
             C ${w * 0.82} ${h * 0.16}, ${w * 0.96} ${h * 0.36}, ${w * 1.1} ${h * 0.2}"
          stroke="${P.ivory}" stroke-width="${h * 0.006}" fill="none" opacity="0.5" filter="url(#bF)"/>
    <ellipse cx="${w * 0.3}" cy="${h * 0.86}" rx="${w * 0.4}" ry="${h * 0.2}"
             fill="${P.black}" opacity="0.4" filter="url(#bF)"/>
    <rect width="${w}" height="${h}" fill="url(#vig)"/>
    ${grain(w, h, 0.07)}
  `
  );
}

/* ------------------------------------------------------------------ export */

/**
 * `ratio` is the plate's native aspect. Sizes are chosen so the longest edge is
 * around 1600px -- enough for a full-bleed section on a 2x display once the
 * page's own max-widths are taken into account, without shipping 4K files.
 */
export const PLATES = [
  { id: "atrium", label: "Atrium, morning", w: 1280, h: 1600, draw: atrium },
  { id: "veil", label: "Veil study", w: 1280, h: 1600, draw: veil },
  { id: "flacon", label: "Flacon no. 1", w: 1280, h: 1600, draw: flacon },
  { id: "colonnade", label: "Colonnade", w: 1760, h: 990, draw: colonnade },
  { id: "monolith", label: "Monolith", w: 1680, h: 1120, draw: monolith },
  { id: "stair", label: "Ascent", w: 1280, h: 1600, draw: stair },
  { id: "sphere", label: "Form study", w: 1360, h: 1360, draw: sphere },
  { id: "aperture", label: "Aperture", w: 1200, h: 1600, draw: aperture },
  { id: "horizon", label: "Cove", w: 1760, h: 990, draw: horizon },
  { id: "vessel", label: "Vessel", w: 1280, h: 1600, draw: vessel },
  { id: "fold", label: "Fold", w: 1200, h: 1600, draw: fold },
];
