import { useEffect, useRef, useState } from "react";
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
    pokemon,
    types,
    artworkURL
  } = usePokemonInfo(slug);

  const [isZoomed, setIsZoomed] = useState(false);
  const [failedCry, setFailedCry] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const cryURL = pokemon?.cries?.latest || pokemon?.cries?.legacy;
  const cryKey = `${slug}:${cryURL}`;

  const color = usePokemonColor({ slug });

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio?.pause();
    };
  }, [slug, cryURL]);

  const playCry = () => {
    const audio = audioRef.current;
    if (!audio || !cryURL) return;
    setFailedCry(null);
    audio.currentTime = 0;
    void audio.play().catch(() => setFailedCry(cryKey));
  };

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
          <div className="pokemon-info-header-card__cry">
            <button aria-label="Play cry" type="button" onClick={playCry} disabled={!cryURL} title={cryURL ? "Play cry" : "Cry unavailable"}>
              <svg xmlns="http://w3.org" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
              </svg>
            </button>
            {cryURL && <audio key={cryKey} ref={audioRef} src={cryURL} preload="none" onError={() => setFailedCry(cryKey)} />}
            {cryURL && failedCry === cryKey && <span role="alert">Could not play cry.</span>}
          </div>
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
