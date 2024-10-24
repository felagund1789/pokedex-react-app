import { useParams } from "react-router-dom";
import "../App.css";

function PokemonDetails() {
  const { name } = useParams();

  return <div className="pokemon-details">{name}</div>;
}

export default PokemonDetails;
