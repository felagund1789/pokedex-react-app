import { useEffect } from "react";
import { useParams } from "react-router-dom";
import PokemonMoves from "../components/pokemonMoves/PokemonMoves";
import "../App.css";

function PokemonMovesPage() {
  const { name } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!name) {
    return null;
  }

  return <PokemonMoves slug={name} />;
}

export default PokemonMovesPage;
