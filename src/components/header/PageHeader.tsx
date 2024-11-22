import { useNavigate } from "react-router-dom";
import pokemonLogo from "../../assets/pokedex.png";
import "./Header.css";

const PageHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="collapsed">
      <div className="widget" onClick={() => navigate(-1)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="white"
        >
          <path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z" />
        </svg>
      </div>
      <img src={pokemonLogo} alt="Pokedex" />
    </header>
  );
};

export default PageHeader;
