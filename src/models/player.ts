export class Player {
  name: string;
  cash: number;
  tiles: Set<string>;
  constructor(name: string, tiles: string[]) {
    this.name = name;
    this.cash = 6000;
    this.tiles = new Set(tiles);
  }
}
