import _ from "lodash";
import { HotelName } from "./player.ts";
import { Game, InterfaceGame } from "./game.ts";
import { PlaceType } from "./board.ts";
import { Hotel } from "./hotel.ts";

type Tile = string;
type hotels = {
  name: string;
  size: number;
}[];
export type buyStocks = {
  hotel: HotelName;
  count: number;
};

export enum MergeType {
  AutoMerge = "AutoMerge",
  SelectiveMerge = "SelectiveMerge",
}

export class Merger implements InterfaceGame {
  private original;

  constructor(game: InterfaceGame) {
    this.original = game;
  }

  playTurn(tile: Tile) {
    console.log(tile);

    return this.original;
  }

  placeTile(tile: Tile) {
    const game = this.original as Game;
    const hotelsInMerge = game.getHotelsInMerge(tile);

    if (hotelsInMerge.length === 2) {
      const mergeType = this.findMergeType(hotelsInMerge);
      return { tile, type: PlaceType.Merge, mergeType };
    }
  }

  private isEveryHotelOfSameSize(hotels: hotels) {
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

  private getHighestAndSmallestHotel(hotels: hotels) {
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
      acquiring: highest,
      acquired: lowest,
    };
  }

  getState() {
    return this.original;
  }
}
