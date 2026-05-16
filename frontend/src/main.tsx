import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { FournisseurAuth } from "./contexte/AuthContext";
import { FournisseurToast } from "./contexte/ToastContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <FournisseurAuth>
        <FournisseurToast>
          <App />
        </FournisseurToast>
      </FournisseurAuth>
    </BrowserRouter>
  </StrictMode>
);
