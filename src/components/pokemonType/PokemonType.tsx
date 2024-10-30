import icons from "../../assets/types";
import "./PokemonType.css";

interface PokemonTypeProps {
  children: string | undefined;
}

const PokemonType = ({ children: type }: PokemonTypeProps) => {
  return (
    <div className={`pokemon-type ${type}`}>
      <img src={icons[type as keyof typeof icons]} alt={type} />
      {type}
    </div>
  );
};

export default PokemonType;
