// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, render, renderHook, waitFor, within } from "@testing-library/react";
import { StrictMode, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import usePokemonStore from "../store";
import TypeCard from "../components/typeCard/TypeCard";
import useEvolutionChain from "./useEvolutionChain";
import usePokemonInfo from "./usePokemonInfo";

const api = vi.hoisted(() => ({
  getPokemonFormByName: vi.fn(),
  resource: vi.fn(),
}));

vi.mock("../services/pokedexService", () => ({ default: api }));

const speciesUrl = "https://pokeapi.co/api/v2/pokemon-species/1/";
const chainUrl = "https://pokeapi.co/api/v2/evolution-chain/1/";
const pokemonUrl = (slug: string) => `https://pokeapi.co/api/v2/pokemon/${slug}/`;
const localized = (en: string, fr: string) => [
  { language: { name: "en" }, name: en, genus: en },
  { language: { name: "fr" }, name: fr, genus: fr },
];
const species = {
  names: localized("Bulbasaur", "Bulbizarre"),
  genera: localized("Seed", "Graine"),
  pokedex_numbers: [{ pokedex: { name: "national" }, entry_number: 1 }],
  generation: { name: "generation-i" },
  evolution_chain: { url: chainUrl },
};
const form = (slug: string) => ({
  pokemon: { url: pokemonUrl(slug) },
  names: localized("Form", "Forme"),
  sprites: { other: { "official-artwork": { front_default: "artwork" } } },
  types: [{ type: { name: "grass" } }],
});

function wrapper(client: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <StrictMode><QueryClientProvider client={client}>{children}</QueryClientProvider></StrictMode>
  );
}

function client() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

beforeEach(() => {
  usePokemonStore.setState({ pokemonMap: new Map(), language: "en" });
  api.getPokemonFormByName.mockReset();
  api.resource.mockReset();
  api.getPokemonFormByName.mockImplementation(async (slug: string) => form(slug));
  api.resource.mockImplementation(async (url: string) => {
    if (url === speciesUrl) return species;
    if (url === chainUrl) return { chain: {} };
    return { species: { url: speciesUrl }, sprites: { other: { "official-artwork": {} } } };
  });
});

afterEach(cleanup);

describe("usePokemonInfo", () => {
  it("shares in-flight requests across consumers and the evolution hook, then reuses the store", async () => {
    let resolveForm!: (value: ReturnType<typeof form>) => void;
    api.getPokemonFormByName.mockReturnValue(new Promise((resolve) => { resolveForm = resolve; }));
    const queryClient = client();
    const first = renderHook(() => usePokemonInfo("bulbasaur"), { wrapper: wrapper(queryClient) });
    const second = renderHook(() => usePokemonInfo("bulbasaur"), { wrapper: wrapper(queryClient) });
    const evolution = renderHook(() => {
      const { pokemonSpecies, error } = usePokemonInfo("bulbasaur");
      return useEvolutionChain({ slug: "bulbasaur", pokemonInfo: { pokemonSpecies, error } });
    }, { wrapper: wrapper(queryClient) });
    expect(api.getPokemonFormByName).toHaveBeenCalledTimes(1);

    await act(async () => { resolveForm(form("bulbasaur")); });
    await waitFor(() => expect(evolution.result.current.data).toBeDefined());
    expect(first.result.current.pokemonName).toBe("Bulbasaur");
    expect(second.result.current.pokemonName).toBe("Bulbasaur");
    expect(api.resource.mock.calls.filter(([url]) => url === pokemonUrl("bulbasaur"))).toHaveLength(1);
    expect(api.resource.mock.calls.filter(([url]) => url === speciesUrl)).toHaveLength(1);
    expect(api.resource.mock.calls.filter(([url]) => url === chainUrl)).toHaveLength(1);

    first.unmount();
    second.unmount();
    evolution.unmount();
    const reopened = renderHook(() => usePokemonInfo("bulbasaur"), { wrapper: wrapper(client()) });
    expect(reopened.result.current.pokemonName).toBe("Bulbasaur");
    expect(api.getPokemonFormByName).toHaveBeenCalledTimes(1);
    expect(api.resource).toHaveBeenCalledTimes(3);

    act(() => usePokemonStore.getState().setLanguage("fr"));
    expect(reopened.result.current.pokemonName).toBe("Bulbizarre");
    expect(reopened.result.current.pokemonFormName).toBe("Forme");
    expect(reopened.result.current.pokemonGenera).toBe("Graine");
    expect(api.resource).toHaveBeenCalledTimes(3);
  });

  it("deduplicates shared species resources for different forms", async () => {
    let resolveSpecies!: (value: typeof species) => void;
    api.resource.mockImplementation((url: string) => {
      if (url === speciesUrl) return new Promise((resolve) => { resolveSpecies = resolve; });
      return Promise.resolve({ species: { url: speciesUrl } });
    });
    const queryClient = client();
    const first = renderHook(() => usePokemonInfo("one"), { wrapper: wrapper(queryClient) });
    const second = renderHook(() => usePokemonInfo("two"), { wrapper: wrapper(queryClient) });
    await waitFor(() => expect(api.resource.mock.calls.filter(([url]) => url === speciesUrl)).toHaveLength(1));
    await act(async () => { resolveSpecies(species); });
    await waitFor(() => expect(first.result.current.pokemonName).toBe("Bulbasaur"));
    await waitFor(() => expect(second.result.current.pokemonName).toBe("Bulbasaur"));
    expect(api.resource.mock.calls.filter(([url]) => url === speciesUrl)).toHaveLength(1);
  });

  it("does not display the previous Pokémon while a new slug is loading", async () => {
    const hook = renderHook(({ slug }) => usePokemonInfo(slug), {
      initialProps: { slug: "one" },
      wrapper: wrapper(client()),
    });
    await waitFor(() => expect(hook.result.current.pokemonName).toBe("Bulbasaur"));
    api.getPokemonFormByName.mockReturnValue(new Promise(() => {}));
    hook.rerender({ slug: "two" });
    expect(hook.result.current.loading).toBe(true);
    expect(hook.result.current.pokemonName).toBeUndefined();
  });

  it("updates type matchups when two forms share the same Pokémon", async () => {
    api.getPokemonFormByName.mockImplementation(async (slug: string) => ({
      ...form("shared"),
      types: [{ type: { name: slug === "one" ? "grass" : "fire" } }],
    }));
    api.resource.mockImplementation(async (url: string) => {
      if (url === speciesUrl) return species;
      if (url.includes("/type/")) {
        return { damage_relations: { no_damage_from: [], double_damage_from: [], half_damage_from: [] } };
      }
      return { species: { url: speciesUrl } };
    });
    const Wrapper = wrapper(client());
    const view = render(<TypeCard slug="one" />, { wrapper: Wrapper });
    const types = () => within(view.container.querySelector(".type-card__pokemon-types") as HTMLElement);
    await waitFor(() => expect(types().getByAltText("grass")).toBeTruthy());
    view.rerender(<TypeCard slug="two" />);
    await waitFor(() => expect(types().getByAltText("fire")).toBeTruthy());
    expect(api.resource.mock.calls.filter(([url]) => url === pokemonUrl("shared"))).toHaveLength(1);
    expect(api.resource.mock.calls.filter(([url]) => url === speciesUrl)).toHaveLength(1);
  });

  it("surfaces failures and does not cache them as successful data", async () => {
    api.getPokemonFormByName.mockRejectedValue(new Error("network failed"));
    const hook = renderHook(() => usePokemonInfo("missing"), { wrapper: wrapper(client()) });
    await waitFor(() => expect(hook.result.current.error?.message).toBe("network failed"));
    expect(usePokemonStore.getState().getPokemonInfo("missing")).toBeUndefined();
  });
});
