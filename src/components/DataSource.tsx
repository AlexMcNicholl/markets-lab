import { ReactNode } from "react";

// A collapsible "show me the data" panel, closed by default, that every tool
// can drop in beside its output. The goal across the site is the same one
// Central-Bank Tone makes inline: nothing is hidden in a black box. A tool's
// numbers are either pulled from a real, citable source or they're illustrative
// — and which one it is gets stated plainly, never blurred. `provenance` is
// required for exactly that reason: no tool can render this panel without
// declaring where its inputs come from.

interface DataSourceProps {
  /**
   * Whether the inputs are pulled from a real, citable source or are
   * synthetic/illustrative. Drives the chip label so the distinction is never
   * ambiguous — the honesty about it is the point.
   */
  kind: "sourced" | "illustrative";
  /** One honest line (or short block) on where the numbers come from. */
  provenance: ReactNode;
  /** Optional citation link, rendered after the provenance line. */
  source?: { label: string; href: string };
  /** Optional raw-input table, formula, or any further detail. */
  children?: ReactNode;
  /** Summary label; defaults to "Data & sources". */
  summary?: string;
}

export default function DataSource({
  kind,
  provenance,
  source,
  children,
  summary = "Data & sources",
}: DataSourceProps) {
  return (
    <details className="datasource">
      <summary>
        <span className="datasource-marker" aria-hidden="true" />
        {summary}
        <span className={`datasource-chip ${kind}`}>
          {kind === "sourced" ? "Sourced" : "Illustrative"}
        </span>
      </summary>
      <div className="datasource-body">
        <p className="datasource-prov">
          {provenance}
          {source ? (
            <>
              {" "}
              <a href={source.href} target="_blank" rel="noopener noreferrer">
                {source.label} ↗
              </a>
            </>
          ) : null}
        </p>
        {children}
      </div>
    </details>
  );
}
