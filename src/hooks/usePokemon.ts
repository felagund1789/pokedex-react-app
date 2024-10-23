import { useQuery } from "react-query";
import ApiClient, { FetchResponse } from "../services/apiClient";
import { Pokemon } from "../types";

const apiClient = new ApiClient<Pokemon>("/pokemon");

const usePokemon = () => {
  return useQuery<FetchResponse<Pokemon>, Error>({
    queryKey: ["pokemon"],
    queryFn: () => apiClient.getAll(),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

export default usePokemon;
