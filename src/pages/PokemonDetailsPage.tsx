import { motion } from "framer-motion";
import { useEffect, useRef, type CSSProperties } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import PokemonStatsCard from "../components/PokemonStatsCard";
import EvolutionChain from "../components/evolutionChain/EvolutionChain";
import PageHeader from "../components/header/PageHeader";
import OtherForms from "../components/otherForms/OtherForms";
import PokemonMoves from "../components/pokemonMoves/PokemonMoves";
import usePokemonColor from "../hooks/usePokemonColor";
import useMasonryGrid from "../hooks/useMasonryGrid";
import usePokemonStore from "../store";
import PokemonInfoDetailsCard from "../components/pokemonInfoDetailsCard/PokemonInfoDetailsCard";
import PokemonInfoHeaderCard from "../components/pokemonInfoHeaderCard/PokemonInfoHeaderCard";
import PokemonDescriptionCard from "../components/pokemonDescriptionCard/PokemonDescriptionCard";
import AbilitiesCard from "../components/abilitiesCard/AbilitiesCard";
import TypeCard from "../components/typeCard/TypeCard";
import { pokemonFormName } from "../utils/pokemonFormName";
import useResolvedPokemon from "../hooks/useResolvedPokemon";
import usePokemonSpecies from "../hooks/usePokemonSpecies";

function PokemonDetailsPage() {
  const { name } = useParams();
  const [searchParams] = useSearchParams();
  const selectedForm = searchParams.get("form");
  const resolved = useResolvedPokemon(name ?? "", selectedForm);
  const species = usePokemonSpecies({ slug: name ?? "" });
  const language = usePokemonStore((state) => state.language);
  const color = usePokemonColor({ slug: name! });
  const detailsGridRef = useRef<HTMLDivElement>(null);

  useMasonryGrid(detailsGridRef, Boolean(resolved.data && species.data));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!resolved.data || !species.data) return;
    const pokemonName = species.data.names.find((entry) => entry.language.name === language)?.name;
    const formName = pokemonFormName(resolved.data.form, language, pokemonName, !resolved.data.form.is_default);
    document.title = `Pokédex | ${formName ?? pokemonName}`;
  }, [language, resolved.data, species.data]);

  if (!name) {
    return null;
  }
  if (resolved.error || species.error) {
    return <div role="alert">Unable to load Pokémon: {(resolved.error ?? species.error)?.message}</div>;
  }
  if (!resolved.data || !species.data) return <div role="status">Loading Pokémon...</div>;
  const pokemonSlug = resolved.data.pokemon.name;
  const formSlug = resolved.data.form.name;

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
        <PokemonInfoHeaderCard slug={formSlug} />
        <EvolutionChain slug={formSlug} />
        <PokemonDescriptionCard slug={pokemonSlug} />
        <PokemonInfoDetailsCard slug={pokemonSlug} />
        <PokemonStatsCard slug={pokemonSlug} />
        <TypeCard slug={formSlug} />
        <AbilitiesCard slug={pokemonSlug} />
        <PokemonMoves slug={pokemonSlug} />
        <OtherForms slug={formSlug} />
      </motion.div>
    </div>
  );
}

export default PokemonDetailsPage;
