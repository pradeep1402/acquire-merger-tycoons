type Tile = string;

export class Hotel {
  name: string;
  tiles: Tile[];
  stocksAvailable: number;
  status: boolean;
  color: string;

  constructor(name: string, color: string = "blue") {
    this.name = name;
    this.tiles = [];
    this.color = color;
    this.stocksAvailable = 25;
    this.status = false;
  }

  addTile(tile: Tile) {
    this.tiles.push(tile);

    return this.tiles;
  }

  isActive() {
    return this.status;
  }

  toggleStatus() {
    this.status = !this.status;
    return this.status;
  }

  decrementStocks(delta: number) {
    this.stocksAvailable -= delta;
    return this.stocksAvailable;
  }

  getSize() {
    return this.tiles.length;
  }

  isTileBelongs(tile: Tile) {
    return this.tiles.includes(tile);
  }

  getHotel() {
    return { name: this.name, tiles: this.tiles, color: this.color };
  }
}
