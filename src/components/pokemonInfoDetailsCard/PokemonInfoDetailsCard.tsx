import usePokemonInfo from "../../hooks/usePokemonInfo";
import StatPanel from "../statPanel/StatPanel";
import "./PokemonInfoDetailsCard.css";

interface Props {
  slug: string;
}

const PokemonInfoDetailsCard = ({ slug }: Props) => {
  const {
    pokemon,
    pokemonSpecies,
    habitat,
    generation,
  } = usePokemonInfo(slug);

  return (
    <div className="pokemon-info-details-card">
      <div className="pokemon-info-details-card__info">
        {Boolean(pokemon?.base_experience) && (
          <StatPanel title="Base Experience">
            {pokemon?.base_experience}
          </StatPanel>
        )}
        {Boolean(pokemonSpecies?.base_happiness) && (
          <StatPanel title="Base Happiness">{pokemonSpecies?.base_happiness}</StatPanel>
        )}
        {Boolean(pokemonSpecies?.capture_rate) && (
          <StatPanel title="Capture Rate">{pokemonSpecies?.capture_rate}</StatPanel>
        )}
        {habitat && <StatPanel title="Habitat">{habitat}</StatPanel>}
        {generation && <StatPanel title="Generation">{generation}</StatPanel>}
      </div>
    </div>
  );
};

export default PokemonInfoDetailsCard;
