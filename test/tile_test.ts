import { assertEquals, assertFalse } from "assert";
import { describe, it } from "testing/bdd";
import { Tile } from "../src/models/tile.ts";

describe("Tile model", () => {
  it("testing constructor", () => {
    const tile = new Tile("1A");
    assertEquals(tile.label, "1A");
    assertFalse(tile.isIndependent);
    assertFalse(tile.isDead);
    assertEquals(tile.hotel, null);
    assertFalse(tile.isOccupied);
  });
});
