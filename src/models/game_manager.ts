import { Game } from "./game.ts";
class GameManager {
  private gamesMap: Map<string, Game>;
  private tiles: string[];

  constructor(tiles: string[]) {
    this.tiles = tiles;
    this.gamesMap = new Map();
  }

  createGame(gameId: string, playerIds: string[]): Game {
    const acquire = new Game(this.tiles, playerIds);
    this.gamesMap.set(gameId, acquire);

    return acquire;
  }

  getGame(gameId: string): Game | undefined {
    return this.gamesMap.get(gameId);
  }
}

export { GameManager };
