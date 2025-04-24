import { CurrentGame } from "./CurrentClass.ts";
import { Game } from "./game.ts";
import { Hotel } from "./hotel.ts";
class GameManager {
  private gamesMap: Map<string, Game>;
  private gameStateMap: Map<string, CurrentGame>;
  private tileGenerator: () => string[];
  private hotels: Hotel[];

  constructor(tileGenerator: () => string[], hotels: Hotel[]) {
    this.tileGenerator = tileGenerator;
    this.gamesMap = new Map();
    this.gameStateMap = new Map();
    this.hotels = hotels;
  }

  createGame(gameId: string, playerIds: string[]): Game {
    const game = new Game(this.tileGenerator(), playerIds, this.hotels);
    const currentGame = new CurrentGame(game);
    this.gamesMap.set(gameId, game);
    this.gameStateMap.set(gameId, currentGame);

    return game;
  }

  getGame(gameId: string): Game | undefined {
    return this.gamesMap.get(gameId);
  }

  getCurrentGame(gameId: string): CurrentGame | undefined {
    return this.gameStateMap.get(gameId);
  }
}

export { GameManager };
