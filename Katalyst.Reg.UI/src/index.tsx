import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./output.css";
import "./App.css";
import { BrowserRouter } from "react-router-dom";

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
} else {
  console.error("Root element not found");
}
