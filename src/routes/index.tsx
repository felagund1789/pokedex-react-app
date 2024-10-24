import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Layout from "../components/Layout";
import PokemonDetails from "../components/PokemonDetails";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <App /> },
      { path: "/pokemon/:name", element: <PokemonDetails /> },
    ],
  },
]);

export default router;
