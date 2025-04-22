import { Hotel } from "./hotel.ts";
import _ from "lodash";

type Tile = string;

export enum PlaceType {
  Build = "Build",
  Dependent = "Dependent",
  Independent = "Independent",
}

export class Board {
  hotels: Hotel[];
  independentTiles: Set<Tile>;

  constructor(hotels: Hotel[]) {
    this.hotels = hotels;
    this.independentTiles = new Set();
  }

  private getInActiveHotels() {
    return this.hotels
      .filter((hotel) => !hotel.isActive())
      .map((hotel) => hotel.getHotel());
  }

  private getActiveHotels() {
    return this.hotels
      .filter((hotel) => hotel.isActive())
      .map((hotel) => hotel.getHotel());
  }

  placeIndependentTile(tile: Tile) {
    this.independentTiles.add(tile);
    return tile;
  }

  getPlaceTileType(tile: Tile) {
    const adjacentTiles = this.getAdjacentTiles(tile, new Set());
    const inActiveHotels = this.getInActiveHotels();

    if (this.isDependent(tile)) {
      const [hotel] = this.dependentHotels(tile);
      [...adjacentTiles].forEach((t) => hotel.addTile(t));
      hotel.addTile(tile);
      return { tile, type: "Dependent" };
    }

    if (adjacentTiles.size === 0 || inActiveHotels.length === 0) {
      return { tile, type: PlaceType.Independent };
    }

    return { inActiveHotels: this.getInActiveHotels(), type: PlaceType.Build };
  }

  private moveToHotel(tiles: Tile[], hotel: Hotel | undefined) {
    tiles.forEach((tile) => {
      this.independentTiles.delete(tile);
      hotel?.addTile(tile);
    });
  }

  buildHotel(tile: Tile, hotelName: string) {
    const hotel = this.hotels.find((hotel) => hotel.isAMatch(hotelName));
    const tiles = [...this.getAdjacentTiles(tile, new Set()), tile];

    hotel?.toggleStatus();
    hotel?.decrementStocks(1);
    this.moveToHotel(tiles, hotel);

    return hotel?.getHotel();
  }

  getBoard() {
    const activeHotels = this.getActiveHotels();
    const inActiveHotels = this.getInActiveHotels();

    return {
      independentTiles: [...this.independentTiles],
      activeHotels,
      inActiveHotels,
    };
  }

  private getAdjacentTiles(tile: Tile, adjacentTiles: Set<Tile>): Set<Tile> {
    const tilesAdjacent = this.getAdjacentOf(tile);

    const tilesFound = tilesAdjacent.filter(
      (adjTile: Tile) =>
        this.independentTiles.has(adjTile) && !adjacentTiles.has(adjTile),
    );

    for (const adjTile of tilesFound) {
      adjacentTiles.add(adjTile);
      this.getAdjacentTiles(adjTile, adjacentTiles);
    }

    return adjacentTiles;
  }

  parseTile(tile: Tile): number[] {
    const match = tile.match(/^(\d+)([A-I])$/) as RegExpMatchArray;
    const [_, value, letter] = match;
    return [Number(value), letter.charCodeAt(0)];
  }

  private leftOf(tile: Tile) {
    const [col, row] = this.parseTile(tile);
    if (col === 1) return "";
    return `${col - 1}${String.fromCharCode(row)}`;
  }

  private rightOf(tile: Tile) {
    const [col, row] = this.parseTile(tile);
    if (col === 12) return "";
    return `${col + 1}${String.fromCharCode(row)}`;
  }

  private topOf(tile: Tile) {
    const [col, row] = this.parseTile(tile);
    if (row === 65) return "";
    return `${col}${String.fromCharCode(row - 1)}`;
  }

  private bottomOf(tile: Tile) {
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

  private isPlaced(tile: Tile) {
    return (
      this.independentTiles.has(tile) ||
      this.hotels.some((h) => h.isTileBelongs(tile))
    );
  }

  getAdjacentTilesOf(tile: Tile): Tile[] {
    const adjacent = this.getAdjacentOf(tile);

    return adjacent.filter((t: Tile) => this.isPlaced(t));
  }

  isDependent(tile: Tile) {
    return this.dependentHotels(tile).length === 1;
  }

  dependentHotels(tile: Tile): Hotel[] {
    const adjacentTiles = this.getAdjacentTilesOf(tile);
    const hotels = [];

    for (const tile of adjacentTiles) {
      const hotel = this.hotels.find((hotel) => hotel.isTileBelongs(tile));
      if (hotel) hotels.push(hotel);
    }

    return hotels;
  }
}
