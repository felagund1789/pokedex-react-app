import usePokemonStore from "../store";
import usePokemonForm from "./usePokemonForm";

interface Props {
  slug: string;
}

const usePokemonFormName = ({ slug }: Props) => {
  const language = usePokemonStore((state) => state.language);
  const { data } = usePokemonForm({ slug });

  return data?.names.find((name) => name.language?.name === language)?.name;
};

export default usePokemonFormName;
