import { useQuery } from "@tanstack/react-query";
import { NamedAPIResource } from "pokeapi-js-wrapper";
import pokedex from "../services/pokedexService";
import usePokemonStore from "../store";

const useResourceName = (resource?: NamedAPIResource | null) => {
  const language = usePokemonStore((state) => state.language);
  const capitalize = (name: string) =>
    name
      .split("-")
      .map((w: string) => `${w.charAt(0).toUpperCase()}${w.substring(1)}`)
      .join(" ");

  return useQuery<string, Error>({
    queryKey: [resource?.url, language],
    queryFn: () =>
      resource
        ? pokedex
            .resource(resource.url)
            .then((data) =>
              data.names && data.names.length > 0
                ? data.names.find(
                    (name: { name: string; language: NamedAPIResource }) =>
                      name.language.name === language
                  ).name
                : capitalize(data.name)
            )
        : "",
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

export default useResourceName;
