import usePokemonForm from "./usePokemonForm";

interface Props {
  slug: string;
}

const usePokemonFormName = ({ slug }: Props) => {
  const language = "en";
  const { data } = usePokemonForm({ slug });

  return data?.names.find((name) => name.language?.name === language)?.name;
};

export default usePokemonFormName;
