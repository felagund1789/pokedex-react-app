import { useNavigate } from "react-router-dom";
import usePokemonSpecies from "../hooks/usePokemonSpecies";
import PokemonCard from "./pokemonCard/PokemonCard";

interface Props {
  slug: string;
}

const OtherFormsCard = ({ slug }: Props) => {
  const { data } = usePokemonSpecies({ slug });
  const navigate = useNavigate();

  return (
    <div className="other-forms">
      <h2 className="title">Alternative Forms</h2>
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
