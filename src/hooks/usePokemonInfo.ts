import usePokemonStore from "../store";
import { formArtwork } from "../services/pokemonResolver";
import { pokemonFormName as getFormName } from "../utils/pokemonFormName";
import useResolvedPokemon from "./useResolvedPokemon";
import usePokemonSpecies from "./usePokemonSpecies";

const usePokemonInfo = (slug: string) => {
  const language = usePokemonStore((state) => state.language);
  const resolved = useResolvedPokemon(slug);
  const species = usePokemonSpecies({ slug });
  const pokemon = resolved.data?.pokemon;
  const form = resolved.data?.form;
  const pokemonName = species.data?.names.find((entry) => entry.language.name === language)?.name;
  return {
    pokedexNumber: species.data?.pokedex_numbers.find((entry) => entry.pokedex.name === "national")?.entry_number,
    pokemonName,
    pokemonFormName: getFormName(form, language, pokemonName, Boolean(form && !form.is_default)),
    generation: species.data?.generation.name.replace("generation-", "").toUpperCase(),
    types: (form?.types?.length ? form.types : pokemon?.types)?.map((entry) => entry.type.name) ?? [],
    artworkURL: form && pokemon ? formArtwork(form, pokemon) : undefined,
    loading: resolved.isLoading || species.isLoading,
    error: resolved.error ?? species.error,
  };
};

export default usePokemonInfo;
