import usePokemonColor from "../../hooks/usePokemonColor";
import usePokemonInfo from "../../hooks/usePokemonInfo";
import Generation from "../generation/Generation";
import PokemonNumber from "../PokemonNumber";
import PokemonSpeciesDesignation from "../pokemonSpeciesDesignation/PokemonSpeciesDesignation";
import PokemonType from "../pokemonType/PokemonType";
import "./PokemonCard.css";

interface PokemonCardProps {
  slug: string;
  onClick?: () => void;
}

const PokemonCard = ({ slug, onClick }: PokemonCardProps) => {
  const {
    pokedexNumber,
    pokemonName,
    pokemonFormName,
    pokemonSpecies,
    types,
    artworkURL,
    loading,
    error,
  } = usePokemonInfo(slug);

  const color = usePokemonColor({ slug });

  if (error) {
    return <div className="pokemon-card">Error loading {slug}: {error.message}</div>;
  }

  return (
    <div
      className="pokemon-card"
      style={color ? { backgroundColor: color } : undefined}
      onClick={onClick}
    >
      <div className="pokemon-card-info">
        <Generation>{pokemonSpecies?.generation?.name.replace("generation-", "") || ""}</Generation>
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
            <PokemonSpeciesDesignation species={pokemonSpecies} />
          </h2>
        </div>
      </div>
      <div className="pokemon-image-background">
        <PokemonNumber>{pokedexNumber}</PokemonNumber>
        {loading && <div className="image"></div>}
        {!loading && (
          <img className="image" src={artworkURL} alt={pokemonName} />
        )}
      </div>
    </div>
  );
};

export default PokemonCard;
