interface PokemonNumberProps {
  children: number | undefined;
}

const formatNumber = (number: number | undefined) =>
  number?.toString().padStart(3, "0");

const PokemonNumber = ({ children: pokemonNo }: PokemonNumberProps) => {
  return <h3>#{formatNumber(pokemonNo)}</h3>;
};

export default PokemonNumber;
