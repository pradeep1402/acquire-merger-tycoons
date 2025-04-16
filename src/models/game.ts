import { Tile } from "./tile.ts";

class Acquire {
  id: string;
  players: { id: number; name: string }[];
  pile: string[];
  board: Tile[];

  constructor(tiles: string[]) {
    this.id = "1";
    this.players = [{ id: 1, name: "krishnanand" }];
    this.pile = tiles;
    this.board = tiles.map((tile: string): Tile => new Tile(tile));
  }

  getBoard(): Tile[] {
    return this.board;
  }
}

export { Acquire };
