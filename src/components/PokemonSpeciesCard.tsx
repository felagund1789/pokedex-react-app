import { useRef } from "react";
// import usePokemonSpecies from "../hooks/usePokemonSpecies";
import usePokemonDescription from "../hooks/usePokemonDescription";

interface Props {
  slug: string;
  color?: string;
}

const PokemonSpeciesCard = ({ slug, color }: Props) => {
  // const { data } = usePokemonSpecies({ slug });
  const pokemonDescription = usePokemonDescription({ slug });
  const cardRef = useRef<HTMLDivElement>(null);

  if (cardRef.current && color) {
    cardRef.current.style.backgroundColor = color;
  }

  return (
    <div className="pokemon-species" ref={cardRef}>
      <div className="pokemon-description">{pokemonDescription}</div>
    </div>
  );
};

export default PokemonSpeciesCard;
