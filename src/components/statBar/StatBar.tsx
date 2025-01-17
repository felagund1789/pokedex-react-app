import { StatElement } from "pokeapi-js-wrapper";
import { useEffect, useState } from "react";
import useResourceName from "../../hooks/useResourceName";
import "./StatBar.css";

interface Props {
  pokemonStat: StatElement;
}

const StatBar = ({ pokemonStat }: Props) => {
  const { data } = useResourceName(pokemonStat.stat);
  const [value, setValue] = useState(0);

  useEffect(() => {
    setValue(pokemonStat.base_stat);
  }, [pokemonStat.base_stat]);

  return (
    <div className={`stat-bar ${pokemonStat.stat.name}`}>
      <h4>{data}</h4>
      <p style={{ width: `${value / 8}rem` }}>{value}</p>
    </div>
  );
};

export default StatBar;
