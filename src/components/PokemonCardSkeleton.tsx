import PokemonNumber from "./PokemonNumber";
import PokemonType from "./PokemonType";

const PokemonCardSkeleton = () => {
  return (
    <div className="pokemon-card">
      <div className="pokemon-image-background">
        <PokemonNumber>{undefined}</PokemonNumber>
        <div style={{ width: 150, height: 150 }}></div>
      </div>
      <div>
        <PokemonType>{""}</PokemonType>
      </div>
      <h2></h2>
    </div>
  );
};

export default PokemonCardSkeleton;
