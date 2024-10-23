import usePokemon from "../hooks/usePokemon";
import PokemonCard from "./PokemonCard";

const PokemonList = () => {
  const { data: pokemon, isLoading, error } = usePokemon();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="pokemon-list">
      {pokemon?.results.map((pokemon, index) => (
        <PokemonCard key={index} pokemon={pokemon} />
      ))}
    </div>
  );
};

export default PokemonList;
