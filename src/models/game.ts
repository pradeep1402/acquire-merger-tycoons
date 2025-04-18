import { Tile } from "./tile.ts";
import { Player } from "./player.ts";
import _ from "lodash";

class Acquire {
  private players: Player[];
  private pile: string[];
  private board: Tile[];

  constructor(tiles: string[], players: string[]) {
    this.pile = _.shuffle(tiles);
    this.board = tiles.map((tile: string): Tile => new Tile(tile));
    this.players = players.map(
      (playerId: string): Player => new Player(playerId, this.getTiles(6)),
    );
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
