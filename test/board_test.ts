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

describe("getAdjacentOf(tile)", () => {
  it("should return all the adjacent tile of top left", () => {
    const board = new Board();

    assertEquals(board.getAdjacentOf("1A"), ["2A", "1B"]);
  });

  it("should return all the adjacent tiles of a top right", () => {
    const board = new Board();

    assertEquals(board.getAdjacentOf("12A"), ["11A", "12B"]);
  });

  it("should return all the adjacent tile of bottom left", () => {
    const board = new Board();

    assertEquals(board.getAdjacentOf("1I"), ["2I", "1H"]);
  });

  it("should return all the adjacent tile of bottom right", () => {
    const board = new Board();

    assertEquals(board.getAdjacentOf("12I"), ["11I", "12H"]);
  });

  it("should return all the adjacent tile of centered tile", () => {
    const board = new Board();

    assertEquals(board.getAdjacentOf("2B"), ["3B", "1B", "2A", "2C"]);
  });
});

describe("getAdjacentTilesOf(tile)", () => {
  it("should return all the adjacent tile which is placed of top left", () => {
    const board = new Board();
    board.placeTile("2A");

    assertEquals(board.getAdjacentTilesOf("1A"), ["2A"]);
  });

  it("should return all the adjacent tiles which is placed of a top right", () => {
    const board = new Board();
    board.placeTile("11A");

    assertEquals(board.getAdjacentTilesOf("12A"), ["11A"]);
  });

  it("should return all the adjacent tiles which is placed of bottom left", () => {
    const board = new Board();
    board.placeTile("2I");

    assertEquals(board.getAdjacentTilesOf("1I"), ["2I"]);
  });

  it("should return all the adjacent tiles which is placed of bottom right", () => {
    const board = new Board();

    assertEquals(board.getAdjacentTilesOf("12I"), []);
  });
});
