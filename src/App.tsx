import "./App.css";
import Header from "./components/Header";
import PokemonList from "./components/pokemonList/PokemonList";

function App() {
  return (
    <>
      <Header />
      <main>
        <PokemonList />
      </main>
    </>
  );
}

export default App;
