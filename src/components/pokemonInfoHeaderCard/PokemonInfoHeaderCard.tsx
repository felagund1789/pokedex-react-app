import { Pokemon, PokemonForm, PokemonSpecies } from "pokeapi-js-wrapper";
import PokemonNumber from "../PokemonNumber";
import PokemonType from "../pokemonType/PokemonType";
import "./PokemonInfoHeaderCard.css";
import usePokemonStore from "../../store";
import { useEffect, useState } from "react";
import pokedex from "../../services/pokedexService";
import usePokemonColor from "../../hooks/usePokemonColor";

interface Props {
  slug: string;
}

const artworkBaseURL = import.meta.env.VITE_POKEMON_ARTWORK_BASE_URL;

const PokemonInfoHeaderCard = ({ slug }: Props) => {
  const language = usePokemonStore((state) => state.language);
  const [pokemon, setPokemon] = useState<Pokemon>({} as Pokemon);
  const [pokemonGenera, setPokemonGenera] = useState<string>();
  const [pokedexNumber, setPokedexNumber] = useState<number>();
  const [pokemonName, setPokemonName] = useState<string>();
  const [pokemonFormName, setPokemonFormName] = useState<string>();

  useEffect(() => {
    pokedex.getPokemonByName(slug).then(async (data) => {
      const species: PokemonSpecies = await pokedex.resource(data.species.url);
      const form: PokemonForm = await pokedex.getPokemonFormByName(
        data.forms[0].name,
      );
      setPokemon(data);
      setPokemonGenera(
        species.genera.find((g) => g.language.name === "en")?.genus,
      );
      setPokedexNumber(
        species.pokedex_numbers.find((n) => n.pokedex.name === "national")
          ?.entry_number,
      );
      setPokemonName(
        species.names.find((n) => n.language.name === language)?.name,
      );
      setPokemonFormName(
        form.names.find((f) => f.language.name === language)?.name,
      );
    });
  }, [language, slug]);

  const color = usePokemonColor({ slug });

  const imgUrl = pokemon?.id ? `${artworkBaseURL}${pokemon.id}.png` : "";
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
            {pokemon.types?.map((pokemonType) => (
              <PokemonType key={pokemonType.type.name}>
                {pokemonType.type.name}
              </PokemonType>
            ))}
          </div>
        </div>
        <div className="pokemon-info-header-card__image-background">
          <img src={imgUrl} alt={pokemonFormName ?? pokemonName} />
        </div>
      </div>
    </div>
  );
};

export default PokemonInfoHeaderCard;
