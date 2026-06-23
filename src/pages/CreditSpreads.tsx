import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  decompose,
  getProfile,
  PROFILES,
  DEFAULT_PROFILE_ID,
} from "../lib/credit";
import { useSharedState } from "../lib/useSharedState";
import ToolPage from "../components/ToolPage";
import SpreadChart, { SPREAD_COLORS } from "../components/SpreadChart";
import CopyLinkButton from "../components/CopyLinkButton";

const PCT = (v: number, d = 2) => v.toFixed(d);
const BPS = (v: number) => Math.round(v);

export default function CreditSpreads() {
  const [profileId, setProfileId] = useSharedState<string>(DEFAULT_PROFILE_ID);
  const [showRiskFree, setShowRiskFree] = useState(true);

  const profile = getProfile(profileId);
  const result = useMemo(() => decompose(profile), [profile]);

  // The largest spread slice drives the verdict; expected-loss share is always
  // called out because that gap is the whole point of the tool.
  const leader = result.components.reduce((a, b) => (b.bps > a.bps ? b : a));
  const el = result.components.find((c) => c.key === "el")!;

  return (
    <ToolPage
      slug="credit-spreads"
      actions={<CopyLinkButton />}
      lede={
        <>
          A corporate bond's yield is the risk-free rate plus a <em>credit
          spread</em> - but that spread is not all about default. Pick a bond
          below and watch the spread split into what you'd statistically lose
          (expected loss), what you're paid to bear that risk (risk premium), and
          what you're paid for not being able to sell (liquidity).
        </>
      }
    >
      <div className="toolbar">
        <div className="scenario-row">
          <span className="toolbar-label">Bond</span>
          {PROFILES.map((p) => (
            <button
              key={p.id}
              className={`preset${profileId === p.id ? " active" : ""}`}
              title={p.blurb}
              onClick={() => setProfileId(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <label className="toggle" title="Stack the risk-free rate into the bar">
          <input
            type="checkbox"
            checked={showRiskFree}
            onChange={(e) => setShowRiskFree(e.target.checked)}
          />
          <span>Show risk-free base</span>
        </label>
      </div>

      <div className="stats hero-stats">
        <div className="stat">
          <div className="k">Total yield</div>
          <div className="v">{PCT(result.totalYield)}%</div>
        </div>
        <div className="stat">
          <div className="k">Risk-free</div>
          <div className="v">{PCT(result.riskFree)}%</div>
        </div>
        <div className="stat">
          <div className="k">Credit spread</div>
          <div className="v">{BPS(result.creditSpreadBps)} bps</div>
        </div>
      </div>

      <div className="verdict">
        On this <strong>{profile.rating}</strong> bond yielding{" "}
        <strong>{PCT(result.totalYield)}%</strong>, the{" "}
        <strong>{BPS(result.creditSpreadBps)} bps</strong> credit spread is led by{" "}
        <strong>{leader.label.toLowerCase()}</strong>. Only{" "}
        <strong>{BPS(el.bps)} bps</strong> ({Math.round(el.shareOfSpread * 100)}%)
        actually covers expected default loss - the rest is the price of risk and
        illiquidity.
      </div>

      <div className="output" style={{ border: "1px solid var(--rule)", marginTop: 0 }}>
        <h4>{showRiskFree ? "Yield build-up" : "Spread build-up"}</h4>
        <SpreadChart result={result} showRiskFree={showRiskFree} />

        <table className="data" style={{ marginTop: 18 }}>
          <thead>
            <tr>
              <th>Spread component</th>
              <th>What you're paid for</th>
              <th className="num">Yield</th>
              <th className="num">% of spread</th>
            </tr>
          </thead>
          <tbody>
            {result.components.map((c) => (
              <tr key={c.key} className={c.key === leader.key ? "is-leader" : undefined}>
                <td>
                  <span
                    style={{
                      display: "inline-block",
                      width: 9,
                      height: 9,
                      marginRight: 8,
                      borderRadius: 2,
                      background: SPREAD_COLORS[c.key],
                      verticalAlign: "baseline",
                    }}
                  />
                  {c.label}
                </td>
                <td>{c.compensates}</td>
                <td className="num">{BPS(c.bps)} bps</td>
                <td className="num">{Math.round(c.shareOfSpread * 100)}%</td>
              </tr>
            ))}
            <tr className="total">
              <td>Credit spread</td>
              <td>Total over the risk-free rate</td>
              <td className="num">{BPS(result.creditSpreadBps)} bps</td>
              <td className="num">100%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="prose">
        <h3>How it's decomposed</h3>
        <p>
          Start from the actuarial loss. If a bond defaults with annual
          probability <code>PD</code> and you lose a fraction <code>LGD</code> of
          face when it does, the yield you need just to break even on losses is:
        </p>
        <div className="formula">
          expected loss = PD × LGD
          <br />
          risk premium&nbsp; = (mult − 1) × expected loss
          <br />
          credit spread = expected loss + risk premium + liquidity
        </div>
        <p>
          The catch is that the market charges far more than the expected loss.
          The <em>default risk premium</em> (<code>mult</code>) is the ratio of
          the risk-neutral default intensity the market prices to the real-world
          one - investors demand several times the actuarial loss to bear default
          risk they can't diversify away. Whatever spread is still unexplained is
          attributed to <em>liquidity</em>: the discount for holding a bond you
          may not be able to sell in size without moving the price.
        </p>

        <h3>The credit-spread puzzle</h3>
        <p>
          For investment-grade names, realised default losses are tiny - a few
          basis points a year - yet spreads run to many tens or hundreds of basis
          points. Toggle between the high-grade and crisis presets: the spread can
          triple without the chance of default moving much at all. Most of what a
          high-grade bond pays is compensation for risk and illiquidity, not for
          losses you actually expect to take. That gap is why credit can be a
          good trade in calm markets and a brutal one when liquidity disappears —
          the premium you were earning was the warning, not a free lunch.
        </p>
        <p>
          The risk-free layer beneath the spread is the{" "}
          <Link to="/yield-curve">Yield Curve Sandbox</Link>. To see how a
          spread-widening shock hits a whole portfolio alongside other risk
          factors, see the{" "}
          <Link to="/stress-tester">Portfolio Stress Tester</Link>.
        </p>
      </div>
    </ToolPage>
  );
}
