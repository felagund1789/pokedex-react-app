import "./App.css";
import PokemonCard from "./components/PokemonCard";
import usePokemon from "./hooks/usePokemon";
import pokemonLogo from "./assets/logo.png";

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
        <img src={pokemonLogo} alt="Pokedex" height={128} />
      </header>
      <main>
        {pokemon?.results.map((pokemon, index) => (
          <PokemonCard key={index} pokemon={pokemon} />
        ))}
      </main>
    </>
  );
}

export default App;
