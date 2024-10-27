export interface APIResource {
  name: string;
  url: string;
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: APIResource;
}

export interface PokemonType {
  slot: number;
  type: APIResource;
}

export interface PokemonAbility {
  ability: APIResource;
  is_hidden: boolean;
  slot: number;
}

export interface VersionGroupDetails {
  level_learned_at: number;
  move_learn_method: APIResource;
  version_group: APIResource;
}

export interface PokemonMove {
  move: APIResource;
  version_group_details: VersionGroupDetails[];
}

export interface Pokemon {
  base_experience: number;
  height: number;
  id: number;
  name: string;
  weight: number;
  stats: PokemonStat[];
  types: PokemonType[];
  abilities: PokemonAbility[];
  moves: PokemonMove[];
}

export interface PokemonSpecies {
  base_happiness: number;
  capture_rate: number;
  color: APIResource;
  egg_groups: APIResource[];
  evolution_chain: {
    url: string;
  };
  evolves_from_species: APIResource;
  flavor_text_entries: {
    flavor_text: string;
    language: APIResource;
    version: APIResource;
  }[];
  forms_switchable: boolean;
  gender_rate: number;
  genera: {
    genus: string;
  }[];
  generation: APIResource;
  growth_rate: APIResource;
  habitat: APIResource;
  has_gender_differences: boolean;
  hatch_counter: number;
  is_baby: boolean;
  is_legendary: boolean;
  is_mythical: boolean;
  name: string;
  names: {
    name: string;
    language: APIResource;
  }[];
  shape: APIResource;
  pokedex_numbers: {
    entry_number: number;
    pokedex: APIResource;
  }[];
  varieties: {
    is_default: boolean;
    pokemon: APIResource;
  }[];
}
