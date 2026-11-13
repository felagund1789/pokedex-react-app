import type { PokemonForm } from "pokeapi-js-wrapper";

export function pokemonFormName(
  form: PokemonForm | undefined,
  language: string,
  speciesName?: string,
  useFormFallback = false,
) {
  if (!form) return undefined;
  const fullName = form.names.find((entry) => entry.language.name === language)?.name.trim();
  if (fullName) return fullName;
  
  const formName = form.form_names.find((entry) => entry.language.name === language)?.name.trim();
  if (formName) return speciesName ? `${speciesName} (${formName})` : formName;
  
  return useFormFallback ? form.name.replace(/-/g, " ") : undefined;
}
