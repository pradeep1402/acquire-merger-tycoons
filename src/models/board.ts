import { Hotel } from "./hotel.ts";

type Tile = string;

export class Board {
  hotels: Hotel[];
  independentTiles: Tile[];

  constructor() {
    this.hotels = [];
    this.independentTiles = [];
  }

  placeTile(tile: Tile) {
    this.independentTiles.push(tile);
    return tile;
  }

  getBoard() {
    // const hotels = this.hotels.map((hotel) => hotel.getHotel());

    return { independentTiles: this.independentTiles, hotels: [] };
  }
}
