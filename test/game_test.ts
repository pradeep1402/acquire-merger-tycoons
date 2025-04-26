import { assertEquals } from "assert";
import { describe, it } from "testing/bdd";
import { PlaceType } from "../src/models/board.ts";
import { Hotel } from "../src/models/hotel.ts";
import { BuyStocks, Merger, MergeType } from "../src/models/merger.ts";
import { StdGame } from "../src/models/stdGame.ts";
import { BoardDetails, GameStats } from "../src/models/game.ts";
import { Player } from "../src/models/player.ts";

describe("Game model", () => {
  describe("getPlayerIds(", () => {
    it("should return all the players ids", () => {
      const players: string[] = ["12", "13", "14"];
      const game = new StdGame(
        ["1A", "2A", "3A", "4A", "5A", "6A"],
        players,
        [],
      );

      game.getPlayerIds().forEach((playerId, i) => {
        assertEquals(playerId, players[i]);
      });
    });
  });

  describe("getPlayer(", () => {
    it("should return  the player with id", () => {
      const players: string[] = ["12", "13", "14"];
      const game = new StdGame([], players, []);

      assertEquals(game.getPlayer("12"), new Player("12", []));
    });
  });

  describe("tradeAndSellStocks()", () => {
    it("should return error with message when accessing tradeAndSellStocks", () => {
      const game = new StdGame([], [], []);

      const { error } = game.tradeAndSellStocks(
        { acquirer: "American", target: "Continental", count: 3 },
        [],
        "",
      );
      assertEquals(error, "Not valid in Standard Game Mode");
    });
  });

  describe("getPlayerDetails(playerId) method", () => {
    it("should return a specific player info", () => {
      const players: string[] = ["123"];
      const tiles = ["1A"];
      const game = new StdGame([...tiles], players, []);
      const actual = game.getPlayerDetails("123");

      assertEquals(actual?.playerId, "123");
      assertEquals(actual?.cash, 6000);

      assertEquals(actual?.tiles, tiles);
    });
  });

  describe("placeTile() method", () => {
    it("should return false for wrong tile", () => {
      const players: string[] = ["Adi", "Malli", "Aman"];
      const game = new StdGame(["1A", "2A"], players, []);

      assertEquals(game.placeTile("3A"), { status: false });
    });

    it("should return the tile info of placed tile", () => {
      const players: string[] = ["Adi", "Malli", "Aman"];
      const game = new StdGame(["1A", "2A"], players, []);

      assertEquals(game.placeTile("1A"), {
        tile: "1A",
        type: PlaceType.Independent,
      });
    });

    it("should return the tile info when tile type is build", () => {
      const players: string[] = ["Adi"];
      const hotel = new Hotel("Imperial", 2);
      const game = new StdGame(["1A", "2A"], players, [hotel]);
      game.placeTile("2A");

      assertEquals(game.placeTile("1A"), {
        inActiveHotels: [
          {
            name: "Imperial",
            tiles: [],
            stocksAvailable: 25,
            stockPrice: 0,
            baseTile: "",
          },
        ],
        tile: "1A",
        type: PlaceType.Build,
      });
    });
  });

  describe("foundHotel() method", () => {
    it("should return false for wrong tile", () => {
      const players: string[] = ["Adi", "Malli", "Aman"];
      const game = new StdGame(["1A", "2A"], players, [
        new Hotel("Imperial", 2),
      ]);

      assertEquals(game.foundHotel("3A", "Imperial"), {
        hotel: {
          name: "Imperial",
          tiles: [],
          stocksAvailable: 24,
          stockPrice: 0,
          baseTile: "3A",
        },
        stockAllotted: true,
      });
    });
  });

  describe("buyStocks() method", () => {
    it("should return updated player details when buying only one kind of stocks", () => {
      const players: string[] = ["Adi", "Malli", "Aman"];
      const game = new StdGame(["1A", "2A", "5A"], players, [
        new Hotel("Imperial", 2),
      ]);
      game.placeTile("1A");
      game.changeTurn();

      game.foundHotel("2A", "Imperial");
      const stocks: BuyStocks[] = [{ hotel: "Imperial", count: 3 }];
      const result = game.buyStocks(stocks, "Malli");

      assertEquals(result, {
        cash: 4800,
        playerId: "Malli",
        tiles: [],
        stocks: {
          Sackson: 0,
          Tower: 0,
          Festival: 0,
          Worldwide: 0,
          American: 0,
          Continental: 0,
          Imperial: 4,
        },
      });
    });

    it("should return updated player details when buying multiple kind of stocks", () => {
      const players: string[] = ["Adi", "Malli", "Aman"];
      const game = new StdGame(
        [
          "1A",
          "2A",
          "5A",
          "6A",
          "7A",
          "8A",
          "9A",
          "10A",
          "11A",
          "12A",
          "1B",
          "2B",
          "3B",
          "4B",
          "5B",
          "6B",
          "7B",
          "9B",
          "10B",
          "11B",
        ],
        players,
        [new Hotel("Imperial", 2), new Hotel("Continental", 2)],
      );
      game.placeTile("8A");
      game.changeTurn();
      game.foundHotel("7A", "Imperial");
      game.changeTurn();
      game.placeTile("9B");
      game.changeTurn();
      game.foundHotel("10B", "Continental");
      game.changeTurn();
      const stocks: BuyStocks[] = [
        { hotel: "Imperial", count: 1 },
        { hotel: "Continental", count: 2 },
      ];
      const result = game.buyStocks(stocks, "Malli");
      const mergeGame = game.playTurn("9A") as Merger;
      assertEquals(mergeGame.placeTile("9A"), {
        tile: "9A",
        type: PlaceType.Merge,
        mergeDetails: {
          typeofMerge: MergeType.SelectiveMerge,
          hotels: [
            { name: "Imperial", size: 2, baseTile: "7A" },
            { name: "Continental", size: 2, baseTile: "10B" },
          ],
        },
      });

      assertEquals(mergeGame.getState(), game);
      assertEquals(game.placeTile("9A"), { tile: "9A", type: PlaceType.Merge });

      assertEquals(result, {
        playerId: "Malli",
        cash: 4800,
        tiles: ["9A", "10A", "11A", "12A", "1B", "2B", "11B"],
        stocks: {
          Sackson: 0,
          Tower: 0,
          Festival: 0,
          Worldwide: 0,
          American: 0,
          Continental: 2,
          Imperial: 2,
        },
      });
    });
  });

  describe("Testing mergers", () => {
    it("testing merger class when there two hotel merging of same size", () => {
      const players: string[] = ["Adi", "Malli", "Aman"];
      const game = new StdGame(
        [
          "1A",
          "2A",
          "5A",
          "6A",
          "7A",
          "8A",
          "9A",
          "10A",
          "11A",
          "12A",
          "1B",
          "2B",
          "3B",
          "4B",
          "5B",
          "6B",
          "7B",
          "9B",
          "10B",
          "11B",
        ],
        players,
        [new Hotel("Imperial", 2), new Hotel("Continental", 2)],
      );
      game.placeTile("8A");
      game.changeTurn();
      game.foundHotel("7A", "Imperial");
      game.changeTurn();
      game.placeTile("9B");
      game.changeTurn();
      game.foundHotel("10B", "Continental");
      game.changeTurn();
      const stocks: BuyStocks[] = [
        { hotel: "Imperial", count: 1 },
        { hotel: "Continental", count: 2 },
      ];
      const result = game.buyStocks(stocks, "Malli");
      const mergeGame = game.playTurn("9A") as Merger;
      assertEquals(mergeGame.placeTile("9A"), {
        tile: "9A",
        type: PlaceType.Merge,
        mergeDetails: {
          typeofMerge: MergeType.SelectiveMerge,
          hotels: [
            { name: "Imperial", size: 2, baseTile: "7A" },
            { name: "Continental", size: 2, baseTile: "10B" },
          ],
        },
      });

      assertEquals(mergeGame.getState(), game);
      assertEquals(game.placeTile("9A"), {
        tile: "9A",
        type: PlaceType.Merge,
      });

      assertEquals(result, {
        playerId: "Malli",
        cash: 4800,
        tiles: ["9A", "10A", "11A", "12A", "1B", "2B", "11B"],
        stocks: {
          Sackson: 0,
          Tower: 0,
          Festival: 0,
          Worldwide: 0,
          American: 0,
          Continental: 2,
          Imperial: 2,
        },
      });
    });

    it("testing merger class when there are two hotel merging of different size", () => {
      const players: string[] = ["Adi", "Malli", "Aman"];
      const game = new StdGame(
        [
          "6A",
          "7A",
          "8A",
          "9A",
          "9B",
          "10B",
          "11B",
          "10A",
          "6B",
          "7B",
          "12B",
          "1C",
        ],
        players,
        [new Hotel("Imperial", 2), new Hotel("Continental", 2)],
      );
      game.placeTile("8A");

      game.foundHotel("7A", "Imperial");

      game.placeTile("6A");

      game.placeTile("9B");

      game.foundHotel("10B", "Continental");

      const mergeGame = game.playTurn("8B") as Merger;

      assertEquals(mergeGame.placeTile("8B"), {
        tile: "8B",
        type: PlaceType.Merge,
        mergeDetails: {
          target: {
            name: "Continental",
            size: 2,
            baseTile: "10B",
          },
          acquirer: {
            name: "Imperial",
            size: 3,
            baseTile: "7A",
          },
          typeofMerge: MergeType.AutoMerge,
        },
      });

      assertEquals(mergeGame.getState(), game);
      assertEquals(game.placeTile("9A"), {
        tile: "9A",
        type: PlaceType.Merge,
      });
    });
  });

  describe("getGameStats() method", () => {
    it("should return game stats", () => {
      const players: string[] = ["Adi", "Malli"];
      const game = new StdGame(
        ["1A", "2A", "3A", "4A", "5A", "6A", "7A", "8A", "9A"],
        players,
        [],
      );

      const board: BoardDetails = {
        independentTiles: [],
        activeHotels: [],
        inActiveHotels: [],
        mergerTile: null,
      };
      const playersId = ["Adi", "Malli"];
      const currentPlayerId = "Adi";
      const gameStats: GameStats = { board, playersId, currentPlayerId };
      assertEquals(game.getGameStats(), gameStats);
    });
  });
});
