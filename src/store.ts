import { create } from "zustand";
import types from "./assets/types";

export type Generation = "I" | "II" | "III" | "IV" | "V" | "VI" | "VII" | "VIII" | "IX";
export type PokemonTypeName = keyof typeof types;
export const generations: Generation[] = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];

type Language = "ja-Hrkt" | "ko" | "fr" | "de" | "es" | "it" | "en" | "zh-Hans" | "zh-Hant";

export type PokemonInfo = {
  pokedexNumber: number;
  pokemonFormName: string;
  pokemonName: string;
  generation: string;
  types: string[];
  artworkUrl: string;
};

type State = {
  language: Language;
  pokemonMap: Map<string, PokemonInfo>;
};

type Actions = {
  setLanguage: (language: State["language"]) => void;
  addPokemonInfo: (slug: string, pokemonInfo: PokemonInfo) => void;
  getPokemonInfo: (slug: string) => PokemonInfo | undefined;
};

const usePokemonStore = create<State & Actions>((set) => ({
  language: "en",
  setLanguage: (language) => set({ language }),
  pokemonMap: new Map(),
  addPokemonInfo: (slug, pokemonInfo) =>
    set((state) => {
      const pokemonMap = new Map(state.pokemonMap);
      pokemonMap.set(slug, pokemonInfo);
      return { pokemonMap };
    }),
  getPokemonInfo: (slug): PokemonInfo | undefined => usePokemonStore.getState().pokemonMap.get(slug),
}));

export default usePokemonStore;
