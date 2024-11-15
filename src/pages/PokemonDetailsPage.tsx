import { PokemonForm, PokemonSpecies } from "pokeapi-js-wrapper";
import { useEffect } from "react";
import { NavLink, Outlet, useParams } from "react-router-dom";
import PokemonInfoCard from "../components/pokemonInfoCard/PokemonInfoCard";
import usePokemonColor from "../hooks/usePokemonColor";
import pokedex from "../services/pokedexService";

function PokemonDetailsPage() {
  const { name } = useParams();
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
      const _name = species.names.find((n) => n.language.name === "en")?.name;
      const _formName = form.names.find((f) => f.language.name === "en")?.name;
      document.title = `Pokédex | ${_formName ?? _name}`;
    });
  }, [name]);

  if (!name) {
    return null;
  }

  return (
    <div className="pokemon-details" style={{ backgroundColor: `${color}` }}>
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
    </div>
  );
}

export default PokemonDetailsPage;
