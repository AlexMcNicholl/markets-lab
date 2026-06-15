import { NavLink, Outlet, Link } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";

export default function Layout() {
  return (
    <>
      <header className="site-header">
        <div className="wrap">
          <Link to="/" className="brand">
            Alexandre&nbsp;McNicholl <span>Markets&nbsp;Lab</span>
          </Link>
          <nav className="nav">
            <NavLink to="/" end>
              Projects
            </NavLink>
            <NavLink to="/research-portfolio">Portfolio</NavLink>
            <NavLink to="/about">About</NavLink>
            <a
              href="https://www.linkedin.com/in/amcnicholl/"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
            <a href="/Alexandre_McNicholl_CV.pdf" target="_blank" rel="noreferrer">
              CV
            </a>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="wrap">
          <span>
            Built by Alexandre McNicholl · Toronto · {new Date().getFullYear()}
          </span>
          <span>
            Public data and synthetic examples only. Not investment advice.{" "}
            ·{" "}
            <a href="/Alexandre_McNicholl_CV.pdf" target="_blank" rel="noreferrer">
              CV
            </a>
          </span>
        </div>
      </footer>
      <Analytics />
    </>
  );
}
