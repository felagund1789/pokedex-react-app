import { useState } from "react";
import usePokemonColor from "../../hooks/usePokemonColor";
import usePokemonInfo from "../../hooks/usePokemonInfo";
import PokemonImageModal from "../pokemonImageModal/PokemonImageModal";
import PokemonNumber from "../PokemonNumber";
import PokemonSpeciesDesignation from "../pokemonSpeciesDesignation/PokemonSpeciesDesignation";
import PokemonType from "../pokemonType/PokemonType";
import "./PokemonInfoHeaderCard.css";

interface Props {
  slug: string;
}

const PokemonInfoHeaderCard = ({ slug }: Props) => {
  const {
    pokedexNumber,
    pokemonName,
    pokemonFormName,
    pokemonGenera,
    pokemonSpecies,
    pokemonForm,
    types,
    artworkURL
  } = usePokemonInfo(slug);

  const [isZoomed, setIsZoomed] = useState(false);

  const color = usePokemonColor({ slug });

  return (
    <div
      className="pokemon-info-card pokemon-info-header-card"
      style={{ backgroundColor: color ?? undefined }}
    >
      <div className="pokemon-info-header-card__content">
        <div className="pokemon-info-header-card__info">
          <div className="pokemon-info-header-card__title">
            <h2>{pokemonFormName ?? pokemonName}</h2>
            <PokemonNumber>{pokedexNumber}</PokemonNumber>
          </div>
          <div className="pokemon-info-header-card__genera">
            <h3>{pokemonGenera}</h3>
          </div>
          <PokemonSpeciesDesignation species={pokemonSpecies} form={pokemonForm} />
          <div className="pokemon-info-header-card__types">
            {types?.map((type) => (
              <PokemonType key={type}>
                {type}
              </PokemonType>
            ))}
          </div>
        </div>
        <div className="pokemon-info-header-card__image-background">
          <img
            src={artworkURL}
            alt={pokemonFormName ?? pokemonName}
            onClick={() => artworkURL && setIsZoomed(true)}
            style={{ cursor: "zoom-in" }}
          />
        </div>
      </div>
      {isZoomed && (
        <PokemonImageModal
          src={artworkURL || ""}
          alt={pokemonFormName ?? pokemonName}
          onClose={() => setIsZoomed(false)}
        />
      )}
    </div>
  );
};

export default PokemonInfoHeaderCard;
