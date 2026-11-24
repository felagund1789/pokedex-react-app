import pokemonLogo from "../../assets/pokedex.png";
import useOffset from "../../hooks/useOffset";
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import "./Header.css";

const MainHeader = () => {
  const offset = useOffset();

  return (
    <header className={offset === 0 ? "" : "collapsed"}>
      <Link className="header-link" to="/moves">Moves</Link>
      <div className="spacer placeholder"></div>
      <img src={pokemonLogo} alt="Pokedex" />
      <div className="spacer"></div>
      <ThemeToggle />
    </header>
  );
};

export default MainHeader;
