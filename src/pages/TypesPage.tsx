import { useEffect } from "react";
import types from "../assets/types";
import PageHeader from "../components/header/PageHeader";
import PokemonType from "../components/pokemonType/PokemonType";
import "./TypesPage.css";

const TypesPage = () => {
  useEffect(() => {
    document.title = "Pokédex | Types";
  }, []);

  return (
    <>
      <PageHeader />
      <main className="types-page">
        <h1>Types</h1>
        <div className="types-grid">
          {Object.keys(types).filter((type) => type !== "unknown").map((type) => (
            <PokemonType key={type}>{type}</PokemonType>
          ))}
        </div>
      </main>
    </>
  );
};

export default TypesPage;
