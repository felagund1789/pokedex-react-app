import { useLocation } from "react-router-dom";
import pokemonLogo from "../assets/logo.png";
import useOffest from "../hooks/useOffset";

const Header = () => {
  const offeset = useOffest();
  const { pathname } = useLocation();

  return (
    <header className={pathname === "/" && offeset === 0 ? "" : "collapsed"}>
      <img src={pokemonLogo} alt="Pokedex" />
    </header>
  );
};

export default Header;
