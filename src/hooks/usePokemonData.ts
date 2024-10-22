import { useEffect, useState } from "react";
import ApiClient from "../services/apiClient";
import { PokemonData } from "../types";

const apiClient = new ApiClient<PokemonData>("/pokemon");

interface Props {
  name: string;
}

const usePokemonData = ({ name }: Props) => {
  const [data, setData] = useState<PokemonData>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    apiClient
      .get(name)
      .then((pokemon) => {
        setData(pokemon);
      })
      .catch((error) => {
        setError(error as Error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [name]);

  return { data, isLoading, error };
};

export default usePokemonData;
