import { useQuery } from "@tanstack/react-query";
import type { Pokemon } from "pokeapi-js-wrapper";
import { useNavigate } from "react-router-dom";
import usePokemonSpecies from "../../hooks/usePokemonSpecies";
import useResolvedPokemon from "../../hooks/useResolvedPokemon";
import pokedex from "../../services/pokedexService";
import PokemonCard from "../pokemonCard/PokemonCard";
import "./OtherForms.css";

interface Props {
  slug: string;
  selectedForm?: string | null;
}

const OtherForms = ({ slug, selectedForm = null }: Props) => {
  const species = usePokemonSpecies({ slug });
  const current = useResolvedPokemon(slug, selectedForm);
  const navigate = useNavigate();
  const forms = useQuery({
    queryKey: ["species-forms", species.data?.name],
    queryFn: async () => {
      const varieties: Pokemon[] = await Promise.all(
        species.data!.varieties.map((entry) => pokedex.getPokemonByName(entry.pokemon.name)),
      );
      return [...new Map(varieties.flatMap((pokemon) => pokemon.forms).map((form) => [form.name, form])).values()];
    },
    enabled: Boolean(species.data),
    staleTime: 24 * 60 * 60 * 1000,
  });
  const error = species.error ?? current.error ?? forms.error;
  if (error) return <div role="alert">Unable to load alternative forms: {error.message}</div>;
  if (!forms.data || !current.data) return <div role="status">Loading alternative forms...</div>;
  const alternatives = forms.data.filter((form) => form.name !== current.data.form.name);
  if (!alternatives.length) return null;

  return (
    <div className="other-forms">
      <h2 className="title">Alternative Forms</h2>
      <div className="other-forms-list">
        {alternatives.map((form) => (
          <PokemonCard key={form.name} slug={form.name} onClick={() => navigate(`/pokemon/${form.name}`)} />
        ))}
      </div>
    </div>
  );
};

export default OtherForms;
