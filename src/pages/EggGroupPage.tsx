import { useQuery } from "@tanstack/react-query";
import type { NamedAPIResource } from "pokeapi-js-wrapper";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../components/header/PageHeader";
import Loading from "../components/loading/Loading";
import PokemonCard from "../components/pokemonCard/PokemonCard";
import PokemonCardSkeleton from "../components/pokemonCard/PokemonCardSkeleton";
import "../components/pokemonList/PokemonList.css";
import { eggGroupName, eggGroupQuery } from "../hooks/eggGroupQuery";
import useDefaultPokemonForm from "../hooks/useDefaultPokemonForm";
import usePokemonStore from "../store";
import "./TypesPage.css";

const PAGE_SIZE = 20;

const SpeciesCard = ({ species }: { species: NamedAPIResource }) => {
  const navigate = useNavigate();
  const { data: form, error } = useDefaultPokemonForm(species, true);

  if (error) return <div role="alert">Error loading {species.name}: {error.message}</div>;
  if (!form) return <PokemonCardSkeleton />;
  return <PokemonCard slug={form} onClick={() => navigate(`/pokemon/${form}`)} />;
};

const EggGroupDetails = ({ name }: { name: string }) => {
  const language = usePokemonStore((state) => state.language);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const { data, isLoading, isFetching, error } = useQuery(eggGroupQuery(name));
  const label = data ? eggGroupName(data, language) : name.replace(/-/g, " ");
  const species = data?.pokemon_species ?? [];
  const visibleSpecies = species.slice(0, visibleCount);

  useEffect(() => {
    document.title = `Pokédex | ${label}`;
  }, [label]);

  return (
    <>
      <Loading isLoading={isLoading || isFetching} />
      <main className="types-page">
        <h1 className="type-page-title">{label} Egg Group</h1>
        <h2>Pokémon</h2>
        {error && <p role="alert">Error loading egg group: {error.message}</p>}
        {!isLoading && !error && species.length === 0 && <p>No Pokémon found in this egg group.</p>}
        <InfiniteScroll
          className="pokemon-list"
          dataLength={visibleSpecies.length}
          hasMore={visibleSpecies.length < species.length}
          next={() => setVisibleCount((count) => count + PAGE_SIZE)}
          loader={<PokemonCardSkeleton />}
        >
          {isLoading && Array.from({ length: PAGE_SIZE }, (_, index) => <PokemonCardSkeleton key={index} />)}
          {visibleSpecies.map((item) => <SpeciesCard key={item.name} species={item} />)}
        </InfiniteScroll>
      </main>
    </>
  );
};

const EggGroupPage = () => {
  const { eggGroup } = useParams();

  return (
    <>
      <PageHeader />
      {eggGroup && <EggGroupDetails key={eggGroup} name={eggGroup} />}
    </>
  );
};

export default EggGroupPage;
