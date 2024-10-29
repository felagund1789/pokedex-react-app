import icons from "../assets/types";
import useMove from "../hooks/useMove";

interface Props {
  slug: string;
}

const MoveCard = ({ slug }: Props) => {
  const language = "en";
  const version = null;
  const { data } = useMove({ slug });
  const type = data?.type.name ?? "";

  const texts = data?.flavor_text_entries.filter(
    (entry) => entry.language.name === language
  );

  const name = data?.names.find(
    (name) => name.language.name === language
  )?.name;

  let description;
  if (version) {
    description = data?.flavor_text_entries
      ?.find((entry) => entry.version_group.name.indexOf(version) > -1)
      ?.flavor_text.replace(/[\n\f]/g, "\r\n");
  } else if (texts && texts.length > 0) {
    description = texts[0]?.flavor_text.replace(/[\n\f]/g, "\r\n");
  }

  return (
    <div className={`pokemon-move ${type}`}>
      <img src={icons[type as keyof typeof icons]} alt={type} />
      <div className="move-details">
        <h3 className="name">{name}</h3>
        {description && <p className="description">{description}</p>}
      </div>
      <div className="move-stats">
        {data?.power && (
          <div className="stat">
            <span>Power</span>
            <span>{data.power}</span>
          </div>
        )}
        {data?.pp && (
          <div className="stat">
            <span>PP</span>
            <span>{data.pp}</span>
          </div>
        )}
        {data?.accuracy && (
          <div className="stat">
            <span>Accuracy</span>
            <span>{data.accuracy}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoveCard;
