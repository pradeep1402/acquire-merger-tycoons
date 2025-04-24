import { InterfaceGame } from "./game.ts";

type Tile = string;

export class CurrentGame {
  private currentState: InterfaceGame;

  constructor(game: InterfaceGame) {
    this.currentState = game;
  }

  playTurn(tile: Tile) {
    return (this.currentState = this.currentState.playTurn(tile));
  }

  getGameState() {
    return this.currentState;
  }
}
