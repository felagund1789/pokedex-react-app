import { queryOptions } from "@tanstack/react-query";
import pokedex from "../services/pokedexService";

export const itemCategoryQuery = (name: string) => queryOptions({
  queryKey: ["item-category", name],
  queryFn: () => pokedex.getItemCategoryByName(name),
  staleTime: 24 * 60 * 60 * 1000,
});
