import { assertEquals } from "assert";
import { describe, it } from "testing/bdd";
import { buyStocks, Game } from "../src/models/game.ts";
import { PlaceType } from "../src/models/board.ts";
import { Hotel } from "../src/models/hotel.ts";

describe("Game model", () => {
  describe("getPlayerIds(", () => {
    it("should return all the players ids", () => {
      const players: string[] = ["12", "13", "14"];
      const game = new Game(["1A", "2A", "3A", "4A", "5A", "6A"], players, []);

      game.getPlayerIds().forEach((playerId, i) => {
        assertEquals(playerId, players[i]);
      });
    });
  });

  describe("getPlayerDetails(playerId) method", () => {
    it("should return a specific player info", () => {
      const players: string[] = ["123"];
      const tiles = ["1A"];
      const game = new Game([...tiles], players, []);
      const actual = game.getPlayerDetails("123");

      assertEquals(actual?.playerId, "123");
      assertEquals(actual?.cash, 6000);

      assertEquals(actual?.tiles, tiles);
    });
  });

  describe("getBoard() method", () => {
    it("should return no tile when no tile is placed", () => {
      const players: string[] = ["Adi", "Malli", "Aman"];
      const game = new Game(["1A", "2A"], players, []);
      const board = {
        independentTiles: [],
        activeHotels: [],
        inActiveHotels: [],
        mergerTile: [],
      };
      assertEquals(game.getBoard(), board);
    });

    it("should return independent tiles when one tile is placed", () => {
      const players: string[] = ["Adi", "Malli", "Aman"];
      const game = new Game(["1A", "2A"], players, []);
      const board = {
        independentTiles: ["1A"],
        activeHotels: [],
        inActiveHotels: [],
        mergerTile: [],
      };
      game.placeTile("1A");
      assertEquals(game.getBoard(), board);
    });

    it("should return independent tiles when two tile is placed", () => {
      const players: string[] = ["Adi", "Malli", "Aman"];
      const game = new Game(["1A", "2A"], players, []);
      const board = {
        independentTiles: ["1A"],
        activeHotels: [],
        inActiveHotels: [],
        mergerTile: [],
      };
      game.placeTile("1A");
      game.placeTile("2A");
      assertEquals(game.getBoard(), board);
    });
  });

  describe("placeTile() method", () => {
    it("should return false for wrong tile", () => {
      const players: string[] = ["Adi", "Malli", "Aman"];
      const game = new Game(["1A", "2A"], players, []);

      assertEquals(game.placeTile("3A"), { status: false });
    });

    it("should return the tile info of placed tile", () => {
      const players: string[] = ["Adi", "Malli", "Aman"];
      const game = new Game(["1A", "2A"], players, []);

      assertEquals(game.placeTile("1A"), {
        tile: "1A",
        type: PlaceType.Independent,
      });
    });

    it("should return the tile info when tile type is build", () => {
      const players: string[] = ["Adi"];
      const hotel = new Hotel("Imperial", "blue", 2);
      const game = new Game(["1A", "2A"], players, [hotel]);
      game.placeTile("2A");

      assertEquals(game.placeTile("1A"), {
        inActiveHotels: [
          {
            color: "blue",
            name: "Imperial",
            tiles: [],
            stocksAvailable: 25,
            stockPrice: 0,
            baseTile: "",
          },
        ],
        type: PlaceType.Build,
      });
    });
  });

  describe("foundHotel() method", () => {
    it("should return false for wrong tile", () => {
      const players: string[] = ["Adi", "Malli", "Aman"];
      const game = new Game(["1A", "2A"], players, [
        new Hotel("Imperial", "orange", 2),
      ]);

      assertEquals(game.foundHotel("3A", "Imperial"), {
        name: "Imperial",
        tiles: [],
        color: "orange",
        stocksAvailable: 24,
        stockPrice: 0,
        baseTile: "3A",
      });
    });
  });

  describe("buyStocks() method", () => {
    it("should return updated player details when buying only one kind of stocks", () => {
      const players: string[] = ["Adi", "Malli", "Aman"];
      const game = new Game(["1A", "2A", "5A"], players, [
        new Hotel("Imperial", "orange", 2),
      ]);
      game.placeTile("1A");
      game.foundHotel("2A", "Imperial");
      const stocks: buyStocks[] = [{ hotel: "Imperial", count: 3 }];
      const result = game.buyStocks(stocks);

      assertEquals(result, {
        cash: 4800,
        playerId: "Aman",
        tiles: [],
        stocks: {
          Sackson: 0,
          Tower: 0,
          Festival: 0,
          Worldwide: 0,
          American: 0,
          Continental: 0,
          Imperial: 3,
        },
      });
    });

    it("should return updated player details when buying multiple kind of stocks", () => {
      const players: string[] = ["Adi", "Malli", "Aman"];
      const game = new Game(
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
        [
          new Hotel("Imperial", "orange", 2),
          new Hotel("Continental", "sky-blue", 2),
        ],
      );
      game.placeTile("8A");
      game.foundHotel("7A", "Imperial");
      game.placeTile("9B");
      game.foundHotel("10B", "Continental");
      const stocks: buyStocks[] = [
        { hotel: "Imperial", count: 1 },
        { hotel: "Continental", count: 2 },
      ];
      const result = game.buyStocks(stocks);
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

  describe("getGameStats() method", () => {
    it("should return game stats", () => {
      const players: string[] = ["Adi", "Malli"];
      const game = new Game(
        ["1A", "2A", "3A", "4A", "5A", "6A", "7A", "8A", "9A"],
        players,
        [],
      );

      const board = {
        independentTiles: [],
        activeHotels: [],
        inActiveHotels: [],
        mergerTile: [],
      };
      const playersId = ["Adi", "Malli"];
      const currentPlayerId = "Adi";
      assertEquals(game.getGameStats(), { board, playersId, currentPlayerId });
    });
  });
});
