import { Hotel } from "./hotel.ts";
import _ from "lodash";

type Tile = string;

export class Board {
  hotels: Hotel[];
  independentTiles: Tile[];

  constructor() {
    this.hotels = [];
    this.independentTiles = [];
  }

  placeTile(tile: Tile) {
    // if (this.isDependent(tile)) {
    //   const [hotel] = this.dependentHotels(tile);
    //   hotel.addTile(tile);
    // }
    this.independentTiles.push(tile);

    return tile;
  }

  getBoard() {
    // const hotels = this.hotels.map((hotel) => hotel.getHotel());

    return { independentTiles: this.independentTiles, hotels: [] };
  }

  parseTile(tile: Tile): number[] {
    return [+tile.slice(0, -1), tile.charCodeAt(tile.length - 1)];
  }

  leftOf(tile: Tile) {
    const [col, row] = this.parseTile(tile);
    if (col === 1) return "";
    return `${col - 1}${String.fromCharCode(row)}`;
  }

  rightOf(tile: Tile) {
    const [col, row] = this.parseTile(tile);
    if (col === 12) return "";
    return `${col + 1}${String.fromCharCode(row)}`;
  }

  topOf(tile: Tile) {
    const [col, row] = this.parseTile(tile);
    if (row === 65) return "";
    return `${col}${String.fromCharCode(row - 1)}`;
  }

  bottomOf(tile: Tile) {
    const [col, row] = this.parseTile(tile);
    if (row === 73) return "";
    return `${col}${String.fromCharCode(row + 1)}`;
  }

  getAdjacentOf(tile: Tile) {
    const adjacent = [
      this.rightOf(tile),
      this.leftOf(tile),
      this.topOf(tile),
      this.bottomOf(tile),
    ];

    return _.compact(adjacent);
  }

  isPlaced(tile: Tile) {
    return this.independentTiles.includes(tile);
    // this.hotels.some((h) => h.isTileBelongs(tile))
  }

  getAdjacentTilesOf(tile: Tile): Tile[] {
    const adjacent = this.getAdjacentOf(tile);

    return adjacent.filter((t: Tile) => this.isPlaced(t));
  }

  // isDependent(tile: Tile) {
  //   return this.dependentHotels(tile).length === 1;
  // }

  // dependentHotels(tile: Tile): Hotel[] {
  //   const adjacentTiles = this.getAdjacentTilesOf(tile);
  //   const hotels = [];
  //   for (const tile of adjacentTiles) {
  //     const hotel = this.hotels.find((hotel) => hotel.isTileBelongs(tile));
  //     if (hotel) hotels.push(hotel);
  //   }

  //   return hotels;
  // }
}
