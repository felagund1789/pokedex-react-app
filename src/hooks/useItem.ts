import { useQuery } from "@tanstack/react-query";
import pokedex from "../services/pokedexService";
import { Item } from "pokeapi-js-wrapper";

interface Props {
  slug: string;
}

const useItem = ({ slug }: Props) => {
  return useQuery<Item | null, Error>({
    queryKey: ["items", slug],
    queryFn: () => slug && pokedex.getItemByName(slug) || Promise.resolve(null),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

export default useItem;
