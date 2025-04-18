export class Tile {
  private label: string;
  private isIndependent: boolean;
  private isDead: boolean;
  private hotel: null | string;
  private isOccupied: boolean;
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
