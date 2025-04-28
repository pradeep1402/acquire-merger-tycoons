import { assert, assertEquals, assertFalse } from "assert";
import { describe, it } from "testing/bdd";
import { Hotel } from "../src/models/hotel.ts";
import {
  BuyStocks,
  Merger,
  MergeType,
  TradeStats,
} from "../src/models/merger.ts";
import { stub } from "testing/mock";
import { StdGame } from "../src/models/stdGame.ts";
import { Player } from "../src/models/player.ts";
import { TileStatus } from "../src/models/board.ts";
import { Game } from "../src/models/game.ts";

describe("Merger class", () => {
  it("should return the game state", () => {
    const game: Game = new StdGame([], [], []);
    const merger = new Merger(game);

    assertEquals(merger.playTurn("3A"), game);
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
    let index = 0;
    const game = new StdGame([], ["p1", "p2", "p3"], []);
    const merger = new Merger(game);
    stub(merger, "doesPlayerHasStocks", () => {
      const value = [true, false][index++];
      return value;
    });
    const status = merger.changeTurn();

    assertEquals(status, { status: "p2" });
  });

  it("should return changed player Id", () => {
    let index = 0;
    const game = new StdGame([], ["p1", "p2", "p3"], []);
    const merger = new Merger(game);
    stub(merger, "doesPlayerHasStocks", () => {
      const value = [false, true][index++];
      return value;
    });
    const status = merger.changeTurn();

    assertEquals(status, { status: "p3" });
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
    console.log(gameStats);

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
        mergerTile: null,
      },
      playersId: ["p1", "p2", "p3"],
      currentPlayerId: "p1",
      mode: null,
      acquirer: null,
      target: null,
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

  it("should return true when player have the stocks", () => {
    const game = new StdGame([], ["p1", "p2", "p3"], []);
    const player = new Player("Player1", []);
    const merger = new Merger(game);
    stub(merger, "getPlayer", () => player);
    stub(player, "hasStocksOf", () => true);

    assert(merger.doesPlayerHasStocks());
  });

  it("should return false when player doesn't have the stocks", () => {
    const game = new StdGame([], ["p1", "p2", "p3"], []);
    const player = new Player("Player1", []);
    const merger = new Merger(game);
    stub(merger, "getPlayer", () => player);
    stub(player, "hasStocksOf", () => false);

    assertFalse(merger.doesPlayerHasStocks());
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
      type: TileStatus.Merge,
      mergeDetails: {
        typeofMerge: MergeType.SelectiveMerge,
        hotels: [
          { name: "Imperial", size: 2, baseTile: "" },
          { name: "Continental", size: 2, baseTile: "" },
        ],
      },
    });
  });

  it("should return type of merge when two hotels with different length are merging", () => {
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
      type: TileStatus.Merge,
      mergeDetails: {
        typeofMerge: MergeType.AutoMerge,
        acquirer: { name: "Continental", size: 3, baseTile: "" },
        target: [{ name: "Imperial", size: 2, baseTile: "" }],
      },
    });
  });

  it("should return player details when the trade and sell stocks", () => {
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
    const player = new Player("player1", []);
    player.addStock(5, "Continental");

    const mergerGame = new Merger(game);
    stub(game, "getPlayer", () => player);
    stub(game, "getPlayerDetails", () => player.getPlayerDetails());

    const tradeStats: TradeStats = {
      acquirer: "Imperial",
      target: "Continental",
      count: 2,
    };
    const playerId = "player1";
    const sellStocks: BuyStocks[] = [{ hotel: "Continental", count: 2 }];
    assertEquals(
      mergerGame.tradeAndSellStocks(tradeStats, sellStocks, playerId),
      {
        playerId: "player1",
        cash: 7000,
        tiles: [],
        stocks: {
          Sackson: 0,
          Tower: 0,
          Festival: 0,
          Worldwide: 0,
          American: 0,
          Continental: 1,
          Imperial: 1,
        },
      },
    );
  });

  it("should return the acquirer and targets along with the players who got the primart and secondary bonuses.", () => {
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

    merger.placeTile("3A");
    const mergerHotelsDetails = merger.setupMergerEntities("Imperial");
    assertEquals(mergerHotelsDetails, {
      acquirer: "Imperial",
      target: ["Continental"],
    });
  });

  it("should return the acquirer and targets along with the players who got the primary and secondary bonuses.", () => {
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

    merger.placeTile("3A");
    const mergerHotelsDetails = merger.setupMergerEntities("Imperial");
    assertEquals(mergerHotelsDetails, {
      acquirer: "Imperial",
      target: ["Continental"],
    });
  });
});
