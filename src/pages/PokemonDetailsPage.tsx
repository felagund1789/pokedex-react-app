import { useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";
import PokemonInfoCard from "../components/pokemonInfoCard/PokemonInfoCard";
import "../App.css";

function PokemonDetailsPage() {
  const { name } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!name) {
    return null;
  }

  return (
    <div className="pokemon-details">
      <PokemonInfoCard slug={name} />
      <div className="pokemon-details-outlet">
        <Outlet />
      </div>
    </div>
  );
}

export default PokemonDetailsPage;
