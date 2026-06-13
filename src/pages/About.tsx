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
          I'm Alexandre McNicholl, based in Toronto, and a CFA Level II
          candidate. This is where I put the interactive tools I build in my own
          time — each one an attempt to take an idea that usually lives in a
          textbook or a spreadsheet and turn it into something you can move with
          your hands.
        </p>
        <p>
          The underlying math is documented on each page, and the code is open.
          The tools run on synthetic examples and generic, public assumptions
          only — nothing here uses or derives from any employer's data,
          holdings, or proprietary models. It exists purely to explore ideas and
          to keep my own tooling sharp.
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
          · <a href="mailto:amcnicholl02@gmail.com">amcnicholl02@gmail.com</a>
        </p>
      </div>
    </div>
  );
}
