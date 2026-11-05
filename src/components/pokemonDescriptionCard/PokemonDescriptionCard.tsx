import { useEffect, useRef, useState } from "react";
import usePokemonStore from "../../store";
import "./PokemonDescriptionCard.css";
import { PokemonSpecies } from "pokeapi-js-wrapper";
import pokedex from "../../services/pokedexService";
import usePokemonDescription from "../../hooks/usePokemonDescription";
import useWheelScroll from "../../hooks/useWheelScroll";
import usePointerDrag from "../../hooks/usePointerDrag";

interface Props {
  slug: string;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const PokemonDescriptionCard = ({ slug }: Props) => {
  const language = usePokemonStore((state) => state.language);
  const [species, setSpecies] = useState<PokemonSpecies>({} as PokemonSpecies);
  const [activeIndex, setActiveIndex] = useState(0);

  const wrapperRef = useRef<HTMLDivElement>(null);

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

  const goTo = (index: number) => {
    setActiveIndex(clamp(index, 0, Math.max(descriptions.length - 1, 0)));
  };

  useWheelScroll({
    wrapperRef,
    itemCount: descriptions.length,
    onIndexChange: setActiveIndex,
  });

  const { dragOffset, isDragging, handlePointerDown, handlePointerMove, endDrag } =
    usePointerDrag({
      wrapperRef,
      itemCount: descriptions.length,
      onIndexChange: setActiveIndex,
    });

  return (
    <div
      className="pokemon-description-card"
      ref={wrapperRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div className="pokemon-description-track-wrapper">
        <div
          className="pokemon-description-track"
          style={{
            transform: `translateX(calc(-${activeIndex * 100}% + ${dragOffset}px))`,
            transition: isDragging ? "none" : undefined,
          }}
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
              onClick={() => goTo(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PokemonDescriptionCard;
