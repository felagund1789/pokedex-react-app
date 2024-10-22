import "./App.css";
import pokemon from "./assets/data/pokemon.json";
import PokemonCard from "./components/PokemonCard";

function App() {
  return (
    <>
      <header>
        <h1>Pokedex</h1>
      </header>
      <main>
        {pokemon.results.map((pokemon, index) => (
          <PokemonCard key={index} pokedexNo={index + 1} pokemon={pokemon} />
        ))}
      </main>
    </>
  );
}

export default App;
