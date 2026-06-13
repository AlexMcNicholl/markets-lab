import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CATEGORIES,
  CATEGORY_BLURBS,
  Category,
  TOOLS,
  ToolMeta,
  toolIndex,
} from "../lib/registry";
import { useInView } from "../lib/useInView";
import ToolPreview from "../components/ToolPreview";

type Filter = Category | "All";

export default function Home() {
  const [filter, setFilter] = useState<Filter>("All");

  // Domains that actually have projects, in registry order.
  const activeCategories = CATEGORIES.filter((c) =>
    TOOLS.some((t) => t.category === c),
  );
  const count = (c: Filter) =>
    c === "All" ? TOOLS.length : TOOLS.filter((t) => t.category === c).length;

  const shownCategories =
    filter === "All" ? activeCategories : activeCategories.filter((c) => c === filter);

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

        <div className="filter" role="tablist" aria-label="Filter projects by domain">
          <FilterPill
            label="All"
            count={count("All")}
            active={filter === "All"}
            onClick={() => setFilter("All")}
          />
          {activeCategories.map((c) => (
            <FilterPill
              key={c}
              label={c}
              count={count(c)}
              active={filter === c}
              onClick={() => setFilter(c)}
            />
          ))}
        </div>

        {shownCategories.map((c) => (
          <DomainSection
            key={c}
            category={c}
            tools={TOOLS.filter((t) => t.category === c)}
          />
        ))}
      </div>
    </>
  );
}

function DomainSection({
  category,
  tools,
}: {
  category: Category;
  tools: ToolMeta[];
}) {
  const grid = useInView<HTMLDivElement>();
  return (
    <section className="domain">
      <div className="domain-head">
        <h3 id={`domain-${category}`}>{category}</h3>
        <span className="domain-desc">{CATEGORY_BLURBS[category]}</span>
        <span className="domain-count num">{tools.length}</span>
      </div>
      <div ref={grid.ref} className={`tools${grid.inView ? " is-visible" : ""}`}>
        {tools.map((t, i) => (
          <ToolCard key={t.slug} tool={t} index={i} />
        ))}
      </div>
    </section>
  );
}

function ToolCard({ tool, index }: { tool: ToolMeta; index: number }) {
  const planned = tool.status === "planned";
  return (
    <Link
      to={`/${tool.slug}`}
      className={`tool-card${planned ? " is-planned" : ""}`}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="preview-band">
        <ToolPreview slug={tool.slug} />
      </div>
      <div className="card-body">
        <div className="card-meta">
          <span className="idx">{toolIndex(tool.slug)}</span>
          <span className={`status-pill ${planned ? "planned" : "live"}`}>
            {planned ? "Planned" : "Live"}
          </span>
        </div>
        <h3>{tool.title}</h3>
        <p>{tool.blurb}</p>
        <div className="card-foot">
          <span className="takeaway">{tool.takeaway}</span>
          <span className="open" aria-hidden="true">
            {planned ? "Preview →" : "Open →"}
          </span>
        </div>
      </div>
    </Link>
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
