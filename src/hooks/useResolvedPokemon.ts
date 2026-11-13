import { useQuery } from "@tanstack/react-query";
import { resolvePokemon } from "../services/pokemonResolver";

const useResolvedPokemon = (slug: string, selectedForm: string | null = null) =>
  useQuery({
    queryKey: ["resolved-pokemon", slug, selectedForm],
    queryFn: () => resolvePokemon(slug, selectedForm),
    enabled: Boolean(slug),
    staleTime: 24 * 60 * 60 * 1000,
  });

export default useResolvedPokemon;
