import { useRef } from "react";
import usePokemonData from "../hooks/usePokemonData";
import { Pokemon } from "../types";
import PokemonNumber from "./PokemonNumber";
import PokemonType from "./PokemonType";
import useColorThief from "../hooks/useColorThief";

interface PokemonCardProps {
  pokemon: Pokemon;
}

const artworkBaseURL = import.meta.env.VITE_POKEMON_ARTWORK_BASE_URL;

const PokemonCard = ({ pokemon }: PokemonCardProps) => {
  const { data: pokemonData } = usePokemonData({ name: pokemon.name });
  const cardRef = useRef<HTMLDivElement>(null);
  const imgUrl = `${artworkBaseURL}${pokemonData?.id}.png`;
  const { color } = useColorThief(imgUrl);

  if (cardRef.current && color) {
    cardRef.current.style.backgroundColor = color;
  }

  return (
    <div className="pokemon-card" ref={cardRef}>
      <div className="pokemon-image-background">
        <PokemonNumber>{pokemonData?.id}</PokemonNumber>
        <img
          crossOrigin="anonymous"
          src={imgUrl}
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
