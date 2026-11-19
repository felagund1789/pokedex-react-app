import { motion } from "framer-motion";
import { useEffect, useRef, type CSSProperties } from "react";
import { useParams } from "react-router-dom";
import PokemonStatsCard from "../components/PokemonStatsCard";
import AbilitiesCard from "../components/abilitiesCard/AbilitiesCard";
import EvolutionChain from "../components/evolutionChain/EvolutionChain";
import PageHeader from "../components/header/PageHeader";
import OtherForms from "../components/otherForms/OtherForms";
import PokemonBreedingCard from "../components/pokemonBreeding/PokemonBreedingCard";
import PokemonDescriptionCard from "../components/pokemonDescriptionCard/PokemonDescriptionCard";
import PokemonInfoDetailsCard from "../components/pokemonInfoDetailsCard/PokemonInfoDetailsCard";
import PokemonInfoHeaderCard from "../components/pokemonInfoHeaderCard/PokemonInfoHeaderCard";
import PokemonMoves from "../components/pokemonMoves/PokemonMoves";
import TypeCard from "../components/typeCard/TypeCard";
import useMasonryGrid from "../hooks/useMasonryGrid";
import usePokemonColor from "../hooks/usePokemonColor";
import usePokemonInfo from "../hooks/usePokemonInfo";
import usePokemonStore from "../store";

function PokemonDetailsPage() {
  const { name } = useParams();
  const language = usePokemonStore((state) => state.language);
  const color = usePokemonColor({ slug: name ?? "" });
  const { pokemonSpecies, pokemonForm, error } = usePokemonInfo(name ?? "");
  const detailsGridRef = useRef<HTMLDivElement>(null);

  useMasonryGrid(detailsGridRef);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!name) {
    return null;
  }

  if (error) {
    return <div>Error loading Pokémon: {error.message}</div>;
  }
  const _name = pokemonSpecies?.names.find((n) => n.language.name === language)?.name;
  const _formName = pokemonForm?.names.find((f) => f.language.name === language)?.name;
  document.title = `Pokédex | ${_formName ?? _name}`;

  return (
    <div
      className="pokemon-details-page"
      style={{ "--pokemon-color": color } as CSSProperties}
    >
      <PageHeader />
      <motion.div
        className="pokemon-details" 
        ref={detailsGridRef}
        initial={{ y: window.innerHeight, height: "0%" }}
        animate={{ y: 0, height: "100%", transition: { duration: 0.5 } }}
        exit={{ opacity: 0 }}
      >
        <PokemonInfoHeaderCard  slug={name} />
        <EvolutionChain slug={name} />
        <PokemonDescriptionCard slug={name} />
        <PokemonInfoDetailsCard  slug={name} />
        <PokemonBreedingCard slug={name} />
        <PokemonStatsCard slug={name} />
        <TypeCard slug={name} />
        <AbilitiesCard slug={name} />
        <PokemonMoves slug={name} />
        <OtherForms slug={name} />
      </motion.div>
    </div>
  );
}

export default PokemonDetailsPage;
