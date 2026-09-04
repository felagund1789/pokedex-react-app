import { useRef, useState } from "react";

const DRAG_THRESHOLD_RATIO = 0.2;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

interface Props {
  wrapperRef: React.RefObject<HTMLElement | null>;
  itemCount: number;
  onIndexChange: (updater: (current: number) => number) => void;
}

const usePointerDrag = ({ wrapperRef, itemCount, onIndexChange }: Props) => {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (itemCount <= 1) return;
    setIsDragging(true);
    dragStartX.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setDragOffset(e.clientX - dragStartX.current);
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);

    const width = wrapperRef.current?.clientWidth || 1;
    const threshold = width * DRAG_THRESHOLD_RATIO;
    if (dragOffset < -threshold) {
      onIndexChange((current) => clamp(current + 1, 0, itemCount - 1));
    } else if (dragOffset > threshold) {
      onIndexChange((current) => clamp(current - 1, 0, itemCount - 1));
    }
    setDragOffset(0);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return { dragOffset, isDragging, handlePointerDown, handlePointerMove, endDrag };
};

export default usePointerDrag;
