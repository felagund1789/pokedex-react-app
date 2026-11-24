import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import PageHeader from "../components/header/PageHeader";
import Loading from "../components/loading/Loading";
import PokemonMoveCard from "../components/pokemonMoveCard/PokemonMoveCard";
import useMoveList, { damageClasses } from "../hooks/useMoveList";
import pokedex from "../services/pokedexService";
import "./TypesPage.css";
import "./MovesPage.css";

const PAGE_SIZE = 20;
const MovesPage = () => {
  const [params, setParams] = useSearchParams();
  const typeParam = params.get("type");
  const classParam = params.get("damageClass");
  const { data: types, isLoading: typesLoading, error: typesError } = useQuery({
    queryKey: ["move-types"],
    queryFn: () => pokedex.getTypesList({ offset: 0, limit: 10000 }),
    staleTime: 24 * 60 * 60 * 1000,
  });
  const type = types?.results.find((item) => item.name === typeParam)?.name;
  const damageClass = damageClasses.find((name) => name === classParam);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const { data: moves = [], isLoading, isFetching, error } = useMoveList(type, damageClass, !!types);
  const visibleMoves = moves.slice(0, visibleCount);

  useEffect(() => {
    document.title = "Pokédex | Moves";
  }, []);

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setVisibleCount(PAGE_SIZE);
    setParams(next);
  };

  return (
    <>
      <PageHeader />
      <Loading isLoading={typesLoading || isFetching} />
      <main className="types-page moves-page">
        <h1>Moves</h1>
        <div className="type-page-filter">
          <div className="move-types">
            <label htmlFor="move-type">Type</label>
            <select id="move-type" value={type ?? ""} onChange={(event) => updateFilter("type", event.currentTarget.value)}>
              <option value="">All types</option>
              {types?.results.map(({ name }) => (
                <option key={name} value={name}>{name.charAt(0).toUpperCase() + name.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="move-damage-classes">
            <label htmlFor="move-class">Damage class</label>
            <select id="move-class" value={damageClass ?? ""} onChange={(event) => updateFilter("damageClass", event.currentTarget.value)}>
              <option value="">All damage classes</option>
              {damageClasses.map((name) => (
                <option key={name} value={name}>{name.charAt(0).toUpperCase() + name.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
        {(typesError || error) && <p>Error loading moves: {(typesError || error)?.message}</p>}
        {!typesLoading && !isLoading && !typesError && !error && moves.length === 0 && <p>No moves match the current filters.</p>}
        <div className="moves-grid">
          {visibleMoves.map((move) => <PokemonMoveCard key={move.name} slug={move.name} />)}
        </div>
        {visibleMoves.length < moves.length && (
          <button className="moves-page__more" type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
            Load more
          </button>
        )}
      </main>
    </>
  );
};

export default MovesPage;
