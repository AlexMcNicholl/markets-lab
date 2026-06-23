// Brinson-Fachler single-period attribution.
//
// For each sector i with portfolio weight wp, benchmark weight wb,
// portfolio return rp and benchmark return rb (all in percent):
//
//   allocation_i  = (wp_i - wb_i) * (rb_i - Rb)
//   selection_i   =  wb_i        * (rp_i - rb_i)
//   interaction_i = (wp_i - wb_i) * (rp_i - rb_i)
//
// where Rb is the total benchmark return. The three effects summed across
// all sectors equal total active return (Rp - Rb) exactly.

export interface Sector {
  name: string;
  wp: number; // portfolio weight, %
  wb: number; // benchmark weight, %
  rp: number; // portfolio return in sector, %
  rb: number; // benchmark return in sector, %
}

export interface SectorEffect {
  name: string;
  allocation: number;
  selection: number;
  interaction: number;
  total: number;
}

export interface AttributionResult {
  Rp: number; // total portfolio return, %
  Rb: number; // total benchmark return, %
  active: number; // Rp - Rb
  effects: SectorEffect[];
  totals: {
    allocation: number;
    selection: number;
    interaction: number;
  };
}

/**
 * Single-period Brinson-Fachler decomposition.
 *
 * Weights need not sum to 100: portfolio and benchmark returns are each
 * normalised by their own total weight, so the effects stay coherent while a
 * user drags sliders. When `foldInteraction` is true the cross-term is rolled
 * into selection (interaction reported as zero) - the two-factor convention
 * many manager commentaries quietly use.
 */
export function attribute(
  sectors: Sector[],
  foldInteraction = false,
): AttributionResult {
  const wpSum = sectors.reduce((s, x) => s + x.wp, 0) / 100;
  const wbSum = sectors.reduce((s, x) => s + x.wb, 0) / 100;

  const Rp =
    sectors.reduce((s, x) => s + (x.wp / 100) * x.rp, 0) / (wpSum || 1);
  const Rb =
    sectors.reduce((s, x) => s + (x.wb / 100) * x.rb, 0) / (wbSum || 1);

  let aT = 0;
  let sT = 0;
  let iT = 0;

  const effects: SectorEffect[] = sectors.map((x) => {
    const dw = (x.wp - x.wb) / 100;
    const allocation = dw * (x.rb - Rb);
    let selection = (x.wb / 100) * (x.rp - x.rb);
    let interaction = dw * (x.rp - x.rb);
    if (foldInteraction) {
      selection += interaction;
      interaction = 0;
    }
    aT += allocation;
    sT += selection;
    iT += interaction;
    return {
      name: x.name,
      allocation,
      selection,
      interaction,
      total: allocation + selection + interaction,
    };
  });

  return {
    Rp,
    Rb,
    active: Rp - Rb,
    effects,
    totals: { allocation: aT, selection: sT, interaction: iT },
  };
}
