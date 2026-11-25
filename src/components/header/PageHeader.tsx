import pokemonLogo from "../../assets/pokedex.png";
import "./Header.css";
import NavigationMenu from "./NavigationMenu";
import ThemeToggle from "./ThemeToggle";

const PageHeader = () => {
  return (
    <header className="collapsed">
      <NavigationMenu />
      <img src={pokemonLogo} alt="Pokedex" />
      <div className="spacer"></div>
      <ThemeToggle />
    </header>
  );
};

export default PageHeader;
