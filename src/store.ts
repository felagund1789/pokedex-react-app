import { create } from "zustand";
import types from "./assets/types";

type Generation = "I" | "II" | "III" | "IV" | "V" | "VI" | "VII" | "VIII";
type Language = "ja-Hrkt" | "ko" | "fr" | "de" | "es" | "it" | "en" | "zh-Hans" | "zh-Hant";

export type PokemonInfo = {
  pokedexNumber: number;
  pokemonFormName: string;
  pokemonName: string;
  types: string[];
  artworkUrl: string;
};

type SearchQuery = {
  searchText?: string;
  type?: keyof typeof types;
  generation?: Generation;
};

type State = {
  query: SearchQuery;
  language: Language;
  pokemonMap: Map<string, PokemonInfo>;
};

type Actions = {
  setSearchText: (text: SearchQuery["searchText"]) => void;
  setType: (type: SearchQuery["type"]) => void;
  setGeneration: (generation: SearchQuery["generation"]) => void;
  setLanguage: (language: State["language"]) => void;
  addPokemonInfo: (slug: string, pokemonInfo: PokemonInfo) => void;
  getPokemonInfo: (slug: string) => PokemonInfo | undefined;
};

const usePokemonStore = create<State & Actions>((set) => ({
  query: {
    searchText: undefined,
    type: undefined,
    generation: undefined,
  },
  language: "en",
  setSearchText: (searchText) => set((state) => ({ query: { ...state.query, searchText } })),
  setType: (type) => set((state) => ({ query: { ...state.query, type } })),
  setGeneration: (generation) =>
    set((state) => ({ query: { ...state.query, generation } })),
  setLanguage: (language) => set({ language }),
  // pokemonInfo
  pokemonMap: new Map(),
  addPokemonInfo: (slug, pokemonInfo) => set((state) => ({ ...state, pokemonMap: new Map(state.pokemonMap.set(slug, pokemonInfo)) })),
  getPokemonInfo: (slug): PokemonInfo | undefined => usePokemonStore.getState().pokemonMap.get(slug),
}));

export default usePokemonStore;
