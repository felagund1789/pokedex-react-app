import React, { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useNavigate } from "react-router-dom";
import usePokemonList from "../../hooks/usePokemonList";
import PokemonCard from "../pokemonCard/PokemonCard";
import PokemonCardSkeleton from "../pokemonCard/PokemonCardSkeleton";
import SearchInput from "../searchInput/SearchInput";
import "./PokemonList.css";
import Loading from "../loading/Loading";

const PokemonList = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const { data, isLoading, isFetching, error, hasNextPage, fetchNextPage } =
    usePokemonList(searchText);

  useEffect(() => {
    document.title = "Pokédex";
  }, []);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const generations = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
  const fetchedPokemonCount =
    data?.pages.reduce((total, page) => total + page.results.length, 0) || 0;

  return (
    <>
      <Loading isLoading={isLoading || isFetching} />
      <>
        <SearchInput onSearch={(text) => setSearchText(text)} />
        {generations.map((generation) => (
          <button className="generation-btn"
            key={generation}
            onClick={() => setSearchText(`generation-${generation.toLowerCase()}`)}
          >
            {generation}
          </button>
        ))}
      </>
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
