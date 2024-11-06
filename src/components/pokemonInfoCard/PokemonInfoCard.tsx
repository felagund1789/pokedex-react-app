import { Pokemon, PokemonForm, PokemonSpecies } from "pokeapi-js-wrapper";
import { useEffect, useRef, useState } from "react";
import usePokemonColor from "../../hooks/usePokemonColor";
import usePokemonDescription from "../../hooks/usePokemonDescription";
import pokedex from "../../services/pokedexService";
import PokemonNumber from "../PokemonNumber";
import PokemonType from "../pokemonType/PokemonType";
import StatPanel from "../statPanel/StatPanel";
import "./PokemonInfoCard.css";

interface Props {
  slug: string;
}

const artworkBaseURL = import.meta.env.VITE_POKEMON_ARTWORK_BASE_URL;

const PokemonInfoCard = ({ slug }: Props) => {
  const [pokemon, setPokemon] = useState<Pokemon>({} as Pokemon);
  const [species, setSpecies] = useState<PokemonSpecies>({} as PokemonSpecies);
  const [pokemonGenera, setPokemonGenera] = useState<string>();
  const [pokedexNumber, setPokedexNumber] = useState<number>();
  const [pokemonName, setPokemonName] = useState<string>();
  const [pokemonFormName, setPokemonFormName] = useState<string>();
  const [habitat, setHabitat] = useState<string>();
  
  useEffect(() => {
    pokedex.getPokemonByName(slug).then(async (data) => {
      const species: PokemonSpecies = await pokedex.resource(data.species.url);
      const form: PokemonForm = await pokedex.getPokemonFormByName(slug);
      const habitat = species?.habitat ? await pokedex.resource(species?.habitat.url) : undefined;
      setPokemon(data);
      setSpecies(species);
      setPokemonGenera(species.genera.find((g) => g.language.name === "en")?.genus);
      setPokedexNumber(species.pokedex_numbers.find((n) => n.pokedex.name === "national")?.entry_number);
      setPokemonName(species.names.find((n) => n.language.name === "en")?.name);
      setPokemonFormName(form.names.find((f) => f.language.name === "en")?.name);
      setHabitat(habitat?.name);
    });
  }, [slug]);
  
  const color = usePokemonColor({ slug });
  const pokemonDescription = usePokemonDescription({ species });

  const cardRef = useRef<HTMLDivElement>(null);
  const imgUrl = pokemon?.id ? `${artworkBaseURL}${pokemon.id}.png` : "";

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
            {pokemon?.types?.map((pokemonType, index) => {
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
        {species?.base_happiness && (
          <StatPanel title="Base Happiness">{species.base_happiness}</StatPanel>
        )}
        {species?.capture_rate && (
          <StatPanel title="Capture Rate">{species.capture_rate}</StatPanel>
        )}
        {species?.hatch_counter && (
          <StatPanel title="Hatch Counter">{species.hatch_counter}</StatPanel>
        )}
        {habitat && <StatPanel title="Habitat">{habitat}</StatPanel>}
      </div>
    </div>
  );
};

export default PokemonInfoCard;
