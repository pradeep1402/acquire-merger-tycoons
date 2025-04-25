type Tile = string;

export class Hotel {
  private name: string;
  private tiles: Set<Tile>;
  private stocksAvailable: number;
  private status: boolean;
  private offset: number;
  private baseTile: Tile;

  constructor(name: string, offset: number) {
    this.name = name;
    this.tiles = new Set();
    this.stocksAvailable = 25;
    this.status = false;
    this.offset = offset;
    this.baseTile = "";
  }

  private static stockInfo() {
    return [
      { from: 2, to: 2, value: 200 },
      { from: 3, to: 3, value: 300 },
      { from: 4, to: 4, value: 400 },
      { from: 5, to: 5, value: 500 },
      { from: 6, to: 10, value: 600 },
      { from: 11, to: 20, value: 700 },
      { from: 21, to: 30, value: 800 },
      { from: 31, to: 40, value: 900 },
      { from: 41, to: 108, value: 1000 },
    ];
  }

  getStockPrice() {
    const stockPrice = Hotel.stockInfo().find(
      (s) => this.getSize() >= s.from && this.getSize() <= s.to,
    );

    return stockPrice?.value ? stockPrice.value + 100 * this.offset : 0;
  }

  getPrimaryBonus() {
    return this.getStockPrice() * 10;
  }

  getSecondaryBonus() {
    return this.getStockPrice() * 5;
  }

  addTile(tile: Tile) {
    this.tiles.add(tile);

    return [...this.tiles];
  }

  isAMatch(hotelName: string): boolean {
    return this.name === hotelName;
  }

  isActive() {
    return this.status;
  }

  toggleStatus() {
    this.status = !this.status;
    return this.status;
  }

  areStocksEnough(delta: number) {
    return this.stocksAvailable >= delta;
  }

  calculatePrice(delta: number) {
    return delta * this.getStockPrice();
  }

  decrementStocks(delta: number) {
    this.stocksAvailable -= delta;
    return this.stocksAvailable;
  }

  getSize() {
    return this.tiles.size + (this.isActive() ? 1 : 0);
  }

  isTileBelongs(tile: Tile) {
    return this.tiles.has(tile) || this.baseTile === tile;
  }

  storeBaseTile(tile: Tile) {
    this.baseTile = tile;
    return this.baseTile;
  }

  getHotel() {
    return {
      name: this.name,
      tiles: [...this.tiles],
      stocksAvailable: this.stocksAvailable,
      stockPrice: this.getStockPrice(),
      baseTile: this.baseTile,
    };
  }
}
