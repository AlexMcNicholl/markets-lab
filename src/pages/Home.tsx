import { useState } from "react";
import { Link } from "react-router-dom";
import { CATEGORIES, Category, TOOLS, toolIndex } from "../lib/registry";
import { useInView } from "../lib/useInView";
import ToolPreview from "../components/ToolPreview";

type Filter = Category | "All";

export default function Home() {
  const grid = useInView<HTMLDivElement>();
  const [filter, setFilter] = useState<Filter>("All");

  // Categories that actually have tools, in registry order.
  const activeCategories = CATEGORIES.filter((c) =>
    TOOLS.some((t) => t.category === c),
  );
  const counts = (c: Filter) =>
    c === "All" ? TOOLS.length : TOOLS.filter((t) => t.category === c).length;

  const shown =
    filter === "All" ? TOOLS : TOOLS.filter((t) => t.category === filter);

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
          <span className="count num">{TOOLS.length}</span>
        </div>

        {activeCategories.length > 1 && (
          <div className="filter" role="tablist" aria-label="Filter projects by area">
            <FilterPill
              label="All"
              count={counts("All")}
              active={filter === "All"}
              onClick={() => setFilter("All")}
            />
            {activeCategories.map((c) => (
              <FilterPill
                key={c}
                label={c}
                count={counts(c)}
                active={filter === c}
                onClick={() => setFilter(c)}
              />
            ))}
          </div>
        )}

        <div
          ref={grid.ref}
          className={`tools${grid.inView ? " is-visible" : ""}`}
        >
          {shown.map((t, i) => (
            <Link
              key={t.slug}
              to={`/${t.slug}`}
              className="tool-card"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className="preview-band">
                <ToolPreview slug={t.slug} />
              </div>
              <div className="card-body">
                <div className="card-meta">
                  <span className="idx">{toolIndex(t.slug)}</span>
                  <span className="cat-tag">{t.category}</span>
                </div>
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

function FilterPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`filter-pill${active ? " active" : ""}`}
      onClick={onClick}
      role="tab"
      aria-selected={active}
    >
      {label}
      <span className="n">{count}</span>
    </button>
  );
}
