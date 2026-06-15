import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import bookData from "../data/portfolio.json";
import {
  Book,
  derivePositions,
  CONVICTION_LABEL,
  SECTOR_SHORT,
} from "../lib/portfolio";
import { getNote } from "../lib/notes";
import { getTool } from "../lib/registry";
import { signed, signClass } from "../lib/format";

const book = bookData as unknown as Book;
const usd2 = (n: number) => `$${n.toFixed(2)}`;
const fmtDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function ResearchNote() {
  const { slug = "" } = useParams();
  const note = getNote(slug);
  const pos = derivePositions(book).find((p) => p.noteSlug === slug);

  useEffect(() => {
    const t = note ? `${note.ticker} — Research note` : "Research note";
    document.title = `${t} · Markets Lab`;
    return () => {
      document.title = "Markets Lab";
    };
  }, [note]);

  if (!note || !pos) {
    return (
      <div className="wrap tool-page">
        <div className="tool-page-top">
          <Link to="/research-portfolio" className="back">
            ← Research Portfolio
          </Link>
        </div>
        <h1>Note not found</h1>
        <p className="lede">
          No research note matches "{slug}". Back to the{" "}
          <Link to="/research-portfolio">cockpit</Link>.
        </p>
      </div>
    );
  }

  const tool = getTool(note.frameworkSlug);

  return (
    <div className="wrap tool-page rp-note">
      <div className="tool-page-top">
        <Link to="/research-portfolio" className="back">
          ← Research Portfolio
        </Link>
        <span className="rp-badge">model · illustrative</span>
      </div>

      <div className="rp-note-eyebrow label">
        Research note · {SECTOR_SHORT[pos.sector]} · entered{" "}
        {fmtDate(pos.entryDate)}
      </div>
      <h1>
        <span className="num rp-note-tkr">{note.ticker}</span> {note.name}
      </h1>
      <p className="lede">"{pos.thesisOneLiner}"</p>

      {note.stub && (
        <div className="rp-note-stub">
          Structured note — thesis and variables in brief. The full write-up
          (CNQ is the worked template) follows this same skeleton.
        </div>
      )}

      {/* snapshot */}
      <div className="rp-note-snap">
        <div>
          <div className="k">Conviction</div>
          <div className="v">{CONVICTION_LABEL[pos.conviction]}</div>
        </div>
        <div>
          <div className="k">Weight</div>
          <div className="v num">{(pos.currentWeight * 100).toFixed(1)}%</div>
        </div>
        <div>
          <div className="k">Entry</div>
          <div className="v num">{usd2(pos.entryPrice)}</div>
        </div>
        <div>
          <div className="k">Mark</div>
          <div className="v num">{usd2(pos.currentPrice)}</div>
        </div>
        <div>
          <div className="k">Since entry</div>
          <div className={`v num ${signClass(pos.returnSinceEntry)}`}>
            {signed(pos.returnSinceEntry * 100)}%
          </div>
        </div>
      </div>

      <div className="prose rp-note-body">
        <h3>Thesis</h3>
        {note.thesis}

        <h3>Key variables</h3>
        <p className="rp-note-subtle">
          The handful of things the view actually rides on — what I'd watch to
          know if it's working.
        </p>
        <ul className="rp-note-vars">
          {note.keyVariables.map((v, i) => (
            <li key={i}>
              <span className="rp-var-label">{v.label}</span>
              <span className="rp-var-detail">{v.detail}</span>
            </li>
          ))}
        </ul>

        <h3>Valuation</h3>
        {note.valuation}
        <p>
          <Link to={`/${note.frameworkSlug}`} className="rp-note-toollink">
            Open the {tool?.title ?? note.frameworkLabel} ▸
          </Link>
        </p>

        <h3>What would change my mind</h3>
        <p className="rp-note-subtle">
          The sell rule, written down in advance. This is the senior part of the
          note — a position without a kill condition is just a hope.
        </p>
        <ul className="rp-note-kill">
          {pos.killCriteria.map((k, i) => (
            <li key={i}>{k}</li>
          ))}
        </ul>

        <div className="callout">
          <strong>Illustrative.</strong> A model position on a public name, held
          in a synthetic-capital book. Public data only — not investment advice,
          a recommendation, or a price target.
        </div>
      </div>

      <div className="rp-note-nav">
        <Link to="/research-portfolio" className="preset">
          ← Back to the cockpit
        </Link>
      </div>
    </div>
  );
}
