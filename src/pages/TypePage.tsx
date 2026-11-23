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
const typeNames = Object.keys(types) as PokemonTypeName[];

const isValidType = (type: string | undefined): type is PokemonTypeName =>
  Boolean(type && Object.prototype.hasOwnProperty.call(types, type));

const TypeDetails = ({ type, type2 }: { type: PokemonTypeName; type2?: PokemonTypeName }) => {
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const selectedTypes = type2 ? [type, type2] : [type];
  const { data, isLoading, isFetching, error } = usePokemonList({ types: selectedTypes });
  const pokemon = data?.results ?? [];
  const visiblePokemon = pokemon.slice(0, visibleCount);

  useEffect(() => {
    document.title = `Pokédex | ${(type2 ? [type, type2] : [type]).map((name) =>
      name.charAt(0).toUpperCase() + name.slice(1)
    ).join(" / ")}`;
  }, [type, type2]);

  return (
    <>
      <Loading isLoading={isLoading || isFetching} />
      <main className="types-page">
        <h1 className="type-page-title">{selectedTypes.join(" / ")} type</h1>
        {!type2 && (
          <div className="type-page-filter">
            <label htmlFor="second-type">Add a second type</label>
            <select
              id="second-type"
              value=""
              onChange={(event) => {
                if (event.currentTarget.value) {
                  navigate(`/type/${type}/${event.currentTarget.value}`);
                }
              }}
            >
              <option value="">Select a type</option>
              {typeNames.filter((name) => name !== type && name !== "unknown").map((name) => (
                <option key={name} value={name}>
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </option>
              ))}
            </select>
          </div>
        )}
        <TypeMatchups types={selectedTypes} includeNeutralSelf />
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
  const { type, type2 } = useParams();
  const valid = isValidType(type) && (type2 === undefined || (isValidType(type2) && type2 !== type));

  return (
    <>
      <PageHeader />
      {valid ? (
        <TypeDetails key={`${type}/${type2 ?? ""}`} type={type} type2={type2} />
      ) : (
        <main className="types-page"><h1>Type not found</h1></main>
      )}
    </>
  );
};

export default TypePage;
