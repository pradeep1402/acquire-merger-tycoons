import _ from "lodash";
import { HotelName, Player } from "./player.ts";

import {
  Board,
  buildingHotel,
  HotelDetails,
  InactiveHotels,
  TileStatus,
} from "./board.ts";

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
  mergeData?: {
    mode?: string | null;
    acquirer?: null | HotelName;
    target?: null | HotelName;
  };
  isGameEnd?: boolean;
  mode?: string | null;
};

export type MergerData = {
  acquirer: HotelName;
  target: HotelName[];
};

export type PlaceTile =
  | {
    tile: string;
    type: TileStatus;
    hotel?: HotelDetails;
    inActiveHotels?: InactiveHotels;
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
    inActiveHotels?: InactiveHotels;
  }
  | {
    tile: string;
    type: TileStatus;
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

export type BonusDistribution =
  | {
    bonusHolders?: undefined;
  }
  | {
    bonusHolders: {
      primaryHolderIds?: undefined | string[];
      secondaryHolderIds?: undefined | string[];
    };
  };

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
  getHotel: (hotelName: HotelName) => Hotel | undefined;
  setupMergerEntities: (hotelName: HotelName) => MergerData | { error: string };
  getCurrentPlayerIndex: () => number;
  getBoard: () => BoardDetails;
  distributeBonus: (hotelName: HotelName) => undefined | BonusDistribution;
  getBoardInstance: () => Board;
}
