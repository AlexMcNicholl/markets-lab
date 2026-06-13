import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="wrap tool-page">
      <Link to="/" className="back">
        ← All tools
      </Link>
      <h1>About this project</h1>
      <p className="lede">
        Markets Lab is a personal project — a place to build small, exact tools
        for the parts of portfolio management I find most interesting.
      </p>

      <div className="prose">
        <p>
          I'm Alexandre McNicholl, an investment professional in Toronto working
          in portfolio oversight, performance attribution, and manager due
          diligence. I'm a CFA Level II candidate, having passed Level I.
        </p>
        <p>
          Each tool here is meant to do one thing: take an idea that usually
          lives in a textbook or a spreadsheet and make it something you can
          move with your hands. The attribution decomposition, the
          skill-versus-luck simulation, and the curve repricing are all built
          from scratch — the underlying math is documented on each page, and the
          code is open.
        </p>
        <p>
          Everything here runs on synthetic examples and public, generic market
          assumptions. Nothing on this site uses, references, or derives from any
          employer's data, holdings, or proprietary models. It exists purely to
          explore ideas and to keep my own tooling sharp.
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

        <h3>Get in touch</h3>
        <p>
          <a href="https://www.linkedin.com/in/amcnicholl/" target="_blank" rel="noreferrer">
            LinkedIn
          </a>{" "}
          · <a href="mailto:amcnicholl02@gmail.com">amcnicholl02@gmail.com</a>
        </p>
      </div>
    </div>
  );
}
