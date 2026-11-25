import { CSSProperties } from "react";
import useMove from "../../hooks/useMove";
import usePokemonStore from "../../store";
import PokemonType from "../pokemonType/PokemonType";
import "./PokemonMoveCard.css";

const PokemonMoveCard = ({ slug }: { slug: string }) => {
  const language = usePokemonStore((state) => state.language);
  const { data: move, isLoading, error, refetch } = useMove({ slug });

  if (isLoading) return <article className="pokemon-move-card">Loading {slug.replace(/-/g, " ")}...</article>;
  if (error || !move) return (
    <article className="pokemon-move-card">
      <p>Could not load {slug.replace(/-/g, " ")}: {error?.message}</p>
      <button type="button" onClick={() => void refetch()}>Retry</button>
    </article>
  );

  const name = move.names.find((entry) => entry.language.name === language)?.name ??
    move.names.find((entry) => entry.language.name === "en")?.name ?? slug.replace(/-/g, " ");
  const description = (move.flavor_text_entries.find((entry) => entry.language.name === language) ??
    move.flavor_text_entries.find((entry) => entry.language.name === "en"))?.flavor_text.replace(/[\n\f]/g, " ");
  const effect = (move.effect_entries.find((entry) => entry.language.name === language) ??
    move.effect_entries.find((entry) => entry.language.name === "en"))?.short_effect
    .replace(/\$effect_chance/g, move.effect_chance === null ? "—" : String(move.effect_chance));
  const type = move.type.name;

  return (
    <article className="pokemon-move-card" style={{ "--move-color": `var(--type-${type}, var(--type-unknown))` } as CSSProperties}>
      <div className="pokemon-move-card__header">
        <h2>{name}</h2>
        <div className="pokemon-move-card__badges">
          <PokemonType>{type}</PokemonType>
          <span className={`pokemon-move-card__damage-class ${move.damage_class.name}`}>{move.damage_class.name}</span>
        </div>
      </div>
      <dl className="pokemon-move-card__stats">
        <div><dt>Power</dt><dd>{move.power ?? "—"}</dd></div>
        <div><dt>PP</dt><dd>{move.pp ?? "—"}</dd></div>
        <div><dt>Accuracy</dt><dd>{move.accuracy == null ? "—" : `${move.accuracy}%`}</dd></div>
      </dl>
      {description && <p className="pokemon-move-card__description">{description}</p>}
      {effect && <p className="pokemon-move-card__effect"><strong>Effect:</strong> {effect}</p>}
    </article>
  );
};

export default PokemonMoveCard;
