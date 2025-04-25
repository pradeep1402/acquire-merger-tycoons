import { BoardReturnType, PlaceTile } from "./game.ts";
import { Hotel } from "./hotel.ts";
import _ from "lodash";

type Tile = string;

export enum PlaceType {
  Build = "Build",
  Dependent = "Dependent",
  Independent = "Independent",
  Merge = "Merge",
  InValid = "Invalid",
}

export type hotel = {
  name: string;
  tiles: string[];
  stocksAvailable: number;
  stockPrice: number;
  baseTile: string;
};

export type InactiveHotels = {
  name: string;
  tiles: string[];
  stocksAvailable: number;
  stockPrice: number;
  baseTile: string;
}[];

export type buildingHotel = {
  hotel: hotel | undefined;
  stockAllotted: boolean;
};

export class Board {
  hotels: Hotel[];
  independentTiles: Set<Tile>;
  mergerTile: Tile[];

  constructor(hotels: Hotel[]) {
    this.hotels = hotels;
    this.independentTiles = new Set();
    this.mergerTile = [];
  }

  private getInactiveHotels() {
    return this.hotels
      .filter((hotel) => !hotel.isActive())
      .map((hotel) => hotel.getHotel());
  }

  private getActiveHotels() {
    return this.hotels
      .filter((hotel) => hotel.isActive())
      .map((hotel) => hotel.getHotel());
  }

  placeIndependentTile(tile: Tile): string {
    this.independentTiles.add(tile);
    return tile;
  }

  getPlaceTileType(tile: Tile): {
    tile: string;
    type: PlaceType;
  } {
    const adjacentTiles = this.getAdjacentTiles(tile, new Set());
    const inActiveHotels = this.getInactiveHotels();
    if (this.isMerger(tile)) {
      this.validateMergeTile(tile);
      // const validation = this.validateMergeTile(tile);
      // if (!validation) return { tile, type: PlaceType.InValid };
      return { tile, type: PlaceType.Merge };
    }

    if (this.isDependent(tile)) {
      return { tile, type: PlaceType.Dependent };
    }

    if (adjacentTiles.size === 0 || inActiveHotels.length === 0) {
      return { tile, type: PlaceType.Independent };
    }

    return {
      type: PlaceType.Build,
      tile,
    };
  }

  // isGameEnd() {
  //   const hotelWith41 = this.hotels.filter((hotel) => hotel.getSize() >= 41);
  //   if (hotelWith41.length) return true;
  //   const hotelsInSafeState = this.hotels.filter(
  //     (hotel) => hotel.getSize() >= 11
  //   );
  //   if (hotelsInSafeState.length === 7) return true;
  //   return false;
  // }

  private validateMergeTile(tile: Tile): boolean {
    const hotelsInMerge = this.dependentHotels(tile);
    console.log(hotelsInMerge);

    return true;
  }

  placeATile(tile: Tile): PlaceTile {
    const adjacentTiles = this.getAdjacentTiles(tile, new Set());
    const inActiveHotels = this.getInactiveHotels();
    if (this.isMerger(tile)) {
      this.mergerTile.push(tile);
      return { tile, type: PlaceType.Merge };
    }

    if (this.isDependent(tile)) {
      const [hotel] = this.dependentHotels(tile);
      this.moveToHotel([...adjacentTiles, tile], hotel);
      return { tile, type: PlaceType.Dependent, hotel: hotel.getHotel() };
    }

    if (adjacentTiles.size === 0 || inActiveHotels.length === 0) {
      this.placeIndependentTile(tile);
      return { tile, type: PlaceType.Independent };
    }

    return {
      inActiveHotels: this.getInactiveHotels(),
      type: PlaceType.Build,
      tile,
    };
  }

  getHotel(hotelName: string): Hotel[] {
    return this.hotels.filter((hotel) => hotel.isAMatch(hotelName));
  }

  private moveToHotel(tiles: Tile[], hotel: Hotel | undefined): void {
    tiles.forEach((tile) => {
      this.independentTiles.delete(tile);
      hotel?.addTile(tile);
    });
  }

  buildHotel(tile: Tile, hotelName: string): buildingHotel {
    const hotel = this.hotels.find((hotel) => hotel.isAMatch(hotelName));
    const tiles = [...this.getAdjacentTiles(tile, new Set())];

    const stockAllotted = hotel?.areStocksEnough(1) || false;
    hotel?.toggleStatus();
    hotel?.decrementStocks(1);
    hotel?.storeBaseTile(tile);
    this.moveToHotel(tiles, hotel);

    return { hotel: hotel?.getHotel(), stockAllotted };
  }

  getBoard(): BoardReturnType {
    const activeHotels = this.getActiveHotels();
    const inActiveHotels = this.getInactiveHotels();

    return {
      independentTiles: [...this.independentTiles],
      activeHotels,
      inActiveHotels,
      mergerTile: this.mergerTile,
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

  getAdjacentOf(tile: Tile): Tile[] {
    const [col, row] = this.parseTile(tile);
    const candidates = [
      [col - 1, row],
      [col + 1, row],
      [col, row - 1],
      [col, row + 1],
    ];

    return candidates
      .filter(
        ([num, letter]) =>
          num >= 1 && num <= 12 && letter >= 65 && letter <= 73,
      )
      .map(([num, letter]) => `${num}${String.fromCharCode(letter)}`);
  }

  private isPlaced(tile: Tile): boolean {
    return (
      this.independentTiles.has(tile) ||
      this.hotels.some((h) => h.isTileBelongs(tile))
    );
  }

  getAdjacentTilesOf(tile: Tile): Tile[] {
    const adjacent = this.getAdjacentOf(tile);

    return adjacent.filter((t: Tile) => this.isPlaced(t));
  }

  isDependent(tile: Tile): boolean {
    return this.dependentHotels(tile).length === 1;
  }

  isMerger(tile: Tile): boolean {
    return this.dependentHotels(tile).length > 1;
  }

  // getHotelsInMerger(tile: Tile) {
  //   return this.dependentHotels(tile);
  // }

  dependentHotels(tile: Tile): Hotel[] {
    const adjacentTiles = this.getAdjacentTilesOf(tile);
    const hotels: Set<Hotel> = new Set();

    for (const tile of adjacentTiles) {
      const hotel = this.hotels.find((hotel) => hotel.isTileBelongs(tile));
      if (hotel) hotels.add(hotel);
    }

    return [...hotels];
  }
}
