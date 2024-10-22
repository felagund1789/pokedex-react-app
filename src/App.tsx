import "./App.css";
import PokemonCard from "./components/PokemonCard";
import usePokemon from "./hooks/usePokemon";

function App() {
  const { data: pokemon, isLoading, error } = usePokemon();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <>
      <header>
        <h1>Pokedex</h1>
      </header>
      <main>
        {pokemon.map((pokemon, index) => (
          <PokemonCard key={index} pokemon={pokemon} />
        ))}
      </main>
    </>
  );
}

export default App;
