import { NavLink, Outlet, Link } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";

export default function Layout() {
  return (
    <>
      <header className="site-header">
        <div className="wrap">
          <Link to="/" className="brand">
            Markets<span>Lab</span>
          </Link>
          <nav className="nav">
            <NavLink to="/" end>
              Tools
            </NavLink>
            <NavLink to="/attribution">Attribution</NavLink>
            <NavLink to="/manager-luck">Skill vs. Luck</NavLink>
            <NavLink to="/yield-curve">Yield Curve</NavLink>
            <NavLink to="/about">About</NavLink>
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
            Public data and synthetic examples only. Not investment advice.
          </span>
        </div>
      </footer>
      <Analytics />
    </>
  );
}
