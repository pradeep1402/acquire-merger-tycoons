import { assertEquals, assertFalse } from "assert";
import { describe, it } from "testing/bdd";
import { createApp } from "../src/app.ts";
import { Sessions } from "../src/models/sessions.ts";
import { GameManager } from "../src/models/game_manager.ts";
import { Hotel } from "../src/models/hotel.ts";
import { buyStocks } from "../src/models/game.ts";
// import { Game } from "../src/models/game.ts";

describe("App: /login", () => {
  it("should receive a cookie and redirect to index page", async () => {
    const idGenerator = () => "1";
    const formData = new FormData();
    formData.set("playerName", "Adhi");
    const tileGenerator = () => ["1A"];
    const gameManager = new GameManager(tileGenerator, []);
    const sessions = new Sessions(idGenerator);
    const app = createApp(sessions, gameManager);
    const res = await app.request("/login", { method: "POST", body: formData });

    assertEquals(res.headers.getSetCookie(), ["sessionId=1; Path=/"]);
    assertEquals(res.status, 303);
  });

  it("should redirect to index page if already loggedin", async () => {
    const tileGenerator = () => ["1A"];
    const gameManager = new GameManager(tileGenerator, []);
    const idGenerator = () => "1";
    const sessions = new Sessions(idGenerator);
    sessions.addPlayer("likhi");
    const app = createApp(sessions, gameManager);
    const res = await app.request("/login.html", {
      headers: { cookie: "sessionId=1;gameId=1" },
    });

    assertEquals(res.status, 303);
  });

  it("should open login.html if not logged in .", async () => {
    const idGenerator = () => "1";
    const tileGenerator = () => ["1A"];
    const gameManager = new GameManager(tileGenerator, []);
    const sessions = new Sessions(idGenerator);
    const app = createApp(sessions, gameManager);

    const res = await app.request("/login.html");

    await res.text();
    assertEquals(res.status, 200);
  });
});

describe("App: acquire/game-status", () => {
  it("should return the game status when only one player", async () => {
    let id = 0;
    const idGenerator = () => `${id++}`;
    const tileGenerator = () => ["1A"];
    const gameManager = new GameManager(tileGenerator, []);
    const sessions = new Sessions(idGenerator);
    const player1 = sessions.addPlayer("Adi");
    sessions.addToWaitingList(player1, gameManager);

    const app = createApp(sessions, gameManager);
    const res = await app.request("/acquire/game-status", {
      method: "GET",
      headers: { cookie: "sessionId=1;gameId=0" },
    });

    assertEquals(await res.json(), {
      gameId: "0",
      players: [{ name: "Adi", status: "Waiting" }],
    });
    assertEquals(res.status, 200);
  });

  it("should return the game status as START when required number of players join the game", async () => {
    let id = 0;
    const idGenerator = () => `${id++}`;
    const tileGenerator = () => ["1A"];
    const gameManager = new GameManager(tileGenerator, []);
    const sessions = new Sessions(idGenerator);
    const player1 = sessions.addPlayer("Adi");
    const player2 = sessions.addPlayer("Bdi");
    const player3 = sessions.addPlayer("Cdi");
    sessions.addToWaitingList(player1, gameManager);
    sessions.addToWaitingList(player2, gameManager);
    sessions.addToWaitingList(player3, gameManager);

    const app = createApp(sessions, gameManager);
    const res = await app.request("/acquire/game-status", {
      method: "GET",
      headers: { cookie: "sessionId=1;gameId=0" },
    });

    assertEquals(await res.json(), { status: "START" });
    assertEquals(res.status, 200);
  });
});

describe("App: acquire/home/quick-play", () => {
  it("should add player in waiting list", async () => {
    const sessions = new Sessions(() => "1");
    sessions.addPlayer("Krishna");
    const tileGenerator = () => ["A1", "A2"];
    const gameManager = new GameManager(tileGenerator, []);
    const app = createApp(sessions, gameManager);
    const res = await app.request("/acquire/home/quick-play", {
      method: "POST",
      headers: {
        cookie: "sessionId=1",
      },
    });

    assertEquals(res.status, 200);
    assertEquals(await res.json(), "1");
  });

  it("should set gameId to a player", async () => {
    const sessions = new Sessions(() => "1");
    sessions.addPlayer("Krishna");
    const tileGenerator = () => ["A1", "A2"];
    const gameManager = new GameManager(tileGenerator, []);
    const app = createApp(sessions, gameManager);
    const res = await app.request("/acquire/home/quick-play", {
      method: "POST",
      headers: {
        cookie: "sessionId=1",
      },
    });

    assertEquals(res.headers.getSetCookie(), ["gameId=1; Path=/"]);
  });
});

describe("App: /", () => {
  it("should redirect to waiting page when player already have gameId and is waiting", async () => {
    const sessions = new Sessions(() => "1");
    sessions.addPlayer("Krishna");
    const tileGenerator = () => ["A1", "A2"];
    const gameManager = new GameManager(tileGenerator, []);
    const app = createApp(sessions, gameManager);
    const res = await app.request("/", {
      headers: {
        cookie: "sessionId=1;gameId=1",
      },
    });

    assertEquals(res.status, 303);
    assertEquals(res.headers.get("location"), "/lobby.html");
  });

  it("should redirect to game page when three players started the game", async () => {
    let i = 0;
    const idGenerator = () => `${i++}`;
    const sessions = new Sessions(idGenerator);
    const tileGenerator = () => ["A1", "A2"];
    const gameManager = new GameManager(tileGenerator, []);
    sessions.addPlayer("Krishna");
    sessions.addPlayer("Sudheer");
    sessions.addPlayer("Adi");
    sessions.addToWaitingList("1", gameManager);
    sessions.addToWaitingList("2", gameManager);
    sessions.addToWaitingList("3", gameManager);

    sessions.createRoom(gameManager);
    const app = createApp(sessions, gameManager);
    const res = await app.request("/", {
      headers: {
        cookie: "sessionId=1;gameId=0",
      },
    });

    assertEquals(res.status, 303);
    assertEquals(res.headers.get("location"), "/game.html");
  });
  it("should redirect to game page when accessing lobby", async () => {
    let i = 0;
    const idGenerator = () => `${i++}`;
    const sessions = new Sessions(idGenerator);
    const tileGenerator = () => ["A1", "A2"];
    const gameManager = new GameManager(tileGenerator, []);
    sessions.addPlayer("Krishna");
    sessions.addPlayer("Sudheer");
    sessions.addPlayer("Adi");
    sessions.addToWaitingList("1", gameManager);
    sessions.addToWaitingList("2", gameManager);
    sessions.addToWaitingList("3", gameManager);

    sessions.createRoom(gameManager);
    const app = createApp(sessions, gameManager);
    const res = await app.request("/lobby.html", {
      headers: {
        cookie: "sessionId=1;gameId=0",
      },
    });

    assertEquals(res.status, 303);
    assertEquals(res.headers.get("location"), "/game.html");
  });
  it("should redirect to game page when accessing game", async () => {
    let i = 0;
    const idGenerator = () => `${i++}`;
    const sessions = new Sessions(idGenerator);
    const tileGenerator = () => ["A1", "A2"];
    const gameManager = new GameManager(tileGenerator, []);
    sessions.addPlayer("Krishna");
    sessions.addPlayer("Sudheer");
    sessions.addPlayer("Adi");
    sessions.addToWaitingList("1", gameManager);
    sessions.addToWaitingList("2", gameManager);
    sessions.addToWaitingList("3", gameManager);

    sessions.createRoom(gameManager);
    const app = createApp(sessions, gameManager);
    const res = await app.request("/game.html", {
      headers: {
        cookie: "sessionId=1;gameId=0",
      },
    });
    await res.text();

    assertEquals(res.status, 200);
  });

  it("should redirect to lobby when accessing game page", async () => {
    let i = 0;
    const idGenerator = () => `${i++}`;
    const sessions = new Sessions(idGenerator);
    const tileGenerator = () => ["A1", "A2"];
    const gameManager = new GameManager(tileGenerator, []);
    sessions.addPlayer("Krishna");
    sessions.addToWaitingList("1", gameManager);

    const app = createApp(sessions, gameManager);
    const res = await app.request("/game.html", {
      headers: {
        cookie: "sessionId=1;gameId=0",
      },
    });

    assertEquals(res.status, 303);
    assertEquals(res.headers.get("location"), "/lobby.html");
  });

  it("should remove cookies when logout", async () => {
    let i = 0;
    const idGenerator = () => `${i++}`;
    const sessions = new Sessions(idGenerator);
    const tileGenerator = () => ["A1", "A2"];
    const gameManager = new GameManager(tileGenerator, []);
    sessions.addPlayer("Krishna");
    sessions.addToWaitingList("1", gameManager);

    const app = createApp(sessions, gameManager);
    const res = await app.request("/logout", {
      headers: {
        cookie: "sessionId=1;gameId=0",
      },
    });

    assertEquals(res.status, 200);
  });

  it("should redirect to lobby when accessing lobby page", async () => {
    let i = 0;
    const idGenerator = () => `${i++}`;
    const sessions = new Sessions(idGenerator);
    const tileGenerator = () => ["A1", "A2"];
    const gameManager = new GameManager(tileGenerator, []);
    sessions.addPlayer("Krishna");
    sessions.addToWaitingList("1", gameManager);

    const app = createApp(sessions, gameManager);
    const res = await app.request("/lobby.html", {
      headers: {
        cookie: "sessionId=1;gameId=0",
      },
    });
    await res.text();
    assertEquals(res.status, 200);
  });

  it("should return the home page", async () => {
    const idGenerator = () => "1";
    const sessions = new Sessions(idGenerator);
    const tileGenerator = () => ["A1", "A2"];
    const gameManager = new GameManager(tileGenerator, []);
    sessions.addPlayer("Krishna");

    const app = createApp(sessions, gameManager);
    const res = await app.request("/", {
      headers: {
        cookie: "sessionId=1",
      },
    });
    await res.text();

    assertEquals(res.status, 200);
  });

  it("should return to index page when accesing game", async () => {
    const idGenerator = () => "1";
    const sessions = new Sessions(idGenerator);
    const tileGenerator = () => ["A1", "A2"];
    const gameManager = new GameManager(tileGenerator, []);
    sessions.addPlayer("Krishna");

    const app = createApp(sessions, gameManager);
    const res = await app.request("/game.html", {
      headers: {
        cookie: "sessionId=1",
      },
    });
    await res.text();

    assertEquals(res.status, 303);
  });

  it("should return to index page when accesing lobby", async () => {
    const idGenerator = () => "1";
    const sessions = new Sessions(idGenerator);
    const tileGenerator = () => ["A1", "A2"];
    const gameManager = new GameManager(tileGenerator, []);
    sessions.addPlayer("Krishna");

    const app = createApp(sessions, gameManager);
    const res = await app.request("/lobby.html", {
      headers: {
        cookie: "sessionId=1",
      },
    });
    await res.text();

    assertEquals(res.status, 303);
  });

  it("should return the login page", async () => {
    const idGenerator = () => "1";
    const sessions = new Sessions(idGenerator);
    const tileGenerator = () => ["1A"];
    const gameManager = new GameManager(tileGenerator, []);

    const app = createApp(sessions, gameManager);
    const res = await app.request("/");
    await res.text();

    assertEquals(res.status, 303);
  });
});

describe("App: /game-stats", () => {
  it("should return game stats when game starts", async () => {
    let id = 0;
    const idGenerator = () => `${id++}`;
    const tileGenerator = () => ["1A"];
    const gameManager = new GameManager(tileGenerator, []);
    const sessions = new Sessions(idGenerator);
    const player1 = sessions.addPlayer("Adi");
    const player2 = sessions.addPlayer("bisht");
    const player3 = sessions.addPlayer("malli");
    sessions.addToWaitingList(player1, gameManager);
    sessions.addToWaitingList(player2, gameManager);
    sessions.addToWaitingList(player3, gameManager);

    const app = createApp(sessions, gameManager);
    const res = await app.request("/acquire/game-stats", {
      method: "GET",
      headers: { cookie: "sessionId=1;gameId=0" },
    });
    const expected = {
      board: {
        independentTiles: [],
        activeHotels: [],
        inActiveHotels: [],
        mergerTile: [],
      },
      playerPortfolio: {
        cash: 6000,
        playerId: "1",
        stocks: {
          American: 0,
          Continental: 0,
          Festival: 0,
          Imperial: 0,
          Sackson: 0,
          Tower: 0,
          Worldwide: 0,
        },
        tiles: ["1A"],
      },
      players: [
        { isTheSamePlayer: true, name: "Adi" },
        { isTheSamePlayer: false, name: "bisht" },
        { isTheSamePlayer: false, name: "malli" },
      ],
      currentPlayer: "Adi",
      isMyTurn: true,
    };

    assertEquals(await res.json(), expected);
    assertEquals(res.status, 200);
  });

  it("should return the first player as current player when game starts", async () => {
    let id = 0;
    const idGenerator = () => `${id++}`;
    const tileGenerator = () => ["1A"];
    const gameManager = new GameManager(tileGenerator, []);
    const sessions = new Sessions(idGenerator);
    const player1 = sessions.addPlayer("Adi");
    const player2 = sessions.addPlayer("bisht");
    const player3 = sessions.addPlayer("malli");
    sessions.addToWaitingList(player1, gameManager);
    sessions.addToWaitingList(player2, gameManager);
    sessions.addToWaitingList(player3, gameManager);

    const app = createApp(sessions, gameManager);
    const res = await app.request("/acquire/game-stats", {
      method: "GET",
      headers: { cookie: "sessionId=2;gameId=0" },
    });
    const gameStats = await res.json();
    assertEquals(gameStats.currentPlayer, "Adi");
    assertEquals(gameStats.players, [
      { isTheSamePlayer: false, name: "Adi" },
      { isTheSamePlayer: true, name: "bisht" },
      { isTheSamePlayer: false, name: "malli" },
    ]);
    assertEquals(res.status, 200);
  });
});

describe("App: /acquire/place-tile/:tile", () => {
  it("should return true if tile placed", async () => {
    let id = 0;
    const idGenerator = () => `${id++}`;
    const tileGenerator = () => ["1A", "2A"];
    const gameManager = new GameManager(tileGenerator, []);
    const sessions = new Sessions(idGenerator);

    const player1 = sessions.addPlayer("Adi");
    const player2 = sessions.addPlayer("bisht");
    const player3 = sessions.addPlayer("malli");

    sessions.addToWaitingList(player1, gameManager);
    sessions.addToWaitingList(player2, gameManager);
    sessions.addToWaitingList(player3, gameManager);

    const app = createApp(sessions, gameManager);
    const res = await app.request("/acquire/place-tile/1A", {
      method: "PATCH",
      headers: { cookie: "sessionId=1;gameId=0" },
    });

    assertEquals(await res.json(), { type: "Independent", tile: "1A" });
    assertEquals(res.status, 200);
  });

  it("should return true if tile placed", async () => {
    let id = 0;
    const idGenerator = () => `${id++}`;
    const tileGenerator = () => ["1A", "2A"];
    const gameManager = new GameManager(tileGenerator, []);
    const sessions = new Sessions(idGenerator);
    const player1 = sessions.addPlayer("Adi");
    const player2 = sessions.addPlayer("bisht");
    const player3 = sessions.addPlayer("malli");
    sessions.addToWaitingList(player1, gameManager);
    sessions.addToWaitingList(player2, gameManager);
    sessions.addToWaitingList(player3, gameManager);

    const app = createApp(sessions, gameManager);
    const res = await app.request("/acquire/place-tile/3A", {
      method: "PATCH",
      headers: { cookie: "sessionId=1;gameId=0" },
    });

    assertFalse((await res.json()).status);
    assertEquals(res.status, 200);
  });
});

describe("App: /acquire/place-tile/:tile/:hotel", () => {
  it("should return the new hotel info when the hotel build request is send with the hotel name", async () => {
    let id = 0;
    const idGenerator = () => `${id++}`;
    const tileGenerator = () => ["2A", "3A"];
    const gameManager = new GameManager(tileGenerator, [
      new Hotel("Imperial", "orange", 2),
    ]);
    const sessions = new Sessions(idGenerator);

    const player1 = sessions.addPlayer("Adi");
    const player2 = sessions.addPlayer("bisht");
    const player3 = sessions.addPlayer("malli");

    sessions.addToWaitingList(player1, gameManager);
    sessions.addToWaitingList(player2, gameManager);
    sessions.addToWaitingList(player3, gameManager);

    const app = createApp(sessions, gameManager);

    await app.request("/acquire/place-tile/3A", {
      method: "PATCH",
      headers: { cookie: "sessionId=1;gameId=0" },
    });

    const res = await app.request("/acquire/place-tile/2A/Imperial", {
      method: "PATCH",
      headers: { cookie: "sessionId=1;gameId=0" },
    });

    assertEquals(await res.json(), {
      name: "Imperial",
      tiles: ["3A"],
      color: "orange",
      stocksAvailable: 24,
      stockPrice: 400,
      baseTile: "2A",
    });
    assertEquals(res.status, 200);
  });
});

describe("buyStocks() method", () => {
  it("should update cash and stocks after buying", async () => {
    let id = 0;
    const idGenerator = () => `${id++}`;
    const tileGenerator = () => ["2A", "3A"];
    const gameManager = new GameManager(tileGenerator, [
      new Hotel("Imperial", "orange", 2),
    ]);
    const sessions = new Sessions(idGenerator);

    const player1 = sessions.addPlayer("Adi");
    const player2 = sessions.addPlayer("bisht");
    const player3 = sessions.addPlayer("malli");

    sessions.addToWaitingList(player1, gameManager);
    sessions.addToWaitingList(player2, gameManager);
    sessions.addToWaitingList(player3, gameManager);

    const app = createApp(sessions, gameManager);

    await app.request("/acquire/place-tile/3A", {
      method: "PATCH",
      headers: { cookie: "sessionId=1;gameId=0" },
    });

    await app.request("/acquire/end-turn", {
      method: "PATCH",
      headers: { cookie: "sessionId=1;gameId=0" },
    });

    await app.request("/acquire/place-tile/2A/Imperial", {
      method: "PATCH",
      headers: { cookie: "sessionId=2;gameId=0" },
    });

    const stocks: buyStocks[] = [{ hotel: "Imperial", count: 3 }];
    const res = await app.request("/acquire/buy-stocks", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        cookie: "sessionId=2;gameId=0",
        body: JSON.stringify(stocks),
      },
    });

    assertEquals(await res.json(), {
      cash: 4800,
      playerId: "2",
      stocks: {
        American: 0,
        Continental: 0,
        Festival: 0,
        Imperial: 4,
        Sackson: 0,
        Tower: 0,
        Worldwide: 0,
      },
      tiles: [],
    });
  });
});
