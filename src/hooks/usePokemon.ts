import { useQuery } from "@tanstack/react-query";
import ApiClient from "../services/apiClient";
import { Pokemon } from "../types";

const apiClient = new ApiClient<Pokemon>("/pokemon");

interface Props {
  slug: string;
}

const usePokemon = ({ slug }: Props) => {
  return useQuery<Pokemon, Error>({
    queryKey: ["pokemon", slug],
    queryFn: () => apiClient.get(slug),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

export default usePokemon;
