import { Color, getColorSync, getPaletteSync } from "colorthief";
import { useEffect, useState } from "react";

const colorBrightness = (color: Color): number => {
  const { r, g, b } = color.rgb();
  return 0.299 * r + 0.587 * g + 0.114 * b;
};

const useColorThief = (imgUrl: string) => {
  const [color, setColor] = useState<string | null>(null);
  const [palette, setPalette] = useState<string[]>([]);

  useEffect(() => {
    const img = document.createElement("img")
    img.crossOrigin = "anonymous";
    img.style.display = "none";
    img.src = imgUrl;
    img.addEventListener("load", () => {
      const palette = (getPaletteSync(img) ?? [])
        .filter(c => colorBrightness(c) > 63 && colorBrightness(c) < 224);

      const dominantColor = getColorSync(img);
      const selectedColor = dominantColor && colorBrightness(dominantColor) > 63 && colorBrightness(dominantColor) < 224
        ? dominantColor
        : palette[0];

      setColor(selectedColor?.hex() ?? null);
      setPalette(palette.map(color => color.hex()));
      img.remove();
    });
  }, [imgUrl]);

  return { color, palette };
};

export default useColorThief;
