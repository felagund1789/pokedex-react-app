import usePokemonSpecies from "./usePokemonSpecies";

interface Props {
  slug: string;
}

const usePokedexNumber = ({ slug }: Props) => {
  const pokedex = "national";
  const { data } = usePokemonSpecies({ slug });

  return data?.pokedex_numbers.find((number) => number.pokedex.name === pokedex)
    ?.entry_number;
};

export default usePokedexNumber;
