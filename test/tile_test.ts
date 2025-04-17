import { assertEquals, assertFalse } from "assert";
import { describe, it } from "testing/bdd";
import { Tile } from "../src/models/tile.ts";

describe("Tile model", () => {
  it("testing constructor", () => {
    const tile = new Tile("1A");
    const tileInfo = tile.toJSON()
    assertEquals(tileInfo.label, "1A");
    assertFalse(tileInfo.isIndependent);
    assertFalse(tileInfo.isDead);
    assertEquals(tileInfo.hotel, null);
    assertFalse(tileInfo.isOccupied);
  });
});
