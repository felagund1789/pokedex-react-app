import React, { useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useNavigate } from "react-router-dom";
import usePokemonList from "../../hooks/usePokemonList";
import usePokemonStore from "../../store";
import Loading from "../loading/Loading";
import PokemonCard from "../pokemonCard/PokemonCard";
import PokemonCardSkeleton from "../pokemonCard/PokemonCardSkeleton";
import SearchInput from "../searchInput/SearchInput";
import "./PokemonList.css";

const PokemonList = () => {
  const navigate = useNavigate();
  const searchText = usePokemonStore((state) => state.query.searchText) ?? "";
  const setSearchText = usePokemonStore((state) => state.setSearchText);
  const { data, isLoading, isFetching, error, hasNextPage, fetchNextPage } = usePokemonList(searchText);

  useEffect(() => {
    document.title = "Pokédex";
  }, []);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const fetchedPokemonCount =
    data?.pages.reduce((total, page) => total + page.results.length, 0) || 0;

  return (
    <>
      <Loading isLoading={isLoading || isFetching} />
      <SearchInput searchText={searchText} onSearch={(text) => setSearchText(text)} />
      <InfiniteScroll
        className="pokemon-list"
        hasMore={!!hasNextPage}
        dataLength={fetchedPokemonCount}
        next={fetchNextPage}
        loader={<PokemonCardSkeleton />}
      >
        {isLoading &&
          Array.from(Array(20).keys()).map((item) => (
            <PokemonCardSkeleton key={item} />
          ))}
        {data?.pages?.map((page, index) => (
          <React.Fragment key={index}>
            {page.results.map((pokemon) => (
              <PokemonCard
                key={pokemon.name}
                slug={pokemon.name}
                onClick={() => navigate(`/pokemon/${pokemon.name}/stats`)}
              />
            ))}
          </React.Fragment>
        ))}
      </InfiniteScroll>
    </>
  );
};

export default PokemonList;
