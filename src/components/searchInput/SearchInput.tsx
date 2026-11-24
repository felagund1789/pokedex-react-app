import types from "../../assets/types";
import { generations, Generation, PokemonTypeName } from "../../store";
import SearchField from "./SearchField";
import "./SearchInput.css";

interface Props {
  searchText: string;
  selectedType?: PokemonTypeName;
  selectedGeneration?: Generation;
  onSearch: (searchText: string) => void;
  onTypeChange: (type?: PokemonTypeName) => void;
  onGenerationChange: (generation?: Generation) => void;
  onClear: () => void;
}

const typeOptions = Object.keys(types) as PokemonTypeName[];

const SearchInput = ({
  searchText,
  selectedType,
  selectedGeneration,
  onSearch,
  onTypeChange,
  onGenerationChange,
  onClear,
}: Props) => {
  const hasActiveFilters = Boolean(searchText.trim() || selectedType || selectedGeneration);

  return (
    <div className="search-container">
      <SearchField searchText={searchText} onSearch={onSearch} subject="Pokémon" />

      <div className="filter-row">
        <select
          className="filter-select"
          value={selectedType ?? ""}
          onChange={(event) => {
            onTypeChange((event.currentTarget.value || undefined) as PokemonTypeName | undefined);
          }}
        >
          <option value="">All types</option>
          {typeOptions.filter((type) => type !== "unknown").map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>

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
