import { useEffect } from "react";
import { useParams } from "react-router-dom";
import OtherFormsCard from "../components/OtherFormsCard";
import "../App.css";

function PokemonFormsPage() {
  const { name } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!name) {
    return null;
  }

  return <OtherFormsCard slug={name} />;
}

export default PokemonFormsPage;
