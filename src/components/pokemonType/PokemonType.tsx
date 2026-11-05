import icons from "../../assets/types";
import "./PokemonType.css";

interface PokemonTypeProps {
  children: string | undefined;
}

const PokemonType = ({ children: type }: PokemonTypeProps) => {
  return (
    <span className={`pokemon-type ${type}`}>
      <img src={icons[type as keyof typeof icons]} alt={type} />
      {type}
    </span>
  );
};

export default PokemonType;
