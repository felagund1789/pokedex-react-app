import { useRef } from "react";
import usePokemonSpecies from "../hooks/usePokemonSpecies";
import usePokemonDescription from "../hooks/usePokemonDescription";
import useResourceName from "../hooks/useResourceName";

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
          <div>
            <h4>{data.base_happiness}</h4>
            <p>Base Happiness</p>
          </div>
        )}
        {data?.capture_rate && (
          <div>
            <h4>{data.capture_rate}</h4>
            <p>Capture Rate</p>
          </div>
        )}
        {data?.hatch_counter && (
          <div>
            <h4>{data.hatch_counter}</h4>
            <p>Hatch Counter</p>
          </div>
        )}
        {data?.habitat && (
          <div>
            <h4>{habitat}</h4>
            <p>Habitat</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PokemonSpeciesCard;
