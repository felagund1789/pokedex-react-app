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

  return (
    <div className="evolution-details">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 -960 960 960"
        width="24px"
        fill="white"
        className="arrow"
      >
        <path d="M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z" />
      </svg>
      {details.trigger.name === "level-up" && (
        <div className="level-up">Level up</div>
      )}
      {details.trigger.name === "trade" && <div className="trade">Trade</div>}
      {details.trigger.name === "use-item" && (
        <div className="use-item">Use {item}</div>
      )}
      {details.trigger.name === "shed" && (
        <div className="shed">
          <div>Empty slot in party</div>
          <div>and Pokéball in bag</div>
        </div>
      )}
      {details.trigger.name === "spin" && (
        <div className="spin">
          <div>Use Sweet Item</div>
          <div>and Spin</div>
        </div>
      )}
      {details.trigger.name === "three-critical-hits" && (
        <div className="three-critical-hits">
          Land three critical hits in a battle
        </div>
      )}
      {details.trigger.name === "tower-of-darkness" && (
        <div className="tower-of-darkness">
          <div>Train in the</div>
          <div>Tower of Darkness</div>
        </div>
      )}
      {details.trigger.name === "tower-of-waters" && (
        <div className="tower-of-waters">
          <div>Train in the</div>
          <div>Tower of Waters</div>
        </div>
      )}
      {details.trigger.name === "take-damage" && (
        <div className="take-damage">
          <div>Go somewhere</div>
          <div>after taking damage</div>
        </div>
      )}
      {details.trigger.name === "other" && <div className="other"></div>}
      {details.trigger.name === "agile-style-move" && (
        <div className="agile-style-move">
          <div>Use {knownMove}</div>
          <div>20 times in Agile Style</div>
        </div>
      )}
      {details.trigger.name === "strong-style-move" && (
        <div className="strong-style-move">
          <div>Use {knownMove}</div>
          <div>20 times in Strong Style</div>
        </div>
      )}
      {details.held_item && <div className="holding">holding {heldItem}</div>}
      {details.known_move && details.trigger.name === "level-up" && (
        <div className="knowing-move">knowing {knownMove}</div>
      )}
      {details.known_move_type && (
        <div className="knowing-move-type">
          knowing a move of type {knownMoveType}
        </div>
      )}
      {details.location && <div className="location">at {location}</div>}
      {details.min_affection && (
        <div className="affection">
          having affection {details.min_affection}
        </div>
      )}
      {details.min_beauty && (
        <div className="beauty">having beauty {details.min_beauty}</div>
      )}
      {details.min_happiness && (
        <div className="happiness">
          having happiness {details.min_happiness}
        </div>
      )}
      {details.min_level && <div className="level">to {details.min_level}</div>}
      {details.party_species && (
        <div className="party-species">having {partySpecies} in party</div>
      )}
      {details.party_type && (
        <div className="party-type">
          having Pokémon of type {partyType} in party
        </div>
      )}
      {details.relative_physical_stats === 0 && (
        <div className="attack-eq-defense">having Attack = Defense</div>
      )}
      {details.relative_physical_stats === 1 && (
        <div className="attack-gt-defense">having Attack &gt; Defense</div>
      )}
      {details.relative_physical_stats === -1 && (
        <div className="attack-lt-defense">having Attack &lt; Defense</div>
      )}
      {details.time_of_day && (
        <div className="time">during {details.time_of_day}</div>
      )}
    </div>
  );
};

export default EvolutionDetailsCard;
