import ColorThief from "colorthief";
import { useEffect, useState } from "react";

const colorthief = new ColorThief();

const rgbToHex = (r: number, g: number, b: number, alpha: number): string => {
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${alpha !== 1 ? toHex(Math.round(alpha * 255)) : ""}`;
}

const colorBrightness = ([r, g, b]: number[]): number => 0.299 * r + 0.587 * g + 0.114 * b;

const useColorThief = (imgUrl: string) => {
  const [color, setColor] = useState<string | null>(null);
  const [palette, setPalette] = useState<string[]>([]);

  useEffect(() => {
    const img = document.createElement("img")
    img.crossOrigin = "anonymous";
    img.style.display = "none";
    img.src = imgUrl;
    img.addEventListener("load", () => {
      const palette = colorthief.getPalette(img);
      setPalette(palette 
        ? palette
          .filter(p => colorBrightness(p) > 50)
          .filter(p => colorBrightness(p) < 200)
          .map(([r, g, b]) => rgbToHex(r, g, b, 1)) 
        : []);
      setColor(palette && palette.length > 0 ? rgbToHex(...palette[0], 1) : null);
      img.remove();
    });
  }, [imgUrl]);

  return { color, palette };
};

export default useColorThief;
