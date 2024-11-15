import { useInfiniteQuery } from "@tanstack/react-query";
import { NamedAPIResourceList, PokemonSpecies } from "pokeapi-js-wrapper";
import pokedex from "../services/pokedexService";

const filterPokemonByNameContaining = (name: string) =>
  pokedex
    .getPokemonsList({
      offset: 0,
      limit: 10000,
    })
    .then((res) => {
      const results = res.results.filter((pokemon) =>
        pokemon.name.includes(name.toLowerCase().trim())
      );

      return {
        count: results.length,
        next: null,
        previous: null,
        results,
      };
    });

const filterPokemonByGeneration = (generation: string) =>
  pokedex.getGenerationByName(generation).then(async (gen) => {
    const resources = gen.pokemon_species.sort((a, b) => {
      const aNumber = Number(a.url.split("/").slice(-2)[0]);
      const bNumber = Number(b.url.split("/").slice(-2)[0]);
      return aNumber - bNumber;
    });

    const species = await Promise.all(
      resources.map((resource) => pokedex.resource(resource.url))
    );

    const results = species
      .map((s: PokemonSpecies) => s.varieties.sort((a, b) => a.slot - b.slot))
      .flat()
      .map((v) => v.pokemon);

    return {
      count: results.length,
      next: null,
      previous: null,
      results: results,
    };
  });

const usePokemonList = (search: string) => {
  return useInfiniteQuery<NamedAPIResourceList, Error>({
    queryKey: ["pokemon-list", search],
    queryFn: ({ pageParam }) => {
      if (search && search.indexOf("generation") === 0) {
        return filterPokemonByGeneration(search);
      } else if (search) {
        return filterPokemonByNameContaining(search);
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
