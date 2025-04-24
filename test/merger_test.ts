import { assertEquals } from "assert";
import { describe, it } from "testing/bdd";
import { Hotel } from "../src/models/hotel.ts";
import { Game, InterfaceGame } from "../src/models/game.ts";
import { Merger } from "../src/models/merger.ts";

describe("Merger class", () => {
  it("should return the game state", () => {
    const game = new Game([], [], []);
    const merger = new Merger(game);

    assertEquals(merger.playTurn("3A"), game as InterfaceGame);
  });

  it("should return the size of hotel", () => {
    const hotel = new Hotel("Imperial", "blue", 2);
    hotel.addTile("1A");
    hotel.addTile("2A");
    assertEquals(hotel.getSize(), 2);
  });
});
