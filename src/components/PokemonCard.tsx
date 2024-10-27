import { useRef } from "react";
import useColorThief from "../hooks/useColorThief";
import usePokemon from "../hooks/usePokemon";
import usePokemonSpecies from "../hooks/usePokemonSpecies";
import PokemonNumber from "./PokemonNumber";
import PokemonType from "./PokemonType";

interface PokemonCardProps {
  slug: string;
}

const artworkBaseURL = import.meta.env.VITE_POKEMON_ARTWORK_BASE_URL;
const language = "en";
const pokedex = "national";

const PokemonCard = ({ slug }: PokemonCardProps) => {
  const { data: pokemon } = usePokemon({ slug });
  const { data: pokemonSpecies } = usePokemonSpecies({ slug });
  const pokedexNumber = pokemonSpecies?.pokedex_numbers.find(number => number.pokedex.name === pokedex)?.entry_number;
  const pokemonName = pokemonSpecies?.names.find(name => name.language.name === language)?.name;

  const cardRef = useRef<HTMLDivElement>(null);
  const imgUrl = `${artworkBaseURL}${pokemon?.id}.png`;
  const { color } = useColorThief(imgUrl);

  if (cardRef.current && color) {
    cardRef.current.style.backgroundColor = color;
  }

  return (
    <div className="pokemon-card" ref={cardRef}>
      <div className="pokemon-image-background">
        <PokemonNumber>{pokedexNumber}</PokemonNumber>
        <img
          crossOrigin="anonymous"
          src={imgUrl}
          alt={pokemonName}
          height={150}
          width={150}
        />
      </div>
      <div>
        {pokemon?.types.map((pokemonType, index) => {
          return <PokemonType key={index}>{pokemonType.type.name}</PokemonType>;
        })}
      </div>
      <h2>{pokemonName}</h2>
    </div>
  );
};

export default PokemonCard;
