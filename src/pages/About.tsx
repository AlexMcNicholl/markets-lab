import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="wrap tool-page">
      <Link to="/" className="back">
        ← All tools
      </Link>
      <h1>About</h1>
      <p className="lede">
        Markets Lab is a personal project — a place where I build small, exact
        tools for the ideas I find most worth taking apart.
      </p>

      <div className="prose">
        <p>
          I'm Alexandre McNicholl, a markets and investment professional based in
          Toronto and a CFA Level II candidate. My day-to-day is the buy-side
          investment process — performance attribution, manager research, and
          portfolio risk across multi-asset strategies — and this is where I
          build the interactive tools that come out of it, in my own time.
        </p>
        <p>
          Each tool takes one idea from across the investment process — valuation
          and security selection, portfolio construction, risk, attribution — and
          turns it from something that usually lives in a textbook or a
          spreadsheet into something you can move with your hands. Building the
          interactive version of an idea is the fastest way I know to find out
          whether I actually understand it.
        </p>
        <p>
          The underlying math is documented on each page, and the code is open.
          The tools run on synthetic examples and generic, public assumptions
          only — nothing here uses or derives from any employer's data,
          holdings, or proprietary models. New tools are added as ideas become
          worth building — the ones marked "planned" on the home page are in
          active design.
        </p>

        <h3>Built with</h3>
        <p>
          React, TypeScript, and Vite, with Recharts for the visuals. The
          simulations use a seeded pseudo-random generator so results are
          reproducible. Source is on{" "}
          <a href="https://github.com/AlexMcNicholl" target="_blank" rel="noreferrer">
            GitHub
          </a>
          .
        </p>
        <div className="chips">
          {["React", "TypeScript", "Vite", "Recharts", "CFA L2 candidate"].map(
            (c) => (
              <span className="chip" key={c}>
                {c}
              </span>
            ),
          )}
        </div>

        <h3>Get in touch</h3>
        <p>
          <a href="https://www.linkedin.com/in/amcnicholl/" target="_blank" rel="noreferrer">
            LinkedIn
          </a>{" "}
          · <a href="mailto:amcnicholl02@gmail.com">amcnicholl02@gmail.com</a>{" "}
          ·{" "}
          <a href="/Alexandre_McNicholl_CV.pdf" target="_blank" rel="noreferrer">
            CV (PDF)
          </a>
        </p>
      </div>
    </div>
  );
}
