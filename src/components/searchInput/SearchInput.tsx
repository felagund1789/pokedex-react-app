import { useEffect, useId, useRef } from "react";
import "./SearchInput.css";

interface Props {
  searchText: string;
  onSearch: (searchText: string) => void;
}

const handleKeyPress = (event: KeyboardEvent) => {
  const input = document.querySelector<HTMLInputElement>("input.search");
  if (event.key === "/" && document.activeElement !== input) {
    event.preventDefault();
    input?.focus();
  }
};

const SearchInput = ({ searchText, onSearch }: Props) => {
  const seacrchInputId = useId();
  const timerRef = useRef(0);

  const debounceSearch = (searchTerm: string) => {
    clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);
  };

  useEffect(() => {
    const input = document.querySelector<HTMLInputElement>("input.search");
    if (input) {
      input.value = searchText;
    }
    document.onkeydown = handleKeyPress;
    return () => {
      //cleanup keydown listener
      document.onkeydown = null;
    };
  }, [searchText]);

  return (
    <div className="search-container">
      <label htmlFor={seacrchInputId} className="search-label">
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
        id={seacrchInputId}
        placeholder="Press / to search for Pokémon"
        onInput={(event) => {
          debounceSearch(event.currentTarget.value ?? "");
        }}
      />
    </div>
  );
};

export default SearchInput;
