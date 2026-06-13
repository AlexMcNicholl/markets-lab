import { useMemo, useState } from "react";
import { attribute, Sector } from "../lib/attribution";
import {
  buildScenario,
  DEFAULT_SECTORS,
  matchScenario,
  SCENARIOS,
} from "../lib/scenarios";
import { pct, signed, signClass } from "../lib/format";
import { useSharedState } from "../lib/useSharedState";
import ToolPage from "../components/ToolPage";
import SectorCard from "../components/SectorCard";
import EffectChart from "../components/EffectChart";
import EffectTable from "../components/EffectTable";
import MultiPeriodPanel from "../components/MultiPeriodPanel";
import CopyLinkButton from "../components/CopyLinkButton";

export default function Attribution() {
  const [sectors, setSectors, reset] = useSharedState<Sector[]>(DEFAULT_SECTORS);
  const [fold, setFold] = useState(false);

  const result = useMemo(() => attribute(sectors, fold), [sectors, fold]);
  const wpSum = sectors.reduce((s, x) => s + x.wp, 0);
  const wbSum = sectors.reduce((s, x) => s + x.wb, 0);
  const activeScenario = matchScenario(sectors);

  // Largest absolute contributor, surfaced in the card grid and the table.
  const leader = result.effects.reduce((a, b) =>
    Math.abs(b.total) > Math.abs(a.total) ? b : a,
  ).name;

  const update = (i: number, key: keyof Sector, v: number) =>
    setSectors(sectors.map((s, idx) => (idx === i ? { ...s, [key]: v } : s)));

  return (
    <ToolPage
      slug="attribution"
      actions={<CopyLinkButton />}
      lede={
        <>
          A single-period Brinson-Fachler decomposition across the eleven{" "}
          <abbr title="Global Industry Classification Standard">GICS</abbr>{" "}
          sectors. Change what the portfolio owns relative to its benchmark, and
          watch active return split into the bet on <em>where</em> to be
          (allocation) and the bet on <em>what</em> to hold within each sector
          (selection).
        </>
      }
    >
      <div className="toolbar">
        <div className="scenario-row">
          <span className="toolbar-label">Scenario</span>
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              className={`preset${activeScenario === s.id ? " active" : ""}`}
              title={s.blurb}
              onClick={() => setSectors(buildScenario(s))}
            >
              {s.label}
            </button>
          ))}
          <button className="preset ghost" onClick={reset}>
            Reset
          </button>
        </div>
        <label className="toggle" title="Roll the interaction cross-term into selection">
          <input
            type="checkbox"
            checked={fold}
            onChange={(e) => setFold(e.target.checked)}
          />
          <span>Fold interaction into selection</span>
        </label>
      </div>

      <div className="stats hero-stats">
        <div className="stat">
          <div className="k">Portfolio</div>
          <div className="v">{pct(result.Rp)}%</div>
        </div>
        <div className="stat">
          <div className="k">Benchmark</div>
          <div className="v">{pct(result.Rb)}%</div>
        </div>
        <div className="stat">
          <div className="k">Active</div>
          <div className={`v ${signClass(result.active)}`}>{pct(result.active)}%</div>
        </div>
      </div>

      <div className="verdict">
        Allocation contributed{" "}
        <strong className={signClass(result.totals.allocation)}>
          {signed(result.totals.allocation, 2)}%
        </strong>
        , selection{" "}
        <strong className={signClass(result.totals.selection)}>
          {signed(result.totals.selection, 2)}%
        </strong>
        {!fold && (
          <>
            , interaction{" "}
            <strong className={signClass(result.totals.interaction)}>
              {signed(result.totals.interaction, 2)}%
            </strong>
          </>
        )}
        . The biggest single driver is <strong>{leader}</strong>.
      </div>

      <div className="output" style={{ border: "1px solid var(--rule)", marginTop: 0 }}>
        <h4>Active return by sector</h4>
        <EffectChart result={result} foldInteraction={fold} />
        <EffectTable result={result} foldInteraction={fold} leader={leader} />
      </div>

      <div className="section-label">
        <h4>Sector inputs</h4>
        <span className="note inline">
          Portfolio weights sum to{" "}
          <span className={Math.abs(wpSum - 100) < 0.5 ? "pos" : "neg"}>
            {wpSum.toFixed(1)}%
          </span>{" "}
          · benchmark{" "}
          <span className={Math.abs(wbSum - 100) < 0.5 ? "pos" : "neg"}>
            {wbSum.toFixed(1)}%
          </span>
          . Returns are normalised by total weight, so the decomposition always
          reconciles to active return.
        </span>
      </div>

      <div className="sector-grid">
        {sectors.map((s, i) => (
          <SectorCard
            key={s.name}
            sector={s}
            effect={result.effects[i]}
            isLeader={s.name === leader}
            onChange={(key, v) => update(i, key, v)}
          />
        ))}
      </div>

      <div className="prose">
        <h3>How it's calculated</h3>
        <p>
          For each sector, the three effects come from the standard
          Brinson-Fachler identity, with the benchmark's total return as the
          hurdle that makes allocation a relative bet:
        </p>
        <div className="formula">
          allocation = (w<sub>P</sub> − w<sub>B</sub>) × (r<sub>B</sub> −
          R<sub>B</sub>)
          <br />
          selection&nbsp;&nbsp;= w<sub>B</sub> × (r<sub>P</sub> − r<sub>B</sub>)
          <br />
          interaction = (w<sub>P</sub> − w<sub>B</sub>) × (r<sub>P</sub> −
          r<sub>B</sub>)
        </div>
        <p>
          Allocation rewards overweighting sectors that beat the overall
          benchmark; selection rewards picking the right names inside a sector;
          interaction is the cross-term, and it is the one most commentaries
          quietly fold into selection — toggle <em>Fold interaction</em> above to
          see the two-factor view. Summed across sectors, the effects equal total
          active return exactly — a useful check that the decomposition is
          complete.
        </p>

        <h3>The catch nobody mentions in the pitch book</h3>
        <p>
          These effects are clean for one period. They do <em>not</em> add up
          across periods, because returns compound while attribution effects are
          arithmetic. Drag the quarterly returns below and watch the naive sum
          pull away from the compounded truth:
        </p>
      </div>

      <MultiPeriodPanel />
    </ToolPage>
  );
}
