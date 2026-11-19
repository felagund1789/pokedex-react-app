// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import usePokemonInfo from "../../hooks/usePokemonInfo";
import PokemonBreedingCard from "./PokemonBreedingCard";

vi.mock("../../hooks/usePokemonInfo", () => ({ default: vi.fn() }));

afterEach(cleanup);

describe("PokemonBreedingCard", () => {
  const renderSpecies = (genderRate: number) => {
    vi.mocked(usePokemonInfo).mockReturnValue({
      pokemonSpecies: {
        gender_rate: genderRate,
        hatch_counter: 0,
        egg_groups: [{ name: "field" }, { name: "water-1" }],
      },
    } as ReturnType<typeof usePokemonInfo>);
    return render(<PokemonBreedingCard slug="example" />);
  };

  it.each([
    [0, 100, 0],
    [1, 87.5, 12.5],
    [4, 50, 50],
    [8, 0, 100],
  ])("converts female eighths %i to %i%% male", (rate, male, female) => {
    const { container } = renderSpecies(rate);
    expect(screen.getByText("0")).toBeTruthy();
    expect(screen.getByText("field, water 1")).toBeTruthy();
    expect(screen.getByRole("img", { name: `Female ${female}%, male ${male}%` })).toBeTruthy();
    expect((container.querySelector(".pokemon-breeding-card__male") as HTMLElement).style.width)
      .toBe(`${male}%`);
    expect(screen.getByText(`${female}% female / ${male}% male`)).toBeTruthy();
  });

  it("shows genderless without a ratio bar", () => {
    renderSpecies(-1);
    expect(screen.getByText("Genderless")).toBeTruthy();
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("does not display breeding values while species data is loading", () => {
    vi.mocked(usePokemonInfo).mockReturnValue({} as ReturnType<typeof usePokemonInfo>);
    render(<PokemonBreedingCard slug="example" />);
    expect(screen.getByText("Breeding")).toBeTruthy();
    expect(screen.queryByText("Genderless")).toBeNull();
    expect(screen.queryByRole("img")).toBeNull();
  });
});
