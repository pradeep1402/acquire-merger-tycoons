import _ from "lodash";
import { HotelName } from "./player.ts";
import { Game, PlaceTile, StdGame } from "./game.ts";
import { PlaceType } from "./board.ts";
import { Hotel } from "./hotel.ts";

type Tile = string;
type Hotels = {
  name: string;
  size: number;
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
    }[];
    acquirer?: Hotels;
    target?: Hotels;
  }
  | {
    typeofMerge: MergeType;
    acquirer: Hotels;
    target: Hotels;
    hotels?: undefined;
  };

export enum MergeType {
  AutoMerge = "AutoMerge",
  SelectiveMerge = "SelectiveMerge",
}

export class Merger implements Game {
  private original;

  constructor(game: Game) {
    this.original = game;
  }

  playTurn(tile: Tile) {
    console.log(tile);

    return this.original;
  }

  placeTile(tile: Tile): PlaceTile {
    const game = this.original as StdGame;
    const hotelsInMerge = game.getAffectedHotels(tile);

    const mergeType = this.findMergeType(hotelsInMerge);
    return { tile, type: PlaceType.Merge, mergeType };
  }

  private isEveryHotelOfSameSize(hotels: Hotels[]) {
    const sizeOfHotel = hotels[0].size;
    return hotels.every(({ size }) => size === sizeOfHotel);
  }

  private getHotelNameAndSize(hotelsInMerge: Hotel[]) {
    const hotels = hotelsInMerge.map((hotel) => ({
      name: hotel.getHotelName(),
      size: hotel.getSize(),
    }));

    return hotels;
  }

  private getHighestAndSmallestHotel(hotels: Hotels[]): Hotels[] {
    const highest = _.maxBy(hotels, "size");
    const lowest = _.minBy(hotels, "size");

    return [highest, lowest];
  }

  private findMergeType(hotelsInMerge: Hotel[]) {
    const hotels = this.getHotelNameAndSize(hotelsInMerge);

    if (this.isEveryHotelOfSameSize(hotels)) {
      return { typeofMerge: MergeType.SelectiveMerge, hotels };
    }
    const [highest, lowest] = this.getHighestAndSmallestHotel(hotels);

    return {
      typeofMerge: MergeType.AutoMerge,
      acquirer: highest,
      target: lowest,
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

  // getSizeOfHotel: (hotelName: string) => number;

  changeTurn() {
    return this.original.changeTurn();
  }
}
