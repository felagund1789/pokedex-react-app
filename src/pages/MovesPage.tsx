import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../components/header/PageHeader";
import Loading from "../components/loading/Loading";
import PokemonMoveCard from "../components/pokemonMoveCard/PokemonMoveCard";
import SearchField from "../components/searchInput/SearchField";
import "../components/searchInput/SearchInput.css";
import useMoveList, { damageClasses } from "../hooks/useMoveList";
import pokedex from "../services/pokedexService";
import "./TypesPage.css";
import "./MovesPage.css";

const PAGE_SIZE = 20;
const MovesPage = () => {
  const [params, setParams] = useSearchParams();
  const typeParam = params.get("type");
  const classParam = params.get("damageClass");
  const searchText = params.get("search") ?? "";
  const { data: types, isLoading: typesLoading, error: typesError } = useQuery({
    queryKey: ["move-types"],
    queryFn: () => pokedex.getTypesList({ offset: 0, limit: 10000 }),
    staleTime: 24 * 60 * 60 * 1000,
  });
  const type = types?.results.find((item) => item.name === typeParam)?.name;
  const damageClass = damageClasses.find((name) => name === classParam);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const { data: moves = [], isLoading, isFetching, error } = useMoveList(type, damageClass, !!types);
  const search = searchText.trim().toLowerCase().replace(/\s+/g, "-");
  const filteredMoves = moves.filter((move) => move.name.includes(search));
  const visibleMoves = filteredMoves.slice(0, visibleCount);

  useEffect(() => {
    document.title = "Pokédex | Moves";
  }, []);

  const updateFilter = (key: string, value: string, replace = false) => {
    const next = new URLSearchParams(params);
    if (key === "search") value = value.trim();
    if (value) next.set(key, value);
    else next.delete(key);
    setVisibleCount(PAGE_SIZE);
    setParams(next, { replace });
  };

  return (
    <>
      <PageHeader />
      <Loading isLoading={typesLoading || isFetching} />
      <main className="types-page moves-page">
        <h1>Moves</h1>
        <div className="search-container moves-search">
          <SearchField searchText={searchText} onSearch={(value) => updateFilter("search", value, true)} subject="moves" />
          <div className="filter-row">
            <select aria-label="Type" className="filter-select" value={type ?? ""} onChange={(event) => updateFilter("type", event.currentTarget.value)}>
              <option value="">All types</option>
              {types?.results.map(({ name }) => (
                <option key={name} value={name}>{name.charAt(0).toUpperCase() + name.slice(1)}</option>
              ))}
            </select>
            <select aria-label="Damage class" className="filter-select" value={damageClass ?? ""} onChange={(event) => updateFilter("damageClass", event.currentTarget.value)}>
              <option value="">All damage classes</option>
              {damageClasses.map((name) => (
                <option key={name} value={name}>{name.charAt(0).toUpperCase() + name.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
        {(typesError || error) && <p>Error loading moves: {(typesError || error)?.message}</p>}
        {!typesLoading && !isLoading && !typesError && !error && filteredMoves.length === 0 && <p>No moves match the current filters.</p>}
        <div className="moves-grid">
          {visibleMoves.map((move) => <PokemonMoveCard key={move.name} slug={move.name} />)}
        </div>
        {visibleMoves.length < filteredMoves.length && (
          <button className="moves-page__more" type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
            Load more
          </button>
        )}
      </main>
    </>
  );
};

export default MovesPage;
