// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import PokemonType from "../components/pokemonType/PokemonType";
import TypePage from "./TypePage";
import TypesPage from "./TypesPage";

const mocks = vi.hoisted(() => ({ usePokemonList: vi.fn(), getTypeByName: vi.fn() }));
vi.mock("../hooks/usePokemonList", () => ({ default: mocks.usePokemonList }));
vi.mock("../services/pokedexService", () => ({
  default: { getTypeByName: mocks.getTypeByName },
}));
vi.mock("../components/header/PageHeader", () => ({ default: () => <header /> }));
vi.mock("../components/pokemonCard/PokemonCard", () => ({
  default: ({ slug, onClick }: { slug: string; onClick: () => void }) => (
    <div onClick={onClick}>
      {slug}<PokemonType>fire</PokemonType>
    </div>
  ),
}));

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

const Location = () => <div data-testid="location">{useLocation().pathname}</div>;

const renderPages = (path: string) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <Location />
        <Routes>
          <Route path="/types" element={<TypesPage />} />
          <Route path="/types/:type" element={<TypePage />} />
          <Route path="/type/:type/:type2" element={<TypePage />} />
          <Route path="/pokemon/:name" element={<div>Pokémon details</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("type pages", () => {
  it("lists types and navigates to the selected type", async () => {
    mocks.usePokemonList.mockReturnValue({
      data: { results: [], count: 0, next: null, previous: null },
    });
    mocks.getTypeByName.mockResolvedValue({
      damage_relations: { double_damage_from: [], half_damage_from: [], no_damage_from: [] },
    });

    renderPages("/types");
    const grid = screen.getByRole("main");
    expect(within(grid).getAllByRole("link")).toHaveLength(19);
    fireEvent.click(within(grid).getByRole("link", { name: "fire" }));
    expect(screen.getByTestId("location").textContent).toBe("/types/fire");
    expect(screen.getByRole("heading", { name: "fire type" })).toBeTruthy();
    expect(mocks.usePokemonList).toHaveBeenLastCalledWith({ types: ["fire"] });
    await waitFor(() => expect(mocks.getTypeByName).toHaveBeenCalledWith("fire"));
  });

  it("shows defensive matchups and Pokémon and keeps badge clicks from opening the card", async () => {
    mocks.usePokemonList.mockReturnValue({
      data: { results: [{ name: "charmander", url: "" }], count: 1, next: null, previous: null },
    });
    mocks.getTypeByName.mockResolvedValue({
      damage_relations: {
        double_damage_from: [{ name: "water" }],
        half_damage_from: [{ name: "grass" }],
        no_damage_from: [],
      },
    });

    renderPages("/types/fire");
    await waitFor(() => expect(screen.getByText("Takes 2x damage from")).toBeTruthy());
    expect(screen.getByText("Takes 0.5x damage from")).toBeTruthy();
    expect(screen.getByText("charmander")).toBeTruthy();
    fireEvent.click(within(screen.getByText("charmander")).getByRole("link", { name: "fire" }));
    expect(screen.getByTestId("location").textContent).toBe("/types/fire");
    expect(screen.queryByText("Pokémon details")).toBeNull();
    fireEvent.click(screen.getByText("charmander"));
    expect(screen.getByTestId("location").textContent).toBe("/pokemon/charmander");
  });

  it("switches the filter when a matchup badge is selected", async () => {
    mocks.usePokemonList.mockReturnValue({
      data: { results: [], count: 0, next: null, previous: null },
    });
    mocks.getTypeByName.mockImplementation(async (type: string) => ({
      damage_relations: {
        double_damage_from: type === "fire" ? [{ name: "water" }] : [{ name: "electric" }],
        half_damage_from: [],
        no_damage_from: [],
      },
    }));
    renderPages("/types/fire");
    const weakness = await screen.findByText("Takes 2x damage from");
    fireEvent.click(within(weakness.parentElement as HTMLElement).getByRole("link", { name: "water" }));
    expect(screen.getByRole("heading", { name: "water type" })).toBeTruthy();
    expect(mocks.usePokemonList).toHaveBeenLastCalledWith({ types: ["water"] });
    await waitFor(() => {
      const group = screen.getByText("Takes 2x damage from").parentElement as HTMLElement;
      expect(within(group).getByRole("link", { name: "electric" })).toBeTruthy();
    });
  });

  it("selects a second type and combines both filters and matchups", async () => {
    mocks.usePokemonList.mockReturnValue({
      data: { results: [], count: 0, next: null, previous: null },
    });
    mocks.getTypeByName.mockImplementation(async () => ({
      damage_relations: {
        double_damage_from: [{ name: "rock" }],
        half_damage_from: [],
        no_damage_from: [],
      },
    }));
    renderPages("/types/fire");
    const select = screen.getByRole("combobox", { name: "Add a second type" });
    expect(within(select).queryByRole("option", { name: "Fire" })).toBeNull();
    fireEvent.change(select, { target: { value: "flying" } });
    expect(screen.getByTestId("location").textContent).toBe("/type/fire/flying");
    expect(screen.getByRole("heading", { name: "fire / flying type" })).toBeTruthy();
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(mocks.usePokemonList).toHaveBeenLastCalledWith({ types: ["fire", "flying"] });
    const weakness = await screen.findByText("Takes 4x damage from");
    expect(within(weakness.parentElement as HTMLElement).getByRole("link", { name: "rock" })).toBeTruthy();
    expect(mocks.getTypeByName).toHaveBeenCalledWith("fire");
    expect(mocks.getTypeByName).toHaveBeenCalledWith("flying");
  });

  it("opens a two-type URL directly without showing the selector", () => {
    mocks.usePokemonList.mockReturnValue({
      data: { results: [], count: 0, next: null, previous: null },
    });
    mocks.getTypeByName.mockResolvedValue({
      damage_relations: { double_damage_from: [], half_damage_from: [], no_damage_from: [] },
    });
    renderPages("/type/water/ground");
    expect(screen.getByRole("heading", { name: "water / ground type" })).toBeTruthy();
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(mocks.usePokemonList).toHaveBeenLastCalledWith({ types: ["water", "ground"] });
  });

  it.each(["/type/fire/not-a-type", "/type/not-a-type/fire", "/type/fire/fire"])(
    "rejects invalid pair %s without requesting Pokémon",
    (path) => {
      renderPages(path);
      expect(screen.getByRole("heading", { name: "Type not found" })).toBeTruthy();
      expect(mocks.usePokemonList).not.toHaveBeenCalled();
      expect(mocks.getTypeByName).not.toHaveBeenCalled();
    },
  );

  it("rejects unknown route parameters without requesting Pokémon", () => {
    renderPages("/types/not-a-type");
    expect(screen.getByRole("heading", { name: "Type not found" })).toBeTruthy();
    expect(mocks.usePokemonList).not.toHaveBeenCalled();
    expect(mocks.getTypeByName).not.toHaveBeenCalled();
  });
});
