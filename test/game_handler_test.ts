import { assertEquals } from "assert";
import { describe, it } from "testing/bdd";
import { Acquire } from "../src/models/game.ts";
import { createApp } from "../src/app.ts";

describe("App: acquire/players", () => {
  it("should serve the list of players in the game", async () => {
    const players: string[] = ["krishnanand", "Adi", "Pradeep"];

    const acquire = new Acquire(["1A", "2A"], players);
    const sessions: Set<string> = new Set(["Adi"]);
    const app = createApp(acquire, sessions);
    const res = await app.request("acquire/players", {
      headers: { cookie: "sessionId=Adi" },
    });
    const data = await res.json();

    assertEquals(data.length, 3);
    assertEquals(res.status, 200);

    players.forEach((name, i) => {
      assertEquals(data[i].name, name);
    });
  });
});

describe("App: acquire/playerDetails", () => {
  it("should serve details of a player in the game", async () => {
    const players: string[] = ["krishnanand", "Adi", "Pradeep"];

    const acquire = new Acquire(["1A", "2A"], players);
    const sessions: Set<string> = new Set(["Adi"]);
    const app = createApp(acquire, sessions);
    const res = await app.request("acquire/player-details", {
      headers: { cookie: "sessionId=Adi" },
    });
    const data = await res.json();

    assertEquals(data.name, "Adi");
    assertEquals(res.status, 200);
  });
});

describe("App: acquire/gameboard", () => {
  it("should return the board array", async () => {
    const players: string[] = ["krishnanand"];

    const acquire = new Acquire(["1A", "2A"], players);
    const sessions: Set<string> = new Set(["Adi"]);
    const app = createApp(acquire, sessions);
    const res = await app.request("acquire/gameboard", {
      headers: { cookie: "sessionId=Adi" },
    });
    const board = [
      {
        label: "1A",
        isIndependent: false,
        isDead: false,
        hotel: null,
        isOccupied: false,
      },
      {
        label: "2A",
        isIndependent: false,
        isDead: false,
        hotel: null,
        isOccupied: false,
      },
    ];

    assertEquals(await res.json(), board);
    assertEquals(res.status, 200);
  });
});
