import "./App.css";
import pokemon from "./assets/data/pokemon.json";

function App() {
  return (
    <>
      <header>
        <h1>Pokedex</h1>
      </header>
      <main>
        <ul>
          {pokemon.results.map((pokemon, index) => (
            <li key={index}>{pokemon.name}</li>
          ))}
        </ul>
      </main>
    </>
  );
}

export default App;
