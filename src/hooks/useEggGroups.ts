import { useQuery } from "@tanstack/react-query";
import { EggGroup, NamedAPIResource, PokemonSpecies } from "pokeapi-js-wrapper";
import pokedex from "../services/pokedexService";

const useEggGroups = (pokemonSpecies: PokemonSpecies | null) => {
  return useQuery<EggGroup[], Error>({
    queryKey: ["egg-groups", pokemonSpecies?.egg_groups],
    queryFn: () =>
      pokemonSpecies
        ? Promise.all(
          pokemonSpecies?.egg_groups?.map((eg: NamedAPIResource) => pokedex.getEggGroupByName(eg.name))
        ).then((data) => data)
        : [],
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

export default useEggGroups;
