import usePokemonData from "../hooks/usePokemonData";

interface PokemonCardProps {
  pokedexNo: number;
  pokemon: {
    name: string;
    url: string;
  };
}

const artworkBaseURL = import.meta.env.VITE_POKEMON_ARTWORK_BASE_URL;

const formatNumber = (number: number) => number.toString().padStart(3, "0");
const capitalize = (string: string) =>
  string.charAt(0).toUpperCase() + string.slice(1);

const PokemonCard = ({ pokedexNo, pokemon }: PokemonCardProps) => {
  const { data: pokemonData } = usePokemonData({ name: pokemon.name });

  return (
    <div>
      <h3>#{formatNumber(pokemonData?.id ?? 0)}</h3>
      <img
        src={`${artworkBaseURL}${pokedexNo}.png`}
        alt={capitalize(pokemon.name)}
        height={95}
        width={95}
      />
      <h2>{capitalize(pokemon.name)}</h2>
      {pokemonData?.types.map((pokemonType) => {
        return <p>{pokemonType.type.name}</p>;
      })}
    </div>
  );
};

export default PokemonCard;
