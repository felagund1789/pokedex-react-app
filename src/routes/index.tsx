import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/Layout";
import PokemonDetails from "../components/PokemonDetails";
import PokemonList from "../components/PokemonList";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <PokemonList /> },
      { path: "/pokemon/:name", element: <PokemonDetails /> },
    ],
  },
]);

export default router;
