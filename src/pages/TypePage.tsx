import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useNavigate, useParams } from "react-router-dom";
import types from "../assets/types";
import PageHeader from "../components/header/PageHeader";
import Loading from "../components/loading/Loading";
import PokemonCard from "../components/pokemonCard/PokemonCard";
import PokemonCardSkeleton from "../components/pokemonCard/PokemonCardSkeleton";
import "../components/pokemonList/PokemonList.css";
import { TypeMatchups } from "../components/typeCard/TypeCard";
import usePokemonList from "../hooks/usePokemonList";
import { PokemonTypeName } from "../store";
import "./TypesPage.css";

const PAGE_SIZE = 20;

const TypeDetails = ({ type }: { type: PokemonTypeName }) => {
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const { data, isLoading, isFetching, error } = usePokemonList({ types: [type] });
  const pokemon = data?.results ?? [];
  const visiblePokemon = pokemon.slice(0, visibleCount);

  useEffect(() => {
    document.title = `Pokédex | ${type.charAt(0).toUpperCase() + type.slice(1)}`;
  }, [type]);

  return (
    <>
      <Loading isLoading={isLoading || isFetching} />
      <main className="types-page">
        <h1 className="type-page-title">{type} type</h1>
        <TypeMatchups types={[type]} includeNeutralSelf />
        <h2>Pokémon</h2>
        {error && <p>Error loading Pokémon: {error.message}</p>}
        {!isLoading && !error && pokemon.length === 0 && (
          <p>No Pokémon found for this type.</p>
        )}
        <InfiniteScroll
          className="pokemon-list"
          dataLength={visiblePokemon.length}
          hasMore={visiblePokemon.length < pokemon.length}
          next={() => setVisibleCount((count) => count + PAGE_SIZE)}
          loader={<PokemonCardSkeleton />}
        >
          {isLoading && Array.from({ length: PAGE_SIZE }, (_, index) => (
            <PokemonCardSkeleton key={index} />
          ))}
          {visiblePokemon.map((item) => (
            <PokemonCard
              key={item.name}
              slug={item.name}
              onClick={() => navigate(`/pokemon/${item.name}`)}
            />
          ))}
        </InfiniteScroll>
      </main>
    </>
  );
};

const TypePage = () => {
  const { type } = useParams();
  const isValidType = type && Object.prototype.hasOwnProperty.call(types, type);

  return (
    <>
      <PageHeader />
      {isValidType ? (
        <TypeDetails key={type} type={type as PokemonTypeName} />
      ) : (
        <main className="types-page"><h1>Type not found</h1></main>
      )}
    </>
  );
};

export default TypePage;
