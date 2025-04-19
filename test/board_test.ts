import { assertEquals } from "assert";
import { describe, it } from "testing/bdd";
import { Board } from "../src/models/board.ts";

describe("Board class", () => {
  it("should return the tile which placed", () => {
    const board = new Board();

    assertEquals(board.placeTile("1A"), "1A");
  });

  it("should return the empty board", () => {
    const board = new Board();
    assertEquals(board.getBoard(), { independentTiles: [], hotels: [] });
  });

  it("should return the board", () => {
    const board = new Board();
    board.placeTile("1A");
    board.placeTile("2A");
    assertEquals(board.getBoard(), {
      independentTiles: ["1A", "2A"],
      hotels: [],
    });
  });
});
