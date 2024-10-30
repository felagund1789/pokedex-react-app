import { createBrowserRouter } from "react-router-dom";
import PokemonList from "../components/pokemonList/PokemonList";
import Layout from "../pages/Layout";
import PokemonDetailsPage from "../pages/PokemonDetailsPage";
import PokemonStatsPage from "../pages/PokemonStatsPage";

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
        ],
      },
    ],
  },
]);

export default router;
