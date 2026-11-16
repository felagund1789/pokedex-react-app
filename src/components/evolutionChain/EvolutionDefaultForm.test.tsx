// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import EvolutionChain from "./EvolutionChain";

const mocks = vi.hoisted(() => ({ chain: vi.fn(), pokemon: vi.fn(), resource: vi.fn() }));
vi.mock("../../hooks/useEvolutionChain", () => ({ default: mocks.chain }));
vi.mock("../../hooks/usePokemonInfo", () => ({ default: mocks.pokemon }));
vi.mock("../../services/pokedexService", () => ({ default: { resource: mocks.resource } }));
vi.mock("../pokemonCard/PokemonCard", () => ({
  default: ({ slug, onClick }: { slug: string; onClick: () => void }) =>
    <button onClick={onClick}>{slug}</button>,
}));
vi.mock("../evolutionDetails/EvolutionDetailsCard", () => ({
  default: ({ details }: { details: { label: string } }) => <span>{details.label}</span>,
}));

const resource = (kind: string, name: string) => ({ name, url: `${kind}/${name}` });
const method = (label: string, required?: string, evolved?: string) => ({
  label,
  trigger: resource("trigger", "level-up"),
  required_pokemon_form: required ? resource("form", required) : null,
  evolved_pokemon_form: evolved ? resource("form", evolved) : null,
});
const chain = {
  species: resource("species", "burmy"),
  evolves_to: [
    {
      species: resource("species", "wormadam"),
      evolution_details: [
        method("sandy", "burmy-sandy", "wormadam-sandy"),
        method("plant", "burmy-plant", "wormadam-plant"),
      ],
      evolves_to: [],
    },
    {
      species: resource("species", "mothim"),
      evolution_details: [method("mothim method")],
      evolves_to: [],
    },
  ],
};

function Location() {
  return <div data-testid="location">{useLocation().pathname}</div>;
}

function renderChain(form = "mothim", species = "mothim") {
  mocks.chain.mockReturnValue({ data: { chain }, error: null });
  mocks.pokemon.mockReturnValue({ pokemonForm: { name: form }, pokemonSpecies: { name: species } });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <EvolutionChain slug={form} />
        <Location />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe("default evolution forms", () => {
  it("uses the default variety and default form for an unspecified ancestor", async () => {
    const resources: Record<string, unknown> = {
      "species/burmy": { varieties: [
        { is_default: false, pokemon: resource("pokemon", "burmy-other") },
        { is_default: true, pokemon: resource("pokemon", "burmy") },
      ] },
      "pokemon/burmy": { forms: [resource("form", "burmy-sandy"), resource("form", "burmy-plant")] },
      "form/burmy-sandy": { name: "burmy-sandy", is_default: false },
      "form/burmy-plant": { name: "burmy-plant", is_default: true },
    };
    mocks.resource.mockImplementation(async (url: string) => {
      if (!(url in resources)) throw new Error(`Unexpected resource: ${url}`);
      return resources[url];
    });

    renderChain();
    expect(await screen.findByText("burmy-plant")).toBeTruthy();
    expect(await screen.findByText("wormadam-plant")).toBeTruthy();
    expect(screen.getByText("mothim")).toBeTruthy();
    expect(screen.getByText("plant")).toBeTruthy();
    expect(screen.queryByText("sandy")).toBeNull();
    fireEvent.click(screen.getByText("burmy-plant"));
    expect(screen.getByTestId("location").textContent).toBe("/pokemon/burmy-plant");
  });

  it("resolves an unspecified destination whose species name differs from its default form", async () => {
    const resources: Record<string, unknown> = {
      "species/mothim": { varieties: [{ is_default: true, pokemon: resource("pokemon", "mothim-default") }] },
      "pokemon/mothim-default": { forms: [resource("form", "mothim-default")] },
      "form/mothim-default": { name: "mothim-default", is_default: true },
    };
    mocks.resource.mockImplementation(async (url: string) => {
      if (!(url in resources)) throw new Error(`Unexpected resource: ${url}`);
      return resources[url];
    });
    renderChain("burmy-plant", "burmy");
    expect(await screen.findByText("mothim-default")).toBeTruthy();
    expect(screen.getByText("wormadam-plant")).toBeTruthy();
  });

  it("reports missing defaults rather than rendering a species as a form", async () => {
    mocks.resource.mockResolvedValue({ varieties: [] });
    renderChain();
    expect((await screen.findByRole("alert")).textContent).toContain("No default variety for burmy");
    expect(screen.queryByText("burmy")).toBeNull();
  });

  it("reports when a default variety has no default form", async () => {
    mocks.resource.mockImplementation(async (url: string) => {
      if (url === "species/burmy") {
        return { varieties: [{ is_default: true, pokemon: resource("pokemon", "burmy") }] };
      }
      if (url === "pokemon/burmy") return { forms: [resource("form", "burmy-sandy")] };
      return { name: "burmy-sandy", is_default: false };
    });
    renderChain();
    expect((await screen.findByRole("alert")).textContent).toContain("No default form for burmy");
  });
});
