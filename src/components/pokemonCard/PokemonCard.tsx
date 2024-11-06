import { Pokemon, PokemonForm, PokemonSpecies } from "pokeapi-js-wrapper";
import { useEffect, useRef, useState } from "react";
import usePokemonColor from "../../hooks/usePokemonColor";
import pokedex from "../../services/pokedexService";
import PokemonNumber from "../PokemonNumber";
import PokemonType from "../pokemonType/PokemonType";
import "./PokemonCard.css";

interface PokemonCardProps {
  slug: string;
  onClick?: () => void;
}

const artworkBaseURL = import.meta.env.VITE_POKEMON_ARTWORK_BASE_URL;

const PokemonCard = ({ slug, onClick }: PokemonCardProps) => {
  const [pokemon, setPokemon] = useState<Pokemon>({} as Pokemon);
  const [pokedexNumber, setPokedexNumber] = useState<number>();
  const [pokemonName, setPokemonName] = useState<string>();
  const [pokemonFormName, setPokemonFormName] = useState<string>();

  useEffect(() => {
    pokedex.getPokemonByName(slug).then(async (data) => {
      const species: PokemonSpecies = await pokedex.resource(data.species.url);
      const form: PokemonForm = await pokedex.getPokemonFormByName(slug);
      setPokemon(data);
      setPokedexNumber(species.pokedex_numbers.find((n) => n.pokedex.name === "national")?.entry_number);
      setPokemonName(species.names.find((n) => n.language.name === "en")?.name);
      setPokemonFormName(form.names.find((f) => f.language.name === "en")?.name);
    });
  }, [slug]);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const imgUrl = pokemon?.id ? `${artworkBaseURL}${pokemon.id}.png` : "";
  const color = usePokemonColor({ slug});

  if (cardRef.current && color) {
    cardRef.current.style.backgroundColor = color;
  }

  return (
    <div className="pokemon-card" ref={cardRef} onClick={onClick}>
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
      <div className="pokemon-title">
        <div className="types">
          {pokemon?.types?.map((pokemonType, index) => {
            return <PokemonType key={index}>{pokemonType.type.name}</PokemonType>;
          })}
        </div>
        <h2>{pokemonFormName ?? pokemonName}</h2>
      </div>
    </div>
  );
};

export default PokemonCard;
