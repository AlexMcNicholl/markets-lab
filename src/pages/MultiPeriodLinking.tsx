import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  buildLinkScenario,
  DEFAULT_PERIODS,
  link,
  LINK_SCENARIOS,
  matchLinkScenario,
  Period,
} from "../lib/linking";
import { pct, signed, signClass } from "../lib/format";
import { useSharedState } from "../lib/useSharedState";
import ToolPage from "../components/ToolPage";
import LinkingChart from "../components/LinkingChart";
import LinkingTable from "../components/LinkingTable";
import CopyLinkButton from "../components/CopyLinkButton";

export default function MultiPeriodLinking() {
  const [periods, setPeriods] = useSharedState<Period[]>(DEFAULT_PERIODS);
  const [linked, setLinked] = useState(true);

  const result = useMemo(() => link(periods), [periods]);
  const activeScenario = matchLinkScenario(periods);

  return (
    <ToolPage
      slug="multi-period-linking"
      actions={<CopyLinkButton />}
      lede={
        <>
          Single-period active return is arithmetic, but returns compound — so
          adding up four quarters of <em>active</em> return doesn't equal the
          year's realised active return. Pick a year below and watch the gap
          open, then let Carino's algorithm distribute it back so every quarter
          still reconciles.
        </>
      }
    >
      <div className="toolbar">
        <div className="scenario-row">
          <span className="toolbar-label">Year</span>
          {LINK_SCENARIOS.map((s) => (
            <button
              key={s.id}
              className={`preset${activeScenario === s.id ? " active" : ""}`}
              title={s.blurb}
              onClick={() => setPeriods(buildLinkScenario(s))}
            >
              {s.label}
            </button>
          ))}
        </div>
        <label className="toggle" title="Rescale each quarter with the Carino factor">
          <input
            type="checkbox"
            checked={linked}
            onChange={(e) => setLinked(e.target.checked)}
          />
          <span>Distribute residual (Carino linking)</span>
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
          <div className="k">Compounded active</div>
          <div className={`v ${signClass(result.compoundedActive)}`}>
            {pct(result.compoundedActive)}%
          </div>
        </div>
      </div>

      <div className="verdict">
        Add the four quarters up and you'd report{" "}
        <strong className={signClass(result.naiveSum)}>
          {signed(result.naiveSum, 2)}%
        </strong>{" "}
        of active return. Compound them properly and it was actually{" "}
        <strong className={signClass(result.compoundedActive)}>
          {signed(result.compoundedActive, 2)}%
        </strong>
        . The{" "}
        <strong className={signClass(result.residual)}>
          {signed(result.residual, 2)}%
        </strong>{" "}
        difference is the linking residual.
      </div>

      <div className="output" style={{ border: "1px solid var(--rule)", marginTop: 0 }}>
        <h4>Cumulative active return — naive sum vs. compounded</h4>
        <LinkingChart result={result} />
        <LinkingTable result={result} linked={linked} />
      </div>

      <div className="prose">
        <h3>How the residual gets distributed</h3>
        <p>
          The contributions need to reconcile to the compounded active return,
          not the simple sum. Carino's logarithmic algorithm rescales each
          period's arithmetic active return by a factor so the parts add back to
          the whole:
        </p>
        <div className="formula">
          k<sub>t</sub> = [ln(1 + r<sub>P,t</sub>) − ln(1 + r<sub>B,t</sub>)] /
          (r<sub>P,t</sub> − r<sub>B,t</sub>)
          <br />
          contribution<sub>t</sub> = (k<sub>t</sub> / k) × (r<sub>P,t</sub> −
          r<sub>B,t</sub>)
          <br />
          Σ contribution<sub>t</sub> = R<sub>P</sub> − R<sub>B</sub>
        </div>
        <p>
          The factor is bigger than one for periods that compound on top of
          gains and smaller for periods that compound into losses, which is why
          the residual is large in the big-swing and drawdown years and almost
          nothing in the steady one. Toggle{" "}
          <em>Distribute residual</em> above to watch the stray residual line
          collapse into the quarters. Menchero's and the GRAP method reach the
          same total by splitting it slightly differently; getting any of them
          wrong is the most common error in home-grown attribution.
        </p>
        <p>
          This is the multi-period companion to the{" "}
          <Link to="/attribution">Attribution Playground</Link> — that tool
          decomposes one period cleanly; this one is what you need the moment you
          have more than one.
        </p>
      </div>
    </ToolPage>
  );
}
