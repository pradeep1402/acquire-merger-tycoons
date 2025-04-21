type Tile = string;

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

  getPlayerDetails() {
    return {
      playerId: this.playerId,
      cash: this.cash,
      tiles: [...this.tiles],
      stocks: { ...this.stocks },
    };
  }

  addTile(tile: string) {
    return this.tiles.add(tile);
  }

  isTileExits(tile: string) {
    return this.tiles.has(tile);
  }

  removeTile(tile: string) {
    this.tiles.delete(tile);
  }

  doesPlayerMatch(playerId: string) {
    return this.playerId === playerId;
  }
}
