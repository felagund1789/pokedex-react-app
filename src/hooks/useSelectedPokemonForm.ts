import { useQuery } from "@tanstack/react-query";
import type { Pokemon, PokemonForm } from "pokeapi-js-wrapper";
import pokedex from "../services/pokedexService";
import usePokemon from "./usePokemon";

export async function resolvePokemonForm(pokemon: Pokemon, selectedForm: string | null): Promise<PokemonForm> {
  if (!pokemon.forms.length) throw new Error(`No forms are available for ${pokemon.name}.`);
  if (selectedForm) {
    const resource = pokemon.forms.find((entry) => entry.name === selectedForm);
    if (!resource) throw new Error(`Form ${selectedForm} is not available for ${pokemon.name}.`);
    return pokedex.resource(resource.url);
  }
  if (pokemon.forms.length === 1) return pokedex.resource(pokemon.forms[0].url);
  
  const forms: PokemonForm[] = await Promise.all(pokemon.forms.map((entry) => pokedex.resource(entry.url)));
  const defaultForm = forms.find((entry) => entry.is_default);
  
  if (!defaultForm) throw new Error(`No default form is available for ${pokemon.name}.`);
  
  return defaultForm;
}

const useSelectedPokemonForm = (slug: string, selectedForm: string | null) => {
  const pokemon = usePokemon({ slug });
  const form = useQuery({
    queryKey: ["selected-pokemon-form", slug, selectedForm],
    queryFn: () => resolvePokemonForm(pokemon.data!, selectedForm),
    enabled: Boolean(pokemon.data),
    staleTime: 24 * 60 * 60 * 1000,
  });

  return {
    data: form.data,
    error: pokemon.error ?? form.error,
    isLoading: pokemon.isLoading || (Boolean(pokemon.data) && form.isLoading),
  };
};

export default useSelectedPokemonForm;
