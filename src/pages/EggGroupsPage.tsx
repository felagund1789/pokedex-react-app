import { useQueries, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/header/PageHeader";
import Loading from "../components/loading/Loading";
import { eggGroupName, eggGroupQuery } from "../hooks/eggGroupQuery";
import pokedex from "../services/pokedexService";
import usePokemonStore from "../store";
import "./EggGroupsPage.css";

const baseImageUrl = import.meta.env.VITE_POKEMON_ARTWORK_BASE_URL;

const EggGroupsPage = () => {
  const language = usePokemonStore((state) => state.language);
  const groups = useQuery({
    queryKey: ["egg-group-list"],
    queryFn: () => pokedex.getEggGroupsList({ offset: 0, limit: 10000 }),
    staleTime: 24 * 60 * 60 * 1000,
  });
  const details = useQueries({
    queries: (groups.data?.results ?? []).map(({ name }) => eggGroupQuery(name)),
  });
  const sortedGroups = details.flatMap(({ data }) => data ? [{
    name: data.name,
    label: eggGroupName(data, language),
  }] : []).sort((a, b) => a.label.localeCompare(b.label, language));
  const error = groups.error ?? details.find((query) => query.error)?.error;
  const loading = groups.isLoading || details.some((query) => query.isLoading);

  useEffect(() => {
    document.title = "Pokédex | Egg Groups";
  }, []);

  function getEggGroupImageId(name: string) {
    switch (name) {
      case "indeterminate": return "88";
      case "bug": return "123";
      case "ditto": return "132";
      case "dragon": return "148";
      case "fairy": return "39";
      case "flying": return "17";
      case "ground": return "19";
      case "plant": return "1";
      case "water1": return "7";
      case "water2": return "119";
      case "water3": return "120";
      case "monster": return "143";
      case "mineral": return "81";
      case "no-eggs": return "151";
      case "humanshape": return "122";
      default: return "0";
    }
  }

  return (
    <>
      <PageHeader />
      <Loading isLoading={loading} />
      <main className="types-page">
        <h1>Egg Groups</h1>
        {error && <p role="alert">Error loading egg groups: {error.message}</p>}
        {!loading && !error && details.length === 0 && <p>No egg groups found.</p>}
        <div className="types-grid egg-groups-grid">
          {sortedGroups.map(({ name, label }) => (
            <Link key={name} to={`/egg-groups/${encodeURIComponent(name)}`}>
              <div
                className={`egg-group-icon ${name}`}
                style={{ backgroundImage: `url('${baseImageUrl}/${getEggGroupImageId(name)}.png')` }}
              ></div>
              {label}
            </Link>
          ))}
        </div>
      </main>
    </>
  );
};

export default EggGroupsPage;
