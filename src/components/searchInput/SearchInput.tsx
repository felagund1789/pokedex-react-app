import { useEffect, useId, useRef, useState } from "react";
import types from "../../assets/types";
import useMobile from "../../hooks/useMobile";
import { generations, Generation, PokemonTypeName } from "../../store";
import "./SearchInput.css";

interface Props {
  searchText: string;
  selectedTypes: PokemonTypeName[];
  selectedGeneration?: Generation;
  onSearch: (searchText: string) => void;
  onTypeChange: (types: PokemonTypeName[]) => void;
  onGenerationChange: (generation?: Generation) => void;
  onClear: () => void;
}

const handleKeyPress = (event: KeyboardEvent) => {
  const input = document.querySelector<HTMLInputElement>("input.search");
  if (event.key === "/" && document.activeElement !== input) {
    event.preventDefault();
    input?.focus();
  }
};

const MAX_TYPES = 2;
const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
const typeOptions = Object.keys(types) as PokemonTypeName[];

const SearchInput = ({
  searchText,
  selectedTypes,
  selectedGeneration,
  onSearch,
  onTypeChange,
  onGenerationChange,
  onClear,
}: Props) => {
  const searchInputId = useId();
  const [inputValue, setInputValue] = useState(searchText);
  const timerRef = useRef<number>();
  const hasActiveFilters = Boolean(searchText.trim() || selectedTypes.length > 0 || selectedGeneration);
  const isMobile = useMobile();

  const debounceSearch = (searchTerm: string) => {
    window.clearTimeout(timerRef.current);

    timerRef.current = window.setTimeout(() => {
      onSearch(searchTerm);
    }, 300);
  };

  useEffect(() => {
    setInputValue(searchText);
  }, [searchText]);

  useEffect(() => {
    document.onkeydown = handleKeyPress;
    return () => {
      document.onkeydown = null;
      window.clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="search-container">
      <div className="search-row">
        <label htmlFor={searchInputId} className="search-label">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
          >
            <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
          </svg>
        </label>
        <input
          type="text"
          className="search"
          id={searchInputId}
          value={inputValue}
          placeholder={isMobile ? "Search for Pokémon": "Press / to search for Pokémon"}
          onChange={(event) => {
            const value = event.currentTarget.value ?? "";
            setInputValue(value);
            debounceSearch(value);
          }}
        />
      </div>

      <div className="filter-row">
        <details className="type-multiselect">
          <summary className="filter-select">
            {selectedTypes.length
              ? selectedTypes.map((type) => capitalize(type)).join(" / ")
              : "All types"}
          </summary>
          <div className="type-options">
            {typeOptions.map((type) => {
              const checked = selectedTypes.includes(type);
              return (
                <label key={type} className="type-option">
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={!checked && selectedTypes.length >= MAX_TYPES}
                    onChange={() =>
                      onTypeChange(
                        checked
                          ? selectedTypes.filter((selected) => selected !== type)
                          : [...selectedTypes, type]
                      )
                    }
                  />
                  {capitalize(type)}
                </label>
              );
            })}
          </div>
        </details>

        <select
          className="filter-select"
          value={selectedGeneration ?? ""}
          onChange={(event) => {
            onGenerationChange((event.currentTarget.value || undefined) as Generation | undefined);
          }}
        >
          <option value="">All generations</option>
          {generations.map((generation) => (
            <option key={generation} value={generation}>
              Gen {generation}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="clear-filters"
          onClick={onClear}
          disabled={!hasActiveFilters}
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default SearchInput;
