import { cloneTemplates } from "../game.js";

export default class PlayersView {
  #players;
  #currentPlayer;
  constructor(players, currentPlayer) {
    this.#players = players;
    this.#currentPlayer = currentPlayer;
  }

  #createPlayerAvatar({ name, isTheSamePlayer }) {
    const playerTemplate = cloneTemplates("players-template");
    const player = playerTemplate.querySelector("#player");
    const avatar = player.querySelector(".player-avatar");

    player.querySelector(".player-name").textContent = isTheSamePlayer
      ? `${name} (YOU)`
      : name;
    this.#currentPlayer === name && avatar.classList.add("active-player");
    return player;
  }

  renderPlayers() {
    const playerSection = document.getElementById("players");
    const playersEle = this.#players.map(this.#createPlayerAvatar.bind(this));

    playerSection.replaceChildren(...playersEle);
  }
}
