import { useInfiniteQuery } from "@tanstack/react-query";
import ApiClient, { FetchResponse } from "../services/apiClient";
import { APIResource } from "../types";

const apiClient = new ApiClient<APIResource>("/pokemon");

const usePokemonList = (search: string) => {
  return useInfiniteQuery<FetchResponse<APIResource>, Error>({
    queryKey: ["pokemon-list", search],
    queryFn: ({ pageParam }) => {
      if (search) {
        return apiClient
          .getAll({
            params: { offset: 0, limit: 10000 },
          })
          .then((res) => {
            const results = res.results.filter((pokemon) =>
              pokemon.name.includes(search.trim())
            );
            return {
              count: results.length,
              next: null,
              previous: null,
              results,
            };
          });
      } else {
        return apiClient.getAll({
          params: { offset: (Number(pageParam) - 1) * 20 },
        });
      }
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.next ? allPages.length + 1 : undefined,
    initialPageParam: 1,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

export default usePokemonList;
