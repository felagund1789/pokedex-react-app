import PokemonNumber from "../PokemonNumber";
import PokemonType from "../pokemonType/PokemonType";
import "./PokemonInfoHeaderCard.css";
import usePokemonStore from "../../store";
import { useState } from "react";
import PokemonImageModal from "../pokemonImageModal/PokemonImageModal";
import usePokemonColor from "../../hooks/usePokemonColor";
import useResolvedPokemon from "../../hooks/useResolvedPokemon";
import usePokemonSpecies from "../../hooks/usePokemonSpecies";
import { formArtwork } from "../../services/pokemonResolver";
import { pokemonFormName as getFormName } from "../../utils/pokemonFormName";

interface Props {
  slug: string;
  selectedForm?: string | null;
}

const PokemonInfoHeaderCard = ({ slug, selectedForm = null }: Props) => {
  const language = usePokemonStore((state) => state.language);
  const resolved = useResolvedPokemon(slug, selectedForm);
  const species = usePokemonSpecies({ slug });
  const pokemon = resolved.data?.pokemon;
  const form = resolved.data?.form;
  const pokemonGenera = species.data?.genera.find((entry) => entry.language.name === "en")?.genus;
  const pokedexNumber = species.data?.pokedex_numbers.find((entry) => entry.pokedex.name === "national")?.entry_number;
  const pokemonName = species.data?.names.find((entry) => entry.language.name === language)?.name;
  const pokemonFormName = getFormName(form, language, pokemonName, Boolean(form && !form.is_default));
  const [isZoomed, setIsZoomed] = useState(false);

  const color = usePokemonColor({ slug });

  const imgUrl = pokemon && form ? formArtwork(form, pokemon) : undefined;
  const types = form?.types?.length ? form.types : pokemon?.types;
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
          <div className="pokemon-info-header-card__types">
            {types?.map((pokemonType) => (
              <PokemonType key={pokemonType.type.name}>
                {pokemonType.type.name}
              </PokemonType>
            ))}
          </div>
        </div>
        <div className="pokemon-info-header-card__image-background">
          {imgUrl ? <img
            src={imgUrl}
            alt={pokemonFormName ?? pokemonName}
            onClick={() => imgUrl && setIsZoomed(true)}
            style={{ cursor: "zoom-in" }}
          /> : resolved.data && <div>Artwork unavailable</div>}
          {(resolved.error || species.error) && <div role="alert">Unable to load Pokémon: {(resolved.error ?? species.error)?.message}</div>}
        </div>
      </div>
      {isZoomed && imgUrl && (
        <PokemonImageModal
          src={imgUrl}
          alt={pokemonFormName ?? pokemonName}
          onClose={() => setIsZoomed(false)}
        />
      )}
    </div>
  );
};

export default PokemonInfoHeaderCard;
