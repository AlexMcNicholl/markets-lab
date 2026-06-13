import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Attribution from "./pages/Attribution";
import ManagerLuck from "./pages/ManagerLuck";
import YieldCurve from "./pages/YieldCurve";
import About from "./pages/About";
import "./styles.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "attribution", element: <Attribution /> },
      { path: "manager-luck", element: <ManagerLuck /> },
      { path: "yield-curve", element: <YieldCurve /> },
      { path: "about", element: <About /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
