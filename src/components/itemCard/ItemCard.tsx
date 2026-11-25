import { useQuery } from "@tanstack/react-query";
import useItem from "../../hooks/useItem";
import { itemCategoryQuery, itemPocketQuery, localizedItemResourceName } from "../../hooks/itemCategoryQuery";
import usePokemonStore from "../../store";
import "./ItemCard.css";

const readable = (name: string) => name.replace(/-/g, " ");

const ItemCard = ({ slug }: { slug: string }) => {
  const language = usePokemonStore((state) => state.language);
  const { data: item, isLoading, error, refetch } = useItem({ slug });
  const category = useQuery({
    ...itemCategoryQuery(item?.category.name ?? ""),
    enabled: !!item,
  });
  const pocket = useQuery({
    ...itemPocketQuery(category.data?.pocket.name ?? ""),
    enabled: !!category.data,
  });

  if (isLoading) return <article className="item-card">Loading {readable(slug)}...</article>;
  if (error || !item) return (
    <article className="item-card">
      <p>Could not load {readable(slug)}: {error?.message}</p>
      <button type="button" onClick={() => void refetch()}>Retry</button>
    </article>
  );

  const name = item.names.find((entry) => entry.language.name === language)?.name ??
    item.names.find((entry) => entry.language.name === "en")?.name ?? readable(slug);
  const description = (item.flavor_text_entries.find((entry) => entry.language.name === language) ??
    item.flavor_text_entries.find((entry) => entry.language.name === "en"))?.text.replace(/[\n\f\r]+/g, " ");

  return (
    <article className="item-card">
      <div className="item-card__header">
        <h2>{name}</h2>
        {item.sprites.default && <img src={item.sprites.default} alt="" />}
      </div>
      <dl className="item-card__details">
        <div>
          <dt>Category</dt>
          <dd>
            {category.data ? localizedItemResourceName(category.data, language) : category.isError ? (
              <>Could not load category. <button type="button" onClick={() => void category.refetch()}>Retry</button></>
            ) : "Loading..."}
          </dd>
        </div>
        <div>
          <dt>Pocket</dt>
          <dd>
            {pocket.data ? localizedItemResourceName(pocket.data, language) : pocket.isError ? (
              <>Could not load pocket. <button type="button" onClick={() => void pocket.refetch()}>Retry</button></>
            ) : category.isError ? (
              "Could not load pocket."
            ) : "Loading..."}
          </dd>
        </div>
      </dl>
      {description && <p>{description}</p>}
    </article>
  );
};

export default ItemCard;
