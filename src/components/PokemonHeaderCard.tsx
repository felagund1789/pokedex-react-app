import { useRef } from "react";
import usePokedexNumber from "../hooks/usePokedexNumber";
import usePokemon from "../hooks/usePokemon";
import usePokemonName from "../hooks/usePokemonName";
import PokemonNumber from "./PokemonNumber";
import PokemonType from "./PokemonType";
import usePokemonGenera from "../hooks/usePokemonGenera";
import usePokemonFormName from "../hooks/usePokemonFormName";

interface Props {
  slug: string;
  color?: string;
}

const artworkBaseURL = import.meta.env.VITE_POKEMON_ARTWORK_BASE_URL;

const PokemonHeaderCard = ({ slug, color }: Props) => {
  const { data: pokemon } = usePokemon({ slug });
  const pokedexNumber = usePokedexNumber({ slug });
  const pokemonName = usePokemonName({ slug });
  const pokemonFormName = usePokemonFormName({ slug });
  const pokemonGenera = usePokemonGenera({ slug });

  const cardRef = useRef<HTMLDivElement>(null);
  const imgUrl = `${artworkBaseURL}${pokemon?.id}.png`;

  if (cardRef.current && color) {
    cardRef.current.style.backgroundColor = color;
  }

  return (
    <div className="pokemon-card header" ref={cardRef}>
      <div className="pokemon-info">
        <div className="pokemon-title">
          <h2>{pokemonFormName ?? pokemonName}</h2>
          <PokemonNumber>{pokedexNumber}</PokemonNumber>
        </div>
        <div className="pokemon-genera">
          <h3>{pokemonGenera}</h3>
        </div>
        <div className="pokemon-types">
          {pokemon?.types.map((pokemonType, index) => {
            return (
              <PokemonType key={index}>{pokemonType.type.name}</PokemonType>
            );
          })}
        </div>
      </div>
      <div className="pokemon-image-background">
        <img src={imgUrl} alt={pokemonFormName ?? pokemonName} />
      </div>
    </div>
  );
};

export default PokemonHeaderCard;
