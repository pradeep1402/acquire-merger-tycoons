import { Tile } from "./tile.ts";

export type Player = { id: number; name: string };

class Acquire {
  id: string;
  players: { id: number; name: string }[];
  pile: string[];
  board: Tile[];

  constructor(tiles: string[], player: Player[]) {
    this.id = "1";
    this.players = player;
    this.pile = tiles;
    this.board = tiles.map((tile: string): Tile => new Tile(tile));
  }

  getBoard(): Tile[] {
    return this.board;
  }
}

export { Acquire };
