import { assertEquals } from "assert";
import { describe, it } from "testing/bdd";
import { Hotel } from "../src/models/hotel.ts";
import { Game, StdGame } from "../src/models/game.ts";
import { Merger, MergeType } from "../src/models/merger.ts";
import { PlaceType } from "../src/models/board.ts";

describe("Merger class", () => {
  it("should return the game state", () => {
    const game = new StdGame([], [], []);
    const merger = new Merger(game);

    assertEquals(merger.playTurn("3A"), game as Game);
  });

  it("should return the size of hotel", () => {
    const hotel = new Hotel("Imperial", 2);
    hotel.addTile("1A");
    hotel.addTile("2A");
    assertEquals(hotel.getSize(), 2);
  });

  it("should return error with message when accessing BuyStocks", () => {
    const game = new StdGame([], [], []);
    const merger = new Merger(game);
    const { error } = merger.buyStocks([], "");
    assertEquals(error, "Not valid in Merger Mode");
  });

  it("should return error with message when accessing foundHotel", () => {
    const game = new StdGame([], [], []);
    const merger = new Merger(game);
    const { error } = merger.foundHotel("", "American");
    assertEquals(error, "Not valid in Merger Mode");
  });

  it("should return changed player Id", () => {
    const game = new StdGame([], ["p1", "p2", "p3"], []);
    const merger = new Merger(game);
    const status = merger.changeTurn();

    assertEquals(status, { status: "p2" });
  });

  it("should return playerIds", () => {
    const game = new StdGame([], ["p1", "p2", "p3"], []);
    const merger = new Merger(game);
    const playerIds = merger.getPlayerIds();

    assertEquals(playerIds, ["p1", "p2", "p3"]);
  });

  it("should return game stats", () => {
    const game = new StdGame(
      ["1A"],
      ["p1", "p2", "p3"],
      [new Hotel("Continental", 2)],
    );
    const merger = new Merger(game);
    const gameStats = merger.getGameStats();

    assertEquals(gameStats, {
      board: {
        independentTiles: [],
        activeHotels: [],
        inActiveHotels: [
          {
            name: "Continental",
            tiles: [],
            stocksAvailable: 25,
            stockPrice: 0,
            baseTile: "",
          },
        ],
        mergerTile: [],
      },
      playersId: ["p1", "p2", "p3"],
      currentPlayerId: "p1",
    });
  });

  it("should return playerDetails when id is given", () => {
    const game = new StdGame([], ["p1", "p2", "p3"], []);
    const merger = new Merger(game);
    const playerDetails = merger.getPlayerDetails("p1");

    assertEquals(playerDetails, {
      playerId: "p1",
      cash: 6000,
      tiles: [],
      stocks: {
        Sackson: 0,
        Tower: 0,
        Festival: 0,
        Worldwide: 0,
        American: 0,
        Continental: 0,
        Imperial: 0,
      },
    });
  });

  it("should return afftected hotels in merge", () => {
    const imperial = new Hotel("Imperial", 2);
    imperial.addTile("1A");
    imperial.addTile("2A");
    const continental = new Hotel("Continental", 2);
    continental.addTile("4A");
    continental.addTile("5A");
    const game = new StdGame(
      ["1A", "2A", "3A", "4A", "5A", "6A"],
      ["player1"],
      [continental, imperial],
    );
    const merger = new Merger(game);

    assertEquals(merger.getAffectedHotels("3A")[0].getHotelName(), "Imperial");
    assertEquals(
      merger.getAffectedHotels("3A")[1].getHotelName(),
      "Continental",
    );
  });

  it("should return type of merge when two hotels with same length are merging", () => {
    const imperial = new Hotel("Imperial", 2);
    imperial.addTile("1A");
    imperial.addTile("2A");
    const continental = new Hotel("Continental", 2);
    continental.addTile("4A");
    continental.addTile("5A");
    const game = new StdGame(
      ["1A", "2A", "3A", "4A", "5A", "6A"],
      ["player1"],
      [continental, imperial],
    );
    const merger = new Merger(game);

    assertEquals(merger.placeTile("3A"), {
      tile: "3A",
      type: PlaceType.Merge,
      mergeType: {
        typeofMerge: MergeType.SelectiveMerge,
        hotels: [
          { name: "Imperial", size: 2 },
          { name: "Continental", size: 2 },
        ],
      },
    });
  });

  it("should return type of merge when two hotels with differnet length are merging", () => {
    const imperial = new Hotel("Imperial", 2);
    imperial.addTile("1A");
    imperial.addTile("2A");
    const continental = new Hotel("Continental", 2);
    continental.addTile("4A");
    continental.addTile("5A");
    continental.addTile("6A");
    const game = new StdGame(
      ["1A", "2A", "3A", "4A", "5A", "6A"],
      ["player1"],
      [continental, imperial],
    );
    const merger = new Merger(game);

    assertEquals(merger.placeTile("3A"), {
      tile: "3A",
      type: PlaceType.Merge,
      mergeType: {
        typeofMerge: MergeType.AutoMerge,
        acquirer: { name: "Continental", size: 3 },
        target: { name: "Imperial", size: 2 },
      },
    });
  });
});
