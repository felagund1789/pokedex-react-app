import { useLocation, useNavigate } from "react-router-dom";
import pokemonLogo from "../../assets/pokedex.png";
import useOffset from "../../hooks/useOffset";
import "./Header.css";

const Header = () => {
  const offset = useOffset();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <header className={pathname === "/" && offset === 0 ? "" : "collapsed"}>
      {pathname !== "/" ? (
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
      ) : (
        <div className="widget"></div>
      )}
      <img src={pokemonLogo} alt="Pokedex" />
    </header>
  );
};

export default Header;
