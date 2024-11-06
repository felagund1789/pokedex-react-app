import { PokemonSpecies } from "pokeapi-js-wrapper";

interface Props {
  species?: PokemonSpecies;
}

const usePokemonDescription = ({ species }: Props) => {
  const language = "en";
  const version = null;

  const texts = species?.flavor_text_entries?.filter(
    (entry) => entry.language.name === language
  );

  if (version) {
    return texts
      ?.find((entry) => entry.version.name === version)
      ?.flavor_text.replace(/[\n\f]/g, " ");
  } else if (texts && texts.length > 0) {
    return texts[0]?.flavor_text.replace(/[\n\f]/g, " ");
  }
};

export default usePokemonDescription;
