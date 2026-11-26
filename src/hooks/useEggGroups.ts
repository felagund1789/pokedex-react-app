import { useQuery, useQueryClient } from "@tanstack/react-query";
import { EggGroup, NamedAPIResource, PokemonSpecies } from "pokeapi-js-wrapper";
import { eggGroupQuery } from "./eggGroupQuery";

const useEggGroups = (pokemonSpecies: PokemonSpecies | null) => {
  const queryClient = useQueryClient();
  return useQuery<EggGroup[], Error>({
    queryKey: ["egg-groups", pokemonSpecies?.egg_groups],
    queryFn: () =>
      pokemonSpecies
        ? Promise.all(
          pokemonSpecies.egg_groups.map((eg: NamedAPIResource) => queryClient.query(eggGroupQuery(eg.name)))
        ).then((data) => data)
        : [],
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

export default useEggGroups;
