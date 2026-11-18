import React from "react";
import ReactDOM from "react-dom/client";

// Be Vietnam Pro was drawn for Vietnamese: it carries the stacked diacritics that most
// western faces either drop or crowd. Two weights, three subsets each, 92 KB in total.
import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/500.css";
import "./theme.css";

import App from "./App";
import { ThemeProvider } from "./components/ThemeProvider";
import DefaultStartMinimize from "./components/DefaultStartMinimize";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="chaoem-theme">
      <DefaultStartMinimize />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
