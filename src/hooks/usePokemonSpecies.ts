import { useQuery } from "@tanstack/react-query";
import { PokemonSpecies } from "../types";
import usePokemon from "./usePokemon";

interface Props {
  slug: string;
}

const usePokemonSpecies = ({ slug }: Props) => {
  const { data: pokemon } = usePokemon({ slug });

  return useQuery<PokemonSpecies, Error>({
    queryKey: ["pokemon-species", pokemon?.species.name],
    queryFn: () => fetch(pokemon?.species.url ?? "").then((res) => res.json()),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

export default usePokemonSpecies;
