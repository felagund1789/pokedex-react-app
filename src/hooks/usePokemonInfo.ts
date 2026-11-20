import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Generation, Pokemon, PokemonHabitat, PokemonSpecies } from "pokeapi-js-wrapper";
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
        queryKey: ["pokemon", pokemonForm.pokemon.name],
        queryFn: () => pokedex.getPokemonByName(pokemonForm.pokemon.name),
        staleTime: Infinity,
        retry: false,
      });
      const pokemonSpecies = await queryClient.query<PokemonSpecies>({
        queryKey: ["pokemon-species", pokemon.species.name],
        queryFn: () => pokedex.getPokemonSpeciesByName(pokemon.species.name),
        staleTime: Infinity,
        retry: false,
      });
      const habitat = await queryClient.query<PokemonHabitat>({
        queryKey: ["pokemon-habitat", pokemonSpecies.habitat?.name],
        queryFn: () => pokedex.getPokemonHabitatByName(pokemonSpecies.habitat?.name || ""),
        staleTime: Infinity,
        retry: false,
      });
      const generation = await queryClient.query<Generation>({
        queryKey: ["generation", pokemonSpecies.generation?.name],
        queryFn: () => pokedex.getGenerationByName(pokemonSpecies.generation?.name || ""),
        staleTime: Infinity,
        retry: false,
      });
      const habitatName = habitat?.names.find((n) => n.language.name === language)?.name;
      const generationName = generation?.names.find((n) => n.language.name === language)?.name;
      const info = { pokemonForm, pokemon, pokemonSpecies, habitat: habitatName, generation: generationName };
      usePokemonStore.getState().addPokemonInfo(slug, info);
      return info;
    },
  });

  const pokemonForm = data?.pokemonForm;
  const pokemon = data?.pokemon;
  const pokemonSpecies = data?.pokemonSpecies;
  const habitat = data?.habitat;
  const generation = data?.generation;
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
    habitat: habitat,
    generation: generation,
    types,
    artworkURL: pokemonForm?.sprites.other["official-artwork"].front_default ||
      pokemon?.sprites.other["official-artwork"].front_default,
    loading: isPending,
    error,
  };
};

export default usePokemonInfo;
