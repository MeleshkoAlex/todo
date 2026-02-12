import { StrictMode } from "react";

import { createRoot } from "react-dom/client";

import "./style/main.scss";
import { AppProvider } from "./context";
import { App } from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
);
