import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import { TOOLS } from "./lib/registry";
import "./styles.css";

// Tool pages are code-split: each (and the heavy charting library it pulls in)
// loads only when its route is visited, so the initial bundle stays small and
// adding tools doesn't grow it. The only place a new tool's component needs to
// be referenced — routes themselves are generated from the registry below.
const TOOL_PAGES: Record<string, React.LazyExoticComponent<React.FC>> = {
  attribution: lazy(() => import("./pages/Attribution")),
  "manager-luck": lazy(() => import("./pages/ManagerLuck")),
  "yield-curve": lazy(() => import("./pages/YieldCurve")),
};

function lazyElement(slug: string): JSX.Element {
  const Page = TOOL_PAGES[slug];
  return (
    <Suspense fallback={<div className="wrap route-loading">Loading…</div>}>
      <Page />
    </Suspense>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      ...TOOLS.map((t) => ({ path: t.slug, element: lazyElement(t.slug) })),
      { path: "about", element: <About /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
