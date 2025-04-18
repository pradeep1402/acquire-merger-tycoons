export class Player {
  private name: string;
  private cash: number;
  private tiles: Set<string>;
  private stocks: { [key: string]: number };

  constructor(name: string, tiles: string[]) {
    this.name = name;
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
      name: this.name,
      cash: this.cash,
      tiles: [...this.tiles],
      stocks: { ...this.stocks },
    };
  }
}
