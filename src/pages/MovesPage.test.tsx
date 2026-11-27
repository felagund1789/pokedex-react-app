// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import usePokemonStore from "../store";
import MovesPage from "./MovesPage";

const mocks = vi.hoisted(() => ({
  getTypesList: vi.fn(),
  getMovesList: vi.fn(),
  getTypeByName: vi.fn(),
  getMoveDamageClassByName: vi.fn(),
  getMoveByName: vi.fn(),
}));

vi.mock("../services/pokedexService", () => ({ default: mocks }));
vi.mock("../components/header/PageHeader", () => ({ default: () => <header /> }));

const Location = () => {
  const location = useLocation();
  const navigate = useNavigate();
  return <><span data-testid="location">{location.search}</span><button onClick={() => navigate(-1)}>Back</button></>;
};

const renderPage = (url: string) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[url]}>
        <Location />
        <MovesPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
  vi.restoreAllMocks();
  document.documentElement.scrollTop = 0;
  usePokemonStore.setState({ language: "en" });
});

describe("moves page", () => {
  it.each(["stellar", "unknown", "shadow"])("excludes %s from the type filter", async (excludedType) => {
    mocks.getTypesList.mockResolvedValue({
      results: ["fire", "water", "stellar", "unknown", "shadow"].map((name) => ({ name })),
    });
    mocks.getMovesList.mockResolvedValue({ results: [] });
    renderPage(`/moves?type=${excludedType}`);
    const select = screen.getByRole("combobox", { name: "Type" }) as HTMLSelectElement;
    await within(select).findByRole("option", { name: "Fire" });
    expect(within(select).getByRole("option", { name: "Water" })).toBeTruthy();
    expect(within(select).getAllByRole("option")).toHaveLength(3);
    expect(select.value).toBe("");
    await screen.findByText("No moves match the current filters.");
    expect(mocks.getTypeByName).not.toHaveBeenCalled();
  });

  it("restores and searches move names alongside filters, preserving unrelated parameters", async () => {
    mocks.getTypesList.mockResolvedValue({ results: [{ name: "fire" }] });
    mocks.getMovesList.mockResolvedValue({ results: [{ name: "flame-charge" }, { name: "ember" }, { name: "water-gun" }] });
    mocks.getTypeByName.mockResolvedValue({ moves: [{ name: "flame-charge" }, { name: "ember" }] });
    mocks.getMoveDamageClassByName.mockResolvedValue({ moves: [{ name: "flame-charge" }, { name: "ember" }, { name: "water-gun" }] });
    mocks.getMoveByName.mockImplementation(async (name: string) => ({
      type: { name: "fire" }, damage_class: { name: "special" },
      names: [{ name, language: { name: "en" } }], flavor_text_entries: [], effect_entries: [],
      power: 40, pp: 20, accuracy: 100,
    }));

    renderPage("/moves?type=fire&damageClass=special&search=FLAME+CHARGE&other=keep");
    const input = screen.getByRole("textbox", { name: "Search for moves" }) as HTMLInputElement;
    expect(input.value).toBe("FLAME CHARGE");
    await screen.findByRole("heading", { name: "flame-charge" });
    expect(screen.queryByRole("heading", { name: "ember" })).toBeNull();
    fireEvent.change(input, { target: { value: "ember" } });
    await screen.findByRole("heading", { name: "ember" });
    expect(screen.queryByRole("heading", { name: "flame-charge" })).toBeNull();
    expect(screen.getByTestId("location").textContent).toBe("?type=fire&damageClass=special&search=ember&other=keep");
    fireEvent.change(input, { target: { value: "no match" } });
    expect(await screen.findByText("No moves match the current filters.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    await screen.findByRole("heading", { name: "flame-charge" });
    expect(screen.getByTestId("location").textContent).toBe("?type=fire&damageClass=special&other=keep");
  });

  it("keeps a filter changed while a search is pending", async () => {
    mocks.getTypesList.mockResolvedValue({ results: [{ name: "fire" }, { name: "water" }] });
    mocks.getMovesList.mockResolvedValue({ results: [{ name: "water-gun" }] });
    mocks.getTypeByName.mockResolvedValue({ moves: [{ name: "water-gun" }] });
    mocks.getMoveByName.mockResolvedValue({
      type: { name: "water" }, damage_class: { name: "special" },
      names: [{ name: "water-gun", language: { name: "en" } }], flavor_text_entries: [], effect_entries: [],
      power: 40, pp: 20, accuracy: 100,
    });
    renderPage("/moves?other=keep");
    await screen.findByRole("heading", { name: "water-gun" });
    fireEvent.change(screen.getByRole("textbox", { name: "Search for moves" }), { target: { value: "water" } });
    fireEvent.change(screen.getByLabelText("Type"), { target: { value: "water" } });
    await waitFor(() => expect(screen.getByTestId("location").textContent).toBe("?other=keep&type=water&search=water"));
  });

  it("restores search from browser history", async () => {
    mocks.getTypesList.mockResolvedValue({ results: [{ name: "fire" }] });
    mocks.getMovesList.mockResolvedValue({ results: [{ name: "ember" }, { name: "flame-charge" }] });
    mocks.getTypeByName.mockResolvedValue({ moves: [{ name: "ember" }, { name: "flame-charge" }] });
    mocks.getMoveByName.mockImplementation(async (name: string) => ({
      type: { name: "fire" }, damage_class: { name: "special" },
      names: [{ name, language: { name: "en" } }], flavor_text_entries: [], effect_entries: [],
      power: 40, pp: 20, accuracy: 100,
    }));
    renderPage("/moves?search=ember");
    const input = screen.getByRole("textbox", { name: "Search for moves" }) as HTMLInputElement;
    await screen.findByRole("heading", { name: "ember" });
    fireEvent.change(screen.getByLabelText("Type"), { target: { value: "fire" } });
    fireEvent.change(input, { target: { value: "flame" } });
    await screen.findByRole("heading", { name: "flame-charge" });
    fireEvent.click(screen.getByText("Back"));
    await waitFor(() => expect(input.value).toBe("ember"));
    await screen.findByRole("heading", { name: "ember" });
    expect(screen.queryByRole("heading", { name: "flame-charge" })).toBeNull();
  });

  it("restores and combines URL filters, updates the URL, and responds to history", async () => {
    mocks.getTypesList.mockResolvedValue({ results: [{ name: "fire" }, { name: "water" }] });
    mocks.getMovesList.mockResolvedValue({ results: [{ name: "ember" }, { name: "flame-charge" }, { name: "water-gun" }] });
    mocks.getTypeByName.mockImplementation(async (name: string) => ({
      moves: name === "fire" ? [{ name: "ember" }, { name: "flame-charge" }] : [{ name: "water-gun" }],
    }));
    mocks.getMoveDamageClassByName.mockResolvedValue({ moves: [{ name: "ember" }, { name: "water-gun" }] });
    mocks.getMoveByName.mockImplementation(async (name: string) => ({
      type: { name: name === "water-gun" ? "water" : "fire" },
      damage_class: { name: "special" }, names: [{ name, language: { name: "en" } }],
      flavor_text_entries: [], effect_entries: [], power: 40, pp: 25, accuracy: 100,
    }));

    renderPage("/moves?type=fire&damageClass=special&other=keep");
    await screen.findByRole("heading", { name: "ember" });
    expect(screen.queryByRole("heading", { name: "flame-charge" })).toBeNull();
    expect((screen.getByLabelText("Type") as HTMLSelectElement).value).toBe("fire");
    expect((screen.getByLabelText("Damage class") as HTMLSelectElement).value).toBe("special");
    fireEvent.change(screen.getByLabelText("Type"), { target: { value: "water" } });
    await screen.findByRole("heading", { name: "water-gun" });
    expect(screen.getByTestId("location").textContent).toBe("?type=water&damageClass=special&other=keep");
    fireEvent.change(screen.getByLabelText("Damage class"), { target: { value: "" } });
    expect(screen.getByTestId("location").textContent).toBe("?type=water&other=keep");
    fireEvent.click(screen.getByText("Back"));
    await waitFor(() => expect((screen.getByLabelText("Damage class") as HTMLSelectElement).value).toBe("special"));
  });

  it("renders localized move information, substitutes effect chance, and falls back when missing", async () => {
    mocks.getTypesList.mockResolvedValue({ results: [{ name: "fire" }] });
    mocks.getMovesList.mockResolvedValue({ results: [{ name: "ember" }] });
    mocks.getMoveByName.mockResolvedValue({
      type: { name: "fire" }, damage_class: { name: "special" },
      names: [{ language: { name: "en" }, name: "Ember" }, { language: { name: "fr" }, name: "Flammèche" }],
      flavor_text_entries: [{ language: { name: "fr" }, flavor_text: "Un jet\nde flammes." }],
      effect_entries: [{ language: { name: "en" }, short_effect: "Has a $effect_chance% chance to burn." }],
      effect_chance: 10, power: 40, pp: 25, accuracy: null,
    });
    usePokemonStore.setState({ language: "fr" });
    renderPage("/moves");
    await screen.findByRole("heading", { name: "Flammèche" });
    expect(screen.getByText("Un jet de flammes.")).toBeTruthy();
    expect(screen.getByText(/Has a 10% chance to burn/)).toBeTruthy();
    expect(screen.getByText("25")).toBeTruthy();
    expect(screen.getByText("—")).toBeTruthy();
    act(() => usePokemonStore.setState({ language: "en" }));
    expect(screen.getByRole("heading", { name: "Ember" })).toBeTruthy();
  });

  it("shows loading failures instead of an empty result", async () => {
    mocks.getTypesList.mockRejectedValue(new Error("network unavailable"));
    renderPage("/moves");
    expect(await screen.findByText("Error loading moves: network unavailable")).toBeTruthy();
    expect(screen.queryByText("No moves match the current filters.")).toBeNull();
  });

  it("loads moves on scroll and resets the visible count when filtering", async () => {
    vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(2000);
    vi.spyOn(window.screen, "availHeight", "get").mockReturnValue(800);
    const moves = Array.from({ length: 25 }, (_, index) => ({ name: `move-${index}` }));
    mocks.getTypesList.mockResolvedValue({ results: [{ name: "fire" }] });
    mocks.getMovesList.mockResolvedValue({ results: moves });
    mocks.getTypeByName.mockResolvedValue({ moves });
    mocks.getMoveByName.mockImplementation(async (name: string) => ({
      type: { name: "fire" }, damage_class: { name: "physical" },
      names: [{ name, language: { name: "en" } }], flavor_text_entries: [], effect_entries: [],
      power: null, pp: 10, accuracy: null,
    }));
    renderPage("/moves");
    await screen.findByRole("heading", { name: "move-19" });
    expect(screen.queryByRole("heading", { name: "move-20" })).toBeNull();
    document.documentElement.scrollTop = 1200;
    fireEvent.scroll(window);
    await screen.findByRole("heading", { name: "move-24" });
    expect(screen.queryByRole("button", { name: "Load more" })).toBeNull();
    fireEvent.change(screen.getByLabelText("Type"), { target: { value: "fire" } });
    await waitFor(() => expect(screen.queryByRole("heading", { name: "move-24" })).toBeNull());
    await screen.findByRole("heading", { name: "move-19" });
    fireEvent.scroll(window);
    await screen.findByRole("heading", { name: "move-24" });
  });
});
