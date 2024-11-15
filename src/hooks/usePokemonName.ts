import usePokemonStore from "../store";
import usePokemonSpecies from "./usePokemonSpecies";

interface Props {
  slug: string;
}

const usePokemonName = ({ slug }: Props) => {
  const language = usePokemonStore((state) => state.language);
  const { data } = usePokemonSpecies({ slug });

  return data?.names.find((name) => name.language.name === language)?.name;
};

export default usePokemonName;
