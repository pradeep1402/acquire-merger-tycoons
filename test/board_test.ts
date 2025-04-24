import { assert, assertEquals, assertFalse } from "assert";
import { describe, it } from "testing/bdd";
import { Board, PlaceType } from "../src/models/board.ts";
import { Hotel } from "../src/models/hotel.ts";

describe("Board class", () => {
  it("should return the tile which placed", () => {
    const hotels = [new Hotel("Imperial", 2)];
    const board = new Board(hotels);

    assertEquals(board.placeIndependentTile("1A"), "1A");
  });

  it("should return the empty board", () => {
    const hotels = [new Hotel("Imperial", 2)];
    const board = new Board(hotels);

    assertEquals(board.getBoard(), {
      independentTiles: [],
      activeHotels: [],
      inActiveHotels: [
        {
          name: "Imperial",
          tiles: [],
          stocksAvailable: 25,
          stockPrice: 0,
          baseTile: "",
        },
      ],
      mergerTile: [],
    });
  });

  it("should return the board", () => {
    const hotels = [new Hotel("Imperial", 2)];
    const board = new Board(hotels);
    board.placeIndependentTile("1A");
    board.placeIndependentTile("4A");

    assertEquals(board.getBoard(), {
      independentTiles: ["1A", "4A"],
      activeHotels: [],
      inActiveHotels: [
        {
          name: "Imperial",
          tiles: [],
          stocksAvailable: 25,
          stockPrice: 0,
          baseTile: "",
        },
      ],
      mergerTile: [],
    });
  });

  it("should return the board when there is active hotel available", () => {
    const hotel = new Hotel("Imperial", 2);
    const board = new Board([hotel]);

    board.placeIndependentTile("2A");
    board.placeIndependentTile("4A");
    board.buildHotel("1A", "Imperial");

    assertEquals(board.getBoard(), {
      independentTiles: ["4A"],
      activeHotels: [
        {
          name: "Imperial",
          tiles: ["2A"],
          stocksAvailable: 24,
          stockPrice: 400,
          baseTile: "1A",
        },
      ],
      inActiveHotels: [],
      mergerTile: [],
    });
  });

  it("should build a new hotel when a independent tile is already placed", () => {
    const hotel = new Hotel("Imperial", 2);
    const board = new Board([hotel]);

    board.placeIndependentTile("2A");
    board.placeIndependentTile("4A");

    assertEquals(board.buildHotel("1A", "Imperial"), {
      name: "Imperial",
      tiles: ["2A"],
      stocksAvailable: 24,
      stockPrice: 400,
      baseTile: "1A",
    });
  });

  it("should move the tiles from the independent to hotel when new hotel is founded", () => {
    const hotel = new Hotel("Imperial", 2);
    const board = new Board([hotel]);

    board.placeIndependentTile("2A");
    board.placeIndependentTile("1A");
    board.placeIndependentTile("4B");
    board.placeIndependentTile("4D");

    assertEquals(board.buildHotel("4C", "Imperial"), {
      name: "Imperial",
      tiles: ["4B", "4D"],
      stocksAvailable: 24,
      stockPrice: 500,
      baseTile: "4C",
    });
  });
});

describe("getAdjacentOf(tile)", () => {
  it("should return all the adjacent tile of top left", () => {
    const hotel = new Hotel("Imperial", 2);
    const board = new Board([hotel]);

    assertEquals(board.getAdjacentOf("1A"), ["2A", "1B"]);
  });

  it("should return all the adjacent tiles of a top right", () => {
    const hotel = new Hotel("Imperial", 2);
    const board = new Board([hotel]);

    assertEquals(board.getAdjacentOf("12A"), ["11A", "12B"]);
  });

  it("should return all the adjacent tile of bottom left", () => {
    const hotel = new Hotel("Imperial", 2);
    const board = new Board([hotel]);

    assertEquals(board.getAdjacentOf("1I"), ["2I", "1H"]);
  });

  it("should return all the adjacent tile of bottom right", () => {
    const hotel = new Hotel("Imperial", 2);
    const board = new Board([hotel]);

    assertEquals(board.getAdjacentOf("12I"), ["11I", "12H"]);
  });

  it("should return all the adjacent tile of centered tile", () => {
    const hotel = new Hotel("Imperial", 2);
    const board = new Board([hotel]);

    assertEquals(board.getAdjacentOf("2B"), ["1B", "3B", "2A", "2C"]);
  });
});

describe("getAdjacentTilesOf(tile)", () => {
  it("should return all the adjacent tile which is placed of top left", () => {
    const hotel = new Hotel("Imperial", 2);
    const board = new Board([hotel]);
    board.placeIndependentTile("2A");

    assertEquals(board.getAdjacentTilesOf("1A"), ["2A"]);
  });

  it("should return all the adjacent tiles which is placed of a top right", () => {
    const hotel = new Hotel("Imperial", 2);
    const board = new Board([hotel]);
    board.placeIndependentTile("11A");

    assertEquals(board.getAdjacentTilesOf("12A"), ["11A"]);
  });

  it("should return all the adjacent tiles which is placed of bottom left", () => {
    const hotel = new Hotel("Imperial", 2);
    const board = new Board([hotel]);
    board.placeIndependentTile("2I");

    assertEquals(board.getAdjacentTilesOf("1I"), ["2I"]);
  });

  it("should return all the adjacent tiles which is placed of bottom right", () => {
    const hotel = new Hotel("Imperial", 2);
    const board = new Board([hotel]);

    assertEquals(board.getAdjacentTilesOf("12I"), []);
  });
});

describe("dependentHotels(tile) method", () => {
  it("should return the adjacent hotels of a tile", () => {
    const imperial = new Hotel("Imperial", 2);
    const board = new Board([imperial]);

    board.placeIndependentTile("2A");
    board.placeIndependentTile("1A");
    board.placeIndependentTile("4B");
    board.placeIndependentTile("4D");
    board.buildHotel("4C", "Imperial");
    assertEquals(board.dependentHotels("3C"), [imperial]);
  });

  it("should return the adjacent hotels of a tile", () => {
    const imperial = new Hotel("Imperial", 2);
    const tower = new Hotel("Tower", 2);

    const board = new Board([imperial, tower]);

    board.placeIndependentTile("1A");
    board.buildHotel("2A", "Imperial");
    board.placeIndependentTile("3B");
    board.buildHotel("3C", "Tower");
    assertEquals(board.dependentHotels("3A"), [imperial, tower]);
  });
});

describe("isDependent(tile) method", () => {
  it("should return the adjacent hotels of a tile", () => {
    const imperial = new Hotel("Imperial", 2);
    const board = new Board([imperial]);

    board.placeIndependentTile("2A");
    board.placeIndependentTile("1A");
    board.placeIndependentTile("4B");
    board.placeIndependentTile("4D");
    board.buildHotel("4C", "Imperial");
    assert(board.isDependent("3C"));
  });

  it("should return the adjacent hotels of a tile", () => {
    const imperial = new Hotel("Imperial", 2);
    const tower = new Hotel("Tower", 2);

    const board = new Board([imperial, tower]);

    board.placeIndependentTile("1A");
    board.buildHotel("2A", "Imperial");
    board.placeIndependentTile("3B");
    board.buildHotel("3C", "Tower");
    assertFalse(board.isDependent("3A"));
  });
});

describe("getPlaceTileType(tile) method", () => {
  it("should return the adjacent hotels of a tile", () => {
    const imperial = new Hotel("Imperial", 2);
    const board = new Board([imperial]);

    board.placeIndependentTile("1A");
    board.placeIndependentTile("3B");
    board.placeIndependentTile("4A");
    board.placeIndependentTile("3A");
    const type = board.getPlaceTileType("2A");
    assertEquals(type.type, PlaceType.Build);
    assertEquals(board.placeATile("2A"), {
      type: PlaceType.Build,
      inActiveHotels: [
        {
          name: "Imperial",
          tiles: [],
          stocksAvailable: 25,
          stockPrice: 0,
          baseTile: "",
        },
      ],
      tile: "2A",
    });
  });

  it("should return the adjacent hotels of a tile", () => {
    const imperial = new Hotel("Imperial", 2);
    const board = new Board([imperial]);

    board.placeIndependentTile("1A");
    board.buildHotel("2A", "Imperial");
    const type = board.getPlaceTileType("3A");
    assertEquals(type.type, PlaceType.Dependent);
    assertEquals(board.placeATile("3A"), {
      hotel: {
        baseTile: "2A",
        name: "Imperial",
        stockPrice: 500,
        stocksAvailable: 24,
        tiles: ["1A", "3A"],
      },
      type: PlaceType.Dependent,
      tile: "3A",
    });
  });
});
