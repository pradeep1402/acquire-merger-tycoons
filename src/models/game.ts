import _ from "lodash";
import { Board, buildingHotel, InactiveHotels, PlaceType } from "./board.ts";
import { HotelName, Player } from "./player.ts";
import { Hotel } from "./hotel.ts";
import { Merger, MergerType } from "./merger.ts";

type Tile = string;
export type PlayerDetails = {
  playerId: string;
  cash: number;
  tiles: string[];
  stocks: {
    Sackson: number;
    Tower: number;
    Festival: number;
    Worldwide: number;
    American: number;
    Continental: number;
    Imperial: number;
  };
};

export type BoardReturnType = {
  independentTiles: string[];
  activeHotels: {
    name: string;
    tiles: string[];
    stocksAvailable: number;
    stockPrice: number;
    baseTile: string;
  }[];
  inActiveHotels: {
    name: string;
    tiles: string[];
    stocksAvailable: number;
    stockPrice: number;
    baseTile: string;
  }[];
  mergerTile: string[];
};

export type GameStats = {
  board: {
    independentTiles: string[];
    activeHotels: {
      name: string;
      tiles: string[];
      stocksAvailable: number;
      stockPrice: number;
      baseTile: string;
    }[];
    inActiveHotels: {
      name: string;
      tiles: string[];
      stocksAvailable: number;
      stockPrice: number;
      baseTile: string;
    }[];
    mergerTile: string[];
  };
  playersId: string[];
  currentPlayerId: string;
};

export type PlaceTile =
  | {
    tile: string;
    type: PlaceType;
    hotel?: undefined;
    inActiveHotels?: undefined;
  }
  | {
    tile: string;
    type: PlaceType;
    hotel: {
      name: string;
      tiles: string[];
      stocksAvailable: number;
      stockPrice: number;
      baseTile: string;
    };
    inActiveHotels?: undefined;
  }
  | {
    tile: string;
    type: PlaceType;
    inActiveHotels?: InactiveHotels;
    mergeType?: MergerType;
  };

export type buyStocks = {
  hotel: HotelName;
  count: number;
};

export type FoundHotel =
  | {
    name: string;
    tiles: string[];
    stocksAvailable: number;
    stockPrice: number;
    baseTile: string;
  }
  | undefined;

export interface Game {
  playTurn: (tile: Tile) => Game;
  buyStocks: (
    hotels: buyStocks[],
    playerId: string,
  ) => PlayerDetails | undefined | { error: string };
  placeTile: (tile: Tile) => PlaceTile | { status: boolean };
  foundHotel: (
    tile: Tile,
    hotel: HotelName,
  ) => buildingHotel | { error: string };
  getPlayerIds: () => string[];
  getPlayerDetails: (playerId: string) => PlayerDetails | undefined;
  getGameStats: () => GameStats;
  getAffectedHotels: (tile: Tile) => Hotel[];
  // getSizeOfHotel: (hotelName: string) => number;
  changeTurn: () => { status: string };
}

export class StdGame implements Game {
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

  playTurn(tile: Tile): Game {
    const placeInfo = this.board.getPlaceTileType(tile);

    if (placeInfo.type === PlaceType.Merge) {
      return new Merger(this);
    }
    return this;
  }

  private initializePlayers(playerIds: string[]) {
    return playerIds.map((player: string): Player => {
      const tiles = this.getTiles(6);
      return new Player(player, tiles);
    });
  }

  changeTurn(): { status: string } {
    this.assignTile();
    this.updateCurrentPlayerIndex();
    return { status: this.getCurrentPlayer() };
  }

  private assignTile(): void {
    const currentPlayer = this.players[this.currentPlayerIndex];
    const [tile] = this.getTiles(1);
    currentPlayer.addTile(tile);
  }

  private updateCurrentPlayerIndex(): void {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) %
      this.players.length;
  }

  buyStocks(hotels: buyStocks[], playerId: string): PlayerDetails | undefined {
    const currentPlayer = this.players.find((player) =>
      player.doesPlayerMatch(playerId)
    );

    for (const { hotel, count } of hotels) {
      const [hotelInstance] = this.board.getHotel(hotel);

      if (hotelInstance.areStocksEnough(count) && currentPlayer) {
        const price = hotelInstance.calculatePrice(count);
        currentPlayer.deductCash(price);
        currentPlayer.addStock(count, hotel);
        hotelInstance.decrementStocks(count);
      }
    }

    return currentPlayer?.getPlayerDetails();
  }

  placeTile(tile: Tile): PlaceTile | { status: boolean } {
    const currentPlayer = this.players[this.currentPlayerIndex];

    if (!currentPlayer.isTileExits(tile)) return { status: false };

    const placeInfo = this.board.placeATile(tile);

    if ([PlaceType.Dependent, PlaceType.Independent].includes(placeInfo.type)) {
      currentPlayer.removeTile(tile);
      return placeInfo;
    }

    return placeInfo;
  }

  foundHotel(tile: Tile, hotel: HotelName): buildingHotel {
    const foundedHotel = this.board.buildHotel(tile, hotel);
    const currentPlayer = this.players[this.currentPlayerIndex];

    if (foundedHotel.stockAllotted) currentPlayer.addStock(1, hotel);
    currentPlayer.removeTile(tile);

    return foundedHotel;
  }

  getPlayerIds(): string[] {
    return this.players.map((player) => player.getPlayerDetails().playerId);
  }

  private getTiles(count: number): string[] {
    return this.pile.splice(0, count);
  }

  private getBoard(): BoardReturnType {
    return this.board.getBoard();
  }

  getPlayerDetails(playerId: string): PlayerDetails | undefined {
    const playerInfo = this.players.find((player: Player) =>
      player.doesPlayerMatch(playerId)
    );

    return playerInfo?.getPlayerDetails();
  }

  private getCurrentPlayer(): string {
    return this.players[this.currentPlayerIndex].getPlayerDetails().playerId;
  }

  getAffectedHotels(tile: Tile): Hotel[] {
    return this.board.dependentHotels(tile);
  }

  // getSizeOfHotel(hotelName: string) {}

  getGameStats(): GameStats {
    const board = this.getBoard();
    const currentPlayerId = this.getCurrentPlayer();
    const playersId = this.getPlayerIds();

    return { board, playersId, currentPlayerId };
  }
}
