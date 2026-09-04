import { useLayoutEffect, type RefObject } from "react";

const useMasonryGrid = (gridRef: RefObject<HTMLElement | null>) => {
  useLayoutEffect(() => {
    const grid = gridRef.current;

    if (!grid) {
      return;
    }

    const updateRowSpans = () => {
      const gridStyles = window.getComputedStyle(grid);
      const rowHeight = Number.parseFloat(gridStyles.gridAutoRows);
      const rowGap = Number.parseFloat(gridStyles.rowGap);

      if (!rowHeight) {
        return;
      }

      Array.from(grid.children).forEach((card) => {
        const cardHeight = card.scrollHeight;
        const rowSpan = Math.ceil(
          (cardHeight + rowGap) / (rowHeight + rowGap),
        );

        (card as HTMLElement).style.gridRowEnd = `span ${rowSpan}`;
      });
    };

    const resizeObserver = new ResizeObserver(updateRowSpans);
    resizeObserver.observe(grid);
    Array.from(grid.children).forEach((card) => resizeObserver.observe(card));
    updateRowSpans();

    return () => resizeObserver.disconnect();
  }, [gridRef]);
};

export default useMasonryGrid;
