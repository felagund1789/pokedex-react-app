import { useEffect, useState } from "react";
import usePokemonStore from "../../store";
import { Pokemon, PokemonSpecies, Generation } from "pokeapi-js-wrapper";
import pokedex from "../../services/pokedexService";
import StatPanel from "../statPanel/StatPanel";
import "./PokemonInfoDetailsCard.css";

interface Props {
  slug: string;
}

const PokemonInfoDetailsCard = ({ slug }: Props) => {
  const language = usePokemonStore((state) => state.language);
  const [pokemon, setPokemon] = useState<Pokemon>({} as Pokemon);
  const [species, setSpecies] = useState<PokemonSpecies>({} as PokemonSpecies);
  const [generation, setGeneration] = useState<string>();
  const [habitat, setHabitat] = useState<string>();

  useEffect(() => {
    pokedex.getPokemonByName(slug).then(async (data) => {
      const species: PokemonSpecies = await pokedex.resource(data.species.url);
      const habitat = species?.habitat
        ? await pokedex.resource(species?.habitat.url)
        : undefined;
      const gen: Generation = species?.generation
        ? await pokedex.resource(species?.generation.url)
        : undefined;
      setPokemon(data);
      setSpecies(species);
      setGeneration(gen.names.find((g) => g.language.name === "en")?.name);
      setHabitat(habitat?.name);
    });
  }, [language, slug]);

  return (
    <div className="pokemon-info-details-card">
      <div className="pokemon-info-details-card__info">
        {Boolean(pokemon.base_experience) && (
          <StatPanel title="Base Experience">
            {pokemon.base_experience}
          </StatPanel>
        )}
        {Boolean(species.base_happiness) && (
          <StatPanel title="Base Happiness">{species.base_happiness}</StatPanel>
        )}
        {Boolean(species.capture_rate) && (
          <StatPanel title="Capture Rate">{species.capture_rate}</StatPanel>
        )}
        {Boolean(species.hatch_counter) && (
          <StatPanel title="Hatch Counter">{species.hatch_counter}</StatPanel>
        )}
        {habitat && <StatPanel title="Habitat">{habitat}</StatPanel>}
        {generation && <StatPanel title="Generation">{generation}</StatPanel>}
      </div>
    </div>
  );
};

export default PokemonInfoDetailsCard;
