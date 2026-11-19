// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { PokemonSpecies } from "pokeapi-js-wrapper";
import PokemonSpeciesDesignation from "./PokemonSpeciesDesignation";

afterEach(cleanup);

describe("PokemonSpeciesDesignation", () => {
  it("shows each designation set on the species", () => {
    render(
      <PokemonSpeciesDesignation
        species={{ is_baby: true, is_legendary: true, is_mythical: true } as PokemonSpecies}
      />,
    );

    expect(screen.getByRole("group", { name: "Special designation" })).toBeTruthy();
    expect(screen.getByText("Baby")).toBeTruthy();
    expect(screen.getByText("Legendary")).toBeTruthy();
    expect(screen.getByText("Mythical")).toBeTruthy();
  });

  it("shows no badge when the species has no special designations", () => {
    const { container } = render(
      <PokemonSpeciesDesignation
        species={{ is_baby: false, is_legendary: false, is_mythical: false } as PokemonSpecies}
      />,
    );

    expect(container.firstChild).toBeNull();
  });
});
