import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../components/header/PageHeader";
import ItemCard from "../components/itemCard/ItemCard";
import Loading from "../components/loading/Loading";
import SearchField from "../components/searchInput/SearchField";
import "../components/searchInput/SearchInput.css";
import { itemCategoryQuery } from "../hooks/itemCategoryQuery";
import pokedex from "../services/pokedexService";
import "./TypesPage.css";
import "./MovesPage.css";

const PAGE_SIZE = 20;
const staleTime = 24 * 60 * 60 * 1000;
const label = (name: string) => name.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const ItemsPage = () => {
  const [params, setParams] = useSearchParams();
  const queryClient = useQueryClient();
  const searchText = params.get("search") ?? "";
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const categories = useQuery({
    queryKey: ["item-categories"],
    queryFn: () => pokedex.getItemCategoriesList({ offset: 0, limit: 10000 }),
    staleTime,
  });
  const pockets = useQuery({
    queryKey: ["item-pockets"],
    queryFn: () => pokedex.getItemPocketsList({ offset: 0, limit: 10000 }),
    staleTime,
  });
  const category = categories.data?.results.find(({ name }) => name === params.get("category"))?.name;
  const pocket = pockets.data?.results.find(({ name }) => name === params.get("pocket"))?.name;
  const items = useQuery({
    queryKey: ["item-list", category ?? "all", pocket ?? "all"],
    enabled: !!categories.data && !!pockets.data,
    queryFn: async () => {
      const [list, pocketData] = await Promise.all([
        pokedex.getItemsList({ offset: 0, limit: 10000 }),
        pocket ? pokedex.getItemPocketByName(pocket) : Promise.resolve(undefined),
      ]);
      const categoryNames = pocketData?.categories.map(({ name }) => name);
      if (category && categoryNames && !categoryNames.includes(category)) return [];
      const names = category ? [category] : categoryNames;
      if (!names) return list.results;
      const categoryData = await Promise.all(names.map((name) => queryClient.fetchQuery(itemCategoryQuery(name))));
      const matchingItems = new Set(categoryData.flatMap((data) => data.items.map(({ name }) => name)));
      return list.results.filter(({ name }) => matchingItems.has(name));
    },
    staleTime,
  });
  const search = searchText.trim().toLowerCase().replace(/\s+/g, "-");
  const filteredItems = (items.data ?? []).filter(({ name }) => name.includes(search));
  const visibleItems = filteredItems.slice(0, visibleCount);
  const error = categories.error || pockets.error || items.error;

  useEffect(() => {
    document.title = "Pokédex | Items";
  }, []);

  const updateFilter = (key: string, value: string, replace = false) => {
    const next = new URLSearchParams(params);
    if (key === "search") value = value.trim();
    if (value) next.set(key, value);
    else next.delete(key);
    setVisibleCount(PAGE_SIZE);
    setParams(next, { replace });
  };

  return (
    <>
      <PageHeader />
      <Loading isLoading={categories.isLoading || pockets.isLoading || items.isFetching} />
      <main className="types-page moves-page">
        <h1>Items</h1>
        <div className="search-container moves-search">
          <SearchField searchText={searchText} onSearch={(value) => updateFilter("search", value, true)} subject="items" />
          <div className="filter-row">
            <select aria-label="Category" className="filter-select" value={category ?? ""} onChange={(event) => updateFilter("category", event.currentTarget.value)}>
              <option value="">All categories</option>
              {categories.data?.results.map(({ name }) => <option key={name} value={name}>{label(name)}</option>)}
            </select>
            <select aria-label="Pocket" className="filter-select" value={pocket ?? ""} onChange={(event) => updateFilter("pocket", event.currentTarget.value)}>
              <option value="">All pockets</option>
              {pockets.data?.results.map(({ name }) => <option key={name} value={name}>{label(name)}</option>)}
            </select>
          </div>
        </div>
        {error && <p>Error loading items: {error.message}</p>}
        {!categories.isLoading && !pockets.isLoading && !items.isLoading && !error && filteredItems.length === 0 && <p>No items match the current filters.</p>}
        <div className="moves-grid">
          {visibleItems.map((item) => <ItemCard key={item.name} slug={item.name} />)}
        </div>
        {visibleItems.length < filteredItems.length && (
          <button className="moves-page__more" type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
            Load more
          </button>
        )}
      </main>
    </>
  );
};

export default ItemsPage;
