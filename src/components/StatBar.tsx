import useResourceName from "../hooks/useResourceName";
import { PokemonStat } from "../types";

interface Props {
  pokemonStat: PokemonStat;
}

const StatBar = ({ pokemonStat }: Props) => {
  const { data } = useResourceName(pokemonStat.stat);

  return (
    <div className={`stat-bar ${pokemonStat.stat.name}`}>
      <h4>{data}</h4>
      <p style={{ width: pokemonStat.base_stat * 2 }}>{pokemonStat.base_stat}</p>
    </div>
  );
};

export default StatBar;
