import { useRef } from "react";
import usePokemonSpecies from "../hooks/usePokemonSpecies";
import PokemonCard from "./PokemonCard";
import { useNavigate } from "react-router-dom";

interface Props {
  slug: string;
  color?: string;
}

const OtherFormsCard = ({ slug, color }: Props) => {
  const { data } = usePokemonSpecies({ slug });
  const navigate = useNavigate();

  const cardRef = useRef<HTMLDivElement>(null);
  if (cardRef.current && color) {
    // cardRef.current.style.backgroundColor = color;
  }

  return (
    <div className="other-forms" ref={cardRef}>
      <h2 className="title">Other Forms</h2>
      <div className="other-forms-list">
        {data?.varieties
          .filter((pokemonVariety) => pokemonVariety.pokemon.name !== slug)
          .map((pokemonVariety, index) => (
            <PokemonCard
              key={index}
              slug={pokemonVariety.pokemon.name}
              onClick={() =>
                navigate(`/pokemon/${pokemonVariety.pokemon.name}`)
              }
            />
          ))}
      </div>
    </div>
  );
};

export default OtherFormsCard;
