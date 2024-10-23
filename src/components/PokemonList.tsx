import React from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import usePokemon from "../hooks/usePokemon";
import PokemonCard from "./PokemonCard";

const PokemonList = () => {
  const { data, isLoading, error, hasNextPage, fetchNextPage } = usePokemon();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const fetchedPokemonCount =
    data?.pages.reduce((total, page) => total + page.results.length, 0) || 0;

  return (
    <InfiniteScroll
      className="pokemon-list"
      hasMore={!!hasNextPage}
      dataLength={fetchedPokemonCount}
      next={fetchNextPage}
      loader={<div>Loading...</div>}
    >
      {data?.pages?.map((page, index) => (
        <React.Fragment key={index}>
          {page.results.map((pokemon) => (
            <PokemonCard key={pokemon.name} pokemon={pokemon} />
          ))}
        </React.Fragment>
      ))}
    </InfiniteScroll>
  );
};

export default PokemonList;
