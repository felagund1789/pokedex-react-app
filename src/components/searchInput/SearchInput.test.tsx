// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import SearchInput from "./SearchInput";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("SearchInput", () => {
  it("shows a clear button only when the input contains text and cancels pending searches", () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();
    const onClear = vi.fn();
    const onTypeChange = vi.fn();
    const onGenerationChange = vi.fn();
    render(
      <SearchInput
        searchText=""
        selectedType="fire"
        selectedGeneration="I"
        onSearch={onSearch}
        onTypeChange={onTypeChange}
        onGenerationChange={onGenerationChange}
        onClear={onClear}
      />,
    );

    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "pikachu" } });
    expect(onSearch).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(input.value).toBe("");
    expect(onSearch).toHaveBeenCalledExactlyOnceWith("");
    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
    expect(onClear).not.toHaveBeenCalled();
    expect(onTypeChange).not.toHaveBeenCalled();
    expect(onGenerationChange).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(300));
    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  it("clears an existing search without waiting for the debounce", () => {
    const onSearch = vi.fn();
    render(
      <SearchInput
        searchText="pikachu"
        onSearch={onSearch}
        onTypeChange={vi.fn()}
        onGenerationChange={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(onSearch).toHaveBeenCalledExactlyOnceWith("");
    expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("");
  });
});
