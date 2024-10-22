import usePokemonData from "../hooks/usePokemonData";
import PokemonNumber from "./PokemonNumber";
import PokemonType from "./PokemonType";

interface PokemonCardProps {
  pokedexNo: number;
  pokemon: {
    name: string;
    url: string;
  };
}

const artworkBaseURL = import.meta.env.VITE_POKEMON_ARTWORK_BASE_URL;

const capitalize = (string: string) =>
  string.charAt(0).toUpperCase() + string.slice(1);

const PokemonCard = ({ pokedexNo, pokemon }: PokemonCardProps) => {
  const { data: pokemonData } = usePokemonData({ name: pokemon.name });

  return (
    <div>
      <PokemonNumber>{pokemonData?.id}</PokemonNumber>
      <img
        src={`${artworkBaseURL}${pokedexNo}.png`}
        alt={capitalize(pokemon.name)}
        height={95}
        width={95}
      />
      <h2>{capitalize(pokemon.name)}</h2>
      {pokemonData?.types.map((pokemonType) => {
        return <PokemonType>{pokemonType.type.name}</PokemonType>;
      })}
    </div>
  );
};

export default PokemonCard;
