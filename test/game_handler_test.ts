import { assertEquals } from "assert";
import { describe, it } from "testing/bdd";
import { Acquire, Player } from "../src/models/game.ts";
import { createApp } from "../src/app.ts";

describe("App: acquire/players", () => {
  it("should serve the list of players in the game", async () => {
    const players: Player[] = [{ id: 2, name: "krishnanand" }];

    const acquire = new Acquire(players);
    const app = createApp(acquire);
    const res = await app.request("acquire/players");

    assertEquals(await res.json(), players);
    assertEquals(res.status, 200);
  });
});
