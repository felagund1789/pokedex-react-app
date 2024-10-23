import { useEffect, useRef } from "react";
import usePokemonData from "../hooks/usePokemonData";
import { Pokemon } from "../types";
import PokemonNumber from "./PokemonNumber";
import PokemonType from "./PokemonType";
import ColorThief from "colorthief";

interface PokemonCardProps {
  pokemon: Pokemon;
}

const artworkBaseURL = import.meta.env.VITE_POKEMON_ARTWORK_BASE_URL;
const colorthief = new ColorThief();

const PokemonCard = ({ pokemon }: PokemonCardProps) => {
  const { data: pokemonData } = usePokemonData({ name: pokemon.name });
  const imgRef = useRef<HTMLImageElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete) {
      const color = colorthief.getColor(imgRef.current, 5);
      cardRef.current!.style.backgroundColor = `rgb(${color?.join(",")})`;
    } else {
      img?.addEventListener("load", () => {
        const color = colorthief.getColor(imgRef.current, 5);
        cardRef.current!.style.backgroundColor = `rgb(${color?.join(",")})`;
      });
    }
  }, [pokemonData]);

  return (
    <div className="pokemon-card" ref={cardRef}>
      <div className="pokemon-image-background">
        <PokemonNumber>{pokemonData?.id}</PokemonNumber>
        <img
          ref={imgRef}
          crossOrigin="anonymous"
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
