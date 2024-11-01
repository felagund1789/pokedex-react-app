import usePokemonName from "../../hooks/usePokemonName";
import useResourceName from "../../hooks/useResourceName";
import { EvolutionDetails } from "../../types";
import "./EvolutionDetailsCard.css";

interface Props {
  details: EvolutionDetails;
}

const EvolutionDetailsCard = ({ details }: Props) => {
  const { data: location } = useResourceName(details.location);
  const { data: heldItem } = useResourceName(details.held_item);
  const { data: item } = useResourceName(details.item);
  const { data: knownMove } = useResourceName(details.known_move);
  const { data: knownMoveType } = useResourceName(details.known_move_type);
  const partySpecies = usePokemonName({ slug: details.party_species?.name });
  const { data: partyType } = useResourceName(details.party_type);

  console.log(location, heldItem, item);

  return (
    <div className="evolution-details">
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="white" className="arrow">
        <path d="M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z"/>
      </svg>
      {details.trigger && details.trigger.name === "use-item" && <div className="use-item">use {item}</div>}
      {details.trigger && details.trigger.name === "level-up" && <div className="level-up">level up</div>}
      {details.trigger && details.trigger.name === "trade" && <div className="trade">trade</div>}
      {details.trigger && details.trigger.name === "three-critical-hits" && <div className="three-critical-hits">Land three critical hits in a battle</div>}
      {details.relative_physical_stats === 0 && <div className="attack-eq-defense">having Attack = Defense</div>}
      {details.relative_physical_stats === 1 && <div className="attack-eq-defense">having Attack &gt; Defense</div>}
      {details.relative_physical_stats === -1 && <div className="attack-eq-defense">having Attack &lt; Defense</div>}
      {details.held_item && <div className="holding">holding {heldItem}</div>}
      {details.known_move && <div className="knowing-move">knowing {knownMove}</div>}
      {details.known_move_type && <div className="knowing-move-type">knowing a move of type {knownMoveType}</div>}
      {details.location && <div className="location">at {location}</div>}
      {details.min_affection && <div className="affection">having affection {details.min_affection}</div>}
      {details.min_beauty && <div className="beauty">having beauty {details.min_beauty}</div>}
      {details.min_happiness && <div className="happiness">having happiness {details.min_happiness}</div>}
      {details.min_level && <div className="level">{details.min_level}</div>}
      {details.party_species && <div className="party-species">having {partySpecies} in party</div>}
      {details.party_type && <div className="party-type">having Pokémon of type {partyType} in party</div>}
      {details.time_of_day && <div className="time">during {details.time_of_day}</div>}
    </div>
  );
};

export default EvolutionDetailsCard;
