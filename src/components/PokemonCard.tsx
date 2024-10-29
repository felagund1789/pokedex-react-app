import { useRef } from "react";
import useColorThief from "../hooks/useColorThief";
import usePokedexNumber from "../hooks/usePokedexNumber";
import usePokemon from "../hooks/usePokemon";
import usePokemonName from "../hooks/usePokemonName";
import PokemonNumber from "./PokemonNumber";
import PokemonType from "./PokemonType";
import usePokemonFormName from "../hooks/usePokemonFormName";

interface PokemonCardProps {
  slug: string;
  onClick?: () => void;
}

const artworkBaseURL = import.meta.env.VITE_POKEMON_ARTWORK_BASE_URL;

const PokemonCard = ({ slug, onClick }: PokemonCardProps) => {
  const { data: pokemon } = usePokemon({ slug });
  const pokedexNumber = usePokedexNumber({ slug });
  const pokemonName = usePokemonName({ slug });
  const pokemonFormName = usePokemonFormName({ slug });

  const cardRef = useRef<HTMLDivElement>(null);
  const imgUrl = `${artworkBaseURL}${pokemon?.id}.png`;
  const { color } = useColorThief(imgUrl);

  if (cardRef.current && color) {
    cardRef.current.style.backgroundColor = color;
  }

  return (
    <div className="pokemon-card" ref={cardRef} onClick={onClick}>
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
      <h2>{pokemonFormName ?? pokemonName}</h2>
    </div>
  );
};

export default PokemonCard;
