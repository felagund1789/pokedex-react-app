import { useParams } from "react-router-dom";
import "../App.css";
// import usePokemonSpecies from "../hooks/usePokemonSpecies";
import usePokedexNumber from "../hooks/usePokedexNumber";
import usePokemonName from "../hooks/usePokemonName";
import { useRef } from "react";
import usePokemon from "../hooks/usePokemon";
import useColorThief from "../hooks/useColorThief";
import PokemonNumber from "./PokemonNumber";
import PokemonType from "./PokemonType";

const artworkBaseURL = import.meta.env.VITE_POKEMON_ARTWORK_BASE_URL;

function PokemonDetails() {
  const { name } = useParams();
  const { data: pokemon } = usePokemon({ slug: name! });
  // const { data: pokemonSpecies } = usePokemonSpecies({ slug: name! });
  const pokedexNumber = usePokedexNumber({ slug: name! });
  const pokemonName = usePokemonName({ slug: name! });

  const cardRef = useRef<HTMLDivElement>(null);
  const imgUrl = `${artworkBaseURL}${pokemon?.id}.png`;
  const { color } = useColorThief(imgUrl);

  if (cardRef.current && color) {
    cardRef.current.style.backgroundColor = color;
  }

  return (
    <div className="pokemon-details">
      <div className="pokemon-info">
        <div className="pokemon-card" ref={cardRef}>
          <div className="pokemon-image-background">
            <PokemonNumber>{pokedexNumber}</PokemonNumber>
            <img
              crossOrigin="anonymous"
              src={imgUrl}
              alt={pokemonName}
              height={150}
              width={150}
            />
          </div>
          <div>
            {pokemon?.types.map((pokemonType, index) => {
              return <PokemonType key={index}>{pokemonType.type.name}</PokemonType>;
            })}
          </div>
          <h2>{pokemonName}</h2>
        </div>
      </div>
    </div>
  );
}

export default PokemonDetails;
