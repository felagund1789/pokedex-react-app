import { Type } from "pokeapi-js-wrapper";
import { useQuery } from "@tanstack/react-query";
import typeIcons from "../../assets/types";
import usePokemonInfo from "../../hooks/usePokemonInfo";
import pokedex from "../../services/pokedexService";
import PokemonType from "../pokemonType/PokemonType";
import "./TypeCard.css";

interface Props {
  slug: string;
}

const allTypes = Object.keys(typeIcons);
const matchupGroups = [
  { multiplier: 4, label: "Takes 4x damage from", className: "weakness" },
  { multiplier: 2, label: "Takes 2x damage from", className: "weakness" },
  { multiplier: 1, label: "Takes 1x damage from", className: "neutral" },
  { multiplier: 0.5, label: "Takes 0.5x damage from", className: "resistance" },
  { multiplier: 0.25, label: "Takes 0.25x damage from", className: "resistance" },
  { multiplier: 0, label: "Takes no damage from", className: "immunity" },
];

const getDamageMultiplier = (attackType: string, defenseTypes: Type[]) =>
  defenseTypes.reduce((multiplier, defenseType) => {
    const relations = defenseType.damage_relations;
    if (relations.no_damage_from.some((type) => type.name === attackType)) {
      return 0;
    }
    if (relations.double_damage_from.some((type) => type.name === attackType)) {
      return multiplier * 2;
    }
    if (relations.half_damage_from.some((type) => type.name === attackType)) {
      return multiplier * 0.5;
    }
    return multiplier;
  }, 1);

const TypeCard = ({ slug }: Props) => {
  const { types } = usePokemonInfo(slug);
  return <TypeMatchups types={types} />;
};

export const TypeMatchups = ({
  types,
  includeNeutralSelf = false,
}: {
  types: string[];
  includeNeutralSelf?: boolean;
}) => {
  const { data: defenseTypes, isLoading, error } = useQuery<Type[], Error>({
    queryKey: ["type-matchups", [...types].sort()],
    queryFn: () => Promise.all(types.map((type) => pokedex.getTypeByName(type))),
    enabled: types.length > 0,
    staleTime: 24 * 60 * 60 * 1000,
  });
  const matchups = defenseTypes
    ? allTypes.map((name) => ({
        name,
        multiplier: getDamageMultiplier(name, defenseTypes),
      })).filter(({ name, multiplier }) =>
        includeNeutralSelf || multiplier !== 1 || !types.includes(name),
      )
    : [];

  return (
    <div className="type-card">
      <h2 className="type-card__title">
        <span>Type</span>
        <span className="type-card__pokemon-types">
          {types.map((type) => (
            <PokemonType key={type}>{type}</PokemonType>
          ))}
        </span>
      </h2>
      {isLoading && <p>Loading type matchups...</p>}
      {error && <p>Error loading type matchups: {error.message}</p>}
      <div className="type-card__matchups">
        {matchupGroups.map((group) => {
          const types = matchups.filter(
            (matchup) => matchup.multiplier === group.multiplier,
          );
          if (types.length === 0) {
            return null;
          }

          return (
            <section
              key={group.multiplier}
              className={`type-card__group type-card__group--${group.className}`}
            >
              <p className="type-card__label">{group.label}</p>
              <div className="type-card__tags">
                {types.map(({ name }) => (
                  <PokemonType key={name}>{name}</PokemonType>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default TypeCard;
