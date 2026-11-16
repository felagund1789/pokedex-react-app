import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Pokemon, PokemonSpecies } from "pokeapi-js-wrapper";
import { useMemo } from "react";
import pokedex from "../services/pokedexService";
import usePokemonStore, { type PokemonInfo } from "../store";

const usePokemonInfo = (slug: string) => {
  const queryClient = useQueryClient();
  const language = usePokemonStore((state) => state.language);
  const cachedInfo = usePokemonStore((state) => state.pokemonMap.get(slug));

  const { data, isPending, error } = useQuery<PokemonInfo, Error>({
    queryKey: ["pokemon-info", slug],
    initialData: cachedInfo,
    staleTime: Infinity,
    enabled: !!slug,
    queryFn: async () => {
      const cached = usePokemonStore.getState().getPokemonInfo(slug);
      if (cached) return cached;

      const pokemonForm = await pokedex.getPokemonFormByName(slug);
      const pokemon = await queryClient.query<Pokemon>({
        queryKey: ["pokemon-resource", pokemonForm.pokemon.url],
        queryFn: () => pokedex.resource(pokemonForm.pokemon.url),
        staleTime: Infinity,
        retry: false,
      });
      const pokemonSpecies = await queryClient.query<PokemonSpecies>({
        queryKey: ["pokemon-species-resource", pokemon.species.url],
        queryFn: () => pokedex.resource(pokemon.species.url),
        staleTime: Infinity,
        retry: false,
      });
      const info = { pokemonForm, pokemon, pokemonSpecies };
      usePokemonStore.getState().addPokemonInfo(slug, info);
      return info;
    },
  });

  const pokemonForm = data?.pokemonForm;
  const pokemon = data?.pokemon;
  const pokemonSpecies = data?.pokemonSpecies;
  const types = useMemo(
    () => pokemonForm?.types.map((type) => type.type.name) ?? [],
    [pokemonForm],
  );

  return {
    pokemonForm,
    pokemon,
    pokemonSpecies,
    pokedexNumber: pokemonSpecies?.pokedex_numbers.find((n) => n.pokedex.name === "national")?.entry_number,
    pokemonName: pokemonSpecies?.names.find((n) => n.language.name === language)?.name,
    pokemonFormName: pokemonForm?.names.find((n) => n.language.name === language)?.name,
    pokemonGenera: pokemonSpecies?.genera.find((g) => g.language.name === language)?.genus,
    habitat: pokemonSpecies?.habitat?.name ?? "",
    generation: pokemonSpecies?.generation.name.replace("generation-", "").toUpperCase(),
    types,
    artworkURL: pokemonForm?.sprites.other["official-artwork"].front_default ||
      pokemon?.sprites.other["official-artwork"].front_default,
    loading: isPending,
    error,
  };
};

export default usePokemonInfo;
