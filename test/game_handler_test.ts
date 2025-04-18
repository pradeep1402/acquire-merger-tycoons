import { assertEquals } from "assert";
import { describe, it } from "testing/bdd";
import { createApp } from "../src/app.ts";
import { Sessions } from "../src/models/sessions.ts";
import { GameManager } from "../src/models/game_manager.ts";

describe("App: acquire/players", () => {
  it("should serve the list of players in the game", async () => {
    let id = 0;
    const idGenerator = () => `${id++}`;
    const gameManager = new GameManager(["1A"]);
    const sessions = new Sessions(idGenerator);
    const player1 = sessions.addPlayer("Adi");
    const player2 = sessions.addPlayer("krish");
    const player3 = sessions.addPlayer("sudheer");
    sessions.addToWaitingList(player1, gameManager);
    sessions.addToWaitingList(player2, gameManager);
    sessions.addToWaitingList(player3, gameManager);
    sessions.createRoom(gameManager);

    const app = createApp(sessions, gameManager);
    const res = await app.request("acquire/players", {
      method: "GET",
      headers: { cookie: "sessionId=3;gameId=0" },
    });
    const players = await res.json();

    assertEquals(res.status, 200);
    assertEquals(players, ["Adi", "krish", "you"]);
    assertEquals(players.length, 3);
  });
});

describe("App: acquire/playerDetails", () => {
  it("should serve details of a player in the game", async () => {
    let id = 0;
    const idGenerator = () => `${id++}`;
    const gameManager = new GameManager(["1A"]);
    const sessions = new Sessions(idGenerator);
    const player1 = sessions.addPlayer("Adi");
    const player2 = sessions.addPlayer("krish");
    const player3 = sessions.addPlayer("sudheer");
    sessions.addToWaitingList(player1, gameManager);
    sessions.addToWaitingList(player2, gameManager);
    sessions.addToWaitingList(player3, gameManager);
    sessions.createRoom(gameManager);

    const app = createApp(sessions, gameManager);
    const res = await app.request("acquire/player-details", {
      method: "GET",
      headers: { cookie: "sessionId=1;gameId=0" },
    });
    const player = await res.json();

    assertEquals(player.name, "Adi");
    assertEquals(player.cash, 6000);
    assertEquals(player.tiles, ["1A"]);
    assertEquals(res.status, 200);
  });
});

describe("App: /login", () => {
  it("should receive a cookie and redirect to index page", async () => {
    const idGenerator = () => "1";
    const formData = new FormData();
    formData.set("playerName", "Adhi");
    const gameManager = new GameManager(["1A"]);
    const sessions = new Sessions(idGenerator);
    const app = createApp(sessions, gameManager);
    const res = await app.request("/login", { method: "POST", body: formData });

    assertEquals(res.headers.getSetCookie(), ["sessionId=1; Path=/"]);
    assertEquals(res.status, 303);
  });

  it("should redirect to index page if already loggedin", async () => {
    const gameManager = new GameManager(["1A"]);
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
    const gameManager = new GameManager(["1A"]);
    const sessions = new Sessions(idGenerator);
    const app = createApp(sessions, gameManager);

    const res = await app.request("/login.html");

    await res.text();
    assertEquals(res.status, 200);
  });
});

describe("App: acquire/gameboard", () => {
  it("should return the board array", async () => {
    let id = 0;
    const idGenerator = () => `${id++}`;
    const gameManager = new GameManager(["1A", "2A"]);
    const sessions = new Sessions(idGenerator);
    const player1 = sessions.addPlayer("Adi");
    const player2 = sessions.addPlayer("krish");
    const player3 = sessions.addPlayer("sudheer");
    sessions.addToWaitingList(player1, gameManager);
    sessions.addToWaitingList(player2, gameManager);
    sessions.addToWaitingList(player3, gameManager);
    sessions.createRoom(gameManager);

    const app = createApp(sessions, gameManager);
    const res = await app.request("acquire/gameboard", {
      method: "GET",
      headers: { cookie: "sessionId=1;gameId=0" },
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

  it("should redirect to login page", async () => {
    const idGenerator = () => "1";
    const gameManager = new GameManager(["1A", "2A"]);
    const sessions = new Sessions(idGenerator);

    const app = createApp(sessions, gameManager);
    const res = await app.request("acquire/gameboard", {
      method: "GET",
    });

    assertEquals(res.status, 303);
  });
});

describe("App: acquire/gameStatus", () => {
  it("should return the game status when only one player", async () => {
    let id = 0;
    const idGenerator = () => `${id++}`;
    const gameManager = new GameManager(["1A"]);
    const sessions = new Sessions(idGenerator);
    const player1 = sessions.addPlayer("Adi");
    sessions.addToWaitingList(player1, gameManager);

    const app = createApp(sessions, gameManager);
    const res = await app.request("/acquire/gameStatus", {
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
    const gameManager = new GameManager(["1A"]);
    const sessions = new Sessions(idGenerator);
    const player1 = sessions.addPlayer("Adi");
    const player2 = sessions.addPlayer("Bdi");
    const player3 = sessions.addPlayer("Cdi");
    sessions.addToWaitingList(player1, gameManager);
    sessions.addToWaitingList(player2, gameManager);
    sessions.addToWaitingList(player3, gameManager);

    const app = createApp(sessions, gameManager);
    const res = await app.request("/acquire/gameStatus", {
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
    const gameManager = new GameManager(["A1", "A2"]);
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
    const gameManager = new GameManager(["A1", "A2"]);
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
    const gameManager = new GameManager(["A1", "A2"]);
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
    const gameManager = new GameManager(["A1", "A2"]);
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

  it("should return the home page", async () => {
    const idGenerator = () => "1";
    const sessions = new Sessions(idGenerator);
    const gameManager = new GameManager(["A1", "A2"]);
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
});
