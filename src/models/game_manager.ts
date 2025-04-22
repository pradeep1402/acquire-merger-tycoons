import { Game } from "./game.ts";
import { Hotel } from "./hotel.ts";
class GameManager {
  private gamesMap: Map<string, Game>;
  private tiles: string[];
  private hotels: Hotel[];

  constructor(tiles: string[], hotels: Hotel[]) {
    this.tiles = tiles;
    this.gamesMap = new Map();
    this.hotels = hotels;
  }

  createGame(gameId: string, playerIds: string[]): Game {
    const acquire = new Game(this.tiles, playerIds, this.hotels);
    this.gamesMap.set(gameId, acquire);

    return acquire;
  }

  getGame(gameId: string): Game | undefined {
    return this.gamesMap.get(gameId);
  }
}

export { GameManager };
