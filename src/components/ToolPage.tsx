import { ReactNode, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTool } from "../lib/registry";

interface ToolPageProps {
  /** Registry slug; supplies the page title and document title. */
  slug: string;
  /** Intro paragraph (rich text allowed). */
  lede: ReactNode;
  /** Optional controls rendered top-right, e.g. a Copy-link button. */
  actions?: ReactNode;
  children: ReactNode;
}

/**
 * Shared chrome for every tool page: the back link, the title (pulled from the
 * registry so it can't drift from the nav/home card), the lede, and an actions
 * slot. New tools get consistent headers for free.
 */
export default function ToolPage({ slug, lede, actions, children }: ToolPageProps) {
  const tool = getTool(slug);

  useEffect(() => {
    const base = "Markets Lab";
    document.title = tool ? `${tool.title} · ${base}` : base;
    return () => {
      document.title = base;
    };
  }, [tool]);

  return (
    <div className="wrap tool-page">
      <div className="tool-page-top">
        <Link to="/" className="back">
          ← All tools
        </Link>
        {actions && <div className="tool-actions">{actions}</div>}
      </div>
      <h1>{tool?.title ?? "Tool"}</h1>
      <p className="lede">{lede}</p>
      {children}
    </div>
  );
}
