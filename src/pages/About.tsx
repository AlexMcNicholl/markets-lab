import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="wrap tool-page">
      <Link to="/" className="back">
        ← All tools
      </Link>

      <div className="about-hero">
        <img
          src="/alex-mcnicholl.png"
          alt="Alexandre McNicholl"
          className="about-photo"
        />
        <div className="about-bio">
          <h1>Alexandre McNicholl</h1>
          <p className="about-role">
            Investment professional · Toronto · CFA Level II candidate
          </p>
          <p className="lede">
            I work across the buy-side investment process — attribution, manager
            research, and portfolio risk on multi-asset strategies. Markets Lab
            is where that work turns interactive.
          </p>
        </div>
      </div>

      <div className="prose">
        <p>
          Each tool starts from an idea I've worked through in practice or
          wanted to understand more precisely — something from attribution,
          portfolio construction, risk, or valuation that usually lives in a
          spreadsheet or a textbook. Building the interactive version of an idea
          is the fastest way I know to find out whether I actually understand it.
        </p>
        <p>
          The underlying math is documented on each page, and the code is open.
          Everything runs on synthetic examples and generic public assumptions
          only — nothing here uses or derives from any employer's data,
          holdings, or proprietary models. New tools are added as ideas become
          worth building.
        </p>
        <p className="note">
          Built with React, TypeScript, Vite, and Recharts. Source is on{" "}
          <a href="https://github.com/AlexMcNicholl/markets-lab" target="_blank" rel="noreferrer">
            GitHub
          </a>
          .
        </p>

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
