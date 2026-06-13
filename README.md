# Markets Lab

A collection of interactive tools that turn finance and markets concepts into
something you can explore directly — adjust the inputs and watch the intuition
fall out.

**Live site:** https://www.alexmcnicholl.site

## Overview

Each tool takes a single idea and makes it tangible: a focused interface, a
clear set of controls, and a visualization that responds in real time. The
underlying methodology is documented on each tool's page.

## Architecture

The project is organized as a registry-driven set of independent tools, so new
tools can be added without touching existing ones:

- **Tools** — each lives in its own page module with a self-contained interface.
- **Library** — shared computation and utilities, kept separate from the UI.
- **Components** — reusable layout and input primitives.

All inputs are synthetic or generic, public-market assumptions. Nothing here
uses or derives from any employer data, holdings, or proprietary models.

## Stack

React · TypeScript · Vite · Recharts. No backend — everything computes in the
browser, and simulations are reproducible from a fixed seed.

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
</content>
</invoke>
