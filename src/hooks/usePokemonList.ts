import { useQuery } from "@tanstack/react-query";
import { NamedAPIResourceList } from "pokeapi-js-wrapper";
import pokedex from "../services/pokedexService";
import types from "../assets/types";
import { Generation, PokemonTypeName } from "../store";

const ALL_POKEMON_LIMIT = 10000;

const generationLookup: Record<Generation, string> = {
  I: "generation-i",
  II: "generation-ii",
  III: "generation-iii",
  IV: "generation-iv",
  V: "generation-v",
  VI: "generation-vi",
  VII: "generation-vii",
  VIII: "generation-viii",
  IX: "generation-ix",
};

type FilterQuery = {
  search?: string;
  types?: PokemonTypeName[];
  generation?: Generation;
};

const matchesGeneration = (slug: string, speciesSet: Set<string>) => {
  if (speciesSet.has(slug)) {
    return true;
  }

  const slugParts = slug.split("-");
  while (slugParts.length > 1) {
    slugParts.pop();
    if (speciesSet.has(slugParts.join("-"))) {
      return true;
    }
  }

  return false;
};

const allTypeNames = Object.keys(types) as PokemonTypeName[];

const usePokemonList = ({ search = "", types: selectedTypes = [], generation }: FilterQuery) => {
  const normalizedSearch = search.toLowerCase().trim();
  const typeKey = [...selectedTypes].sort().join("+") || "all";

  return useQuery<NamedAPIResourceList, Error>({
    queryKey: ["pokemon-list", normalizedSearch, typeKey, generation ?? "all"],
    queryFn: async () => {
      // A single selected type needs every type list to exclude dual types.
      const typesToFetch = selectedTypes.length === 1 ? allTypeNames : selectedTypes;
      const [pokemonList, typeResults, generationData] = await Promise.all([
        pokedex.getPokemonFormsList({
          offset: 0,
          limit: ALL_POKEMON_LIMIT,
        }),
        Promise.all(typesToFetch.map((name) => pokedex.getTypeByName(name))),
        generation
          ? pokedex.getGenerationByName(generationLookup[generation])
          : Promise.resolve(undefined),
      ]);

      const typeCounts = new Map<string, number>();
      const typeMembers = new Map<string, Set<string>>();
      typeResults.forEach((typeData, index) => {
        const members = new Set(typeData.pokemon.map(({ pokemon }) => pokemon.name));
        typeMembers.set(typesToFetch[index], members);
        members.forEach((name) => typeCounts.set(name, (typeCounts.get(name) ?? 0) + 1));
      });

      const matchesTypes = (name: string) => {
        if (selectedTypes.length === 0) {
          return true;
        }
        if (selectedTypes.length === 1) {
          return Boolean(typeMembers.get(selectedTypes[0])?.has(name)) && typeCounts.get(name) === 1;
        }
        return selectedTypes.every((t) => typeMembers.get(t)?.has(name));
      };
      const generationSpecies = new Set(
        generationData?.pokemon_species.map(({ name }) => name) ?? []
      );

      const results = pokemonList.results.filter((pokemon) => {
        if (normalizedSearch && !pokemon.name.includes(normalizedSearch)) {
          return false;
        }

        if (!matchesTypes(pokemon.name)) {
          return false;
        }

        if (generation && !matchesGeneration(pokemon.name, generationSpecies)) {
          return false;
        }

        return true;
      });

      return {
        count: results.length,
        next: null,
        previous: null,
        results,
      };
    },
    staleTime: 24 * 60 * 60 * 1000,
  });
};

export default usePokemonList;
