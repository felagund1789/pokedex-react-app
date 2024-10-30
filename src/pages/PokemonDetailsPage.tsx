import { useEffect } from "react";
import { NavLink, Outlet, useParams } from "react-router-dom";
import PokemonInfoCard from "../components/pokemonInfoCard/PokemonInfoCard";
import usePokemonColor from "../hooks/usePokemonColor";
import "../App.css";

function PokemonDetailsPage() {
  const { name } = useParams();
  const color = usePokemonColor({ slug: name! });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!name) {
    return null;
  }

  return (
    <div className="pokemon-details" style={{ backgroundColor: `${color}` }}>
      <PokemonInfoCard slug={name} />
      <div className="pokemon-details-buttons">
        <NavLink to={`/pokemon/${name}/stats`}>Stats</NavLink>
        <NavLink to={`/pokemon/${name}/forms`}>Forms</NavLink>
        <NavLink to={`/pokemon/${name}/moves`}>Moves</NavLink>
      </div>
      <div className="pokemon-details-outlet">
        <Outlet />
      </div>
    </div>
  );
}

export default PokemonDetailsPage;
