import { assert, assertEquals, assertFalse } from "assert";
import { describe, it } from "testing/bdd";
import { Player } from "../src/models/player.ts";

describe("Player model", () => {
  describe("getPlayerDetails() method", () => {
    it("should return all details of player", () => {
      const tiles: string[] = ["1A", "2A"];
      const player = new Player("124", tiles);
      const person = player.getPlayerDetails();

      assertEquals(person.playerId, "124");
      assertEquals(person.tiles, tiles);
      assertEquals(person.cash, 6000);
      assertEquals(person.stocks, {
        Sackson: 0,
        Tower: 0,
        Festival: 0,
        Worldwide: 0,
        American: 0,
        Continental: 0,
        Imperial: 0,
      });
    });
  });

  describe("doesPlayerMatch() method", () => {
    it("should return true when player id matches", () => {
      const tiles: string[] = ["1A", "2A"];
      const player = new Player("121", tiles);

      assert(player.doesPlayerMatch("121"));
    });

    it("should return false when player id doesn't matches", () => {
      const tiles: string[] = ["1A", "2A"];
      const player = new Player("121", tiles);

      assertFalse(player.doesPlayerMatch("101"));
    });
  });

  describe("addTile() method", () => {
    it("should return the tiles after adding ", () => {
      const tiles: string[] = ["1A", "2A"];
      const player = new Player("121", tiles);

      assertEquals(player.addTile("3A"), ["1A", "2A", "3A"]);
    });
  });

  describe("removeTile() method", () => {
    it("should return the tiles after remove tile ", () => {
      const tiles: string[] = ["1A", "2A", "3A"];
      const player = new Player("121", tiles);

      assertEquals(player.removeTile("3A"), ["1A", "2A"]);
    });
  });

  describe("hasTile() method", () => {
    it("should return true when player has the tile ", () => {
      const tiles: string[] = ["1A", "2A"];
      const player = new Player("121", tiles);

      assert(player.hasTile("1A"));
    });

    it("should return false when player doesn't have the tile ", () => {
      const tiles: string[] = ["1A", "2A"];
      const player = new Player("121", tiles);

      assertFalse(player.hasTile("3A"));
    });
  });

  describe("addStock() method", () => {
    it("should add the stock to a perticular hotel ", () => {
      const tiles: string[] = ["1A", "2A"];
      const player = new Player("121", tiles);

      assertEquals(player.addStock(3, "American"), 3);
    });

    it("should add the stocks for multiple hotels", () => {
      const tiles: string[] = ["1A", "2A"];
      const player = new Player("121", tiles);
      player.addStock(3, "American");
      player.addStock(3, "Sackson");
      player.addStock(3, "Imperial");

      const stocks = {
        American: 3,
        Continental: 0,
        Festival: 0,
        Imperial: 3,
        Sackson: 3,
        Tower: 0,
        Worldwide: 0,
      };

      assertEquals(player.getPlayerDetails().stocks, stocks);
    });
  });

  describe("deductCash() method", () => {
    it("should add the stock to a particular hotel ", () => {
      const tiles: string[] = ["1A", "2A"];
      const player = new Player("121", tiles);

      assertEquals(player.deductCash(200), 5800);
    });
  });

  describe("countSharesOf(hotel) method", () => {
    it("should return the stock count to a particular hotel ", () => {
      const tiles: string[] = ["1A", "2A"];
      const player = new Player("121", tiles);

      assertEquals(player.countSharesOf("Tower"), 0);
    });
    it("should return the stock count to a particular hotel ", () => {
      const tiles: string[] = ["1A", "2A"];
      const player = new Player("121", tiles);
      player.addStock(2, "Tower");

      assertEquals(player.countSharesOf("Tower"), 2);
    });
  });
});

describe("hasStocksOf() method", () => {
  it("should return the false when player doesn't have the stock of a perticular stock", () => {
    const tiles: string[] = ["1A", "2A"];
    const player = new Player("121", tiles);

    assertFalse(player.hasStocksOf("Imperial"));
  });

  it("should return the true when player has the stocks of a particular hotel", () => {
    const tiles: string[] = ["1A", "2A"];
    const player = new Player("121", tiles);
    player.addStock(2, "Imperial");

    assert(player.hasStocksOf("Imperial"));
  });
});
