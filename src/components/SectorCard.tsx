import { Sector, SectorEffect } from "../lib/attribution";
import { pct, signed, signClass } from "../lib/format";
import Slider from "./Slider";

interface SectorCardProps {
  sector: Sector;
  effect: SectorEffect;
  /** Highlight the sector contributing the most (by absolute total effect). */
  isLeader?: boolean;
  onChange: (key: keyof Sector, value: number) => void;
}

/**
 * One GICS sector's inputs: portfolio/benchmark weight and return, with the
 * active weight (wp − wb) and the sector's total effect surfaced live so the
 * bet and its payoff are visible without doing the subtraction in your head.
 */
export default function SectorCard({
  sector,
  effect,
  isLeader,
  onChange,
}: SectorCardProps) {
  const activeWeight = sector.wp - sector.wb;

  return (
    <div className={`sector-card${isLeader ? " is-leader" : ""}`}>
      <div className="sector-card-head">
        <span className="sector-name">{sector.name}</span>
        <span className="sector-badges">
          <span
            className={`active-badge ${signClass(activeWeight)}`}
            title="Active weight (portfolio − benchmark)"
          >
            {signed(activeWeight)} pts
          </span>
          <span className={`effect-badge ${signClass(effect.total)}`} title="Total effect">
            {pct(effect.total, 2)}%
          </span>
        </span>
      </div>

      <div className="sector-sliders">
        <Slider
          dense
          name="Port. weight"
          value={sector.wp}
          onChange={(v) => onChange("wp", v)}
          min={0}
          max={45}
          step={0.5}
          suffix="%"
          display={(v) => v.toFixed(1)}
        />
        <Slider
          dense
          name="Bench. weight"
          value={sector.wb}
          onChange={(v) => onChange("wb", v)}
          min={0}
          max={45}
          step={0.5}
          suffix="%"
          display={(v) => v.toFixed(1)}
        />
        <Slider
          dense
          name="Port. return"
          value={sector.rp}
          onChange={(v) => onChange("rp", v)}
          min={-15}
          max={15}
          step={0.1}
          suffix="%"
          display={(v) => v.toFixed(1)}
        />
        <Slider
          dense
          name="Bench. return"
          value={sector.rb}
          onChange={(v) => onChange("rb", v)}
          min={-15}
          max={15}
          step={0.1}
          suffix="%"
          display={(v) => v.toFixed(1)}
        />
      </div>
    </div>
  );
}
