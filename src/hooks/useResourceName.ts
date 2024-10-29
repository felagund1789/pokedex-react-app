import { useQuery } from "@tanstack/react-query";
import { APIResource } from "../types";

const useResourceName = (resource?: APIResource) => {
  const language = "en";

  return useQuery<string, Error>({
    queryKey: [resource?.url, language],
    queryFn: () =>
      fetch(resource?.url ?? "")
        .then((res) => res.json())
        .then((data) =>
          data.names.find(
            (name: { name: string; language: APIResource }) =>
              name.language.name === language
          ).name
        ),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

export default useResourceName;
