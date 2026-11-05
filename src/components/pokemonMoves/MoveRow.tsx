import { CSSProperties } from "react";
import icons from "../../assets/types";
import useMove from "../../hooks/useMove";
import usePokemonStore from "../../store";

interface Props {
  slug: string;
  level?: number;
}

const MoveRow = ({ slug, level }: Props) => {
  const language = usePokemonStore((state) => state.language);
  const { data } = useMove({ slug });
  const type = data?.type.name ?? "";

  const name = data?.names.find(
    (name) => name.language.name === language
  )?.name;

  const description = data?.flavor_text_entries
    .filter((entry) => entry.language.name === language)[0]
    ?.flavor_text.replace(/[\n\f]/g, " ");

  return (
    <tr
      className="move-row"
      style={{ "--move-color": `var(--type-${type})` } as CSSProperties}
    >
      <td className="move-type">
        {type && <img src={icons[type as keyof typeof icons]} alt={type} />}
      </td>
      <td className="move-name">{name}</td>
      <td className="move-description">{description}</td>
      <td className="move-stat">{data?.power ?? ""}</td>
      <td className="move-stat">{data?.pp ?? ""}</td>
      <td className="move-stat">{data?.accuracy ?? ""}</td>
      <td className="move-stat move-level">{level || ""}</td>
    </tr>
  );
};

export default MoveRow;
