import { PokemonSpecies } from "pokeapi-js-wrapper";
import usePokemonStore from "../store";
import stringSimilarity from "../utils/stringSimilarity";

interface Props {
  species?: PokemonSpecies;
}

const sanitizeFlavorText = (flavorText: string): string => {
  return flavorText
    .replace(/­\n/g, "")
    .replace(/’/g, "'")
    .replace(/[\n\f]/g, " ");
};

const removeSimilarDescriptions = (texts: string[] | undefined) => {
    if (texts) {
      for (let i = 0; i < texts.length; i++) {
        for (let j = i + 1; j < texts.length; j++) {
          if (stringSimilarity(texts[i], texts[j]) > 0.9) {
            texts.splice(j, 1);
            j--;
          }
        }
      }
    }
  }

const usePokemonDescription = ({ species }: Props) => {
  const language = usePokemonStore((state) => state.language);

  const texts = species?.flavor_text_entries
    ?.filter((entry) => entry.language.name === language)
    .map((entry) => sanitizeFlavorText(entry.flavor_text));

  // Remove descriptions that have a similarity > 0.9
  removeSimilarDescriptions(texts);

  return [...new Set(texts)];
};

export default usePokemonDescription;
