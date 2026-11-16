import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { NamedAPIResource, Pokemon, PokemonForm, PokemonSpecies } from "pokeapi-js-wrapper";
import pokedex from "../services/pokedexService";

const useDefaultPokemonForm = (species: NamedAPIResource, enabled: boolean) => {
  const queryClient = useQueryClient();

  return useQuery<string, Error>({
    queryKey: ["default-pokemon-form", species.url],
    enabled,
    staleTime: Infinity,
    queryFn: async () => {
      const speciesData = await queryClient.query<PokemonSpecies>({
        queryKey: ["pokemon-species-resource", species.url],
        queryFn: () => pokedex.resource(species.url),
        staleTime: Infinity,
      });
      const variety = speciesData.varieties.find((entry) => entry.is_default);
      if (!variety) throw new Error(`No default variety for ${species.name}`);

      const pokemon = await queryClient.query<Pokemon>({
        queryKey: ["pokemon-resource", variety.pokemon.url],
        queryFn: () => pokedex.resource(variety.pokemon.url),
        staleTime: Infinity,
      });
      const forms = await Promise.all(pokemon.forms.map((form) =>
        queryClient.query<PokemonForm>({
          queryKey: ["pokemon-form-resource", form.url],
          queryFn: () => pokedex.resource(form.url),
          staleTime: Infinity,
        }),
      ));
      const form = forms.find((entry) => entry.is_default);
      if (!form) throw new Error(`No default form for ${variety.pokemon.name}`);
      return form.name;
    },
  });
};

export default useDefaultPokemonForm;
