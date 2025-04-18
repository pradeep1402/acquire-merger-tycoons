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
  private id: string;
  private cash: number;
  private tiles: Set<string>;
  private stocks: StocksCount;

  constructor(id: string, tiles: string[]) {
    this.id = id;
    this.cash = 6000;
    this.tiles = new Set(tiles);
    this.stocks = allZeroStockCounts();
  }

  toJSON() {
    return {
      id: this.id,
      cash: this.cash,
      tiles: [...this.tiles],
      stocks: { ...this.stocks },
    };
  }
}
