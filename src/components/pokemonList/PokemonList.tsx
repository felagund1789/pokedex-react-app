import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useNavigate } from "react-router-dom";
import usePokemonList from "../../hooks/usePokemonList";
import usePokemonStore from "../../store";
import MainHeader from "../header/MainHeader";
import Loading from "../loading/Loading";
import PokemonCard from "../pokemonCard/PokemonCard";
import PokemonCardSkeleton from "../pokemonCard/PokemonCardSkeleton";
import SearchInput from "../searchInput/SearchInput";
import "./PokemonList.css";

const PAGE_SIZE = 20;

const PokemonList = () => {
  const navigate = useNavigate();
  const searchText = usePokemonStore((state) => state.query.searchText) ?? "";
  const selectedType = usePokemonStore((state) => state.query.type);
  const selectedGeneration = usePokemonStore((state) => state.query.generation);
  const setSearchText = usePokemonStore((state) => state.setSearchText);
  const setType = usePokemonStore((state) => state.setType);
  const setGeneration = usePokemonStore((state) => state.setGeneration);
  const clearFilters = usePokemonStore((state) => state.clearFilters);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

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
        onSearch={(text) => setSearchText(text.trim() ? text : undefined)}
        onTypeChange={setType}
        onGenerationChange={setGeneration}
        onClear={clearFilters}
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
