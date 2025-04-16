import { assertEquals } from "assert";
import { describe, it } from "testing/bdd";
import { Acquire, Player } from "../src/models/game.ts";
import { Tile } from "../src/models/tile.ts";

describe("Acquire model", () => {
  it("testing constructor", () => {
    const players: Player[] = [{ id: 2, name: "pragna" }];
    const acquire = new Acquire(["1A", "2A"], players);

    assertEquals(acquire.players, players);
  });

  it("testing getBoard method", () => {
    const players: Player[] = [{ id: 2, name: "pragna" }];
    const acquire = new Acquire(["1A", "2A"], players);
    const board = [new Tile("1A"), new Tile("2A")];

    assertEquals(acquire.getBoard(), board);
  });
});
