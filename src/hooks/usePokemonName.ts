import usePokemonSpecies from "./usePokemonSpecies";

interface Props {
  slug: string;
}

const usePokemonName = ({ slug }: Props) => {
  const language = "en";
  const { data } = usePokemonSpecies({ slug });

  return data?.names.find((name) => name.language.name === language)?.name;
};

export default usePokemonName;
