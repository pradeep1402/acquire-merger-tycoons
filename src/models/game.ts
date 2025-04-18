import { Tile } from "./tile.ts";
import { Player } from "./player.ts";
import _ from "lodash";

class Acquire {
  private players: Player[];
  private pile: string[];
  private board: Tile[];
  private currentPlayerIndex: number;

  constructor(tiles: string[], players: string[]) {
    this.pile = _.shuffle(tiles);
    this.board = tiles.map((tile: string): Tile => new Tile(tile));
    this.players = players.map((player: string): Player => {
      const tiles = this.getTiles(6);
      return new Player(player, tiles);
    });
    this.currentPlayerIndex = 0;
  }

  getCurrentPlayer() {
    const index = this.currentPlayerIndex % this.players.length;

    return this.players[index].toJSON().id;
  }

  getBoard() {
    return this.board.map((tile) => tile.toJSON());
  }

  getTiles(count: number): string[] {
    return this.pile.splice(0, count);
  }

  getAllPlayers() {
    return this.players.map((p) => p.toJSON());
  }

  getPlayer(player: string) {
    const playerDetails = _.find(
      this.players,
      (p: Player) => p.toJSON().id === player,
    );

    return playerDetails.toJSON();
  }
}

export { Acquire };
