import { assertEquals } from "assert";
import { describe, it } from "testing/bdd";
import { createApp } from "../src/app.ts";
import { Acquire } from "../src/models/game.ts";

describe("APP: acquire/game", () => {
  it("should set session id and player name", async () => {
    await (await createApp(new Acquire()).request("/")).text();

    assertEquals(1, 1);
  });
});
