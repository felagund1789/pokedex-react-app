import { useEffect, useRef } from "react";

const WHEEL_THRESHOLD = 5;
const WHEEL_COOLDOWN_MS = 10;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

interface Props {
  wrapperRef: React.RefObject<HTMLElement | null>;
  itemCount: number;
  onIndexChange: (updater: (current: number) => number) => void;
}

const useWheelScroll = ({ wrapperRef, itemCount, onIndexChange }: Props) => {
  const wheelLocked = useRef(false);

  // Native listener needed since React attaches wheel handlers as passive by default
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || itemCount <= 1) return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < WHEEL_THRESHOLD || wheelLocked.current) return;

      e.preventDefault();
      wheelLocked.current = true;
      onIndexChange((current) =>
        clamp(current + (e.deltaY > 0 ? 1 : -1), 0, itemCount - 1)
      );
      setTimeout(() => {
        wheelLocked.current = false;
      }, WHEEL_COOLDOWN_MS);
    };

    wrapper.addEventListener("wheel", handleWheel, { passive: false });
    return () => wrapper.removeEventListener("wheel", handleWheel);
  }, [wrapperRef, itemCount, onIndexChange]);
};

export default useWheelScroll;
