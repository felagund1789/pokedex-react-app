import { gameVersionGroups, gameVersions } from "../../assets/gameVersions";
import icons from "../../assets/types";
import useItem from "../../hooks/useItem";
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
const gameVersion = (name: string) =>
      gameVersionGroups[name]?.map((gameVersion) => gameVersions[gameVersion]).join("  ");

const EvolutionDetailsCard = ({ details }: Props) => {
  const location = useResourceName(details.location);
  const heldItem = useItem({ slug: details.held_item?.name ?? "" });
  const item = useItem({ slug: details.item?.name ?? "" });
  const knownMove = useResourceName(details.known_move);
  const knownMoveType = useResourceName(details.known_move_type);
  const partySpecies = useResourceName(details.party_species);
  const partyType = useResourceName(details.party_type);
  const tradeSpecies = useResourceName(details.trade_species);
  const region = useResourceName(details.region);
  const usedMove = useResourceName(details.used_move);
  const errors = [
    location,
    heldItem,
    item,
    knownMove,
    knownMoveType,
    partySpecies,
    partyType,
    tradeSpecies,
    region,
    usedMove
  ].filter((query) => query.error);

  const triggers: Record<string, string> = {
    "level-up": "Level up",
    "in-battle-level-up": "Level up in battle",
    "trade": "Trade",
    "use-item": `Use ${item.data?.names?.find((name) => name.language.name === "en")?.name 
      ?? label(details.item?.name ?? "item")}`,
    "shed": "Empty slot in party and Pokéball in bag",
    "spin": "Use Sweet Item and spin",
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
  const text: string[] = [];
  if (triggers[details.trigger.name]) {
    text.push(triggers[details.trigger.name] ?? label(details.trigger.name));
  }
  if (details.held_item) {
    text.push(`holding ${heldItem.data?.names?.find((name) => name.language.name === "en")?.name
      ?? label(details.held_item.name)}`);
  }
  if (details.known_move) {
    text.push(`knowing ${knownMove.data ?? label(details.known_move.name)}`);
  }
  if (details.known_move_type) {
    text.push(`knowing a move of type ${knownMoveType.data ?? label(details.known_move_type.name)}`);
  }
  if (details.location) {
    text.push(`at ${location.data ?? label(details.location.name)}`);
  }
  if (details.gender != null) {
    text.push(`gender: ${details.gender === 1 ? "female" : details.gender === 2 ? "male" : details.gender}`);
  }
  if (details.min_affection != null) {
    text.push(`having affection ${details.min_affection}`);
  }
  if (details.min_beauty != null) {
    text.push(`having beauty ${details.min_beauty}`);
  }
  if (details.min_happiness != null) {
    text.push(`having happiness ${details.min_happiness}`);
  }
  if (details.min_level != null) {
    text.push(`to Lv ${details.min_level}`);
  }
  if (details.party_species) {
    text.push(`having ${partySpecies.data ?? label(details.party_species.name)} in party`);
  }
  if (details.party_type) {
    text.push(`having Pokémon of type ${partyType.data ?? label(details.party_type.name)} in party`);
  }
  if (details.trade_species) {
    text.push(`traded for ${tradeSpecies.data ?? label(details.trade_species.name)}`);
  }
  if (details.relative_physical_stats === 0) {
    text.push(`having Attack = Defense`);
  }
  if (details.relative_physical_stats === 1) {
    text.push(`having Attack &gt; Defense`);
  }
  if (details.relative_physical_stats === -1) {
    text.push(`having Attack &lt; Defense`);
  }
  if (details.relative_physical_stats != null && ![-1, 0, 1].includes(details.relative_physical_stats)) {
    text.push(`Additional physical-stat condition: ${details.relative_physical_stats}`);
  }
  if (details.time_of_day) {
    text.push(`during ${details.time_of_day}`);
  }
  if (details.needs_overworld_rain) {
    text.push(`while raining in the overworld`);
  }
  if (details.needs_multiplayer) {
    text.push(`in multiplayer`);
  }
  if (details.near_special_rock) {
    text.push(`near a special rock`);
  }
  if (details.turn_upside_down) {
    text.push(`turn the device upside down`);
  }
  if (details.region) {
    text.push(`in ${region.data ?? label(details.region.name)}`);
  }
  if (details.used_move && !["agile-style-move", "strong-style-move", "use-move"].includes(details.trigger.name)) {
    text.push(`using ${usedMove.data ?? label(details.used_move.name)}`);
  }
  if (details.min_move_count != null) {
    text.push(`at least ${details.min_move_count} times`);
  }
  if (details.min_steps != null) {
    text.push(`at least ${details.min_steps} steps`);
  }
  if (details.min_damage_taken != null) {
    text.push(`after taking at least ${details.min_damage_taken} damage`);
  }
  if (chance != null) {
    text.push(`${chance}% chance`);
  }
  if (details.condition_expression && chance == null) {
    text.push(`Additional condition: ${details.condition_expression.expression}`);
  }
  extra.forEach(([key]) => text.push(`Additional condition: ${label(key)}`));

  return (
    <div className="evolution-details">
      {(item.data || heldItem.data) && (
        <img className="evolution-info" src={item.data?.sprites?.default ?? heldItem.data?.sprites?.default ?? ""} 
          alt={text.join(" ")}
          title={text.join(" ")} />
      ) || details.party_type && (
        <span className={`evolution-info party-type ${details.party_type?.name}`}>
          <img src={icons[details.party_type?.name as keyof typeof icons]} alt={text.join(" ")} title={text.join(" ")} />
        </span>
      ) || details.min_level != null && (
        <div className="evolution-info" title={text.join(" ")}>Lv {details.min_level}</div>
      ) || details.trigger.name && (
        <div className="evolution-info" title={text.join(" ")}>
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" className="arrow">
            <path d="M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z" />
          </svg>
        </div>
      )}
      {details.version_group && (<div className="version-group-container">
        {gameVersionGroups[details.version_group.name].map((version) => (
          <span key={version} className={`game-version ${version}`} title={gameVersion(details.version_group!.name)}>&nbsp;</span>
        ))}
      </div>)}
      {errors.map((query, index) => <div role="alert" key={index}>Unable to load condition name: {query.error?.message}</div>)}
    </div>
  );
};

export default EvolutionDetailsCard;
