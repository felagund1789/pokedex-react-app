import pokemonLogo from "../assets/logo.png";

const Header = () => {
  return (
    <header>
      <img src={pokemonLogo} alt="Pokedex" height={128} />
    </header>
  );
};

export default Header;
