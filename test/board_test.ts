import { assertEquals } from "assert";
import { describe, it } from "testing/bdd";
import { Board } from "../src/models/board.ts";
import { Hotel } from "../src/models/hotel.ts";

describe("Board class", () => {
  it("should return the tile which placed", () => {
    const hotels = [new Hotel("Impireal", "blue")];
    const board = new Board(hotels);

    assertEquals(board.placeTile("1A"), { tile: "1A", type: "Independent" });
  });

  it("should return the empty board", () => {
    const hotels = [new Hotel("Impireal", "blue")];
    const board = new Board(hotels);

    assertEquals(board.getBoard(), { independentTiles: [], hotels: [] });
  });

  it("should return the board", () => {
    const hotels = [new Hotel("Impireal", "blue")];
    const board = new Board(hotels);
    board.placeTile("1A");
    board.placeTile("4A");

    assertEquals(board.getBoard(), {
      independentTiles: ["1A", "4A"],
      hotels: [],
    });
  });

  it("should return the board when there is active hotel available", () => {
    const hotel = new Hotel("Imperial", "blue");
    const board = new Board([hotel]);

    board.placeTile("2A");
    board.placeTile("4A");
    board.buildHotel("1A", "Imperial");

    assertEquals(board.getBoard(), {
      independentTiles: ["4A"],
      hotels: [{ name: "Imperial", tiles: ["2A", "1A"], color: "blue" }],
    });
  });

  it("should build a new hotel when a independent tile is already placed", () => {
    const hotel = new Hotel("Imperial", "blue");
    const board = new Board([hotel]);

    board.placeTile("2A");
    board.placeTile("4A");

    assertEquals(board.buildHotel("1A", "Imperial"), {
      name: "Imperial",
      tiles: ["2A", "1A"],
      color: "blue",
    });
  });

  it("should move the tiles from the independent to hotel when new hotel is founded", () => {
    const hotel = new Hotel("Imperial", "blue");
    const board = new Board([hotel]);

    board.placeTile("2A");
    board.placeTile("1A");
    board.placeTile("4B");
    board.placeTile("4D");

    assertEquals(board.buildHotel("4C", "Imperial"), {
      name: "Imperial",
      tiles: ["4B", "4D", "4C"],
      color: "blue",
    });
  });
});
