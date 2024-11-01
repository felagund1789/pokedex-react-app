import { useNavigate } from "react-router-dom";
import { Evolution } from "../../types";
import EvolutionDetailsCard from "../evolutionDetails/EvolutionDetailsCard";
import PokemonCard from "../pokemonCard/PokemonCard";
import "./EvolutionCard.css";

interface Props {
  evolvesTo: Evolution[];
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
            <div className="evolution-transition">
              {evolution.evolution_details.map((details, i) => (
                <EvolutionDetailsCard key={i} details={details} />
              ))}
              <EvolutionCard key={index} evolvesTo={evolution.evolves_to}>
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
