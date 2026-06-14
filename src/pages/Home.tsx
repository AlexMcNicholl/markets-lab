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
          <h1>Alexandre McNicholl</h1>
          <p className="positioning">
            Markets and investment professional in Toronto, working across the
            buy-side investment process. CFA Level II candidate.
          </p>
          <p>
            Markets Lab is where I build small, focused tools — each one takes a
            single idea from across the investment process, from valuation and
            portfolio construction to attribution and risk, and turns it into
            something you can work through by hand.
          </p>
          <div className="meta">
            <span>Toronto, Canada</span>
            <a href="https://www.linkedin.com/in/amcnicholl/" target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a href="https://github.com/AlexMcNicholl/markets-lab" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href="/Alexandre_McNicholl_CV.pdf" target="_blank" rel="noreferrer">
              CV
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
  // Live tools lead each domain; planned stubs follow, so a skim lands on real
  // work first. Registry order is otherwise preserved within each group.
  const ordered = [...tools].sort(
    (a, b) =>
      (a.status === "live" ? 0 : 1) - (b.status === "live" ? 0 : 1),
  );
  return (
    <section className="domain">
      <div className="domain-head">
        <h3 id={`domain-${category}`}>{category}</h3>
        <span className="domain-desc">{CATEGORY_BLURBS[category]}</span>
        <span className="domain-count num">{tools.length}</span>
      </div>
      <div ref={grid.ref} className={`tools${grid.inView ? " is-visible" : ""}`}>
        {ordered.map((t, i) => (
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
      style={{ animationDelay: `${index * 55}ms` }}
    >
      <div className="card-top">
        <span className="idx">{toolIndex(tool.slug)}</span>
        <span className={`status-pill ${planned ? "planned" : "live"}`}>
          {planned ? "Planned" : "Live"}
        </span>
      </div>
      <h3>{tool.title}</h3>
      <p className="takeaway">{tool.takeaway}</p>
      <span className="open" aria-hidden="true">
        {planned ? "Coming soon" : "Open →"}
      </span>
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
