interface SliderProps {
  name: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  display?: (v: number) => string;
  onChange: (v: number) => void;
}

export default function Slider({
  name,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  display,
  onChange,
}: SliderProps) {
  return (
    <div className="control">
      <div className="row">
        <span className="name">{name}</span>
        <span className="val">
          {display ? display(value) : value}
          {suffix}
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
