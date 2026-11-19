import type { ChainEvolvesTo, NamedAPIResource } from "pokeapi-js-wrapper";
import { useNavigate } from "react-router-dom";
import useDefaultPokemonForm from "../../hooks/useDefaultPokemonForm";
import { findSimplestEvolution } from "../../utils";
import type { EvolutionMethod } from "../evolutionChain/evolutionModel";
import EvolutionDetailsCard from "../evolutionDetails/EvolutionDetailsCard";
import PokemonCard from "../pokemonCard/PokemonCard";
import "./EvolutionCard.css";

interface Props {
  species: NamedAPIResource;
  evolvesTo: ChainEvolvesTo[];
  form?: string;
  forms: Record<string, string>;
}

const EvolutionCard = ({ species, evolvesTo, form: selectedForm, forms }: Props) => {
  const navigate = useNavigate();
  const { data: defaultForm, error } = useDefaultPokemonForm(species, !selectedForm);
  const form = selectedForm ?? defaultForm;

  if (!selectedForm && error) return <div role="alert">Error loading default form: {error.message}</div>;
  if (!form) return null;

  return (
    <div className="evolution-card">
      <div className="evolves-from">
        <PokemonCard slug={form} onClick={() => navigate(`/pokemon/${form}`)} />
      </div>
      {evolvesTo && evolvesTo.length > 0 && (
        <div className="evolves-to">
          {evolvesTo.map((evolution, index) => {
            const targetForm = forms[evolution.species.name];
            const methods: EvolutionMethod[] = evolution.evolution_details;
            const matching = methods.filter((details) =>
              (!details.required_pokemon_form || details.required_pokemon_form.name === form) &&
              (!targetForm || !details.evolved_pokemon_form || details.evolved_pokemon_form.name === targetForm) &&
              (details.required_pokemon_form?.name === form ||
                (details.evolved_pokemon_form && (!targetForm || details.evolved_pokemon_form.name === targetForm))),
            );
            const defaults = methods.filter(
              (details) => !details.required_pokemon_form && !details.evolved_pokemon_form,
            );
            const hasSourceMatch = matching.some((details) => details.required_pokemon_form?.name === form);
            const candidates = matching.length
              ? [...matching, ...(!targetForm && !hasSourceMatch ? defaults : [])]
              : defaults.length ? defaults : methods;
            const groups = new Map<string | undefined, EvolutionMethod[]>();
            for (const method of candidates) {
              const nextForm = targetForm ?? (matching.includes(method) ? method.evolved_pokemon_form?.name : undefined);
              const group = groups.get(nextForm) ?? [];
              group.push(method);
              groups.set(nextForm, group);
            }
            if (groups.size === 0) groups.set(targetForm, []);

            return Array.from(groups, ([nextForm, group]) => {
              const details = group.reduce<EvolutionMethod[]>(findSimplestEvolution, []);
              return (
                <div key={`${index}:${nextForm ?? ""}`} className="evolution-transition">
                  {details.map((detail, i) => (
                    <EvolutionDetailsCard key={i} details={detail} />
                  ))}
                  <EvolutionCard species={evolution.species} evolvesTo={evolution.evolves_to} form={nextForm} forms={forms} />
                </div>
              );
            });
          })}
        </div>
      )}
    </div>
  );
};

export default EvolutionCard;
