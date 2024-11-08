import { useQuery } from "@tanstack/react-query";
import { PokemonSpecies } from "pokeapi-js-wrapper";
import pokedex from "../services/pokedexService";

interface Props {
  slug: string;
}

const usePokemonSpecies = ({ slug }: Props) => {
  return useQuery<PokemonSpecies, Error>({
    queryKey: ["pokemon-species", slug],
    queryFn: () =>
      pokedex.getPokemonByName(slug).then((data) => {
        return pokedex.resource(data.species.url);
      }),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

export default usePokemonSpecies;
