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
        {!loading && (
          <img className="image" src={artworkURL} alt={pokemonName} />
        )}
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
      </div>
    </div>
  );
};

export default PokemonCard;
