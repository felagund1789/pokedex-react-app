// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import usePokemonStore from "../store";
import ItemsPage from "./ItemsPage";

const mocks = vi.hoisted(() => ({
  getItemCategoriesList: vi.fn(),
  getItemPocketsList: vi.fn(),
  getItemsList: vi.fn(),
  getItemCategoryByName: vi.fn(),
  getItemPocketByName: vi.fn(),
  getItemByName: vi.fn(),
}));

vi.mock("../services/pokedexService", () => ({ default: mocks }));
vi.mock("../components/header/PageHeader", () => ({ default: () => <header /> }));

const Location = () => <span data-testid="location">{useLocation().search}</span>;

const renderPage = (url: string) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[url]}>
        <Location />
        <ItemsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

const setup = () => {
  mocks.getItemCategoriesList.mockResolvedValue({ results: [{ name: "healing" }, { name: "poke-balls" }] });
  mocks.getItemPocketsList.mockResolvedValue({ results: [{ name: "medicine" }, { name: "poke-balls" }] });
  mocks.getItemsList.mockResolvedValue({ results: [{ name: "super-potion" }, { name: "potion" }, { name: "poke-ball" }] });
  mocks.getItemPocketByName.mockImplementation(async (name: string) => ({
    categories: [{ name: name === "medicine" ? "healing" : "poke-balls" }],
  }));
  mocks.getItemCategoryByName.mockImplementation(async (name: string) => ({
    pocket: { name: name === "healing" ? "medicine" : "poke-balls" },
    items: (name === "healing" ? ["super-potion", "potion"] : ["poke-ball"]).map((item) => ({ name: item })),
  }));
  mocks.getItemByName.mockImplementation(async (name: string) => ({
    category: { name: name === "poke-ball" ? "poke-balls" : "healing" },
    sprites: { default: `https://example.com/${name}.png` },
    names: [{ name: name === "super-potion" ? "Super Potion" : name, language: { name: "en" } }],
    flavor_text_entries: [{ text: "A useful\nitem.", language: { name: "en" } }],
  }));
};

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
  usePokemonStore.setState({ language: "en" });
});

describe("items page", () => {
  it("restores and combines URL filters, displaying item details and preserving other parameters", async () => {
    setup();
    usePokemonStore.setState({ language: "fr" });
    renderPage("/items?category=healing&pocket=medicine&search=SUPER+POTION&other=keep");
    const card = (await screen.findByRole("heading", { name: "Super Potion" })).closest("article")!;
    expect(within(card).getByText("healing")).toBeTruthy();
    expect(await within(card).findByText("medicine")).toBeTruthy();
    expect(within(card).getByText("A useful item.")).toBeTruthy();
    expect(within(card).getByRole("presentation").getAttribute("src")).toBe("https://example.com/super-potion.png");
    expect(screen.queryByRole("heading", { name: "potion" })).toBeNull();
    expect((screen.getByLabelText("Category") as HTMLSelectElement).value).toBe("healing");
    expect((screen.getByLabelText("Pocket") as HTMLSelectElement).value).toBe("medicine");
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    await screen.findByRole("heading", { name: "potion" });
    expect(screen.getByTestId("location").textContent).toBe("?category=healing&pocket=medicine&other=keep");
    fireEvent.change(screen.getByLabelText("Pocket"), { target: { value: "poke-balls" } });
    await screen.findByText("No items match the current filters.");
    fireEvent.change(screen.getByLabelText("Category"), { target: { value: "" } });
    await screen.findByRole("heading", { name: "poke-ball" });
  });

  it("searches item names and keeps a filter changed while the search is pending", async () => {
    setup();
    renderPage("/items?other=keep");
    await screen.findByRole("heading", { name: "potion" });
    fireEvent.change(screen.getByRole("textbox", { name: "Search for items" }), { target: { value: "super potion" } });
    fireEvent.change(screen.getByLabelText("Category"), { target: { value: "healing" } });
    await waitFor(() => expect(screen.getByTestId("location").textContent).toBe("?other=keep&category=healing&search=super+potion"));
    await screen.findByRole("heading", { name: "Super Potion" });
    expect(screen.queryByRole("heading", { name: "potion" })).toBeNull();
  });

  it("reports category lookup failures instead of showing an empty list", async () => {
    setup();
    mocks.getItemCategoryByName.mockRejectedValue(new Error("network error"));
    renderPage("/items?category=healing");
    expect(await screen.findByText("Error loading items: network error")).toBeTruthy();
    expect(screen.queryByText("No items match the current filters.")).toBeNull();
  });

  it("loads additional cards on demand", async () => {
    setup();
    mocks.getItemsList.mockResolvedValue({ results: Array.from({ length: 21 }, (_, index) => ({ name: `item-${index}` })) });
    renderPage("/items");
    await screen.findByRole("heading", { name: "item-19" });
    expect(screen.queryByRole("heading", { name: "item-20" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Load more" }));
    await screen.findByRole("heading", { name: "item-20" });
    expect(screen.queryByRole("button", { name: "Load more" })).toBeNull();
  });
});
