import { useQuery } from "react-query";
import ApiClient, { FetchResponse } from "../services/apiClient";
import { Pokemon } from "../types";

const apiClient = new ApiClient<Pokemon>("/pokemon");

const usePokemon = () => {
  return useQuery<FetchResponse<Pokemon>, Error>({
    queryKey: ["pokemon"],
    queryFn: () => apiClient.getAll(),
  });
};

export default usePokemon;
