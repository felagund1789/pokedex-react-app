import { useInfiniteQuery } from "react-query";
import ApiClient, { FetchResponse } from "../services/apiClient";
import { Pokemon } from "../types";

const apiClient = new ApiClient<Pokemon>("/pokemon");

const usePokemon = () => {
  return useInfiniteQuery<FetchResponse<Pokemon>, Error>({
    queryKey: ["pokemon"],
    queryFn: ({ pageParam = 1 }) => {
      return apiClient.getAll({ params: { offset: (pageParam - 1) * 20 } });
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.next ? allPages.length + 1 : undefined,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

export default usePokemon;
