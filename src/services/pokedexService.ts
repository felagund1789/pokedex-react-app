import { Pokedex } from "pokeapi-js-wrapper";

const timeout = 24 * 60 * 60 * 1000;
const pokedex = new Pokedex({
  cache: true,
  cacheImages: true,
  timeout,
});

export default pokedex;
