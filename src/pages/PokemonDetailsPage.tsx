import { useEffect } from "react";
import { NavLink, Outlet, useParams } from "react-router-dom";
import PokemonInfoCard from "../components/pokemonInfoCard/PokemonInfoCard";
import "../App.css";
import usePokemonColor from "../hooks/usePokemonColor";

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
    <div className="pokemon-details">
      <PokemonInfoCard slug={name} />
      <div
        className="pokemon-details-buttons"
        style={{ backgroundColor: `${color}` }}
      >
        <NavLink to={`/pokemon/${name}/stats`}>Stats</NavLink>
        <NavLink to={`/pokemon/${name}/forms`}>Forms</NavLink>
        <NavLink to={`/pokemon/${name}/moves`}>Moves</NavLink>
      </div>
      <div
        className="pokemon-details-outlet"
        style={{ backgroundColor: `${color}` }}
      >
        <Outlet />
      </div>
    </div>
  );
}

export default PokemonDetailsPage;
