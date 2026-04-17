import { useEffect, useState } from "react";
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
const typeNames = new Set(Object.keys(types) as PokemonTypeName[]);

type FilterUpdates = {
  search?: string | null;
  type?: PokemonTypeName | null;
  generation?: Generation | null;
};

const isValidGeneration = (value: string | null): value is Generation =>
  Boolean(value && generations.includes(value as Generation));

const isValidType = (value: string | null): value is PokemonTypeName =>
  Boolean(value && typeNames.has(value as PokemonTypeName));

const PokemonList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchText = searchParams.get("search") ?? "";
  const typeParam = searchParams.get("type");
  const generationParam = searchParams.get("generation");
  const selectedType = isValidType(typeParam) ? typeParam : undefined;
  const selectedGeneration = isValidGeneration(generationParam) ? generationParam : undefined;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const updateRouteFilters = (updates: FilterUpdates, replace = false) => {
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

    setSearchParams(nextParams, { replace });
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
    setVisibleCount(PAGE_SIZE);
  }, [searchText, selectedType, selectedGeneration]);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const filteredPokemon = data?.results ?? [];
  const visiblePokemon = filteredPokemon.slice(0, visibleCount);
  const hasMore = visiblePokemon.length < filteredPokemon.length;

  return (
    <>
      <MainHeader />
      <Loading isLoading={isLoading || isFetching} />
      <SearchInput
        searchText={searchText}
        selectedType={selectedType}
        selectedGeneration={selectedGeneration}
        onSearch={(text) => updateRouteFilters({ search: text }, true)}
        onTypeChange={(type) => updateRouteFilters({ type: type ?? null })}
        onGenerationChange={(generation) => updateRouteFilters({ generation: generation ?? null })}
        onClear={() => updateRouteFilters({ search: null, type: null, generation: null })}
      />
      <div className="pokemon-list-status">
        Showing {visiblePokemon.length} of {data?.count ?? 0} Pokémon
      </div>
      <InfiniteScroll
        className="pokemon-list"
        hasMore={hasMore}
        dataLength={visiblePokemon.length}
        next={() => setVisibleCount((currentCount) => currentCount + PAGE_SIZE)}
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
            onClick={() => navigate(`/pokemon/${pokemon.name}/stats`)}
          />
        ))}
      </InfiniteScroll>
    </>
  );
};

export default PokemonList;
