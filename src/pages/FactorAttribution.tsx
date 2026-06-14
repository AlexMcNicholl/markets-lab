import { useMemo } from "react";
import {
  analyze,
  DEFAULT_MANAGER,
  getManager,
  MANAGERS,
  WINDOW,
  YEARS,
} from "../lib/factor";
import { pct, signed, signClass } from "../lib/format";
import { useSharedState } from "../lib/useSharedState";
import ToolPage from "../components/ToolPage";
import FactorBetaChart from "../components/FactorBetaChart";
import CopyLinkButton from "../components/CopyLinkButton";

interface State {
  manager: string;
}

const DEFAULT_STATE: State = { manager: DEFAULT_MANAGER };

export default function FactorAttribution() {
  const [state, setState] = useSharedState<State>(DEFAULT_STATE);
  const manager = getManager(state.manager);

  const a = useMemo(() => analyze(manager), [manager]);

  // The defining move: a large, persistent swing in any one loading.
  const driftMag = a.topDrift.driftEnd - a.topDrift.driftStart;
  const bigDrift = Math.abs(driftMag) >= 0.5;
  const alphaShare = a.totalReturn !== 0 ? a.alpha / a.totalReturn : 0;

  return (
    <ToolPage
      slug="factor-attribution"
      actions={<CopyLinkButton />}
      lede={
        <>
          A four-year track record run through rolling {WINDOW}-month regressions
          on four standard factors — market, rates, credit, and momentum. Pick a
          manager below and watch their return split into the part you could have
          bought as <em>exposure</em> and the part left over as{" "}
          <em>alpha</em> — then check whether the exposures held still or quietly
          drifted.
        </>
      }
    >
      <div className="toolbar">
        <div className="scenario-row">
          <span className="toolbar-label">Manager</span>
          {MANAGERS.map((m) => (
            <button
              key={m.id}
              className={`preset${manager.id === m.id ? " active" : ""}`}
              title={m.blurb}
              onClick={() => setState({ manager: m.id })}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="stats hero-stats">
        <div className="stat">
          <div className="k">Return / yr</div>
          <div className={`v ${signClass(a.totalReturn)}`}>{pct(a.totalReturn)}%</div>
        </div>
        <div className="stat">
          <div className="k">Factor-driven</div>
          <div className={`v ${signClass(a.explained)}`}>{pct(a.explained)}%</div>
        </div>
        <div className="stat">
          <div className="k">Alpha</div>
          <div className={`v ${signClass(a.alpha)}`}>{signed(a.alpha, 2)}%</div>
        </div>
      </div>

      <div className="verdict">
        This four-year record returned{" "}
        <strong className={signClass(a.totalReturn)}>{pct(a.totalReturn)}%</strong>{" "}
        a year. The factor model pins{" "}
        <strong className={signClass(a.explained)}>{pct(a.explained)}%</strong> of
        that on exposure — most of all <strong>{a.topFactor.factor}</strong> (
        {signed(a.topFactor.contribution, 1)}%/yr) — leaving{" "}
        <strong className={signClass(a.alpha)}>{signed(a.alpha, 1)}%</strong> as
        alpha.{" "}
        {bigDrift ? (
          <>
            Its <strong>{a.topDrift.factor}</strong> loading swung from{" "}
            {pct(a.topDrift.driftStart, 2)} to {pct(a.topDrift.driftEnd, 2)} across
            the window — the risk that built the record isn't the risk it runs now.
          </>
        ) : alphaShare >= 0.35 ? (
          <>Strip the exposures and most of the return survives — the rare record where the alpha, not the factor bets, does the work.</>
        ) : (
          <>Strip the exposures and little is left — the return is the factor bets, not skill.</>
        )}
      </div>

      <div className="output" style={{ border: "1px solid var(--rule)", marginTop: 0 }}>
        <h4>Rolling {WINDOW}-month factor betas</h4>
        <FactorBetaChart windows={a.windows} />

        <h4 style={{ marginTop: 28 }}>Return decomposition (annualized)</h4>
        <table className="data" style={{ marginTop: 14 }}>
          <thead>
            <tr>
              <th>Factor</th>
              <th className="num">Loading β</th>
              <th className="num">Window drift</th>
              <th className="num">Factor return</th>
              <th className="num">Contribution</th>
            </tr>
          </thead>
          <tbody>
            {a.contributions.map((c) => (
              <tr
                key={c.factor}
                className={c.factor === a.topFactor.factor ? "is-leader" : undefined}
              >
                <td>{c.factor}</td>
                <td className="num">{pct(c.beta, 2)}</td>
                <td className="num">
                  {pct(c.driftStart, 2)} → {pct(c.driftEnd, 2)}
                </td>
                <td className={`num ${signClass(c.factorReturn)}`}>
                  {pct(c.factorReturn, 1)}%
                </td>
                <td className={`num ${signClass(c.contribution)}`}>
                  {pct(c.contribution, 2)}%
                </td>
              </tr>
            ))}
            <tr>
              <td>Alpha (unexplained)</td>
              <td className="num">—</td>
              <td className="num">—</td>
              <td className="num">—</td>
              <td className={`num ${signClass(a.alpha)}`}>{signed(a.alpha, 2)}%</td>
            </tr>
            <tr className="total">
              <td>Total return</td>
              <td className="num">—</td>
              <td className="num">—</td>
              <td className="num">—</td>
              <td className={`num ${signClass(a.totalReturn)}`}>
                {pct(a.totalReturn, 2)}%
              </td>
            </tr>
          </tbody>
        </table>
        <p className="note">
          Each contribution is the full-period loading × that factor's realized
          return; the four contributions plus alpha reconcile to the total return
          exactly. The factor model explains{" "}
          <strong>{Math.round(a.r2 * 100)}%</strong> of the month-to-month
          variance.
        </p>
      </div>

      <div className="prose">
        <h3>How it's estimated</h3>
        <p>
          Each manager's monthly return is regressed on the four factor returns by
          ordinary least squares, with an intercept that captures whatever the
          factors miss:
        </p>
        <div className="formula">
          r<sub>t</sub> = α + β<sub>mkt</sub>·MKT<sub>t</sub> + β<sub>rates</sub>·RATES
          <sub>t</sub> + β<sub>cr</sub>·CREDIT<sub>t</sub> + β<sub>mom</sub>·MOM
          <sub>t</sub> + ε<sub>t</sub>
        </div>
        <p>
          The betas are the loadings — how much of each factor the manager is
          really holding — and the intercept, annualized, is the alpha. Because
          OLS forces the residuals to sum to zero, each loading times its factor's
          realized return adds up, with alpha, to the manager's return exactly: a
          clean bet-to-payoff reconciliation. The same regression run on a rolling{" "}
          {WINDOW}-month window is what the chart plots.
        </p>

        <h3>Why one number isn't enough</h3>
        <p>
          A single full-period regression gives you the <em>average</em> loading,
          and an average can hide a manager who started in one book and ended in
          another. A market beta that climbs from 0.3 to 1.1, or a momentum
          loading that flips sign, averages out to something unremarkable — yet the
          risk you'd be underwriting today is nothing like the risk that built the
          record. The rolling view is how you catch style drift before it catches
          you, and it's why diligence looks at the path of the loadings, not just
          their average. The factors here are illustrative and the managers
          synthetic; on a real book you'd run the same decomposition against a
          published factor library over {YEARS}-plus years of monthly returns.
        </p>
      </div>
    </ToolPage>
  );
}
