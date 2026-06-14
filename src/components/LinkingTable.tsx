import { LinkResult } from "../lib/linking";
import { pct, signClass } from "../lib/format";

interface LinkingTableProps {
  result: LinkResult;
  /** When true, show the Carino factor + distribute the residual into periods. */
  linked: boolean;
}

/**
 * Per-period reconciliation: each quarter's raw arithmetic active return (the
 * bet) next to its contribution to the compounded active return (the payoff).
 * With linking off the contribution is just the arithmetic figure and the
 * residual sits in its own row; with linking on the Carino factor rescales each
 * period so the contributions sum to the compounded active return exactly.
 */
export default function LinkingTable({ result, linked }: LinkingTableProps) {
  return (
    <table className="data" style={{ marginTop: 18 }}>
      <thead>
        <tr>
          <th>Period</th>
          <th className="num">Portfolio</th>
          <th className="num">Benchmark</th>
          <th className="num">Active (rp−rb)</th>
          {linked && <th className="num">Carino ×</th>}
          <th className="num">Contribution</th>
        </tr>
      </thead>
      <tbody>
        {result.periods.map((p) => {
          const contribution = linked ? p.linked : p.arithmetic;
          return (
            <tr key={p.label}>
              <td>{p.label}</td>
              <td className={`num ${signClass(p.rp)}`}>{pct(p.rp)}</td>
              <td className={`num ${signClass(p.rb)}`}>{pct(p.rb)}</td>
              <td className={`num ${signClass(p.arithmetic)}`}>
                {pct(p.arithmetic, 3)}
              </td>
              {linked && <td className="num">{p.factor.toFixed(3)}</td>}
              <td className={`num ${signClass(contribution)}`}>
                {pct(contribution, 3)}
              </td>
            </tr>
          );
        })}

        {/* Sum of the contribution column as shown. */}
        <tr className={linked ? "total" : undefined}>
          <td>Sum of quarters</td>
          <td className="num">—</td>
          <td className="num">—</td>
          <td className={`num ${signClass(result.naiveSum)}`}>
            {pct(result.naiveSum, 3)}
          </td>
          {linked && <td className="num">—</td>}
          <td className={`num ${signClass(linked ? result.linkedSum : result.naiveSum)}`}>
            {pct(linked ? result.linkedSum : result.naiveSum, 3)}
          </td>
        </tr>

        {/* With linking off, the residual is exposed as its own line and added
            back to reconcile; with linking on it has been distributed already. */}
        {!linked && (
          <>
            <tr className="is-leader">
              <td>+ Linking residual</td>
              <td className="num">—</td>
              <td className="num">—</td>
              <td className="num">—</td>
              <td className={`num ${signClass(result.residual)}`}>
                {pct(result.residual, 3)}
              </td>
            </tr>
            <tr className="total">
              <td>= Compounded active</td>
              <td className="num">—</td>
              <td className="num">—</td>
              <td className="num">—</td>
              <td className={`num ${signClass(result.compoundedActive)}`}>
                {pct(result.compoundedActive, 3)}
              </td>
            </tr>
          </>
        )}
      </tbody>
    </table>
  );
}
