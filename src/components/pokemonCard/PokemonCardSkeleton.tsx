import PokemonNumber from "../PokemonNumber";
import "./PokemonCard.css";

const PokemonCardSkeleton = () => {
  return (
    <div className="pokemon-card">
      <div className="pokemon-image-background">
        <PokemonNumber>{undefined}</PokemonNumber>
        <div style={{ width: 150, height: 150 }}></div>
      </div>
      <div className="pokemon-card-info">
        <div className="pokemon-title">
          <div></div>
          <h2></h2>
        </div>
      </div>
    </div>
  );
};

export default PokemonCardSkeleton;
