import { useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useNavigate, useSearchParams } from "react-router-dom";
import types from "../../assets/types";
import usePokemonList from "../../hooks/usePokemonList";
import { generations, Generation, PokemonTypeName } from "../../store";
import MainHeader from "../header/MainHeader";
import Loading from "../loading/Loading";
import PokemonCard from "../pokemonCard/PokemonCard";
import PokemonCardSkeleton from "../pokemonCard/PokemonCardSkeleton";
import SearchInput from "../searchInput/SearchInput";
import "./PokemonList.css";

const PAGE_SIZE = 20;
const LIST_STATE_STORAGE_KEY = "pokemon-list-state";
const typeNames = new Set(Object.keys(types) as PokemonTypeName[]);

type FilterUpdates = {
  search?: string | null;
  type?: PokemonTypeName | null;
  generation?: Generation | null;
};

type SavedListState = {
  filterKey: string;
  visibleCount: number;
  scrollY: number;
};

const isValidGeneration = (value: string | null): value is Generation =>
  Boolean(value && generations.includes(value as Generation));

const isValidType = (value: string | null): value is PokemonTypeName =>
  Boolean(value && typeNames.has(value as PokemonTypeName));

const readSavedListState = (): SavedListState | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const savedState = window.sessionStorage.getItem(LIST_STATE_STORAGE_KEY);
    return savedState ? (JSON.parse(savedState) as SavedListState) : null;
  } catch {
    return null;
  }
};
const PokemonList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchText = searchParams.get("search") ?? "";
  const typeParam = searchParams.get("type");
  const generationParam = searchParams.get("generation");
  const selectedType = isValidType(typeParam) ? typeParam : undefined;
  const selectedGeneration = isValidGeneration(generationParam) ? generationParam : undefined;
  const filterKey = `${searchText}|${selectedType ?? ""}|${selectedGeneration ?? ""}`;
  const savedListStateRef = useRef<SavedListState | null>(readSavedListState());
  const previousFilterKeyRef = useRef(filterKey);
  const hasRestoredScrollRef = useRef(false);
  const [visibleCount, setVisibleCount] = useState(() => {
    const savedState = savedListStateRef.current;

    if (savedState?.filterKey === filterKey) {
      return Math.max(PAGE_SIZE, savedState.visibleCount);
    }

    return PAGE_SIZE;
  });

  const persistListState = (nextVisibleCount: number, nextScrollY: number) => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.sessionStorage.setItem(
        LIST_STATE_STORAGE_KEY,
        JSON.stringify({
          filterKey,
          visibleCount: nextVisibleCount,
          scrollY: nextScrollY,
        })
      );
    } catch {
      // Ignore storage write failures.
    }
  };

  const updateRouteFilters = (
    updates: FilterUpdates,
    options?: { replace?: boolean; preventScrollReset?: boolean }
  ) => {
    const nextParams = new URLSearchParams(searchParams);

    if ("search" in updates) {
      const normalizedSearch = updates.search?.trim() ?? "";
      if (normalizedSearch) {
        nextParams.set("search", normalizedSearch);
      } else {
        nextParams.delete("search");
      }
    }

    if ("type" in updates) {
      if (updates.type) {
        nextParams.set("type", updates.type);
      } else {
        nextParams.delete("type");
      }
    }

    if ("generation" in updates) {
      if (updates.generation) {
        nextParams.set("generation", updates.generation);
      } else {
        nextParams.delete("generation");
      }
    }

    nextParams.delete("count");

    setSearchParams(nextParams, {
      replace: options?.replace,
      preventScrollReset: options?.preventScrollReset,
    });
  };

  const { data, isLoading, isFetching, error } = usePokemonList({
    search: searchText,
    type: selectedType,
    generation: selectedGeneration,
  });

  useEffect(() => {
    document.title = "Pokédex";
  }, []);

  useEffect(() => {
    if (!searchParams.has("count")) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("count");
    setSearchParams(nextParams, { replace: true, preventScrollReset: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (previousFilterKeyRef.current === filterKey) {
      return;
    }

    previousFilterKeyRef.current = filterKey;
    hasRestoredScrollRef.current = false;
    setVisibleCount(PAGE_SIZE);
    persistListState(PAGE_SIZE, 0);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [filterKey]);

  const filteredPokemon = data?.results ?? [];
  const visiblePokemon = filteredPokemon.slice(0, visibleCount);
  const hasMore = visiblePokemon.length < filteredPokemon.length;

  useEffect(() => {
    const handleScroll = () => {
      persistListState(visibleCount, window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      handleScroll();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [filterKey, visibleCount]);

  useEffect(() => {
    if (hasRestoredScrollRef.current || isLoading || isFetching) {
      return;
    }

    const savedState = savedListStateRef.current;

    if (!savedState || savedState.filterKey !== filterKey || savedState.scrollY <= 0) {
      hasRestoredScrollRef.current = true;
      return;
    }

    if (visiblePokemon.length < Math.min(savedState.visibleCount, filteredPokemon.length)) {
      return;
    }

    requestAnimationFrame(() => {
      window.scrollTo({ top: savedState.scrollY, left: 0, behavior: "auto" });
      hasRestoredScrollRef.current = true;
    });
  }, [filterKey, filteredPokemon.length, isFetching, isLoading, visiblePokemon.length]);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <>
      <MainHeader />
      <Loading isLoading={isLoading || isFetching} />
      <SearchInput
        searchText={searchText}
        selectedType={selectedType}
        selectedGeneration={selectedGeneration}
        onSearch={(text) => updateRouteFilters({ search: text }, { replace: true })}
        onTypeChange={(type) => updateRouteFilters({ type: type ?? null })}
        onGenerationChange={(generation) => updateRouteFilters({ generation: generation ?? null })}
        onClear={() => updateRouteFilters({ search: null, type: null, generation: null })}
      />
      <InfiniteScroll
        className="pokemon-list"
        hasMore={hasMore}
        dataLength={visiblePokemon.length}
        next={() =>
          setVisibleCount((currentCount) => {
            const nextCount = currentCount + PAGE_SIZE;
            persistListState(nextCount, window.scrollY);
            return nextCount;
          })
        }
        loader={<PokemonCardSkeleton />}
      >
        {isLoading &&
          Array.from(Array(PAGE_SIZE).keys()).map((item) => (
            <PokemonCardSkeleton key={item} />
          ))}

        {!isLoading && visiblePokemon.length === 0 && (
          <div className="pokemon-list-empty">
            No Pokémon match the current search and filters.
          </div>
        )}

        {visiblePokemon.map((pokemon) => (
          <PokemonCard
            key={pokemon.name}
            slug={pokemon.name}
            onClick={() => {
              persistListState(visibleCount, window.scrollY);
              navigate(`/pokemon/${pokemon.name}/stats`);
            }}
          />
        ))}
      </InfiniteScroll>
    </>
  );
};

export default PokemonList;
