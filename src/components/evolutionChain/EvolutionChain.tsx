import useEvolutionChain from "../../hooks/useEvolutionChain";
import usePokemonInfo from "../../hooks/usePokemonInfo";
import EvolutionCard from "../evolution/EvolutionCard";
import type { EvolutionMethod } from "./evolutionModel";
import "./EvolutionChain.css";

interface Props {
  slug: string;
}

interface EvolutionNode {
  species: { name: string };
  evolution_details: EvolutionMethod[];
  evolves_to: EvolutionNode[];
}

const findPath = (node: EvolutionNode, species: string): EvolutionNode[] | undefined => {
  if (node.species.name === species) return [node];
  for (const child of node.evolves_to) {
    const path = findPath(child, species);
    if (path) return [node, ...path];
  }
};

const EvolutionChain = ({ slug }: Props) => {
  const { data, error } = useEvolutionChain({ slug });
  const { pokemonForm, pokemonSpecies } = usePokemonInfo(slug);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!data) return null;

  const forms: Record<string, string> = {};
  if (pokemonForm && pokemonSpecies) {
    const path = findPath(data.chain, pokemonSpecies.name);
    if (path) {
      forms[pokemonSpecies.name] = 
        pokemonForm.is_battle_only || pokemonForm.is_mega 
        ? pokemonSpecies.name 
        : pokemonForm.name;
      for (let i = path.length - 1; i > 0; i--) {
        const method = path[i].evolution_details.find(
          (details) => details.evolved_pokemon_form?.name === forms[path[i].species.name],
        );
        if (method?.required_pokemon_form) {
          forms[path[i - 1].species.name] = method.required_pokemon_form.name;
        }
      }
    }
  }

  return (
    <div className="evolution-chain">
      <h2 className="title">Evolution</h2>
      <div className="evolution">
        <EvolutionCard
          species={data.chain.species}
          evolvesTo={data.chain.evolves_to}
          form={forms[data.chain.species.name]}
          forms={forms}
        />
      </div>
    </div>
  );
};

export default EvolutionChain;
