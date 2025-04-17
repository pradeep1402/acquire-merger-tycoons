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

  toJSON() {
    return {
      label: this.label,
      isIndependent: this.isIndependent,
      isDead: this.isDead,
      hotel: this.hotel,
      isOccupied: this.isOccupied,
    };
  }
}
