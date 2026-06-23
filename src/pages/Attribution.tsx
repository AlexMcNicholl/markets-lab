import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
import EffectChart from "../components/EffectChart";
import EffectTable from "../components/EffectTable";
import CopyLinkButton from "../components/CopyLinkButton";

export default function Attribution() {
  const [sectors, setSectors] = useSharedState<Sector[]>(DEFAULT_SECTORS);
  const [fold, setFold] = useState(false);

  const result = useMemo(() => attribute(sectors, fold), [sectors, fold]);
  const activeScenario = matchScenario(sectors);

  // Largest absolute contributor, highlighted in the chart's table.
  const leader = result.effects.reduce((a, b) =>
    Math.abs(b.total) > Math.abs(a.total) ? b : a,
  ).name;

  return (
    <ToolPage
      slug="attribution"
      actions={<CopyLinkButton />}
      lede={
        <>
          A single-period Brinson-Fachler decomposition across the eleven{" "}
          <abbr title="Global Industry Classification Standard">GICS</abbr>{" "}
          sectors. Pick a positioning below and watch active return split into the
          bet on <em>where</em> to be (allocation) and the bet on <em>what</em> to
          hold within each sector (selection).
        </>
      }
    >
      <div className="toolbar">
        <div className="scenario-row">
          <span className="toolbar-label">Positioning</span>
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
        <EffectTable
          result={result}
          sectors={sectors}
          foldInteraction={fold}
          leader={leader}
        />
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
          quietly fold into selection - toggle <em>Fold interaction</em> above to
          see the two-factor view. Summed across sectors, the effects equal total
          active return exactly - a useful check that the decomposition is
          complete.
        </p>

        <h3>The catch nobody mentions in the pitch book</h3>
        <p>
          These effects are clean for one period, but they do <em>not</em> add up
          across periods - returns compound while attribution effects are
          arithmetic. So four quarters of active return won't sum to the realised
          annual active return; the gap is the linking residual. Linking
          algorithms - Carino, Menchero, GRAP - distribute exactly that residual
          back onto each period's effects so a multi-period attribution still
          reconciles to performance. Getting it wrong is the most common error in
          home-grown attribution.
        </p>
        <p>
          The multi-period version of this problem is worked through directly in
          the{" "}
          <Link to="/multi-period-linking">Multi-Period Linking</Link> tool —
          that one shows the residual opening up and Carino's algorithm closing
          it.
        </p>
      </div>
    </ToolPage>
  );
}
