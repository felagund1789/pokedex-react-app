import { createBrowserRouter } from "react-router-dom";
import PokemonList from "./components/pokemonList/PokemonList";
import Layout from "./pages/Layout";
import PokemonDetailsPage from "./pages/PokemonDetailsPage";
import ErrorPage from "./pages/ErrorPage";
import TypesPage from "./pages/TypesPage";
import TypePage from "./pages/TypePage";
import MovesPage from "./pages/MovesPage";
import ItemsPage from "./pages/ItemsPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <PokemonList /> },
      { path: "moves", element: <MovesPage /> },
      { path: "items", element: <ItemsPage /> },
      { path: "types", element: <TypesPage /> },
      { path: "types/:type", element: <TypePage /> },
      { path: "type/:type/:type2", element: <TypePage /> },
      {
        path: "pokemon/:name",
        element: <PokemonDetailsPage />,
      },
    ],
  },
]);

export default router;
