import { useQuery } from "@tanstack/react-query";
import { EvolutionChain } from "../types";
import usePokemonSpecies from "./usePokemonSpecies";
import pokedex from "../services/pokedexService";

interface Props {
  slug: string;
}

const useEvolutionChain = ({ slug }: Props) => {
  const { data } = usePokemonSpecies({ slug });

  return useQuery<EvolutionChain, Error>({
    queryKey: ["evolution-chain", data?.evolution_chain.url],
    queryFn: () =>
      data && data.evolution_chain
        ? pokedex.resource(data.evolution_chain.url)
        : Promise.resolve(null),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

export default useEvolutionChain;
