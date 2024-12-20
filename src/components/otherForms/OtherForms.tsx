import { useNavigate } from "react-router-dom";
import usePokemonSpecies from "../../hooks/usePokemonSpecies";
import PokemonCard from "../pokemonCard/PokemonCard";
import "./OtherForms.css";

interface Props {
  slug: string;
}

const OtherForms = ({ slug }: Props) => {
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
                navigate(`/pokemon/${pokemonVariety.pokemon.name}/stats`)
              }
            />
          ))}
      </div>
    </div>
  );
};

export default OtherForms;
