import { createBrowserRouter } from "react-router-dom";
import PokemonList from "./components/pokemonList/PokemonList";
import Layout from "./pages/Layout";
import PokemonDetailsPage from "./pages/PokemonDetailsPage";
import ErrorPage from "./pages/ErrorPage";
import TypesPage from "./pages/TypesPage";
import TypePage from "./pages/TypePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <PokemonList /> },
      { path: "types", element: <TypesPage /> },
      { path: "types/:type", element: <TypePage /> },
      {
        path: "pokemon/:name",
        element: <PokemonDetailsPage />,
      },
    ],
  },
]);

export default router;
