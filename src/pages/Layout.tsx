import { BrowserRouter, Route, Routes } from "react-router-dom";
import PokemonList from "../components/pokemonList/PokemonList";
import PokemonDetailsPage from "./PokemonDetailsPage";
import PokemonEvolutionPage from "./PokemonEvolutionPage";
import PokemonFormsPage from "./PokemonFormsPage";
import PokemonMovesPage from "./PokemonMovesPage";
import PokemonStatsPage from "./PokemonStatsPage";
import "../App.css";

function Layout() {
  return (
    <>
      <BrowserRouter basename="/">
        <Routes>
          <Route path="/" element={<PokemonList />} />
          <Route path="pokemon/:name" element={<PokemonDetailsPage />}>
            <Route path="stats" element={<PokemonStatsPage />} />
            <Route path="evolution" element={<PokemonEvolutionPage />} />
            <Route path="moves" element={<PokemonMovesPage />} />
            <Route path="forms" element={<PokemonFormsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default Layout;
