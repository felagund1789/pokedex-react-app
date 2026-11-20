import type { PokemonForm, PokemonSpecies } from "pokeapi-js-wrapper";
import usePokemonStore from "../../store";
import "./PokemonSpeciesDesignation.css";

interface Props {
  species?: PokemonSpecies;
  form?: PokemonForm;
}

const PokemonSpeciesDesignation = ({ species, form }: Props) => {
  const language = usePokemonStore((state) => state.language);

  const designations = [
    species?.is_baby ? "Baby" : undefined,
    species?.is_legendary ? "Legendary" : undefined,
    species?.is_mythical ? "Mythical" : undefined,
    form?.is_mega ? "Mega Evolution" : undefined,
    form?.form_name !== species?.name && !form?.is_mega && form?.form_names
      ? form?.form_names.find((n) => n.language.name === language)?.name
      : undefined,
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
