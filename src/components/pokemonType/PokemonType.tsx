import icons from "../../assets/types";
import { Link } from "react-router-dom";
import "./PokemonType.css";

interface PokemonTypeProps {
  children: string | undefined;
}

const PokemonType = ({ children: type }: PokemonTypeProps) => {
  if (!type) {
    return null;
  }

  return (
    <Link
      className={`pokemon-type ${type}`}
      to={`/types/${encodeURIComponent(type)}`}
      onClick={(event) => event.stopPropagation()}
    >
      <img src={icons[type as keyof typeof icons]} alt="" />
      {type}
    </Link>
  );
};

export default PokemonType;
