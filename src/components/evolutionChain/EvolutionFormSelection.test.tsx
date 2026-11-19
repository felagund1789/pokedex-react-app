// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
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
  evolution_details: (ReturnType<typeof method> & { min_level?: number; time_of_day?: string })[];
  evolves_to: Node[];
}
const node = (name: string, details: Node["evolution_details"] = [], children: Node[] = []): Node => ({
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
    expect(screen.getByText("default method")).toBeTruthy();
    expect(screen.getByText("arcanine")).toBeTruthy();
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

  it("renders a separate transition for each compatible destination form", () => {
    const rockruff = node("rockruff", [], [
      node("lycanroc", [
        method("midday", "rockruff", "lycanroc-midday"),
        method("midnight", "rockruff", "lycanroc-midnight"),
        method("dusk", "rockruff-own-tempo", "lycanroc-dusk"),
      ]),
      node("other", [method("other species")]),
    ]);

    renderChain("rockruff", "rockruff", rockruff);
    for (const [form, label] of [["lycanroc-midday", "midday"], ["lycanroc-midnight", "midnight"]]) {
      const card = screen.getByRole("button", { name: form });
      const transition = card.closest<HTMLElement>(".evolution-transition");
      if (!transition) throw new Error(`Missing transition for ${form}`);
      expect(within(transition).getByText(label)).toBeTruthy();
    }
    expect(screen.queryByText("dusk")).toBeNull();
    expect(screen.queryByText("lycanroc-dusk")).toBeNull();
    expect(screen.getByText("other species")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "lycanroc-midnight" }));
    expect(screen.getByTestId("location").textContent).toBe("/pokemon/lycanroc-midnight");
  });

  it("shows all destination forms compatible with the selected form's source", () => {
    renderChain("lycanroc-midnight", "lycanroc", node("rockruff", [], [
      node("lycanroc", [
        method("midday", "rockruff", "lycanroc-midday"),
        method("midnight", "rockruff", "lycanroc-midnight"),
        method("dusk", "rockruff-own-tempo", "lycanroc-dusk"),
      ]),
    ]));
    expect(screen.getByText("rockruff")).toBeTruthy();
    expect(screen.getByText("midnight")).toBeTruthy();
    expect(screen.getByText("lycanroc-midnight")).toBeTruthy();
    expect(screen.getByText("midday")).toBeTruthy();
    expect(screen.getByText("lycanroc-midday")).toBeTruthy();
    expect(screen.queryByText("dusk")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "lycanroc-midday" }));
    expect(screen.getByTestId("location").textContent).toBe("/pokemon/lycanroc-midday");
  });

  it("infers an alternate source form from a selected evolved form", () => {
    renderChain("lycanroc-dusk", "lycanroc", node("rockruff", [], [
      node("lycanroc", [
        method("midday", "rockruff", "lycanroc-midday"),
        method("midnight", "rockruff", "lycanroc-midnight"),
        method("dusk", "rockruff-own-tempo", "lycanroc-dusk"),
      ]),
    ]));
    expect(screen.getByText("rockruff-own-tempo")).toBeTruthy();
    expect(screen.getByText("lycanroc-dusk")).toBeTruthy();
    expect(screen.getByText("dusk")).toBeTruthy();
    expect(screen.queryByText("midday")).toBeNull();
    expect(screen.queryByText("midnight")).toBeNull();
  });

  it("uses only the destination compatible with an alternate source form", () => {
    renderChain("rockruff-own-tempo", "rockruff", node("rockruff", [], [
      node("lycanroc", [
        method("midday", "rockruff", "lycanroc-midday"),
        method("midnight", "rockruff", "lycanroc-midnight"),
        method("dusk", "rockruff-own-tempo", "lycanroc-dusk"),
      ]),
    ]));
    expect(screen.getByText("dusk")).toBeTruthy();
    expect(screen.getByText("lycanroc-dusk")).toBeTruthy();
    expect(screen.queryByText("midday")).toBeNull();
    expect(screen.queryByText("midnight")).toBeNull();
  });

  it("groups destination-only methods and retains a neutral default branch", () => {
    renderChain("source", "source", node("source", [], [
      node("target", [
        { ...method("complex first", undefined, "target-first"), min_level: 20, time_of_day: "day" },
        { ...method("simple first", undefined, "target-first"), min_level: 20 },
        method("second", undefined, "target-second"),
        method("neutral"),
      ]),
    ]));
    expect(screen.getByText("target-first")).toBeTruthy();
    expect(screen.getByText("simple first")).toBeTruthy();
    expect(screen.queryByText("complex first")).toBeNull();
    expect(screen.getByText("target-second")).toBeTruthy();
    expect(screen.getByText("second")).toBeTruthy();
    expect(screen.getByText("target")).toBeTruthy();
    expect(screen.getByText("neutral")).toBeTruthy();
  });

  it("propagates each destination form to its subsequent transition", () => {
    renderChain("source", "source", node("source", [], [
      node("middle", [
        method("first path", "source", "middle-first"),
        method("second path", "source", "middle-second"),
      ], [
        node("target", [
          method("first ending", "middle-first", "target-first"),
          method("second ending", "middle-second", "target-second"),
        ]),
      ]),
    ]));
    expect(screen.getByText("first ending")).toBeTruthy();
    expect(screen.getByText("target-first")).toBeTruthy();
    expect(screen.getByText("second ending")).toBeTruthy();
    expect(screen.getByText("target-second")).toBeTruthy();
  });

  it("preserves compatible branches across stages when viewing an evolved form", () => {
    renderChain("target-first", "target", node("source", [], [
      node("middle", [
        method("first path", "source", "middle-first"),
        method("second path", "source", "middle-second"),
        method("third path", "source", "middle-third"),
      ], [
        node("target", [
          method("first ending", "middle-first", "target-first"),
          method("second ending", "middle-second", "target-second"),
        ]),
      ]),
    ]));
    const first = screen.getByText("middle-first").closest<HTMLElement>(".evolution-transition");
    const second = screen.getByText("middle-second").closest<HTMLElement>(".evolution-transition");
    const third = screen.getByText("middle-third").closest<HTMLElement>(".evolution-transition");
    if (!first || !second || !third) throw new Error("Missing middle-form transition");
    expect(within(first).getByText("target-first")).toBeTruthy();
    expect(within(first).queryByText("target-second")).toBeNull();
    expect(within(second).getByText("target-second")).toBeTruthy();
    expect(within(second).queryByText("target-first")).toBeNull();
    expect(within(third).queryByText("target-first")).toBeNull();
    expect(within(third).queryByText("target-second")).toBeNull();
  });

  it("still renders a transition when no evolution details are provided", () => {
    renderChain("source", "source", node("source", [], [node("target")]));
    expect(screen.getByText("target")).toBeTruthy();
  });
});
