import { useQuery } from "@tanstack/react-query";
import { Pokemon } from "pokeapi-js-wrapper";
import pokedex from "../services/pokedexService";

interface Props {
  slug: string;
}

const usePokemon = ({ slug }: Props) => {
  return useQuery<Pokemon, Error>({
    queryKey: ["pokemon", slug],
    queryFn: () => pokedex.getPokemonByName(slug),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

export default usePokemon;
