// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { Link, MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import usePokemonStore from "../store";
import EggGroupPage from "./EggGroupPage";
import EggGroupsPage from "./EggGroupsPage";

const api = vi.hoisted(() => ({
  getEggGroupsList: vi.fn(),
  getEggGroupByName: vi.fn(),
  resource: vi.fn(),
}));
vi.mock("../services/pokedexService", () => ({ default: api }));
vi.mock("../components/header/PageHeader", () => ({ default: () => <header /> }));
vi.mock("react-infinite-scroll-component", () => ({
  default: ({ children, hasMore, next }: { children: ReactNode; hasMore: boolean; next: () => void }) => (
    <div>{children}{hasMore && <button onClick={next}>Show more</button>}</div>
  ),
}));
vi.mock("../components/pokemonCard/PokemonCard", () => ({
  default: ({ slug, onClick }: { slug: string; onClick: () => void }) => (
    <button onClick={onClick}>{slug}</button>
  ),
}));

const group = (name: string, label: string, species: string[]) => ({
  name,
  names: [{ language: { name: "en" }, name: label }],
  pokemon_species: species.map((member) => ({ name: member, url: `species-${member}` })),
});

beforeEach(() => {
  api.getEggGroupsList.mockResolvedValue({
    results: [{ name: "field" }, { name: "water-1" }],
  });
  api.getEggGroupByName.mockImplementation(async (name: string) => {
    if (name === "field") return group(name, "Field", ["nidoran-f", "pikachu"]);
    if (name === "water-1") return group(name, "Water 1", []);
    throw new Error("Not found");
  });
  api.resource.mockImplementation(async (url: string) => {
    if (url === "species-nidoran-f") return { varieties: [{ is_default: true, pokemon: { name: "nidoran-f", url: "pokemon-nidoran-f" } }] };
    if (url === "pokemon-nidoran-f") return { forms: [{ url: "form-nidoran-f" }] };
    if (url === "form-nidoran-f") return { name: "nidoran-f", is_default: true };
    if (url === "species-pikachu") return { varieties: [{ is_default: true, pokemon: { name: "pikachu", url: "pokemon-pikachu" } }] };
    if (url === "pokemon-pikachu") return { forms: [{ url: "form-pikachu" }] };
    if (url === "form-pikachu") return { name: "pikachu-rock-star", is_default: true };
    throw new Error(`Unknown resource ${url}`);
  });
});

afterEach(() => {
  cleanup();
  usePokemonStore.getState().setLanguage("en");
  vi.resetAllMocks();
});

const Location = () => <div data-testid="location">{useLocation().pathname}</div>;
const renderPages = (path: string) => render(
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <MemoryRouter initialEntries={[path]}>
      <Location />
      <Link to="/egg-groups/field">Field group</Link>
      <Link to="/egg-groups/water-1">Water group</Link>
      <Routes>
        <Route path="/egg-groups" element={<EggGroupsPage />} />
        <Route path="/egg-groups/:eggGroup" element={<EggGroupPage />} />
        <Route path="/pokemon/:name" element={<div>Pokémon details</div>} />
      </Routes>
    </MemoryRouter>
  </QueryClientProvider>,
);

describe("egg group pages", () => {
  it("lists groups and opens the selected group with its species", async () => {
    renderPages("/egg-groups");
    const field = await screen.findByRole("link", { name: "Field" });
    expect(screen.getByRole("link", { name: "Water 1" }).getAttribute("href")).toBe("/egg-groups/water-1");
    fireEvent.click(field);
    expect(screen.getByTestId("location").textContent).toBe("/egg-groups/field");
    expect(await screen.findByRole("heading", { name: "Field Egg Group" })).toBeTruthy();
    expect(await screen.findByRole("button", { name: "nidoran-f" })).toBeTruthy();
    const card = await screen.findByRole("button", { name: "pikachu-rock-star" });
    fireEvent.click(card);
    expect(screen.getByTestId("location").textContent).toBe("/pokemon/pikachu-rock-star");
    expect(api.getEggGroupByName.mock.calls.filter(([name]) => name === "field")).toHaveLength(1);
  });

  it("shows an empty group on a direct URL", async () => {
    renderPages("/egg-groups/water-1");
    expect(await screen.findByText("No Pokémon found in this egg group.")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Water 1 Egg Group" })).toBeTruthy();
  });

  it("reports an invalid group or failed request", async () => {
    renderPages("/egg-groups/not-a-group");
    expect((await screen.findByRole("alert")).textContent).toContain("Not found");
    expect(screen.queryByText("No Pokémon found in this egg group.")).toBeNull();
  });

  it("reports errors resolving individual species", async () => {
    api.resource.mockRejectedValue(new Error("Species unavailable"));
    renderPages("/egg-groups/field");
    await waitFor(() => expect(screen.getAllByRole("alert")).toHaveLength(2));
    expect(screen.getAllByRole("alert")[0].textContent).toContain("Species unavailable");
  });

  it("reports failures loading the group list", async () => {
    api.getEggGroupsList.mockRejectedValue(new Error("List unavailable"));
    renderPages("/egg-groups");
    expect((await screen.findByRole("alert")).textContent).toContain("List unavailable");
  });

  it("uses localized names with an English fallback", async () => {
    usePokemonStore.getState().setLanguage("fr");
    api.getEggGroupByName.mockImplementation(async (name: string) => {
      const result = group(name, name === "field" ? "Field" : "Water 1", []);
      if (name === "field") result.names.push({ language: { name: "fr" }, name: "Terrain" });
      return result;
    });
    renderPages("/egg-groups");
    fireEvent.click(await screen.findByRole("link", { name: "Terrain" }));
    expect(await screen.findByRole("heading", { name: "Terrain Egg Group" })).toBeTruthy();
  });

  it("sorts by the displayed names and updates the order when the language changes", async () => {
    api.getEggGroupsList.mockResolvedValue({
      results: [{ name: "water-1" }, { name: "field" }],
    });
    api.getEggGroupByName.mockImplementation(async (name: string) => {
      const result = group(name, name === "field" ? "Field" : "Water 1", []);
      result.names.push({ language: { name: "fr" }, name: name === "field" ? "Terrain" : "Aquatique 1" });
      return result;
    });
    renderPages("/egg-groups");
    const main = screen.getByRole("main");
    await screen.findByRole("link", { name: "Water 1" });
    await screen.findByRole("link", { name: "Field" });
    expect(within(main).getAllByRole("link").map((link) => link.textContent)).toEqual(["Field", "Water 1"]);
    act(() => usePokemonStore.getState().setLanguage("fr"));
    expect(within(main).getAllByRole("link").map((link) => link.textContent)).toEqual(["Aquatique 1", "Terrain"]);
  });

  it("loads species incrementally and resets the count when changing groups", async () => {
    const members = Array.from({ length: 25 }, (_, index) => `member-${index}`);
    api.getEggGroupByName.mockImplementation(async (name: string) => group(name, name, members));
    api.resource.mockImplementation(async (url: string) => {
      const [kind, ...parts] = url.split("-");
      const name = parts.join("-");
      if (kind === "species") return { varieties: [{ is_default: true, pokemon: { name, url: `pokemon-${name}` } }] };
      if (kind === "pokemon") return { forms: [{ url: `form-${name}` }] };
      return { name, is_default: true };
    });
    renderPages("/egg-groups/field");
    expect(await screen.findByRole("button", { name: "member-19" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "member-20" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Show more" }));
    expect(await screen.findByRole("button", { name: "member-24" })).toBeTruthy();
    fireEvent.click(screen.getByRole("link", { name: "Water group" }));
    expect(await screen.findByRole("button", { name: "member-19" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "member-20" })).toBeNull();
    expect(screen.getByRole("button", { name: "Show more" })).toBeTruthy();
  });
});
