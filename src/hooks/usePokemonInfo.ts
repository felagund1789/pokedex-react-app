import { Pokemon, PokemonForm, PokemonSpecies } from "pokeapi-js-wrapper";
import { useEffect, useState } from "react";
import pokedex from "../services/pokedexService";
import usePokemonStore, { PokemonInfo } from "../store";

const usePokemonInfo = (slug: string) => {
  const language = usePokemonStore((state) => state.language);
  const getPokemonInfo = usePokemonStore((state) => state.getPokemonInfo);
  const addPokemonInfo = usePokemonStore((state) => state.addPokemonInfo);
  const [pokemonForm, setPokemonForm] = useState<PokemonForm>();
  const [pokemon, setPokemon] = useState<Pokemon>();
  const [pokemonSpecies, setPokemonSpecies] = useState<PokemonSpecies>();
  const [pokedexNumber, setPokedexNumber] = useState<number>();
  const [pokemonName, setPokemonName] = useState<string>();
  const [pokemonFormName, setPokemonFormName] = useState<string>();
  const [pokemonGenera, setPokemonGenera] = useState<string>();
  const [habitat, setHabitat] = useState<string>();
  const [generation, setGeneration] = useState<string>();
  const [types, setTypes] = useState<string[]>([]);
  const [artworkURL, setArtworkURL] = useState<string>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pokemonInfo: PokemonInfo | undefined = getPokemonInfo(slug);
    if (pokemonInfo) {
      setPokemonForm(pokemonInfo.pokemonForm);
      setPokemon(pokemonInfo.pokemon);
      setPokemonSpecies(pokemonInfo.pokemonSpecies);
      setPokemonName(pokemonInfo.pokemonName);
      setPokemonFormName(pokemonInfo.pokemonFormName);
      setPokemonGenera(pokemonInfo.pokemonGenera);
      setHabitat(pokemonInfo.habitat);
      setPokedexNumber(pokemonInfo.pokedexNumber);
      setArtworkURL(pokemonInfo.artworkUrl);
      setTypes(pokemonInfo.types);
      setGeneration(pokemonInfo.generation);
      setLoading(false);
    } else {
      pokedex.getPokemonFormByName(slug).then(async (form: PokemonForm) => {
        const pokemon: Pokemon = await pokedex.resource(form.pokemon.url) as Pokemon;
        const species: PokemonSpecies = await pokedex.resource(pokemon.species.url);
        const artworkUrl = form.sprites.other["official-artwork"].front_default || pokemon.sprites.other["official-artwork"].front_default;
        setPokemonForm(form);
        setPokemon(pokemon);
        setPokemonSpecies(species);
        setPokedexNumber(species.pokedex_numbers.find((n) => n.pokedex.name === "national")?.entry_number);
        setPokemonName(species.names.find((n) => n.language.name === language)?.name);
        setPokemonFormName(form.names.find((f) => f.language.name === language)?.name);
        setPokemonGenera(species.genera.find((g) => g.language.name === language)?.genus);
        setHabitat(species.habitat?.name ?? "");
        setArtworkURL(artworkUrl);
        setTypes(form.types.map((type) => type.type.name));
        setGeneration(species.generation.name.replace("generation-", "").toUpperCase());
        setLoading(false);
        addPokemonInfo(slug, {
          pokemonForm: form,
          pokemon: pokemon,
          pokemonSpecies: species,
          pokedexNumber: species.pokedex_numbers.find((n) => n.pokedex.name === "national")?.entry_number ?? 0,
          pokemonName: species.names.find((n) => n.language.name === language)?.name ?? "",
          pokemonFormName: form.names.find((f) => f.language.name === language)?.name ?? "",
          pokemonGenera: species.genera.find((g) => g.language.name === language)?.genus ?? "",
          habitat: species.habitat?.name ?? "",
          types: form.types.map((type) => type.type.name),
          artworkUrl: artworkUrl,
          generation: species.generation.name.replace("generation-", "").toUpperCase(),
        });
      });
    }
  }, [addPokemonInfo, getPokemonInfo, language, slug]);

  return {
    pokemonForm,
    pokemon,
    pokemonSpecies,
    pokedexNumber,
    pokemonName,
    pokemonFormName,
    pokemonGenera,
    habitat,
    generation,
    types,
    artworkURL,
    loading
  };
};

export default usePokemonInfo;
