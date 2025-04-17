import { assertEquals } from "assert";
import { describe, it } from "testing/bdd";
import { Player } from "../src/models/player.ts";

describe("Player model", () => {
  it("testing constructor", () => {
    const tiles: string[] = ["1a", "2a", "3a", "4a", "3b", "6a"];
    const player = new Player("Sudheer", tiles);
    const person = player.toJSON();
    assertEquals(person.name, "Sudheer");
    assertEquals(person.tiles, tiles);
    assertEquals(person.cash, 6000);
  });
});
