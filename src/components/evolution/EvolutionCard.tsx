import { useNavigate } from "react-router-dom";
import type { DisplayNode } from "../evolutionChain/evolutionModel";
import EvolutionDetailsCard from "../evolutionDetails/EvolutionDetailsCard";
import PokemonCard from "../pokemonCard/PokemonCard";
import "./EvolutionCard.css";

interface Props {
  node: DisplayNode;
}

const EvolutionCard = ({ node }: Props) => {
  const navigate = useNavigate();
  const { pokemon, form, explicitForm } = node.display;
  const formParam = pokemon.forms.length > 1 && !form.is_default
    ? `?form=${encodeURIComponent(form.name)}`
    : "";

  return (
    <div className="evolution-card">
      <div className="evolves-from">
        <PokemonCard
          slug={pokemon.name}
          form={explicitForm ? form : undefined}
          useFormSprite={Boolean(formParam)}
          onClick={() => navigate(`/pokemon/${pokemon.name}${formParam}`)}
        />
        {!explicitForm && node.display.hasAlternatives && (
          <small hidden>Form unspecified; showing the default variety</small>
        )}
      </div>
      {node.transitions.length > 0 && (
        <div className="evolves-to">
          {node.transitions.map((transition) => (
            <div key={transition.target.display.formResource.url} className="evolution-transition">
              <div className="evolution-methods">
                {transition.methods.length ? transition.methods.map((method, index) => (
                  <EvolutionDetailsCard key={index} details={method} />
                )) : <div>Evolution requirements unavailable</div>}
                {transition.uncertain && (
                  <small hidden>Form applicability may vary by game</small>
                )}
              </div>
              <EvolutionCard node={transition.target} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EvolutionCard;
