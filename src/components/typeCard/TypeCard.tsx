import { Pokemon, Type } from "pokeapi-js-wrapper";
import { useEffect, useState } from "react";
import typeIcons from "../../assets/types";
import pokedex from "../../services/pokedexService";
import PokemonType from "../pokemonType/PokemonType";
import "./TypeCard.css";

interface Props {
  slug: string;
}

interface TypeMatchup {
  name: string;
  multiplier: number;
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
  const [pokemonTypes, setPokemonTypes] = useState<string[]>([]);
  const [matchups, setMatchups] = useState<TypeMatchup[]>([]);

  useEffect(() => {
    let isCurrent = true;
    setPokemonTypes([]);
    setMatchups([]);

    const loadMatchups = async () => {
      const pokemon: Pokemon = await pokedex.getPokemonByName(slug);
      const defenseTypes: Type[] = await Promise.all(
        pokemon.types.map(({ type }) => pokedex.resource(type.url)),
      );
      const types = pokemon.types.map(({ type }) => type.name);
      const damageMatchups = allTypes
        .map((name) => ({
          name,
          multiplier: getDamageMultiplier(name, defenseTypes),
        }))
        .filter(
          ({ name, multiplier }) =>
            multiplier !== 1 || !types.includes(name),
        );

      if (!isCurrent) {
        return;
      }

      setPokemonTypes(types);
      setMatchups(damageMatchups);
    };

    void loadMatchups();
    return () => {
      isCurrent = false;
    };
  }, [slug]);

  return (
    <div className="type-card">
      <h2 className="type-card__title">
        <span>Type</span>
        <span className="type-card__pokemon-types">
          {pokemonTypes.map((type) => (
            <PokemonType key={type}>{type}</PokemonType>
          ))}
        </span>
      </h2>
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
