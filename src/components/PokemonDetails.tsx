import { useParams } from "react-router-dom";
import "../App.css";
import useColorThief from "../hooks/useColorThief";
import usePokemon from "../hooks/usePokemon";
import PokemonHeaderCard from "./PokemonHeaderCard";
import PokemonSpeciesCard from "./PokemonSpeciesCard";
import PokemonStatsCard from "./PokemonStatsCard";
import OtherFormsCard from "./OtherFormsCard";
import usePokemonSpecies from "../hooks/usePokemonSpecies";

const artworkBaseURL = import.meta.env.VITE_POKEMON_ARTWORK_BASE_URL;

function PokemonDetails() {
  const { name } = useParams();
  const { data: pokemon } = usePokemon({ slug: name! });
  const { data: species } = usePokemonSpecies({ slug: name! });
  const imgUrl = `${artworkBaseURL}${pokemon?.id}.png`;
  const { color } = useColorThief(imgUrl);

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
