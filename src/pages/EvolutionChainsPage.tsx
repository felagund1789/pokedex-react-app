import { useInfiniteQuery, useQueries } from "@tanstack/react-query";
import type { EvolutionChain, NamedAPIResource } from "pokeapi-js-wrapper";
import { useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import EvolutionCard from "../components/evolution/EvolutionCard";
import PageHeader from "../components/header/PageHeader";
import Loading from "../components/loading/Loading";
import pokedex from "../services/pokedexService";
import "./EvolutionChainsPage.css";

const PAGE_SIZE = 20;
const staleTime = 24 * 60 * 60 * 1000;

interface EvolutionNode {
  species: NamedAPIResource;
  evolution_details: object[];
  evolves_to: EvolutionNode[];
}

const isNamedAPIResource = (value: unknown): value is NamedAPIResource =>
  typeof value === "object" &&
  value !== null &&
  "name" in value &&
  typeof value.name === "string" &&
  "url" in value &&
  typeof value.url === "string";

const getForm = (detail: object, field: string) => {
  const value = Object.getOwnPropertyDescriptor(detail, field)?.value;
  return isNamedAPIResource(value) ? value : undefined;
};

const getApplicableDetails = (details: object[], form: string) => {
  const matching = details.filter((detail) => {
    const requiredForm = getForm(detail, "required_pokemon_form")?.name;
    return (!requiredForm || requiredForm === form) &&
      (requiredForm === form || getForm(detail, "evolved_pokemon_form"));
  });
  const defaults = details.filter((detail) =>
    !getForm(detail, "required_pokemon_form") && !getForm(detail, "evolved_pokemon_form"),
  );
  const hasSourceMatch = matching.some((detail) =>
    getForm(detail, "required_pokemon_form")?.name === form,
  );
  return matching.length ? [...matching, ...(!hasSourceMatch ? defaults : [])] : defaults;
};

const getAlternateForms = (root: EvolutionNode) => {
  const rootForms = new Set(
    root.evolves_to.flatMap((evolution) => evolution.evolution_details.flatMap((detail) => {
      const form = getForm(detail, "required_pokemon_form")?.name;
      return form && form !== root.species.name ? [form] : [];
    })),
  );

  return Array.from(rootForms, (rootForm) => {
    const forms: Record<string, string> = { [root.species.name]: rootForm };

    const visit = (node: EvolutionNode, currentForms: Record<string, string>) => {
      const currentForm = currentForms[node.species.name] ?? node.species.name;
      for (const evolution of node.evolves_to) {
        const details = getApplicableDetails(evolution.evolution_details, currentForm);
        const destinations = new Set(
          details.map((detail) => getForm(detail, "evolved_pokemon_form")?.name),
        );
        if (destinations.size === 0) destinations.add(undefined);

        for (const destination of destinations) {
          const branchForms = { ...currentForms };
          if (destination) branchForms[evolution.species.name] = destination;
          else delete branchForms[evolution.species.name];
          visit(evolution, branchForms);
          Object.assign(currentForms, branchForms);
        }
      }
    };

    visit(root, forms);
    return [rootForm, forms] as const;
  });
};

const EvolutionChainsPage = () => {
  const chains = useInfiniteQuery({
    queryKey: ["evolution-chain-list"],
    queryFn: ({ pageParam }) => pokedex.getEvolutionChainsList({ offset: pageParam, limit: PAGE_SIZE }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) =>
      lastPage.next ? pages.reduce((offset, page) => offset + page.results.length, 0) : undefined,
    staleTime,
  });
  const resources = chains.data?.pages.flatMap(({ results }) => results) ?? [];
  const details = useQueries({
    queries: resources.map(({ url }) => ({
      queryKey: ["evolution-chain", url],
      queryFn: async (): Promise<EvolutionChain> => pokedex.resource(url),
      staleTime,
    })),
  });
  const loadingDetails = details.some(({ isLoading }) => isLoading);
  const detailError = details.find(({ error }) => error)?.error;

  useEffect(() => {
    document.title = "Pokédex | Evolution Chains";
  }, []);

  return (
    <>
      <PageHeader />
      <Loading isLoading={chains.isLoading || loadingDetails || chains.isFetchingNextPage} />
      <main className="evolution-chains-page">
        <h1>Evolution Chains</h1>
        {chains.error && <p role="alert">Error loading evolution chains: {chains.error.message}</p>}
        {detailError && <p role="alert">Error loading an evolution chain: {detailError.message}</p>}
        {!chains.isLoading && !chains.error && resources.length === 0 && <p>No evolution chains found.</p>}
        <InfiniteScroll
          className="evolution-chains-list"
          dataLength={resources.length}
          hasMore={Boolean(chains.hasNextPage)}
          next={() => {
            if (!chains.isFetchingNextPage) void chains.fetchNextPage();
          }}
          loader={<p>Loading more evolution chains...</p>}
        >
          {details.map(({ data }, index) => {
            if (!data) return null;
            const alternateForms = getAlternateForms(data.chain);
            return (
              <section key={resources[index].url} className="evolution-chains-list__group">
                <EvolutionCard
                  species={data.chain.species}
                  evolvesTo={data.chain.evolves_to}
                  forms={{}}
                />
                {alternateForms.map(([key, forms]) => (
                  <EvolutionCard
                    key={key}
                    species={data.chain.species}
                    evolvesTo={data.chain.evolves_to}
                    form={forms[data.chain.species.name]}
                    forms={forms}
                  />
                ))}
              </section>
            );
          })}
        </InfiniteScroll>
      </main>
    </>
  );
};

export default EvolutionChainsPage;