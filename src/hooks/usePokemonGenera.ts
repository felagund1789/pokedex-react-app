import usePokemonStore from "../store";
import usePokemonSpecies from "./usePokemonSpecies";

interface Props {
  slug: string;
}

const usePokemonGenera = ({ slug }: Props) => {
  const language = usePokemonStore((state) => state.language);
  const { data } = usePokemonSpecies({ slug });

  return data?.genera.find((genera) => genera.language.name === language)?.genus;
};

export default usePokemonGenera;
