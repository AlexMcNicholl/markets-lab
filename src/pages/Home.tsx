import { Link } from "react-router-dom";
import { TOOLS } from "../lib/registry";
import { useInView } from "../lib/useInView";
import ToolPreview from "../components/ToolPreview";

export default function Home() {
  const grid = useInView<HTMLDivElement>();

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
          <span className="hr" />
        </div>
        <div
          ref={grid.ref}
          className={`tools${grid.inView ? " is-visible" : ""}`}
        >
          {TOOLS.map((t, i) => (
            <Link
              key={t.slug}
              to={`/${t.slug}`}
              className="tool-card"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <div className="preview-band">
                <ToolPreview slug={t.slug} />
              </div>
              <div className="card-body">
                <span className="idx">{t.idx}</span>
                <h3>{t.title}</h3>
                <p>{t.blurb}</p>
                <div className="card-foot">
                  <span className="takeaway">{t.takeaway}</span>
                  <span className="open" aria-hidden="true">
                    Open →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
