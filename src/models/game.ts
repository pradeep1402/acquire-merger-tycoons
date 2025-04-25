import _ from "lodash";
import { Board, buildingHotel, InactiveHotels, TileStatus } from "./board.ts";
import { HotelName, Player } from "./player.ts";
import { Hotel } from "./hotel.ts";
import { BuyStocks, Merger, MergerType, TradeStats } from "./merger.ts";

export type Tile = string;
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

export type BoardDetails = {
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
  mergerTile: string | null;
};

export type GameStats = {
  board: BoardDetails;
  playersId: string[];
  currentPlayerId: string;
};

export type PlaceTile =
  | {
    tile: string;
    type: TileStatus;
    hotel?: undefined;
    inActiveHotels?: undefined;
  }
  | {
    tile: string;
    type: TileStatus;
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
    type: TileStatus;
    inActiveHotels?: InactiveHotels;
    mergeType?: MergerType;
  }
  | {
    tile: string;
    type: PlaceType;
    inActiveHotels?: InactiveHotels;
    mergeType?: MergerType;
  }
  | {
    tile: string;
    type: PlaceType;
    inActiveHotels?: InactiveHotels;
    mergeDetails?: MergerType;
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
    hotels: BuyStocks[],
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
  changeTurn: () => { status: string };
  tradeAndSellStocks: (
    tradeStats: TradeStats,
    stocks: BuyStocks[],
    playerId: string,
  ) => PlayerDetails | undefined | { error: string };

  getPlayer: (PlayerId: string) => Player | undefined;
  getHotel: (hotelName: string) => Hotel | undefined;
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

    if (placeInfo.type === TileStatus.Merge) {
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

  buyStocks(hotels: BuyStocks[], playerId: string): PlayerDetails | undefined {
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
    if (!currentPlayer.hasTile(tile)) return { status: false };
    const currentTileStatus = this.board.placeATile(tile);
    const canTileBePlaced = [TileStatus.Dependent, TileStatus.Independent]
      .includes(currentTileStatus.type);
    if (canTileBePlaced) {
      currentPlayer.removeTile(tile);
      return currentTileStatus;
    }

    return currentTileStatus;
  }

  foundHotel(tile: Tile, hotel: HotelName): buildingHotel {
    const foundHotel = this.board.buildHotel(tile, hotel);
    const currentPlayer = this.players[this.currentPlayerIndex];

    if (foundHotel.stockAllotted) currentPlayer.addStock(1, hotel);
    currentPlayer.removeTile(tile);

    return foundHotel;
  }

  getPlayerIds(): string[] {
    return this.players.map((player) => player.getPlayerDetails().playerId);
  }

  private getTiles(count: number): string[] {
    return this.pile.splice(0, count);
  }

  private getBoard(): BoardDetails {
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

  tradeAndSellStocks(
    _tradeStats: TradeStats,
    _stocks: BuyStocks[],
    _playerId: string,
  ) {
    return { error: "Not valid in Standard Game Mode" };
  }

  getPlayer(playerId: string): Player | undefined {
    return this.players.find((player) => player.doesPlayerMatch(playerId));
  }

  getHotel(hotelName: string): Hotel | undefined {
    return this.board.hotels.find((hotel) => hotel.isAMatch(hotelName));
  }
}
