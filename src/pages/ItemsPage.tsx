import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../components/header/PageHeader";
import ItemCard from "../components/itemCard/ItemCard";
import Loading from "../components/loading/Loading";
import SearchField from "../components/searchInput/SearchField";
import "../components/searchInput/SearchInput.css";
import { itemCategoryQuery, itemPocketQuery, localizedItemResourceName } from "../hooks/itemCategoryQuery";
import pokedex from "../services/pokedexService";
import usePokemonStore from "../store";
import "./MovesPage.css";

const PAGE_SIZE = 20;
const staleTime = 24 * 60 * 60 * 1000;
const ItemsPage = () => {
  const [params, setParams] = useSearchParams();
  const queryClient = useQueryClient();
  const language = usePokemonStore((state) => state.language);
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
  const categoryDetails = useQueries({
    queries: (categories.data?.results ?? []).map(({ name }) => itemCategoryQuery(name)),
  });
  const pocketDetails = useQueries({
    queries: (pockets.data?.results ?? []).map(({ name }) => itemPocketQuery(name)),
  });
  const categoryOptions = categoryDetails.flatMap(({ data }) => data ? [{
    name: data.name,
    label: localizedItemResourceName(data, language),
  }] : []).sort((a, b) => a.label.localeCompare(b.label, language));
  const pocketOptions = pocketDetails.flatMap(({ data }) => data ? [{
    id: data.id,
    name: data.name,
    label: localizedItemResourceName(data, language),
  }] : []).sort((a, b) => a.id - b.id);
  const category = categories.data?.results.find(({ name }) => name === params.get("category"))?.name;
  const pocket = pockets.data?.results.find(({ name }) => name === params.get("pocket"))?.name;
  const items = useQuery({
    queryKey: ["item-list", category ?? "all", pocket ?? "all"],
    enabled: !!categories.data && !!pockets.data,
    queryFn: async () => {
      const [list, pocketData] = await Promise.all([
        pokedex.getItemsList({ offset: 0, limit: 10000 }),
        pocket ? queryClient.query(itemPocketQuery(pocket)) : Promise.resolve(undefined),
      ]);
      const categoryNames = pocketData?.categories.map(({ name }) => name);
      if (category && categoryNames && !categoryNames.includes(category)) return [];
      const names = category ? [category] : categoryNames;
      if (!names) return list.results;
      const categoryData = await Promise.all(names.map((name) => queryClient.query(itemCategoryQuery(name))));
      const matchingItems = new Set(categoryData.flatMap((data) => data.items.map(({ name }) => name)));
      return list.results.filter(({ name }) => matchingItems.has(name));
    },
    staleTime,
  });
  const search = searchText.trim().toLowerCase().replace(/\s+/g, "-");
  const filteredItems = (items.data ?? []).filter(({ name }) => name.includes(search));
  const visibleItems = filteredItems.slice(0, visibleCount);
  const error = categories.error || pockets.error || categoryDetails.find((query) => query.error)?.error ||
    pocketDetails.find((query) => query.error)?.error || items.error;
  const detailsLoading = categoryDetails.some((query) => query.isLoading) || pocketDetails.some((query) => query.isLoading);

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
      <Loading isLoading={categories.isLoading || pockets.isLoading || detailsLoading || items.isFetching} />
      <main className="types-page moves-page">
        <h1>Items</h1>
        <div className="search-container moves-search">
          <SearchField searchText={searchText} onSearch={(value) => updateFilter("search", value, true)} subject="items" />
          <div className="filter-row">
            <select aria-label="Category" className="filter-select" value={category ?? ""} onChange={(event) => updateFilter("category", event.currentTarget.value)}>
              <option value="">All categories</option>
              {categoryOptions.map(({ name, label }) => <option key={name} value={name}>{label}</option>)}
            </select>
            <select aria-label="Pocket" className="filter-select" value={pocket ?? ""} onChange={(event) => updateFilter("pocket", event.currentTarget.value)}>
              <option value="">All pockets</option>
              {pocketOptions.map(({ name, label }) => <option key={name} value={name}>{label}</option>)}
            </select>
          </div>
        </div>
        {error && <p>Error loading items: {error.message}</p>}
        {!categories.isLoading && !pockets.isLoading && !detailsLoading && !items.isLoading && !error && filteredItems.length === 0 && <p>No items match the current filters.</p>}
        <InfiniteScroll
          className="moves-grid"
          hasMore={visibleItems.length < filteredItems.length}
          dataLength={visibleItems.length}
          next={() => setVisibleCount((count) => count + PAGE_SIZE)}
          loader={<div>Loading more items...</div>}
        >
          {visibleItems.map((item) => <ItemCard key={item.name} slug={item.name} />)}
        </InfiniteScroll>
      </main>
    </>
  );
};

export default ItemsPage;
