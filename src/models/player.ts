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

  constructor(playerId: string, tiles: Tile[]) {
    this.playerId = playerId;
    this.cash = 6000;
    this.tiles = new Set(tiles);
    this.stocks = allZeroStockCounts();
  }

  addStock(delta: number, stockName: HotelName) {
    this.stocks[stockName] += delta;

    return this.stocks[stockName];
  }

  deductStock(delta: number, stockName: HotelName) {
    this.stocks[stockName] -= delta;

    return this.stocks[stockName];
  }

  deductCash(price: number) {
    return (this.cash = this.cash - price);
  }

  addCash(price: number) {
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

  isTileExits(tile: string) {
    return this.tiles.has(tile);
  }

  removeTile(tile: string) {
    this.tiles.delete(tile);
    return [...this.tiles];
  }

  doesPlayerMatch(playerId: string) {
    return this.playerId === playerId;
  }
}
