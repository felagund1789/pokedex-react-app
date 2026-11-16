import { useQuery } from "@tanstack/react-query";
import { EvolutionChain } from "pokeapi-js-wrapper";
import pokedex from "../services/pokedexService";
import usePokemonInfo from "./usePokemonInfo";

interface Props {
  slug: string;
}

const useEvolutionChain = ({ slug }: Props) => {
  const { pokemonSpecies } = usePokemonInfo(slug); 

  return useQuery<EvolutionChain, Error>({
    queryKey: ["evolution-chain", pokemonSpecies?.evolution_chain.url],
    queryFn: () =>
      pokemonSpecies && pokemonSpecies.evolution_chain
        ? pokedex.resource(pokemonSpecies.evolution_chain.url)
        : Promise.resolve(null),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

export default useEvolutionChain;
