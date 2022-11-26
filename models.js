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
          <img class="img-fluid" src="./assets/name-banner.png"/>
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
            <button class="btn feed"> <img src="./assets/action-icons/feed.png" class="img-fluid" /> </button>
            <button class="btn play"> <img src="./assets/action-icons/play.png" class="img-fluid" /> </button>
            <button class="btn exercise"> <img src="./assets/action-icons/exercise.png" class="img-fluid" /> </button>
            <button class="btn flush"> <img src="./assets/action-icons/flush.png" class="img-fluid" /> </button>
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

    const bg = this.generateBackground();

    $(".pokemon-card").css("background-image", `url(${bg})`);
    this.checkStats();
  }

  /** Adds weight, removes hunger, adds happiness for current Pokemon */
  feed() {
    this.weightGained += feed_adds_weight;

    if (this.weightGained >= 60) {
      this.happiness -= 10;
    } else if (this.happiness < 100) {
      this.happiness += feed_adds_happiness;
    }

    if (this.hunger > 6) {
      this.hunger -= feed_removes_hunger;
    }

    this.checkStats();
    this.addEmote("love");
  }

  /** Removes weight, adds hunger, adds happiness for current Pokemon */
  play() {
    if (this.happiness <= 80) {
      this.happiness += play_adds_happiness;

      if (this.weight + this.weightGained >= 21) {
        this.weight -= play_removes_weight;
      }

    } else {
      this.addEmote("no-thanks");
    }

    this.addEmote("stars");
    this.checkStats();
  }

  /** Removes weight, adds hunger, removes happiness for current Pokemon.
   * Pokemon must be at least 20 weight
   */
  exercise() {
    if (this.weight + this.weightGained >= 21) {
      this.hunger += exercise_adds_hunger;
      this.weightGained -= exercise_removes_weight;
      this.happiness -= exercise_removes_happiness;

      this.addEmote("cool");
      this.checkStats();
    }
  }

  /** 25000ms interval for adding to poop count & showing poop icon on UI */
  poop() {
    const poopTimer = setInterval(() => {
      if (this.poopCount < 3) {
        $(`.poop img:nth-child(${this.poopCount + 1})`).show();
        this.poopCount++;
      }
    }, 25000);
    this.poopTimer = poopTimer;
  }

  /** Flush animation, removes poop icons on UI, resets poopTimer interval, + happiness */
  flush() {
    if (this.poopCount >= 1) {
      $(".pokemon-card").addClass("flush");
      $(`.poop img`).hide();
      this.poopCount = 0;
      this.happiness += 10;

      setTimeout(() => {
        $(".pokemon-card").removeClass("flush");
      }, 2001);

      clearInterval(this.poopTimer);
      this.poop();
    } else {
      this.addEmote("no-thanks");
    }
  }
  /** Updates UI with stats. Text color changes based on status */
  checkStats() {
    let weight = this.weightGained;
    let happiness = this.happiness;
    let hunger = this.hunger;

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
          this.changeTextColor("happiness", "success");
        } else if (happiness < 50 && happiness >= 30) {
          this.changeTextColor("happiness", "warning");
        } else if (happiness <= 29) {
          this.changeTextColor("happiness", "danger");
        }
      }
    }

    for (let state in weightStates) {
      if (weight <= weightStates[state]) {
        $(".weight>small").text(`(${state})`);
        $(".weight>small").removeClass();

        if (weight <= 25 && weight > -10) {
          this.changeTextColor("weight", "success");
        } else if (weight <= 40 && weight > 25) {
          this.changeTextColor("weight", "warning");
        } else if (weight <= -10 || weight > 41) {
          this.changeTextColor("weight", "danger");
        }
      }
    }

    $(".weight>span").text(this.weight + this.weightGained);

    for (let state in hungerStates) {
      if (hunger >= hungerStates[state]) {
        $(".hunger>span").text(state);
        $(".hunger>span").removeClass();

        if (hunger >= 45 && hunger < 70) {
          this.changeTextColor("hunger", "warning");
          this.addEmote("angry");
        } else if (hunger >= 70) {
          this.addEmote("dying");
          this.changeTextColor("hunger", "danger");
        }
      }
    }

    this.checkIfAlive();
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
    if (this.hunger >= 100 || this.happiness <= 0) {
      this.showRIP();
    }
  }
  /** Clears intervals, disables buttons, show RIP sprite, restart btn enabled */
  showRIP() {
    this.addEmote("ko");
    clearInterval(this.timerId);
    clearInterval(this.poopTimer);

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
      this.hunger += 2;
      this.weight -= 1;
      this.checkStats();
      this.addEmote("random");

      // if poop is visible, multiply the unhappiness
      if (this.poopCount > 1) {
        this.happiness -= 1 * this.poopCount;
        this.addEmote("angry");
      } else {
        this.happiness -= 1;
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
    let emotes = ["stars", "quiet", "cool", "heart", "tired"];

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

// Bind action buttons to click events
$("#poke-container").on('click', ".feed", () => {
  currentPokemon.feed()
});

$("#poke-container").on('click', ".exercise", () => {
  currentPokemon.exercise()
});

$("#poke-container").on('click', ".play", () => {
  currentPokemon.play()
});

$("#poke-container").on('click', ".flush", () => {
  currentPokemon.flush()
});