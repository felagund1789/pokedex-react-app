import { useQuery } from "@tanstack/react-query";
import { EvolutionChain } from "../types";
import usePokemonSpecies from "./usePokemonSpecies";

interface Props {
  slug: string;
}

const useEvolutionChain = ({ slug }: Props) => {
  const { data } = usePokemonSpecies({ slug });

  return useQuery<EvolutionChain, Error>({
    queryKey: ["evolution-chain", data?.evolution_chain.url],
    queryFn: () => fetch(data?.evolution_chain.url ?? "").then((res) => res.json()),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

export default useEvolutionChain;
