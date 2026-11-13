// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import usePokemonStore from "../../store";
import { formArtwork, resolvePokemon, resolvePokemonForm } from "../../services/pokemonResolver";
import PokemonInfoHeaderCard from "../pokemonInfoHeaderCard/PokemonInfoHeaderCard";
import TypeCard from "../typeCard/TypeCard";
import OtherForms from "../otherForms/OtherForms";
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
  needs_overworld_rain: boolean;
  turn_upside_down: boolean;
  gender: number | null;
  used_move: Resource | null;
  min_move_count: number | null;
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
  { slug: "burmy", speciesName: "burmy", formName: "burmy-plant", label: "Plant Burmy", id: 412, isDefault: true },
  { slug: "burmy", speciesName: "burmy", formName: "burmy-sandy", label: "Sandy Burmy", id: 412, isDefault: true },
  { slug: "burmy", speciesName: "burmy", formName: "burmy-trash", label: "Trash Burmy", id: 412, isDefault: true },
  { slug: "wormadam-plant", speciesName: "wormadam", formName: "wormadam-plant", label: "Plant Wormadam", id: 413, isDefault: true },
  { slug: "wormadam-sandy", speciesName: "wormadam", formName: "wormadam-sandy", label: "Sandy Wormadam", id: 10004, isDefault: false },
  { slug: "wormadam-trash", speciesName: "wormadam", formName: "wormadam-trash", label: "Trash Wormadam", id: 10005, isDefault: false },
  { slug: "mothim", speciesName: "mothim", formName: "mothim", label: "Mothim", id: 414, isDefault: true },
];

const chainUrl = "https://pokeapi.co/api/v2/evolution-chain/test/";
const localized = (name: string) => [{ name, language: { name: "en", url: "" } }];
// The current card has no rejection handler. Leave unknown lookups pending so tests
// report the missing UI instead of producing an unrelated unhandled rejection.
const pending = () => new Promise<never>(() => {});

function setupApi(chain: Node) {
  api.getPokemonByName.mockImplementation((name: string) => {
    const pokemon = fixtures.find((entry) => entry.slug === name);
    if (!pokemon) return Promise.reject({ isAxiosError: true, response: { status: 404 } });
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
      sprites: {
        front_default: `https://example.test/${pokemon.formName}.png`,
        other: { "official-artwork": { front_default: `https://example.test/artwork/${pokemon.formName}.png` } },
      },
      types: pokemon.formName === "maushold-special" ? [{ type: resource("type", "fire"), slot: 1 }] : [],
      is_default: fixtures.find((entry) => entry.slug === pokemon.slug)?.formName === pokemon.formName,
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
        genera: [{ genus: "Test Pokémon", language: { name: "en", url: "" } }],
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
    if (url === resource("move", "psyshield-bash").url) {
      return Promise.resolve({ name: "psyshield-bash", names: localized("Psyshield Bash") });
    }
    if (url === resource("type", "fire").url) {
      return Promise.resolve({
        damage_relations: { no_damage_from: [], double_damage_from: [], half_damage_from: [] },
      });
    }
    return Promise.reject(new Error(`Unknown resource: ${url}`));
  });
}

function CurrentLocation() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}{location.search}</div>;
}

function renderChain(slug: string, chain: Node, search = "") {
  setupApi(chain);
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[`/pokemon/${slug}${search}`]}>
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

const burmyChain = node("burmy", [], [
  node("wormadam", ["plant", "sandy", "trash"].map((cloak) => method({
    min_level: 20,
    gender: 1,
    required_pokemon_form: form(`burmy-${cloak}`),
    evolved_pokemon_form: form(`wormadam-${cloak}`),
  }))),
  node("mothim", [method({ min_level: 20, gender: 2 })]),
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

  it.each([
    ["wormadam-plant", "Plant Burmy", "Plant Wormadam", "Sandy Burmy", "Trash Burmy"],
    ["wormadam-sandy", "Sandy Burmy", "Sandy Wormadam", "Plant Burmy", "Trash Burmy"],
    ["wormadam-trash", "Trash Burmy", "Trash Wormadam", "Plant Burmy", "Sandy Burmy"],
  ])("shares the inferred ancestor with compatible branches for %s", async (slug, burmy, wormadam, otherBurmy, otherCloak) => {
    const { container } = renderChain(slug, burmyChain);
    await screen.findByText(wormadam);
    expect(await screen.findByText(burmy)).toBeTruthy();
    expect(await screen.findByText("Mothim")).toBeTruthy();
    expect(screen.queryByText(otherBurmy)).toBeNull();
    expect(screen.queryByText(otherCloak)).toBeNull();
    expect(container.querySelector(".evolution")?.children).toHaveLength(1);
    expect(container.querySelectorAll(".evolution-transition")).toHaveLength(2);
  });

  it("uses the current Burmy form for both evolution branches", async () => {
    const { container } = renderChain("burmy", burmyChain, "?form=burmy-sandy");
    await screen.findByText("Sandy Wormadam");
    expect(screen.getByText("Sandy Burmy")).toBeTruthy();
    expect(screen.getByText("Mothim")).toBeTruthy();
    expect(screen.queryByText("Plant Burmy")).toBeNull();
    expect(container.querySelector(".evolution")?.children).toHaveLength(1);
  });

  it("uses the displayed default ancestor across Mothim's branches", async () => {
    const { container } = renderChain("mothim", burmyChain);
    await screen.findByText("Mothim");
    expect(await screen.findByText("Plant Burmy")).toBeTruthy();
    expect(await screen.findByText("Plant Wormadam")).toBeTruthy();
    expect(screen.queryByText("Sandy Burmy")).toBeNull();
    expect(screen.queryByText("Trash Burmy")).toBeNull();
    expect(container.querySelector(".evolution")?.children).toHaveLength(1);
  });

  it("propagates multiple ancestor forms to a sibling branch at an intermediate stage", async () => {
    const chain = node("burmy", [], [
      node("growlithe", [
        method({ required_pokemon_form: form("burmy-plant"), evolved_pokemon_form: form("growlithe") }),
        method({ required_pokemon_form: form("burmy-sandy"), evolved_pokemon_form: form("growlithe-hisui") }),
      ], [
        node("charizard", [method({ required_pokemon_form: form("growlithe-hisui") })]),
        node("arcanine", [method()]),
      ]),
      node("mothim", [method()]),
    ]);
    const { container } = renderChain("charizard", chain);
    await screen.findByText("Charizard");
    expect(await screen.findByText("Sandy Burmy")).toBeTruthy();
    expect(await screen.findByText("Hisuian Growlithe")).toBeTruthy();
    expect(await screen.findByText("Arcanine")).toBeTruthy();
    expect(await screen.findByText("Mothim")).toBeTruthy();
    expect(screen.queryByText("Plant Burmy")).toBeNull();
    expect(screen.queryByText("Growlithe")).toBeNull();
    expect(container.querySelector(".evolution")?.children).toHaveLength(1);
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
    ["growlithe-hisui", "Hisuian Growlithe", "Hisuian Arcanine", "Growlithe", "Arcanine"],
    ["arcanine-hisui", "Hisuian Growlithe", "Hisuian Arcanine", "Growlithe", "Arcanine"],
    ["growlithe", "Growlithe", "Arcanine", "Hisuian Growlithe", "Hisuian Arcanine"],
    ["arcanine", "Growlithe", "Arcanine", "Hisuian Growlithe", "Hisuian Arcanine"],
  ])("shows only the matching path for %s", async (slug, from, to, wrongFrom, wrongTo) => {
    renderChain(slug, growlitheChain);
    expect(await screen.findAllByText(from)).toHaveLength(1);
    expect(await screen.findAllByText(to)).toHaveLength(1);
    expect(await screen.findAllByText(/Fire Stone/i)).not.toHaveLength(0);
    expect(screen.queryByText(wrongFrom)).toBeNull();
    expect(screen.queryByText(wrongTo)).toBeNull();
    expect(document.querySelectorAll(".evolution-transition")).toHaveLength(1);
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

  it("navigates to a specific form when forms share the same Pokémon", async () => {
    renderChain("tandemaus", node("tandemaus", [], [
      node("maushold", [method({ evolved_pokemon_form: form("maushold-special") })]),
    ]));
    const card = (await screen.findByText("Maushold Special Form")).closest(".pokemon-card");
    expect(card).not.toBeNull();
    fireEvent.click(card!);
    expect(screen.getByTestId("location").textContent).toBe("/pokemon/maushold-special");
  });

  it("uses a form-name URL to select a shared Pokémon form", async () => {
    renderChain("burmy-sandy", burmyChain);
    expect(await screen.findByText("Sandy Burmy")).toBeTruthy();
    expect(await screen.findByText("Sandy Wormadam")).toBeTruthy();
    expect(screen.queryByText("Plant Burmy")).toBeNull();
  });

  it("uses the selected form for the destination header, image and types", async () => {
    setupApi(mausholdChain);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { container } = render(
      <QueryClientProvider client={client}>
        <PokemonInfoHeaderCard slug="maushold-family-of-four" selectedForm="maushold-special" />
        <TypeCard slug="maushold-family-of-four" selectedForm="maushold-special" />
      </QueryClientProvider>,
    );
    expect(await screen.findByText("Maushold Special Form")).toBeTruthy();
    expect((await screen.findByAltText("Maushold Special Form")).getAttribute("src"))
      .toBe("https://example.test/artwork/maushold-special.png");
    await waitFor(() => {
      expect(container.querySelector(".type-card__pokemon-types img")?.getAttribute("alt")).toMatch(/fire/i);
    });
  });

  it("preserves the selected form from the URL and filters incompatible outcomes", async () => {
    renderChain("maushold-family-of-four", node("tandemaus", [], [
      node("maushold", [
        method({ evolved_pokemon_form: form("maushold-family-of-four") }),
        method({ evolved_pokemon_form: form("maushold-special") }),
      ]),
    ]), "?form=maushold-special");
    await screen.findByText("Maushold Special Form");
    expect(screen.queryByText("Maushold Family of Four")).toBeNull();
  });

  it("reports a selected form that does not belong to the Pokémon", async () => {
    renderChain("maushold-family-of-four", mausholdChain, "?form=growlithe-hisui");
    expect((await screen.findByRole("alert")).textContent).toMatch(/not available/i);
  });

  it("retains different unspecified methods and hides the uncertainty disclaimer", async () => {
    renderChain("arcanine-hisui", node("growlithe", [], [
      node("arcanine", [
        method({ trigger: trigger("level-up"), min_level: 30 }),
        method({
          trigger: trigger("use-item"),
          item: item("fire-stone"),
          required_pokemon_form: form("growlithe-hisui"),
          evolved_pokemon_form: form("arcanine-hisui"),
        }),
      ]),
    ]));
    expect(await screen.findByText(/30/)).toBeTruthy();
    expect(await screen.findByText(/Fire Stone/i)).toBeTruthy();
    const disclaimer = screen.getByText(/form applicability may vary/i);
    expect(disclaimer.hasAttribute("hidden")).toBe(true);
  });

  it("retains an unspecified method if the explicit alternative conflicts with a later form", async () => {
    renderChain("growlithe-hisui", node("growlithe", [], [
      node("arcanine", [
        method({ trigger: trigger("use-item"), item: item("fire-stone") }),
        method({
          trigger: trigger("use-item"),
          item: item("fire-stone"),
          required_pokemon_form: form("growlithe-hisui"),
          evolved_pokemon_form: form("arcanine-hisui"),
        }),
      ], [
        node("charizard", [method({ required_pokemon_form: form("arcanine") })]),
      ]),
    ]));
    await screen.findByText("Charizard");
    expect(screen.getByText("Hisuian Growlithe")).toBeTruthy();
    expect(screen.getByText("Arcanine")).toBeTruthy();
    expect(screen.queryByText("Hisuian Arcanine")).toBeNull();
  });

  it("does not discard methods with complementary form constraints", async () => {
    renderChain("arcanine-hisui", node("growlithe", [], [
      node("arcanine", [
        method({ required_pokemon_form: form("growlithe-hisui") }),
        method({ evolved_pokemon_form: form("arcanine-hisui") }),
      ]),
    ]));
    expect(await screen.findAllByText("Hisuian Arcanine")).toHaveLength(2);
    expect(await screen.findByText("Hisuian Growlithe")).toBeTruthy();
    expect(await screen.findByText("Growlithe")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("filters incompatible intermediate forms in a multi-stage path", async () => {
    renderChain("growlithe", node("growlithe", [], [
      node("arcanine", [method({ evolved_pokemon_form: form("arcanine-hisui") })], [
        node("charizard", [method({ required_pokemon_form: form("arcanine") })]),
      ]),
    ]));
    expect((await screen.findByRole("alert")).textContent).toMatch(/no evolution path/i);
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
    expect(screen.getByText(/form unspecified; showing the default variety/i).hasAttribute("hidden")).toBe(true);
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

  it("displays additional boolean and gender conditions", async () => {
    renderChain("charmander", node("charmander", [], [
      node("charmeleon", [method({ gender: 1, needs_overworld_rain: true, turn_upside_down: true })]),
    ]));
    await screen.findByText("Charmeleon");
    expect(screen.getByText(/female/i)).toBeTruthy();
    expect(screen.getByText(/raining/i)).toBeTruthy();
    expect(screen.getByText(/upside down/i)).toBeTruthy();
  });

  it("uses the supplied move and count for style-move evolution", async () => {
    renderChain("charmander", node("charmander", [], [
      node("charmeleon", [method({
        trigger: trigger("agile-style-move"),
        used_move: resource("move", "psyshield-bash"),
        min_move_count: 20,
      })]),
    ]));
    expect(await screen.findByText(/Psyshield Bash.*Agile Style/i)).toBeTruthy();
    expect(screen.getByText(/20 times/i)).toBeTruthy();
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

  describe("resolvePokemonForm", () => {
    it("finds the default form even when it is not first", async () => {
      setupApi(mausholdChain);
      const pokemon = await api.getPokemonByName("maushold-family-of-four");
      pokemon.forms.reverse();
      expect((await resolvePokemonForm(pokemon, null)).name).toBe("maushold-family-of-four");
    });

    describe("resolvePokemon", () => {
      it("resolves form names to their associated Pokémon", async () => {
        setupApi(burmyChain);
        const result = await resolvePokemon("burmy-sandy");
        expect(result.pokemon.name).toBe("burmy");
        expect(result.form.name).toBe("burmy-sandy");
      });

      it("preserves old Pokémon links and explicit query forms", async () => {
        setupApi(burmyChain);
        expect((await resolvePokemon("burmy")).form.name).toBe("burmy-plant");
        expect((await resolvePokemon("burmy", "burmy-trash")).form.name).toBe("burmy-trash");
      });

      it("does not mistake network failures for missing Pokémon", async () => {
        setupApi(burmyChain);
        api.getPokemonByName.mockRejectedValue(new Error("Network unavailable"));
        await expect(resolvePokemon("burmy-sandy")).rejects.toThrow("Network unavailable");
        expect(api.getPokemonFormByName).not.toHaveBeenCalled();
      });

      it("uses official form artwork, then the form sprite, without substituting another form", async () => {
        setupApi(burmyChain);
        const { pokemon, form: formData } = await resolvePokemon("burmy-sandy");
        expect(formArtwork(formData, pokemon)).toBe("https://example.test/artwork/burmy-sandy.png");
        const noOfficial = { ...formData, sprites: { ...formData.sprites, other: undefined } };
        expect(formArtwork(noOfficial, pokemon)).toBe("https://example.test/burmy-sandy.png");
        const noImage = { ...noOfficial, sprites: { ...noOfficial.sprites, front_default: null } };
        expect(formArtwork(noImage, pokemon)).toBeUndefined();
      });
    });

    describe("Alternative Forms", () => {
      function renderForms(slug: string) {
        setupApi(burmyChain);
        const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
        return render(
          <QueryClientProvider client={client}>
            <MemoryRouter initialEntries={[`/pokemon/${slug}`]}>
              <OtherForms slug={slug} />
              <CurrentLocation />
            </MemoryRouter>
          </QueryClientProvider>,
        );
      }

      it("lists other forms of one Pokémon and navigates to the form slug", async () => {
        renderForms("burmy");
        const sandy = await screen.findByText("Sandy Burmy");
        expect(await screen.findByText("Trash Burmy")).toBeTruthy();
        expect(screen.queryByText("Plant Burmy")).toBeNull();
        const card = sandy.closest(".pokemon-card");
        expect(card).not.toBeNull();
        expect(card?.querySelector("img.image")?.getAttribute("src")).toBe("https://example.test/artwork/burmy-sandy.png");
        fireEvent.click(card!);
        expect(screen.getByTestId("location").textContent).toBe("/pokemon/burmy-sandy");
      });

      it("includes the default form when viewing another form", async () => {
        renderForms("burmy-sandy");
        expect(await screen.findByText("Plant Burmy")).toBeTruthy();
        expect(await screen.findByText("Trash Burmy")).toBeTruthy();
        expect(screen.queryByText("Sandy Burmy")).toBeNull();
      });

      it("lists different Pokémon varieties and excludes the selected form", async () => {
        renderForms("growlithe");
        expect(await screen.findByText("Hisuian Growlithe")).toBeTruthy();
        expect(screen.queryByText("Growlithe")).toBeNull();
      });

      it("deduplicates forms returned by more than one variety", async () => {
        renderForms("growlithe");
        const load = api.getPokemonByName.getMockImplementation()!;
        api.getPokemonByName.mockImplementation(async (name: string) => {
          const pokemon = await load(name);
          if (name === "growlithe-hisui") {
            return { ...pokemon, forms: [...pokemon.forms, form("growlithe-hisui")] };
          }
          return pokemon;
        });
        expect(await screen.findAllByText("Hisuian Growlithe")).toHaveLength(1);
      });

      it("renders a clear error if a variety cannot be loaded", async () => {
        renderForms("growlithe");
        const load = api.getPokemonByName.getMockImplementation()!;
        api.getPokemonByName.mockImplementation((name: string) =>
          name === "growlithe-hisui" ? Promise.reject(new Error("Variety unavailable")) : load(name),
        );
        expect((await screen.findByRole("alert")).textContent).toMatch(/Variety unavailable/);
      });
    });

    it("rejects a multiple-form Pokémon without a default form", async () => {
      setupApi(mausholdChain);
      const pokemon = await api.getPokemonByName("maushold-family-of-four");
      const resolveResource = api.resource.getMockImplementation()!;
      api.resource.mockImplementation(async (url: string) => {
        const result = await resolveResource(url);
        return url.includes("pokemon-form") ? { ...result, is_default: false } : result;
      });
      await expect(resolvePokemonForm(pokemon, null)).rejects.toThrow(/no default form/i);
    });
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
