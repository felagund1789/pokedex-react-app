import { createBrowserRouter } from "react-router-dom";
import PokemonList from "./components/pokemonList/PokemonList";
import Layout from "./pages/Layout";
import PokemonDetailsPage from "./pages/PokemonDetailsPage";
import PokemonFormsPage from "./pages/PokemonFormsPage";
import PokemonMovesPage from "./pages/PokemonMovesPage";
import PokemonStatsPage from "./pages/PokemonStatsPage";
import PokemonEvolutionPage from "./pages/PokemonEvolutionPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <PokemonList /> },
      {
        path: "/pokemon/:name",
        element: <PokemonDetailsPage />,
        children: [
          {
            index: true,
            path: "stats",
            element: <PokemonStatsPage />,
          },
          {
            path: "forms",
            element: <PokemonFormsPage />,
          },
          {
            path: "moves",
            element: <PokemonMovesPage />,
          },
          {
            path: "evolution",
            element: <PokemonEvolutionPage />,
          },
        ],
      },
    ],
  },
]);

export default router;
