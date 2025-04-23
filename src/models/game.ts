import _ from "lodash";
import { Board, PlaceType } from "./board.ts";
import { HotelName, Player } from "./player.ts";
import { Hotel } from "./hotel.ts";

type Tile = string;
export type buyStocks = {
  hotel: HotelName;
  count: number;
};

export class Game {
  private board: Board;
  private pile: Tile[];
  private players: Player[];
  private currentPlayerIndex: number;

  constructor(tiles: Tile[], playerIds: string[], hotels: Hotel[]) {
    this.board = new Board(hotels);
    this.pile = [...tiles];
    this.players = this.initializePlayers(playerIds);
    this.currentPlayerIndex = 0;
  }

  private initializePlayers(playerIds: string[]) {
    return playerIds.map((player: string): Player => {
      const tiles = this.getTiles(6);
      return new Player(player, tiles);
    });
  }

  changeTurn() {
    this.assignTile();
    this.updateCurrentPlayerIndex();
    return { status: this.getCurrentPlayer() };
  }

  private assignTile() {
    const currentPlayer = this.players[this.currentPlayerIndex];
    const [tile] = this.getTiles(1);
    currentPlayer.addTile(tile);
  }

  private updateCurrentPlayerIndex() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) %
      this.players.length;
  }

  buyStocks(hotels: buyStocks[]) {
    const currentPlayer = this.players[this.currentPlayerIndex];

    for (const { hotel, count } of hotels) {
      const [hotelInstance] = this.board.getHotel(hotel);

      if (hotelInstance.areStocksEnough(count)) {
        const price = hotelInstance.calculatePrice(count);
        currentPlayer.deductCash(price);
        currentPlayer.addStock(count, hotel);
      }
    }

    return currentPlayer.getPlayerDetails();
  }

  placeTile(tile: Tile) {
    const currentPlayer = this.players[this.currentPlayerIndex];

    if (!currentPlayer.isTileExits(tile)) return { status: false };

    const placeInfo = this.board.getPlaceTileType(tile);

    if (
      placeInfo.type === PlaceType.Dependent ||
      placeInfo.type === PlaceType.Independent
    ) {
      currentPlayer.removeTile(tile);
      return placeInfo;
    }

    return placeInfo;
  }

  foundHotel(tile: Tile, hotel: HotelName) {
    const buildHotel = this.board.buildHotel(tile, hotel);
    const currentPlayer = this.players[this.currentPlayerIndex];

    currentPlayer.addStock(1, hotel);
    currentPlayer.removeTile(tile);

    return buildHotel;
  }

  getPlayerIds() {
    return this.players.map((player) => player.getPlayerDetails().playerId);
  }

  private getTiles(count: number): string[] {
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

  private getCurrentPlayer() {
    return this.players[this.currentPlayerIndex].getPlayerDetails().playerId;
  }

  getGameStats() {
    const board = this.getBoard();
    const currentPlayerId = this.getCurrentPlayer();
    const playersId = this.getPlayerIds();

    return { board, playersId, currentPlayerId };
  }
}
