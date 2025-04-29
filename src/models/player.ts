type Tile = string;
export type HotelName =
  | "Sackson"
  | "Tower"
  | "Festival"
  | "Worldwide"
  | "American"
  | "Continental"
  | "Imperial";

type StocksCount = {
  Sackson: number;
  Tower: number;
  Festival: number;
  Worldwide: number;
  American: number;
  Continental: number;
  Imperial: number;
};

const allZeroStockCounts = (): StocksCount => {
  return {
    Sackson: 0,
    Tower: 0,
    Festival: 0,
    Worldwide: 0,
    American: 0,
    Continental: 0,
    Imperial: 0,
  };
};

export class Player {
  private playerId: string;
  private cash: number;
  private tiles: Set<Tile>;
  private stocks: StocksCount;

  constructor(playerId: string) {
    this.playerId = playerId;
    this.cash = 6000;
    this.tiles = new Set();
    this.stocks = allZeroStockCounts();
  }

  // deno-lint-ignore no-explicit-any
  static fromJSON(data: any): Player {
    return new Player(data.playerId)
      .withCash(data.cash)
      .withStocks(data.stocks)
      .withTiles(data.tiles);
  }

  withCash(cash: number) {
    this.cash = cash;
    return this;
  }

  withTiles(tiles: Tile[]) {
    this.tiles = new Set([...tiles]);
    return this;
  }

  withStocks(stockHoldings: StocksCount) {
    this.stocks = stockHoldings;
    return this;
  }

  toJSON() {
    return {
      playerId: this.playerId,
      cash: this.cash,
      tiles: [...this.tiles],
      stocks: this.stocks,
    };
  }

  addStock(delta: number, stockName: HotelName) {
    this.stocks[stockName] += delta;

    return this.stocks[stockName];
  }

  deductStock(delta: number, stockName: HotelName) {
    this.stocks[stockName] -= delta;

    return this.stocks[stockName];
  }

  countSharesOf(hotel: HotelName) {
    return this.stocks[hotel];
  }

  deductCash(price: number) {
    return (this.cash = this.cash - price);
  }

  creditCash(price: number) {
    return (this.cash = this.cash + price);
  }

  getPlayerDetails() {
    return {
      playerId: this.playerId,
      cash: this.cash,
      tiles: [...this.tiles],
      stocks: { ...this.stocks },
    };
  }

  addTile(tile: string) {
    this.tiles.add(tile);
    return [...this.tiles];
  }

  hasTile(tile: string) {
    return this.tiles.has(tile);
  }

  removeTile(tile: string) {
    this.tiles.delete(tile);
    return [...this.tiles];
  }

  doesPlayerMatch(playerId: string) {
    return this.playerId === playerId;
  }

  hasStocksOf(hotelName: HotelName): boolean {
    const stocks = this.stocks[hotelName];

    return stocks > 0;
  }
}
