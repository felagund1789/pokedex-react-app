import { queryOptions } from "@tanstack/react-query";
import pokedex from "../services/pokedexService";

export const itemCategoryQuery = (name: string) => queryOptions({
  queryKey: ["item-category", name],
  queryFn: () => pokedex.getItemCategoryByName(name),
  staleTime: 24 * 60 * 60 * 1000,
});

export const itemPocketQuery = (name: string) => queryOptions({
  queryKey: ["item-pocket", name],
  queryFn: () => pokedex.getItemPocketByName(name),
  staleTime: 24 * 60 * 60 * 1000,
});

export const localizedItemResourceName = (
  resource: { name: string; names: { name: string; language: { name: string } }[] },
  language: string,
) => resource.names.find((entry) => entry.language.name === language)?.name ??
  resource.names.find((entry) => entry.language.name === "en")?.name ??
  resource.name.replace(/-/g, " ");
