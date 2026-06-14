import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import ComingSoon from "./components/ComingSoon";
import { TOOLS } from "./lib/registry";
import "./styles.css";

// Live tool pages are code-split: each (and the heavy charting library it pulls
// in) loads only when its route is visited, so the initial bundle stays small
// and adding tools doesn't grow it. Map every "live" registry slug to its page
// component here; "planned" slugs route to the shared ComingSoon stub instead.
const TOOL_PAGES: Record<string, React.LazyExoticComponent<React.FC>> = {
  attribution: lazy(() => import("./pages/Attribution")),
  "multi-period-linking": lazy(() => import("./pages/MultiPeriodLinking")),
  "manager-luck": lazy(() => import("./pages/ManagerLuck")),
  "yield-curve": lazy(() => import("./pages/YieldCurve")),
  "efficient-frontier": lazy(() => import("./pages/EfficientFrontier")),
  "central-bank-tone": lazy(() => import("./pages/CentralBankTone")),
  "dcf-sensitivity": lazy(() => import("./pages/DcfSensitivity")),
  "credit-spreads": lazy(() => import("./pages/CreditSpreads")),
  "comparable-companies": lazy(() => import("./pages/ComparableCompanies")),
  "stress-tester": lazy(() => import("./pages/StressTester")),
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
      ...TOOLS.map((t) => ({
        path: t.slug,
        element:
          t.status === "live" ? (
            lazyElement(t.slug)
          ) : (
            <ComingSoon slug={t.slug} />
          ),
      })),
      { path: "about", element: <About /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
