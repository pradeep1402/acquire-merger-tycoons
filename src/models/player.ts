export class Player {
  private name: string;
  private cash: number;
  private tiles: Set<string>;

  constructor(name: string, tiles: string[]) {
    this.name = name;
    this.cash = 6000;
    this.tiles = new Set(tiles);
  }

  toJSON() {
    return { name: this.name, cash: this.cash, tiles: [...this.tiles] };
  }
}
