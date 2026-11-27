// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import EvolutionChainsPage from "./EvolutionChainsPage";

const api = vi.hoisted(() => ({
  getEvolutionChainsList: vi.fn(),
  resource: vi.fn(),
}));

vi.mock("../services/pokedexService", () => ({ default: api }));
vi.mock("../components/header/PageHeader", () => ({ default: () => <header /> }));
vi.mock("../hooks/useDefaultPokemonForm", () => ({
  default: (species: { name: string }) => ({ data: species.name }),
}));
vi.mock("../components/pokemonCard/PokemonCard", () => ({
  default: ({ slug, onClick }: { slug: string; onClick: () => void }) =>
    <button onClick={onClick}>{slug}</button>,
}));
vi.mock("../components/evolutionDetails/EvolutionDetailsCard", () => ({
  default: ({ details }: { details: { label: string } }) => <span>{details.label}</span>,
}));
vi.mock("react-infinite-scroll-component", () => ({
  default: ({ children, hasMore, next }: { children: ReactNode; hasMore: boolean; next: () => void }) => (
    <div>{children}{hasMore && <button onClick={next}>Show more</button>}</div>
  ),
}));

const resource = (name: string) => ({ name, url: name });
const method = (label: string, required?: string, evolved?: string) => ({
  label,
  trigger: resource("level-up"),
  required_pokemon_form: required ? resource(required) : null,
  evolved_pokemon_form: evolved ? resource(evolved) : null,
});
interface Node {
  species: ReturnType<typeof resource>;
  evolution_details: ReturnType<typeof method>[];
  evolves_to: Node[];
}
const node = (name: string, details: Node["evolution_details"] = [], children: Node[] = []): Node => ({
  species: resource(name),
  evolution_details: details,
  evolves_to: children,
});

const useChains = (...roots: Node[]) => {
  api.getEvolutionChainsList.mockResolvedValue({
    results: roots.map((_, index) => ({ url: `chain-${index}` })),
    next: null,
  });
  api.resource.mockImplementation(async (url: string) => {
    const index = Number(url.replace("chain-", ""));
    if (!url.startsWith("chain-") || !roots[index]) throw new Error(`Unknown resource: ${url}`);
    return { chain: roots[index] };
  });
};

const Location = () => <div data-testid="location">{useLocation().pathname}</div>;
const renderPage = () => render(
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <MemoryRouter initialEntries={["/evolution-chains"]}>
      <Location />
      <EvolutionChainsPage />
    </MemoryRouter>
  </QueryClientProvider>,
);

const displayedChains = () =>
  Array.from(document.querySelectorAll<HTMLElement>(".evolution-chains-list__group > .evolution-card"));

const pokemonIn = (chain: HTMLElement) =>
  within(chain).getAllByRole("button").map((button) => button.textContent);

beforeEach(() => {
  useChains();
});

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe("EvolutionChainsPage", () => {
  it("loads evolution chains in pages of 20 and navigates to Pokémon details", async () => {
    const roots = Array.from({ length: 25 }, (_, index) => node(`pokemon-${index}`));
    api.getEvolutionChainsList.mockImplementation(async ({ offset, limit }: { offset: number; limit: number }) => ({
      results: roots.slice(offset, offset + limit).map((_, index) => ({ url: `chain-${offset + index}` })),
      next: offset + limit < roots.length ? "next" : null,
    }));
    api.resource.mockImplementation(async (url: string) => ({
      chain: roots[Number(url.replace("chain-", ""))],
    }));

    renderPage();
    expect(await screen.findByRole("button", { name: "pokemon-19" })).toBeTruthy();
    expect(document.title).toBe("Pokédex | Evolution Chains");
    expect(screen.getByRole("heading", { name: "Evolution Chains" })).toBeTruthy();
    expect(api.getEvolutionChainsList).toHaveBeenCalledWith({ offset: 0, limit: 20 });
    expect(api.resource).toHaveBeenCalledTimes(20);
    expect(screen.queryByRole("button", { name: "pokemon-20" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Show more" }));
    expect(await screen.findByRole("button", { name: "pokemon-24" })).toBeTruthy();
    expect(api.getEvolutionChainsList).toHaveBeenCalledWith({ offset: 20, limit: 20 });
    expect(api.resource).toHaveBeenCalledTimes(25);
    expect(displayedChains()).toHaveLength(25);
    expect(screen.queryByRole("button", { name: "Show more" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "pokemon-24" }));
    expect(screen.getByTestId("location").textContent).toBe("/pokemon/pokemon-24");
  });

  it("shows loading and then an empty state for an empty list", async () => {
    let resolveList!: (value: { results: never[]; next: null }) => void;
    api.getEvolutionChainsList.mockReturnValue(new Promise((resolve) => { resolveList = resolve; }));
    const { container } = renderPage();
    expect(container.querySelector(".loading-bar.loading")).toBeTruthy();
    expect(screen.queryByText("No evolution chains found.")).toBeNull();
    resolveList({ results: [], next: null });
    expect(await screen.findByText("No evolution chains found.")).toBeTruthy();
    await waitFor(() => expect(container.querySelector(".loading-bar.loading")).toBeNull());
    expect(api.resource).not.toHaveBeenCalled();
  });

  it("reports a list request failure without showing the empty state", async () => {
    api.getEvolutionChainsList.mockRejectedValue(new Error("List unavailable"));
    renderPage();
    expect((await screen.findByRole("alert")).textContent).toContain("Error loading evolution chains: List unavailable");
    expect(screen.queryByText("No evolution chains found.")).toBeNull();
  });

  it("keeps loaded chains visible when the next page fails", async () => {
    api.getEvolutionChainsList
      .mockResolvedValueOnce({ results: [{ url: "chain-0" }], next: "next" })
      .mockRejectedValueOnce(new Error("Next page unavailable"));
    api.resource.mockResolvedValue({ chain: node("pichu") });
    renderPage();
    expect(await screen.findByRole("button", { name: "pichu" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Show more" }));
    expect((await screen.findByRole("alert")).textContent).toContain("Next page unavailable");
    expect(api.getEvolutionChainsList).toHaveBeenLastCalledWith({ offset: 1, limit: 20 });
    expect(screen.getByRole("button", { name: "pichu" })).toBeTruthy();
    expect(displayedChains()).toHaveLength(1);
  });

  it("reports an individual chain failure while rendering successful chains", async () => {
    useChains(node("pichu"), node("vulpix"));
    api.resource.mockImplementation(async (url: string) => {
      if (url === "chain-0") return { chain: node("pichu") };
      throw new Error("Chain unavailable");
    });
    renderPage();
    expect((await screen.findByRole("alert")).textContent).toContain("Error loading an evolution chain: Chain unavailable");
    expect(screen.getByRole("button", { name: "pichu" })).toBeTruthy();
    expect(screen.queryByText("No evolution chains found.")).toBeNull();
  });

  it("shows Pichu's default and Alolan Raichu branches in one chain", async () => {
    useChains(node("pichu", [], [
      node("pikachu", [method("friendship")], [
        node("raichu", [
          method("raichu", "pikachu"),
          method("alolan raichu", "pikachu", "raichu-alola"),
        ]),
      ]),
    ]));
    renderPage();
    await screen.findByRole("button", { name: "raichu-alola" });
    const chains = displayedChains();
    expect(chains).toHaveLength(1);
    expect(pokemonIn(chains[0])).toEqual(["pichu", "pikachu", "raichu", "raichu-alola"]);
  });

  it("shows default and regional Vulpix evolutions as separate chains", async () => {
    useChains(node("vulpix", [], [
      node("ninetales", [
        method("default"),
        method("alolan", "vulpix-alola", "ninetales-alola"),
      ]),
    ]));
    renderPage();
    await screen.findByRole("button", { name: "ninetales-alola" });
    expect(displayedChains().map(pokemonIn)).toEqual([
      ["vulpix", "ninetales"],
      ["vulpix-alola", "ninetales-alola"],
    ]);
  });

  it("renders both Geodude chains once without mixing their forms", async () => {
    useChains(node("geodude", [], [
      node("graveler", [
        method("default first"),
        method("alolan first", "geodude-alola", "graveler-alola"),
        method("alolan first alternative", "geodude-alola", "graveler-alola"),
      ], [
        node("golem", [
          method("default second"),
          method("alolan second", "graveler-alola", "golem-alola"),
        ]),
      ]),
    ]));
    renderPage();
    await screen.findByRole("button", { name: "golem-alola" });
    expect(displayedChains().map(pokemonIn)).toEqual([
      ["geodude", "graveler", "golem"],
      ["geodude-alola", "graveler-alola", "golem-alola"],
    ]);
  });

  it("groups both Galarian Slowpoke branches into one alternate chain", async () => {
    useChains(node("slowpoke", [], [
      node("slowbro", [
        method("default bro"),
        method("galar bro", "slowpoke-galar", "slowbro-galar"),
        method("galar bro alternative", "slowpoke-galar", "slowbro-galar"),
      ]),
      node("slowking", [method("default king"), method("galar king", "slowpoke-galar", "slowking-galar")]),
    ]));
    renderPage();
    await screen.findByRole("button", { name: "slowking-galar" });
    expect(displayedChains().map(pokemonIn)).toEqual([
      ["slowpoke", "slowbro", "slowking"],
      ["slowpoke-galar", "slowbro-galar", "slowking-galar"],
    ]);
  });
});