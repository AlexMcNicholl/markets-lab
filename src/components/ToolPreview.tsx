// Hand-drawn inline-SVG thumbnails for the home-page tool cards. Each hints at
// the kind of output its tool produces. Drawn by hand (no charting library) so
// they cost nothing at load and animate in via CSS — see the .mp-* rules and
// the .tools.is-visible triggers in styles.css.

const INK = "#1f4a5c";
const SOFT = "#2f6b80";
const GOLD = "#b08433";
const RULE = "#d2ccbe";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg
      className="preview"
      viewBox="0 0 140 72"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function AttributionPreview() {
  const bars = [
    { h: 30, fill: INK },
    { h: 17, fill: SOFT },
    { h: 42, fill: GOLD },
    { h: 24, fill: INK },
    { h: 36, fill: SOFT },
    { h: 13, fill: INK },
  ];
  return (
    <Frame>
      <line x1="10" y1="60" x2="132" y2="60" stroke={RULE} strokeWidth="1" />
      {bars.map((b, i) => (
        <rect
          key={i}
          className="mp-bar"
          x={14 + i * 20}
          y={60 - b.h}
          width="12"
          height={b.h}
          rx="1.5"
          fill={b.fill}
          style={{ animationDelay: `${i * 55}ms` }}
        />
      ))}
    </Frame>
  );
}

function ManagerLuckPreview() {
  const heights = [8, 16, 26, 38, 46, 38, 26, 16, 8];
  return (
    <Frame>
      <line x1="8" y1="60" x2="132" y2="60" stroke={RULE} strokeWidth="1" />
      {heights.map((h, i) => (
        <rect
          key={i}
          className="mp-bar"
          x={11 + i * 14}
          y={60 - h}
          width="9"
          height={h}
          rx="1"
          fill={i === 4 ? GOLD : i === 3 || i === 5 ? SOFT : INK}
          style={{ animationDelay: `${i * 40}ms` }}
        />
      ))}
    </Frame>
  );
}

function YieldCurvePreview() {
  const pts = [
    [10, 56],
    [34, 45],
    [58, 35],
    [82, 27],
    [106, 20],
    [130, 15],
  ];
  return (
    <Frame>
      {/* Straight dashed line: the "parallel shift" mental model the tool argues against. */}
      <line
        x1="10"
        y1="56"
        x2="130"
        y2="15"
        stroke={RULE}
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <path
        className="mp-line"
        pathLength={1}
        d="M10 56 C 34 50 44 40 58 35 S 100 20 130 15"
        fill="none"
        stroke={INK}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pts.map(([x, y], i) => (
        <circle
          key={i}
          className="mp-dot"
          cx={x}
          cy={y}
          r="2.4"
          fill={i === pts.length - 1 ? GOLD : INK}
          style={{ animationDelay: `${500 + i * 50}ms` }}
        />
      ))}
    </Frame>
  );
}

export default function ToolPreview({ slug }: { slug: string }) {
  switch (slug) {
    case "attribution":
      return <AttributionPreview />;
    case "manager-luck":
      return <ManagerLuckPreview />;
    case "yield-curve":
      return <YieldCurvePreview />;
    default:
      return null;
  }
}
