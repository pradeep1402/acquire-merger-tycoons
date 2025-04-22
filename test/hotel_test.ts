import { assert, assertEquals, assertFalse } from "assert";
import { describe, it } from "testing/bdd";
import { Hotel } from "../src/models/hotel.ts";

describe("Hotel class", () => {
  it("should return false for wrong tile", () => {
    const hotel = new Hotel("Imperial", "blue", 2);

    assertEquals(hotel.addTile("1A"), ["1A"]);
  });

  it("should return the size of hotel", () => {
    const hotel = new Hotel("Imperial", "blue", 2);
    hotel.addTile("1A");
    hotel.addTile("2A");
    assertEquals(hotel.getSize(), 2);
  });

  it("should return true if tile exist", () => {
    const hotel = new Hotel("Imperial", "blue", 2);
    hotel.addTile("1A");
    hotel.addTile("2A");
    assert(hotel.isTileBelongs("2A"));
  });

  it("should return false if tile doesn't exist", () => {
    const hotel = new Hotel("Imperial", "blue", 2);
    hotel.addTile("1A");
    hotel.addTile("2A");
    assertFalse(hotel.isTileBelongs("3A"));
  });

  it("should return details of the hotel", () => {
    const hotel = new Hotel("Imperial", "blue", 2);
    hotel.addTile("1A");
    hotel.addTile("2A");
    assertEquals(hotel.getHotel(), {
      name: "Imperial",
      tiles: ["1A", "2A"],
      color: "blue",
      stocksAvailable: 25,
    });
  });

  it("should toggle the isActive status", () => {
    const hotel = new Hotel("Imperial", "blue", 2);
    hotel.addTile("1A");
    hotel.addTile("2A");

    assert(hotel.toggleStatus());
  });

  it("should toggle the isActive status to false", () => {
    const hotel = new Hotel("Imperial", "blue", 2);
    hotel.addTile("1A");
    hotel.addTile("2A");
    hotel.toggleStatus();

    assertFalse(hotel.toggleStatus());
  });

  it("should decrement the stocks count to number provided", () => {
    const hotel = new Hotel("Imperial", "blue", 2);
    hotel.addTile("1A");
    hotel.addTile("2A");

    assertEquals(hotel.decrementStocks(3), 22);
  });
});

describe("getStockPrice", () => {
  it("should return the stock price of a given hotel for a specific number of tiles", () => {
    const hotel = new Hotel("Tower", "yellow", 0);
    hotel.addTile("1A");
    hotel.addTile("2A");

    assertEquals(hotel.getStockPrice(), 200);
  });

  it("should return the stock price as zero if given hotel is inactives", () => {
    const hotel = new Hotel("Tower", "yellow", 0);

    assertEquals(hotel.getStockPrice(), 0);
  });
});

describe("getPrimaryBonus", () => {
  it("should return the primary bonus of a given hotel for a specific number of tiles", () => {
    const hotel = new Hotel("Tower", "yellow", 0);
    hotel.addTile("1A");
    hotel.addTile("2A");

    assertEquals(hotel.getPrimaryBonus(), 2000);
  });
});

describe("getSecondaryBonus", () => {
  it("should return the secondary bonus of a given hotel for a specific number of tiles", () => {
    const hotel = new Hotel("Tower", "yellow", 0);
    hotel.addTile("1A");
    hotel.addTile("2A");

    assertEquals(hotel.getSecondaryBonus(), 1000);
  });
});
