import ColorThief from "colorthief";
import { useEffect, useState } from "react";

const colorthief = new ColorThief();

const rgbToHex = (r: number, g: number, b: number, alpha: number) => {
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${alpha !== 1 ? toHex(Math.round(alpha * 255)) : ""}`;
}

const useColorThief = (imgUrl: string) => {
  const [color, setColor] = useState<string | null>(null);
  const [palette, setPalette] = useState<string[]>([]);

  useEffect(() => {
    const img = document.createElement("img")
    img.crossOrigin = "anonymous";
    img.style.display = "none";
    img.src = imgUrl;
    img.addEventListener("load", () => {
      const c = colorthief.getColor(img);
      const palette = colorthief.getPalette(img);
      setColor(c ? rgbToHex(...c, 1) : null);
      setPalette(palette ? palette.map(([r, g, b]) => rgbToHex(r, g, b, 1)) : []);
      img.remove();
    });
  }, [imgUrl]);

  return { color, palette };
};

export default useColorThief;
