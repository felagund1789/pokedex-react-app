import { createBrowserRouter } from "react-router-dom";
import PokemonList from "./components/pokemonList/PokemonList";
import Layout from "./pages/Layout";
import PokemonDetailsPage from "./pages/PokemonDetailsPage";
import ErrorPage from "./pages/ErrorPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <PokemonList /> },
      {
        path: "pokemon/:name",
        element: <PokemonDetailsPage />,
      },
    ],
  },
]);

export default router;
