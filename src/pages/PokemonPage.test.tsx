// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { isValidElement } from "react";
import { matchRoutes, MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import router from "../routes";
import PokemonPage from "./PokemonPage";

vi.mock("../components/pokemonList/PokemonList", () => ({
  default: () => <main>Pokémon list</main>,
}));
vi.mock("../hooks/useTheme", () => ({
  default: () => ({ theme: "light", toggleTheme: vi.fn() }),
}));

afterEach(cleanup);

describe("Pokémon page routes", () => {
  it.each(["/", "/pokemon"])("renders the Pokémon page at %s", (path) => {
    const matches = matchRoutes(router.routes, path);
    const element = matches?.[matches.length - 1]?.route.element;
    expect(isValidElement(element) && element.type === PokemonPage).toBe(true);
    render(
      <MemoryRouter initialEntries={[path]}>
        <PokemonPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole("main").textContent).toBe("Pokémon list");
    expect(screen.getByRole("button", { name: "Open navigation menu" })).toBeTruthy();
  });

  it("keeps Pokémon detail URLs separate from the list", () => {
    const matches = matchRoutes(router.routes, "/pokemon/pikachu");
    expect(matches?.[matches.length - 1]?.route.path).toBe("pokemon/:name");
  });
});
