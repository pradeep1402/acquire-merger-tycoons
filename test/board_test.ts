import { assertEquals } from "assert";
import { describe, it } from "testing/bdd";
import { Board, PlaceType } from "../src/models/board.ts";
import { Hotel } from "../src/models/hotel.ts";

describe("Board class", () => {
  it("should return the tile which placed", () => {
    const hotels = [new Hotel("Impireal", "blue")];
    const board = new Board(hotels);

    assertEquals(board.placeTile("1A"), {
      tile: "1A",
      type: PlaceType.Independent,
    });
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

describe("getAdjacentOf(tile)", () => {
  it("should return all the adjacent tile of top left", () => {
    const hotel = new Hotel("Imperial", "blue");
    const board = new Board([hotel]);

    assertEquals(board.getAdjacentOf("1A"), ["2A", "1B"]);
  });

  it("should return all the adjacent tiles of a top right", () => {
    const hotel = new Hotel("Imperial", "blue");
    const board = new Board([hotel]);

    assertEquals(board.getAdjacentOf("12A"), ["11A", "12B"]);
  });

  it("should return all the adjacent tile of bottom left", () => {
    const hotel = new Hotel("Imperial", "blue");
    const board = new Board([hotel]);

    assertEquals(board.getAdjacentOf("1I"), ["2I", "1H"]);
  });

  it("should return all the adjacent tile of bottom right", () => {
    const hotel = new Hotel("Imperial", "blue");
    const board = new Board([hotel]);

    assertEquals(board.getAdjacentOf("12I"), ["11I", "12H"]);
  });

  it("should return all the adjacent tile of centered tile", () => {
    const hotel = new Hotel("Imperial", "blue");
    const board = new Board([hotel]);

    assertEquals(board.getAdjacentOf("2B"), ["3B", "1B", "2A", "2C"]);
  });
});

describe("getAdjacentTilesOf(tile)", () => {
  it("should return all the adjacent tile which is placed of top left", () => {
    const hotel = new Hotel("Imperial", "blue");
    const board = new Board([hotel]);
    board.placeTile("2A");

    assertEquals(board.getAdjacentTilesOf("1A"), ["2A"]);
  });

  it("should return all the adjacent tiles which is placed of a top right", () => {
    const hotel = new Hotel("Imperial", "blue");
    const board = new Board([hotel]);
    board.placeTile("11A");

    assertEquals(board.getAdjacentTilesOf("12A"), ["11A"]);
  });

  it("should return all the adjacent tiles which is placed of bottom left", () => {
    const hotel = new Hotel("Imperial", "blue");
    const board = new Board([hotel]);
    board.placeTile("2I");

    assertEquals(board.getAdjacentTilesOf("1I"), ["2I"]);
  });

  it("should return all the adjacent tiles which is placed of bottom right", () => {
    const hotel = new Hotel("Imperial", "blue");
    const board = new Board([hotel]);

    assertEquals(board.getAdjacentTilesOf("12I"), []);
  });
});
