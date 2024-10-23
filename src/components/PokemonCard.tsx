import usePokemonData from "../hooks/usePokemonData";
import { Pokemon } from "../types";
import PokemonNumber from "./PokemonNumber";
import PokemonType from "./PokemonType";

interface PokemonCardProps {
  pokemon: Pokemon;
}

const artworkBaseURL = import.meta.env.VITE_POKEMON_ARTWORK_BASE_URL;

const PokemonCard = ({ pokemon }: PokemonCardProps) => {
  const { data: pokemonData } = usePokemonData({ name: pokemon.name });

  return (
    <div className={`pokemon-card ${pokemonData?.types[0].type.name}`}>
      <div className="pokemon-image-background">
        <PokemonNumber>{pokemonData?.id}</PokemonNumber>
        <img
          src={`${artworkBaseURL}${pokemonData?.id}.png`}
          alt={pokemon.name}
          height={150}
          width={150}
        />
      </div>
      <div>
        {pokemonData?.types.map((pokemonType, index) => {
          return <PokemonType key={index}>{pokemonType.type.name}</PokemonType>;
        })}
      </div>
      <h2>{pokemon.name}</h2>
    </div>
  );
};

export default PokemonCard;
