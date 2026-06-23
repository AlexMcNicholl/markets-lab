// Comparable company analysis ("trading comps").
//
// A company is valued by applying a peer group's EV/EBITDA multiple to its own
// EBITDA, then bridging from enterprise value to an implied share price:
//
//   implied EV       = multiple · EBITDA
//   implied equity   = implied EV − net debt
//   implied price    = implied equity / shares outstanding
//
// The "multiple" is a central-tendency statistic (median or mean) of the chosen
// peers. The whole argument of a comps analysis is which names go in the set:
// the target's financials never change, but moving peers in and out swings the
// statistic - and the price - by more than any single model assumption.
//
// All figures are synthetic but plausible: one mid-cap target and a universe of
// eight illustrative peers spanning a realistic multiple range. Not any real
// company, index, or product.

export interface Target {
  ebitda: number; // $M, last-twelve-months
  netDebt: number; // $M (total debt − cash)
  shares: number; // M shares outstanding
}

// One synthetic mid-cap target. Net debt and share count are fixed; only the
// peer set (and the statistic) move, so every change in price is attributable
// to the comp set alone.
export const TARGET: Target = { ebitda: 400, netDebt: 600, shares: 120 };

export interface Peer {
  id: string;
  name: string;
  short: string; // compact label for the chart axis
  /** Why this name does or doesn't belong - the judgement call behind the bet. */
  note: string;
  evEbitda: number; // EV/EBITDA multiple, x
}

// The peer universe, spanning a wide multiple range so set selection bites.
export const PEERS: Peer[] = [
  { id: "vertex", name: "Vertex Global", short: "Vertex", evEbitda: 22.0,
    note: "Hyper-growth, and several times the target's scale - a stretch." },
  { id: "apex", name: "Apex Systems", short: "Apex", evEbitda: 18.0,
    note: "High-growth pure play - the closest fast-growing comp." },
  { id: "meridian", name: "Meridian Software", short: "Meridian", evEbitda: 16.5,
    note: "Pure play, similar size and end-market." },
  { id: "northwind", name: "Northwind Tech", short: "Northwind", evEbitda: 15.0,
    note: "Pure play, maturing growth - a clean comparable." },
  { id: "cascade", name: "Cascade Digital", short: "Cascade", evEbitda: 14.0,
    note: "Pure play, similar margins to the target." },
  { id: "granite", name: "Granite Industrial", short: "Granite", evEbitda: 9.0,
    note: "Adjacent end-market, slower growth - arguably not a peer." },
  { id: "harbor", name: "Harbor Holdings", short: "Harbor", evEbitda: 8.0,
    note: "Diversified conglomerate - a different business mix entirely." },
  { id: "summit", name: "Summit Legacy", short: "Summit", evEbitda: 7.0,
    note: "Mature, low-growth - drags the set toward a value multiple." },
];

export interface CompSet {
  id: string;
  label: string;
  blurb: string;
  peerIds: string[];
}

// Five defensible-but-different ways to draw the peer line. Each tells a story a
// banker or a skeptic might genuinely argue for.
export const COMP_SETS: CompSet[] = [
  {
    id: "pure-play",
    label: "Pure-play peers",
    blurb: "The four closest pure plays - similar business, size, and growth.",
    peerIds: ["apex", "meridian", "northwind", "cascade"],
  },
  {
    id: "broad",
    label: "Broad sector",
    blurb: "Everything in the sector, including adjacent and outsized names. The naive screen.",
    peerIds: ["vertex", "apex", "meridian", "northwind", "cascade", "granite", "harbor", "summit"],
  },
  {
    id: "premium",
    label: "Premium set",
    blurb: "The sell-side's favourite: keep only the dearest, fastest growers.",
    peerIds: ["vertex", "apex", "meridian"],
  },
  {
    id: "skeptic",
    label: "Skeptic's set",
    blurb: "Anchor on the cheap, mature names to argue the stock is expensive.",
    peerIds: ["summit", "harbor", "granite"],
  },
  {
    id: "consensus",
    label: "Consensus screen",
    blurb: "Pure plays plus one adjacent name; drop the outliers at both ends.",
    peerIds: ["apex", "meridian", "northwind", "cascade", "granite"],
  },
];

export const DEFAULT_SET_ID = COMP_SETS[0].id;

export type Stat = "median" | "mean";
export const DEFAULT_STAT: Stat = "median";

export function getPeer(id: string): Peer {
  return PEERS.find((p) => p.id === id) ?? PEERS[0];
}

export function getCompSet(id: string): CompSet {
  return COMP_SETS.find((s) => s.id === id) ?? COMP_SETS[0];
}

/** Share price the target would carry at a given EV/EBITDA multiple. */
export function priceFromMultiple(m: number, t: Target = TARGET): number {
  return (m * t.ebitda - t.netDebt) / t.shares;
}

function median(xs: number[]): number {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function mean(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}

/** The applied multiple for a set of multiples under the chosen statistic. */
function applyStat(xs: number[], stat: Stat): number {
  return stat === "median" ? median(xs) : mean(xs);
}

export interface PeerRow {
  peer: Peer;
  /** Price the target would carry if the whole set looked like this one name. */
  impliedPrice: number;
  /** Sits at (or, for an even median, straddles) the applied statistic. */
  isAnchor: boolean;
}

export interface CompResult {
  stat: Stat;
  multiple: number; // applied EV/EBITDA
  impliedEV: number; // $M
  impliedEquity: number; // $M
  impliedPrice: number; // $
  rows: PeerRow[]; // peers, sorted richest-first
  /** Lowest and highest implied price across all comp sets, at this statistic. */
  rangeLow: number;
  rangeHigh: number;
}

/** Value the target off one comp set, and bound the price across all sets. */
export function valueComps(setId: string, stat: Stat): CompResult {
  const set = getCompSet(setId);
  const peers = set.peerIds.map(getPeer);
  const mults = peers.map((p) => p.evEbitda);
  const multiple = applyStat(mults, stat);

  // Anchor = the peer(s) nearest the applied multiple - for an even-count median
  // that's the two names straddling it, the ones literally setting the value.
  const dists = mults.map((m) => Math.abs(m - multiple));
  const minDist = Math.min(...dists);

  const rows: PeerRow[] = peers
    .map((peer) => ({
      peer,
      impliedPrice: priceFromMultiple(peer.evEbitda),
      isAnchor: Math.abs(peer.evEbitda - multiple) - minDist < 1e-9,
    }))
    .sort((a, b) => b.peer.evEbitda - a.peer.evEbitda);

  const impliedEV = multiple * TARGET.ebitda;
  const impliedEquity = impliedEV - TARGET.netDebt;
  const impliedPrice = impliedEquity / TARGET.shares;

  const allPrices = COMP_SETS.map((s) =>
    priceFromMultiple(applyStat(s.peerIds.map((id) => getPeer(id).evEbitda), stat)),
  );

  return {
    stat,
    multiple,
    impliedEV,
    impliedEquity,
    impliedPrice,
    rows,
    rangeLow: Math.min(...allPrices),
    rangeHigh: Math.max(...allPrices),
  };
}
