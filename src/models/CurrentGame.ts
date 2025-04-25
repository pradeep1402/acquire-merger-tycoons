import { Game } from "./game.ts";

type Tile = string;

export class CurrentGame {
  private currentState: Game;

  constructor(game: Game) {
    this.currentState = game;
  }

  playTurn(tile: Tile): Game {
    return (this.currentState = this.currentState.playTurn(tile));
  }

  getGameState(): Game {
    return this.currentState;
  }
}
