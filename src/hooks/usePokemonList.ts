import { useInfiniteQuery } from "@tanstack/react-query";
import { NamedAPIResourceList } from "pokeapi-js-wrapper";
import pokedex from "../services/pokedexService";

const usePokemonList = (search: string) => {
  return useInfiniteQuery<NamedAPIResourceList, Error>({
    queryKey: ["pokemon-list", search],
    queryFn: ({ pageParam }) => {
      if (search) {
        return pokedex
          .getPokemonsList({
            offset: 0,
            limit: 10000,
          })
          .then((res) => {
            const results = res.results.filter((pokemon) =>
              pokemon.name.includes(search.toLowerCase().trim())
            );
            return {
              count: results.length,
              next: null,
              previous: null,
              results,
            };
          });
      } else {
        return pokedex.getPokemonsList({
          limit: 20,
          offset: (Number(pageParam) - 1) * 20,
        });
      }
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.next ? allPages.length + 1 : undefined,
    initialPageParam: 1,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

export default usePokemonList;
