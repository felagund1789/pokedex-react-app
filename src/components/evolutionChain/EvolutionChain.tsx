import { useNavigate } from "react-router-dom";
import useEvolutionChain from "../../hooks/useEvolutionChain";
import EvolutionCard from "../evolution/EvolutionCard";
import PokemonCard from "../pokemonCard/PokemonCard";
import "./EvolutionChain.css";

interface Props {
  slug: string;
}

const EvolutionChain = ({ slug }: Props) => {
  const { data, error } = useEvolutionChain({ slug });
  const navigate = useNavigate();

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!data) return null;

  return (
    <div className="evolution-chain">
      <h2 className="title">Evolution</h2>
      <div className="evolution">
        <EvolutionCard evolvesTo={data.chain.evolves_to}>
          <PokemonCard
            slug={data.chain.species.name}
            onClick={() =>
              navigate(`/pokemon/${data.chain.species.name}/stats`)
            }
          />
        </EvolutionCard>
      </div>
    </div>
  );
};

export default EvolutionChain;
