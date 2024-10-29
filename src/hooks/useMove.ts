import { useQuery } from "@tanstack/react-query";
import ApiClient from "../services/apiClient";
import { Move } from "../types";

const apiClient = new ApiClient<Move>("/move");

interface Props {
  slug: string;
}

const useMove = ({ slug }: Props) => {
  return useQuery<Move, Error>({
    queryKey: ["pokemon-move", slug],
    queryFn: () => apiClient.get(slug),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

export default useMove;
