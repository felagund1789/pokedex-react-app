import { useNavigate } from "react-router-dom";
import usePokemonInfo from "../../hooks/usePokemonInfo";
import PokemonCard from "../pokemonCard/PokemonCard";
import "./OtherForms.css";

interface Props {
  slug: string;
}

const OtherForms = ({ slug }: Props) => {
  const { pokemon, pokemonSpecies } = usePokemonInfo(slug);
  const navigate = useNavigate();

  const otherForms = pokemon?.forms.filter(
    (form) => form.name !== slug
  ) ?? [];

  const otherVarieties = pokemonSpecies?.varieties.filter(
      (pokemonVariety) => pokemonVariety.pokemon.name !== pokemon?.name
    ) ?? [];

  if (otherForms.length === 0 && otherVarieties.length === 0) {
    return null;
  }

  return (
    <div className="other-forms">
      <h2 className="title">Alternative Forms</h2>
      <div className="other-forms-list">
        {otherForms.map((form, index) => (
            <PokemonCard
              key={index}
              slug={form.name}
              onClick={() =>
                navigate(`/pokemon/${form.name}`)
              }
            />
          ))}
        {otherVarieties.map((pokemonVariety, index) => (
            <PokemonCard
              key={index}
              slug={pokemonVariety.pokemon.name}
              onClick={() =>
                navigate(`/pokemon/${pokemonVariety.pokemon.name}`)
              }
            />
          ))}
      </div>
    </div>
  );
};

export default OtherForms;
