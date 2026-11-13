import { isAxiosError } from "axios";
import type { Pokemon, PokemonForm } from "pokeapi-js-wrapper";
import pokedex from "./pokedexService";

export interface ResolvedPokemon {
  pokemon: Pokemon;
  form: PokemonForm;
}

export async function resolvePokemonForm(pokemon: Pokemon, selectedForm: string | null): Promise<PokemonForm> {
  if (!pokemon.forms.length) throw new Error(`No forms are available for ${pokemon.name}.`);
  if (selectedForm) {
    const resource = pokemon.forms.find((entry) => entry.name === selectedForm);
    if (!resource) throw new Error(`Form ${selectedForm} is not available for ${pokemon.name}.`);
    return pokedex.resource(resource.url);
  }
  if (pokemon.forms.length === 1) return pokedex.resource(pokemon.forms[0].url);
  const forms: PokemonForm[] = await Promise.all(pokemon.forms.map((entry) => pokedex.resource(entry.url)));
  const defaultForm = forms.find((entry) => entry.is_default);
  if (!defaultForm) throw new Error(`No default form is available for ${pokemon.name}.`);
  return defaultForm;
}

export async function resolvePokemon(identifier: string, selectedForm: string | null = null): Promise<ResolvedPokemon> {
  let pokemon: Pokemon;
  try {
    pokemon = await pokedex.getPokemonByName(identifier);
  } catch (error) {
    if (!isAxiosError(error) || error.response?.status !== 404) throw error;
    const form: PokemonForm = await pokedex.getPokemonFormByName(identifier);
    pokemon = await pokedex.getPokemonByName(form.pokemon.name);
    if (selectedForm && selectedForm !== form.name) {
      throw new Error(`Form ${selectedForm} does not match ${identifier}.`);
    }
    if (!pokemon.forms.some((entry) => entry.name === form.name)) {
      throw new Error(`Form ${form.name} is not available for ${pokemon.name}.`);
    }
    return { pokemon, form };
  }
  const namedForm = pokemon.forms.find((entry) => entry.name === identifier);
  const form = await resolvePokemonForm(pokemon, selectedForm ?? namedForm?.name ?? null);
  return { pokemon, form };
}

export function formArtwork(form: PokemonForm, pokemon: Pokemon): string | undefined {
  const sprites = form.sprites as PokemonForm["sprites"] & {
    other?: { "official-artwork"?: { front_default?: string | null } };
  };
  const official = sprites.other?.["official-artwork"]?.front_default;
  if (official) return official;
  if (!form.is_default) return sprites.front_default ?? undefined;
  return pokemon.id ? `${import.meta.env.VITE_POKEMON_ARTWORK_BASE_URL}${pokemon.id}.png` : sprites.front_default ?? undefined;
}
