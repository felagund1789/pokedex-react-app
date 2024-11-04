import ColorThief from "colorthief";
import { useEffect, useState } from "react";
import usePokemon from "./usePokemon";

const colorthief = new ColorThief();
const artworkBaseURL = import.meta.env.VITE_POKEMON_ARTWORK_BASE_URL;

const rgbToHex = (r: number, g: number, b: number, alpha: number) => {
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${
    alpha !== 1 ? toHex(Math.round(alpha * 255)) : ""
  }`;
};

const colorBrightness = ([r, g, b]: number[]): number =>
  0.299 * r + 0.587 * g + 0.114 * b;

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
        let dominantColor = colorthief.getColor(img);
        const palette = colorthief
          .getPalette(img)
          .filter((c) => colorBrightness(c) > 63 && colorBrightness(c) < 224);

        dominantColor =
          colorBrightness(dominantColor) > 63 &&
          colorBrightness(dominantColor) < 224
            ? dominantColor
            : palette[0];

        const color = rgbToHex(...dominantColor, 1);
        localStorage.setItem(imgUrl, color);
        setPokemonColor(color);
        img.remove();
      });
    }
  }, [imgUrl]);

  return pokemonColor;
};

export default usePokemonColor;
