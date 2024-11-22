import { motion } from "framer-motion";
import { PokemonForm, PokemonSpecies } from "pokeapi-js-wrapper";
import { useEffect } from "react";
import { NavLink, Outlet, useParams } from "react-router-dom";
import PageHeader from "../components/header/PageHeader";
import PokemonInfoCard from "../components/pokemonInfoCard/PokemonInfoCard";
import usePokemonColor from "../hooks/usePokemonColor";
import pokedex from "../services/pokedexService";
import usePokemonStore from "../store";

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
        <PokemonInfoCard slug={name} />
        <div className="pokemon-details-buttons">
          <NavLink
            to={`/pokemon/${name}/stats`}
            preventScrollReset={true}
            replace={true}
          >
            Stats
          </NavLink>
          <NavLink
            to={`/pokemon/${name}/evolution`}
            preventScrollReset={true}
            replace={true}
          >
            Evolution
          </NavLink>
          <NavLink
            to={`/pokemon/${name}/moves`}
            preventScrollReset={true}
            replace={true}
          >
            Moves
          </NavLink>
          <NavLink
            to={`/pokemon/${name}/forms`}
            preventScrollReset={true}
            replace={true}
          >
            Forms
          </NavLink>
        </div>
        <div className="pokemon-details-outlet">
          <Outlet />
        </div>
      </motion.div>
    </div>
  );
}

export default PokemonDetailsPage;
