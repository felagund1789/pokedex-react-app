import { useEffect, useState } from "react";
import useColorThief from "./useColorThief";
import usePokemon from "./usePokemon";

interface Props {
  slug: string;
}

const artworkBaseURL = import.meta.env.VITE_POKEMON_ARTWORK_BASE_URL;

const usePokemonColor = ({ slug }: Props) => {
  const { data } = usePokemon({ slug });
  const [pokemonColor, setPokemonColor] = useState<string | null>(null);
  const imgUrl = data?.id ? `${artworkBaseURL}${data.id}.png` : "";

  const { color } = useColorThief(imgUrl);

  useEffect(() => {
    const storedColor = localStorage.getItem(slug);
    if (storedColor) {
      setPokemonColor(storedColor);
    }
  }, [slug]);

  if (color) {
    localStorage.setItem(slug, color);
    return color;
  }

  return pokemonColor;
};

export default usePokemonColor;
