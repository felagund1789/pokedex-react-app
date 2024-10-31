import { useEffect } from "react";
import { useParams } from "react-router-dom";
import EvolutionChain from "../components/evolutionChain/EvolutionChain";
import "../App.css";

function PokemonEvolutionPage() {
  const { name } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!name) {
    return null;
  }

  return <EvolutionChain slug={name} />;
}

export default PokemonEvolutionPage;
