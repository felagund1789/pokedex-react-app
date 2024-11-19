import { motion } from "motion/react";
import { useRef } from "react";
import usePokemonColor from "../../hooks/usePokemonColor";
import usePokemonInfo from "../../hooks/usePokemonInfo";
import PokemonNumber from "../PokemonNumber";
import PokemonType from "../pokemonType/PokemonType";
import "./PokemonCard.css";

interface PokemonCardProps {
  slug: string;
  onClick?: () => void;
}

const PokemonCard = ({ slug, onClick }: PokemonCardProps) => {
  const {
    pokedexNumber,
    pokemonName,
    pokemonFormName,
    types,
    artworkURL,
    loading,
  } = usePokemonInfo(slug);

  const cardRef = useRef<HTMLDivElement>(null);
  const color = usePokemonColor({ slug });

  if (cardRef.current && color) {
    cardRef.current.style.backgroundColor = color;
  }

  return (
    <motion.div
      layoutId={`pokemon-${slug}`}
      className="pokemon-card"
      ref={cardRef}
      onClick={onClick}
    >
      <div className="pokemon-image-background">
        <PokemonNumber>{pokedexNumber}</PokemonNumber>
        {loading && <div className="image"></div>}
        {!loading && (
          <img className="image" src={artworkURL} alt={pokemonName} />
        )}
      </div>
      <div className="pokemon-title">
        <div className="types">
          {types?.map((pokemonType, index) => {
            return <PokemonType key={index}>{pokemonType}</PokemonType>;
          })}
        </div>
        <h2>
          {pokemonFormName && pokemonFormName?.trim().length > 0
            ? pokemonFormName
            : pokemonName}
        </h2>
      </div>
    </motion.div>
  );
};

export default PokemonCard;
