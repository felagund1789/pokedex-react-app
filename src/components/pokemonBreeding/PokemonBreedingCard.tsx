import usePokemonInfo from "../../hooks/usePokemonInfo";
import StatPanel from "../statPanel/StatPanel";
import "./PokemonBreedingCard.css";

interface Props {
  slug: string;
}

const PokemonBreedingCard = ({ slug }: Props) => {
  const { pokemonSpecies } = usePokemonInfo(slug);
  const genderRate = pokemonSpecies?.gender_rate;
  const malePercentage = genderRate != null && genderRate >= 0
    ? (1 - genderRate / 8) * 100
    : null;

  return (
    <div className="pokemon-breeding-card">
      <h2>Breeding</h2>
      {pokemonSpecies && (
        <>
          <div className="pokemon-breeding-card__info">
            <StatPanel title="Hatch Counter">{pokemonSpecies.hatch_counter}</StatPanel>
            <StatPanel title="Egg Groups">
              {pokemonSpecies.egg_groups.map((group) => group.name.replace(/-/g, " ")).join(", ")}
            </StatPanel>
          </div>
          <div className="pokemon-breeding-card__gender">
            <h3>Gender Ratio</h3>
            {malePercentage === null ? (
              <p>Genderless</p>
            ) : (
              <>
                <div
                  className="pokemon-breeding-card__ratio"
                  role="img"
                  aria-label={`Female ${100 - malePercentage}%, male ${malePercentage}%`}
                >
                  <span aria-hidden="true">♀</span>
                  <div className="pokemon-breeding-card__bar">
                    <div
                      className="pokemon-breeding-card__male"
                      style={{ width: `${malePercentage}%` }}
                    />
                  </div>
                  <span aria-hidden="true">♂</span>
                </div>
                <p>{100 - malePercentage}% female / {malePercentage}% male</p>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PokemonBreedingCard;
