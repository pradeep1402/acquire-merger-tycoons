import { assertEquals } from "assert";
import { describe, it } from "testing/bdd";
import { Acquire } from "../src/models/game.ts";
import { Tile } from "../src/models/tile.ts";

describe("Acquire model", () => {
  it("testing constructor", () => {
    const players: string[] = ["Adi"];
    const acquire = new Acquire(["1A", "2A", "1A", "2A", "1A", "2A"], players);

    acquire.players.forEach((p, i) => {
      assertEquals(p.name, players[i]);
      assertEquals(p.tiles.size, 2);
    });
  });

  it("testing getBoard method", () => {
    const players: string[] = ["Adi", "Malli", "Aman"];
    const acquire = new Acquire(["1A", "2A"], players);
    const board = [new Tile("1A"), new Tile("2A")];

    assertEquals(acquire.getBoard(), board);
  });
});

describe("testing getPlayer method", () => {
  it("should return a specific player info", () => {
    const players: string[] = ["Adi"];
    const acquire = new Acquire(["1A", "2A", "1A", "2A", "1A", "2A"], players);
    const actual = acquire.getPlayer("Adi");

    assertEquals(actual.name, "Adi");
    assertEquals(actual.cash, 6000);
  });
});
