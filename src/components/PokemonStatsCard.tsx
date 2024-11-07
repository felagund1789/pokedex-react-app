import { Pokemon } from "pokeapi-js-wrapper";
import { useEffect, useState } from "react";
import pokedex from "../services/pokedexService";
import StatBar from "./statBar/StatBar";
import StatPanel from "./statPanel/StatPanel";

interface Props {
  slug: string;
}

const kilogramsToPounds = (kilograms: number) => kilograms * 2.20462;
const metersToFeetAndInches = (meters: number) => {
  const inches = meters * 39.3701;
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  return `${feet}' ${remainingInches.toFixed(0)}"`;
};

const PokemonStatsCard = ({ slug }: Props) => {
  const [pokemon, setPokemon] = useState<Pokemon>({} as Pokemon);

  useEffect(() => {
    pokedex.getPokemonByName(slug).then(async (data) => {
      setPokemon(data);
    });
  }, [slug]);

  const height = `${pokemon.height ? pokemon.height / 10 : 0}m`;
  const weight = `${pokemon.weight ? pokemon.weight / 10 : 0}kg`;
  const heightUS = `${pokemon.height ? metersToFeetAndInches(pokemon.height / 10) : 0}`;
  const weightUS = `${pokemon.weight ? kilogramsToPounds(pokemon.weight / 10).toFixed(1) : 0}lbs`;

  return (
    <div className="pokemon-stats">
      <h2>Base Stats</h2>
      <div className="stat-info">
        {pokemon.height && (
          <StatPanel title="Height">
            {height} ({heightUS})
          </StatPanel>
        )}
        {pokemon.weight && (
          <StatPanel title="Weight">
            {weight} ({weightUS})
          </StatPanel>
        )}
      </div>
      {pokemon.stats?.map((pokemonStat, index) => (
        <StatBar key={index} pokemonStat={pokemonStat} />
      ))}
    </div>
  );
};

export default PokemonStatsCard;
