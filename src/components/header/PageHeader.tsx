import { useNavigate } from "react-router-dom";
import pokemonLogo from "../../assets/pokedex.png";
import "./Header.css";
import NavigationMenu from "./NavigationMenu";
import ThemeToggle from "./ThemeToggle";

const PageHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="collapsed">
      <NavigationMenu />
      <button className="header-back" type="button" aria-label="Go back" onClick={() => navigate(-1)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="white"
        >
          <path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z" />
        </svg>
      </button>
      <img src={pokemonLogo} alt="Pokedex" />
      <div className="spacer"></div>
      <ThemeToggle />
    </header>
  );
};

export default PageHeader;
