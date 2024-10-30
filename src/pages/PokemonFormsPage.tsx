import { useEffect } from "react";
import { useParams } from "react-router-dom";
import OtherForms from "../components/otherForms/OtherForms";
import "../App.css";

function PokemonFormsPage() {
  const { name } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!name) {
    return null;
  }

  return <OtherForms slug={name} />;
}

export default PokemonFormsPage;
