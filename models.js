const ASSET_URL = "/assets";

// CONFIG: Values for stats
const feed_adds_happiness = 1;
const feed_adds_weight = 2;
const feed_removes_hunger = 7;
const exercise_removes_weight = 2;
const exercise_adds_hunger = 5;
const exercise_removes_happiness = 4;
const play_removes_weight = 1;
const play_adds_hunger = 1;
const play_adds_happiness = 2;

// Statuses
const hungerStates = {
  "Extremely Stuffed": 0,
  "Very Full": 10,
  "Full": 20,
  "Not Hungry": 30,
  "Hungry": 45,
  "Very Hungry": 55,
  "Starving": 70,
  "Dying": 85,
  "Starved to Death": 100,
};

const weightStates = {
  "Extremely Overweight": 300,
  "Overweight": 60,
  "Looking Plump": 40,
  "Healthy": 25,
  "Unhealthy": -10,
  "Malnourished": -20,
};

const happinessStates = {
  "Over the Moon": 100,
  "Overjoyed": 80,
  "Very Happy": 70,
  "Happy": 60,
  "Content": 50,
  "A little Down": 40,
  "Sad": 30,
  "Miserable": 20,
  "Depressed": 10,
  "Severely Depressed": 0,
};


/** A Single Pokemon */
class Pokemon {
    /** Make instance of Pokemon from PokeAPI response.data:
   *   - {weight, sprites, name, weightGained, happiness, hunger}
   *  contains additional data for tracking poop count and intervals
   */
  constructor({ weight, sprites, name, weightGained, happiness, hunger}) {
    this.name = name;
    this.weight = weight;
    this.weightGained = weightGained;
    this.sprites = sprites;
    this.happiness = happiness;
    this.hunger = hunger;
    this.timerId = 0;
    this.decreaseStatsOvertime();
    this.poopCount = 0;
    this.poopTimer = 0;
    this.poop();
  }

  /** Creates UI Card for Pokemon
   * Populates stats, background,
   * and binds action buttons to current Pokemon
   */
  createCard() {
    $("#poke-container").append(
      `<div class="card text-center col-md-6 col offset-md-3">
        <div class="name-banner">
          <img class="img-fluid" src="/assets/name-banner.png"/>
          <h2>${this.name}</h2>
        </div>
        <div class="card border-0 pokemon-card">
          <span class="sprite-wrapper">
            <img class="pokemon-sprite" src="${this.sprites}"/>
          </span>
          <div class="poop">
            <img src="./assets/poop.gif"/>
            <img src="./assets/poop.gif"/>
            <img src="./assets/poop.gif"/>
          </div>
          <div class="action-btns py-4">
            <button class="btn btn-outline-light feed">Feed</button>
            <button class="btn btn-outline-light play">Play</button>
            <button class="btn btn-outline-light exercise">Exercise</button>
            <button class="btn btn-outline-light flush">Flush</button>
          </div>
        </div>
          <div class="stats mt-3 row">
            <p class="col-12 col-md-4 weight">Weight: <span>${
              this.weight + this.weightGained
            } </span> <small>(Healthy)</small></p>
            <p class="col-12 col-md-4 happiness">Happiness: <span>Content</span> </p>
            <p class="col-12 col-md-4 hunger">Hunger: <span>Not Hungry</span> </p>
          </div>
      </div>`
    );

    $("#poke-container").on(
      "click",
      ".feed",
      currentPokemon.feed.bind(currentPokemon)
    );
    $("#poke-container").on(
      "click",
      ".play",
      currentPokemon.play.bind(currentPokemon)
    );
    $("#poke-container").on(
      "click",
      ".exercise",
      currentPokemon.exercise.bind(currentPokemon)
    );

    $("#poke-container").on(
      "click",
      ".flush",
      currentPokemon.flush.bind(currentPokemon)
    );

    const bg = this.generateBackground();

    $(".pokemon-card").css("background-image", `url(${bg})`);
    this.checkStats();
  }

  /** Adds weight, removes hunger, adds happiness for current Pokemon */
  feed() {
    currentPokemon.weightGained += feed_adds_weight;

    if (currentPokemon.weightGained >= 60) {
      currentPokemon.happiness -= 10;
    } else if (currentPokemon.happiness < 100) {
      currentPokemon.happiness += feed_adds_happiness;
    }

    if (currentPokemon.hunger > 6) {
      currentPokemon.hunger -= feed_removes_hunger;
    }

    currentPokemon.checkStats();
    currentPokemon.addEmote("heart");
  }

  /** Removes weight, adds hunger, adds happiness for current Pokemon */
  play() {
    if (currentPokemon.happiness <= 80) {
      currentPokemon.happiness += play_adds_happiness;
      if (currentPokemon.weight + currentPokemon.weightGained >= 20) {
        currentPokemon.weight -= play_removes_weight;
      }
    } else {
      currentPokemon.addEmote("quiet");
    }

    currentPokemon.addEmote("cool");
    currentPokemon.checkStats();
  }

  /** Removes weight, adds hunger, removes happiness for current Pokemon.
   * Pokemon must be at least 20 weight
   */
  exercise() {
    if (currentPokemon.weight + currentPokemon.weightGained >= 20) {
      currentPokemon.hunger += exercise_adds_hunger;
      currentPokemon.weightGained -= exercise_removes_weight;
      currentPokemon.happiness -= exercise_removes_happiness;
      currentPokemon.checkStats();
      currentPokemon.addEmote("stars");
    }
  }

  /** 25000ms interval for adding to poop count & showing poop icon on UI */
  poop() {
    const poopTimer = setInterval(() => {
      if (currentPokemon.poopCount < 3) {
        $(`.poop img:nth-child(${currentPokemon.poopCount + 1})`).show();
        currentPokemon.poopCount++;
      }
    }, 25000);
    this.poopTimer = poopTimer;
  }

  /** Flush animation, removes poop icons on UI, resets poopTimer interval, + happiness */
  flush() {
    if (currentPokemon.poopCount >= 1) {
      $(".pokemon-card").addClass("flush");
      $(`.poop img`).hide();
      currentPokemon.poopCount = 0;
      currentPokemon.happiness += 10;

      setTimeout(() => {
        $(".pokemon-card").removeClass("flush");
      }, 2001);

      clearInterval(this.poopTimer);
      currentPokemon.poop();
    }
  }
  /** Updates UI with stats. Text color changes based on status */
  checkStats() {
    let weight = currentPokemon.weightGained;
    let happiness = currentPokemon.happiness;
    let hunger = currentPokemon.hunger;

    $(".weight>small").empty();
    $(".hunger>small").empty();
    $(".happiness>small").empty();

    for (let state in happinessStates) {
      if (happiness <= happinessStates[state]) {
        $(".happiness>span").text(state);
        $(".happiness>span").removeClass(
          "text-success text-warning text-danger"
        );

        if (happiness >= 50) {
          currentPokemon.changeTextColor("happiness", "success");
        } else if (happiness <= 49 && happiness >= 30) {
          currentPokemon.changeTextColor("happiness", "warning");
        } else if (happiness <= 29) {
          currentPokemon.changeTextColor("happiness", "danger");
        }
      }
    }

    for (let state in weightStates) {
      if (weight <= weightStates[state]) {
        $(".weight>small").text(`(${state})`);
        $(".weight>small").removeClass();

        if (weight <= 25 && weight > -10) {
          currentPokemon.changeTextColor("weight", "success");
        } else if (weight <= 40 && weight > 25) {
          currentPokemon.changeTextColor("weight", "warning");
        } else if (weight <= -10 || weight > 41) {
          currentPokemon.changeTextColor("weight", "danger");
        }
      }
    }

    $(".weight>span").text(currentPokemon.weight + currentPokemon.weightGained);

    for (let state in hungerStates) {
      if (hunger >= hungerStates[state]) {
        $(".hunger>span").text(state);
        $(".hunger>span").removeClass();

        if (hunger >= 45 && hunger < 70) {
          currentPokemon.changeTextColor("hunger", "warning");
        } else if (hunger >= 70) {
          currentPokemon.addEmote("angry");
          currentPokemon.changeTextColor("hunger", "danger");
        }
      }
    }

    currentPokemon.checkIfAlive();
  }

  /** Takes in status selector and state color to return correct styles */
  changeTextColor(status, state) {
    if (status === "weight") {
      $(`.${status}>small`).addClass(`text-${state}`);
    } else {
      $(`.${status}>span`).addClass(`text-${state}`);
    }
  }

  /** Checks to see if hunger and hapiness meets conditions to show RIP  */
  checkIfAlive() {
    if (currentPokemon.hunger >= 100 || currentPokemon.happiness <= 0) {
      currentPokemon.showRIP();
    }
  }
  /** Clears intervals, disables buttons, show RIP sprite, restart btn enabled */
  showRIP() {
    currentPokemon.addEmote("ko");
    clearInterval(currentPokemon.timerId);
    clearInterval(currentPokemon.poopTimer);

    $(".action-btns").css("cursor", "not-allowed");
    $(".action-btns .btn")
      .prop("disabled", true)
      .addClass("btn-outline-dark")
      .removeClass("btn-outline-info");

    $(".pokemon-sprite").attr("src", "./assets/rip.png");
    $adoptPokemonBtn.text("Adopt a New Pokemon");
    $adoptPokemonBtn.show();
  }

  /** 10000ms interval to descrease/increase hunger,weight,happiness stats.  */
  decreaseStatsOvertime() {
    let timer = setInterval(() => {
      currentPokemon.hunger += 2;
      currentPokemon.weight -= 1;
      currentPokemon.checkStats();
      currentPokemon.addEmote("random");

      // if poop is visible, multiply the unhappiness
      if (currentPokemon.poopCount > 1) {
        currentPokemon.happiness -= 1 * currentPokemon.poopCount;
        currentPokemon.addEmote("angry");
      } else {
        currentPokemon.happiness -= 1;
      }
    }, 10000);

    this.timerId = timer;
  }

  /** return random background in list */
  generateBackground() {
    let backgrounds = ["Desert", "Field", "Forest", "Hills", "Snow"];
    let randomIdx = Math.floor(Math.random() * backgrounds.length);
    let randomBg = `./${ASSET_URL}/${backgrounds[randomIdx]}.png`;
    return randomBg;
  }

  /** Displays emote on UI. Can pass in different styles */
  addEmote(emote) {
    let emotes = ["stars", "quiet", "cool", "heart"];

    if (emote === "ko") {
      $(".sprite-wrapper").addClass(emote);

    } else {

      if (emote === "random") {
        let randomIdx = Math.floor(Math.random() * emotes.length);
        emote = emotes[randomIdx];
      }

      $(".sprite-wrapper").addClass(emote);
      setTimeout(() => {
        $(".sprite-wrapper").removeClass(emote);
      }, 2000);
    }
  }
}