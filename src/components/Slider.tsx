import { ReactNode } from "react";

interface SliderProps {
  name: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  /** Custom formatting for the displayed value. */
  display?: (v: number) => string;
  /** Extra node shown after the value, e.g. a delta-from-base badge. */
  meta?: ReactNode;
  /** Tighter vertical spacing for long stacks of sliders. */
  dense?: boolean;
  onChange: (v: number) => void;
}

/**
 * The single range-input control used across every tool. Tools previously each
 * re-implemented this; keep new tools on this component so the look stays
 * consistent and improvements land everywhere at once.
 */
export default function Slider({
  name,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  display,
  meta,
  dense = false,
  onChange,
}: SliderProps) {
  return (
    <div className={`control${dense ? " dense" : ""}`}>
      <div className="row">
        <span className="name">{name}</span>
        <span className="val">
          {display ? display(value) : value}
          {suffix}
          {meta}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}
