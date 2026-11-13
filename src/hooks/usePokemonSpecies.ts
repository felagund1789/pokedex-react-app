import { useQuery } from "@tanstack/react-query";
import { PokemonSpecies } from "pokeapi-js-wrapper";
import pokedex from "../services/pokedexService";
import useResolvedPokemon from "./useResolvedPokemon";

interface Props {
  slug: string;
}

const usePokemonSpecies = ({ slug }: Props) => {
  const pokemon = useResolvedPokemon(slug);
  const species = useQuery<PokemonSpecies, Error>({
    queryKey: ["pokemon-species", pokemon.data?.pokemon.species.url],
    queryFn: () => pokedex.resource(pokemon.data!.pokemon.species.url),
    enabled: Boolean(pokemon.data),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
  return {
    ...species,
    error: pokemon.error ?? species.error,
    isLoading: pokemon.isLoading || (Boolean(pokemon.data) && species.isLoading),
  };
};

export default usePokemonSpecies;
