import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  valueComps,
  COMP_SETS,
  DEFAULT_SET_ID,
  DEFAULT_STAT,
  getCompSet,
  Stat,
  TARGET,
} from "../lib/comps";
import { useSharedState } from "../lib/useSharedState";
import ToolPage from "../components/ToolPage";
import CompChart, { COMP_COLORS } from "../components/CompChart";
import CopyLinkButton from "../components/CopyLinkButton";

const usd = (v: number) => `$${v.toFixed(2)}`;
const usd0 = (v: number) => `$${v.toFixed(0)}`;
const mult = (v: number) => `${v.toFixed(1)}×`;
const bn = (v: number) => `$${(v / 1000).toFixed(1)}bn`;

export default function ComparableCompanies() {
  const [setId, setSetId] = useSharedState<string>(DEFAULT_SET_ID);
  const [stat, setStat] = useState<Stat>(DEFAULT_STAT);

  const result = useMemo(() => valueComps(setId, stat), [setId, stat]);
  const set = getCompSet(setId);
  const swing = result.rangeHigh / result.rangeLow;

  return (
    <ToolPage
      slug="comparable-companies"
      actions={<CopyLinkButton />}
      lede={
        <>
          Value a company by what its peers trade at: apply the comp set's{" "}
          EV/EBITDA multiple to the target's own EBITDA, then bridge to an implied
          share price. The financials never change here - only{" "}
          <em>which names</em> you call peers. Pick a comp set below and watch the
          implied price move on judgement alone.
        </>
      }
    >
      <div className="toolbar">
        <div className="scenario-row">
          <span className="toolbar-label">Comp set</span>
          {COMP_SETS.map((s) => (
            <button
              key={s.id}
              className={`preset${setId === s.id ? " active" : ""}`}
              title={s.blurb}
              onClick={() => setSetId(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <label className="toggle" title="Use the mean instead of the median multiple">
          <input
            type="checkbox"
            checked={stat === "mean"}
            onChange={(e) => setStat(e.target.checked ? "mean" : "median")}
          />
          <span>Use mean instead of median</span>
        </label>
      </div>

      <div className="stats hero-stats">
        <div className="stat">
          <div className="k">Implied price</div>
          <div className="v">{usd(result.impliedPrice)}</div>
        </div>
        <div className="stat">
          <div className="k">Applied EV/EBITDA</div>
          <div className="v">{mult(result.multiple)}</div>
        </div>
        <div className="stat">
          <div className="k">Range across all sets</div>
          <div className="v">
            {usd0(result.rangeLow)} – {usd0(result.rangeHigh)}
          </div>
        </div>
      </div>

      <div className="verdict">
        Valued off the <strong>{result.stat}</strong> EV/EBITDA of the{" "}
        <strong>{set.label.toLowerCase()}</strong> ({mult(result.multiple)}), the
        target is worth <strong>{usd(result.impliedPrice)}</strong> a share. Swap
        the peer group and the same financials imply anywhere from{" "}
        <strong>{usd(result.rangeLow)}</strong> to{" "}
        <strong>{usd(result.rangeHigh)}</strong> - a {swing.toFixed(1)}× range, on
        numbers that never moved.
      </div>

      <div className="output" style={{ border: "1px solid var(--rule)", marginTop: 0 }}>
        <h4>
          What each peer implies for the target - dashed line is the {result.stat}{" "}
          we apply ({usd(result.impliedPrice)})
        </h4>
        <CompChart result={result} />

        <table className="data" style={{ marginTop: 18 }}>
          <thead>
            <tr>
              <th>Peer</th>
              <th>Why it's in the set</th>
              <th className="num">EV/EBITDA</th>
              <th className="num">Implied price</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.map((r) => (
              <tr
                key={r.peer.id}
                className={r.isAnchor ? "is-leader" : undefined}
              >
                <td>
                  <span
                    style={{
                      display: "inline-block",
                      width: 9,
                      height: 9,
                      marginRight: 8,
                      borderRadius: 2,
                      background: r.isAnchor ? COMP_COLORS.anchor : COMP_COLORS.bar,
                      verticalAlign: "baseline",
                    }}
                  />
                  {r.peer.name}
                </td>
                <td>{r.peer.note}</td>
                <td className="num">{mult(r.peer.evEbitda)}</td>
                <td className="num">{usd(r.impliedPrice)}</td>
              </tr>
            ))}
            <tr className="total">
              <td>Comp-set {result.stat}</td>
              <td>Applied to the target's EBITDA</td>
              <td className="num">{mult(result.multiple)}</td>
              <td className="num">{usd(result.impliedPrice)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="prose">
        <h3>How it's calculated</h3>
        <p>
          The target carries {bn(TARGET.ebitda)} of LTM EBITDA, {bn(TARGET.netDebt)}{" "}
          of net debt and {TARGET.shares}M shares. Take the comp set's{" "}
          {result.stat} EV/EBITDA, apply it to that EBITDA, and bridge from
          enterprise value down to the equity:
        </p>
        <div className="formula">
          implied EV&nbsp;&nbsp;&nbsp;= multiple × EBITDA
          <br />
          implied equity = implied EV − net debt
          <br />
          implied price&nbsp;= implied equity ÷ shares
        </div>
        <p>
          Highlighted in gold are the <em>anchor</em> peers - the names sitting at
          the median, which literally set the multiple. With the median, names at
          the extremes barely matter; with the mean, a single richly-valued outlier
          can drag the whole valuation up. Toggle{" "}
          <em>Use mean instead of median</em> to see how much the choice of
          statistic alone moves the answer.
        </p>

        <h3>Why the comp set is the whole argument</h3>
        <p>
          A discounted-cash-flow model gets the scrutiny - endless debate over the
          discount rate and terminal growth - but in a comps analysis the real
          assumption is buried in the peer list. Move between the presets above:
          the <em>premium set</em> and the <em>skeptic's set</em> value identical
          financials more than two-to-one apart, a spread no single DCF input comes
          close to. That is why the first question to ask of any comp-based
          valuation is not what multiple they used, but who they decided to call a
          peer - and, just as quietly, who they left out.
        </p>
        <p>
          The intrinsic-value counterpart is the{" "}
          <Link to="/dcf-sensitivity">DCF Sensitivity Explorer</Link> - a
          ten-year model on real companies where a half-point move in WACC or
          terminal growth moves the answer by as much as swapping the comp set
          does here.
        </p>
      </div>
    </ToolPage>
  );
}
