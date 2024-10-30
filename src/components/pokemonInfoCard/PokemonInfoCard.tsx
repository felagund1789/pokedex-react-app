import { useRef } from "react";
import usePokedexNumber from "../../hooks/usePokedexNumber";
import usePokemon from "../../hooks/usePokemon";
import usePokemonDescription from "../../hooks/usePokemonDescription";
import usePokemonFormName from "../../hooks/usePokemonFormName";
import usePokemonGenera from "../../hooks/usePokemonGenera";
import usePokemonName from "../../hooks/usePokemonName";
import usePokemonSpecies from "../../hooks/usePokemonSpecies";
import useResourceName from "../../hooks/useResourceName";
import "./PokemonInfoCard.css";
import PokemonNumber from "../PokemonNumber";
import PokemonType from "../PokemonType";
import StatPanel from "../StatPanel";

interface Props {
  slug: string;
  color?: string;
}

const artworkBaseURL = import.meta.env.VITE_POKEMON_ARTWORK_BASE_URL;

const PokemonInfoCard = ({ slug, color }: Props) => {
  const { data: pokemon } = usePokemon({ slug });
  const { data } = usePokemonSpecies({ slug });
  const pokedexNumber = usePokedexNumber({ slug });
  const pokemonName = usePokemonName({ slug });
  const pokemonFormName = usePokemonFormName({ slug });
  const pokemonGenera = usePokemonGenera({ slug });
  const pokemonDescription = usePokemonDescription({ slug });
  const { data: habitat } = useResourceName(data?.habitat);

  const cardRef = useRef<HTMLDivElement>(null);
  const imgUrl = `${artworkBaseURL}${pokemon?.id}.png`;

  if (cardRef.current && color) {
    cardRef.current.style.backgroundColor = color;
  }

  return (
    <div className="pokemon-info-card" ref={cardRef}>
      <div className="pokemon-header">
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
      <div className="pokemon-description">{pokemonDescription}</div>
      <div className="info">
        {pokemon?.base_experience && (
          <StatPanel title="Base Experience">
            {pokemon.base_experience}
          </StatPanel>
        )}
        {data?.base_happiness && (
          <StatPanel title="Base Happiness">{data.base_happiness}</StatPanel>
        )}
        {data?.capture_rate && (
          <StatPanel title="Capture Rate">{data.capture_rate}</StatPanel>
        )}
        {data?.hatch_counter && (
          <StatPanel title="Hatch Counter">{data.hatch_counter}</StatPanel>
        )}
        {habitat && <StatPanel title="Habitat">{habitat}</StatPanel>}
      </div>
    </div>
  );
};

export default PokemonInfoCard;
