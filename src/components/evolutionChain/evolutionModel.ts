import type { NamedAPIResource, Pokemon, PokemonForm, PokemonSpecies } from "pokeapi-js-wrapper";
import pokedex from "../../services/pokedexService";
import { resolvePokemonForm } from "../../hooks/useSelectedPokemonForm";

export interface EvolutionMethod {
  trigger: NamedAPIResource;
  item: NamedAPIResource | null;
  held_item: NamedAPIResource | null;
  known_move: NamedAPIResource | null;
  known_move_type: NamedAPIResource | null;
  location: NamedAPIResource | null;
  gender: number | null;
  min_level: number | null;
  min_happiness: number | null;
  min_beauty: number | null;
  min_affection: number | null;
  near_special_rock?: boolean;
  needs_multiplayer?: boolean;
  needs_overworld_rain: boolean;
  party_species: NamedAPIResource | null;
  party_type: NamedAPIResource | null;
  relative_physical_stats: number | null;
  time_of_day: string;
  trade_species: NamedAPIResource | null;
  turn_upside_down: boolean;
  region?: NamedAPIResource | null;
  required_pokemon_form?: NamedAPIResource | null;
  evolved_pokemon_form?: NamedAPIResource | null;
  used_move?: NamedAPIResource | null;
  min_move_count?: number | null;
  min_steps?: number | null;
  min_damage_taken?: number | null;
  allowed_natures?: NamedAPIResource[] | null;
  condition_expression?: {
    expression: string;
    percentage_chance: number | null;
    variables: NamedAPIResource[];
  } | null;
  version_group?: NamedAPIResource | null;
  is_default?: boolean;
  [key: string]: unknown;
}

export interface EvolutionNode {
  species: NamedAPIResource;
  is_baby: boolean;
  evolution_details: EvolutionMethod[];
  evolves_to: EvolutionNode[];
}

export interface EvolutionChainData {
  id: number;
  chain: EvolutionNode;
}

export interface DisplayPokemon {
  pokemon: Pokemon;
  form: PokemonForm;
  formResource: NamedAPIResource;
  explicitForm: boolean;
  hasAlternatives: boolean;
}

export interface DisplayNode {
  display: DisplayPokemon;
  transitions: DisplayTransition[];
}

export interface DisplayTransition {
  methods: EvolutionMethod[];
  target: DisplayNode;
  uncertain: boolean;
}

interface Path {
  nodes: EvolutionNode[];
  methods: (EvolutionMethod | null)[];
}

interface ConstrainedPath {
  path: Path;
  forms: (NamedAPIResource | undefined)[];
  defaulted: boolean[];
  currentIndex: number;
}

function paths(node: EvolutionNode): Path[] {
  if (!node.evolves_to.length) return [{ nodes: [node], methods: [] }];
  return node.evolves_to.flatMap((child) =>
    paths(child).flatMap((path) =>
      (child.evolution_details.length ? child.evolution_details : [null]).map((method) => ({
        nodes: [node, ...path.nodes],
        methods: [method, ...path.methods],
      })),
    ),
  );
}

function sameResource(left: NamedAPIResource, right: NamedAPIResource) {
  return left.url === right.url || left.name === right.name;
}

function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, canonicalValue(entry)]),
    );
  }
  return value;
}

function sameMethodConditions(left: EvolutionMethod, right: EvolutionMethod) {
  const withoutFormOrVersion = (method: EvolutionMethod) => {
    const fields = Object.entries(method).filter(([key]) =>
      !["required_pokemon_form", "evolved_pokemon_form", "version_group", "is_default"].includes(key),
    );
    return JSON.stringify(canonicalValue(Object.fromEntries(fields)));
  };
  return withoutFormOrVersion(left) === withoutFormOrVersion(right);
}

export async function resolveEvolutionTree(
  root: EvolutionNode,
  current: Pokemon,
  selectedForm: string | null,
): Promise<DisplayNode[]> {
  const currentForm = await resolvePokemonForm(current, selectedForm);
  const selected = current.forms.find((entry) => entry.name === currentForm.name);
  if (!selected) {
    throw new Error(`Unable to resolve the selected form for ${current.name}.`);
  }

  const speciesCache = new Map<string, Promise<PokemonSpecies>>();
  const formCache = new Map<string, Promise<PokemonForm>>();
  const pokemonCache = new Map<string, Promise<Pokemon>>();
  const getSpecies = (entry: NamedAPIResource) => {
    if (!speciesCache.has(entry.url)) speciesCache.set(entry.url, pokedex.resource(entry.url));
    return speciesCache.get(entry.url)!;
  };
  const getForm = (entry: NamedAPIResource) => {
    if (!formCache.has(entry.url)) formCache.set(entry.url, pokedex.resource(entry.url));
    return formCache.get(entry.url)!;
  };
  const getPokemon = (entry: NamedAPIResource) => {
    if (!pokemonCache.has(entry.url)) pokemonCache.set(entry.url, pokedex.getPokemonByName(entry.name));
    return pokemonCache.get(entry.url)!;
  };
  const getDefaultDisplay = async (entry: NamedAPIResource): Promise<DisplayPokemon> => {
    const species = await getSpecies(entry);
    const variety = species.varieties.find((candidate) => candidate.is_default);
    if (!variety) throw new Error(`Unable to resolve a default Pokémon for ${entry.name}.`);
    const pokemon = await getPokemon(variety.pokemon);
    const defaultForm = await resolvePokemonForm(pokemon, null);
    const formResource = pokemon.forms.find((candidate) => candidate.name === defaultForm.name);
    if (!formResource) throw new Error(`Unable to resolve a form for ${pokemon.name}.`);
    return {
      pokemon, form: defaultForm, formResource, explicitForm: false,
      hasAlternatives: species.varieties.length > 1 || pokemon.forms.length > 1,
    };
  };

  const result: DisplayNode[] = [];
  const allPaths = paths(root);
  const constrainPath = (path: Path, anchor?: ConstrainedPath): ConstrainedPath | null => {
    const forms: (NamedAPIResource | undefined)[] = path.nodes.map(() => undefined);
    const defaulted = path.nodes.map(() => false);
    const assign = (index: number, value: NamedAPIResource | null | undefined) => {
      if (!value) return true;
      if (forms[index] && !sameResource(forms[index], value)) return false;
      forms[index] = value;
      return true;
    };
    for (let index = 0; index < path.methods.length; index++) {
      const method = path.methods[index];
      if (!assign(index, method?.required_pokemon_form) ||
          !assign(index + 1, method?.evolved_pokemon_form)) return null;
    }
    const currentIndex = path.nodes.findIndex((entry) => sameResource(entry.species, current.species));
    if (currentIndex !== -1 && !assign(currentIndex, selected)) return null;
    if (anchor) {
      for (let index = 0; index <= anchor.currentIndex && index < path.nodes.length; index++) {
        if (path.nodes[index] !== anchor.path.nodes[index]) break;
        const alreadySpecified = Boolean(forms[index]);
        if (!assign(index, anchor.forms[index])) return null;
        if (!alreadySpecified) defaulted[index] = anchor.defaulted[index];
      }
    }

    for (let index = 0; index < path.methods.length; index++) {
      const method = path.methods[index];
      if (!method) continue;
      const moreSpecific = path.nodes[index + 1].evolution_details.some((candidate) => {
        const source = forms[index];
        const target = forms[index + 1];
        const matchesSource = !candidate.required_pokemon_form || !source ||
          sameResource(candidate.required_pokemon_form, source);
        const matchesTarget = !candidate.evolved_pokemon_form || !target ||
          sameResource(candidate.evolved_pokemon_form, target);
        const preservesSource = !method.required_pokemon_form ||
          (candidate.required_pokemon_form &&
            sameResource(method.required_pokemon_form, candidate.required_pokemon_form));
        const preservesTarget = !method.evolved_pokemon_form ||
          (candidate.evolved_pokemon_form &&
            sameResource(method.evolved_pokemon_form, candidate.evolved_pokemon_form));
        const specifiesKnownForm =
          (!method.required_pokemon_form && source && candidate.required_pokemon_form &&
            sameResource(candidate.required_pokemon_form, source)) ||
          (!method.evolved_pokemon_form && target && candidate.evolved_pokemon_form &&
            sameResource(candidate.evolved_pokemon_form, target));
        return Boolean(specifiesKnownForm && matchesSource && matchesTarget && preservesSource && preservesTarget &&
          sameMethodConditions(method, candidate));
      });
      if (moreSpecific) return null;
    }

    return { path, forms, defaulted, currentIndex };
  };

  const matchingPaths = allPaths
    .map((path) => constrainPath(path))
    .filter((path): path is ConstrainedPath => path !== null && path.currentIndex !== -1);
  if (!matchingPaths.length) throw new Error(`No evolution path matches the selected form of ${current.name}.`);

  const anchors = await Promise.all(matchingPaths.map(async (anchor) => {
    const forms = [...anchor.forms];
    const defaulted = [...anchor.defaulted];
    await Promise.all(forms.slice(0, anchor.currentIndex).map(async (form, index) => {
      if (!form) {
        forms[index] = (await getDefaultDisplay(anchor.path.nodes[index].species)).formResource;
        defaulted[index] = true;
      }
    }));
    return { ...anchor, forms, defaulted };
  }));
  const candidates = allPaths.flatMap((path) =>
    path.nodes.some((entry) => sameResource(entry.species, current.species))
      ? anchors.filter((anchor) => anchor.path === path)
      : anchors
        .map((anchor) => constrainPath(path, anchor))
        .filter((candidate): candidate is ConstrainedPath => candidate !== null),
  );
  const seen = new Map<Path, Set<string>>();
  const uniqueCandidates = candidates.filter(({ path, forms, defaulted }) => {
    const key = JSON.stringify([forms.map((form) => form?.url ?? null), defaulted]);
    const keys = seen.get(path) ?? new Set<string>();
    if (keys.has(key)) return false;
    keys.add(key);
    seen.set(path, keys);
    return true;
  });
  const resolvedPaths = await Promise.all(uniqueCandidates.map(async ({ path, forms, defaulted, currentIndex }) => {
    const displays = await Promise.all(path.nodes.map(async (entry, index): Promise<DisplayPokemon> => {
      const specific = forms[index];
      const species = await getSpecies(entry.species);
      if (specific) {
        const formData = await getForm(specific);
        const pokemon = currentIndex === index && formData.pokemon.name === current.name
          ? current
          : await getPokemon(formData.pokemon);
        if (pokemon.species.name !== entry.species.name || !pokemon.forms.some((candidate) => sameResource(candidate, specific))) {
          throw new Error(`Unable to resolve form ${specific.name} for ${entry.species.name}.`);
        }
        return {
          pokemon, form: formData, formResource: specific, explicitForm: !defaulted[index],
          hasAlternatives: species.varieties.length > 1 || pokemon.forms.length > 1,
        };
      }
      return getDefaultDisplay(entry.species);
    }));
    return { path, displays };
  }));

  for (const resolved of resolvedPaths) {
    if (!resolved) continue;
    const { path, displays } = resolved;
    let node: DisplayNode = result.find((candidate) => sameResource(candidate.display.formResource, displays[0].formResource))
      ?? { display: displays[0], transitions: [] };
    if (!result.includes(node)) {
      result.push(node);
    }
    for (let index = 0; index < path.methods.length; index++) {
      const method = path.methods[index];
      const display = displays[index + 1];
      let transition: DisplayTransition | undefined = node.transitions.find((candidate) =>
        sameResource(candidate.target.display.formResource, display.formResource),
      );
      if (!transition) {
        transition = {
          methods: [],
          target: { display, transitions: [] },
          uncertain: false,
        };
        node.transitions.push(transition);
      }
      if (method && !transition.methods.includes(method)) transition.methods.push(method);
      if (method && ((!method.required_pokemon_form && displays[index].hasAlternatives) ||
          (!method.evolved_pokemon_form && display.hasAlternatives))) {
        transition.uncertain = true;
      }
      node = transition.target;
    }
  }
  if (!result.length) throw new Error(`No evolution path matches the selected form of ${current.name}.`);
  return result;
}
