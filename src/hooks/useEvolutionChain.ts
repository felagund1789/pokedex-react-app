import { useQuery } from "@tanstack/react-query";
import type { EvolutionChainData } from "../components/evolutionChain/evolutionModel";
import pokedex from "../services/pokedexService";
import usePokemonSpecies from "./usePokemonSpecies";

interface Props {
  slug: string;
}

const useEvolutionChain = ({ slug }: Props) => {
  const species = usePokemonSpecies({ slug });

  const chain = useQuery<EvolutionChainData, Error>({
    queryKey: ["evolution-chain", species.data?.evolution_chain.url],
    queryFn: () => pokedex.resource(species.data!.evolution_chain.url),
    enabled: Boolean(species.data?.evolution_chain?.url),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
  return {
    data: chain.data,
    error: species.error ?? chain.error ?? (species.data && !species.data.evolution_chain?.url
      ? new Error(`Evolution chain is unavailable for ${slug}.`)
      : null),
    isLoading: species.isLoading || (Boolean(species.data) && chain.isLoading),
  };
};

export default useEvolutionChain;
