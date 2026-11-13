// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import usePokemonStore from "../../store";
import EvolutionChain from "./EvolutionChain";

const api = vi.hoisted(() => ({
  getPokemonByName: vi.fn(),
  getPokemonFormByName: vi.fn(),
  resource: vi.fn(),
}));

vi.mock("../../services/pokedexService", () => ({ default: api }));
vi.mock("../../hooks/usePokemonColor", () => ({ default: () => null }));

type Resource = { name: string; url: string };
type Method = ReturnType<typeof method>;
type Node = {
  species: Resource;
  is_baby: boolean;
  evolution_details: Method[];
  evolves_to: Node[];
};

const resource = (kind: string, name: string): Resource => ({
  name,
  url: `https://pokeapi.co/api/v2/${kind}/${name}/`,
});
const species = (name: string) => resource("pokemon-species", name);
const form = (name: string) => resource("pokemon-form", name);
const item = (name: string) => resource("item", name);
const trigger = (name: string) => resource("evolution-trigger", name);
const method = (overrides: Partial<{
  trigger: Resource;
  item: Resource | null;
  min_level: number | null;
  relative_physical_stats: number | null;
  required_pokemon_form: Resource | null;
  evolved_pokemon_form: Resource | null;
  version_group: Resource | null;
  condition_expression: { expression: string; percentage_chance: number | null; variables: Resource[] } | null;
}> = {}) => ({
  trigger: trigger("level-up"),
  item: null,
  held_item: null,
  known_move: null,
  known_move_type: null,
  location: null,
  gender: null,
  min_level: null,
  min_happiness: null,
  min_beauty: null,
  min_affection: null,
  near_special_rock: false,
  needs_multiplayer: false,
  needs_overworld_rain: false,
  party_species: null,
  party_type: null,
  relative_physical_stats: null,
  time_of_day: "",
  trade_species: null,
  turn_upside_down: false,
  region: null,
  required_pokemon_form: null,
  evolved_pokemon_form: null,
  used_move: null,
  min_move_count: null,
  min_steps: null,
  min_damage_taken: null,
  allowed_natures: null,
  condition_expression: null,
  version_group: null,
  is_default: true,
  ...overrides,
});
const node = (name: string, methods: Method[] = [], children: Node[] = []): Node => ({
  species: species(name),
  is_baby: false,
  evolution_details: methods,
  evolves_to: children,
});

type PokemonFixture = {
  slug: string;
  speciesName: string;
  formName: string;
  label: string;
  id: number;
  isDefault: boolean;
};

const fixtures: PokemonFixture[] = [
  { slug: "charmander", speciesName: "charmander", formName: "charmander", label: "Charmander", id: 4, isDefault: true },
  { slug: "charmeleon", speciesName: "charmeleon", formName: "charmeleon", label: "Charmeleon", id: 5, isDefault: true },
  { slug: "charizard", speciesName: "charizard", formName: "charizard", label: "Charizard", id: 6, isDefault: true },
  { slug: "tandemaus", speciesName: "tandemaus", formName: "tandemaus", label: "Tandemaus", id: 924, isDefault: true },
  { slug: "maushold-family-of-four", speciesName: "maushold", formName: "maushold-family-of-four", label: "Maushold Family of Four", id: 925, isDefault: true },
  { slug: "maushold-family-of-four", speciesName: "maushold", formName: "maushold-special", label: "Maushold Special Form", id: 925, isDefault: true },
  { slug: "maushold-family-of-three", speciesName: "maushold", formName: "maushold-family-of-three", label: "Maushold Family of Three", id: 10257, isDefault: false },
  { slug: "growlithe", speciesName: "growlithe", formName: "growlithe", label: "Growlithe", id: 58, isDefault: true },
  { slug: "growlithe-hisui", speciesName: "growlithe", formName: "growlithe-hisui", label: "Hisuian Growlithe", id: 10229, isDefault: false },
  { slug: "arcanine", speciesName: "arcanine", formName: "arcanine", label: "Arcanine", id: 59, isDefault: true },
  { slug: "arcanine-hisui", speciesName: "arcanine", formName: "arcanine-hisui", label: "Hisuian Arcanine", id: 10230, isDefault: false },
  { slug: "tatsugiri-curly", speciesName: "tatsugiri", formName: "tatsugiri-curly", label: "Tatsugiri Curly", id: 978, isDefault: true },
  { slug: "tatsugiri-droopy", speciesName: "tatsugiri", formName: "tatsugiri-droopy", label: "Tatsugiri Droopy", id: 10276, isDefault: false },
  { slug: "tatsugiri-stretchy", speciesName: "tatsugiri", formName: "tatsugiri-stretchy", label: "Tatsugiri Stretchy", id: 10277, isDefault: false },
];

const chainUrl = "https://pokeapi.co/api/v2/evolution-chain/test/";
const localized = (name: string) => [{ name, language: { name: "en", url: "" } }];
// The current card has no rejection handler. Leave unknown lookups pending so tests
// report the missing UI instead of producing an unrelated unhandled rejection.
const pending = () => new Promise<never>(() => {});

function setupApi(chain: Node) {
  api.getPokemonByName.mockImplementation((name: string) => {
    const pokemon = fixtures.find((entry) => entry.slug === name);
    if (!pokemon) return pending();
    return Promise.resolve({
      id: pokemon.id,
      name: pokemon.slug,
      species: species(pokemon.speciesName),
      forms: fixtures.filter((entry) => entry.slug === name).map((entry) => form(entry.formName)),
      types: [],
    });
  });
  api.getPokemonFormByName.mockImplementation((name: string) => {
    const pokemon = fixtures.find((entry) => entry.formName === name);
    if (!pokemon) throw new Error(`Unknown form: ${name}`);
    return Promise.resolve({
      name: pokemon.formName,
      pokemon: resource("pokemon", pokemon.slug),
      names: localized(pokemon.label),
      form_names: localized(pokemon.label),
      sprites: {},
    });
  });
  api.resource.mockImplementation((url: string) => {
    if (url === chainUrl) return Promise.resolve({ id: 1, baby_trigger_item: null, chain });
    const matches = fixtures.filter((entry) => species(entry.speciesName).url === url);
    if (matches.length) {
      const name = matches[0].speciesName;
      return Promise.resolve({
        name,
        evolution_chain: { url: chainUrl },
        names: localized(name[0].toUpperCase() + name.slice(1)),
        generation: { name: "generation-i" },
        pokedex_numbers: [{ pokedex: { name: "national" }, entry_number: matches[0].id }],
        varieties: matches.filter((entry, index) => matches.findIndex((other) => other.slug === entry.slug) === index).map((entry) => ({
          is_default: entry.isDefault,
          pokemon: resource("pokemon", entry.slug),
        })),
      });
    }
    const formFixture = fixtures.find((entry) => form(entry.formName).url === url);
    if (formFixture) return api.getPokemonFormByName(formFixture.formName);
    const pokemonFixture = fixtures.find((entry) => resource("pokemon", entry.slug).url === url);
    if (pokemonFixture) return api.getPokemonByName(pokemonFixture.slug);
    if (url === item("fire-stone").url) return Promise.resolve({ name: "fire-stone", names: localized("Fire Stone") });
    return Promise.reject(new Error(`Unknown resource: ${url}`));
  });
}

function CurrentLocation() {
  return <div data-testid="location">{useLocation().pathname}</div>;
}

function renderChain(slug: string, chain: Node) {
  setupApi(chain);
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[`/pokemon/${slug}`]}>
        <EvolutionChain slug={slug} />
        <CurrentLocation />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function expectAssociated(label: string, detail: RegExp, otherLabel: string) {
  let element: HTMLElement | null = screen.getByText(label);
  while (element && (!detail.test(element.textContent ?? "") || element.textContent?.includes(otherLabel))) {
    element = element.parentElement;
  }
  expect(element, `${label} should have its own associated ${detail}`).not.toBeNull();
}

beforeEach(() => {
  vi.clearAllMocks();
  usePokemonStore.setState({ pokemonMap: new Map(), language: "en" });
});
afterEach(cleanup);

const charmanderChain = node("charmander", [], [
  node("charmeleon", [method({ min_level: 16 })], [
    node("charizard", [method({ min_level: 36 })]),
  ]),
]);

const mausholdChain = node("tandemaus", [], [
  node("maushold", [
    method({
      trigger: trigger("in-battle-level-up"),
      min_level: 25,
      evolved_pokemon_form: form("maushold-family-of-four"),
      condition_expression: { expression: "EC 100 % 0 !=", percentage_chance: 99, variables: [] },
    }),
    method({
      trigger: trigger("in-battle-level-up"),
      min_level: 25,
      evolved_pokemon_form: form("maushold-family-of-three"),
      condition_expression: { expression: "EC 100 % 0 ==", percentage_chance: 1, variables: [] },
    }),
  ]),
]);

const growlitheChain = node("growlithe", [], [
  node("arcanine", [
    method({ trigger: trigger("use-item"), item: item("fire-stone"), version_group: resource("version-group", "red-blue") }),
    method({
      trigger: trigger("use-item"),
      item: item("fire-stone"),
      version_group: resource("version-group", "legends-arceus"),
      required_pokemon_form: form("growlithe-hisui"),
      evolved_pokemon_form: form("arcanine-hisui"),
    }),
  ]),
]);

describe("EvolutionChain", () => {
  it("renders a three-stage chain and attaches each level to its transition", async () => {
    const { container } = renderChain("charmeleon", charmanderChain);
    await screen.findByText("Charizard");
    const transitions = container.querySelectorAll(".evolution-transition");
    expect(transitions).toHaveLength(2);
    expect(within(transitions[0] as HTMLElement).getByText(/16/)).toBeTruthy();
    expect(within(transitions[1] as HTMLElement).getByText(/36/)).toBeTruthy();
    expect(screen.getByText("Charmander")).toBeTruthy();
    expect(screen.getByText("Charmeleon")).toBeTruthy();
  });

  it("preserves both branches rather than flattening the tree", async () => {
    renderChain("charmander", node("charmander", [], [
      node("charmeleon", [method({ min_level: 16 })]),
      node("charizard", [method({ min_level: 36 })]),
    ]));
    await screen.findByText("Charizard");
    expect(screen.getByText("Charmeleon")).toBeTruthy();
    expect(screen.getByText(/16/)).toBeTruthy();
    expect(screen.getByText(/36/)).toBeTruthy();
  });

  it("renders distinct form outcomes with their own chances and in-battle trigger", async () => {
    renderChain("tandemaus", mausholdChain);
    await screen.findByText("Maushold Family of Four");
    expect(screen.getByText("Maushold Family of Three")).toBeTruthy();
    expect(screen.getByText(/99\s*%/)).toBeTruthy();
    expect(screen.getByText(/1\s*%/)).toBeTruthy();
    expect(screen.getAllByText(/25/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/battle/i).length).toBeGreaterThan(0);
    expectAssociated("Maushold Family of Four", /99\s*%/, "Maushold Family of Three");
    expectAssociated("Maushold Family of Three", /1\s*%/, "Maushold Family of Four");
  });

  it.each([
    ["growlithe-hisui", "Hisuian Growlithe", "Hisuian Arcanine"],
    ["arcanine-hisui", "Hisuian Growlithe", "Hisuian Arcanine"],
    ["growlithe", "Growlithe", "Arcanine"],
    ["arcanine", "Growlithe", "Arcanine"],
  ])("shows the matching path for %s", async (slug, from, to) => {
    renderChain(slug, growlitheChain);
    await screen.findByText(from);
    await screen.findByText(to);
    expect(await screen.findAllByText(/Fire Stone/i)).not.toHaveLength(0);
    if (!slug.endsWith("-hisui")) {
      expect(screen.queryByText("Hisuian Growlithe")).toBeNull();
      expect(screen.queryByText("Hisuian Arcanine")).toBeNull();
    }
  });

  it("excludes an explicitly incompatible source form", async () => {
    renderChain("growlithe-hisui", node("growlithe", [], [
      node("arcanine", [
        method({
          required_pokemon_form: form("growlithe"),
          evolved_pokemon_form: form("arcanine"),
        }),
        method({
          required_pokemon_form: form("growlithe-hisui"),
          evolved_pokemon_form: form("arcanine-hisui"),
        }),
      ]),
    ]));
    await screen.findByText("Hisuian Arcanine");
    expect(screen.queryByText("Arcanine")).toBeNull();
  });

  it("distinguishes form resources even when they share a Pokémon", async () => {
    renderChain("tandemaus", node("tandemaus", [], [
      node("maushold", [
        method({ evolved_pokemon_form: form("maushold-family-of-four") }),
        method({ evolved_pokemon_form: form("maushold-special") }),
      ]),
    ]));
    await screen.findByText("Maushold Family of Four");
    expect(await screen.findByText("Maushold Special Form")).toBeTruthy();
  });

  it.each(["tatsugiri-curly", "tatsugiri-droopy", "tatsugiri-stretchy"])(
    "preserves the current variety %s when there is no evolution",
    async (slug) => {
      renderChain(slug, node("tatsugiri"));
      const fixture = fixtures.find((entry) => entry.slug === slug)!;
      await screen.findByText(fixture.label);
      expect(api.getPokemonByName).not.toHaveBeenCalledWith("tatsugiri");
    },
  );

  it("uses the default Pokémon variety when a target species name is not a Pokémon name", async () => {
    renderChain("charmander", node("charmander", [], [
      node("tatsugiri", [method({ min_level: 16 })]),
    ]));
    await screen.findByText("Tatsugiri Curly");
    expect(api.getPokemonByName).not.toHaveBeenCalledWith("tatsugiri");
  });

  it("reports when a target species has no resolvable default variety", async () => {
    renderChain("charmander", node("charmander", [], [
      node("tatsugiri", [method({ min_level: 16 })]),
    ]));
    const resolveResource = api.resource.getMockImplementation()!;
    api.resource.mockImplementation(async (url: string) => {
      const result = await resolveResource(url);
      if (url === species("tatsugiri").url) {
        return { ...result, varieties: [] };
      }
      return result;
    });
    await screen.findByText(/unavailable|unable to resolve|could not resolve/i);
  });

  it("navigates to the resolved Pokémon instead of the species name", async () => {
    renderChain("charmander", node("charmander", [], [
      node("tatsugiri", [method({ min_level: 16 })]),
    ]));
    const card = (await screen.findByText("Tatsugiri Curly")).closest(".pokemon-card");
    expect(card).not.toBeNull();
    fireEvent.click(card!);
    expect(screen.getByTestId("location").textContent).toBe("/pokemon/tatsugiri-curly");
  });

  it("navigates to the resolved Hisuian form", async () => {
    renderChain("growlithe-hisui", growlitheChain);
    const card = (await screen.findByText("Hisuian Arcanine")).closest(".pokemon-card");
    expect(card).not.toBeNull();
    fireEvent.click(card!);
    expect(screen.getByTestId("location").textContent).toBe("/pokemon/arcanine-hisui");
  });

  it("does not discard multiple methods for the same outcome", async () => {
    renderChain("charmander", node("charmander", [], [
      node("charmeleon", [method({ min_level: 16 }), method({ min_level: 20 })]),
    ]));
    await screen.findByText("Charmeleon");
    expect(screen.getByText(/16/)).toBeTruthy();
    expect(screen.getByText(/20/)).toBeTruthy();
  });

  it("shows a zero-valued physical-stat condition", async () => {
    renderChain("charmander", node("charmander", [], [
      node("charmeleon", [
        method({ min_level: 16 }),
        method({ min_level: 16, relative_physical_stats: 0 }),
      ]),
    ]));
    await screen.findByText("Charmeleon");
    expect(screen.getByText(/Attack\s*=\s*Defense/i)).toBeTruthy();
  });

  it("indicates when a transition has no evolution details", async () => {
    renderChain("charmander", node("charmander", [], [node("charmeleon")]));
    await screen.findByText("Charmeleon");
    expect(screen.getByText(/requirements.*unavailable|unknown.*requirements/i)).toBeTruthy();
  });

  it("surfaces an unrecognized condition rather than silently dropping it", async () => {
    renderChain("charmander", node("charmander", [], [
      node("charmeleon", [method({
        condition_expression: { expression: "unknown condition", percentage_chance: null, variables: [] },
      })]),
    ]));
    await screen.findByText("Charmeleon");
    expect(screen.getByText(/additional condition|unknown condition/i)).toBeTruthy();
  });

  it("renders an explicit error if the chain cannot be fetched", async () => {
    renderChain("charmander", charmanderChain);
    const resolveResource = api.resource.getMockImplementation()!;
    api.resource.mockImplementation((url: string) => {
      if (url === chainUrl) return Promise.reject(new Error("Chain unavailable"));
      return resolveResource(url);
    });
    await waitFor(() => expect(screen.getByText(/Chain unavailable/i)).toBeTruthy());
  });

  it("indicates while the chain is loading", async () => {
    renderChain("charmander", charmanderChain);
    const resolveResource = api.resource.getMockImplementation()!;
    api.resource.mockImplementation((url: string) => {
      if (url === chainUrl) return pending();
      return resolveResource(url);
    });
    await screen.findByRole("status");
  });
});
