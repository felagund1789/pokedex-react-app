import type { PokemonSpecies } from "pokeapi-js-wrapper";
import "./PokemonSpeciesDesignation.css";

interface Props {
  species?: PokemonSpecies;
}

const PokemonSpeciesDesignation = ({ species }: Props) => {
  const designations = [
    species?.is_baby ? "Baby" : undefined,
    species?.is_legendary ? "Legendary" : undefined,
    species?.is_mythical ? "Mythical" : undefined,
  ].filter((designation): designation is string => Boolean(designation));

  if (designations.length === 0) return null;

  return (
    <div className="pokemon-species-designation" role="group" aria-label="Special designation">
      {designations.map((designation) => (
        <span className="pokemon-species-designation__badge" key={designation}>
          {designation}
        </span>
      ))}
    </div>
  );
};

export default PokemonSpeciesDesignation;
