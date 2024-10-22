import { useEffect, useState } from "react";
import ApiClient from "../services/apiClient";
import { Pokemon } from "../types";

const apiClient = new ApiClient<Pokemon>("/pokemon");

const usePokemon = () => {
  const [data, setData] = useState<Pokemon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    apiClient
      .getAll()
      .then((response) => {
        setData(response.results);
      })
      .catch((error) => {
        setError(error as Error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return { data, isLoading, error };
};

export default usePokemon;
