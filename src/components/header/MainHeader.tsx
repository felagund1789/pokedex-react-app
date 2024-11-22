import pokemonLogo from "../../assets/pokedex.png";
import useOffset from "../../hooks/useOffset";
import "./Header.css";

const MainHeader = () => {
  const offset = useOffset();

  return (
    <header className={offset === 0 ? "" : "collapsed"}>
      <div className="widget"></div>
      <img src={pokemonLogo} alt="Pokedex" />
    </header>
  );
};

export default MainHeader;
