import { AttributionResult, Sector } from "../lib/attribution";
import { pct, signed, signClass } from "../lib/format";

interface EffectTableProps {
  result: AttributionResult;
  /** Sectors driving the result, used to surface each sector's active weight. */
  sectors: Sector[];
  foldInteraction: boolean;
  /** Sector name to highlight as the largest absolute contributor. */
  leader?: string;
}

/**
 * Per-sector table that ties each bet to its payoff: the active weight
 * (portfolio − benchmark) alongside the Brinson-Fachler effects, reconciling to
 * total active return. The interaction column drops out when effects are folded
 * into the two-factor (allocation + selection) convention.
 */
export default function EffectTable({
  result,
  sectors,
  foldInteraction,
  leader,
}: EffectTableProps) {
  const activeWeight = Object.fromEntries(
    sectors.map((s) => [s.name, s.wp - s.wb]),
  );

  return (
    <table className="data" style={{ marginTop: 18 }}>
      <thead>
        <tr>
          <th>Sector</th>
          <th className="num">Active wt</th>
          <th className="num">Allocation</th>
          <th className="num">Selection</th>
          {!foldInteraction && <th className="num">Interaction</th>}
          <th className="num">Total</th>
        </tr>
      </thead>
      <tbody>
        {result.effects.map((e) => {
          const aw = activeWeight[e.name] ?? 0;
          return (
            <tr key={e.name} className={e.name === leader ? "is-leader" : undefined}>
              <td>{e.name}</td>
              <td className={`num ${signClass(aw)}`}>
                {Math.abs(aw) < 0.05 ? "—" : `${signed(aw)} pts`}
              </td>
              <td className={`num ${signClass(e.allocation)}`}>{pct(e.allocation, 3)}</td>
              <td className={`num ${signClass(e.selection)}`}>{pct(e.selection, 3)}</td>
              {!foldInteraction && (
                <td className={`num ${signClass(e.interaction)}`}>
                  {pct(e.interaction, 3)}
                </td>
              )}
              <td className={`num ${signClass(e.total)}`}>{pct(e.total, 3)}</td>
            </tr>
          );
        })}
        <tr className="total">
          <td>Total</td>
          <td className="num">—</td>
          <td className={`num ${signClass(result.totals.allocation)}`}>
            {pct(result.totals.allocation, 3)}
          </td>
          <td className={`num ${signClass(result.totals.selection)}`}>
            {pct(result.totals.selection, 3)}
          </td>
          {!foldInteraction && (
            <td className={`num ${signClass(result.totals.interaction)}`}>
              {pct(result.totals.interaction, 3)}
            </td>
          )}
          <td className={`num ${signClass(result.active)}`}>{pct(result.active, 3)}</td>
        </tr>
      </tbody>
    </table>
  );
}
