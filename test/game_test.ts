import { assertEquals } from "assert";
import { describe, it } from "testing/bdd";
import { Game } from "../src/models/game.ts";
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
      const hotel = new Hotel("Imperial", "blue");
      const game = new Game(["1A", "2A"], players, [hotel]);
      game.placeTile("2A");

      assertEquals(game.placeTile("1A"), {
        inActiveHotels: [
          { color: "blue", name: "Imperial", tiles: [], stocksAvailable: 25 },
        ],
        type: PlaceType.Build,
      });
    });
  });

  describe("foundHotel() method", () => {
    it("should return false for wrong tile", () => {
      const players: string[] = ["Adi", "Malli", "Aman"];
      const game = new Game(["1A", "2A"], players, [
        new Hotel("Imperial", "orange"),
      ]);

      assertEquals(game.foundHotel("3A", "Imperial"), {
        name: "Imperial",
        tiles: ["3A"],
        color: "orange",
        stocksAvailable: 24,
      });
    });
  });

  describe("getGameStats() method", () => {
    it("should return the game stats", () => {
      const players: string[] = ["Adi", "Malli"];
      const game = new Game(["1A", "2A", "4A", "3B"], players, [
        new Hotel("Imperial", "orange"),
      ]);
      game.placeTile("1A");
      game.foundHotel("2A", "Imperial");

      const board = {
        independentTiles: [],
        activeHotels: [
          {
            name: "Imperial",
            tiles: ["1A", "2A"],
            color: "orange",
            stocksAvailable: 24,
          },
        ],
        inActiveHotels: [],
      };
      const playersId = ["Adi", "Malli"];
      const currentPlayerId = "Adi";
      assertEquals(game.getGameStats(), { board, playersId, currentPlayerId });
    });
  });
});
