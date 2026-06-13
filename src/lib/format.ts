// Shared number formatting for tool pages. A true minus sign (−) reads better
// than a hyphen in tabular figures.

export const pct = (v: number, d = 2) =>
  `${v >= 0 ? "" : "−"}${Math.abs(v).toFixed(d)}`;

export const signClass = (v: number) => (v >= 0 ? "pos" : "neg");

/** Signed percentage-points, e.g. +3.0 / −4.0, for active-weight badges. */
export const signed = (v: number, d = 1) =>
  `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(d)}`;
