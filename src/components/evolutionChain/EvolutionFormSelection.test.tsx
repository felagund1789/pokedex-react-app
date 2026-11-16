// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import EvolutionChain from "./EvolutionChain";

const mocks = vi.hoisted(() => ({
  chain: vi.fn(),
  pokemon: vi.fn(),
}));

vi.mock("../../hooks/useEvolutionChain", () => ({ default: mocks.chain }));
vi.mock("../../hooks/usePokemonInfo", () => ({ default: mocks.pokemon }));
vi.mock("../../hooks/useDefaultPokemonForm", () => ({
  default: (species: { name: string }) => ({ data: species.name }),
}));
vi.mock("../pokemonCard/PokemonCard", () => ({
  default: ({ slug, onClick }: { slug: string; onClick: () => void }) =>
    <button onClick={onClick}>{slug}</button>,
}));
vi.mock("../evolutionDetails/EvolutionDetailsCard", () => ({
  default: ({ details }: { details: { label: string } }) => <span>{details.label}</span>,
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
const node = (name: string, details: ReturnType<typeof method>[] = [], children: Node[] = []): Node => ({
  species: resource(name),
  evolution_details: details,
  evolves_to: children,
});

function Location() {
  const { pathname } = useLocation();
  return <div data-testid="location">{pathname}</div>;
}

function renderChain(form: string, species: string, chain: Node) {
  mocks.chain.mockReturnValue({ data: { chain }, error: null });
  mocks.pokemon.mockReturnValue({ pokemonForm: { name: form }, pokemonSpecies: { name: species } });
  return render(
    <MemoryRouter>
      <EvolutionChain slug={form} />
      <Location />
    </MemoryRouter>,
  );
}

afterEach(cleanup);

describe("form-specific evolution selection", () => {
  const chain = node("growlithe", [], [
    node("arcanine", [
      method("default method"),
      method("Hisuian method", "growlithe-hisui", "arcanine-hisui"),
    ]),
  ]);

  it("uses the source form and navigates to its evolved form", () => {
    renderChain("growlithe-hisui", "growlithe", chain);
    expect(screen.getByText("Hisuian method")).toBeTruthy();
    expect(screen.queryByText("default method")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "arcanine-hisui" }));
    expect(screen.getByTestId("location").textContent).toBe("/pokemon/arcanine-hisui");
  });

  it("uses the evolved form to infer its required source form", () => {
    renderChain("arcanine-hisui", "arcanine", chain);
    expect(screen.getByText("growlithe-hisui")).toBeTruthy();
    expect(screen.getByText("Hisuian method")).toBeTruthy();
    expect(screen.queryByText("default method")).toBeNull();
  });

  it("matches a method with only a required form", () => {
    renderChain("growlithe-hisui", "growlithe", node("growlithe", [], [
      node("arcanine", [method("default method"), method("required form", "growlithe-hisui")]),
    ]));
    expect(screen.getByText("required form")).toBeTruthy();
    expect(screen.getByText("arcanine")).toBeTruthy();
    expect(screen.queryByText("default method")).toBeNull();
  });

  it("matches a method with only an evolved form", () => {
    renderChain("arcanine-hisui", "arcanine", node("growlithe", [], [
      node("arcanine", [method("default method"), method("evolved form", undefined, "arcanine-hisui")]),
    ]));
    expect(screen.getByText("evolved form")).toBeTruthy();
    expect(screen.getByText("growlithe")).toBeTruthy();
    expect(screen.queryByText("default method")).toBeNull();
  });

  it("falls back to the species method when no form matches", () => {
    renderChain("growlithe-other", "growlithe", chain);
    expect(screen.getByText("default method")).toBeTruthy();
    expect(screen.getByText("arcanine")).toBeTruthy();
    expect(screen.queryByText("Hisuian method")).toBeNull();
  });

  it("propagates inferred forms across multiple transitions", () => {
    renderChain("charizard-special", "charizard", node("charmander", [], [
      node("charmeleon", [method("first", "charmander-special", "charmeleon-special")], [
        node("charizard", [method("second", "charmeleon-special", "charizard-special")]),
      ]),
    ]));
    expect(screen.getByText("charmander-special")).toBeTruthy();
    expect(screen.getByText("charmeleon-special")).toBeTruthy();
    expect(screen.getByText("charizard-special")).toBeTruthy();
    expect(screen.getByText("first")).toBeTruthy();
    expect(screen.getByText("second")).toBeTruthy();
  });
});
