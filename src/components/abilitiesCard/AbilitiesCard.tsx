import { Ability } from "pokeapi-js-wrapper";
import { useEffect, useState } from "react";
import usePokemonInfo from "../../hooks/usePokemonInfo";
import pokedex from "../../services/pokedexService";
import usePokemonStore from "../../store";
import "./AbilitiesCard.css";

interface Props {
  slug: string;
}

interface PokemonAbility {
  name: string;
  effect: string;
  isHidden: boolean;
}

const AbilitiesCard = ({ slug }: Props) => {
  const language = usePokemonStore((state) => state.language);
  const { pokemon } = usePokemonInfo(slug);
  const [abilities, setAbilities] = useState<PokemonAbility[]>([]);

  useEffect(() => {
    let isCurrent = true;
    setAbilities([]);

    const loadAbilities = async () => {
      const abilityDetails: Ability[] = pokemon?.abilities ? await Promise.all(
        pokemon.abilities.map(({ ability }) => pokedex.resource(ability.url)),
      ) : [];

      if (!isCurrent) {
        return;
      }

      setAbilities(pokemon?.abilities ?
        pokemon.abilities.map(({ ability, is_hidden }, index) => {
          const details = abilityDetails[index];
          const effect =
            details.effect_entries.find(
              (entry) => entry.language.name === language,
            ) ??
            details.effect_entries.find(
              (entry) => entry.language.name === "en",
            );

          return {
            name:
              details.names.find((entry) => entry.language.name === language)
                ?.name ??
              details.names.find((entry) => entry.language.name === "en")
                ?.name ??
              ability.name.replace(/-/g, " "),
            effect: effect?.short_effect ?? "",
            isHidden: is_hidden,
          };
        }) : []
      );
    };

    void loadAbilities();
    return () => {
      isCurrent = false;
    };
  }, [language, pokemon]);

  return (
    <div className="abilities-card">
      <h2>Abilities</h2>
      <ul className="abilities-card__list">
        {abilities.map((ability) => (
          <li key={ability.name} className="abilities-card__item">
            <div className="abilities-card__name">
              <span>{ability.name}</span>
              {ability.isHidden && (
                <span className="abilities-card__hidden">Hidden</span>
              )}
            </div>
            {ability.effect && (
              <p className="abilities-card__effect">{ability.effect}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AbilitiesCard;
