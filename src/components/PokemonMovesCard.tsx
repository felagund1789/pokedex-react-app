import usePokemon from "../hooks/usePokemon";
import MoveCard from "./MoveCard";

interface Props {
  slug: string;
  color?: string;
}

const PokemonMovesCard = ({ slug }: Props) => {
  const { data } = usePokemon({ slug });

  return (
    <div className="pokemon-moves">
      <h2 className="title">Moves</h2>
      <div className="moves-list">
        {data?.moves
          .map((pokemonMove, index) => (
            <MoveCard
              key={index}
              slug={pokemonMove.move.name}
            />
          ))}
      </div>
    </div>
  );
};

export default PokemonMovesCard;
