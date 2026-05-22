import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";

const storedTheme = localStorage.getItem("theme");
const initialTheme = storedTheme === "dark" || storedTheme === "light"
  ? storedTheme
  : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
if (initialTheme === "dark") {
  document.documentElement.classList.add("dark");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            background: "#fff",
            color: "#0f172a"
          }
        }}
      />
    </HashRouter>
  </React.StrictMode>
);
