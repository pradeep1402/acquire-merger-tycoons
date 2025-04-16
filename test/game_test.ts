import { assertEquals } from "assert";
import { describe, it } from "testing/bdd";
import { Acquire, Player } from "../src/models/game.ts";

describe("Acquire model", () => {
  it("testing constructor", () => {
    const players: Player[] = [{ id: 2, name: "string" }];
    const acquire = new Acquire(["1A", "2A"], players);

    assertEquals(acquire.players, players);
  });
});
