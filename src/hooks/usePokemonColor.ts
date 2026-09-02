import { useEffect, useState } from "react";
import { Color, getColorSync, getPaletteSync } from "colorthief";
import usePokemon from "./usePokemon";

const artworkBaseURL = import.meta.env.VITE_POKEMON_ARTWORK_BASE_URL;

const colorBrightness = (color: Color): number => {
  const { r, g, b } = color.rgb();
  return 0.299 * r + 0.587 * g + 0.114 * b;
};

interface Props {
  slug: string;
}

const usePokemonColor = ({ slug }: Props) => {
  const { data } = usePokemon({ slug });
  const [pokemonColor, setPokemonColor] = useState<string | null>(null);
  const imgUrl = data?.id ? `${artworkBaseURL}${data.id}.png` : "";

  useEffect(() => {
    const storedColor = localStorage.getItem(imgUrl);
    if (storedColor) {
      setPokemonColor(storedColor);
    } else {
      const img = document.createElement("img");
      img.crossOrigin = "anonymous";
      img.style.display = "none";
      img.src = imgUrl;
      img.addEventListener("load", () => {
        const palette = (getPaletteSync(img) ?? [])
          .filter(c => colorBrightness(c) > 63 && colorBrightness(c) < 224);

        const dominantColor = getColorSync(img);
        const selectedColor = dominantColor && 
          colorBrightness(dominantColor) > 63 && 
          colorBrightness(dominantColor) < 224
            ? dominantColor
            : palette[0];

        const color = selectedColor?.hex() ?? null;
        localStorage.setItem(imgUrl, color);
        setPokemonColor(color);
        img.remove();
      });
    }
  }, [imgUrl]);

  return pokemonColor;
};

export default usePokemonColor;
