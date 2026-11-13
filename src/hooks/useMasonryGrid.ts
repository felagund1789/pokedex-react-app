import { useLayoutEffect, type RefObject } from "react";

const useMasonryGrid = (gridRef: RefObject<HTMLElement | null>, ready = true) => {
  useLayoutEffect(() => {
    if (!ready) return;
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
        const cardHeight = Math.max(
          card.getBoundingClientRect().height,
          card.scrollHeight,
        );
        const rowSpan = Math.ceil(
          (cardHeight + rowGap) / (rowHeight + rowGap),
        );

        (card as HTMLElement).style.gridRowEnd = `span ${rowSpan}`;
      });
    };

    const resizeObserver = new ResizeObserver(updateRowSpans);
    const observed = new Set<Element>();

    // Children (e.g. async-rendered cards) can be added or replaced after mount,
    // so keep observing the current set and recalculate whenever the DOM changes.
    const syncObservedChildren = () => {
      const current = new Set(Array.from(grid.children));
      observed.forEach((el) => {
        if (!current.has(el)) {
          resizeObserver.unobserve(el);
          observed.delete(el);
        }
      });
      current.forEach((el) => {
        if (!observed.has(el)) {
          resizeObserver.observe(el);
          observed.add(el);
        }
      });
    };

    let frame = 0;
    const scheduleUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        syncObservedChildren();
        updateRowSpans();
      });
    };

    const mutationObserver = new MutationObserver(scheduleUpdate);
    mutationObserver.observe(grid, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    resizeObserver.observe(grid);
    syncObservedChildren();
    updateRowSpans();

    return () => {
      cancelAnimationFrame(frame);
      mutationObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, [gridRef, ready]);
};

export default useMasonryGrid;
