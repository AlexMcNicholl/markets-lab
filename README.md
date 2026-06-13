# Markets Lab

Interactive tools for portfolio attribution, manager selection, and fixed
income — built to make a handful of portfolio-management ideas tangible rather
than to explain them in prose.

**Live site:** https://markets-lab-sand.vercel.app

## Tools

| Tool | Idea it makes tangible |
| --- | --- |
| **Attribution Playground** | Brinson-Fachler decomposition of active return into allocation, selection, and interaction — and why single-period effects don't sum across periods (Carino linking). |
| **Skill vs. Luck** | A Monte Carlo universe of managers showing how much of a track record is noise, and how long a record must be to distinguish skill from chance. |
| **Yield Curve Sandbox** | Repricing a bond book through key-rate durations under steepener / flattener / butterfly moves, instead of a single parallel-shift duration number. |

## Methodology

The finance is documented inline on each tool page and in the source under
[`src/lib`](src/lib):

- `attribution.ts` — Brinson-Fachler effects and a multi-period linking check.
- `stats.ts` — seeded PRNG, Box-Muller normals, and the information-ratio
  significance arithmetic (`years = (z / IR)²`).
- `bonds.ts` — first-order key-rate-duration repricing (`ΔP/P ≈ −Σ KRD·Δy`).

All inputs are synthetic or generic public-market assumptions. Nothing here
uses or derives from any employer data, holdings, or proprietary models.

## Stack

React · TypeScript · Vite · Recharts. No backend — everything computes in the
browser, so the simulations are reproducible from a fixed seed.

## Develop

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check + production build to dist/
npm run preview  # serve the production build
```

## Deploy

Hosted on Vercel as a static build. Vercel auto-detects Vite; `vercel.json`
rewrites all routes to `index.html` so client-side routing works on refresh.

---

Built by [Alexandre McNicholl](https://www.linkedin.com/in/amcnicholl/) ·
Toronto. Not investment advice.
