import _ from "lodash";
import { HotelName } from "./player.ts";
import { InterfaceGame } from "./game.ts";

type Tile = string;
export type buyStocks = {
  hotel: HotelName;
  count: number;
};

export class Merger implements InterfaceGame {
  private original;

  constructor(game: InterfaceGame) {
    this.original = game;
  }

  playTurn(tile: Tile) {
    console.log(tile);

    return this.original;
  }

  getState() {
    return this.original;
  }
}
