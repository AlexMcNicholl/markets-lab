import { Link } from "react-router-dom";
import ToolPage from "./ToolPage";
import { getTool, TOOLS } from "../lib/registry";

/**
 * Stub page for a project that's on the build list but not interactive yet.
 * Planned registry entries route here (see main.tsx); it reuses the ToolPage
 * chrome so a planned project still has a real, described destination.
 */
export default function ComingSoon({ slug }: { slug: string }) {
  const tool = getTool(slug);
  const liveInDomain = tool
    ? TOOLS.filter(
        (t) => t.category === tool.category && t.status === "live",
      )
    : [];

  return (
    <ToolPage
      slug={slug}
      actions={<span className="status-pill planned">Planned</span>}
      lede={tool?.blurb ?? "This project is on the build list."}
    >
      <div className="callout cs-callout">
        <strong>In design.</strong> {tool?.blurb} The underlying method will be
        documented on the page the way the live tools are.
      </div>

      <div className="prose">
        {liveInDomain.length > 0 ? (
          <p>
            While this one is in progress, the live tool in{" "}
            <strong>{tool?.category}</strong> is{" "}
            {liveInDomain.map((t, i) => (
              <span key={t.slug}>
                {i > 0 ? ", " : ""}
                <Link to={`/${t.slug}`}>{t.title}</Link>
              </span>
            ))}
            .
          </p>
        ) : (
          <p>
            Other tools are already live —{" "}
            <Link to="/">browse the full set</Link>.
          </p>
        )}
        <div className="cs-actions">
          <Link className="preset" to="/">
            ← All projects
          </Link>
          <a
            className="preset"
            href="https://github.com/AlexMcNicholl/markets-lab"
            target="_blank"
            rel="noreferrer"
          >
            Source on GitHub
          </a>
        </div>
      </div>
    </ToolPage>
  );
}
