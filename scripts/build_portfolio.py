#!/usr/bin/env python3
"""Re-mark the Research Portfolio: turn fetched daily closes into portfolio.json.

The book's *metadata* (tickers, sectors, conviction, target weights, dated
entries, kill criteria, framework links, betas) is authored here and is the
source of truth. Prices are REAL closes pulled from the Yahoo chart endpoint
(see memory `dcf-tool-data-sourcing`): for each ticker, fetch the daily series
covering the window and save it as /tmp/px_<TICKER>.json, then run this script.

    # 1. fetch (spaced, browser UA) — example for one ticker:
    #   curl -A "<browser UA>" \
    #     "https://query1.finance.yahoo.com/v8/finance/chart/CNQ.TO?period1=<epoch>&period2=<epoch>&interval=1d" \
    #     -o /tmp/px_CNQ.TO.json
    # 2. python3 scripts/build_portfolio.py

If a ticker's real series is missing, the script falls back to a clearly-flagged
ESTIMATE for that price and stamps dataMode="estimate" on the output so a
placeholder build can never be mistaken for real marks. Re-mark monthly.

Synthetic capital, real prices. Public data only.
"""

import json
import os
from datetime import date, datetime, timedelta

NOTIONAL = 1_000_000
CASH_WEIGHT = 0.12
ASOF_FALLBACK = "2026-06-12"  # used only in estimate mode
PX_DIR = "/tmp"
OUT = os.path.join(os.path.dirname(__file__), "..", "src", "data", "portfolio.json")

# ── authored book ───────────────────────────────────────────────────────────
# entryDate is dated and never backfilled. estPrices are illustrative fallbacks
# (entry / window-start / current) used ONLY when a real series is unavailable.
POSITIONS = [
    {
        "ticker": "CNQ.TO", "name": "Canadian Natural Resources", "sector": "Energy",
        "conviction": "high", "targetWeight": 0.14, "entryDate": "2026-03-12",
        "beta": 1.15, "frameworkSlug": "dcf-sensitivity", "noteSlug": "cnq",
        "thesisOneLiner": "Best-in-class low-decline asset base; the FCF yield prices in a crude tape we think is too bearish into '27.",
        "killCriteria": [
            "WTI sustained below ~US$60 with no sign of a cost response across the sector",
            "Capital-return discipline breaks — a base-dividend cut or buyback suspension",
            "Heavy-oil (WCS) differential blows out structurally on takeaway constraints",
        ],
        "estPrices": [47.0, 45.5, 52.0],
    },
    {
        "ticker": "CSU.TO", "name": "Constellation Software", "sector": "Information Technology",
        "conviction": "high", "targetWeight": 0.13, "entryDate": "2026-02-18",
        "beta": 0.95, "frameworkSlug": "comparable-companies", "noteSlug": "csu",
        "thesisOneLiner": "A disciplined serial acquirer compounding capital in sticky vertical-market software; the reinvestment runway outlasts the trailing multiple.",
        "killCriteria": [
            "Capital deployed into acquisitions stalls for several quarters",
            "Returns on deployed capital compress toward the cost of capital",
            "Organic VMS growth turns persistently negative net of churn",
        ],
        "estPrices": [4600.0, 4450.0, 5050.0],
    },
    {
        "ticker": "RY.TO", "name": "Royal Bank of Canada", "sector": "Financials",
        "conviction": "medium", "targetWeight": 0.12, "entryDate": "2026-01-22",
        "beta": 1.05, "frameworkSlug": "comparable-companies", "noteSlug": "ry",
        "thesisOneLiner": "The franchise-quality anchor: a capital-markets and wealth mix that earns a higher ROE than the price-to-book premium it's granted.",
        "killCriteria": [
            "Provisions for credit losses spike on a Canadian consumer/housing downturn",
            "ROE premium to the Big Six average erodes",
            "CET1 capital headroom for buybacks and dividend growth disappears",
        ],
        "estPrices": [175.0, 173.0, 188.0],
    },
    {
        "ticker": "BN.TO", "name": "Brookfield Corporation", "sector": "Financials",
        "conviction": "medium", "targetWeight": 0.11, "entryDate": "2026-04-08",
        "beta": 1.25, "frameworkSlug": "dcf-sensitivity", "noteSlug": "bn",
        "thesisOneLiner": "A sum-of-the-parts discount: the market pays for the listed affiliates but little for the carry accruing in the funds.",
        "killCriteria": [
            "Fee-bearing capital growth stalls or fundraising dries up",
            "Realisations disappoint, validating the market's NAV skepticism",
            "The discount to a conservative NAV widens rather than closes over the horizon",
        ],
        "estPrices": [80.0, 76.0, 86.0],
    },
    {
        "ticker": "WSP.TO", "name": "WSP Global", "sector": "Industrials",
        "conviction": "medium", "targetWeight": 0.11, "entryDate": "2026-03-03",
        "beta": 1.10, "frameworkSlug": "dcf-sensitivity", "noteSlug": "wsp",
        "thesisOneLiner": "An engineering-consulting roll-up riding infrastructure and energy-transition spend, with a margin mix-shift the market is slow to capitalise.",
        "killCriteria": [
            "Book-to-bill falls below 1 as infrastructure budgets are cut",
            "EBITDA margin expansion from the advisory mix-shift stalls",
            "Acquisition cadence slows without offsetting organic growth",
        ],
        "estPrices": [270.0, 258.0, 295.0],
    },
    {
        "ticker": "TRP.TO", "name": "TC Energy", "sector": "Energy",
        "conviction": "medium", "targetWeight": 0.10, "entryDate": "2026-02-05",
        "beta": 0.80, "frameworkSlug": "yield-curve", "noteSlug": "trp",
        "thesisOneLiner": "The bond-proxy leg: contracted pipeline cash flows held for the yield, set to re-rate when the long end stops repricing higher.",
        "killCriteria": [
            "Long-end yields grind structurally higher, repricing the discount rate",
            "De-leveraging path slips and debt/EBITDA stays elevated",
            "A project cost overrun or regulatory ruling impairs contracted cash flow",
        ],
        "estPrices": [66.0, 64.0, 69.0],
    },
    {
        "ticker": "FNV.TO", "name": "Franco-Nevada", "sector": "Materials",
        "conviction": "low", "targetWeight": 0.09, "entryDate": "2026-04-21",
        "beta": 0.55, "frameworkSlug": "comparable-companies", "noteSlug": "fnv",
        "thesisOneLiner": "A deliberate low-conviction hedge: capital-light precious-metals optionality that's ballast against the energy and financial cyclicals.",
        "killCriteria": [
            "Gold breaks down and the diversification rationale weakens",
            "A key royalty/stream counterparty mine is impaired or halted",
            "The premium-to-miners multiple compresses without offsetting growth",
        ],
        "estPrices": [205.0, 185.0, 210.0],
    },
    {
        "ticker": "BCE.TO", "name": "BCE Inc.", "sector": "Communication Services",
        "conviction": "low", "targetWeight": 0.08, "entryDate": "2026-01-15",
        "beta": 0.70, "frameworkSlug": "credit-spreads", "noteSlug": "bce",
        "thesisOneLiner": "The honest loser: a levered, rate-sensitive incumbent bought for the yield that's gone against me — now held small, on a short leash.",
        "killCriteria": [
            "Free-cash-flow dividend coverage deteriorates further",
            "Net debt/EBITDA rises rather than falls in a higher-rate world",
            "Wireless/wireline price competition intensifies instead of rationalising",
        ],
        "estPrices": [33.0, 33.0, 29.0],
    },
]

# Published S&P/TSX Composite GICS sector weights — illustrative recent snapshot
# (sums to 100). Recognized standard, not an ad-hoc set.
TSX_WEIGHTS = {
    "Energy": 17.0, "Materials": 12.5, "Industrials": 13.2,
    "Consumer Discretionary": 3.4, "Consumer Staples": 4.0, "Health Care": 0.4,
    "Financials": 32.0, "Information Technology": 9.7,
    "Communication Services": 2.4, "Utilities": 3.5, "Real Estate": 1.9,
}
WEIGHTS_AS_OF = "2026-05-31"

# GICS sector -> iShares S&P/TSX Capped sector ETF (window return source).
# Sectors without a clean ETF fall back to the composite (sourced=False).
SECTOR_ETF = {
    "Energy": "XEG.TO", "Financials": "XFN.TO",
    "Information Technology": "XIT.TO", "Materials": "XMA.TO",
    "Utilities": "XUT.TO", "Real Estate": "XRE.TO",
}
# Estimate fallbacks for benchmark returns over the window (percent).
EST_COMPOSITE_RET = 6.5
EST_SECTOR_RET = {
    "Energy": 9.0, "Financials": 7.0, "Information Technology": 8.0,
    "Materials": 12.0, "Utilities": 2.0, "Real Estate": -1.0,
}

GICS_ORDER = [
    "Energy", "Materials", "Industrials", "Consumer Discretionary",
    "Consumer Staples", "Health Care", "Financials",
    "Information Technology", "Communication Services", "Utilities", "Real Estate",
]


def load_series(ticker):
    """Return {date_str: close} from a saved Yahoo chart JSON, or None."""
    path = os.path.join(PX_DIR, f"px_{ticker}.json")
    if not os.path.exists(path) or os.path.getsize(path) < 2000:
        return None
    try:
        with open(path) as f:
            doc = json.load(f)
        res = doc["chart"]["result"][0]
        ts = res["timestamp"]
        closes = res["indicators"]["quote"][0]["close"]
    except (KeyError, TypeError, IndexError, json.JSONDecodeError):
        return None
    out = {}
    for t, c in zip(ts, closes):
        if c is None:
            continue
        d = datetime.utcfromtimestamp(t).date().isoformat()
        out[d] = round(float(c), 2)
    return out or None


def close_on(series, target_iso):
    """Close on the target date, else the nearest trading day on/before, else on/after."""
    if target_iso in series:
        return series[target_iso]
    t = date.fromisoformat(target_iso)
    for back in range(1, 8):
        k = (t - timedelta(days=back)).isoformat()
        if k in series:
            return series[k]
    for fwd in range(1, 8):
        k = (t + timedelta(days=fwd)).isoformat()
        if k in series:
            return series[k]
    return None


def main():
    series = {p["ticker"]: load_series(p["ticker"]) for p in POSITIONS}
    real = all(series[p["ticker"]] for p in POSITIONS)
    data_mode = "real" if real else "estimate"

    inception = min(p["entryDate"] for p in POSITIONS)

    # asOf = latest date common to every real position series; else fallback.
    if real:
        asof = min(max(series[p["ticker"]]) for p in POSITIONS)
    else:
        asof = ASOF_FALLBACK

    out_positions = []
    for p in POSITIONS:
        s = series[p["ticker"]]
        if s:
            entry = close_on(s, p["entryDate"])
            window = close_on(s, inception)
            current = close_on(s, asof)
        else:
            entry, window, current = p["estPrices"]
        out_positions.append({
            "ticker": p["ticker"], "name": p["name"], "sector": p["sector"],
            "thesisOneLiner": p["thesisOneLiner"], "conviction": p["conviction"],
            "targetWeight": p["targetWeight"], "entryDate": p["entryDate"],
            "entryPrice": entry, "currentPrice": current, "windowStartPrice": window,
            "beta": p["beta"], "killCriteria": p["killCriteria"],
            "frameworkSlug": p["frameworkSlug"], "noteSlug": p["noteSlug"],
        })

    # ── benchmark ──────────────────────────────────────────────────────────
    comp_series = series.get("XIC.TO") and load_series("XIC.TO") or load_series("XIU.TO")
    if comp_series:
        cw = close_on(comp_series, inception)
        cn = close_on(comp_series, asof)
        composite_ret = round((cn / cw - 1) * 100, 2)
    else:
        composite_ret = EST_COMPOSITE_RET

    bench_sectors = []
    for sec in GICS_ORDER:
        etf = SECTOR_ETF.get(sec)
        s = load_series(etf) if etf else None
        if s:
            w0, w1 = close_on(s, inception), close_on(s, asof)
            ret = round((w1 / w0 - 1) * 100, 2)
            sourced = True
        else:
            ret = EST_SECTOR_RET.get(sec, composite_ret)
            sourced = bool(etf and real)  # an ETF exists but series missing
            if not etf:
                ret = composite_ret  # neutral proxy for sectors w/o a clean ETF
            sourced = False if not etf else sourced
        bench_sectors.append({
            "sector": sec, "weight": round(TSX_WEIGHTS[sec] / 100, 4),
            "windowReturn": ret, "sourced": sourced,
        })

    # ── equity curve (weekly mark-to-market) ───────────────────────────────
    curve = build_curve(out_positions, series, inception, asof)

    book = {
        "_comment": "Generated by scripts/build_portfolio.py. Synthetic capital, real prices (public data). Re-mark monthly.",
        "dataMode": data_mode,
        "asOf": asof,
        "inception": inception,
        "notionalCapital": NOTIONAL,
        "cashWeight": CASH_WEIGHT,
        "remarkCadence": "monthly",
        "benchmark": {
            "name": "S&P/TSX Composite",
            "weightsAsOf": WEIGHTS_AS_OF,
            "windowReturn": composite_ret,
            "source": {
                "label": "S&P/TSX Composite — S&P Dow Jones Indices",
                "href": "https://www.spglobal.com/spdji/en/indices/equity/sp-tsx-composite-index/",
            },
            "sectors": bench_sectors,
        },
        "positions": out_positions,
        "equityCurve": curve,
    }

    with open(OUT, "w") as f:
        json.dump(book, f, indent=2)
        f.write("\n")

    # summary
    print(f"dataMode = {data_mode}; asOf = {asof}; inception = {inception}")
    tot = sum(_mv(p) for p in out_positions) + CASH_WEIGHT * NOTIONAL
    print(f"book return = {(tot / NOTIONAL - 1) * 100:+.2f}%  (benchmark {composite_ret:+.2f}%)")
    for p in out_positions:
        r = (p["currentPrice"] / p["entryPrice"] - 1) * 100
        flag = "  <-- DOWN" if r < 0 else ""
        print(f"  {p['ticker']:8s} entry {p['entryPrice']:>9.2f}  mark {p['currentPrice']:>9.2f}  {r:+6.1f}%{flag}")


def _mv(p):
    cost = p["targetWeight"] * NOTIONAL
    return cost / p["entryPrice"] * p["currentPrice"]


def build_curve(positions, series, inception, asof):
    """Weekly marked-to-market book equity, inception -> asOf.

    Real mode marks each held name on its actual close; before a name's entry its
    committed capital sits in cash (curve starts at notional). Estimate mode
    linearly interpolates each name between its entry and current price.
    """
    start = date.fromisoformat(inception)
    end = date.fromisoformat(asof)
    cash = CASH_WEIGHT * NOTIONAL
    points = []
    d = start
    while d <= end:
        di = d.isoformat()
        eq = cash
        for p in positions:
            cost = p["targetWeight"] * NOTIONAL
            shares = cost / p["entryPrice"]
            entry_d = date.fromisoformat(p["entryDate"])
            if d < entry_d:
                eq += cost  # uninvested, held as cash at par
                continue
            s = series.get(p["ticker"])
            if s:
                px = close_on(s, di) or p["currentPrice"]
            else:
                # linear interpolation entry -> current
                span = (end - entry_d).days or 1
                frac = (d - entry_d).days / span
                px = p["entryPrice"] + (p["currentPrice"] - p["entryPrice"]) * frac
            eq += shares * px
        points.append({"date": di, "value": round(eq)})
        d += timedelta(days=7)
    if points and points[-1]["date"] != asof:
        # ensure the final point is exactly asOf
        eq = cash
        for p in positions:
            cost = p["targetWeight"] * NOTIONAL
            eq += cost / p["entryPrice"] * p["currentPrice"]
        points.append({"date": asof, "value": round(eq)})
    return points


if __name__ == "__main__":
    main()
