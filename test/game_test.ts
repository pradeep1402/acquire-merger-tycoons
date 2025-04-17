import { assertEquals } from "assert";
import { describe, it } from "testing/bdd";
import { Acquire } from "../src/models/game.ts";
import { Tile } from "../src/models/tile.ts";

describe("Acquire model", () => {
  describe("testing constructor", () => {
    it("should initialize player with 6 tiles", () => {
      const players: string[] = ["Adi"];
      const acquire = new Acquire(
        ["1A", "2A", "3A", "4A", "5A", "6A"],
        players
      );

      acquire.getAllPlayers().forEach((p, i) => {
        assertEquals(p.name, players[i]);
        assertEquals(p.tiles.length, 6);
      });
    });
  });

  describe("getPlayer(player) method", () => {
    it("should return a specific player info", () => {
      const players: string[] = ["Adi"];
      const acquire = new Acquire(
        ["1A", "2A", "1A", "2A", "1A", "2A"],
        players
      );
      const actual = acquire.getPlayer("Adi");

      assertEquals(actual.name, "Adi");
      assertEquals(actual.cash, 6000);
    });
  });

  describe("getBoard() method", () => {
    it("should return all info of all tiles", () => {
      const players: string[] = ["Adi", "Malli", "Aman"];
      const acquire = new Acquire(["1A", "2A"], players);
      const board = [new Tile("1A").toJSON(), new Tile("2A").toJSON()];

      assertEquals(acquire.getBoard(), board);
    });
  });
});
