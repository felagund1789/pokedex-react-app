// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import usePokemonInfo from "../../hooks/usePokemonInfo";
import PokemonBreedingCard from "./PokemonBreedingCard";

const api = vi.hoisted(() => ({ getEggGroupByName: vi.fn() }));

vi.mock("../../hooks/usePokemonInfo", () => ({ default: vi.fn() }));
vi.mock("../../services/pokedexService", () => ({ default: api }));

beforeEach(() => {
  api.getEggGroupByName.mockReset();
  api.getEggGroupByName.mockImplementation(async (name: string) => ({
    name,
    names: [{ language: { name: "en" }, name: name === "water-1" ? "water 1" : name }],
  }));
});

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

const renderCard = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<PokemonBreedingCard slug="example" />} />
          <Route path="/egg-groups/:eggGroup" element={<Location />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

const Location = () => <div>{useLocation().pathname}</div>;

describe("PokemonBreedingCard", () => {
  const renderSpecies = (genderRate: number) => {
    vi.mocked(usePokemonInfo).mockReturnValue({
      pokemonSpecies: {
        gender_rate: genderRate,
        hatch_counter: 0,
        egg_groups: [{ name: "field" }, { name: "water-1" }],
      },
    } as ReturnType<typeof usePokemonInfo>);
    return renderCard();
  };

  it.each([
    [0, 100, 0],
    [1, 87.5, 12.5],
    [4, 50, 50],
    [8, 0, 100],
  ])("converts female eighths %i to %i%% male", async (rate, male, female) => {
    const { container } = renderSpecies(rate);
    expect(screen.getByText("0")).toBeTruthy();
    expect(await screen.findByRole("link", { name: "field" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "water 1" })).toBeTruthy();
    expect(screen.getByRole("img", { name: `Female ${female}%, male ${male}%` })).toBeTruthy();
    expect((container.querySelector(".pokemon-breeding-card__male") as HTMLElement).style.width)
      .toBe(`${male}%`);
    expect(screen.getByText(`${female}% female / ${male}% male`)).toBeTruthy();
  });

  it("navigates using the selected egg group's API slug", async () => {
    renderSpecies(4);
    fireEvent.click(await screen.findByRole("link", { name: "water 1" }));
    expect(screen.getByText("/egg-groups/water-1")).toBeTruthy();
  });

  it("reports egg group loading errors", async () => {
    api.getEggGroupByName.mockRejectedValue(new Error("network error"));
    renderSpecies(4);
    expect((await screen.findByRole("alert")).textContent).toContain("network error");
  });

  it("shows genderless without a ratio bar", () => {
    renderSpecies(-1);
    expect(screen.getByText("Genderless")).toBeTruthy();
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("does not display breeding values while species data is loading", () => {
    vi.mocked(usePokemonInfo).mockReturnValue({} as ReturnType<typeof usePokemonInfo>);
    renderCard();
    expect(screen.getByText("Breeding")).toBeTruthy();
    expect(screen.queryByText("Genderless")).toBeNull();
    expect(screen.queryByRole("img")).toBeNull();
  });
});
