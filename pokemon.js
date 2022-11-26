// pokemon
const BASE_URL = "https://pokeapi.co/api/v2";
const MAX_POKEMON = "650";
const AUTO_SAVE_IN_MS = "60000"

$adoptPokemonBtn = $("#generate-pokemon");

let currentPokemon;

/** Pass in int to request data of that pokemon num */
async function fetchPokemonData(num) {
  let response = await axios({
    url: `${BASE_URL}/pokemon/${num}`,
  });

  // Return animated gif
  response.data.sprites =
    response.data.sprites.versions["generation-v"][
      "black-white"
    ].animated.front_default;

  // Setting Default Values
  response.data.weightGained = 0;
  response.data.hunger = 44;
  response.data.happiness = 50;

  let pokemon = new Pokemon(response.data);
  return pokemon;
}

/** Generate a random num withing MAX_POKEMON range to generate Pokemon card */
async function generatePokemon() {
  $("#poke-container").empty();
  let randomId = Math.floor(Math.random() * MAX_POKEMON + 1);
  let pokemon = await fetchPokemonData(randomId);
  currentPokemon = pokemon;

  pokemon.createCard();
  savePokemon();
  $(".feed").on("click", currentPokemon.feed);

}

/** Click handler for generating Pokemon, hude button */
async function adoptPokemonClick() {
  await generatePokemon();
  $adoptPokemonBtn.hide();
}

/** Saves Current Pokemon to Local Storage */
function savePokemon() {
  localStorage.setItem("myPokemon", JSON.stringify(currentPokemon));
}

/** Fetch saved Pokemon from Local Storage */
function getSavedPokemon() {
  return JSON.parse(localStorage.getItem("myPokemon"));
}

/** Checks to see if there is saved Pokemon in Local Storage */
function checkForSavedPokemon() {
  let savedPokemon = getSavedPokemon();

  if (savedPokemon) {
    let pokemon = new Pokemon(savedPokemon);
    currentPokemon = pokemon;
    pokemon.createCard();

    return true;
  }
  return false;
}

/** Interval to auto save Pokemon every 1 min */
function setAutoSave() {
  //Saves every 1 min
  setInterval(() => {
    savePokemon()
  }, AUTO_SAVE_IN_MS);
}