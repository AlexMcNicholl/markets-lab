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
            Capital markets professional · Toronto · CFA Level II candidate
          </p>
          <p className="lede">
            Markets Lab is a personal project, built alongside a career in
            capital markets. Each tool comes out of something worth understanding
            more precisely.
          </p>
        </div>
      </div>

      <div className="prose">
        <p>
          Each tool starts from an idea worth understanding precisely, usually
          something from attribution, portfolio construction, risk, or valuation
          that lives in a spreadsheet or a textbook. Making it interactive forces
          a level of understanding that reading about it does not.
        </p>
        <p>
          The underlying math is documented on each page and the code is open.
          Everything runs on synthetic examples and generic public assumptions
          only. Nothing here uses or derives from any employer data, holdings, or
          proprietary models.
        </p>
        <p className="note">
          Built with React, TypeScript, Vite, and Recharts, with Claude as a
          coding assistant. Source is on{" "}
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
