import { useQuery } from "@tanstack/react-query";
import ApiClient from "../services/apiClient";
import { Pokemon } from "../types";

const apiClient = new ApiClient<Pokemon>("/pokemon");

interface Props {
  name: string;
}

const usePokemon = ({ name }: Props) => {
  return useQuery<Pokemon, Error>({
    queryKey: ["pokemon", name],
    queryFn: () => apiClient.get(name),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

export default usePokemon;
