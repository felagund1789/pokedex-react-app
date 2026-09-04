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
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    pokedex.getPokemonByName(slug).then(async (data) => {
      const species: PokemonSpecies = await pokedex.resource(data.species.url);
      setSpecies(species);
    });
  }, [language, slug]);

  const descriptions = usePokemonDescription({ species });

  useEffect(() => {
    setActiveIndex(0);
  }, [language, slug]);

  return (
    <div className="pokemon-description-card">
      <div className="pokemon-description-track-wrapper">
        <div
          className="pokemon-description-track"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {descriptions.map((description, index) => (
            <p key={index} className="pokemon-description-slide">
              {description}
            </p>
          ))}
        </div>
      </div>
      {descriptions.length > 1 && (
        <div className="pokemon-description-dots">
          {descriptions.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`pokemon-description-dot ${index === activeIndex ? "active" : ""}`}
              aria-label={`Show description ${index + 1}`}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PokemonDescriptionCard;
