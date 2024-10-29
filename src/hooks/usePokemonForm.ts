import { useQuery } from "@tanstack/react-query";
import { PokemonForm } from "../types";
import usePokemon from "./usePokemon";

interface Props {
  slug: string;
}

const usePokemonForm = ({ slug }: Props) => {
  const { data: pokemon } = usePokemon({ slug });

  const form =
    pokemon?.forms && pokemon.forms.length > 0 ? pokemon.forms[0] : null;

  return useQuery<PokemonForm, Error>({
    queryKey: ["pokemon-forms", form?.name],
    queryFn: () => fetch(form?.url ?? "").then((res) => res.json()),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

export default usePokemonForm;
