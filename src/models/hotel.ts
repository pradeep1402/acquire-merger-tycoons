type Tile = string;

export class Hotel {
  private name: string;
  private tiles: Tile[];
  private stocksAvailable: number;
  private isActive: boolean;

  constructor(name: string) {
    this.name = name;
    this.tiles = [];
    this.stocksAvailable = 25;
    this.isActive = false;
  }

  addTile(tile: Tile) {
    this.tiles.push(tile);

    return this.tiles;
  }

  getSize() {
    return this.tiles.length;
  }

  isTileBelongs(tile: Tile) {
    return this.tiles.includes(tile);
  }

  getHotel() {
    return { name: this.name, tiles: this.tiles };
  }
}
