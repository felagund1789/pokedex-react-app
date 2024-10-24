import PokemonNumber from "./PokemonNumber";

const PokemonCardSkeleton = () => {
  return (
    <div className="pokemon-card">
      <div className="pokemon-image-background">
        <PokemonNumber>{undefined}</PokemonNumber>
        <div style={{ width: 150, height: 150 }}></div>
      </div>
      <div></div>
      <h2></h2>
    </div>
  );
};

export default PokemonCardSkeleton;
