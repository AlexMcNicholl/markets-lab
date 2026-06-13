import { Link } from "react-router-dom";

const tools = [
  {
    to: "/attribution",
    idx: "01",
    title: "Attribution Playground",
    blurb:
      "Move portfolio and benchmark weights and watch Brinson-Fachler allocation, selection, and interaction effects update live — then see why single-period effects don't sum across periods.",
    takeaway: "Where active return actually comes from.",
  },
  {
    to: "/manager-luck",
    idx: "02",
    title: "Skill vs. Luck",
    blurb:
      "Simulate a universe of managers with the skill you dial in, then read the leaderboard. Even with zero skill, someone beats the index five years running.",
    takeaway: "How long a track record has to be to mean anything.",
  },
  {
    to: "/yield-curve",
    idx: "03",
    title: "Yield Curve Sandbox",
    blurb:
      "Reshape the Canada curve with steepener, flattener, and butterfly presets and reprice a bond portfolio through its key-rate durations.",
    takeaway: "Why where you sit on the curve is the whole trade.",
  },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="wrap">
          <div className="eyebrow label">Markets Lab</div>
          <h1>Interactive tools for ideas worth taking apart.</h1>
          <p>
            A set of small, hand-built tools — each one made to take a single
            idea and turn it into something you can move with your hands. Drag
            something, and watch the intuition fall out.
          </p>
          <div className="meta">
            <span>Alexandre McNicholl · Toronto</span>
            <a href="https://www.linkedin.com/in/amcnicholl/" target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a href="https://github.com/AlexMcNicholl/markets-lab" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <Link to="/about">About</Link>
          </div>
        </div>
      </section>

      <div className="wrap">
        <div className="section-head">
          <h2>Projects</h2>
        </div>
        <div className="tools">
          {tools.map((t) => (
            <Link key={t.to} to={t.to} className="tool-card">
              <span className="idx">{t.idx}</span>
              <h3>{t.title}</h3>
              <p>{t.blurb}</p>
              <span className="takeaway">{t.takeaway}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
