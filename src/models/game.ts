import _ from "lodash";
import { Board } from "./board.ts";
import { Player } from "./player.ts";
import { Hotel } from "./hotel.ts";

type Tile = string;

const Imperial = new Hotel("Imperial", "orange");
const Continental = new Hotel("Continental", "sky-blue");
const Worldwide = new Hotel("Worldwide", "purple");
const Tower = new Hotel("Tower", "yellow");
const Sackson = new Hotel("Sackson", "red");
const Festival = new Hotel("Festival", "green");
const American = new Hotel("American", "violet");

const Hotels = [
  Imperial,
  Continental,
  Worldwide,
  Tower,
  Sackson,
  Festival,
  American,
];

export class Game {
  private board: Board;
  private pile: Tile[];
  private players: Player[];
  private currentPlayerIndex: number;

  constructor(tiles: Tile[], playerIds: string[]) {
    this.board = new Board(Hotels);
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

  private assignTile() {
    const currentPlayer = this.players[this.currentPlayerIndex];
    const [tile] = this.getTiles(1);
    currentPlayer.addTile(tile);
  }

  updateCurrentPlayerIndex() {
    this.assignTile();
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) %
      this.players.length;
  }

  placeTile(tile: Tile) {
    const currentPlayer = this.players[this.currentPlayerIndex];

    if (currentPlayer.isTileExits(tile)) {
      const placeInfo = this.board.placeTile(tile);
      currentPlayer.removeTile(tile);
      return placeInfo;
    }

    return { status: false };
  }

  // getHotelDetails();

  foundHotel(tile: Tile, hotel: string) {
    return this.board.buildHotel(tile, hotel);
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
    // const inActiveHotels = this.getInactiveHotels()
    // const activeHotels = this.getInactiveHotels()
    return { board, playersId, currentPlayerId };
  }
}
