import React from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useNavigate } from "react-router-dom";
import usePokemonList from "../../hooks/usePokemonList";
import PokemonCard from "../pokemonCard/PokemonCard";
import PokemonCardSkeleton from "../pokemonCard/PokemonCardSkeleton";
import "./PokemonList.css";

const PokemonList = () => {
  const navigate = useNavigate();
  const { data, isLoading, error, hasNextPage, fetchNextPage } =
    usePokemonList();

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
              onClick={() => navigate(`/pokemon/${pokemon.name}`)}
            />
          ))}
        </React.Fragment>
      ))}
    </InfiniteScroll>
  );
};

export default PokemonList;
