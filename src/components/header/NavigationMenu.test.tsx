// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import MainHeader from "./MainHeader";
import PageHeader from "./PageHeader";

vi.mock("../../hooks/useTheme", () => ({
  default: () => ({ theme: "light", toggleTheme: vi.fn() }),
}));

afterEach(cleanup);

const TestPage = () => {
  const { pathname } = useLocation();
  return (
    <>
      {pathname === "/" || pathname === "/pokemon" ? <MainHeader /> : <PageHeader />}
      <main>{pathname}</main>
    </>
  );
};

const renderPage = (path: string) => render(
  <MemoryRouter initialEntries={[path]}>
    <Routes>
      <Route path="*" element={<TestPage />} />
    </Routes>
  </MemoryRouter>,
);

describe("header navigation", () => {
  it.each(["/", "/pokemon", "/types", "/types/fire", "/type/fire/water", "/egg-groups", "/egg-groups/field", "/moves", "/items", "/pokemon/pikachu"])(
    "offers all destinations from %s",
    (path) => {
      renderPage(path);
      expect(screen.queryByRole("button", { name: "Go back" })).toBeNull();
      expect(screen.getByRole("button", { name: "Toggle dark/light theme" })).toBeTruthy();
      const toggle = screen.getByRole("button", { name: "Open navigation menu" });
      expect(toggle.getAttribute("aria-expanded")).toBe("false");
      fireEvent.click(toggle);
      const navigation = screen.getByRole("navigation", { name: "Main navigation" });
      for (const [label, href] of [["Pokémon", "/pokemon"], ["Types", "/types"], ["Egg Groups", "/egg-groups"], ["Moves", "/moves"], ["Items", "/items"]]) {
        expect(within(navigation).getByRole("link", { name: label }).getAttribute("href")).toBe(href);
      }
      const current = path === "/" || path.startsWith("/pokemon") ? "Pokémon"
        : path.startsWith("/type") ? "Types" : path.startsWith("/egg-groups") ? "Egg Groups" : path === "/moves" ? "Moves" : "Items";
      expect(within(navigation).getByRole("link", { name: current }).getAttribute("aria-current")).toBe("page");
      expect(toggle.getAttribute("aria-expanded")).toBe("true");
    },
  );

  it.each([["Pokémon", "/pokemon"], ["Types", "/types"], ["Egg Groups", "/egg-groups"], ["Moves", "/moves"], ["Items", "/items"]])(
    "navigates to %s and closes the menu",
    (label, destination) => {
      renderPage("/types");
      fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
      fireEvent.click(screen.getByRole("link", { name: label }));
      expect(screen.getByRole("main").textContent).toBe(destination);
      expect(screen.queryByRole("navigation", { name: "Main navigation" })).toBeNull();
    },
  );

  it("closes with Escape and restores focus", () => {
    renderPage("/");
    const toggle = screen.getByRole("button", { name: "Open navigation menu" });
    fireEvent.click(toggle);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("navigation", { name: "Main navigation" })).toBeNull();
    expect(document.activeElement).toBe(toggle);
  });

  it("renders the overlay outside the header and closes it from the backdrop", () => {
    renderPage("/");
    const toggle = screen.getByRole("button", { name: "Open navigation menu" });
    fireEvent.click(toggle);
    const navigation = screen.getByRole("navigation", { name: "Main navigation" });
    expect(navigation.parentElement).toBe(document.body);
    const backdrop = document.querySelector(".navigation-backdrop");
    expect(backdrop?.parentElement).toBe(document.body);
    if (!backdrop) throw new Error("Navigation backdrop was not rendered");
    fireEvent.click(backdrop);
    expect(screen.queryByRole("navigation", { name: "Main navigation" })).toBeNull();
    expect(document.activeElement).toBe(toggle);
  });

});
