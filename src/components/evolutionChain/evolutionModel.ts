import type { NamedAPIResource } from "pokeapi-js-wrapper";

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
