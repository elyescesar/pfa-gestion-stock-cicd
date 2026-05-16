import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import App from "../App";

describe("App", () => {
  it("affiche la page connexion", () => {
    render(
      <MemoryRouter initialEntries={["/connexion"]}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText("Connexion")).toBeInTheDocument();
  });
});
