import { ChainEvolvesTo } from "pokeapi-js-wrapper";
import { useNavigate } from "react-router-dom";
import { findSimplestEvolution } from "../../utils";
import EvolutionDetailsCard from "../evolutionDetails/EvolutionDetailsCard";
import PokemonCard from "../pokemonCard/PokemonCard";
import "./EvolutionCard.css";

interface Props {
  evolvesTo: ChainEvolvesTo[];
  children: React.ReactNode;
}

const EvolutionCard = ({ evolvesTo, children }: Props) => {
  const navigate = useNavigate();

  return (
    <div className="evolution-card">
      <div className="evolves-from">{children}</div>
      {evolvesTo && evolvesTo.length > 0 && (
        <div className="evolves-to">
          {evolvesTo.map((evolution, index) => (
            <div key={index} className="evolution-transition">
              {evolution.evolution_details
                .reduce(findSimplestEvolution, [])
                .map((details, i) => (
                  <EvolutionDetailsCard key={i} details={details} />
                ))}
              <EvolutionCard evolvesTo={evolution.evolves_to}>
                <PokemonCard
                  slug={evolution.species.name}
                  onClick={() =>
                    navigate(`/pokemon/${evolution.species.name}/stats`)
                  }
                />
              </EvolutionCard>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EvolutionCard;
