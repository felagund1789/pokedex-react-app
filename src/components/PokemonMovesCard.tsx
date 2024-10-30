import { useState } from "react";
import usePokemon from "../hooks/usePokemon";
import { PokemonMove } from "../types";
import MoveCard from "./MoveCard";

interface Props {
  slug: string;
  color?: string;
}

const filterBy = (method: string) => {
  return (pokemonMove: PokemonMove) => {
    return pokemonMove.version_group_details.find(
      (versionGroup) => versionGroup.move_learn_method.name === method
    );
  };
};

const PokemonMovesCard = ({ slug }: Props) => {
  const { data } = usePokemon({ slug });
  const [filter, setFilter] = useState("level-up");

  return (
    <div className="pokemon-moves">
      <h2 className="title">Moves</h2>
      <div className="filters">
        <button
          className={`filter ${filter === "level-up" ? "active" : ""}`}
          onClick={() => setFilter("level-up")}
        >
          Level Up
        </button>
        <button
          className={`filter ${filter === "machine" ? "active" : ""}`}
          onClick={() => setFilter("machine")}
        >
          Machine
        </button>
        <button
          className={`filter ${filter === "tutor" ? "active" : ""}`}
          onClick={() => setFilter("tutor")}
        >
          Tutor
        </button>
        <button
          className={`filter ${filter === "egg" ? "active" : ""}`}
          onClick={() => setFilter("egg")}
        >
          Egg
        </button>
      </div>
      <div className="moves-list">
        {data?.moves
          .filter(filterBy(filter))
          .map((pokemonMove) => ({
            ...pokemonMove,
            level: pokemonMove.version_group_details.find(
              (versionGroup) =>
                versionGroup.move_learn_method.name === "level-up"
            )?.level_learned_at,
          }))
          .sort((a, b) => (a.level || 0) - (b.level || 0))
          .map((pokemonMove, index) => (
            <MoveCard
              key={index}
              slug={pokemonMove.move.name}
              level={pokemonMove.level}
            />
          ))}
      </div>
    </div>
  );
};

export default PokemonMovesCard;
