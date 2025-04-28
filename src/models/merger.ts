import _ from "lodash";
import { HotelName, Player } from "./player.ts";
import { TileStatus } from "./board.ts";
import { Game, MergerData, PlaceTile, PlayerDetails, Tile } from "./game.ts";
import { Hotel } from "./hotel.ts";
import { StdGame } from "./stdGame.ts";

export type HotelDetails = {
  name: string;
  size: number;
  baseTile: string;
};

export type TradeStats = {
  acquirer: HotelName;
  target: HotelName;
  count: number;
};
export type BuyStocks = {
  hotel: HotelName;
  count: number;
};

export type MergerType =
  | {
    typeofMerge: MergeType;
    hotels: {
      name: string;
      size: number;
      baseTile: Tile;
    }[];
  }
  | {
    typeofMerge: MergeType;
    acquirer: HotelDetails;
    target: HotelDetails[];
    hotels?: undefined;
  };

export enum MergeType {
  AutoMerge = "AutoMerge",
  SelectiveMerge = "SelectiveMerge",
}

export class Merger implements Game {
  private original;
  private acquirer: HotelName | null;
  private target: HotelName[];
  private hotelsAffected: HotelDetails[];

  constructor(game: Game) {
    this.original = game;
    this.acquirer = null;
    this.target = [];
    this.hotelsAffected = [];
  }

  playTurn(tile: Tile) {
    console.log(tile);

    return this.original;
  }

  placeTile(tile: Tile): PlaceTile {
    const game = this.original as StdGame;
    const hotelsInMerge = game.getAffectedHotels(tile);

    const mergeDetails = this.findMergeType(hotelsInMerge);
    return { tile, type: TileStatus.Merge, mergeDetails };
  }

  private isEveryHotelOfSameSize(hotels: HotelDetails[]) {
    const sizeOfHotel = hotels[0].size;
    return hotels.every(({ size }) => size === sizeOfHotel);
  }

  private getHotelInfo(hotelsInMerge: Hotel[]) {
    this.hotelsAffected = hotelsInMerge.map((hotel) => ({
      name: hotel.getHotelName(),
      size: hotel.getSize(),
      baseTile: hotel.getBaseTile(),
    }));

    return this.hotelsAffected;
  }

  private getHighestAndSmallestHotel(hotels: HotelDetails[]): HotelDetails[] {
    const highest = _.maxBy(hotels, "size");
    const lowest = _.minBy(hotels, "size");

    return [highest, lowest];
  }

  private findMergeType(hotelsInMerge: Hotel[]) {
    const hotels = this.getHotelInfo(hotelsInMerge);

    if (this.isEveryHotelOfSameSize(hotels)) {
      return { typeofMerge: MergeType.SelectiveMerge, hotels };
    }
    const [highest, lowest] = this.getHighestAndSmallestHotel(hotels);
    this.acquirer = highest.name as HotelName;
    this.target.push(lowest.name as HotelName);

    return {
      typeofMerge: MergeType.AutoMerge,
      acquirer: highest,
      target: [lowest],
    };
  }

  getState() {
    return this.original;
  }

  buyStocks(_hotels: BuyStocks[], _playerId: string) {
    return { error: "Not valid in Merger Mode" };
  }

  foundHotel(_tile: Tile, _hotel: HotelName) {
    return { error: "Not valid in Merger Mode" };
  }

  getPlayerIds() {
    return this.original.getPlayerIds();
  }

  getPlayerDetails(playerId: string) {
    return this.original.getPlayerDetails(playerId);
  }

  getGameStats() {
    return this.original.getGameStats();
  }

  getAffectedHotels(tile: Tile) {
    return this.original.getAffectedHotels(tile);
  }

  private sellStocks(player: Player, stocks: BuyStocks[]) {
    for (const { hotel, count } of stocks) {
      const hotelInstance = this.getHotel(hotel);
      const priceGained = hotelInstance?.calculatePrice(count) as number;
      player.creditCash(priceGained);
      player.deductStock(count, hotel);
    }

    return player.getPlayerDetails();
  }

  private tradeStocks(player: Player, { acquirer, target, count }: TradeStats) {
    const acquirerHotel = this.getHotel(acquirer);
    acquirerHotel?.decrementStocks(Math.floor(count / 2));
    player.addStock(Math.floor(count / 2), acquirer);

    const targetHotel = this.getHotel(target);
    targetHotel?.incrementStocks(count);
    player.deductStock(count, target);

    return player.getPlayerDetails();
  }

  tradeAndSellStocks(
    tradeStats: TradeStats,
    stocks: BuyStocks[],
    playerId: string,
  ): PlayerDetails | undefined {
    const player = this.getPlayer(playerId) as Player;

    this.sellStocks(player, stocks);
    this.tradeStocks(player, tradeStats);

    return this.getPlayerDetails(playerId);
  }

  changeTurn() {
    return this.original.changeTurn();
  }

  getPlayer(playerId: string) {
    return this.original.getPlayer(playerId);
  }
  getHotel(hotelName: HotelName) {
    return this.original.getHotel(hotelName);
  }

  setupMergerEntities(acquirer: HotelName): MergerData {
    this.acquirer = acquirer;
    this.target = this.hotelsAffected
      .filter(({ name }) => name !== acquirer)
      .map(({ name }) => name as HotelName);

    return { acquirer: this.acquirer, target: this.target };
  }
}
