import { assertEquals } from "assert";
import { describe, it } from "testing/bdd";
import { Player } from "../src/models/player.ts";

describe("Player model", () => {
  it("testing constructor", () => {
    const tiles: string[] = ["1a", "2a", "3a", "4a", "3b", "6a"];
    const player = new Player("124", tiles);
    const person = player.getPlayerDetails();
    assertEquals(person.playerId, "124");
    assertEquals(person.tiles, tiles);
    assertEquals(person.cash, 6000);
    assertEquals(person.stocks, {
      Sackson: 0,
      Tower: 0,
      Festival: 0,
      Worldwide: 0,
      American: 0,
      Continental: 0,
      Imperial: 0,
    });
  });
});
