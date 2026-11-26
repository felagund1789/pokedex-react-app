import { EggGroup } from "pokeapi-js-wrapper";
import pokedex from "../services/pokedexService";

export const eggGroupQuery = (name: string) => ({
  queryKey: ["egg-group", name],
  queryFn: () => pokedex.getEggGroupByName(name),
  staleTime: 24 * 60 * 60 * 1000,
});

export const eggGroupName = (group: EggGroup, language: string) =>
  group.names.find((entry) => entry.language.name === language)?.name ??
  group.names.find((entry) => entry.language.name === "en")?.name ??
  group.name.replace(/-/g, " ");
