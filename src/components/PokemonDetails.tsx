import { useParams } from "react-router-dom";
import "../App.css";
import useColorThief from "../hooks/useColorThief";
import usePokemon from "../hooks/usePokemon";
import PokemonHeaderCard from "./PokemonHeaderCard";

const artworkBaseURL = import.meta.env.VITE_POKEMON_ARTWORK_BASE_URL;

function PokemonDetails() {
  const { name } = useParams();
  const { data: pokemon } = usePokemon({ slug: name! });
  const imgUrl = `${artworkBaseURL}${pokemon?.id}.png`;
  const { color } = useColorThief(imgUrl);

  return (
    <div className="pokemon-details">
      <PokemonHeaderCard slug={name!} color={color!} />
    </div>
  );
}

export default PokemonDetails;
