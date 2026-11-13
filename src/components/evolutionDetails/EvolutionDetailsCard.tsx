import useResourceName from "../../hooks/useResourceName";
import type { EvolutionMethod } from "../evolutionChain/evolutionModel";
import "./EvolutionDetailsCard.css";

interface Props {
  details: EvolutionMethod;
}

const knownFields = new Set([
  "trigger", "item", "held_item", "known_move", "known_move_type", "location",
  "gender", "min_level", "min_happiness", "min_beauty", "min_affection",
  "near_special_rock", "needs_multiplayer", "needs_overworld_rain", "party_species",
  "party_type", "relative_physical_stats", "time_of_day", "trade_species",
  "turn_upside_down", "region", "required_pokemon_form", "evolved_pokemon_form",
  "used_move", "min_move_count", "min_steps", "min_damage_taken", "allowed_natures",
  "condition_expression", "version_group", "is_default",
]);

const label = (name: string) => name.replace(/[-_]/g, " ");

const EvolutionDetailsCard = ({ details }: Props) => {
  const location = useResourceName(details.location);
  const heldItem = useResourceName(details.held_item);
  const item = useResourceName(details.item);
  const knownMove = useResourceName(details.known_move);
  const knownMoveType = useResourceName(details.known_move_type);
  const partySpecies = useResourceName(details.party_species);
  const partyType = useResourceName(details.party_type);
  const tradeSpecies = useResourceName(details.trade_species);
  const region = useResourceName(details.region);
  const usedMove = useResourceName(details.used_move);
  const errors = [location, heldItem, item, knownMove, knownMoveType, partySpecies, partyType, tradeSpecies, region, usedMove]
    .filter((query) => query.error);
  const triggers: Record<string, string> = {
    "level-up": "Level up",
    "in-battle-level-up": "Level up in battle",
    trade: "Trade",
    "use-item": `Use ${item.data ?? label(details.item?.name ?? "item")}`,
    shed: "Empty slot in party and Pokéball in bag",
    spin: "Use Sweet Item and spin",
    "three-critical-hits": "Land three critical hits in a battle",
    "tower-of-darkness": "Train in the Tower of Darkness",
    "tower-of-waters": "Train in the Tower of Waters",
    "take-damage": "Go somewhere after taking damage",
    "agile-style-move": `Use ${usedMove.data ?? knownMove.data ?? label(details.used_move?.name ?? details.known_move?.name ?? "the required move")} in Agile Style`,
    "strong-style-move": `Use ${usedMove.data ?? knownMove.data ?? label(details.used_move?.name ?? details.known_move?.name ?? "the required move")} in Strong Style`,
    "use-move": `Use ${usedMove.data ?? label(details.used_move?.name ?? "the required move")}`,
  };
  const extra = Object.entries(details).filter(([key, value]) =>
    !knownFields.has(key) && value !== null && value !== undefined && value !== false && value !== "" &&
    !(Array.isArray(value) && value.length === 0),
  );
  const chance = details.condition_expression?.percentage_chance;

  return (
    <div className="evolution-details">
      <div>{triggers[details.trigger.name] ?? label(details.trigger.name)}</div>
      {details.held_item && <div>holding {heldItem.data ?? label(details.held_item.name)}</div>}
      {details.known_move && <div>knowing {knownMove.data ?? label(details.known_move.name)}</div>}
      {details.known_move_type && <div>knowing a move of type {knownMoveType.data ?? label(details.known_move_type.name)}</div>}
      {details.location && <div>at {location.data ?? label(details.location.name)}</div>}
      {details.gender != null && <div>gender: {details.gender === 1 ? "female" : details.gender === 2 ? "male" : details.gender}</div>}
      {details.min_affection != null && <div>having affection {details.min_affection}</div>}
      {details.min_beauty != null && <div>having beauty {details.min_beauty}</div>}
      {details.min_happiness != null && <div>having happiness {details.min_happiness}</div>}
      {details.min_level != null && <div>to {details.min_level}</div>}
      {details.party_species && <div>having {partySpecies.data ?? label(details.party_species.name)} in party</div>}
      {details.party_type && <div>having Pokémon of type {partyType.data ?? label(details.party_type.name)} in party</div>}
      {details.trade_species && <div>traded for {tradeSpecies.data ?? label(details.trade_species.name)}</div>}
      {details.relative_physical_stats === 0 && <div>having Attack = Defense</div>}
      {details.relative_physical_stats === 1 && <div>having Attack &gt; Defense</div>}
      {details.relative_physical_stats === -1 && <div>having Attack &lt; Defense</div>}
      {details.relative_physical_stats != null && ![-1, 0, 1].includes(details.relative_physical_stats) &&
        <div>Additional physical-stat condition: {details.relative_physical_stats}</div>}
      {details.time_of_day && <div>during {details.time_of_day}</div>}
      {details.needs_overworld_rain && <div>while raining in the overworld</div>}
      {details.needs_multiplayer && <div>in multiplayer</div>}
      {details.near_special_rock && <div>near a special rock</div>}
      {details.turn_upside_down && <div>turn the device upside down</div>}
      {details.region && <div>in {region.data ?? label(details.region.name)}</div>}
      {details.used_move && !["agile-style-move", "strong-style-move", "use-move"].includes(details.trigger.name) &&
        <div>using {usedMove.data ?? label(details.used_move.name)}</div>}
      {details.min_move_count != null && <div>at least {details.min_move_count} times</div>}
      {details.min_steps != null && <div>at least {details.min_steps} steps</div>}
      {details.min_damage_taken != null && <div>after taking at least {details.min_damage_taken} damage</div>}
      {details.allowed_natures?.length ? <div>nature: {details.allowed_natures.map((nature) => label(nature.name)).join(", ")}</div> : null}
      {chance != null && <div>{chance}% chance</div>}
      {details.condition_expression && chance == null && <div>Additional condition: {details.condition_expression.expression}</div>}
      {details.version_group && <small>Game: {label(details.version_group.name)}</small>}
      {extra.map(([key]) => <div key={key}>Additional condition: {label(key)}</div>)}
      {errors.map((query, index) => <div role="alert" key={index}>Unable to load condition name: {query.error?.message}</div>)}
    </div>
  );
};

export default EvolutionDetailsCard;
