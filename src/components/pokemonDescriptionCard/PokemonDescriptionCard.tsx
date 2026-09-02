import { useEffect, useState } from "react";
import usePokemonStore from "../../store";
import "./PokemonDescriptionCard.css";
import { PokemonSpecies } from "pokeapi-js-wrapper";
import pokedex from "../../services/pokedexService";
import usePokemonDescription from "../../hooks/usePokemonDescription";

interface Props {
  slug: string;
}

const PokemonDescriptionCard = ({ slug }: Props) => {
  const language = usePokemonStore((state) => state.language);
  const [species, setSpecies] = useState<PokemonSpecies>({} as PokemonSpecies);

  useEffect(() => {
    pokedex.getPokemonByName(slug).then(async (data) => {
      const species: PokemonSpecies = await pokedex.resource(data.species.url);
      setSpecies(species);
    });
  }, [language, slug]);

  const pokemonDescription = usePokemonDescription({ species });

  return (
    <div className="pokemon-description-card">
      <p>{pokemonDescription}</p>
    </div>
  );
};

export default PokemonDescriptionCard;
