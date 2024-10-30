import { useEffect } from "react";
import { useParams } from "react-router-dom";
import PokemonStatsCard from "../components/PokemonStatsCard";
import "../App.css";

function PokemonStatsPage() {
  const { name } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!name) {
    return null;
  }

  return <PokemonStatsCard slug={name} />;
}

export default PokemonStatsPage;
