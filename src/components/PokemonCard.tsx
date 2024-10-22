interface PokemonCardProps {
  pokedexNo: number;
  pokemon: {
    name: string;
    url: string;
  };
}

const artworkBaseURL = import.meta.env.VITE_POKEMON_ARTWORK_BASE_URL;

const PokemonCard = ({ pokedexNo, pokemon }: PokemonCardProps) => {
  return (
    <div>
      <img
        src={`${artworkBaseURL}${pokedexNo}.png`}
        alt={pokemon.name}
        height={95}
        width={95}
      />
      <h2>{pokemon.name}</h2>
    </div>
  );
};

export default PokemonCard;
