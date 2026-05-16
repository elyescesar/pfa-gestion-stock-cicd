import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import App from "../App";
import { FournisseurAuth } from "../contexte/AuthContext";
import { FournisseurToast } from "../contexte/ToastContext";

describe("App", () => {
  it("affiche la page connexion", () => {
    render(
      <MemoryRouter initialEntries={["/connexion"]}>
        <FournisseurAuth>
          <FournisseurToast>
            <App />
          </FournisseurToast>
        </FournisseurAuth>
      </MemoryRouter>
    );
    expect(screen.getByText("Connexion")).toBeInTheDocument();
  });
});
