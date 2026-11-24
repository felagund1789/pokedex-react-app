import { CSSProperties } from "react";
import icons from "../../assets/types";
import useMove from "../../hooks/useMove";
import usePokemonStore from "../../store";
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
      <h2><img src={icons[type as keyof typeof icons] ?? icons.unknown} alt="" />{name}</h2>
      <p className="pokemon-move-card__type">{type} · {move.damage_class.name}</p>
      {description && <p>{description}</p>}
      <dl>
        <div><dt>Power</dt><dd>{move.power ?? "—"}</dd></div>
        <div><dt>PP</dt><dd>{move.pp ?? "—"}</dd></div>
        <div><dt>Accuracy</dt><dd>{move.accuracy == null ? "—" : `${move.accuracy}%`}</dd></div>
      </dl>
      {effect && <p><strong>Effect:</strong> {effect}</p>}
    </article>
  );
};

export default PokemonMoveCard;
