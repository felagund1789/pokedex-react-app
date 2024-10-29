import { useRef } from "react";
import usePokemon from "../hooks/usePokemon";
import StatBar from "./StatBar";
import StatPanel from "./StatPanel";

interface Props {
  slug: string;
  color?: string;
}

const kilogramsToPounds = (kilograms: number) => kilograms * 2.20462;
const metersToFeetAndInches = (meters: number) => {
  const inches = meters * 39.3701;
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  return `${feet}' ${remainingInches.toFixed(0)}"`;
}

const PokemonStatsCard = ({ slug, color }: Props) => {
  const { data } = usePokemon({ slug });
  const height = `${data?.height ? data?.height / 10 : 0}m`;
  const weight = `${data?.weight ? data?.weight / 10 : 0}kg`;
  const heightUS = `${data?.height ? metersToFeetAndInches(data?.height / 10) : 0}`;
  const weightUS = `${data?.weight ? kilogramsToPounds(data?.weight / 10).toFixed(1) : 0}lbs`;

  const cardRef = useRef<HTMLDivElement>(null);
  if (cardRef.current && color) {
    cardRef.current.style.backgroundColor = color;
  }

  return (
    <div className="pokemon-stats" ref={cardRef}>
      <h2>Base Stats</h2>
      <div className="stat-info">
        {data?.height && (
          <StatPanel title="Height">{height} ({heightUS})</StatPanel>
        )}
        {data?.weight && (
          <StatPanel title="Weight">{weight} ({weightUS})</StatPanel>
        )}
      </div>
      {data?.stats.map((pokemonStat, index) => (
        <StatBar key={index} pokemonStat={pokemonStat} />
      ))}
    </div>
  );
};

export default PokemonStatsCard;
