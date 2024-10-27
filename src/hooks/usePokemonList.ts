import { useInfiniteQuery } from "@tanstack/react-query";
import ApiClient, { FetchResponse } from "../services/apiClient";
import { APIResource } from "../types";

const apiClient = new ApiClient<APIResource>("/pokemon");

const usePokemonList = () => {
  return useInfiniteQuery<FetchResponse<APIResource>, Error>({
    queryKey: ["pokemon"],
    queryFn: ({ pageParam }) => {
      return apiClient.getAll({
        params: { offset: (Number(pageParam) - 1) * 20 },
      });
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.next ? allPages.length + 1 : undefined,
    initialPageParam: 1,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

export default usePokemonList;
