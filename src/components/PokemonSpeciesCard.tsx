import { useRef } from "react";
import usePokemonSpecies from "../hooks/usePokemonSpecies";
import usePokemonDescription from "../hooks/usePokemonDescription";
import useResourceName from "../hooks/useResourceName";
import StatPanel from "./StatPanel";

interface Props {
  slug: string;
  color?: string;
}

const PokemonSpeciesCard = ({ slug, color }: Props) => {
  const { data } = usePokemonSpecies({ slug });
  const { data: habitat } = useResourceName(data?.habitat);
  const pokemonDescription = usePokemonDescription({ slug });
  const cardRef = useRef<HTMLDivElement>(null);

  if (cardRef.current && color) {
    cardRef.current.style.backgroundColor = color;
  }

  return (
    <div className="pokemon-species" ref={cardRef}>
      <h2>Pokémon Species</h2>
      <div className="pokemon-description">{pokemonDescription}</div>
      <div className="info">
        {data?.base_happiness && (
          <StatPanel title="Base Happiness">{data.base_happiness}</StatPanel>
        )}
        {data?.capture_rate && (
          <StatPanel title="Capture Rate">{data.capture_rate}</StatPanel>
        )}
        {data?.hatch_counter && (
          <StatPanel title="Hatch Counter">{data.hatch_counter}</StatPanel>
        )}
        {habitat && <StatPanel title="Habitat">{habitat}</StatPanel>}
      </div>
    </div>
  );
};

export default PokemonSpeciesCard;
