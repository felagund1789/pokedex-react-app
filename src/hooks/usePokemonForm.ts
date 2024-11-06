import { useQuery } from "@tanstack/react-query";
import { PokemonForm } from "pokeapi-js-wrapper";
import pokedex from "../services/pokedexService";

interface Props {
  slug: string;
}

const usePokemonForm = ({ slug }: Props) => {
  return useQuery<PokemonForm, Error>({
    queryKey: ["pokemon-forms", slug],
    queryFn: () => pokedex.getPokemonFormByName(slug),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

export default usePokemonForm;
