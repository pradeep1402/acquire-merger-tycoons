export class Player {
  private id: string;
  private cash: number;
  private tiles: Set<string>;
  private stocks: { [key: string]: number };

  constructor(id: string, tiles: string[]) {
    this.id = id;
    this.cash = 6000;
    this.tiles = new Set(tiles);
    this.stocks = {
      Sackson: 0,
      Tower: 0,
      Festival: 0,
      Worldwide: 0,
      American: 0,
      Continental: 0,
      Imperial: 0,
    };
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
