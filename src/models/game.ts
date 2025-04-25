import _ from "lodash";
import { HotelName, Player } from "./player.ts";
import { buildingHotel, InactiveHotels, PlaceType } from "./board.ts";
import { Hotel } from "./hotel.ts";
import { BuyStocks, MergerType, TradeStats } from "./merger.ts";

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
  // getSizeOfHotel: (hotelName: string) => number;
  changeTurn: () => { status: string };
  tradeAndSellStocks: (
    tradeStats: TradeStats,
    stocks: BuyStocks[],
    playerId: string,
  ) => PlayerDetails | undefined | { error: string };

  getPlayer: (PlayerId: string) => Player | undefined;
  getHotel: (hotelName: string) => Hotel | undefined;
}
