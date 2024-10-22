interface PokemonTypeProps {
  children: string | undefined;
}

const PokemonType = ({ children: type }: PokemonTypeProps) => {
  return <p>{type}</p>;
};

export default PokemonType;
