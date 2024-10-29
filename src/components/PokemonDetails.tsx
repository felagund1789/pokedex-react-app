import { useParams } from "react-router-dom";
import "../App.css";
import usePokemonColor from "../hooks/usePokemonColor";
import usePokemonSpecies from "../hooks/usePokemonSpecies";
import OtherFormsCard from "./OtherFormsCard";
import PokemonHeaderCard from "./PokemonHeaderCard";
import PokemonSpeciesCard from "./PokemonSpeciesCard";
import PokemonStatsCard from "./PokemonStatsCard";

function PokemonDetails() {
  const { name } = useParams();
  const { data: species } = usePokemonSpecies({ slug: name! });
  const color = usePokemonColor({ slug: name! });

  return (
    <div className="pokemon-details">
      <div className="merge">
        <PokemonHeaderCard slug={name!} color={color!} />
        <PokemonSpeciesCard slug={name!} color={color!} />
      </div>
      <PokemonStatsCard slug={name!} color={color!} />
      {species?.varieties && species?.varieties.length > 1 ? (
        <OtherFormsCard slug={name!} color={color!} />
      ) : null}
    </div>
  );
}

export default PokemonDetails;
