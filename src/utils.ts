import { FluffyEvolutionDetail, PurpleEvolutionDetail } from "pokeapi-js-wrapper";
type EvolutionDetails = FluffyEvolutionDetail | PurpleEvolutionDetail;

export const evolutionComplexity = (details: EvolutionDetails): number => {
  let complexity = 0;
  if (details.gender) complexity += 0.5;
  if (details.held_item) complexity += 0.2;
  if (details.item) complexity += 0.2;
  if (details.known_move) complexity += 0.5;
  if (details.known_move_type) complexity += 0.5;
  if (details.location) complexity += 0.5;
  if (details.min_beauty) complexity += 0.5;
  if (details.min_affection) complexity += 0.5;
  if (details.min_happiness) complexity += 0.5;
  if (details.min_level) complexity += 0.1;
  if (details.needs_overworld_rain) complexity += 1;
  if (details.party_species) complexity += 1;
  if (details.party_type) complexity += 1;
  if (details.relative_physical_stats) complexity += 1;
  if (details.time_of_day) complexity += 0.5;
  if (details.trade_species) complexity += 1;
  return complexity;
};

export const findSimplestEvolution = (
  acc: EvolutionDetails[],
  details: EvolutionDetails
) => {
  if (acc.length === 0) {
    return [details];
  }
  if (
    evolutionComplexity(details) > 0 &&
    evolutionComplexity(details) < evolutionComplexity(acc[0])
  ) {
    return [details];
  }
  return acc;
};
