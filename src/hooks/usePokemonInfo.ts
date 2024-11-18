import { PokemonForm, PokemonSpecies } from "pokeapi-js-wrapper";
import { useEffect, useState } from "react";
import pokedex from "../services/pokedexService";
import usePokemonStore from "../store";

const artworkBaseURL = import.meta.env.VITE_POKEMON_ARTWORK_BASE_URL;

const usePokemonInfo = (slug: string) => {
  const language = usePokemonStore((state) => state.language);
  const getPokemonInfo = usePokemonStore((state) => state.getPokemonInfo);
  const addPokemonInfo = usePokemonStore((state) => state.addPokemonInfo);
  const [pokedexNumber, setPokedexNumber] = useState<number>();
  const [pokemonName, setPokemonName] = useState<string>();
  const [pokemonFormName, setPokemonFormName] = useState<string>();
  const [types, setTypes] = useState<string[]>([]);
  const [artworkURL, setArtworkURL] = useState<string>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pokemonInfo = getPokemonInfo(slug);
    debugger; // eslint-disable-line
    if (pokemonInfo) {
      setPokemonName(pokemonInfo.pokemonName);
      setPokemonFormName(pokemonInfo.pokemonFormName);
      setPokedexNumber(pokemonInfo.pokedexNumber);
      setArtworkURL(pokemonInfo.artworkUrl);
      setTypes(pokemonInfo.types);
      setLoading(false);
    } else {
      pokedex.getPokemonByName(slug).then(async (data) => {
        const species: PokemonSpecies = await pokedex.resource(data.species.url);
        const form: PokemonForm = await pokedex.getPokemonFormByName(data.forms[0].name);
        setPokedexNumber(species.pokedex_numbers.find((n) => n.pokedex.name === "national")?.entry_number);
        setPokemonName(species.names.find((n) => n.language.name === language)?.name);
        setPokemonFormName(form.names.find((f) => f.language.name === language)?.name);
        setArtworkURL(`${artworkBaseURL}${data.id}.png`);
        setTypes(data.types.map((type) => type.type.name));
        setLoading(false);
        addPokemonInfo(slug, {
          pokedexNumber: species.pokedex_numbers.find((n) => n.pokedex.name === "national")?.entry_number ?? 0,
          pokemonName: species.names.find((n) => n.language.name === language)?.name ?? "",
          pokemonFormName: form.names.find((f) => f.language.name === language)?.name ?? "",
          types: data.types.map((type) => type.type.name),
          artworkUrl: `${artworkBaseURL}${data.id}.png`,
        });
      });
    }
  }, [addPokemonInfo, getPokemonInfo, language, slug]);
  
  return { pokedexNumber, pokemonName, pokemonFormName, types, artworkURL, loading };
}

export default usePokemonInfo;
