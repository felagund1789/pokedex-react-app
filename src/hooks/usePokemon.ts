import useResolvedPokemon from "./useResolvedPokemon";

interface Props {
  slug: string;
}

const usePokemon = ({ slug }: Props) => {
  const query = useResolvedPokemon(slug);
  return { ...query, data: query.data?.pokemon };
};

export default usePokemon;
