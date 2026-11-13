import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import useEvolutionChain from "../../hooks/useEvolutionChain";
import usePokemon from "../../hooks/usePokemon";
import EvolutionCard from "../evolution/EvolutionCard";
import { resolveEvolutionTree } from "./evolutionModel";
import "./EvolutionChain.css";

interface Props {
  slug: string;
}

const EvolutionChain = ({ slug }: Props) => {
  const { data, error, isLoading } = useEvolutionChain({ slug });
  const pokemon = usePokemon({ slug });
  const [params] = useSearchParams();
  const selectedForm = params.get("form");
  const resolved = useQuery({
    queryKey: ["evolution-display", data, slug, selectedForm],
    queryFn: () => resolveEvolutionTree(data!.chain, pokemon.data!, selectedForm),
    enabled: Boolean(data && pokemon.data),
    staleTime: 24 * 60 * 60 * 1000,
  });

  const failure = error ?? pokemon.error ?? resolved.error;
  if (failure) {
    return <div role="alert">Error: {failure.message}</div>;
  }
  if (isLoading || pokemon.isLoading || !resolved.data) {
    return <div role="status">Loading evolution chain...</div>;
  }

  return (
    <div className="evolution-chain">
      <h2 className="title">Evolution</h2>
      <div className="evolution">
        {resolved.data.map((node) => (
          <EvolutionCard key={node.display.formResource.url} node={node} />
        ))}
      </div>
    </div>
  );
};

export default EvolutionChain;
