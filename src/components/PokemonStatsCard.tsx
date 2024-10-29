import { useRef } from "react";
import usePokemon from "../hooks/usePokemon";
import StatBar from "./StatBar";

interface Props {
  slug: string;
  color?: string;
}

const PokemonStatsCard = ({ slug, color }: Props) => {
  const { data } = usePokemon({ slug });

  const cardRef = useRef<HTMLDivElement>(null);
  if (cardRef.current && color) {
    cardRef.current.style.backgroundColor = color;
  }

  return (
    <div className="pokemon-stats" ref={cardRef}>
      <h2>Base Stats</h2>
      <div className="info">
        {data?.stats.map((pokemonStat, index) => (
          <StatBar key={index} pokemonStat={pokemonStat} />
        ))}
      </div>
    </div>
  );
};

export default PokemonStatsCard;
