import _ from "lodash";
import { Board } from "./board.ts";
import { Player } from "./player.ts";

type Tile = string;

export class Game {
  private board: Board;
  private pile: Tile[];
  private players: Player[];
  private currentPlayerIndex: number;

  constructor(tiles: Tile[], playerIds: string[]) {
    this.board = new Board();
    this.pile = _.shuffle(tiles);
    this.players = this.setPlayers(playerIds);
    this.currentPlayerIndex = 0;
  }

  private setPlayers(playerIds: string[]) {
    return playerIds.map((player: string): Player => {
      const tiles = this.getTiles(6);
      return new Player(player, tiles);
    });
  }

  private updateCurrentPlayerIndex() {
    this.currentPlayerIndex =
      (this.currentPlayerIndex + 1) % this.players.length;
  }

  placeTile(tile: Tile) {
    if (this.players[this.currentPlayerIndex].isTileExits(tile)) {
      this.board.placeTile(tile);
      return { status: true };
    }

    return { status: false };
  }

  getPlayerIds() {
    return this.players.map((player) => player.getPlayerDetails().playerId);
  }

  getTiles(count: number): string[] {
    return this.pile.splice(0, count);
  }

  getBoard() {
    return this.board.getBoard();
  }

  getPlayerDetails(playerId: string) {
    const playerInfo = this.players.find((player: Player) =>
      player.doesPlayerMatch(playerId)
    );

    return playerInfo?.getPlayerDetails();
  }

  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex].getPlayerDetails().playerId;
  }

  getGameStats() {
    const board = this.getBoard();
    const currentPlayerId = this.getCurrentPlayer();
    const playersId = this.getPlayerIds();
    return { board, playersId, currentPlayerId };
  }
}
