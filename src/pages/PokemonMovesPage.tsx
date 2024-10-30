import { useEffect } from "react";
import { useParams } from "react-router-dom";
import PokemonMovesCard from "../components/PokemonMovesCard";
import "../App.css";

function PokemonMovesPage() {
  const { name } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!name) {
    return null;
  }

  return <PokemonMovesCard slug={name} />;
}

export default PokemonMovesPage;
