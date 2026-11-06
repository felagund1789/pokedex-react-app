import { useEffect } from "react";
import "./PokemonImageModal.css";

interface Props {
  src: string;
  alt?: string;
  onClose: () => void;
}

const PokemonImageModal = ({ src, alt, onClose }: Props) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="pokemon-image-modal"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <img src={src} alt={alt} onClick={(e) => e.stopPropagation()} />
      <button
        className="pokemon-image-modal__close"
        aria-label="Close"
        onClick={onClose}
      >
        ×
      </button>
    </div>
  );
};

export default PokemonImageModal;
