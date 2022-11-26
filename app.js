
/** Starts PokeGotchi Up */
function startApp() {
  console.log("PokeGotchi has started!");
  $adoptPokemonBtn.on("click", adoptPokemonClick)
  $adoptPokemonBtn.hide();

  let savedPokemon = checkForSavedPokemon();

  if (!savedPokemon) {
    $adoptPokemonBtn.show();
  }

  setAutoSave();
}

startApp();
