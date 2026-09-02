import { motion } from "framer-motion";
import { PokemonForm, PokemonSpecies } from "pokeapi-js-wrapper";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import PokemonStatsCard from "../components/PokemonStatsCard";
import EvolutionChain from "../components/evolutionChain/EvolutionChain";
import PageHeader from "../components/header/PageHeader";
import OtherForms from "../components/otherForms/OtherForms";
import PokemonMoves from "../components/pokemonMoves/PokemonMoves";
import usePokemonColor from "../hooks/usePokemonColor";
import pokedex from "../services/pokedexService";
import usePokemonStore from "../store";
import PokemonInfoDetailsCard from "../components/pokemonInfoDetailsCard/PokemonInfoDetailsCard";
import PokemonInfoHeaderCard from "../components/pokemonInfoHeaderCard/PokemonInfoHeaderCard";
import PokemonDescriptionCard from "../components/pokemonDescriptionCard/PokemonDescriptionCard";

function PokemonDetailsPage() {
  const { name } = useParams();
  const language = usePokemonStore((state) => state.language);
  const color = usePokemonColor({ slug: name! });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!name) {
      return;
    }

    pokedex.getPokemonByName(name).then(async (data) => {
      const species: PokemonSpecies = await pokedex.resource(data.species.url);
      const form: PokemonForm = await pokedex.getPokemonFormByName(data.forms[0].name);
      const _name = species.names.find((n) => n.language.name === language)?.name;
      const _formName = form.names.find((f) => f.language.name === language)?.name;
      document.title = `Pokédex | ${_formName ?? _name}`;
    });
  }, [language, name]);

  if (!name) {
    return null;
  }

  return (
    <div style={{ backgroundColor: `${color}` }}>
      <PageHeader />
      <motion.div
        className="pokemon-details" 
        initial={{ y: window.innerHeight, height: "0%" }}
        animate={{ y: 0, height: "100%", transition: { duration: 0.5 } }}
        exit={{ opacity: 0 }}
      >
        <PokemonInfoHeaderCard  slug={name} />
        <EvolutionChain slug={name} />
        <PokemonDescriptionCard slug={name} />
        <PokemonInfoDetailsCard  slug={name} />
        <PokemonStatsCard slug={name} />
        <PokemonMoves slug={name} />
        <OtherForms slug={name} />
      </motion.div>
    </div>
  );
}

export default PokemonDetailsPage;
