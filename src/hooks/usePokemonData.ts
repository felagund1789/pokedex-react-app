import { useQuery } from "react-query";
import ApiClient from "../services/apiClient";
import { PokemonData } from "../types";

const apiClient = new ApiClient<PokemonData>("/pokemon");

interface Props {
  name: string;
}

const usePokemonData = ({ name }: Props) => {
  return useQuery<PokemonData, Error>({
    queryKey: ["pokemon", name],
    queryFn: () => apiClient.get(name),
  });
};

export default usePokemonData;
