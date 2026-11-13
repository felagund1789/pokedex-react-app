import usePokemonColor from "../../hooks/usePokemonColor";
import usePokemonInfo from "../../hooks/usePokemonInfo";
import PokemonNumber from "../PokemonNumber";
import PokemonType from "../pokemonType/PokemonType";
import "./PokemonCard.css";
import Generation from "../generation/Generation";

interface PokemonCardProps {
  slug: string;
  onClick?: () => void;
}

const PokemonCard = ({ slug, onClick }: PokemonCardProps) => {
  const {
    pokedexNumber,
    pokemonName,
    pokemonFormName,
    generation,
    types,
    artworkURL,
    loading,
    error,
  } = usePokemonInfo(slug);

  const color = usePokemonColor({ slug });

  return (
    <div
      className="pokemon-card"
      style={color ? { backgroundColor: color } : undefined}
      onClick={onClick}
    >
      {generation && <Generation>{generation}</Generation>}
      <div className="pokemon-image-background">
        <PokemonNumber>{pokedexNumber}</PokemonNumber>
        {loading && <div className="image"></div>}
        {!loading && artworkURL && (
          <img className="image" src={artworkURL} alt={pokemonFormName || pokemonName} />
        )}
        {!loading && !artworkURL && <div className="image">Artwork unavailable</div>}
      </div>
      <div className="pokemon-title">
        <div className="types">
          {types?.map((pokemonType, index) => {
            return <PokemonType key={index}>{pokemonType}</PokemonType>;
          })}
        </div>
        <h2>
          {pokemonFormName && pokemonFormName?.trim().length > 0
            ? pokemonFormName
            : pokemonName}
        </h2>
        {error && <div role="alert">Unable to load Pokémon: {error.message}</div>}
      </div>
    </div>
  );
};

export default PokemonCard;
