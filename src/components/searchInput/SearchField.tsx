import { useEffect, useId, useRef, useState } from "react";
import useMobile from "../../hooks/useMobile";

interface Props {
  searchText: string;
  onSearch: (searchText: string) => void;
  subject: string;
}

const SearchField = ({ searchText, onSearch, subject }: Props) => {
  const searchInputId = useId();
  const [inputValue, setInputValue] = useState(searchText);
  const timerRef = useRef<number>();
  const onSearchRef = useRef(onSearch);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useMobile();
  onSearchRef.current = onSearch;

  useEffect(() => {
    window.clearTimeout(timerRef.current);
    setInputValue(searchText);
  }, [searchText]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "/" && document.activeElement !== inputRef.current) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      window.clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="search-row">
      <label htmlFor={searchInputId} className="search-label" aria-label={`Search for ${subject}`}>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" aria-hidden="true">
          <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
        </svg>
      </label>
      <input
        ref={inputRef}
        type="text"
        className="search"
        id={searchInputId}
        value={inputValue}
        placeholder={isMobile ? `Search for ${subject}` : `Press / to search for ${subject}`}
        onChange={(event) => {
          const value = event.currentTarget.value;
          setInputValue(value);
          window.clearTimeout(timerRef.current);
          timerRef.current = window.setTimeout(() => onSearchRef.current(value), 300);
        }}
      />
      {inputValue && (
        <button
          type="button"
          className="clear-search"
          aria-label="Clear search"
          onClick={() => {
            window.clearTimeout(timerRef.current);
            setInputValue("");
            onSearch("");
          }}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
            <path d="M18 6 6 18M6 6l12 12" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default SearchField;
