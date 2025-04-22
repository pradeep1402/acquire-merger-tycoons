import { Game } from "./game.ts";
import { Hotel } from "./hotel.ts";
class GameManager {
  private gamesMap: Map<string, Game>;
  private tileGenerator: () => string[];
  private hotels: Hotel[];

  constructor(tileGenerator: () => string[], hotels: Hotel[]) {
    this.tileGenerator = tileGenerator;
    this.gamesMap = new Map();
    this.hotels = hotels;
  }

  createGame(gameId: string, playerIds: string[]): Game {
    const game = new Game(this.tileGenerator(), playerIds, this.hotels);
    this.gamesMap.set(gameId, game);

    return game;
  }

  getGame(gameId: string): Game | undefined {
    return this.gamesMap.get(gameId);
  }
}

export { GameManager };
