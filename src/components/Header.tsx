import pokemonLogo from "../assets/logo.png";
import useOffest from "../hooks/useOffset";

const Header = () => {
  const offeset = useOffest();

  return (
    <header className={offeset > 0 ? "collapsed" : ""}>
      <img src={pokemonLogo} alt="Pokedex" />
    </header>
  );
};

export default Header;
