import { motion } from "framer-motion";
import { PokemonSpecies } from "pokeapi-js-wrapper";
import { useEffect, useRef, type CSSProperties } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import PokemonStatsCard from "../components/PokemonStatsCard";
import EvolutionChain from "../components/evolutionChain/EvolutionChain";
import PageHeader from "../components/header/PageHeader";
import OtherForms from "../components/otherForms/OtherForms";
import PokemonMoves from "../components/pokemonMoves/PokemonMoves";
import usePokemonColor from "../hooks/usePokemonColor";
import useMasonryGrid from "../hooks/useMasonryGrid";
import pokedex from "../services/pokedexService";
import usePokemonStore from "../store";
import PokemonInfoDetailsCard from "../components/pokemonInfoDetailsCard/PokemonInfoDetailsCard";
import PokemonInfoHeaderCard from "../components/pokemonInfoHeaderCard/PokemonInfoHeaderCard";
import PokemonDescriptionCard from "../components/pokemonDescriptionCard/PokemonDescriptionCard";
import AbilitiesCard from "../components/abilitiesCard/AbilitiesCard";
import TypeCard from "../components/typeCard/TypeCard";
import { resolvePokemonForm } from "../hooks/useSelectedPokemonForm";
import { pokemonFormName } from "../utils/pokemonFormName";

function PokemonDetailsPage() {
  const { name } = useParams();
  const [searchParams] = useSearchParams();
  const selectedForm = searchParams.get("form");
  const language = usePokemonStore((state) => state.language);
  const color = usePokemonColor({ slug: name! });
  const detailsGridRef = useRef<HTMLDivElement>(null);

  useMasonryGrid(detailsGridRef);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!name) {
      return;
    }

    let active = true;
    pokedex.getPokemonByName(name).then(async (data) => {
      const species: PokemonSpecies = await pokedex.resource(data.species.url);
      const form = await resolvePokemonForm(data, selectedForm);
      const _name = species.names.find((n) => n.language.name === language)?.name;
      const _formName = pokemonFormName(form, language, _name, Boolean(selectedForm));
      if (active) document.title = `Pokédex | ${_formName ?? _name}`;
    }).catch((error: unknown) => console.error("Unable to load Pokémon page title:", error));
    return () => { active = false; };
  }, [language, name, selectedForm]);

  if (!name) {
    return null;
  }

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
        <PokemonInfoHeaderCard slug={name} selectedForm={selectedForm} />
        <EvolutionChain slug={name} />
        <PokemonDescriptionCard slug={name} />
        <PokemonInfoDetailsCard  slug={name} />
        <PokemonStatsCard slug={name} />
        <TypeCard slug={name} selectedForm={selectedForm} />
        <AbilitiesCard slug={name} />
        <PokemonMoves slug={name} />
        <OtherForms slug={name} />
      </motion.div>
    </div>
  );
}

export default PokemonDetailsPage;
