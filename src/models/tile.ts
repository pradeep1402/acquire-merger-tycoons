export class Tile {
  public label: string;
  public isIndependent: boolean;
  public isDead: boolean;
  public hotel: null | string;
  public isOccupied: boolean;

  constructor(name: string) {
    this.label = name;
    this.isIndependent = false;
    this.isDead = false;
    this.hotel = null;
    this.isOccupied = false;
  }
}
