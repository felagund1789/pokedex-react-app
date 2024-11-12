import { useQuery } from "@tanstack/react-query";
import { Move } from "pokeapi-js-wrapper";
import pokedex from "../services/pokedexService";

interface Props {
  slug: string;
}

const useMove = ({ slug }: Props) => {
  return useQuery<Move, Error>({
    queryKey: ["pokemon-move", slug],
    queryFn: () => pokedex.getMoveByName(slug),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

export default useMove;
