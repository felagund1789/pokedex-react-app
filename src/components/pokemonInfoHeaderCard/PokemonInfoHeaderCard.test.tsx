// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PokemonInfoHeaderCard from "./PokemonInfoHeaderCard";

const { usePokemonInfo } = vi.hoisted(() => ({ usePokemonInfo: vi.fn() }));
vi.mock("../../hooks/usePokemonInfo", () => ({ default: usePokemonInfo }));
vi.mock("../../hooks/usePokemonColor", () => ({ default: () => undefined }));
vi.mock("../pokemonSpeciesDesignation/PokemonSpeciesDesignation", () => ({ default: () => null }));

beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  usePokemonInfo.mockReset();
});

describe("PokemonInfoHeaderCard cries", () => {
  it("plays the selected Pokémon's latest cry and restarts it on another click", () => {
    usePokemonInfo.mockReturnValue({
      pokemonName: "Pikachu",
      pokemon: { cries: { latest: "https://example.com/latest.ogg", legacy: "https://example.com/legacy.ogg" } },
      types: [],
    });
    const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
    const { container } = render(<PokemonInfoHeaderCard slug="pikachu" />);
    const audio = container.querySelector("audio")!;

    expect(audio.src).toBe("https://example.com/latest.ogg");
    audio.currentTime = 2;
    fireEvent.click(screen.getByRole("button", { name: "Play cry" }));
    expect(audio.currentTime).toBe(0);
    fireEvent.click(screen.getByRole("button", { name: "Play cry" }));
    expect(play).toHaveBeenCalledTimes(2);
  });

  it("uses the legacy cry when the latest cry is unavailable and updates for another Pokémon", () => {
    const pause = vi.mocked(HTMLMediaElement.prototype.pause);
    usePokemonInfo.mockReturnValue({
      pokemon: { cries: { latest: null, legacy: "https://example.com/legacy.ogg" } },
      types: [],
    });
    const { container, rerender } = render(<PokemonInfoHeaderCard slug="first" />);
    expect(container.querySelector("audio")?.src).toBe("https://example.com/legacy.ogg");
    const oldAudio = container.querySelector("audio");

    usePokemonInfo.mockReturnValue({
      pokemon: { cries: { latest: "https://example.com/second.ogg", legacy: null } },
      types: [],
    });
    rerender(<PokemonInfoHeaderCard slug="second" />);
    expect(container.querySelector("audio")?.src).toBe("https://example.com/second.ogg");
    expect(pause).toHaveBeenCalledOnce();
    expect(pause.mock.instances[0]).toBe(oldAudio);
  });

  it("disables playback when there is no cry", () => {
    usePokemonInfo.mockReturnValue({ pokemon: {}, types: [] });
    render(<PokemonInfoHeaderCard slug="missing" />);
    expect((screen.getByRole("button", { name: "Play cry" }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.queryByTitle("Cry unavailable")).toBeTruthy();
  });

  it("reports playback failures and clears the error on retry", async () => {
    usePokemonInfo.mockReturnValue({
      pokemon: { cries: { latest: "https://example.com/cry.ogg", legacy: null } },
      types: [],
    });
    vi.spyOn(HTMLMediaElement.prototype, "play")
      .mockRejectedValueOnce(new Error("Playback failed"))
      .mockResolvedValueOnce();
    const { container } = render(<PokemonInfoHeaderCard slug="pikachu" />);
    const button = screen.getByRole("button", { name: "Play cry" });

    fireEvent.click(button);
    expect((await screen.findByRole("alert")).textContent).toBe("Could not play cry.");
    fireEvent.click(button);
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());

    fireEvent.error(container.querySelector("audio")!);
    expect(screen.getByRole("alert").textContent).toBe("Could not play cry.");
  });
});
