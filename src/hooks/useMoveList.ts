import { useQuery } from "@tanstack/react-query";
import pokedex from "../services/pokedexService";

export const damageClasses = ["physical", "special", "status"] as const;
export type DamageClass = typeof damageClasses[number];

const useMoveList = (type?: string, damageClass?: DamageClass, enabled = true) =>
  useQuery({
    queryKey: ["move-list", type ?? "all", damageClass ?? "all"],
    enabled,
    queryFn: async () => {
      const [list, typeData, classData] = await Promise.all([
        pokedex.getMovesList({ offset: 0, limit: 10000 }),
        type ? pokedex.getTypeByName(type) : Promise.resolve(undefined),
        damageClass ? pokedex.getMoveDamageClassByName(damageClass) : Promise.resolve(undefined),
      ]);
      const typeMoves = typeData && new Set(typeData.moves.map((move) => move.name));
      const classMoves = classData && new Set(classData.moves.map((move) => move.name));
      return list.results.filter((move) =>
        (!typeMoves || typeMoves.has(move.name)) && (!classMoves || classMoves.has(move.name))
      );
    },
    staleTime: 24 * 60 * 60 * 1000,
  });

export default useMoveList;
