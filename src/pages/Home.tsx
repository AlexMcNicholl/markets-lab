import { Link } from "react-router-dom";
import { TOOLS } from "../lib/registry";

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
          {TOOLS.map((t) => (
            <Link key={t.slug} to={`/${t.slug}`} className="tool-card">
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
