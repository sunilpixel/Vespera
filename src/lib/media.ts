/**
 * The two environment questions this site asks, in one place.
 *
 * Both were previously written out as inline `window.matchMedia(...)` calls in
 * six files, which is how the reduced-motion guard ended up phrased three
 * slightly different ways. A media query that gates whether a whole subsystem
 * runs is closer to configuration than to logic, and configuration belongs
 * somewhere it can be read once.
 *
 * Deliberately evaluated per call rather than cached: a reader can flip either
 * of these mid-session -- reduced motion from the OS, pointer type by picking up
 * a stylus or docking a laptop -- and a value captured at module load would
 * answer for a machine that no longer exists.
 */

const matches = (query: string) =>
  typeof window !== "undefined" && window.matchMedia(query).matches;

/** True when the reader has asked the OS for less movement. */
export const reduced = () => matches("(prefers-reduced-motion: reduce)");

/**
 * True for a mouse or trackpad -- something that can hover and point precisely.
 * Everything gated on this (the cursor, magnetic buttons, hover states) has no
 * meaning on touch, where it would either never fire or fire on tap.
 */
export const finePointer = () => matches("(hover: hover) and (pointer: fine)");
